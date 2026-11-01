
import { useState } from "react";
import { supabase } from "../lib/supabase";

function EyeIcon({ visible }) {
  return visible ? (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      className="h-5 w-5"
    >
      <path d="M3 3l18 18" />
      <path d="M10.6 10.6a2 2 0 002.8 2.8" />
      <path d="M9.9 5.2A11 11 0 0121 12a11 11 0 01-3.2 4.4M6.2 6.2A11 11 0 003 12a11 11 0 0018 0" />
    </svg>
  ) : (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      className="h-5 w-5"
    >
      <path d="M3 12s3.3-7 9-7 9 7 9 7-3.3 7-9 7-9-7-9-7z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function InputField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  autoComplete,
  required = true,
  minLength,
  showPassword,
  onTogglePassword,
}) {
  return (
    <div className="min-w-0 space-y-1.5">
      <label className="block text-xs font-semibold text-[#e8e2d4] sm:text-sm">
        {label}
      </label>

      <div className="relative">
        <input
          type={
            onTogglePassword
              ? showPassword
                ? "text"
                : "password"
              : type
          }
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required={required}
          minLength={minLength}
          className="h-11 w-full min-w-0 rounded-xl border border-[#454438] bg-[#22231e] px-4 pr-12 text-sm text-[#f2eee4] placeholder:text-[#777568] outline-none transition focus:border-[#c7a96b] focus:ring-2 focus:ring-[#c7a96b]/20"
        />

        {onTogglePassword && (
          <button
            type="button"
            onClick={onTogglePassword}
            aria-label={
              showPassword ? "Hide password" : "Show password"
            }
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#aaa797] transition hover:text-[#c7a96b]"
          >
            <EyeIcon visible={showPassword} />
          </button>
        )}
      </div>
    </div>
  );
}

