import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { MAX_PROFILES, getAccount, safeNext } from "@/lib/account";
import { createProfile, deleteProfile, selectProfile, signOut, updateProfile } from "../actions";
import Avatar from "../components/avatar";
import ProfileForm from "./profile-form";

export const metadata: Metadata = { title: "Profiles · Frontier Max" };

export default async function ProfilesPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; manage?: string; edit?: string; new?: string }>;
}) {
  const params = await searchParams;
  const next = safeNext(params.next);
  const { user, profiles } = await getAccount();
  if (!user) redirect(`/login?next=${encodeURIComponent(`/profiles?next=${next}`)}`);

  const managing = params.manage === "1";
  const editing = managing ? profiles.find((p) => p.id === params.edit) : undefined;
  const adding = managing && params.new === "1" && profiles.length < MAX_PROFILES;

  return (
    <div className="profiles-page">
      <header className="site-header">
        <Link href="/" className="logo">
          Frontier <span>Max</span>
        </Link>
        <form action={signOut}>
          <button className="back-link as-button">Sign out</button>
        </form>
      </header>

      <main className="profiles-main">
        {editing || adding ? (
          <section className="auth-card">
            <h1 className="auth-title">{editing ? "Edit profile" : "Add a profile"}</h1>
            <ProfileForm action={editing ? updateProfile : createProfile} profile={editing} />
            {editing && profiles.length > 1 && (
              <form action={deleteProfile} className="delete-profile">
                <input type="hidden" name="id" value={editing.id} />
                <button className="button-danger">Delete profile</button>
                <p className="hint">This also deletes its watch history and My List.</p>
              </form>
            )}
            <Link href="/profiles?manage=1" className="text-link">
              Cancel
            </Link>
          </section>
        ) : (
          <>
            <h1 className="profiles-title">{managing ? "Manage profiles" : "Who's watching?"}</h1>
            <ul className="profile-grid">
              {profiles.map((p) => (
                <li key={p.id}>
                  {managing ? (
                    <Link href={`/profiles?manage=1&edit=${p.id}`} className="profile-tile is-editing">
                      <Avatar name={p.name} color={p.avatar_color} size="lg" />
                      <span className="profile-name">{p.name}</span>
                      <span className="profile-edit">Edit</span>
                    </Link>
                  ) : (
                    <form action={selectProfile}>
                      <input type="hidden" name="id" value={p.id} />
                      <input type="hidden" name="next" value={next} />
                      <button className="profile-tile">
                        <Avatar name={p.name} color={p.avatar_color} size="lg" />
                        <span className="profile-name">{p.name}</span>
                      </button>
                    </form>
                  )}
                </li>
              ))}
              {managing && profiles.length < MAX_PROFILES && (
                <li>
                  <Link href="/profiles?manage=1&new=1" className="profile-tile">
                    <span className="avatar avatar-lg avatar-add" aria-hidden="true">
                      +
                    </span>
                    <span className="profile-name">Add profile</span>
                  </Link>
                </li>
              )}
            </ul>
            {profiles.length === 0 && (
              <p className="status">
                No profiles yet. <Link href="/profiles?manage=1&new=1">Add one</Link> to start watching.
              </p>
            )}
            <Link href={managing ? "/profiles" : "/profiles?manage=1"} className="button-outline">
              {managing ? "Done" : "Manage profiles"}
            </Link>
          </>
        )}
      </main>
    </div>
  );
}
