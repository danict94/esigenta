Sì, prepariamolo bene. Questa feature non è “un bottone compra”: è un sistema economico con concorrenza, ledger, limiti e visibilità contatti. Va fatta a pass piccoli, ma senza rimandare il nucleo.

Dal quadro DB attuale sappiamo due cose utili: il modello identità è già separato correttamente tra admin, impresa e cliente soft, e `Request.creditCost` esiste ma non è ancora valorizzato/gestito. L’audit segnala anche che le richieste impresa oggi sono globali e non ancora filtrate per servizi/raggio, e che servono indici per query reali su richieste. 

# Obiettivo finale

Vogliamo arrivare a questo:

```txt
Admin:
- imposta costo crediti della richiesta
- imposta limite massimo imprese che possono sbloccarla
- gestisce pacchetti crediti acquistabili

Impresa:
- compra pacchetti crediti
- vede saldo crediti
- vede costo richiesta
- sblocca richiesta se ha crediti e se ci sono posti disponibili
- vede contatti cliente solo dopo sblocco

Sistema:
- impedisce doppio acquisto contemporaneo dell’ultimo posto
- non scala crediti se la richiesta è già piena
- non scala crediti due volte se la stessa impresa ha già sbloccato
- mantiene ledger/audit dei crediti
```

# Pass operativi

Io lo dividerei in **9 pass**.

## Pass 0 — P0 sicurezza seed admin (Done) 

Prima togliamo credenziali hardcoded da `seed_auth.ts`. È piccolo ma va fatto prima di lavorare sui soldi. L’audit lo marca P0. 

## Pass 1 — DB foundation crediti/sblocchi

Migration con modelli:

```txt
CreditPackage
CompanyCreditAccount
CompanyCreditTransaction
CreditOrder
RequestUnlock
```

e su `Request`:

```txt
creditCost Int
maxUnlocks Int
unlockCount Int
```

`creditCost` esiste già, quindi va solo consolidato se presente. `maxUnlocks` e `unlockCount` servono per il limite.

## Pass 2 — dominio atomico `unlockRequestForCompany`

Qui si risolve il problema più importante: **ultimo posto concorrente**.

La logica deve essere una transazione:

```txt
1. se Company ha già sbloccato → ritorna already_unlocked, non scala crediti
2. update condizionale Request:
   unlockCount < maxUnlocks
   increment unlockCount di 1
3. se update non passa → sold_out, non scala crediti
4. update condizionale CompanyCreditAccount:
   balance >= creditCost
   decrement balance
5. se non passa → insufficient_credits, rollback dello slot
6. crea CompanyCreditTransaction SPEND
7. crea RequestUnlock unique requestId+companyId
8. commit
```

Questo evita che due imprese comprino insieme l’ultimo posto.

## Pass 3 — admin: economia richiesta

Admin deve poter impostare:

```txt
creditCost
maxUnlocks
```

Regole:

```txt
creditCost >= 0
maxUnlocks >= unlockCount
se unlockCount è già 2, admin non può mettere maxUnlocks a 1
```

## Pass 4 — admin: pacchetti crediti

Admin CRUD minimo:

```txt
nome pacchetto
crediti
prezzo
valuta
attivo/non attivo
ordinamento
```

Per ora possiamo fare admin UI e DB. Il pagamento vero nel pass successivo.

## Pass 5 — acquisto pacchetti impresa

Area impresa:

```txt
saldo crediti
pacchetti disponibili
compra pacchetto
```

Qui serve `CreditOrder` con status:

```txt
PENDING
PAID
CANCELED
FAILED
```

Quando il pagamento è confermato, accrediti crediti via ledger.

## Pass 6 — provider pagamento/webhook

Probabilmente Stripe, ma va isolato. Requisiti:

```txt
webhook idempotente
mai accreditare due volte lo stesso ordine
providerSessionId unique
providerPaymentIntentId unique se disponibile
```

## Pass 7 — UI sblocco richiesta impresa

In lista/dettaglio richiesta:

```txt
Costo: X crediti
Posti rimasti: maxUnlocks - unlockCount
Saldo azienda
CTA Sblocca contatti
```

Se già sbloccata:

```txt
Contatti visibili
```

Se piena:

```txt
Richiesta non più disponibile
```

## Pass 8 — guard contatti

I contatti cliente devono essere visibili solo se:

```txt
RequestUnlock exists for companyId + requestId
```

Quindi non basta che la richiesta sia approvata. Prima dello sblocco mostri dati parziali, dopo sblocco mostri:

