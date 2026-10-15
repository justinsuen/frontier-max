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

      {state?.message ? (
        <p className="form-message" role="status">
          {state.message} Open it on this device to finish signing up.
        </p>
      ) : (
        <form action={formAction} className="form">
          <input type="hidden" name="next" value={next} />
          {mode === "signup" && (
            <label className="field">
              <span>Your name</span>
              <input name="name" required maxLength={40} autoComplete="given-name" />
            </label>
          )}
          <label className="field">
            <span>Email</span>
            <input name="email" type="email" required autoComplete="email" />
          </label>
          <label className="field">
            <span>Password</span>
            <input
              name="password"
              type="password"
              required
              minLength={mode === "signup" ? 8 : undefined}
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
      )}

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
