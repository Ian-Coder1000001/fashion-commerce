"use client";

import { useActionState } from "react";
import { createCouponAction, type CouponFormState } from "@/actions/coupon.actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

const initialState: CouponFormState = {};

export function CouponCreateForm() {
  const [state, formAction, isPending] = useActionState(
    createCouponAction,
    initialState
  );

  return (
    <form
      action={formAction}
      className="grid grid-cols-2 gap-4 mb-10 max-w-2xl border border-border p-6"
    >
      <Input label="Code" name="code" required placeholder="SUMMER20" />
      <div className="flex flex-col gap-1.5">
        <label className="text-xs tracking-wide text-fg-muted">Type</label>
        <select
          name="type"
          required
          className="h-11 border border-border bg-surface px-3 text-sm"
        >
          <option value="percentage">Percentage</option>
          <option value="fixed">Fixed amount</option>
        </select>
      </div>
      <Input label="Value" name="value" type="number" step="0.01" required />
      <Input label="Usage limit (optional)" name="usageLimit" type="number" />
      <Input label="Min order amount (optional)" name="minOrderAmount" type="number" />
      <Input
        label="Max discount amount (optional, caps percentage)"
        name="maxDiscountAmount"
        type="number"
      />
      <Input label="Start date (optional)" name="startDate" type="date" />
      <Input label="End date (optional)" name="endDate" type="date" />

      {state.error && (
        <p role="alert" className="col-span-2 text-sm text-error">
          {state.error}
        </p>
      )}

      <div className="col-span-2">
        <Button type="submit" size="sm" disabled={isPending}>
          {isPending ? "Creating…" : "Create coupon"}
        </Button>
      </div>
    </form>
  );
}