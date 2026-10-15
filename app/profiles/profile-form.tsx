"use client";

import { useActionState } from "react";
import type { FormState } from "../actions";

const COLORS = [
  { value: "navy", label: "Navy" },
  { value: "brass", label: "Brass" },
  { value: "green", label: "Green" },
  { value: "rose", label: "Rose" },
  { value: "slate", label: "Slate" },
] as const;

export default function ProfileForm({
  action,
  profile,
}: {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  profile?: { id: string; name: string; avatar_color: string };
}) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="form">
      {profile && <input type="hidden" name="id" value={profile.id} />}
      <label className="field">
        <span>Name</span>
        <input name="name" required maxLength={40} defaultValue={profile?.name} autoFocus />
      </label>
      <fieldset className="field color-field">
        <legend>Color</legend>
        <div className="swatches">
          {COLORS.map((c, i) => (
            <label key={c.value} className="swatch" data-color={c.value}>
              <input
                type="radio"
                name="avatar_color"
                value={c.value}
                defaultChecked={profile ? profile.avatar_color === c.value : i === 0}
              />
              <span className="sr-only">{c.label}</span>
            </label>
          ))}
        </div>
      </fieldset>
      {state?.error && (
        <p className="form-error" role="alert">
          {state.error}
        </p>
      )}
      <button className="button-primary" disabled={pending}>
        {pending ? "Saving…" : profile ? "Save" : "Add profile"}
      </button>
    </form>
  );
}
