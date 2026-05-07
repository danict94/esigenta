export function Navbar() {
  return (
    <header className="border-b border-neutral-200">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6 lg:px-8">
        <div className="text-lg font-semibold tracking-tight">
          FixPro
        </div>

        <nav className="hidden items-center gap-8 md:flex">
          <a
            href="#"
            className="text-sm text-neutral-600 transition-colors hover:text-neutral-950"
          >
            Trova professionisti
          </a>

          <a
            href="#"
            className="text-sm text-neutral-600 transition-colors hover:text-neutral-950"
          >
            Come funziona
          </a>

          <a
            href="#"
            className="text-sm text-neutral-600 transition-colors hover:text-neutral-950"
          >
            Per le imprese
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <a
            href="#"
            className="text-sm text-neutral-700 transition-colors hover:text-neutral-950"
          >
            Accedi
          </a>

          <a
            href="#"
            className="rounded-full bg-neutral-950 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-800"
          >
            Inizia
          </a>
        </div>
      </div>
    </header>
  )
}