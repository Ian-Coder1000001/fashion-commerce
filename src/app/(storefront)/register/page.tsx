"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { signIn } from "next-auth/react";
import { registerAction, type RegisterState } from "@/actions/auth.actions";
import { mergeCartOnLoginAction } from "@/actions/cart.actions";



import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

const initialState: RegisterState = {};

export default function RegisterPage() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(
    registerAction,
    initialState
  );

  useEffect(() => {
    if (!state.success) return;

    const form = document.getElementById(
      "register-form"
    ) as HTMLFormElement | null;
    const email = form?.email.value as string | undefined;
    const password = form?.password.value as string | undefined;
    if (!email || !password) return;


    signIn("credentials", { email, password, redirect: false }).then(async () => {
      await mergeCartOnLoginAction();
      router.push("/account");
      router.refresh();
    });




  }, [state.success, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-6">
      <div className="w-full max-w-sm">
        <h1 className="font-display text-3xl mb-1">Create account</h1>
        <p className="text-sm text-fg-muted mb-8">
          Already have one?{" "}
          <Link href="/login" className="underline">
            Sign in
          </Link>
        </p>

        <form id="register-form" action={formAction} className="flex flex-col gap-4">
          <Input label="Name" name="name" required autoComplete="name" />
          <Input
            label="Email"
            type="email"
            name="email"
            required
            autoComplete="email"
          />
          <Input
            label="Password"
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
            {isPending ? "Creating account…" : "Create account"}
          </Button>
        </form>
      </div>
    </div>
  );
}