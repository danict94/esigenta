# Documentazione

Questa cartella separa le fonti tecniche correnti dalla memoria storica del
progetto.

## Fonti canoniche

Le decisioni tecniche correnti si prendono da:

- `docs/architetture/**`
- `docs/seo-navigation/**`
- `docs/taxonomy.md`
- `docs/design/HOME_DESIGN_SYSTEM.md`
- `docs/setup/SUPER_ADMIN_BOOTSTRAP.md`

Per il codice applicativo valgono anche i contratti locali:

- `apps/web/AGENTS.md`
- `apps/web/CLAUDE.md`, solo come ponte se rimanda alle regole correnti

## Documenti operativi

Restano attivi solo se descrivono invarianti, audit ancora utili o controlli da
eseguire oggi:

- `docs/domain-invariants/**`
- `docs/pre-release/**`

## Archivio storico

`docs/archive-legacy/**` contiene audit, report, roadmap superate, snapshot e
note di refoundation conservate per contesto storico.

I documenti in `docs/archive-legacy/**` non sono fonte canonica e non devono
guidare nuove decisioni tecniche. Se un documento archiviato contraddice una
fonte canonica, prevale la fonte canonica.
