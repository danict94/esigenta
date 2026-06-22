"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { cc, ccElevation, ccFont, ccVoid } from "./palette";

export function Mark() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 8);
    }

    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <header
      style={ccFont}
      className="sticky top-0 z-50 backdrop-blur-md transition-shadow duration-300"
    >
      <div
        className="flex h-[72px] items-center justify-between border-b px-5 transition-colors duration-300 sm:px-10 lg:px-16"
        style={{
          backgroundColor: scrolled ? cc.paperTranslucent : "transparent",
          borderColor: scrolled ? cc.hairline : "transparent",
          boxShadow: scrolled ? ccElevation : "none",
        }}
      >
        <Link
          href="/"
          className="text-[17px] font-medium transition-colors duration-300"
          style={{ color: scrolled ? cc.ink : ccVoid.text }}
          prefetch={false}
        >
          esigenta
        </Link>

        <nav
          className="flex items-center gap-6 text-[15px] transition-colors duration-300"
          style={{ color: scrolled ? cc.inkSecondary : ccVoid.textSecondary }}
        >
          <Link href="/area-impresa" prefetch={false} className="hidden sm:inline">
            Professionisti
          </Link>

          <Link href="/richieste/accesso" prefetch={false}>
            Accedi
          </Link>
        </nav>
      </div>
    </header>
  );
}
