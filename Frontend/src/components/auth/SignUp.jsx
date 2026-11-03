function AuthField({ label, type, value, onChange, autoComplete }) {
  return (
    <label className="block space-y-1.5">
      <span className="block text-xs font-semibold text-[#d9e1e6] sm:text-sm">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        required
        className="h-11 w-full rounded-xl border border-[#3a4b59] bg-[#26333f] px-4 text-sm text-[#f3f5f6] outline-none transition placeholder:text-[#71808b] focus:border-[#e1a080] focus:ring-2 focus:ring-[#e1a080]/20"
      />
    </label>
  );
}

export default function SignUp({
  name,
  onNameChange,
  email,
  onEmailChange,
  password,
  onPasswordChange,
  confirmPassword,
  onConfirmPasswordChange,
  showPassword,
  onTogglePassword,
  showConfirmPassword,
  onToggleConfirmPassword,
  onSubmit,
  loading,
  error,
  message,
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <AuthField
        label="Full Name"
        type="text"
        value={name}
        onChange={onNameChange}
        autoComplete="name"
      />
      <AuthField
        label="Email Address"
        type="email"
        value={email}
        onChange={onEmailChange}
        autoComplete="email"
      />

      <label className="block space-y-1.5">
        <span className="block text-xs font-semibold text-[#d9e1e6] sm:text-sm">
          Password
        </span>
        <span className="relative block">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={onPasswordChange}
            autoComplete="new-password"
            minLength={8}
            required
            className="h-11 w-full rounded-xl border border-[#3a4b59] bg-[#26333f] px-4 pr-12 text-sm text-[#f3f5f6] outline-none transition placeholder:text-[#71808b] focus:border-[#e1a080] focus:ring-2 focus:ring-[#e1a080]/20"
          />
          <button
            type="button"
            onClick={onTogglePassword}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#aeb9c1] hover:text-[#e1a080]"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </span>
      </label>

      <label className="block space-y-1.5">
        <span className="block text-xs font-semibold text-[#d9e1e6] sm:text-sm">
          Confirm Password
        </span>
        <span className="relative block">
          <input
            type={showConfirmPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={onConfirmPasswordChange}
            autoComplete="new-password"
            minLength={8}
            required
            className="h-11 w-full rounded-xl border border-[#3a4b59] bg-[#26333f] px-4 pr-12 text-sm text-[#f3f5f6] outline-none transition placeholder:text-[#71808b] focus:border-[#e1a080] focus:ring-2 focus:ring-[#e1a080]/20"
          />
          <button
            type="button"
            onClick={onToggleConfirmPassword}
            aria-label={
              showConfirmPassword ? "Hide password" : "Show password"
            }
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#aeb9c1] hover:text-[#e1a080]"
          >
            {showConfirmPassword ? "Hide" : "Show"}
          </button>
        </span>
      </label>

      {error && (
        <p
          role="alert"
          className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs leading-5 text-red-300"
        >
          {error}
        </p>
      )}
      {message && (
        <p
          role="status"
          className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs leading-5 text-emerald-300"
        >
          {message}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="mt-1 flex h-11 w-full items-center justify-center gap-2 rounded-full bg-[#e1a080] px-5 text-sm font-bold text-[#111a23] transition duration-300 hover:-translate-y-0.5 hover:bg-[#f0b395] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Please wait..." : "Create Account"}
        {!loading && <span aria-hidden="true">→</span>}
      </button>
    </form>
  );
}