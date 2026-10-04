"use client";

import { useActionState } from "react";
import {
  createShippingZoneAction,
  type ShippingZoneFormState,
} from "@/actions/shipping.actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

const initialState: ShippingZoneFormState = {};

export function ShippingZoneCreateForm() {
  const [state, formAction, isPending] = useActionState(
    createShippingZoneAction,
    initialState
  );

  return (
    <form
      action={formAction}
      className="grid grid-cols-2 gap-4 mb-10 max-w-2xl border border-border p-6"
    >
      <Input
        label="Zone name"
        name="name"
        required
        placeholder="Nairobi, Kiambu County, Kenya, Rest of World…"
        className="col-span-2"
      />
      <Input
        label="Countries (comma separated)"
        name="countries"
        placeholder="Kenya"
      />
      <Input
        label="Region / County (optional)"
        name="region"
        placeholder="Nairobi — leave blank for a country-wide rate"
      />
      <Input label="Fee" name="fee" type="number" step="0.01" required />
      <Input
        label="Free shipping threshold (optional)"
        name="freeShippingThreshold"
        type="number"
      />
      <Input
        label="Estimated delivery"
        name="estimatedDays"
        placeholder="1-2 business days"
        className="col-span-2"
      />
      <label className="col-span-2 flex items-center gap-2 text-sm">
        <input type="checkbox" name="isDefault" />
        Use as the default/fallback zone for anywhere not covered above
      </label>

      {state.error && (
        <p role="alert" className="col-span-2 text-sm text-error">
          {state.error}
        </p>
      )}

      <div className="col-span-2">
        <Button type="submit" size="sm" disabled={isPending}>
          {isPending ? "Creating…" : "Create zone"}
        </Button>
      </div>
    </form>
  );
}