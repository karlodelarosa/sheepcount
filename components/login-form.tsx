"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useTenant } from "@/app/providers/tenant-provider";
import { APP_NAME } from "@/lib/branding";
import {
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

export type {
  TenantMembership,
  Organization,
  Subscription,
} from "@/lib/types/tenant";

const REMEMBER_KEY = "ministry-lens:remembered-email";

// Rotating marketing modules (mirrors the landing hero). `dot` is the index of
// the highlighted color in the dots pill.
const MODULES = [
  {
    eyebrow: "People & records",
    heading: "Know everyone in your flock",
    sub: "Directory, households, and membership records — always up to date so no one falls through the cracks.",
    chip: "People",
    dot: 0,
  },
  {
    eyebrow: "Follow-up & growth",
    heading: "Never miss a follow-up",
    sub: "See who needs contact, follow-up, or placement — act before anyone slips through the cracks.",
    chip: "Follow-up",
    dot: 1,
  },
  {
    eyebrow: "Attendance insights",
    heading: "See who showed up Sunday",
    sub: "Track visitors, members, and workers — use attendance data to minister, not just to report.",
    chip: "Attendance",
    dot: 2,
  },
  {
    eyebrow: "One connected view",
    heading: "Your whole ministry in one lens",
    sub: "People, pipeline, attendance, and groups — everything your team needs to shepherd well.",
    chip: "Overview",
    dot: 3,
  },
];

const ROTATE_MS = 4500;

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [moduleIdx, setModuleIdx] = useState(0);
  const { refreshSession } = useTenant();
  const supabase = createClient();

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const activeModule = MODULES[moduleIdx];

  // Auto-rotate the marketing modules (paused when reduced motion is preferred).
  // Keyed on moduleIdx so each change — auto or manual — restarts the countdown.
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }
    const timer = setTimeout(() => {
      setModuleIdx((i) => (i + 1) % MODULES.length);
    }, ROTATE_MS);
    return () => clearTimeout(timer);
  }, [moduleIdx]);

  // Map a dot (color) index back to its module and jump to it.
  const selectDot = (dotIndex: number) => {
    const idx = MODULES.findIndex((m) => m.dot === dotIndex);
    if (idx >= 0) setModuleIdx(idx);
  };

  // Prefill a previously remembered email.
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(REMEMBER_KEY);
      if (saved) {
        setEmail(saved);
        setRememberMe(true);
      }
    } catch {
      // localStorage unavailable — ignore.
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        throw signInError;
      }

      try {
        if (rememberMe) {
          window.localStorage.setItem(REMEMBER_KEY, email);
        } else {
          window.localStorage.removeItem(REMEMBER_KEY);
        }
      } catch {
        // localStorage unavailable — ignore.
      }

      await refreshSession();
      window.location.assign("/dashboard");
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={cn("login-bg relative min-h-svh w-full overflow-hidden", className)}
      {...props}
    >
      {/* Decorative floating blobs */}
      <div className="login-float-slow pointer-events-none absolute -left-24 top-8 size-72 rounded-full bg-white/25 blur-3xl" />
      <div className="login-float-slower pointer-events-none absolute -right-20 bottom-0 size-96 rounded-full bg-indigo-300/30 blur-3xl" />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 py-6 sm:px-10">
        <BrandLockup />
      </header>

      {/* Main */}
      <main className="relative z-10 mx-auto flex min-h-[calc(100svh-88px)] w-full max-w-6xl items-center px-6 pb-16 sm:px-10">
        <div className="grid w-full items-center gap-12 lg:grid-cols-2">
          {/* Left: rotating marketing */}
          <div className="hidden flex-col gap-10 lg:flex">
            <div
              key={moduleIdx}
              className="min-h-[280px] space-y-5 duration-700 animate-in fade-in slide-in-from-left-4"
            >
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/70">
                {activeModule.eyebrow}
              </p>
              <h1 className="text-5xl font-semibold leading-[1.05] tracking-tight text-white">
                {activeModule.heading}
              </h1>
              <p className="max-w-md text-lg leading-relaxed text-white/80">
                {activeModule.sub}
              </p>
            </div>
            <DotsPill
              activeDot={activeModule.dot}
              chip={activeModule.chip}
              onSelect={selectDot}
            />
          </div>

          {/* Right: login card */}
          <div className="mx-auto w-full max-w-md">
            <div className="rounded-3xl border border-white/60 bg-white/90 p-8 shadow-2xl shadow-indigo-950/20 backdrop-blur-xl sm:p-10">
              <div className="mb-8 space-y-1.5">
                <p className="text-sm font-semibold text-indigo-600">Sign in</p>
                <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
                  Sign in to {APP_NAME}
                </h2>
                <p className="text-sm text-slate-500">
                  Enter your credentials to access your organization.
                </p>
              </div>

              <form onSubmit={handleLogin}>
                <div className="flex flex-col gap-5">
                  <div className="grid gap-2">
                    <Label htmlFor="email" className="text-slate-700">
                      Username
                    </Label>
                    <div className="relative">
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@yourchurch.org"
                        autoComplete="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="h-11 rounded-xl border-slate-200 bg-white pr-10 text-slate-900 placeholder:text-slate-400 focus-visible:ring-indigo-500 dark:border-slate-200 dark:bg-white dark:text-slate-900 dark:placeholder:text-slate-400"
                      />
                      {emailValid && (
                        <CheckCircle2 className="absolute inset-y-0 right-3 my-auto size-4 text-emerald-500" />
                      )}
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="password" className="text-slate-700">
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="current-password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="h-11 rounded-xl border-slate-200 bg-white pr-10 text-slate-900 placeholder:text-slate-400 focus-visible:ring-indigo-500 dark:border-slate-200 dark:bg-white dark:text-slate-900 dark:placeholder:text-slate-400"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                        aria-pressed={showPassword}
                        className="absolute inset-y-0 right-0 flex w-10 items-center justify-center rounded-r-xl text-slate-400 transition-colors hover:text-slate-600 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500"
                      >
                        {showPassword ? (
                          <EyeOff className="size-4" />
                        ) : (
                          <Eye className="size-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <Checkbox
                      checked={rememberMe}
                      onCheckedChange={setRememberMe}
                      className="border-slate-300 data-[state=checked]:!border-indigo-500 data-[state=checked]:!bg-indigo-500 data-[state=checked]:!text-white"
                      label={
                        <span className="text-slate-600">Remember me</span>
                      }
                    />
                    <Link
                      href="/auth/forgot-password"
                      className="text-sm font-medium text-indigo-600 underline-offset-4 hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>

                  {error && (
                    <div
                      role="alert"
                      className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 animate-in fade-in slide-in-from-top-1"
                    >
                      <AlertCircle className="mt-0.5 size-4 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="h-11 w-full gap-2 rounded-xl bg-indigo-500 text-base text-white shadow-lg shadow-indigo-500/25 transition hover:bg-indigo-600"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      <>
                        Login
                        <ArrowRight className="size-4" />
                      </>
                    )}
                  </Button>

                  <p className="text-center text-sm text-slate-500">
                    Don&apos;t have an account?{" "}
                    <Link
                      href="/auth/sign-up"
                      className="font-semibold text-indigo-600 underline-offset-4 hover:underline"
                    >
                      Request a demo
                    </Link>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

/* White squircle logo + wordmark, styled for the purple background */
function BrandLockup() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex size-11 items-center justify-center rounded-2xl bg-white shadow-lg shadow-indigo-950/10">
        <Eye className="size-6 text-indigo-500" />
      </div>
      <span className="text-lg font-semibold text-white">{APP_NAME}</span>
    </div>
  );
}

