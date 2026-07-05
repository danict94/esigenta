import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Space_Grotesk } from "next/font/google";

import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-space-grotesk",
  display: "swap",
});

export const metadata: Metadata = {
  title: "esigenta Admin",
};

export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="it"
      className={`${spaceGrotesk.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-eg-calce font-sans text-eg-terra">
        {children}
      </body>
    </html>
  );
}
