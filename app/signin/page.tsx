"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/lib/use-toast";
import { useAuth } from "@/lib/auth";
import { BRAND } from "@/lib/brand";
import { Logo } from "@/components/logo";

export default function SignIn() {
  const { user, loginWithPassword } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);

  // Already signed in → redirect
  useEffect(() => {
    if (user) router.replace(user.isAdmin ? "/admin" : "/account");
  }, [user, router]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;

    const trimmedEmail = email.trim().toLowerCase();

    // Email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    // Password validation
    if (password.length < 1) {
      toast({
        title: "Password required",
        description: "Please enter your password.",
        variant: "destructive",
      });
      return;
    }

    setBusy(true);
    try {
      const signed = await loginWithPassword(trimmedEmail, password);
      toast({
        title: "Welcome back",
        description: `Signed in as ${signed.email}.`,
      });
      router.replace(signed.isAdmin ? "/admin" : "/account");
    } catch (err) {
      toast({
        title: "Could not sign you in",
        description: (err as Error).message,
        variant: "destructive",
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-200px)] w-full max-w-md flex-col justify-center px-4 py-12 sm:py-16">
      {/* Logo */}
      <div className="flex justify-center">
        <Logo className="h-9 text-primary" />
      </div>

      {/* Login icon */}
      <div className="mt-8 flex justify-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#1a1a1a]">
          <ArrowRight className="h-7 w-7 text-white" strokeWidth={2.5} />
        </div>
      </div>

      {/* Heading */}
      <div className="mt-6 text-center">
        <h1 className="font-serif text-3xl text-foreground">Welcome back</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Log in to your account
        </p>
      </div>

      {/* Card */}
      <div className="mt-8 rounded-lg border border-border bg-card p-6 sm:p-8">
        {/* Google button (disabled — coming soon) */}
        <button
          type="button"
          disabled
          className="flex h-11 w-full cursor-not-allowed items-center justify-center gap-2.5 rounded-sm border border-border bg-white opacity-50"
          title="Google sign-in will be available soon"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 18 18"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill="#4285F4"
              d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
            />
            <path
              fill="#34A853"
              d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
            />
            <path
              fill="#FBBC05"
              d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
            />
            <path
              fill="#EA4335"
              d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
            />
          </svg>
          <span className="text-sm font-medium text-foreground">
            Continue with Google
          </span>
        </button>

        {/* Divider */}
        <div className="my-6 flex items-center gap-4">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs uppercase tracking-wider text-muted-foreground">
            OR
          </span>
          <div className="h-px flex-1 bg-border" />
        </div>

        {/* Login form */}
        <form onSubmit={submit} className="space-y-4">
          <div>
            <Label htmlFor="si-email" className="text-sm font-medium">
              Email
            </Label>
            <div className="relative mt-1.5">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="si-email"
                type="email"
                autoComplete="email"
                required
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="h-11 rounded-sm pl-10"
                data-testid="input-signin-email"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <Label htmlFor="si-password" className="text-sm font-medium">
                Password
              </Label>
              <Link
                href="/contact"
                className="text-xs text-muted-foreground hover:text-primary"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative mt-1.5">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="si-password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="h-11 rounded-sm pl-10 pr-10"
                data-testid="input-signin-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                tabIndex={-1}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={busy}
            className="press h-11 w-full rounded-sm bg-[#1a1a1a] text-white hover:bg-black"
            data-testid="button-login"
          >
            {busy ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Logging in…
              </>
            ) : (
              "Log In"
            )}
          </Button>
        </form>
      </div>

      {/* Create account link */}
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="font-medium text-primary hover:underline"
        >
          Create one
        </Link>
      </p>

      {/* Support line */}
      <p className="mt-8 text-center text-xs text-muted-foreground">
        Trouble signing in? Email{" "}
        <a
          href={`mailto:${BRAND.email}`}
          className="text-primary hover:underline"
        >
          {BRAND.email}
        </a>{" "}
        or{" "}
        <Link href="/contact" className="text-primary hover:underline">
          contact us
        </Link>
        .
      </p>
    </div>
  );
}