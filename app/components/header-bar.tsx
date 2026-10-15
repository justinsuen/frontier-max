"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

// The bar fixed to the top of every main page. It's see-through at the top of the
// page (so the home banner shows through) and turns solid once the page scrolls.
export default function HeaderBar({ account }: { account: ReactNode }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 8);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  return (
    <header className={`topbar${scrolled ? " is-solid" : ""}`}>
      <Link href="/" className="logo" aria-label="Frontier Max home">
        Frontier <span>Max</span>
      </Link>

      <nav className="topbar-actions" aria-label="Main">
        <IconLink href="/search" label="Search" current={pathname === "/search"}>
          <circle cx="10.5" cy="10.5" r="6.5" />
          <path d="M15.5 15.5L21 21" />
        </IconLink>
        <IconLink href="/my-list" label="My List" current={pathname === "/my-list"}>
          <path d="M6.5 3.5h11a1 1 0 0 1 1 1v16l-6.5-4.5-6.5 4.5v-16a1 1 0 0 1 1-1z" />
        </IconLink>
        {account}
      </nav>
    </header>
  );
}

function IconLink({
  href,
  label,
  current,
  children,
}: {
  href: string;
  label: string;
  current: boolean;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`topbar-icon${current ? " is-current" : ""}`}
      aria-label={label}
      aria-current={current ? "page" : undefined}
      title={label}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        {children}
      </svg>
    </Link>
  );
}
