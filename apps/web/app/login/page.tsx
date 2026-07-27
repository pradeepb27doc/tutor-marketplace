"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/features/auth/components/auth-provider";
import { AuthApiError } from "@/features/auth/services/client";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("returnTo") ?? "/";
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    // Client-side validation
    const errors: Record<string, string> = {};
    if (!email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Please enter a valid email address";
    }
    if (!password) {
      errors.password = "Password is required";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setIsSubmitting(true);

    try {
      await login(email, password);
      router.push(returnTo);
    } catch (err) {
      if (err instanceof AuthApiError) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
      <div className="mb-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-foreground/60 transition-colors hover:text-foreground"
        >
          <span aria-hidden="true">&larr;</span> Back to home
        </Link>
      </div>

      <h1 className="text-3xl font-semibold tracking-[-0.04em]">Welcome back</h1>
      <p className="mt-2 text-foreground/60">Sign in to your account to continue.</p>

      <form onSubmit={handleSubmit} className="mt-10 space-y-6" noValidate>
        {error && (
          <div
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-foreground/80"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`mt-2 block w-full rounded-xl border bg-background px-4 py-3 text-sm outline-none transition-colors focus:ring-2 focus:ring-foreground/20 ${
              fieldErrors.email
                ? "border-red-300"
                : "border-border hover:border-foreground/20"
            }`}
            placeholder="you@example.com"
          />
          {fieldErrors.email && (
            <p className="mt-1.5 text-xs text-red-600">{fieldErrors.email}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-foreground/80"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`mt-2 block w-full rounded-xl border bg-background px-4 py-3 text-sm outline-none transition-colors focus:ring-2 focus:ring-foreground/20 ${
              fieldErrors.password
                ? "border-red-300"
                : "border-border hover:border-foreground/20"
            }`}
            placeholder="Enter your password"
          />
          {fieldErrors.password && (
            <p className="mt-1.5 text-xs text-red-600">{fieldErrors.password}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-full bg-foreground px-6 py-3.5 text-sm font-semibold text-background transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2 focus:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none"
        >
          {isSubmitting ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-foreground/60">
        {`Don't have an account?`}{' '}
        <a
          href="/signup"
          className="font-semibold text-foreground underline underline-offset-4 transition-colors hover:text-foreground/80"
        >
          Sign up
        </a>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Suspense fallback={
        <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
          <div className="mb-10">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-foreground/60 transition-colors hover:text-foreground"
            >
              <span aria-hidden="true">&larr;</span> Back to home
            </Link>
          </div>
          <div className="h-8 w-48 animate-pulse rounded bg-foreground/10" />
          <div className="mt-2 h-4 w-64 animate-pulse rounded bg-foreground/10" />
          <div className="mt-10 space-y-6">
            <div className="h-20 animate-pulse rounded-xl bg-foreground/10" />
            <div className="h-20 animate-pulse rounded-xl bg-foreground/10" />
            <div className="h-12 animate-pulse rounded-full bg-foreground/10" />
          </div>
        </div>
      }>
        <LoginForm />
      </Suspense>
    </main>
  );
}