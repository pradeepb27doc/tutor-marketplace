"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/components/auth-provider";
import { AuthApiError } from "@/features/auth/services/client";

type SignupStep = "email" | "otp";

export default function SignupPage() {
  const router = useRouter();
  const { startOtp, verifyOtp } = useAuth();

  const [step, setStep] = useState<SignupStep>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [challengeId, setChallengeId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleEmailSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    const errors: Record<string, string> = {};
    if (!email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Please enter a valid email address";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await startOtp("EMAIL", email, "SIGNUP");
      setChallengeId(result.challengeId);
      setStep("otp");
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

  async function handleOtpSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    const errors: Record<string, string> = {};
    if (!otp.trim()) {
      errors.otp = "Verification code is required";
    } else if (otp.trim().length < 4) {
      errors.otp = "Please enter the complete verification code";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    if (!challengeId) {
      setError("Session expired. Please start again.");
      return;
    }

    setIsSubmitting(true);

    try {
      await verifyOtp(challengeId, otp.trim(), "EMAIL");
      router.push("/");
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

  function handleBackToEmail() {
    setStep("email");
    setOtp("");
    setError(null);
    setFieldErrors({});
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
        <div className="mb-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-foreground/60 transition-colors hover:text-foreground"
          >
            <span aria-hidden="true">&larr;</span> Back to home
          </Link>
        </div>

        <h1 className="text-3xl font-semibold tracking-[-0.04em]">
          {step === "email" ? "Create your account" : "Check your email"}
        </h1>
        <p className="mt-2 text-foreground/60">
          {step === "email"
            ? "Enter your email to get started."
            : `We sent a verification code to ${email}.`}
        </p>

        {step === "email" ? (
          <form onSubmit={handleEmailSubmit} className="mt-10 space-y-6" noValidate>
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

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-full bg-foreground px-6 py-3.5 text-sm font-semibold text-background transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2 focus:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none"
            >
              {isSubmitting ? "Sending code..." : "Send verification code"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleOtpSubmit} className="mt-10 space-y-6" noValidate>
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
                htmlFor="otp"
                className="block text-sm font-medium text-foreground/80"
              >
                Verification code
              </label>
              <input
                id="otp"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                className={`mt-2 block w-full rounded-xl border bg-background px-4 py-3 text-sm outline-none transition-colors focus:ring-2 focus:ring-foreground/20 ${
                  fieldErrors.otp
                    ? "border-red-300"
                    : "border-border hover:border-foreground/20"
                }`}
                placeholder="Enter the code sent to your email"
              />
              {fieldErrors.otp && (
                <p className="mt-1.5 text-xs text-red-600">{fieldErrors.otp}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-full bg-foreground px-6 py-3.5 text-sm font-semibold text-background transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2 focus:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none"
            >
              {isSubmitting ? "Verifying..." : "Create account"}
            </button>

            <button
              type="button"
              onClick={handleBackToEmail}
              className="w-full text-center text-sm text-foreground/60 underline underline-offset-4 transition-colors hover:text-foreground"
            >
              Use a different email
            </button>
          </form>
        )}

        <p className="mt-8 text-center text-sm text-foreground/60">
          Already have an account?{" "}
          <a
            href="/login"
            className="font-semibold text-foreground underline underline-offset-4 transition-colors hover:text-foreground/80"
          >
            Sign in
          </a>
        </p>
      </div>
    </main>
  );
}