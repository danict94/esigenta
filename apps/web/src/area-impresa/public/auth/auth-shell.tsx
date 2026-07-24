import type { ReactNode } from "react";

import { Grain } from "../../../site/home/grain";
import { PublicShell } from "../../../site/shell/public-shell";
import { ProHeader, type ProHeaderAction } from "../marketing/pro-header";

export type AuthShellProps = {
  children: ReactNode;
  size?: "sm" | "md";
  headerAction?: ProHeaderAction | null;
};

export function AuthShell({ children, size = "sm", headerAction }: AuthShellProps) {
  const widthClass = size === "md" ? "max-w-[680px]" : "max-w-[480px]";

  return (
    <PublicShell header={<ProHeader action={headerAction} />}>
      <div className="eg-page eg-page-bg">
        <Grain />

        <section className="eg-section-large pt-[calc(var(--eg-nav-clear)+48px)]">
          <div className={`eg-container mx-auto ${widthClass}`}>
            <div className="eg-panel p-6 md:p-8">{children}</div>
          </div>
        </section>
      </div>
    </PublicShell>
  );
}
