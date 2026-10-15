import type { AvatarColor } from "@/lib/account";
import { characterAvatarStyle } from "@/lib/avatars";

// A profile's avatar: its character picture if it has one, otherwise its initial
// on its colour.
export default function Avatar({
  name,
  color,
  avatar,
  size = "md",
}: {
  name: string;
  color: AvatarColor;
  avatar?: string | null;
  size?: "sm" | "md" | "lg";
}) {
  const picture = avatar ? characterAvatarStyle(avatar) : null;
  if (picture) {
    return <span className={`avatar avatar-${size} has-image`} data-color={color} style={picture} aria-hidden="true" />;
  }
  return (
    <span className={`avatar avatar-${size}`} data-color={color} aria-hidden="true">
      {name.trim().charAt(0).toUpperCase()}
    </span>
  );
}
