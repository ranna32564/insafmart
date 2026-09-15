"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  ShieldCheck,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/lib/use-toast";
import { useAuth } from "@/lib/auth";
import { BRAND } from "@/lib/brand";
import { Logo } from "@/components/logo";

type Step = "details" | "otp";

export default function Register() {
  const { user, register, verifyRegister } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const [step, setStep] = useState<Step>("details");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [code, setCode] = useState("");
  const [previewCode, setPreviewCode] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [seconds, setSeconds] = useState(0);

  const codeRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) router.replace(user.isAdmin ? "/admin" : "/account");
  }, [user, router]);

  useEffect(() => {
    if (seconds <= 0) return;
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds]);

  async function sendOtp(e?: React.FormEvent) {
    e?.preventDefault();
    if (busy) return;

    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();

    if (trimmedName.length < 2) {
      toast({
        title: "Name required",
        description: "Please enter your full name.",
        variant: "destructive",
      });
      return;
    }

    if (!/^[^\s@]+@gmail\.com$/i.test(trimmedEmail)) {
      toast({
        title: "Only Gmail accepted",
        description:
          "Please use a Gmail address (e.g. yourname@gmail.com). Other email providers are not supported.",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters.",
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Passwords do not match",
        description: "Please make sure both passwords are the same.",
        variant: "destructive",
      });
      return;
    }

    setBusy(true);
    try {
      const res = await register({
        name: trimmedName,
        email: trimmedEmail,
        password,
        confirmPassword,
      });
      setPreviewCode(res.previewCode ?? null);
      setStep("otp");
      setSeconds(45);
      setTimeout(() => codeRef.current?.focus(), 80);
      toast({
        title: res.emailDelivered ? "Code sent" : "Code generated",
        description: res.emailDelivered
          ? `We sent a 6-digit code to ${trimmedEmail}. It expires in 10 minutes.`
          : "Email is not configured, so the code is shown on screen.",
      });
    } catch (err) {
      toast({
        title: "Could not send code",
        description: (err as Error).message,
        variant: "destructive",
      });
    } finally {
      setBusy(false);
    }
  }

  async function confirm(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    if (code.length !== 6) return;

    setBusy(true);
    try {
      const signed = await verifyRegister(email.trim().toLowerCase(), code.trim());
      toast({
        title: "Account created",
        description: `Welcome to Insaf Mart, ${signed.name}!`,
      });
      router.replace(signed.isAdmin ? "/admin" : "/account");
    } catch (err) {
      toast({
        title: "That code did not work",
        description: (err as Error).message,
        variant: "destructive",
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-200px)] w-full max-w-md flex-col justify-center px-4 py-12 sm:py-16">
      <div className="flex justify-center">
        <Logo className="h-9 text-primary" />
      </div>

      <div className="mt-8 flex justify-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#1a1a1a]">
          {step === "details" ? (
            <User className="h-7 w-7 text-white" strokeWidth={2.5} />
          ) : (
            <ShieldCheck className="h-7 w-7 text-white" strokeWidth={2.5} />
          )}
        </div>
      </div>

      <div className="mt-6 text-center">
        <h1 className="font-serif text-3xl text-foreground">
          {step === "details" ? "Create your account" : "Verify your Gmail"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {step === "details"
            ? "Join Insaf Mart — track orders and save your details"
            : `We sent a 6-digit code to ${email}`}
        </p>
      </div>

      <div className="mt-8 rounded-lg border border-border bg-card p-6 sm:p-8">
        {step === "details" ? (
          <form onSubmit={sendOtp} className="space-y-4">
            <div>
              <Label htmlFor="rg-name" className="text-sm font-medium">
                Full name
              </Label>
              <div className="relative mt-1.5">
                <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="rg-name"
                  required
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  className="h-11 rounded-sm pl-10"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="rg-email" className="text-sm font-medium">
                Gmail address
              </Label>
              <div className="relative mt-1.5">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="rg-email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="yourname@gmail.com"
                  className="h-11 rounded-sm pl-10"
                />
              </div>
              <p className="mt-1.5 text-[11px] text-muted-foreground">
                Only Gmail addresses are accepted for now.
              </p>
            </div>

            <div>
              <Label htmlFor="rg-password" className="text-sm font-medium">
                Password
              </Label>
              <div className="relative mt-1.5">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="rg-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="h-11 rounded-sm pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <Label htmlFor="rg-confirm" className="text-sm font-medium">
                Confirm password
              </Label>
              <div className="relative mt-1.5">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="rg-confirm"
                  type={showConfirm ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-type your password"
                  className="h-11 rounded-sm pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  tabIndex={-1}
                >
                  {showConfirm ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {confirmPassword.length > 0 && password !== confirmPassword && (
                <p className="mt-1.5 text-[11px] text-red-600">
                  Passwords do not match yet
                </p>
              )}
              {confirmPassword.length > 0 && password === confirmPassword && (
                <p className="mt-1.5 flex items-center gap-1 text-[11px] text-green-700">
                  <CheckCircle2 className="h-3 w-3" />
                  Passwords match
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={busy}
              className="press h-11 w-full rounded-sm bg-[#1a1a1a] text-white hover:bg-black"
            >
              {busy ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending code…
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Send OTP to my Gmail
                </>
              )}
            </Button>
          </form>
        ) : (
          <>
            <button
              onClick={() => setStep("details")}
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Change details
            </button>

            {previewCode && (
              <div className="mt-5 rounded-sm border border-yellow-300 bg-yellow-50 p-4">
                <p className="flex items-center gap-2 text-xs font-medium text-foreground">
                  <ShieldCheck className="h-3.5 w-3.5 text-yellow-600" />
                  Preview mode
                </p>
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                  Email is not configured, so here is your code:{" "}
                  <strong className="font-mono text-base tracking-[0.3em] text-foreground">
                    {previewCode}
                  </strong>
                </p>
              </div>
            )}

            <form onSubmit={confirm} className="mt-6 space-y-4">
              <div>
                <Label htmlFor="rg-code" className="text-sm font-medium">
                  6-digit code
                </Label>
                <Input
                  id="rg-code"
                  ref={codeRef}
                  required
                  inputMode="numeric"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="000000"
                  className="mt-1.5 h-14 rounded-sm text-center font-mono text-2xl tracking-[0.4em]"
                />
              </div>

              <Button
                type="submit"
                disabled={busy || code.length !== 6}
                className="press h-11 w-full rounded-sm bg-[#1a1a1a] text-white hover:bg-black"
              >
                {busy ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account…
                  </>
                ) : (
                  "Verify and create account"
                )}
              </Button>

              <button
                type="button"
                disabled={seconds > 0 || busy}
                onClick={() => sendOtp()}
                className="w-full text-center text-xs text-muted-foreground hover:text-primary disabled:opacity-60"
              >
                {seconds > 0
                  ? `Resend code in ${seconds}s`
                  : "Resend the code"}
              </button>
            </form>
          </>
        )}
      </div>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          href="/signin"
          className="font-medium text-primary hover:underline"
        >
          Log in
        </Link>
      </p>

      <p className="mt-8 text-center text-xs text-muted-foreground">
        Trouble registering? Email{" "}
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