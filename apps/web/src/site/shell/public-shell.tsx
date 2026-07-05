import type { ReactNode } from "react";

import { Navbar, type NavbarVariant } from "./navbar";
import { Footer } from "./footer";

type PublicShellProps = {
  children: ReactNode;
  hero?: ReactNode;
  navbarVariant?: NavbarVariant;
  showFooter?: boolean;
};

export function PublicShell({
  children,
  hero,
  navbarVariant = "default",
  showFooter = true,
}: PublicShellProps) {
  if (hero) {
    return (
      <div className="min-h-screen eg-page-bg text-eg-terra">
        {hero}

        <main>{children}</main>

        {showFooter ? <Footer /> : null}
      </div>
    );
  }

  return (
    <div className="min-h-screen eg-page-bg text-eg-terra">
      <Navbar variant={navbarVariant} />

      <main>{children}</main>

      {showFooter ? <Footer /> : null}
    </div>
  );
}
