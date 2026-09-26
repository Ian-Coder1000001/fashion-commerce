import type { Address } from "@/types/address";
import {
  getCurrentUser,
  addAddressAction,
  deleteAddressAction,
  setDefaultAddressAction,
} from "@/actions/account.actions";
import { AccountNav } from "@/components/storefront/AccountNav";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default async function AddressesPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="font-display text-h1 mb-2">Addresses</h1>
      <p className="text-fg-muted mb-10">{user.email}</p>

      <AccountNav />

      {user.addresses.length > 0 && (
        <div className="flex flex-col gap-4 mb-12">
          {user.addresses.map((address: Address) => (
            <div
              key={String(address._id)}
              className="border border-border p-5 flex items-start justify-between"
            >
              <div className="text-sm">
                {address.label && (
                  <p className="text-xs tracking-wide uppercase text-fg-muted mb-1">
                    {address.label}
                    {address.isDefault && " · Default"}
                  </p>
                )}
                <p>{address.line1}</p>
                {address.line2 && <p>{address.line2}</p>}
                <p>
                  {address.city}
                  {address.region ? `, ${address.region}` : ""}{" "}
                  {address.postalCode ?? ""}
                </p>
                <p>{address.country}</p>
                {address.phone && <p className="text-fg-muted mt-1">{address.phone}</p>}
              </div>
              <div className="flex flex-col gap-2 items-end">
                {!address.isDefault && (
                  <form
                    action={setDefaultAddressAction.bind(
                      null,
                      String(address._id)
                    )}
                  >
                    <button className="text-xs text-fg-muted hover:text-fg">
                      Set as default
                    </button>
                  </form>
                )}
                <form
                  action={deleteAddressAction.bind(null, String(address._id))}
                >
                  <button className="text-xs text-fg-muted hover:text-error">
                    Delete
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}

      <h2 className="font-display text-h3 mb-4">Add a new address</h2>
      <form action={addAddressAction} className="grid grid-cols-2 gap-4 max-w-xl">
        <Input label="Label" name="label" placeholder="Home, Work…" className="col-span-2" />
        <Input label="Address line 1" name="line1" required className="col-span-2" />
        <Input label="Address line 2" name="line2" className="col-span-2" />
        <Input label="City" name="city" required />
        <Input label="Region / State" name="region" />
        <Input label="Postal code" name="postalCode" />
        <Input label="Country" name="country" required />
        <Input label="Phone" name="phone" className="col-span-2" />
        <div className="col-span-2">
          <Button type="submit" size="sm">
            Save address
          </Button>
        </div>
      </form>
    </div>
  );
}