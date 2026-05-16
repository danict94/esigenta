import type { ReactNode } from 'react'

import { Navbar } from '../navigation/navbar'
import { Footer } from './footer'

type PublicShellProps = {
  children: ReactNode
}

export function PublicShell({
  children,
}: PublicShellProps) {
  return (
    <div className="min-h-screen bg-surface-primary text-text-primary">
      <Navbar />

      <main>
        {children}
      </main>

      <Footer />
    </div>
  )
}
