import Link from "next/link";
import { getAccount } from "@/lib/account";
import { signOut } from "../actions";
import Avatar from "./avatar";

// The account corner of the header: sign-in link, or the active profile with its menu.
export default async function AccountNav() {
  const { user, profile } = await getAccount();

  if (!user) {
    return (
      <Link href="/login" className="nav-button">
        Sign in
      </Link>
    );
  }
  if (!profile) {
    return (
      <Link href="/profiles" className="nav-button">
        Choose profile
      </Link>
    );
  }

  return (
    <details className="account-menu">
      <summary aria-label={`Account menu for ${profile.name}`}>
        <Avatar name={profile.name} color={profile.avatar_color} size="sm" />
        <span className="account-name">{profile.name}</span>
      </summary>
      <div className="account-popup">
        <Link href="/#my-list">My List</Link>
        <Link href="/history">Watch history</Link>
        <Link href="/profiles">Switch profile</Link>
        <Link href="/profiles?manage=1">Manage profiles</Link>
        <form action={signOut}>
          <button type="submit">Sign out</button>
        </form>
      </div>
    </details>
  );
}
