import type { ReactNode } from "react";

import { Navbar, type NavbarVariant } from "./navbar";
import { Footer } from "./footer";

type PublicShellProps = {
  children: ReactNode;
  header?: ReactNode;
  hero?: ReactNode;
  navbarVariant?: NavbarVariant;
  showFooter?: boolean;
};

export function PublicShell({
  children,
  header,
  hero,
  navbarVariant = "default",
  showFooter = true,
}: PublicShellProps) {
  return (
    <div className="min-h-screen eg-page-bg text-eg-ink">
      {header ?? <Navbar variant={navbarVariant} />}

      {hero}

      <main>{children}</main>

      {showFooter ? <Footer /> : null}
    </div>
  );
}
