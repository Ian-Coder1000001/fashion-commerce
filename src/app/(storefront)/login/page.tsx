"use client";

import { Suspense, useState, FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signIn, getSession } from "next-auth/react";
import { mergeCartOnLoginAction } from "@/actions/cart.actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { GoogleButton } from "@/components/storefront/GoogleButton";

// Errors that come back from Google sign-in as /login?error=...
// One generic message for every refusal, so it never reveals whether
// an email is an admin, disabled, or unverified.
const URL_ERROR_MESSAGES: Record<string, string> = {
  AccessDenied:
    "That Google account can't be used to sign in here. Try your email and password instead, or contact us if you think this is a mistake.",
  Configuration:
    "Google sign-in isn't available right now. Please use your email and password.",
};

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const explicitCallbackUrl = searchParams.get("callbackUrl");
  const urlError = searchParams.get("error");
  const urlErrorMessage = urlError
    ? (URL_ERROR_MESSAGES[urlError] ??
      "Something went wrong signing you in. Please try again.")
    : null;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setIsSubmitting(false);
      setError("That email or password isn't right.");
      return;
    }

    const session = await getSession();
    await mergeCartOnLoginAction();

    const destination =
      explicitCallbackUrl &&
      explicitCallbackUrl.startsWith("/") &&
      !explicitCallbackUrl.startsWith("//")
        ? explicitCallbackUrl
        : session?.user.role === "admin"
          ? "/admin"
          : "/account";

    router.push(destination);
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-6">
      <div className="w-full max-w-sm">
        <h1 className="font-display text-3xl mb-1">Sign in</h1>
        <p className="text-sm text-fg-muted mb-8">
          Access your account or the store admin. New here?{" "}
          <Link href="/register" className="underline">
            Create an account
          </Link>
        </p>

        {urlErrorMessage && !error && (
          <p role="alert" className="text-sm text-error mb-4">
            {urlErrorMessage}
          </p>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Email"
            type="email"
            name="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            label="Password"
            type="password"
            name="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {error && (
            <p role="alert" className="text-sm text-error">
              {error}
            </p>
          )}

          <Button type="submit" disabled={isSubmitting} className="mt-2">
            {isSubmitting ? "Signing in…" : "Sign in"}
          </Button>
        </form>

        <p className="text-sm text-fg-muted mt-4">
          <Link href="/forgot-password" className="underline">
            Forgot password?
          </Link>
        </p>

        <div className="flex items-center gap-4 my-6" aria-hidden="true">
          <span className="h-px flex-1 bg-border" />
          <span className="text-xs tracking-wide uppercase text-fg-muted">or</span>
          <span className="h-px flex-1 bg-border" />
        </div>

        <GoogleButton next={explicitCallbackUrl} />
      </div>
    </div>
  );
}