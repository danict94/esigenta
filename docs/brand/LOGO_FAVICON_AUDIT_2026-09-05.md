# Audit logo e favicon Esigenta

Data audit: 2026-09-05

Perimetro: sorgenti attivi, `public`, app web e admin, output/cache Next.js e Turbo, produzione `www.esigenta.it`, segnali pubblici Google e storico Git.

Modalita: sola lettura. Nessun asset o riferimento e stato modificato.

## Esito sintetico

Il nuovo marchio non e ancora implementato. I due file candidati sono presenti soltanto come file non tracciati dentro una cartella della home e in produzione restituiscono `404`:

- `apps/web/public/assets/images/home/logo-v1.svg`
- `apps/web/public/assets/images/home/favicon-v1.svg`

La produzione e Google ricevono ancora il vecchio simbolo casa/martello. Il residuo non dipende soltanto dalla cache di Google: il vecchio marchio e tuttora la fonte attiva del sito, e viene emesso contemporaneamente attraverso quattro favicon, il logo inline dell'interfaccia e il JSON-LD `Organization.logo`.

## Varianti correnti individuate

| ID | Variante | Dove si trova | Stato e propagazione |
| --- | --- | --- | --- |
| A | Wordmark inline, simbolo casa/martello + scritta `esigenta`, navy/ciano | `packages/ui/src/components/esigenta-logo.tsx` | Attivo. Fonte condivisa usata da sito web, area impresa e admin. Non e un file immagine referenziato: il tracciato SVG viene incorporato nell'HTML e nei bundle. |
| B1 | Vecchia favicon SVG, simbolo navy su fondo bianco | `apps/web/src/app/icon.svg` | Attiva e pubblica su `/icon.svg`; inserita automaticamente da Next nel `<head>`. |
| B2 | Vecchia icona PNG 512x512, simbolo navy su fondo bianco | `apps/web/src/app/icon.png` | Attiva e pubblica su `/icon.png`; inserita nel `<head>` e usata anche da `Organization.logo`. |
| B3 | Vecchia favicon ICO 32x32 | `apps/web/src/app/favicon.ico` | Attiva e pubblica su `/favicon.ico`; inserita nel `<head>`. E l'URL legacy piu prevedibile per browser e crawler. |
| B4 | Vecchia Apple touch icon PNG 180x180 | `apps/web/src/app/apple-icon.png` | Attiva e pubblica su `/apple-icon.png`; inserita nel `<head>`. |
| C | Nuovo wordmark candidato, simbolo ciano + testo bianco su trasparenza | `apps/web/public/assets/images/home/logo-v1.svg` | Non referenziato, non incluso nell'ultima build, non tracciato da Git, `404` in produzione. E una variante per fondo scuro: su navbar/footer chiari il testo bianco sparirebbe. |
| D | Nuova favicon candidata, riquadro antracite ruotato + simbolo ciano | `apps/web/public/assets/images/home/favicon-v1.svg` | Non referenziata, non inclusa nell'ultima build, non tracciata da Git, `404` in produzione. Il viewBox e 68.625563 x 64.276879, quindi non e quadrato e non rispetta ancora il requisito Google 1:1. |
| E | Vecchio file `logo esigenta.svg` | `apps/web/public/logo esigenta.svg` e `apps/admin/public/logo esigenta.svg` nello storico Git | Eliminato dal tree corrente dal commit `9780a0d` del 2026-07-20. Le due copie avevano lo stesso blob. Non e attivo e non compare nelle build correnti. |

Hash SHA-256 delle varianti correnti, utili per una verifica post-bonifica:

