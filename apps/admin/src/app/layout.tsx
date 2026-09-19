import type { Metadata } from "next";
import type { ReactNode } from "react";
import { privateFontVariables } from "@esigenta/ui/fonts/private";

import "./globals.css";

export const metadata: Metadata = {
  title: "esigenta Admin",
};

export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="it"
      className={`${privateFontVariables} h-full antialiased`}
    >
      <body className="min-h-full">
        {children}
      </body>
    </html>
  );
}
