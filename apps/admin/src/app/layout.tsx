import type { Metadata } from "next";
import type { ReactNode } from "react";

import "./globals.css";

export const metadata: Metadata = {
  title: "FixPro Admin",
};

export default function AdminRootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="it" className="h-full antialiased">
      <body className="min-h-full bg-surface-primary font-sans text-text-primary">
        {children}
      </body>
    </html>
  );
}