| File | SHA-256 |
| --- | --- |
| `src/app/icon.svg` | `F7D9E65B08BD43323420EC81BBFD1CD4FBEDADC5B21432A73B84D52020243F50` |
| `src/app/icon.png` | `62CCEDE852926C6E1DC710F7D1AD7632E1D5200CC0725D3DCA9D71F06A09575E` |
| `src/app/favicon.ico` | `B6398EC97955CF0F7E58C76A3433F68581D2FE3F4B5D77D403A05AADA8F67701` |
| `src/app/apple-icon.png` | `03001DC0AA1E516C2A3CC15603643D9F4A22DBEB52B1F2ABBF3A10B100398B7F` |
| `public/.../logo-v1.svg` | `0BDA3E6D53C39360AAF73DD66BC1095EDEF3070338586A203EEDE97D5C05B079` |
| `public/.../favicon-v1.svg` | `200C6857B52C66C3426D35F46B3422D491533D8B0334E92141DCA20E622FEFE1` |

## Tutti i punti attivi che mantengono il vecchio marchio

### Interfaccia web e admin

La fonte del logo visibile e `packages/ui/src/components/esigenta-logo.tsx`, non un file dentro `public`.

Consumatori diretti o indiretti:

- `apps/web/src/site/shell/navbar.tsx`: navbar pubblica.
- `apps/web/src/site/shell/footer.tsx`: footer pubblico.
- `apps/web/src/area-impresa/shared/pro-brand.tsx`: fonte condivisa dell'area impresa.
- `apps/web/src/area-impresa/public/marketing/pro-header.tsx`: landing professionisti.
- `apps/web/src/area-impresa/private/shell/impresa-header.tsx`: area impresa privata.
- `apps/admin/src/components/admin-brand.tsx`: fonte condivisa dell'admin.
- `apps/admin/src/components/admin-shell.tsx`: shell admin.
- Le pagine admin `accedi`, `recupera-password`, `reimposta-password` e `unauthorized` usano `AdminBrand`.

Cambiare soltanto un file in `public` non aggiornera nessuno di questi punti.

### Head HTML e route Next.js

Next.js 16.2.5 rileva automaticamente i quattro file nella root di `apps/web/src/app` e oggi emette, su ogni pagina, quattro dichiarazioni:

```html
<link rel="icon" href="/favicon.ico?..." sizes="32x32" type="image/x-icon">
<link rel="icon" href="/icon.png?..." sizes="512x512" type="image/png">
<link rel="icon" href="/icon.svg?..." sizes="any" type="image/svg+xml">
<link rel="apple-touch-icon" href="/apple-icon.png?..." sizes="180x180" type="image/png">
```

Le route pubbliche attive sono:

- `/favicon.ico`
- `/icon.png`
- `/icon.svg`
- `/apple-icon.png`

La presenza simultanea non sarebbe un problema se tutte le codifiche rappresentassero lo stesso nuovo marchio. Oggi rappresentano tutte il vecchio marchio e continuano quindi a confermarlo ai crawler.

### Dati strutturati Google

`apps/web/src/site/seo/engine/schema-builder.ts`, riga 64, emette:

```ts
logo: toAbsoluteUrl("/icon.png")
```

La home include questo valore nel JSON-LD `Organization`. E un segnale separato dalla favicon e puo influenzare il logo dell'organizzazione nei risultati e negli eventuali pannelli Google. Attualmente punta esplicitamente alla vecchia icona 512x512.

### Open Graph e Twitter

La home dichiara titolo, descrizione, URL e site name, ma non dichiara `openGraph.images` o `twitter.images`. Non e stato trovato un vecchio logo nei metadata social attivi. Questa e un'assenza da decidere in una fase separata, non un residuo da eliminare.

## Produzione e Google al momento dell'audit

Verifica HTTP del 2026-09-05:

- `https://www.esigenta.it/favicon.ico`: `200`, 656 byte, hash identico al file locale vecchio.
- `https://www.esigenta.it/icon.svg`: `200`, 1776 byte, hash identico al file locale vecchio.
- `https://www.esigenta.it/icon.png`: `200`, 9054 byte, hash identico al file locale vecchio.
- `https://www.esigenta.it/apple-icon.png`: `200`, 2914 byte, hash identico al file locale vecchio.
- `https://www.esigenta.it/assets/images/home/logo-v1.svg`: `404`.
- `https://www.esigenta.it/assets/images/home/favicon-v1.svg`: `404`.