```txt
customerName
customerEmail
customerPhone
```

## Pass 9 — audit, refund, edge cases

Dopo chiusura MVP:

```txt
refund manuale admin
adjustment crediti admin
log/audit economico
pulizia indici
test race condition
```

# Schema mentale consigliato

## Request

```prisma
creditCost Int @default(0)
maxUnlocks Int @default(5)
unlockCount Int @default(0)
```

`creditCost` va copiato anche dentro `RequestUnlock` e `CompanyCreditTransaction`, perché se admin cambia costo dopo, lo sblocco storico deve sapere quanto è stato pagato.

## RequestUnlock

```txt
requestId
companyId
unlockedByUserId
creditCost
createdAt

unique(requestId, companyId)
index(requestId)
index(companyId)
```

## CompanyCreditAccount

```txt
companyId unique/id
balance
lifetimePurchased
lifetimeSpent
```

## CompanyCreditTransaction

```txt
companyId
amount
type PURCHASE/SPEND/REFUND/ADMIN_ADJUSTMENT
requestId?
packageId?
orderId?
metadata?
createdAt
```

Io userei `amount` firmato:

```txt
+100 acquisto
-20 sblocco richiesta
+20 rimborso
```

ma con `type` chiaro.

## CreditPackage

```txt
name
credits
priceCents
currency
isActive
sortOrder
```

## CreditOrder

```txt
companyId
packageId
credits
amountCents
currency
status
provider
providerSessionId unique?
providerPaymentIntentId unique?
paidAt
createdAt
updatedAt
```

# Prima cosa da fare

Io farei **Pass 0 + Pass 1 separati**.

Non mischiare rimozione password hardcoded e sistema crediti nello stesso pass. Però li facciamo subito in sequenza.

## Primo prompt: P0 seed admin

Sistema SOLO P0 sicurezza seed admin.

Contesto:
Audit DB ha rilevato che `packages/db/seed/seed_auth.ts` contiene credenziali bootstrap hardcoded.
Va rimosso prima di implementare il sistema crediti.

NON TOCCARE:

* schema.prisma
* migrations
* Better Auth core
* admin guards
* company onboarding
* customer soft
* payments/crediti
* taxonomy
* area impresa
* richieste

TASK:
Aggiorna `packages/db/seed/seed_auth.ts` per leggere da env:

* `FIXPRO_SUPER_ADMIN_EMAIL`
* `FIXPRO_SUPER_ADMIN_PASSWORD`
* `FIXPRO_SUPER_ADMIN_NAME` opzionale

Regole:

* nessuna password/email hardcoded nel file
* se email o password mancano, fallisci con errore chiaro
* non loggare password
* continua a creare/aggiornare User Better Auth come prima
* continua a creare/promuovere `AdminProfile SUPER_ADMIN`
* mantieni idempotenza: rilanciare il seed non deve creare duplicati
* non cambiare DB schema

Aggiorna commento nel file indicando:

* env richieste
* comando:
  `pnpm --filter @fixpro/db seed:auth`

Verifica:

* `pnpm.cmd --filter @fixpro/db typecheck`

Output:

1. file modificato
2. env richieste
3. comportamento seed
4. conferma nessuna credenziale hardcoded
5. comando eseguito

## Secondo prompt: DB foundation crediti

Dopo P0 farei il primo vero pass crediti:

Implementa SOLO DB foundation per crediti e sblocco richieste.

Obiettivo:
Preparare schema Prisma per:

* pacchetti crediti
* saldo crediti impresa
* ledger transazioni crediti
* ordini acquisto pacchetti
* sblocco richiesta da parte di una impresa
* limite massimo imprese che possono sbloccare una richiesta

NON implementare ancora:

* UI admin
* UI impresa
* Stripe/payment provider
* webhook
* unlock action
* visibilità contatti
* matching richieste
* refund

NON TOCCARE:

* Customer soft
* funnel cliente
* Better Auth core
* admin guards
* area impresa richieste
* taxonomy source/seed
* email Resend

TASK 1 — schema
Aggiorna `packages/db/prisma/schema.prisma`.

Aggiungi enum:

```prisma
enum CreditTransactionType {
  PURCHASE
  SPEND
  REFUND
  ADMIN_ADJUSTMENT
}

enum CreditOrderStatus {
  PENDING
  PAID
  CANCELED
  FAILED
}
```

Aggiungi modelli:

