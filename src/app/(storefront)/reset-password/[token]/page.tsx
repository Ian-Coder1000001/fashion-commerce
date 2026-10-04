"use client";

import { useActionState } from "react";
import { use } from "react";
import { useRouter } from "next/navigation";
import {
  resetPasswordAction,
  type ResetPasswordState,
} from "@/actions/password-reset.actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

const initialState: ResetPasswordState = {};

export default function ResetPasswordPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(
    resetPasswordAction,
    initialState
  );

  if (state.success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg px-6">
        <div className="w-full max-w-sm text-center">
          <h1 className="font-display text-3xl mb-4">Password updated</h1>
          <p className="text-sm text-fg-muted mb-8">
            You can now sign in with your new password.
          </p>
          <Button onClick={() => router.push("/login")}>Go to sign in</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-6">
      <div className="w-full max-w-sm">
        <h1 className="font-display text-3xl mb-1">Set a new password</h1>
        <p className="text-sm text-fg-muted mb-8">
          Choose a new password for your account.
        </p>

        <form action={formAction} className="flex flex-col gap-4">
          <input type="hidden" name="token" value={token} />
          <Input
            label="New password"
            type="password"
            name="password"
            required
            autoComplete="new-password"
          />

          {state.error && (
            <p role="alert" className="text-sm text-error">
              {state.error}
            </p>
          )}

          <Button type="submit" disabled={isPending} className="mt-2">
            {isPending ? "Updating…" : "Update password"}
          </Button>
        </form>
      </div>
    </div>
  );
}