La home pubblica emette gli stessi quattro `<link>` rilevati nella build locale e il JSON-LD continua a indicare `https://www.esigenta.it/icon.png`.

Il servizio favicon di Google, interrogato con l'URL completo di `www.esigenta.it` a 128x128, restituisce il vecchio simbolo navy casa/martello su fondo bianco. Non e soltanto un reperto non raggiungibile: coincide visivamente con gli asset che il sito serve ancora oggi.

La ricerca pubblica Google individua almeno home, `/area-impresa`, `/termini` e pagine SEO `/costi/...`. Google applica una favicon unica per hostname: tutte le URL sotto `www.esigenta.it` ereditano quindi lo stesso vecchio simbolo nei risultati, non una favicon diversa per singola pagina.

I file icona sono crawlable: `robots.ts` consente `/` e non blocca nessuna delle quattro route.

## Output Next.js e cache locali

L'ultima build locale `apps/web/.next` e del 2026-08-27, precedente ai due nuovi file del 2026-09-05. Contiene copie byte-per-byte delle quattro vecchie icone:

- `.next/static/media/favicon.0lsa1vw2phr1z.ico`
- `.next/static/media/icon.05qzi9hl5od76.png`
- `.next/static/media/icon.0jvl_6y4ex4cs.svg`
- `.next/static/media/apple-icon.0qhkrdyfhtapr.png`
- le stesse quattro copie sono presenti anche sotto `.next/dev/static/media/`.

Sono presenti anche route, metadata, HTML/RSC prerenderizzati e bundle con i riferimenti o i tracciati del vecchio marchio. La ricerca per fingerprint ha trovato:

- 322 file sotto `apps/web/.next`;
- 11 file sotto `apps/admin/.next`;
- 11 artifact Turbo nel perimetro controllato.

Questi numeri sono copie/artifact contenenti un fingerprint, non 344 varianti grafiche diverse. Nessun artifact `.next` o Turbo contiene i nomi o i viewBox dei due nuovi SVG.

Le directory `.next` sono ignorate da Git e non vengono distribuite come sorgente, ma vanno eliminate e rigenerate localmente e in CI durante il cutover per impedire test falsati da output precedenti. La cache CDN pubblica riporta ancora oggetti vecchi; il problema primario resta comunque il contenuto del deployment corrente.

## Varianti storiche Git

Lo storico conferma diversi rebrand successivi:

| Famiglia | Generazioni distinte raggiungibili nello storico | Revisioni principali |
| --- | ---: | --- |
| `favicon.ico` | 5 | 2026-05-16, 07-15, 07-24, 07-27, 07-31 |
| `icon.png` | 4 | 2026-07-15, 07-24, 07-27, 07-31 |
| `apple-icon.png` | 4 | 2026-07-15, 07-24, 07-27, 07-31 |
| `icon.svg` | 2 | 2026-07-27, 07-31 |
| `EsigentaLogo` inline | 4 | 2026-07-24, 07-31, 08-14, 08-23 |
| `logo esigenta.svg` pubblico | 1 blob condiviso tra web e admin | aggiunto 2026-07-05, eliminato 2026-07-20 |

Questi blob storici non sono raggiungibili dal deployment corrente sulla base delle verifiche effettuate. Non vanno riscritti o rimossi dalla storia Git per una normale bonifica del brand: servono soltanto a spiegare le precedenti generazioni e non influenzano Google finche non sono pubblicate da un deployment o CDN.

## Collocazione corretta dei nuovi file

### Logo principale

Spostare il master da:

`apps/web/public/assets/images/home/logo-v1.svg`

a:

`apps/web/public/assets/brand/esigenta-logo.svg`