export default function AuthPage({ onBack, onAuthSuccess }) {
  const initialMode =
    new URLSearchParams(window.location.search).get("mode") === "reset"
      ? "reset"
      : "signin";

  const [mode, setMode] = useState(initialMode);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const isSignup = mode === "signup";
  const isSignin = mode === "signin";
  const isForgot = mode === "forgot";
  const isReset = mode === "reset";

  const clearFeedback = () => {
    setMessage("");
    setError("");
  };

  const changeMode = (newMode) => {
    setMode(newMode);
    setPassword("");
    setConfirmPassword("");
    setShowPassword(false);
    setShowConfirmPassword(false);
    clearFeedback();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearFeedback();

    if (isSignup || isReset) {
      if (password.length < 8) {
        setError("Password must contain at least 8 characters.");
        return;
      }

      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }
    }

    setLoading(true);

    try {
      // SIGN UP
      if (isSignup) {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              display_name: name.trim(),
              full_name: name.trim(),
            },
          },
        });

        if (error) throw error;

        if (data.session) {
          onAuthSuccess?.();
        } else {
          setMessage(
            "Account created, but no active session was returned. Check email confirmation settings."
          );
        }
      }

      // SIGN IN
      else if (isSignin) {
        const { error } =
          await supabase.auth.signInWithPassword({
            email: email.trim(),
            password,
          });

        if (error) throw error;

        onAuthSuccess?.();
      }

      // FORGOT PASSWORD
      else if (isForgot) {
        const { error } =
          await supabase.auth.resetPasswordForEmail(
            email.trim(),
            {
              redirectTo: `${window.location.origin}/auth?mode=reset`,
            }
          );

        if (error) throw error;

        setMessage(
          "Password reset link sent. Please check your email."
        );
      }

      // RESET PASSWORD
      else if (isReset) {
        const { error } = await supabase.auth.updateUser({
          password,
        });

        if (error) throw error;

        setMessage("Password updated successfully!");

        onAuthSuccess?.();
      }
    } catch (err) {
      setError(
        err.message || "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const titles = {
    signin: "Welcome back.",
    signup: "Create your account.",
    forgot: "Forgot password?",
    reset: "Set new password.",
  };

  const descriptions = {
    signin: "Continue exploring the stories behind our heritage.",
    signup: "Join us in preserving history for future generations.",
    forgot: "Enter your registered email to receive a reset link.",
    reset: "Choose a strong new password for your account.",
  };

  return (
    <div className="fixed inset-0 z-[200] flex min-h-[100svh] w-full items-center justify-center overflow-x-hidden overflow-y-auto bg-[#11120f] px-4 py-3 text-[#f2eee4] sm:px-6">

      <div className="my-auto w-full max-w-[460px]">

        {/* Back */}
        <button
          type="button"
          onClick={onBack}
          className="mb-3 inline-flex items-center gap-2 text-xs text-[#aaa797] transition hover:text-[#c7a96b] sm:text-sm"
        >
          <span>←</span>
          Back to HeritageVerse
        </button>

        {/* Authentication Card */}
        <section className="w-full rounded-2xl border border-[#454438] bg-[#1b1c17] px-5 py-5 shadow-2xl sm:px-8 sm:py-6">

          {/* Brand */}
          <div className="mb-5">
            <div className="mb-1 flex items-center gap-3">
              <div className="grid h-9 w-8 shrink-0 place-items-center border border-[#c7a96b] font-serif text-xl text-[#c7a96b]">
                H
              </div>

              <h2 className="!mb-0 !text-[27px] !leading-tight font-serif font-medium tracking-tight">
                Heritage<span className="text-[#c7a96b]">Verse</span>
              </h2>
            </div>

            <p className="!mb-0 ml-11 text-[9px] tracking-[0.16em] text-[#aaa797]">
              PRESERVING OUR PAST
            </p>
          </div>

          {/* Heading */}
          <div className="mb-5">
            <p className="!mb-1 text-[10px] font-bold tracking-[0.25em] text-[#c7a96b] sm:text-xs">
              {isSignup
                ? "GET STARTED"
                : isSignin
                  ? "WELCOME"
                  : "ACCOUNT SECURITY"}
            </p>

            <h1 className="!mb-0 !text-[clamp(27px,5vw,38px)] !leading-[1.12] font-semibold tracking-tight">
              {titles[mode]}
            </h1>

            <p className="!mb-0 mt-2 text-xs leading-5 text-[#aaa797] sm:text-sm">
              {descriptions[mode]}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">

            {isSignup && (
              <InputField
                label="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                autoComplete="name"
              />
            )}

            {!isReset && (
              <InputField
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
              />
            )}

            {(isSignin || isSignup || isReset) && (
              <InputField
                label={isReset ? "New Password" : "Password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                autoComplete={
                  isSignin ? "current-password" : "new-password"
                }
                minLength={isSignin ? undefined : 8}
                showPassword={showPassword}
                onTogglePassword={() =>
                  setShowPassword((prev) => !prev)
                }
              />
            )}

            {(isSignup || isReset) && (
              <InputField
                label="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your password"
                autoComplete="new-password"
                minLength={8}
                showPassword={showConfirmPassword}
                onTogglePassword={() =>
                  setShowConfirmPassword((prev) => !prev)
                }
              />
            )}

            {isSignin && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => changeMode("forgot")}
                  className="text-xs font-medium text-[#c7a96b] transition hover:text-[#e0c58f]"
                >
                  Forgot password?
                </button>
              </div>
            )}

            {/* Error */}
            {error && (
              <div
                role="alert"
                className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs leading-5 text-red-300"
              >
                {error}
              </div>
            )}

            {/* Success */}
            {message && (
              <div
                role="status"
                className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs leading-5 text-emerald-300"
              >
                {message}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="mt-1 flex h-11 w-full items-center justify-center gap-2 rounded-full bg-[#c7a96b] px-5 text-sm font-bold text-[#171710] transition duration-300 hover:-translate-y-0.5 hover:bg-[#d7bb82] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Please wait..."
                : isSignup
                  ? "Create Account"
                  : isSignin
                    ? "Sign In"
                    : isForgot
                      ? "Send Reset Link"
                      : "Update Password"}

              {!loading && <span>→</span>}
            </button>
          </form>

          {/* Bottom Navigation */}
          <div className="mt-4 border-t border-[#454438] pt-4 text-center">

            {(isSignin || isSignup) && (
              <p className="!mb-0 text-xs text-[#aaa797] sm:text-sm">
                {isSignin
                  ? "Don't have an account?"
                  : "Already have an account?"}

                <button
                  type="button"
                  onClick={() =>
                    changeMode(isSignin ? "signup" : "signin")
                  }
                  className="ml-2 font-semibold text-[#c7a96b] transition hover:text-[#e0c58f]"
                >
                  {isSignin ? "Sign Up" : "Sign In"}
                </button>
              </p>
            )}

            {(isForgot || isReset) && (
              <button
                type="button"
                onClick={() => changeMode("signin")}
                className="text-xs font-semibold text-[#c7a96b] transition hover:text-[#e0c58f] sm:text-sm"
              >
                ← Back to Sign In
              </button>
            )}

          </div>
        </section>

        {/* Footer */}
        <p className="!mb-0 mt-2 text-center text-[10px] text-[#777568]">
          © 2026 HeritageVerse. Preserving cultural heritage.
        </p>

      </div>
    </div>
  );
}
