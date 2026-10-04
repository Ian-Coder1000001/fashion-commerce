"use client";

import { useActionState, useState, useTransition, useEffect } from "react";
import { placeOrderAction, type CheckoutState } from "@/actions/checkout.actions";
import { applyCouponAction } from "@/actions/coupon.actions";
import { getShippingEstimateAction } from "@/actions/shipping.actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface SavedAddress {
  _id: string;
  label?: string;
  line1: string;
  line2?: string;
  city: string;
  region?: string;
  postalCode?: string;
  country: string;
  phone?: string;
  isDefault?: boolean;
}

interface CheckoutFormProps {
  isLoggedIn: boolean;
  accountName: string | null;
  savedAddresses: SavedAddress[];
  subtotal: number;
}

interface ShippingEstimate {
  fee: number;
  freeShippingApplied: boolean;
  estimatedDays?: string;
  zoneName?: string;
}

const initialState: CheckoutState = {};

function formatPrice(amount: number, currency = "KES") {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function CheckoutForm({
  isLoggedIn,
  accountName,
  savedAddresses,
  subtotal,
}: CheckoutFormProps) {
  const [state, formAction, isPending] = useActionState(
    placeOrderAction,
    initialState
  );

  const defaultAddress = savedAddresses.find((a) => a.isDefault) ?? savedAddresses[0];
  const [selectedAddressId, setSelectedAddressId] = useState(
    defaultAddress?._id ?? "new"
  );
  const [paymentMethod, setPaymentMethod] = useState<"cash_on_delivery" | "pesapal">(
    "cash_on_delivery"
  );

  const [couponInput, setCouponInput] = useState("");
  const [appliedCode, setAppliedCode] = useState<string | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [isApplyingCoupon, startCouponTransition] = useTransition();

  // Tracked purely so we can re-estimate shipping as either field
  // changes — the inputs are still normal named form fields submitted
  // via FormData, this state doesn't replace that.
  const [manualCountry, setManualCountry] = useState("");
  const [manualRegion, setManualRegion] = useState("");

  const [shippingEstimate, setShippingEstimate] = useState<ShippingEstimate | null>(
    null
  );
  const [isEstimatingShipping, startShippingTransition] = useTransition();

  const usingSavedAddress = isLoggedIn && selectedAddressId !== "new";
  const selected = savedAddresses.find((a) => a._id === selectedAddressId);

  function updateShippingEstimate(country: string, region: string) {
    if (!country.trim()) {
      setShippingEstimate(null);
      return;
    }
    startShippingTransition(async () => {
      const result = await getShippingEstimateAction(
        country.trim(),
        region.trim() || undefined,
        subtotal
      );
      setShippingEstimate(result);
    });
  }

  useEffect(() => {
    if (usingSavedAddress && selected) {
      updateShippingEstimate(selected.country, selected.region ?? "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAddressId]);

  function handleApplyCoupon() {
    if (!couponInput.trim()) return;
    startCouponTransition(async () => {
      const result = await applyCouponAction(couponInput.trim(), subtotal);
      if (result.valid) {
        setAppliedCode(couponInput.trim().toUpperCase());
        setDiscountAmount(result.discountAmount);
        setCouponError(null);
      } else {
        setAppliedCode(null);
        setDiscountAmount(0);
        setCouponError(result.error ?? "Invalid coupon.");
      }
    });
  }

  function handleRemoveCoupon() {
    setAppliedCode(null);
    setDiscountAmount(0);
    setCouponError(null);
    setCouponInput("");
  }

  const shippingFee = shippingEstimate?.fee ?? 0;
  const total = subtotal - discountAmount + shippingFee;

  return (
    <form action={formAction} className="flex flex-col gap-8">
      <input type="hidden" name="couponCode" value={appliedCode ?? ""} />

      {!isLoggedIn && (
        <section>
          <h2 className="text-sm tracking-wide uppercase text-fg-muted mb-4">
            Contact
          </h2>
          <Input
            label="Email"
            type="email"
            name="guestEmail"
            required
            placeholder="you@example.com"
          />
        </section>
      )}

      <section>
        <h2 className="text-sm tracking-wide uppercase text-fg-muted mb-4">
          Shipping Address
        </h2>

        {isLoggedIn && savedAddresses.length > 0 && (
          <div className="flex flex-col gap-2 mb-6">
            {savedAddresses.map((addr) => (
              <label
                key={addr._id}
                className="flex items-start gap-3 border border-border p-4 text-sm cursor-pointer has-[:checked]:border-fg"
              >
                <input
                  type="radio"
                  name="addressChoice"
                  value={addr._id}
                  checked={selectedAddressId === addr._id}
                  onChange={() => setSelectedAddressId(addr._id)}
                  className="mt-1"
                />
                <span>
                  {addr.label && <strong className="block">{addr.label}</strong>}
                  {addr.line1}, {addr.city}, {addr.country}
                </span>
              </label>
            ))}
            <label className="flex items-center gap-3 border border-border p-4 text-sm cursor-pointer has-[:checked]:border-fg">
              <input
                type="radio"
                name="addressChoice"
                value="new"
                checked={selectedAddressId === "new"}
                onChange={() => setSelectedAddressId("new")}
              />
              <span>Use a new address</span>
            </label>
          </div>
        )}

        {usingSavedAddress && selected ? (
          <>
            <input type="hidden" name="fullName" value={accountName ?? ""} />
            <input type="hidden" name="line1" value={selected.line1} />
            <input type="hidden" name="line2" value={selected.line2 ?? ""} />
            <input type="hidden" name="city" value={selected.city} />
            <input type="hidden" name="region" value={selected.region ?? ""} />
            <input type="hidden" name="postalCode" value={selected.postalCode ?? ""} />
            <input type="hidden" name="country" value={selected.country} />
            <input type="hidden" name="phone" value={selected.phone ?? ""} />
          </>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Full name"
              name="fullName"
              required
              defaultValue={accountName ?? ""}
              className="col-span-2"
            />
            <Input label="Address line 1" name="line1" required className="col-span-2" />
            <Input label="Address line 2" name="line2" className="col-span-2" />
            <Input label="City" name="city" required />
            <Input
              label="County / Region"
              name="region"
              placeholder="Nairobi, Kiambu…"
              value={manualRegion}
              onChange={(e) => setManualRegion(e.target.value)}
              onBlur={() => updateShippingEstimate(manualCountry, manualRegion)}
            />
            <Input label="Postal code" name="postalCode" />
            <Input
              label="Country"
              name="country"
              required
              value={manualCountry}
              onChange={(e) => setManualCountry(e.target.value)}
              onBlur={() => updateShippingEstimate(manualCountry, manualRegion)}
            />
            <Input label="Phone" name="phone" required className="col-span-2" />
          </div>
        )}
      </section>

      <section>
        <h2 className="text-sm tracking-wide uppercase text-fg-muted mb-4">
          Discount Code
        </h2>
        {appliedCode ? (
          <div className="flex items-center justify-between border border-fg p-4 text-sm">
            <span>
              <strong>{appliedCode}</strong> applied — you save{" "}
              {formatPrice(discountAmount)}
            </span>
            <button
              type="button"
              onClick={handleRemoveCoupon}
              className="text-xs text-fg-muted hover:text-error"
            >
              Remove
            </button>
          </div>
        ) : (
          <div className="flex gap-2 max-w-sm">
            <input
              type="text"
              value={couponInput}
              onChange={(e) => setCouponInput(e.target.value)}
              placeholder="Enter code"
              className="flex-1 h-11 border border-border bg-surface px-3 text-sm"
            />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleApplyCoupon}
              disabled={isApplyingCoupon || !couponInput.trim()}
            >
              {isApplyingCoupon ? "Checking…" : "Apply"}
            </Button>
          </div>
        )}
        {couponError && <p className="text-sm text-error mt-2">{couponError}</p>}
      </section>

      <section>
        <h2 className="text-sm tracking-wide uppercase text-fg-muted mb-4">
          Order Total
        </h2>
        <div className="text-sm flex flex-col gap-1 max-w-sm">
          <div className="flex justify-between text-fg-muted">
            <span>Subtotal</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          {discountAmount > 0 && (
            <div className="flex justify-between text-fg-muted">
              <span>Discount</span>
              <span>-{formatPrice(discountAmount)}</span>
            </div>
          )}
          <div className="flex justify-between text-fg-muted">
            <span>Shipping</span>
            <span>
              {isEstimatingShipping
                ? "Calculating…"
                : shippingEstimate
                  ? shippingEstimate.freeShippingApplied
                    ? "Free"
                    : formatPrice(shippingEstimate.fee)
                  : "Enter address to calculate"}
            </span>
          </div>
          {shippingEstimate?.estimatedDays && (
            <p className="text-xs text-fg-muted">
              Estimated delivery: {shippingEstimate.estimatedDays}
            </p>
          )}
          <div className="flex justify-between font-medium pt-1 border-t border-border">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-sm tracking-wide uppercase text-fg-muted mb-4">
          Payment
        </h2>
        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-3 border border-border p-4 text-sm cursor-pointer has-[:checked]:border-fg">
            <input
              type="radio"
              name="paymentMethod"
              value="cash_on_delivery"
              checked={paymentMethod === "cash_on_delivery"}
              onChange={() => setPaymentMethod("cash_on_delivery")}
            />
            <span>Cash on Delivery</span>
          </label>
          <label className="flex items-center gap-3 border border-border p-4 text-sm cursor-pointer has-[:checked]:border-fg">
            <input
              type="radio"
              name="paymentMethod"
              value="pesapal"
              checked={paymentMethod === "pesapal"}
              onChange={() => setPaymentMethod("pesapal")}
            />
            <span>Card / M-Pesa / Airtel Money (via Pesapal)</span>
          </label>
        </div>
        {paymentMethod === "pesapal" && (
          <p className="text-xs text-fg-muted mt-2">
            You&apos;ll be redirected to Pesapal&apos;s secure page to complete payment.
          </p>
        )}
      </section>

      {state.error && (
        <p role="alert" className="text-sm text-error">
          {state.error}
        </p>
      )}

      <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
        {isPending ? "Placing order…" : "Place Order"}
      </Button>
    </form>
  );
}