La cartella `home` e semanticamente errata per un asset globale. Il nome stabile senza versione e preferibile per l'identita corrente. Il componente condiviso `packages/ui/src/components/esigenta-logo.tsx` deve poi diventare l'unica API UI del marchio e adottare i tracciati del nuovo logo, cosi web, area impresa e admin cambiano insieme.

Attenzione: il file consegnato ha testo bianco su trasparenza ed e adatto soltanto a superfici scure. Prima del cutover serve anche una variante per superfici chiare, oppure un componente SVG che controlli i colori tramite token. Navbar, footer, area impresa e admin oggi usano prevalentemente superfici chiare.

### Favicon mostrata da Google

Il master candidato non deve restare in `public/assets/images/home`. Dopo aver corretto il canvas a un quadrato 1:1, la collocazione Next.js corretta e:

`apps/web/src/app/icon.svg`

cioe deve sostituire il vecchio file omonimo. Da quello stesso master vanno rigenerate, con grafica identica:

- `apps/web/src/app/icon.png` a 512x512;
- `apps/web/src/app/apple-icon.png` a 180x180;
- `apps/web/src/app/favicon.ico` almeno 32x32, preferibilmente multirisoluzione per compatibilita browser.

Non lasciare contemporaneamente codifiche con marchi diversi. Il nuovo `favicon-v1.svg` non e ancora idoneo cosi com'e per Google perche il viewBox non e 1:1. Google richiede un favicon quadrato e raccomanda una risoluzione superiore a 48x48.

Per il JSON-LD e preferibile pubblicare un asset logo dedicato, crawlable e leggibile su bianco, ad esempio:

`apps/web/public/assets/brand/esigenta-organization-logo.png`

con almeno 112x112 pixel, e aggiornare `Organization.logo` a quell'URL. Non puntare automaticamente al wordmark bianco trasparente: Google valuta l'immagine su fondo bianco.

## Sequenza raccomandata per la bonifica massiva

1. Normalizzare i due master: SVG ottimizzati, niente metadata/editor Inkscape superflui, canvas favicon quadrato, variante logo per fondo chiaro e asset Organization leggibile su bianco.
2. Aggiornare la fonte condivisa `EsigentaLogo`, verificando navbar, footer, area impresa pubblica/privata e admin.
3. Sostituire insieme `icon.svg`, `icon.png`, `favicon.ico` e `apple-icon.png` con derivati visivamente identici.
4. Spostare il logo globale in `public/assets/brand/` e aggiornare `Organization.logo` a un asset dedicato stabile.
5. Eliminare gli asset candidati dalla cartella `public/assets/images/home` dopo il trasferimento, cosi non restano doppioni versionati.
6. Eliminare e rigenerare `apps/web/.next`, `apps/admin/.next` e le cache Turbo rilevanti; eseguire una build pulita.
7. Verificare l'HTML prodotto: un solo sistema favicon coerente, nessun vecchio hash/tracciato, JSON-LD aggiornato e URL assoluti di produzione.
8. Distribuire e verificare `200`, MIME, dimensioni e hash di tutti gli URL pubblici. Evitare cambi frequenti dell'URL favicon.
9. In Google Search Console usare Ispezione URL sulla home e richiedere una nuova indicizzazione; controllare inoltre il Rich Results Test per `Organization`.
10. Attendere il nuovo crawl. Google dichiara che l'aggiornamento della favicon puo richiedere da alcuni giorni ad alcune settimane e non ne garantisce la visualizzazione immediata.

## Criteri di chiusura

La bonifica e completa soltanto quando:

- il vecchio fingerprint non compare nei sorgenti attivi, nei bundle o negli HTML prodotti;
- tutte le route favicon pubbliche mostrano lo stesso nuovo simbolo;
- `Organization.logo` non punta piu al vecchio `/icon.png`;
- web, area impresa e admin mostrano il nuovo wordmark con contrasto corretto;
- i due URL temporanei sotto `assets/images/home` non esistono piu;
- il servizio favicon Google restituisce il nuovo simbolo dopo il ricrawl;
- Search Console vede home e asset senza blocchi di scansione.
