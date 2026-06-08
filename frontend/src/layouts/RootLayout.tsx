import type { ReactNode } from 'react';

interface RootLayoutProps {
  children: ReactNode;
}

/**
 * RootLayout
 *
 * Global page wrapper. Provides the application shell:
 * a minimal top header and a centred content area.
 * No sidebar, no navigation clutter per design requirements.
 */
export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <div className="flex min-h-dvh flex-col bg-neutral-50">
      {/* ─── Header ──────────────────────────────────────────── */}
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex h-14 max-w-5xl items-center px-6">
          <div className="flex items-center gap-2.5">
            {/* Wordmark */}
            <span className="text-sm font-semibold tracking-tight text-neutral-900">
              AED Explorer
            </span>
            {/* Badge */}
            <span className="rounded-full bg-accent-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-accent-600 border border-accent-200">
              Beta
            </span>
          </div>
        </div>
      </header>

      {/* ─── Main content ────────────────────────────────────── */}
      <main className="flex flex-1 flex-col">
        {children}
      </main>

      {/* ─── Footer ──────────────────────────────────────────── */}
      <footer className="border-t border-neutral-100 bg-white">
        <div className="mx-auto flex h-12 max-w-5xl items-center justify-between px-6">
          <p className="text-xs text-neutral-400">
            © {new Date().getFullYear()} AED Explorer
          </p>
          <p className="text-xs text-neutral-400">
            Powered by YAMNet
          </p>
        </div>
      </footer>
    </div>
  );
}