```prisma
model CreditPackage {
  id          String   @id @default(cuid())
  name        String
  description String?
  credits     Int
  priceCents  Int
  currency    String   @default("EUR")
  isActive    Boolean  @default(true)
  sortOrder   Int      @default(0)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  orders       CreditOrder[]
  transactions CompanyCreditTransaction[]

  @@index([isActive, sortOrder])
}

model CompanyCreditAccount {
  companyId String @id

  balance           Int @default(0)
  lifetimePurchased Int @default(0)
  lifetimeSpent     Int @default(0)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  company Company @relation(fields: [companyId], references: [id], onDelete: Cascade)

  @@index([balance])
}

model CreditOrder {
  id String @id @default(cuid())

  companyId String
  packageId String

  credits    Int
  amountCents Int
  currency   String @default("EUR")
  status     CreditOrderStatus @default(PENDING)

  provider String?
  providerSessionId String? @unique
  providerPaymentIntentId String? @unique

  paidAt DateTime?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  company Company @relation(fields: [companyId], references: [id], onDelete: Cascade)
  package CreditPackage @relation(fields: [packageId], references: [id], onDelete: Restrict)

  transactions CompanyCreditTransaction[]

  @@index([companyId, status])
  @@index([packageId])
  @@index([status, createdAt])
}

model CompanyCreditTransaction {
  id String @id @default(cuid())

  companyId String
  requestId String?
  packageId String?
  orderId   String?

  type CreditTransactionType
  amount Int

  balanceAfter Int?
  note String?
  metadata Json?

  createdAt DateTime @default(now())

  company Company @relation(fields: [companyId], references: [id], onDelete: Cascade)
  request Request? @relation(fields: [requestId], references: [id], onDelete: SetNull)
  package CreditPackage? @relation(fields: [packageId], references: [id], onDelete: SetNull)
  order CreditOrder? @relation(fields: [orderId], references: [id], onDelete: SetNull)

  @@index([companyId, createdAt])
  @@index([requestId])
  @@index([packageId])
  @@index([orderId])
  @@index([type, createdAt])
}

model RequestUnlock {
  id String @id @default(cuid())

  requestId String
  companyId String
  unlockedByUserId String?

  creditCost Int

  createdAt DateTime @default(now())

  request Request @relation(fields: [requestId], references: [id], onDelete: Cascade)
  company Company @relation(fields: [companyId], references: [id], onDelete: Cascade)
  unlockedByUser User? @relation(fields: [unlockedByUserId], references: [id], onDelete: SetNull)

  @@unique([requestId, companyId])
  @@index([requestId])
  @@index([companyId])
  @@index([unlockedByUserId])
}
```

Aggiorna `Company` con relation:

* `creditAccount CompanyCreditAccount?`
* `creditOrders CreditOrder[]`
* `creditTransactions CompanyCreditTransaction[]`
* `requestUnlocks RequestUnlock[]`

Aggiorna `Request`:

* se `creditCost Int?` esiste già, trasformalo in `creditCost Int @default(0)` se compatibile
* aggiungi `maxUnlocks Int @default(5)`
* aggiungi `unlockCount Int @default(0)`
* aggiungi relation:

  * `creditTransactions CompanyCreditTransaction[]`
  * `unlocks RequestUnlock[]`

Aggiorna `User` con relation:

* `requestUnlocks RequestUnlock[]`

Aggiungi indici `Request`:

* `@@index([status, createdAt])`
* `@@index([customerId, createdAt])`
* `@@index([latitude, longitude])`
* valutare `@@index([creditCost])` solo se utile, altrimenti no.

TASK 2 — migration
Esegui:

* `pnpm.cmd --filter @fixpro/db exec prisma format`
* `pnpm.cmd --filter @fixpro/db exec prisma validate`
* `pnpm.cmd --filter @fixpro/db exec prisma migrate dev --name credits-foundation`
* `pnpm.cmd --filter @fixpro/db db:generate`
* `pnpm.cmd --filter @fixpro/db typecheck`

TASK 3 — no business logic
Non creare funzioni unlock.
Non creare UI.
Non creare seed pacchetti.
Solo schema/migration/typecheck.

OUTPUT:

1. file modificati
2. migration creata
3. modelli/enum aggiunti
4. campi Request aggiunti
5. relazioni Company/Request/User aggiunte
6. comandi eseguiti
7. warning

Dopo questi due pass, passiamo al cuore: `unlockRequestForCompany()` atomico. Quello è il pass più importante per evitare il problema dei due utenti sull’ultimo posto.
