import type { Metadata } from "next";
import type { ReactNode } from "react";
import { GeistSans } from "geist/font/sans";

import "./globals.css";

export const metadata: Metadata = {
  title: "esigenta Admin",
};

export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="it"
      className={`${GeistSans.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-cantiere-paper font-sans text-cantiere-ink">
        {children}
      </body>
    </html>
  );
}
