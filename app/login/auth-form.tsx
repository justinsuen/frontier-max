"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signIn, signUp } from "../actions";

export default function AuthForm({
  mode,
  next,
  linkError,
}: {
  mode: "signin" | "signup";
  next: string;
  linkError: boolean;
}) {
  const [state, formAction, pending] = useActionState(mode === "signup" ? signUp : signIn, undefined);
  const nextQuery = next === "/" ? "" : `&next=${encodeURIComponent(next)}`;

  return (
    <section className="auth-card">
      <p className="eyebrow">{mode === "signup" ? "New here" : "Welcome back"}</p>
      <h1 className="auth-title">{mode === "signup" ? "Create your account" : "Sign in"}</h1>

      {linkError && !state && (
        <p className="form-error" role="alert">
          That link has expired or was already used. Sign in, or create your account again.
        </p>
      )}

      <form action={formAction} className="form">
        <input type="hidden" name="next" value={next} />
        <label className="field">
          <span>Username</span>
          <input
            name="username"
            required
            maxLength={mode === "signup" ? 20 : undefined}
            pattern={mode === "signup" ? "[A-Za-z0-9_]{3,20}" : undefined}
            title={mode === "signup" ? "3 to 20 letters, numbers or underscores" : undefined}
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
          />
          {mode === "signup" && <small className="field-hint">3 to 20 letters, numbers or underscores.</small>}
        </label>
        <label className="field">
          <span>Password</span>
          <input
            name="password"
            type="password"
            required
            minLength={mode === "signup" ? 6 : undefined}
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
          />
        </label>
        {state?.error && (
          <p className="form-error" role="alert">
            {state.error}
          </p>
        )}
        <button className="button-primary" disabled={pending}>
          {pending ? "One moment…" : mode === "signup" ? "Create account" : "Sign in"}
        </button>
      </form>

      <p className="auth-switch">
        {mode === "signup" ? (
          <>
            Already have an account? <Link href={`/login?mode=signin${nextQuery}`}>Sign in</Link>
          </>
        ) : (
          <>
            New to Frontier Max? <Link href={`/login?mode=signup${nextQuery}`}>Create an account</Link>
          </>
        )}
      </p>
    </section>
  );
}
