"use client";

import { useActionState } from "react";
import {
  submitContactMessageAction,
  type ContactFormState,
} from "@/actions/contact.actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

const initialState: ContactFormState = {};

export function ContactForm() {
  const [state, formAction, isPending] = useActionState(
    submitContactMessageAction,
    initialState
  );

  if (state.success) {
    return (
      <div className="border border-border p-8">
        <h2 className="font-display text-xl mb-2">Message sent</h2>
        <p className="text-sm text-fg-muted">
          Thanks for reaching out — we&apos;ll get back to you soon.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4 max-w-lg">
      <Input label="Name" name="name" required />
      <Input label="Email" type="email" name="email" required />
      <Input label="Phone" name="phone" placeholder="Optional" />
      <Input label="Subject" name="subject" required />
      <div className="flex flex-col gap-1.5">
        <label className="text-xs tracking-wide text-fg-muted">Message</label>
        <textarea
          name="message"
          required
          rows={5}
          className="border border-border bg-surface px-3 py-2 text-sm"
        />
      </div>

      {state.error && (
        <p role="alert" className="text-sm text-error">
          {state.error}
        </p>
      )}

      <Button type="submit" disabled={isPending} className="self-start mt-2">
        {isPending ? "Sending…" : "Send message"}
      </Button>
    </form>
  );
}