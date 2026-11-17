"use client";

import { useActionState, useState } from "react";
import {
  saveOrderStatusAction,
  type OrderStatusState,
} from "@/actions/order.actions";
import { Button } from "@/components/ui/Button";

const ORDER_STATUSES = [
  "pending", "confirmed", "processing", "packed",
  "shipped", "delivered", "cancelled", "returned",
];
const PAYMENT_STATUSES = ["pending", "paid", "failed", "refunded", "partially_refunded"];

const initialState: OrderStatusState = {};

interface OrderStatusFormProps {
  orderId: string;
  orderStatus: string;
  paymentStatus: string;
}

export function OrderStatusForm({
  orderId,
  orderStatus,
  paymentStatus,
}: OrderStatusFormProps) {
  const [state, formAction, isPending] = useActionState(
    saveOrderStatusAction.bind(null, orderId),
    initialState
  );
  const [orderValue, setOrderValue] = useState(orderStatus);
  const [paymentValue, setPaymentValue] = useState(paymentStatus);

  const isCancelled = orderStatus === "cancelled";
  // "cancelled" is only offered when the order is already cancelled;
  // cancelling goes through the Cancel button so stock is restored.
  const orderOptions = ORDER_STATUSES.filter(
    (s) => s !== "cancelled" || isCancelled
  );

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <label
          htmlFor="payment-status"
          className="text-xs tracking-wide text-fg-muted"
        >
          Payment status
        </label>
        <select
          id="payment-status"
          name="paymentStatus"
          value={paymentValue}
          onChange={(e) => setPaymentValue(e.target.value)}
          disabled={isCancelled}
          className="h-9 border border-border bg-surface px-2 text-sm"
        >
          {PAYMENT_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label
          htmlFor="order-status"
          className="text-xs tracking-wide text-fg-muted"
        >
          Order status
        </label>
        <select
          id="order-status"
          name="orderStatus"
          value={orderValue}
          onChange={(e) => setOrderValue(e.target.value)}
          disabled={isCancelled}
          className="h-9 border border-border bg-surface px-2 text-sm"
        >
          {orderOptions.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {isCancelled && (
        <p className="text-xs text-fg-muted">
          This order was cancelled, so its status is locked.
        </p>
      )}

      {state.error && (
        <p role="alert" className="text-sm text-error">
          {state.error}
        </p>
      )}
      {state.savedOrderStatus && !state.error && (
        <p role="status" className="text-sm text-fg">
          Saved. Order {state.savedOrderStatus}, payment{" "}
          {state.savedPaymentStatus}.
        </p>
      )}

      <Button
        type="submit"
        size="sm"
        variant="secondary"
        disabled={isPending || isCancelled}
      >
        {isPending ? "Saving…" : "Save status"}
      </Button>
    </form>
  );
}