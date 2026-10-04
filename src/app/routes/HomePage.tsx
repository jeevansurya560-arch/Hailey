import { Link } from 'react-router-dom'
import { Sparkles, BookOpen, ShieldCheck } from 'lucide-react'

export function HomePage() {
  return (
    <div className="space-y-8">
      {/* Hero Field Guide Card */}
      <div className="border border-[var(--ink)] bg-[var(--paper-2)] p-6 md:p-8 shadow-[var(--shadow-hard)]">
        <div className="flex items-center gap-2 mb-3">
          <span className="font-mono text-[11px] uppercase tracking-widest text-[var(--clay)] font-bold">
            Field Guide · Issue #1
          </span>
          <span className="h-1 w-1 rounded-full bg-[var(--ink-2)]" />
          <span className="font-mono text-[11px] text-[var(--ink-2)]">
            Autonomous Cultural Atlas
          </span>
        </div>

        <h1 className="font-serif text-3xl md:text-5xl font-bold tracking-tight text-[var(--ink)] leading-tight">
          Exploring the Living Tapestry of Global Culture
        </h1>

        <p className="mt-4 max-w-2xl text-base text-[var(--ink-2)] leading-relaxed">
          Hailey links underground movements, heritage traditions, and contemporary aesthetics into an open graph — verified onchain, curated by communities.
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Link
            to="/explore"
            className="border border-[var(--ink)] bg-[var(--clay)] px-4 py-2 font-mono text-xs uppercase tracking-wider text-[var(--paper)] transition-all hover:opacity-90 shadow-[2px_2px_0_var(--ink)]"
          >
            Explore Taxonomy
          </Link>
          <Link
            to="/login"
            className="border border-[var(--ink)] bg-[var(--paper)] px-4 py-2 font-mono text-xs uppercase tracking-wider text-[var(--ink)] transition-all hover:bg-[var(--paper-2)] shadow-[2px_2px_0_var(--ink)]"
          >
            Sign In / Register
          </Link>
        </div>
      </div>

      {/* Feature Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="border border-[var(--line)] bg-[var(--paper-2)] p-5">
          <div className="flex items-center gap-2 text-[var(--moss)] mb-2">
            <Sparkles className="h-4 w-4" />
            <h3 className="font-serif text-lg font-bold text-[var(--ink)]">Interest Graph</h3>
          </div>
          <p className="text-xs text-[var(--ink-2)] leading-relaxed">
            Follow threads connecting fashion, music, food, and traditions without algorithmic pigeonholing.
          </p>
        </div>

        <div className="border border-[var(--line)] bg-[var(--paper-2)] p-5">
          <div className="flex items-center gap-2 text-[var(--saffron)] mb-2">
            <BookOpen className="h-4 w-4" />
            <h3 className="font-serif text-lg font-bold text-[var(--ink)]">Curated Collections</h3>
          </div>
          <p className="text-xs text-[var(--ink-2)] leading-relaxed">
            Community-led archives documenting authentic stories and cultural context with source attribution.
          </p>
        </div>

        <div className="border border-[var(--line)] bg-[var(--paper-2)] p-5">
          <div className="flex items-center gap-2 text-[var(--onchain)] mb-2">
            <ShieldCheck className="h-4 w-4" />
            <h3 className="font-serif text-lg font-bold text-[var(--ink)]">Verified on Monad</h3>
          </div>
          <p className="text-xs text-[var(--ink-2)] leading-relaxed">
            Approved contributions are attested to Monad testnet, giving curators permanent attribution.
          </p>
        </div>
      </div>
    </div>
  )
}
