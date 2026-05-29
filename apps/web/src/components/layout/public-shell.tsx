import type { ReactNode } from "react";

import { Navbar } from "../navigation/navbar";
import { Footer } from "./footer";

type PublicShellProps = {
  children: ReactNode;
  hero?: ReactNode;
};

export function PublicShell({
  children,
  hero,
}: PublicShellProps) {
  if (hero) {
    return (
      <div className="min-h-screen bg-surface-primary text-text-primary">
        {hero}

        <main>{children}</main>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-primary text-text-primary">
      <Navbar />

      <main>{children}</main>

      <Footer />
    </div>
  );
}
