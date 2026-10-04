"use client";

import { useActionState } from "react";
import Link from "next/link";
import {
  requestPasswordResetAction,
  type ForgotPasswordState,
} from "@/actions/password-reset.actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

const initialState: ForgotPasswordState = {};

export default function ForgotPasswordPage() {
  const [state, formAction, isPending] = useActionState(
    requestPasswordResetAction,
    initialState
  );

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-6">
      <div className="w-full max-w-sm">
        <h1 className="font-display text-3xl mb-1">Reset password</h1>
        <p className="text-sm text-fg-muted mb-8">
          Enter your email and we&apos;ll send you a reset link.
        </p>

        {state.submitted ? (
          <p className="text-sm text-fg-muted">
            If an account exists for that email, a reset link is on its way.
            Check your inbox.
          </p>
        ) : (
          <form action={formAction} className="flex flex-col gap-4">
            <Input label="Email" type="email" name="email" required />
            <Button type="submit" disabled={isPending} className="mt-2">
              {isPending ? "Sending…" : "Send reset link"}
            </Button>
          </form>
        )}

        <p className="text-sm text-fg-muted mt-6">
          <Link href="/login" className="underline">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}