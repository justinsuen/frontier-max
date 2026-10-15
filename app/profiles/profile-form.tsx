"use client";

import { useActionState, useState } from "react";
import { CHARACTER_AVATARS, characterAvatarStyle } from "@/lib/avatars";
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
  profile?: { id: string; name: string; avatar_color: string; avatar: string | null };
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const [name, setName] = useState(profile?.name ?? "");
  const [color, setColor] = useState(profile?.avatar_color ?? COLORS[0].value);

  return (
    <form action={formAction} className="form">
      {profile && <input type="hidden" name="id" value={profile.id} />}
      <label className="field">
        <span>Name</span>
        <input
          name="name"
          required
          maxLength={40}
          defaultValue={profile?.name}
          autoFocus
          onChange={(e) => setName(e.target.value)}
        />
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
                onChange={() => setColor(c.value)}
              />
              <span className="sr-only">{c.label}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <fieldset className="field picture-field">
        <legend>Picture</legend>
        <div className="picture-grid">
          <label className="picture-option" title="Initial on your colour">
            <input type="radio" name="avatar" value="" defaultChecked={!profile?.avatar} />
            <span className="avatar avatar-pick" data-color={color} aria-hidden="true">
              {(name.trim() || "?").charAt(0).toUpperCase()}
            </span>
            <span className="picture-name">Initial</span>
          </label>
          {CHARACTER_AVATARS.map((a) => (
            <label key={a.id} className="picture-option" title={`${a.name} · ${a.from}`}>
              <input type="radio" name="avatar" value={a.id} defaultChecked={profile?.avatar === a.id} />
              <span className="avatar avatar-pick has-image" style={characterAvatarStyle(a.id) ?? undefined} aria-hidden="true" />
              <span className="picture-name">{a.name}</span>
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
