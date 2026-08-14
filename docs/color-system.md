# Esigenta — Color System

**Stato:** attivo — descrive il sistema cromatico realmente in uso.
**Ambito:** design system cromatico di `apps/web`, `apps/admin` e `packages/ui`.
**Fonte di verità:** `packages/ui/src/styles/globals.css`. Questo documento
descrive quella fonte, non la anticipa né la sostituisce.

---

## 1. Principio guida

I colori non appartengono alle singole pagine o ai singoli componenti.
Appartengono a **ruoli del design system**.

Un contenitore è trasparente per impostazione predefinita. Riceve un
colore solo quando rappresenta una superficie con un ruolo preciso
(Page, Surface, Surface muted, o una superficie Brand ad alta enfasi).

Sono vietati:

- colori esadecimali o RGB inseriti direttamente nei componenti;
- token dedicati a una singola pagina;
- colori creati per rendere un blocco "più interessante";
- variazioni cromatiche non documentate qui;
- uso dei colori semantici (Error/Success/Warning) come decorazione.

---

## 2. Palette attiva

| Token | Valore | Ruolo |
|---|---:|---|
| `--eg-color-page` | `#FCFCFC` | Canvas generale della pagina |
| `--eg-color-app` | `#FCFCFC` | Canvas dell'area applicativa privata |
| `--eg-color-surface` | `#FFFFFF` | Card, pannelli e campi reali |
| `--eg-color-surface-muted` | `#DCE3E4` | Superfici secondarie, hover, stati neutri |
| `--eg-color-ink` | `#12181C` | Testo primario, gerarchia testuale principale |
| `--eg-color-text-muted` | `#676D70` | Testo secondario, gerarchia testuale subordinata |
| `--eg-color-border` | `#B7C4C8` | Bordi e separatori ordinari |
| `--eg-color-brand` | `#9FD3E8` | Dettagli, superfici e CTA Brand |
| `--eg-color-brand-hover` | `#2C7DA0` | Hover e testo Brand leggibile su superfici chiare |
| `--eg-color-brand-strong` | `#16385A` | Superfici identitarie e azioni ad alta enfasi |
| `--eg-color-brand-soft` | `#DEE8EF` | Selezioni e superfici brand leggere |
| `--eg-color-brand-on-dark` | `var(--eg-color-brand)` | Accenti leggibili sopra superfici scure |
| `--eg-color-on-brand` | `#FFFFFF` | Testo e icone sopra superfici Brand scure |
| `--eg-color-on-brand-muted` | `rgba(255, 255, 255, 0.76)` | Testo secondario sopra superfici Brand scure |
| `--eg-color-on-brand-border` | `rgba(255, 255, 255, 0.22)` | Bordi/separatori sopra superfici Brand scure |
| `--eg-color-accent` | `#C8402A` | Dettaglio caldo distintivo e puntuale |
| `--eg-color-action` | `var(--eg-color-brand)` | Pulsanti e CTA standard |
| `--eg-color-hero-emphasis` | `var(--eg-color-brand)` | Enfasi breve esclusivamente su superfici scure |

### Ruoli in dettaglio

- **Page** è il canvas generale: sfondo di `html`/`body` e dei wrapper di
  pagina. Non va usato per distinguere card interne.
- **Surface** è riservato a card, pannelli e campi reali (Input, Select,
  Textarea, Card, `.eg-panel`). Non va assegnato automaticamente a ogni
  contenitore.
- **Surface muted** è per superfici secondarie, hover e stati neutri
  (righe alternate, badge neutrali, sfondi di stato disattivato). Deve
  restare più raro di Surface.
- **Ink** e **Text muted** gestiscono la gerarchia testuale: Ink per
  testo primario e titoli, Text muted per testo secondario e metadati.
  Text muted non va usato per contenuti essenziali o azioni principali.
- **Brand strong** è il blu profondo delle superfici identitarie e del testo
  sopra CTA Brand chiare.
- Sulle superfici scure il contesto `eg-theme-dark` inverte la recipe: CTA
  chiara con testo Brand strong, senza cambiare il token globale Action.
