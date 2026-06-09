import { RefreshCw, LogIn, Loader2 } from "lucide-react";

const inputClass =
  "mt-2 w-full rounded-xl border border-navy-600 bg-navy-800/60 px-4 py-3 text-sm text-white outline-none transition placeholder:text-navy-400 focus:border-accent focus:ring-4 focus:ring-accent/20 focus:bg-navy-800";

function FieldError({ children }) {
  if (!children) return null;
  return (
    <p className="mt-1.5 text-xs font-medium text-error-light">{children}</p>
  );
}

export default function ResultForm({
  values,
  errors,
  captchaImage,
  isCaptchaLoading,
  isLoading,
  onChange,
  onSubmit,
  onRefreshCaptcha,
}) {
  return (
    <form
      onSubmit={onSubmit}
      className="glass rounded-2xl p-6 shadow-card"
    >
      <div className="mb-6">
        <h2 className="font-heading text-lg font-bold text-white">
          Login to Portal
        </h2>
        <p className="mt-1 text-sm text-navy-300">
          Use your university credentials to authenticate with GGSIPU.
        </p>
      </div>

      <div className="grid gap-4">
        <label className="block">
          <span className="text-sm font-semibold text-navy-200">
            Enrollment Number
          </span>
          <input
            className={inputClass}
            name="enrollmentNumber"
            inputMode="numeric"
            autoComplete="username"
            placeholder="01396402722"
            value={values.enrollmentNumber}
            onChange={onChange}
          />
          <FieldError>{errors.enrollmentNumber}</FieldError>
        </label>

        <label className="block">
          <span className="text-sm font-semibold text-navy-200">Password</span>
          <input
            className={inputClass}
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="Enter password"
            value={values.password}
            onChange={onChange}
          />
          <p className="mt-1.5 text-[10.5px] text-navy-300 leading-normal">
            For first-time students, the default password is often your <strong>father's name in CAPITAL LETTERS</strong> (exactly as registered in university records, with spaces).
          </p>
          <FieldError>{errors.password}</FieldError>
        </label>

        <div>
          <span className="text-sm font-semibold text-navy-200">Captcha</span>
          <div className="mt-2 grid grid-cols-[1fr_auto] gap-2">
            <div className="flex min-h-[46px] items-center justify-center rounded-xl border border-dashed border-navy-600 bg-navy-800/80 px-4">
              {captchaImage ? (
                <img
                  src={captchaImage}
                  alt="Captcha"
                  className="max-h-10 max-w-full object-contain"
                />
              ) : (
                <Loader2 className="h-4 w-4 animate-spin-slow text-navy-300" />
              )}
            </div>
            <button
              type="button"
              onClick={onRefreshCaptcha}
              disabled={isCaptchaLoading || isLoading}
              className="inline-flex h-[46px] w-[46px] items-center justify-center rounded-xl border border-navy-600 text-navy-300 outline-none transition hover:border-navy-500 hover:bg-navy-700/60 hover:text-white focus-visible:ring-4 focus-visible:ring-accent/20"
              aria-label="Refresh captcha"
            >
              <RefreshCw className={`h-4 w-4 ${isCaptchaLoading ? "animate-spin-slow" : ""}`} />
            </button>
          </div>
          <input
            className={inputClass}
            name="captcha"
            placeholder="Enter captcha"
            value={values.captcha}
            onChange={onChange}
          />
          <FieldError>{errors.captcha}</FieldError>
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-accent to-cyan px-5 py-3 text-sm font-bold text-white shadow-glow outline-none transition hover:from-accent-hover hover:to-cyan-hover focus-visible:ring-4 focus-visible:ring-accent/30 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin-slow" />
            Logging in...
          </>
        ) : (
          <>
            <LogIn className="h-4 w-4" />
            Login
          </>
        )}
      </button>
    </form>
  );
}
