# Analytics e tracking pubblico

## Consenso

Il consenso e gestito esclusivamente da `CookieConsent` tramite le categorie
`analytics` e `marketing` salvate in `esigenta_cookie_consent`. Nessun loader
di terze parti deve partire prima della categoria corrispondente.

- GA4 richiede `analytics`; Google Ads richiede `marketing`.
- Meta Pixel richiede `marketing`.
- La revoca blocca i nuovi invii; non viene creato un secondo banner o una
  seconda sorgente di preferenze.

## Loader pubblici

`apps/web/src/site/shell/public-analytics-loader.tsx` e l'unico punto di
montaggio per le route pubbliche gia coperte da analytics. Compone:

- `Ga4MinimalLoader`, invariato;
- `MetaPixelLoader`, che carica `https://connect.facebook.net/en_US/fbevents.js`
  soltanto dopo consenso marketing.

Il dataset Meta **Esigenta Web** usa ID `1390555649955776` (override opzionale:
`NEXT_PUBLIC_META_PIXEL_ID`). Il loader non usa un tag `noscript`, per non
aggirare il consenso.

## Semantica eventi Meta

- `PageView`: inviato dopo consenso marketing, una volta per pathname + query
  nella sessione client; le navigazioni App Router sono rilevate dal loader.
- `Lead`: inviato con `fbq("track", "Lead")` esclusivamente dal ramo di
  successo di `request-stepper.tsx`, dopo la risposta 200 che conferma la
  Request gia persistita. Non parte al click, all'apertura del funnel, agli
  step intermedi o al submit prima del successo.

Non sono implementati Conversions API, CRM, Advanced Matching, remarketing o
altri eventi Meta.

## Verifica manuale

1. In una finestra privata, visita una route pubblica e verifica in DevTools
   che `fbevents.js` non venga richiesto prima del consenso Marketing.
2. Accetta solo Marketing: in Meta Events Manager > Test events deve comparire
   un solo `PageView` per URL visitato.
3. Completa una richiesta valida: dopo la pagina di conferma deve comparire un
   solo `Lead`. Un errore di validazione, un cambio di step o un doppio click
   non devono produrlo.
