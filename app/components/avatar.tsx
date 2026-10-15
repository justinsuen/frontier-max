import type { AvatarColor } from "@/lib/account";

export default function Avatar({ name, color, size = "md" }: { name: string; color: AvatarColor; size?: "sm" | "md" | "lg" }) {
  return (
    <span className={`avatar avatar-${size}`} data-color={color} aria-hidden="true">
      {name.trim().charAt(0).toUpperCase()}
    </span>
  );
}
