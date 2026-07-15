"use client";

import Link from "next/link";
import { Building2, X } from "lucide-react";
import { useEffect, useState } from "react";

import {
  COOKIE_CONSENT_CHANGED_EVENT,
  readCookieConsentPreferences,
} from "./cookie-consent-storage";

const DISMISS_STORAGE_KEY = "esigenta_business_tab_dismissed";

type BusinessAccessTabProps = {
  // Id dell'elemento sentinel che segna il confine reale dopo l'hero: il
  // contratto e' del chiamante (che possiede il sentinel), non di questo
  // componente, che si limita a osservarlo.
  heroBoundaryId: string;
};

export function BusinessAccessTab({ heroBoundaryId }: BusinessAccessTabProps) {
  const [pastHero, setPastHero] = useState(false);
  const [footerVisible, setFooterVisible] = useState(false);
  const [consentDecided, setConsentDecided] = useState(false);
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    const initTimeout = window.setTimeout(() => {
      setDismissed(window.sessionStorage.getItem(DISMISS_STORAGE_KEY) === "1");
      setConsentDecided(readCookieConsentPreferences() !== null);
    }, 0);

    function handleConsentChanged() {
      setConsentDecided(true);
    }

    window.addEventListener(COOKIE_CONSENT_CHANGED_EVENT, handleConsentChanged);

    return () => {
      window.clearTimeout(initTimeout);
      window.removeEventListener(COOKIE_CONSENT_CHANGED_EVENT, handleConsentChanged);
    };
  }, []);

  useEffect(() => {
    const boundary = document.getElementById(heroBoundaryId);

    if (!boundary) {
      return;
    }

    function syncFromPosition() {
      const rect = boundary?.getBoundingClientRect();

      if (!rect) {
        return;
      }

      setPastHero(rect.top < 0);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) {
          return;
        }

        // Il sentinel e' "superato" quando non e' piu' intersecante e si
        // trova sopra il viewport (scroll verso il basso oltre l'hero).
        setPastHero(!entry.isIntersecting && entry.boundingClientRect.top < 0);
      },
      { threshold: 0 },
    );

    observer.observe(boundary);

    // Rete di sicurezza, non un listener di scroll continuo: un salto ampio
    // in un solo gesto (link con ancora, tasto Fine, flick veloce) puo' far
    // "saltare" il sentinel senza che isIntersecting cambi mai, e quindi
    // senza che l'observer emetta un evento. "scrollend" scatta una sola
    // volta al termine del gesto e risincronizza lo stato dalla posizione reale.
    window.addEventListener("scrollend", syncFromPosition);

    return () => {
      observer.disconnect();
      window.removeEventListener("scrollend", syncFromPosition);
    };
  }, [heroBoundaryId]);

  useEffect(() => {
    const footerEl = document.querySelector("footer");

    if (!footerEl) {
      return;
    }

    function syncFromPosition() {
      const rect = footerEl?.getBoundingClientRect();

      if (!rect) {
        return;
      }

      setFooterVisible(rect.top < window.innerHeight);
    }

    const observer = new IntersectionObserver(
      ([entry]) => setFooterVisible(entry?.isIntersecting ?? false),
      { threshold: 0 },
    );

    observer.observe(footerEl);
    window.addEventListener("scrollend", syncFromPosition);

    return () => {
      observer.disconnect();
      window.removeEventListener("scrollend", syncFromPosition);
    };
  }, []);

  function dismiss() {
    window.sessionStorage.setItem(DISMISS_STORAGE_KEY, "1");
    setDismissed(true);
  }

  const visible = pastHero && consentDecided && !footerVisible && !dismissed;

  return (
    <div
      aria-hidden={!visible}
      className={[
        "fixed right-0 top-1/2 z-40 -translate-y-1/2 transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.65,0,0.15,1)] min-[861px]:hidden",
        visible ? "translate-x-0 opacity-100" : "pointer-events-none translate-x-3 opacity-0",
      ].join(" ")}
      style={{ paddingRight: "env(safe-area-inset-right)" }}
    >
      <div className="relative">
        <Link
          href="/area-impresa"
          prefetch={false}
          tabIndex={visible ? 0 : -1}
          aria-label="Sei un professionista? Scopri l'area dedicata alle imprese"
          className="eg-link-mono flex flex-col items-center gap-1 rounded-l-eg-lg border border-r-0 border-eg-hairline bg-eg-calce px-3 py-2.5 text-center text-eg-terra shadow-eg-elevation transition-colors hover:text-eg-cotto-dark"
        >
          <Building2 className="size-4 shrink-0" aria-hidden="true" strokeWidth={1.75} />
          <span className="leading-tight tracking-normal">
            Sei un
            <br />
            professionista?
          </span>
        </Link>

        <button
          type="button"
          onClick={dismiss}
          tabIndex={visible ? 0 : -1}
          aria-label="Nascondi il collegamento per le imprese"
          className="absolute -left-2 -top-2 flex size-8 items-center justify-center rounded-full border border-eg-hairline bg-eg-calce text-eg-ardesia shadow-eg-elevation transition-colors hover:text-eg-cotto-dark"
        >
          <X className="size-3.5" aria-hidden="true" strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}
