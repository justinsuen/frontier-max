import { Suspense } from "react";
import AccountNav from "./account-nav";
import HeaderBar from "./header-bar";

// The fixed top bar for the main pages. Pages without the home banner add a
// .topbar-spacer under it so their content doesn't start behind the bar.
export default function SiteHeader() {
  return (
    <Suspense fallback={<div className="topbar" />}>
      <HeaderBar account={<AccountNav />} />
    </Suspense>
  );
}
