import React from 'react'
import { Link } from 'react-router-dom'
import { ShieldCheck, ArrowLeft, BookOpen, Lock, Scale, Sparkles } from 'lucide-react'

export function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4">
      {/* Header */}
      <div className="border border-[var(--ink)] bg-[var(--paper-2)] p-6 md:p-8 shadow-[var(--shadow-hard)] space-y-4">
        <Link
          to="/signup"
          className="inline-flex items-center gap-1.5 font-mono text-xs text-[var(--clay)] hover:underline"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Registration</span>
        </Link>

        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-[var(--clay)] text-[var(--paper)]">
            Terms of Service
          </span>
          <span className="font-mono text-[10px] text-emerald-800 font-semibold flex items-center gap-1">
            <ShieldCheck className="h-3 w-3" />
            Version 1.0 (Active)
          </span>
        </div>

        <h1 className="font-serif text-3xl md:text-4xl font-bold tracking-tight text-[var(--ink)]">
          Hailey Contributor Terms & Conditions
        </h1>
        <p className="text-xs md:text-sm text-[var(--ink-2)] font-mono">
          Last revised: October 2026 · Autonomous Cultural Atlas & Living Field Guide
        </p>
      </div>

      {/* Content Sections */}
      <div className="border border-[var(--line)] bg-[var(--paper)] p-6 md:p-10 space-y-8 text-[var(--ink)] leading-relaxed text-sm">
        {/* Section 1 */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 border-b border-[var(--line)] pb-2 text-[var(--clay)] font-serif text-xl font-bold">
            <BookOpen className="h-5 w-5 shrink-0" />
            <h2>1. Living Field Guide & Contributor Agreement</h2>
          </div>
          <p>
            Welcome to Hailey. Hailey is an autonomous cultural atlas and decentralized living field guide dedicated to cataloging global tangible and intangible cultural heritages, sacred calendars, indigenous rituals, folklore, and anthropological records with verifiable provenance.
          </p>
          <p>
            By creating an account, registering a contributor handle, or accessing our services, you agree to comply with and be bound by these Terms and Conditions. If you do not agree to these terms, please do not use the service.
          </p>
        </section>

        {/* Section 2 */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 border-b border-[var(--line)] pb-2 text-[var(--clay)] font-serif text-xl font-bold">
            <Lock className="h-5 w-5 shrink-0" />
            <h2>2. Contributor Handles & Account Security</h2>
          </div>
          <p>
            Contributor handles are unique identifiers across the Hailey protocol. Handles must be 3 to 20 alphanumeric characters or underscores and cannot infringe upon trademarked names or impersonate cultural custodians, institutions, or other contributors.
          </p>
          <p>
            You are responsible for maintaining the security of your authentication credentials. Hailey utilizes Supabase Auth with Row-Level Security to isolate and protect your account data.
          </p>
        </section>

        {/* Section 3 */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 border-b border-[var(--line)] pb-2 text-[var(--clay)] font-serif text-xl font-bold">
            <Scale className="h-5 w-5 shrink-0" />
            <h2>3. Age Eligibility & Minor Protection Policy</h2>
          </div>
          <p>
            Hailey strictly enforces an age-restricted safety architecture. Content classified as <strong>ADULT_18_PLUS</strong> or sensitive historical rituals containing intense themes is restricted exclusively to verified adult accounts:
          </p>
          <ul className="list-disc pl-6 space-y-1.5 font-mono text-xs text-[var(--ink-2)]">
            <li>
              <strong>Self-Declared Date of Birth:</strong> Entering a date of birth during registration establishes self-declared age for safety gating, but does not grant automatic verified adult status.
            </li>
            <li>
              <strong>Minor Accounts:</strong> Accounts for users under 18 years of age have complete access to all general-audience heritage feeds, community taxonomies, and astronomical calendars, but are strictly prohibited from viewing or publishing 18+ content (fail-closed policy).
            </li>
            <li>
              <strong>OAuth Invariant:</strong> Third-party sign-in providers (such as Google OAuth) do not bypass age classification or content safety policies.
            </li>
          </ul>
        </section>

        {/* Section 4 */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 border-b border-[var(--line)] pb-2 text-[var(--clay)] font-serif text-xl font-bold">
            <Sparkles className="h-5 w-5 shrink-0" />
            <h2>4. Cryptographic Provenance & Monad Attestations</h2>
          </div>
          <p>
            Contributions accepted into curated archives may generate domain-separated cryptographic attestations (Keccak-256 hashes) anchored to the Monad Testnet ledger. These attestations record permanent academic citations and media provenance without recording private personal identification information or full dates of birth on-chain.
          </p>
        </section>

        {/* Section 5 */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 border-b border-[var(--line)] pb-2 text-[var(--clay)] font-serif text-xl font-bold">
            <ShieldCheck className="h-5 w-5 shrink-0" />
            <h2>5. Content Safety & Community Guidelines</h2>
          </div>
          <p>
            All submitted media is analyzed by Hailey's Phase 5 graphic content moderation system. Content containing hate speech, harassment, illegal material, or non-educational graphic violence is strictly blocked from the protocol.
          </p>
        </section>
      </div>

      {/* Footer Nav */}
      <div className="flex items-center justify-between font-mono text-xs text-[var(--ink-2)]">
        <Link to="/privacy" className="text-[var(--clay)] hover:underline">
          Read Privacy Policy →
        </Link>
        <Link to="/signup" className="border border-[var(--ink)] bg-[var(--paper-2)] px-3 py-1.5 shadow-[2px_2px_0_var(--ink)] hover:bg-[var(--paper)]">
          Continue to Sign Up
        </Link>
      </div>
    </div>
  )
}

export default TermsPage