- Nella Hero il contesto `eg-theme-hero` usa Brand per l'azione della ricerca:
  ciano più luminoso, appoggiato sul pannello Surface del form.
- **Brand** è il ciano chiaro delle CTA e dei dettagli. Il precedente Brand,
  ora `Brand hover`, governa gli hover e il testo Brand su superfici chiare.
- **Brand soft** è riservato a selezioni e superfici brand leggere (chip
  selezionati, badge, sfondi di stato attivo tenue), sempre abbinato a
  testo Brand strong.
- **On brand / On brand muted / On brand border** si usano esclusivamente
  sopra superfici Brand scure (vedi Eccezione Hero sotto).

---

## 3. Feedback semantico

Error, Success e Warning sono **esclusivamente stati semantici reali** —
non decorazione, non enfasi generica, non stati di avanzamento UI.

| Token | Valore | Ruolo |
|---|---:|---|
| `--eg-color-error` | `#8F3328` | Testo/icona di errore |
| `--eg-color-error-soft` | `#FBE9E5` | Sfondo box/badge di errore |
| `--eg-color-error-border` | `#E9B6AC` | Bordo box/badge di errore |
| `--eg-color-success` | `#285E45` | Testo/icona di successo |
| `--eg-color-success-soft` | `#E7F2EB` | Sfondo box/badge di successo |
| `--eg-color-success-border` | `#B8D6C4` | Bordo box/badge di successo |
| `--eg-color-warning` | `#8A5A12` | Testo/icona di avviso |
| `--eg-color-warning-soft` | `#FAF3E2` | Sfondo box/badge di avviso |
| `--eg-color-warning-border` | `#E6C789` | Bordo box/badge di avviso |

Non usare Brand o Accent per rappresentare uno di questi stati, e non
usare questi token per stati che non siano realmente di errore, successo
o avviso.

---

## 4. Regola Accent

`--eg-color-accent: #C8402A` — un rosso caldo usato **solo** come dettaglio
distintivo puntuale.

- Può essere colore di **testo** solo per micro-titoli e dettagli brevi sopra
  Page o Surface; mai per testo esteso.
- Sopra superfici scure si usa `--eg-color-brand-on-dark`, non Accent.
- Può inoltre essere usato come bordo, marker o piccolo riempimento grafico.
- Non va mai usato per CTA, paragrafi, o per rappresentare errori,
  successi o warning.

---

## 5. Eccezione identitaria — Hero

La Hero della home è **l'unica grande superficie identitaria colorata**
prevista nel sito.

| Ruolo | Token | Valore |
|---|---|---|
| Sfondo Hero | `--eg-color-brand-strong` | `#16385A` |
| Testo principale su Hero | `--eg-color-on-brand` | `#FFFFFF` |
| Testo secondario su Hero | `--eg-color-on-brand-muted` | `rgba(255, 255, 255, 0.76)` |
| Bordi e separatori su Hero | `--eg-color-on-brand-border` | `rgba(255, 255, 255, 0.22)` |
| Form e pannelli sopra la Hero | `--eg-color-surface` | `#FFFFFF` |
| Azione principale nel form | `--eg-color-brand` | `#9FD3E8` |

Regole:

- il limite "Intera famiglia Brand: 3–5% massimo" della distribuzione
  visiva riguarda l'uso del Brand come accento nelle superfici neutre;
  non si applica alla Hero;
- la Hero è un'**eccezione identitaria controllata**, non un precedente:
  non autorizza altre sezioni, card o contenitori colorati di Brand
  altrove nel sito;
- il resto del sito deve restare prevalentemente Page e Surface.

---

## 6. Regole architetturali

- Usare sempre i token semantici definiti qui — mai un valore HEX/RGB
  locale dentro un componente o una pagina.
- I default cromatici vivono nel design system (`packages/ui`), non nei
  singoli consumer.
- I consumer aggiungono colore solo per vere varianti contestuali (uno
  stato selezionato, un caso d'uso specifico), mai per ridefinire un
  default già coperto da un token esistente.
- Non introdurre un nuovo token senza aggiornare sia `globals.css` sia
  questo documento nello stesso passaggio.
