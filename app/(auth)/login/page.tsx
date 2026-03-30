"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleEmailAuth(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    if (mode === "signin") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }
      router.push("/");
      router.refresh();
    } else {
      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        setLoading(false);
        return;
      }
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }
      setMessage("Check your email for a confirmation link.");
      setLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) setError(error.message);
  }

  return (
    <div className="min-h-dvh flex bg-white">
      {/* Left panel — branding */}
      <div className="hidden lg:flex flex-col justify-between w-80 shrink-0 p-10 border-r border-gray-200">
        <div>
          <p className="text-xs font-semibold text-brand-500 tracking-widest uppercase mb-8">
            Hillside Ventures
          </p>
          <h2 className="text-2xl font-semibold text-gray-900 tracking-tight leading-snug">
            The internal platform for the Genesis Fund.
          </h2>
        </div>
        <p className="text-gray-400 text-xs">© {new Date().getFullYear()} Hillside Ventures</p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="bg-white rounded-2xl shadow-modal border border-surface-border p-8">
            <div className="mb-7">
              <p className="text-xs font-semibold text-brand-500 tracking-widest uppercase mb-1 lg:hidden">
                Hillside Ventures
              </p>
              <h1 className="text-xl font-semibold text-gray-900 tracking-tight">
                {mode === "signin" ? "Sign in" : "Create account"}
              </h1>
              <p className="text-gray-400 mt-1 text-sm">
                {mode === "signin" ? "Access your Hub account." : "Set up your Hub account."}
              </p>
            </div>

            {/* Google OAuth */}
            <button
              onClick={handleGoogleSignIn}
              className="w-full flex items-center justify-center gap-2.5 border border-surface-border rounded-lg px-4 py-2.5 text-sm font-medium text-gray-700 bg-white hover:bg-surface-subtle shadow-card hover:shadow-card-hover transition-all mb-5"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continue with Google
            </button>

            <div className="relative mb-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-surface-border" />
              </div>
              <div className="relative flex justify-center text-xs text-gray-400 bg-white px-2">
                or with email
              </div>
            </div>

            <form onSubmit={handleEmailAuth} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-xs font-medium text-gray-600 mb-1.5">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="input-field"
                  placeholder="you@uconn.edu"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-xs font-medium text-gray-600 mb-1.5">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="input-field"
                  placeholder="••••••••"
                />
              </div>

              {mode === "signup" && (
                <div>
                  <label htmlFor="confirmPassword" className="block text-xs font-medium text-gray-600 mb-1.5">
                    Confirm password
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="input-field"
                    placeholder="••••••••"
                  />
                </div>
              )}

              {error && (
                <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}
              {message && (
                <p className="text-xs text-green-700 bg-green-50 border border-green-100 rounded-lg px-3 py-2">
                  {message}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-brand-500 hover:bg-brand-600 active:bg-brand-700 disabled:opacity-40 text-white font-medium py-2.5 px-4 rounded-lg text-sm transition-all shadow-[0_1px_3px_rgba(0,119,181,0.3)] hover:shadow-[0_2px_8px_rgba(0,119,181,0.35)]"
              >
                {loading
                  ? mode === "signin" ? "Signing in…" : "Creating account…"
                  : mode === "signin" ? "Sign in" : "Create account"}
              </button>
            </form>

            <p className="mt-6 text-center text-xs text-gray-400">
              {mode === "signin" ? "No account?" : "Already have an account?"}{" "}
              <button
                onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(null); setMessage(null); setConfirmPassword(""); }}
                className="text-brand-500 hover:text-brand-600 font-medium transition-colors"
              >
                {mode === "signin" ? "Sign up" : "Sign in"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
