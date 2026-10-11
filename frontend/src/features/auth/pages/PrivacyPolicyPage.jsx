import React from 'react'
import { Link } from 'react-router-dom'
import { ShieldCheck, ArrowLeft, Lock, Eye, Database, Server, KeyRound } from 'lucide-react'

export function PrivacyPolicyPage() {
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
          <span className="font-mono text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-[var(--moss)] text-[var(--paper)]">
            Privacy Policy
          </span>
          <span className="font-mono text-[10px] text-emerald-800 font-semibold flex items-center gap-1">
            <ShieldCheck className="h-3 w-3" />
            Zero-Leakage Data Minimization
          </span>
        </div>

        <h1 className="font-serif text-3xl md:text-4xl font-bold tracking-tight text-[var(--ink)]">
          Hailey Privacy & Data Architecture
        </h1>
        <p className="text-xs md:text-sm text-[var(--ink-2)] font-mono">
          Last revised: October 2026 · Autonomous Cultural Atlas Privacy Standard
        </p>
      </div>

      {/* Content Sections */}
      <div className="border border-[var(--line)] bg-[var(--paper)] p-6 md:p-10 space-y-8 text-[var(--ink)] leading-relaxed text-sm">
        {/* Section 1: Core Principles */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 border-b border-[var(--line)] pb-2 text-[var(--clay)] font-serif text-xl font-bold">
            <Lock className="h-5 w-5 shrink-0" />
            <h2>1. Privacy Principles & Data Minimization</h2>
          </div>
          <p>
            At Hailey, privacy is not an afterthought; it is built into our core cryptographic and database architecture. We collect only the minimum data strictly required to provide authentic cultural indexing and protect minors from age-inappropriate content.
          </p>
        </section>

        {/* Section 2: Zero-Knowledge Preference Privacy & RLS */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 border-b border-[var(--line)] pb-2 text-[var(--clay)] font-serif text-xl font-bold">
            <Database className="h-5 w-5 shrink-0" />
            <h2>2. Zero-Knowledge Preference Privacy (RLS Enforced)</h2>
          </div>
          <p>
            Your reading habits, exploring tags, interest vectors, and interaction histories are protected by strict PostgreSQL Row-Level Security (RLS) policies. Only your authenticated user session can read or modify your private interest profile.
          </p>
          <div className="border border-[var(--line)] bg-[var(--paper-2)] p-4 font-mono text-xs text-[var(--ink-2)] space-y-1">
            <p>✓ Interest vector isolation: Private vectors cannot be scraped or enumerated.</p>
            <p>✓ No behavioral tracking across third-party networks or ad brokers.</p>
            <p>✓ Zero algorithmic lock-in or invasive targeted advertising.</p>
          </div>
        </section>

        {/* Section 3: Date of Birth & Age Protection */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 border-b border-[var(--line)] pb-2 text-[var(--clay)] font-serif text-xl font-bold">
            <Eye className="h-5 w-5 shrink-0" />
            <h2>3. Date of Birth & Age Verification Privacy</h2>
          </div>
          <p>
            To protect minors under international child safety standards while respecting contributor privacy:
          </p>
          <ul className="list-disc pl-6 space-y-1.5 font-mono text-xs text-[var(--ink-2)]">
            <li>
              <strong>No Public DOB Exposure:</strong> Full dates of birth are never published in public profile cards, public API responses, or blockchain transactions.
            </li>
            <li>
              <strong>Minimal Eligibility Status:</strong> The database records only an authoritative eligibility state (<code>UNVERIFIED</code>, <code>MINOR</code>, <code>ADULT</code>, <code>REQUIRES_REVIEW</code>) without persisting unneeded raw identity documents.
            </li>
            <li>
              <strong>Non-Bypassable:</strong> Google OAuth and third-party login providers start in <code>UNVERIFIED</code> status to guarantee children are not exposed to mature archives.
            </li>
          </ul>
        </section>

        {/* Section 4: Onchain Privacy */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 border-b border-[var(--line)] pb-2 text-[var(--clay)] font-serif text-xl font-bold">
            <Server className="h-5 w-5 shrink-0" />
            <h2>4. Onchain Cryptographic Privacy</h2>
          </div>
          <p>
            Hailey's Monad Testnet smart contracts store only cryptographic content hashes (Keccak-256) of verified cultural citations and collection contributions. Personally Identifiable Information (PII), email addresses, passwords, and identity documents are never written to any blockchain ledger.
          </p>
        </section>

        {/* Section 5: Authentication & Google OAuth */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 border-b border-[var(--line)] pb-2 text-[var(--clay)] font-serif text-xl font-bold">
            <KeyRound className="h-5 w-5 shrink-0" />
            <h2>5. Authentication & Google OAuth Scopes</h2>
          </div>
          <p>
            When you sign in using Google, Hailey requests only the minimal public profile information (name, email address, and avatar) necessary to bootstrap your contributor profile. We do not access your Google contacts, Google Drive files, or any other Google services.
          </p>
        </section>
      </div>

      {/* Footer Nav */}
      <div className="flex items-center justify-between font-mono text-xs text-[var(--ink-2)]">
        <Link to="/terms" className="text-[var(--clay)] hover:underline">
          ← View Terms & Conditions
        </Link>
        <Link to="/signup" className="border border-[var(--ink)] bg-[var(--paper-2)] px-3 py-1.5 shadow-[2px_2px_0_var(--ink)] hover:bg-[var(--paper)]">
          Continue to Sign Up
        </Link>
      </div>
    </div>
  )
}

export default PrivacyPolicyPage
