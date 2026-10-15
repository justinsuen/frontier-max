"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";

// The bar fixed to the top of every main page. It's see-through at the top of the
// page (so the home banner shows through) and turns solid once the page scrolls.
// Search filters the home page as you type, via ?q= in the URL; from other pages,
// pressing Enter goes to the home page with the search applied.
export default function HeaderBar({ account }: { account: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const params = useSearchParams();
  const onHome = pathname === "/";
  const urlQuery = onHome ? (params.get("q") ?? "") : "";

  const [text, setText] = useState(urlQuery);
  const [open, setOpen] = useState(urlQuery !== "");
  const [scrolled, setScrolled] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  // Follow the URL when it changes some other way (back button, links).
  useEffect(() => {
    setText(urlQuery);
    if (urlQuery) setOpen(true);
  }, [urlQuery]);

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 8);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  function change(value: string) {
    setText(value);
    if (onHome) {
      const q = value.trim();
      window.history.replaceState(null, "", q ? `/?q=${encodeURIComponent(q)}` : "/");
    }
  }

  function close() {
    change("");
    setOpen(false);
  }

  return (
    <header className={`topbar${scrolled ? " is-solid" : ""}${open ? " is-searching" : ""}`}>
      <Link href="/" className="logo" aria-label="Frontier Max home" onClick={() => setOpen(false)}>
        Frontier <span>Max</span>
      </Link>

      <nav className="topbar-actions" aria-label="Main">
        <form
          role="search"
          className={`topbar-search${open ? " is-open" : ""}`}
          onSubmit={(e) => {
            e.preventDefault();
            const q = text.trim();
            if (!onHome && q) router.push(`/?q=${encodeURIComponent(q)}`);
            input.current?.blur();
          }}
        >
          <button
            type="button"
            className="topbar-icon"
            aria-label={open ? "Search" : "Open search"}
            aria-expanded={open}
            onClick={() => {
              setOpen(true);
              // Focus right away so the first keystrokes aren't lost while the field opens.
              input.current?.focus();
            }}
          >
            <SearchIcon />
          </button>
          <input
            ref={input}
            type="search"
            placeholder="Search titles"
            aria-label="Search titles"
            value={text}
            tabIndex={open ? 0 : -1}
            onChange={(e) => change(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") close();
            }}
            onBlur={() => {
              if (!text.trim()) setOpen(false);
            }}
          />
          {open && (
            <button type="button" className="topbar-icon topbar-close" aria-label="Close search" onClick={close}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          )}
        </form>

        <Link
          href="/my-list"
          className={`topbar-icon${pathname === "/my-list" ? " is-current" : ""}`}
          aria-label="My List"
          aria-current={pathname === "/my-list" ? "page" : undefined}
          title="My List"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M9 6h11M9 12h11M9 18h11" />
            <circle cx="4.5" cy="6" r="1.2" />
            <circle cx="4.5" cy="12" r="1.2" />
            <circle cx="4.5" cy="18" r="1.2" />
          </svg>
        </Link>

        {account}
      </nav>
    </header>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="M15.5 15.5L21 21" />
    </svg>
  );
}
