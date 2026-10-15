import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getAccount, safeNext } from "@/lib/account";
import AuthForm from "./auth-form";

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ mode?: string }> }): Promise<Metadata> {
  return { title: (await searchParams).mode === "signup" ? "Create account · Frontier Max" : "Sign in · Frontier Max" };
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; mode?: string; error?: string }>;
}) {
  const params = await searchParams;
  const next = safeNext(params.next);
  if ((await getAccount()).user) redirect(`/profiles?next=${encodeURIComponent(next)}`);

  return (
    <div className="auth-page">
      <header className="site-header">
        <Link href="/" className="logo">
          Frontier <span>Max</span>
        </Link>
        <Link href="/" className="back-link">
          ← Browse
        </Link>
      </header>
      <main className="auth-main">
        <AuthForm
          key={params.mode === "signup" ? "signup" : "signin"}
          mode={params.mode === "signup" ? "signup" : "signin"}
          next={next}
          linkError={params.error === "link"}
        />
      </main>
    </div>
  );
}
