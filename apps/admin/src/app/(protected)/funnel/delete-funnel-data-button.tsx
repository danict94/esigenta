"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@esigenta/ui";

import {
  DELETE_FUNNEL_DATA_CONFIRM_PHRASE,
  isFunnelDataDeletionConfirmed,
} from "./delete-funnel-data-confirm";

// FASE 9G — stesso shape del risultato ritornato dal Server Action in
// page.tsx (deleteAllFunnelEventsAction), duplicato qui SOLO come tipo
// (mai importato da @esigenta/domain lato client): un componente client
// non deve mai importare pacchetti che toccano Prisma.
type DeleteFunnelDataResult =
  | { ok: true; deletedCount: number }
  | { ok: false; message: string };

type DeleteFunnelDataButtonProps = {
  onDelete: () => Promise<DeleteFunnelDataResult>;
};

const numberFormatter = new Intl.NumberFormat("it-IT");

/**
 * FASE 9G — unico punto dell'interfaccia admin che esegue un'azione
 * distruttiva e irreversibile: elimina TUTTI i record FunnelEvent. Il
 * pulsante finale resta disabilitato finché il testo digitato non
 * corrisponde ESATTAMENTE a DELETE_FUNNEL_DATA_CONFIRM_PHRASE (vedi
 * delete-funnel-data-confirm.ts, isolato e testato separatamente da
 * questo componente). `onDelete` è il Server Action passato come prop dal
 * componente server (page.tsx) — già dietro requireAdmin() lì, questo
 * componente non verifica né può verificare alcuna autorizzazione da
 * solo (nessuna sessione admin è mai letta lato client).
 */
export function DeleteFunnelDataButton({ onDelete }: DeleteFunnelDataButtonProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [confirmText, setConfirmText] = useState("");
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const router = useRouter();

  const canConfirm = isFunnelDataDeletionConfirmed(confirmText);

  function openDialog() {
    setErrorMessage(null);
    setSuccessMessage(null);
    setConfirmText("");
    dialogRef.current?.showModal();
  }

  function closeDialog() {
    dialogRef.current?.close();
  }

  function handleConfirmDelete() {
    if (!canConfirm || isPending) {
      return;
    }

    startTransition(async () => {
      const result = await onDelete();

      if (result.ok) {
        dialogRef.current?.close();
        setConfirmText("");
        setSuccessMessage(
          `Dati funnel eliminati: ${numberFormatter.format(result.deletedCount)} eventi rimossi.`,
        );
        // FASE 9G: revalidatePath("/funnel") nel Server Action invalida già
        // la cache server-side — router.refresh() qui è la garanzia
        // esplicita, lato client, che QUESTA pagina già aperta rilegga
        // subito le metriche aggiornate (KPI/tabelle a zero), non solo un
        // futuro caricamento.
        router.refresh();
      } else {
        setErrorMessage(result.message);
      }
    });
  }

  return (
    <>
      <Button type="button" variant="ghost" onClick={openDialog}>
        Elimina dati funnel
      </Button>

      {successMessage ? (
        <p role="status" className="mt-2 text-sm text-eg-success">
          {successMessage}
        </p>
      ) : null}

      {/*
        FASE 9G: <dialog> nativo invece di un overlay fatto a mano — focus
        trap, chiusura con ESC e ::backdrop arrivano gratis dal browser,
        nessuna libreria di dialog/modal esiste ancora in questo repo (vedi
        report di indagine) e non ne introduciamo una per un solo utilizzo.
      */}
      <dialog
        ref={dialogRef}
        aria-labelledby="delete-funnel-data-title"
        className="w-full max-w-md rounded-eg-lg border border-eg-border bg-eg-surface p-6 text-eg-ink shadow-eg-elevation backdrop:bg-black/40"
        onClose={() => {
          setConfirmText("");
        }}
        onCancel={(event) => {
          if (isPending) {
            // FASE 9G: un'eliminazione già in corso non deve poter essere
            // chiusa a metà con ESC — l'esito (successo o errore) va
            // sempre visto.
            event.preventDefault();
          }
        }}
      >
        <h2 id="delete-funnel-data-title" className="text-lg font-semibold text-eg-ink">
          Elimina dati funnel
        </h2>

        <p className="mt-3 text-sm leading-6 text-eg-text-muted">
          Verranno eliminati definitivamente tutti i dati di analisi del
          funnel. Le richieste create e gli altri dati di Esigenta non
          verranno cancellati.
        </p>

        <label className="mt-5 grid gap-1.5 text-sm">
          <span className="font-medium text-eg-text-muted">
            Digita{" "}
            <span className="font-(family-name:--eg-font-mono) text-eg-ink">
              {DELETE_FUNNEL_DATA_CONFIRM_PHRASE}
            </span>{" "}
            per confermare
          </span>
          <input
            type="text"
            value={confirmText}
            onChange={(event) => {
              setConfirmText(event.target.value);
            }}
            disabled={isPending}
            autoComplete="off"
            spellCheck={false}
            className="border border-eg-border bg-eg-surface px-3 py-2 text-sm text-eg-ink outline-none focus:border-eg-brand"
          />
        </label>

        {errorMessage ? (
          <p role="alert" className="mt-3 text-sm text-eg-error">
            {errorMessage}
          </p>
        ) : null}

        <div className="mt-6 flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={closeDialog} disabled={isPending}>
            Annulla
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={handleConfirmDelete}
            disabled={!canConfirm || isPending}
            className="bg-eg-error border-eg-error hover:opacity-90 disabled:opacity-50"
          >
            {isPending ? "Eliminazione in corso…" : "Elimina definitivamente"}
          </Button>
        </div>
      </dialog>
    </>
  );
}
