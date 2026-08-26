"use client"

/**
 * Esigenta — FASE 9J: registro cross-albero per intercettare le uscite dal
 * funnel controllabili dal nostro codice (logo, link della navbar).
 *
 * FOUNDATION
 *
 * Il problema: il modal di uscita dal funnel deve poter intercettare un
 * click sul logo o su un link della Navbar — ma Navbar (qui, in
 * site/shell) e RequestStepper (in richiesta/flow, che sa QUANDO e SE
 * intercettare) non sono nello stesso sottoalbero React: sono entrambi
 * figli di PublicShell. Questo file è il solo punto di contatto tra i
 * due, e non sa nulla del funnel in sé (nessuna copy, nessun reasonCode,
 * nessun accesso a FunnelEvent) — resta un meccanismo di registro
 * generico, riutilizzabile in teoria per qualunque altra pagina che un
 * giorno avesse la stessa esigenza.
 *
 * Design: un registro basato su ref (non su stato/useSyncExternalStore).
 * Navbar consulta l'handler registrato SOLO al momento del click (non
 * deve mai ri-renderizzare quando l'handler cambia), quindi non serve
 * alcuna sottoscrizione reattiva — solo una scrittura (RequestStepper) e
 * una lettura puntuale (Navbar).
 *
 * FunnelExitGuardProvider va montato UNA VOLTA, sopra sia <Navbar> che il
 * componente del funnel (vedi request-flow-page.tsx) — su ogni altra
 * pagina del sito il contesto è assente e useFunnelExitGuardIntercept()
 * si comporta come no-op (mai un'intercettazione), zero cambi di
 * comportamento altrove.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
} from "react"

/**
 * Chiamato da Navbar al click su un link che porterebbe fuori dal
 * funnel. `proceed` è la navigazione che l'elemento avrebbe eseguito
 * subito (es. router.push(href)) — l'handler la richiama lui stesso, più
 * tardi, se e quando la navigazione deve davvero avvenire.
 *
 * Ritorna true se l'handler ha preso in carico l'uscita (il chiamante
 * NON deve navigare ora — niente altro da fare, `proceed` verrà
 * richiamata dall'handler stesso quando serve, oppure mai se l'utente
 * resta nel funnel). Ritorna false se il chiamante deve navigare
 * immediatamente, come se non esistesse alcun guard.
 */
export type FunnelExitGuardHandler = (proceed: () => void) => boolean

type FunnelExitGuardContextValue = {
  getHandler: () => FunnelExitGuardHandler | null
  setHandler: (handler: FunnelExitGuardHandler | null) => void
}

const FunnelExitGuardContext = createContext<FunnelExitGuardContextValue | null>(null)

export function FunnelExitGuardProvider({ children }: { children: ReactNode }) {
  const handlerRef = useRef<FunnelExitGuardHandler | null>(null)

  const value = useMemo<FunnelExitGuardContextValue>(
    () => ({
      getHandler: () => handlerRef.current,
      setHandler: (handler) => {
        handlerRef.current = handler
      },
    }),
    [],
  )

  return (
    <FunnelExitGuardContext.Provider value={value}>
      {children}
    </FunnelExitGuardContext.Provider>
  )
}

/**
 * Per RequestStepper: registra l'handler corrente (ri-registrato ad ogni
 * render con la chiusura più recente — scrittura di un ref, nessun
 * re-render innescato, costo trascurabile). Deregistrato automaticamente
 * allo smontaggio, così una Navbar su un'altra pagina non trova mai un
 * handler "fantasma" di un funnel già lasciato.
 *
 * No-op se non montato dentro un FunnelExitGuardProvider (non dovrebbe
 * mai accadere per RequestStepper, ma non deve MAI lanciare se accade).
 */
export function useRegisterFunnelExitGuard(handler: FunnelExitGuardHandler): void {
  const context = useContext(FunnelExitGuardContext)

  useEffect(() => {
    if (!context) {
      return
    }

    context.setHandler(handler)

    return () => {
      context.setHandler(null)
    }
  }, [context, handler])
}

/**
 * Per Navbar: restituisce una funzione da chiamare al click, che ritorna
 * false (mai un'intercettazione) quando nessun FunnelExitGuardProvider è
 * montato sopra — cioè su ogni pagina che non sia il funnel.
 */
export function useFunnelExitGuardIntercept(): FunnelExitGuardHandler {
  const context = useContext(FunnelExitGuardContext)

  return useCallback(
    (proceed: () => void) => {
      const handler = context?.getHandler()

      if (!handler) {
        return false
      }

      return handler(proceed)
    },
    [context],
  )
}
