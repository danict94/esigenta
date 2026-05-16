export default function SelezionaImpresaPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-surface-primary px-6">
      <div className="max-w-md rounded-2xl border border-border-secondary bg-surface-primary p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-text-primary">
          Seleziona impresa
        </h1>

        <p className="mt-3 text-sm leading-6 text-text-secondary">
          Il tuo account è collegato a più imprese. La selezione azienda sarà
          gestita nel prossimo step.
        </p>
      </div>
    </main>
  )
}