/* Glass pill with clickable colored dots + a chip that follow the active module */
function DotsPill({
  activeDot,
  chip,
  onSelect,
}: {
  activeDot: number;
  chip: string;
  onSelect: (dotIndex: number) => void;
}) {
  const dots = [
    { color: "#4ade80", label: "People" },
    { color: "#60a5fa", label: "Follow-up" },
    { color: "#fbbf24", label: "Attendance" },
    { color: "#fb923c", label: "Overview" },
  ];
  return (
    <div className="flex flex-col items-start gap-3">
      <div className="inline-flex items-center gap-3 rounded-full border border-white/30 bg-white/15 px-5 py-3 backdrop-blur-md">
        {dots.map(({ color, label }, i) => (
          <button
            key={color}
            type="button"
            onClick={() => onSelect(i)}
            aria-label={`Show ${label}`}
            aria-current={i === activeDot}
            className={cn(
              "size-6 cursor-pointer rounded-full outline-none transition-all duration-500 focus-visible:ring-2 focus-visible:ring-white",
              i === activeDot
                ? "scale-110 ring-4 ring-white/70"
                : "ring-2 ring-white/25 hover:scale-110 hover:ring-white/50",
            )}
            style={{ backgroundColor: color }}
          />
        ))}
      </div>
      <span
        key={chip}
        className="rounded-full border border-white/25 bg-white/20 px-4 py-1.5 text-sm font-medium text-white backdrop-blur-md duration-500 animate-in fade-in"
      >
        {chip}
      </span>
    </div>
  );
}
