import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  ShieldCheck, 
  Lock, 
  Database, 
  Eye, 
  ArrowLeft, 
  ArrowRight, 
  ExternalLink, 
  CheckCircle2, 
  Globe, 
  FileCheck
} from 'lucide-react'
import BlurText from '@/components/BlurText'

function BotanicalEmblem({ className = "h-6 w-6 text-[#6A1F35]" }) {
  return (
    <svg className={className} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M18 32V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M18 8C14 11 9 13 5 13C8 16 13 16 18 17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M18 8C22 11 27 13 31 13C28 16 23 16 18 17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M18 17C13.5 19.5 8.5 20.5 5 22C8.5 24 13.5 23 18 24" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M18 17C22.5 19.5 27.5 20.5 31 22C27.5 24 22.5 23 18 24" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="18" cy="5" r="2" fill="currentColor"/>
    </svg>
  )
}

const PRIVACY_SECTIONS = [
  { id: 'guiding-principles', title: '1. Guiding Principles & Cultural Sovereignty' },
  { id: 'data-collection', title: '2. Information We Collect' },
  { id: 'data-usage', title: '3. How We Utilize Information' },
  { id: 'community-boundaries', title: '4. Cultural Community Boundaries' },
  { id: 'blockchain-transparency', title: '5. Decentralized Ledgers & Blockchain' },
  { id: 'storage-security', title: '6. Storage & Security Safeguards' },
  { id: 'member-rights', title: '7. Your Rights & Data Portability' },
  { id: 'stewardship-contact', title: '8. Data Stewardship & Inquiries' },
]

export function PrivacyPage() {
  const [activeSection, setActiveSection] = useState('guiding-principles')

  const scrollToSection = (id) => {
    setActiveSection(id)
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <div className="min-h-screen bg-[#FAF6EF] py-10 sm:py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-10">
        
        {/* Navigation Breadcrumb & Back to Auth Link */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E0D4C5] pb-4">
          <div className="flex items-center gap-2 text-xs font-sans text-[#34252A]/70">
            <Link to="/" className="hover:text-[#6A1F35] transition-colors">Home</Link>
            <span>/</span>
            <span className="text-[#6A1F35] font-semibold">Privacy Policy</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-[#34252A]/80 hover:text-[#6A1F35] transition-colors px-3 py-1.5 rounded-lg border border-[#E0D4C5] bg-[#FAF6EF] hover:bg-[#F0E7DA]"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Sign In</span>
            </Link>
            <Link
              to="/terms"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-[#FAF6EF] bg-[#6A1F35] hover:bg-[#511528] px-3.5 py-1.5 rounded-lg transition-colors shadow-sm"
            >
              <span>View Terms of Service</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Editorial Header */}
        <div className="space-y-4 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#B08A50]/15 text-[#B08A50] text-xs font-semibold uppercase tracking-widest">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Data Protection & Sovereign Archive</span>
          </div>

          <div className="font-serif text-3xl sm:text-5xl text-[#34252A] tracking-tight">
            <BlurText
              text="Privacy Policy"
              delay={35}
              animateBy="words"
              direction="top"
            />
          </div>

          <p className="text-sm sm:text-base text-[#34252A]/80 leading-relaxed font-sans">
            Effective Date: October 2026 · We uphold the highest ethical standards in protecting your personal identity and community heritage records. Learn how your data is stewarded across the Hailey ecosystem.
          </p>
        </div>

        {/* Key Highlights Card (Neumorphic Callout) */}
        <div className="neu-card rounded-2xl bg-[#F0E7DA]/60 border border-[#E0D4C5] p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-2.5 text-[#6A1F35]">
            <BotanicalEmblem className="h-6 w-6" />
            <h3 className="font-serif font-bold text-lg text-[#34252A]">
              Respecting Indigenous & Cultural Data Sovereignty
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-[#34252A]/80 leading-relaxed max-w-4xl">
            We hold personal information with the same reverence we accord to the cultural traditions preserved on Hailey. We do not sell your personal data or exploit community narratives for predatory advertising. Your stories remain yours.
          </p>
        </div>

        {/* Main Content Grid: Sidebar Table of Contents + Legal Text */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Sticky Sidebar Navigation (Desktop) */}
          <div className="lg:col-span-4 sticky top-24 space-y-4">
            <div className="neu-card rounded-2xl bg-white/70 border border-[#E0D4C5] p-5 space-y-3">
              <span className="text-[11px] font-sans font-bold uppercase tracking-wider text-[#B08A50] block">
                Policy Sections
              </span>
              <nav className="space-y-1">
                {PRIVACY_SECTIONS.map((sec) => (
                  <button
                    key={sec.id}
                    onClick={() => scrollToSection(sec.id)}
                    className={`w-full text-left px-3 py-2 text-xs rounded-xl font-medium transition-all flex items-center justify-between ${
                      activeSection === sec.id
                        ? 'bg-[#6A1F35] text-[#FAF6EF] shadow-sm font-semibold'
                        : 'text-[#34252A]/80 hover:bg-[#F0E7DA] hover:text-[#6A1F35]'
                    }`}
                  >
                    <span className="truncate">{sec.title}</span>
                    {activeSection === sec.id && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#B08A50] shrink-0 ml-1" />
                    )}
                  </button>
                ))}
              </nav>

              <div className="pt-4 border-t border-[#E0D4C5]/70 space-y-2">
                <span className="text-[11px] font-sans font-bold uppercase tracking-wider text-[#34252A]/60 block">
                  Related Documents
                </span>
                <Link
                  to="/terms"
                  className="w-full inline-flex items-center justify-between px-3 py-2 text-xs rounded-xl bg-[#FAF6EF] border border-[#E0D4C5] text-[#34252A] hover:border-[#6A1F35]/40 transition-colors"
                >
                  <span>Terms of Service</span>
                  <ExternalLink className="w-3.5 h-3.5 text-[#B08A50]" />
                </Link>
                <Link
                  to="/signup"
                  className="w-full inline-flex items-center justify-between px-3 py-2 text-xs rounded-xl bg-[#6A1F35]/10 border border-[#6A1F35]/20 text-[#6A1F35] font-semibold hover:bg-[#6A1F35]/15 transition-colors"
                >
                  <span>Join the Community</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>

          {/* Privacy Body Articles */}
          <div className="lg:col-span-8 neu-card rounded-3xl bg-white/80 border border-[#E0D4C5] p-6 sm:p-10 space-y-10 shadow-sm leading-relaxed text-[#34252A]/85 text-sm sm:text-base">
            
            {/* Section 1 */}
            <section id="guiding-principles" className="space-y-3 pt-2">
              <h2 className="font-serif text-2xl font-bold text-[#6A1F35] tracking-tight">
                1. Guiding Principles & Cultural Sovereignty
              </h2>
              <p>
                At Hailey, privacy is an ethical pillar of cultural stewardship. We are committed to transparency, minimization of data collection, and respecting the sacred boundaries established by community traditions and knowledge keepers.
              </p>
              <p>
                Our foundational promise: We do not monetize your personal profile by selling information to third-party data brokers.
              </p>
            </section>

            {/* Section 2 */}
            <section id="data-collection" className="space-y-3 pt-4 border-t border-[#E0D4C5]/60">
              <h2 className="font-serif text-2xl font-bold text-[#6A1F35] tracking-tight">
                2. Information We Collect
              </h2>
              <p>
                We only gather information necessary to provide an authentic, safe, and enriching cultural experience:
              </p>
              <div className="space-y-2 text-xs sm:text-sm text-[#34252A]/80">
                <div className="p-3 rounded-xl bg-[#FAF6EF] border border-[#E0D4C5]">
                  <strong className="text-[#6A1F35] block mb-1">Account & Identity Information:</strong>
                  Your email address, chosen handle, cultural interests, date of birth (for age verification), and optional bio.
                </div>
                <div className="p-3 rounded-xl bg-[#FAF6EF] border border-[#E0D4C5]">
                  <strong className="text-[#6A1F35] block mb-1">Archival & Contribution Content:</strong>
                  Stories, audio oral histories, festival registrations, photographs, reviews, and community discussion posts that you create.
                </div>
                <div className="p-3 rounded-xl bg-[#FAF6EF] border border-[#E0D4C5]">
                  <strong className="text-[#6A1F35] block mb-1">Digital Wallet Data:</strong>
                  If you opt to connect a decentralized wallet (e.g., MetaMask), we store only your public wallet address to verify digital ticket passes and festival credentials. We never possess your private keys.
                </div>
              </div>
            </section>

            {/* Section 3 */}
            <section id="data-usage" className="space-y-3 pt-4 border-t border-[#E0D4C5]/60">
              <h2 className="font-serif text-2xl font-bold text-[#6A1F35] tracking-tight">
                3. How We Utilize Information
              </h2>
              <p>
                Your data is utilized solely for legitimate archival and community purposes, including:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-[#34252A]/80">
                <li>Operating, securing, and authenticating your account.</li>
                <li>Curating personalized cultural discoveries, festivals, and community recommendations.</li>
                <li>Verifying genuine festival passes and digital ticket access.</li>
                <li>Defending the platform against malicious behavior, bot abuse, and vandalism of cultural records.</li>
              </ul>
            </section>

            {/* Section 4 */}
            <section id="community-boundaries" className="space-y-3 pt-4 border-t border-[#E0D4C5]/60">
              <h2 className="font-serif text-2xl font-bold text-[#6A1F35] tracking-tight">
                4. Cultural Community Boundaries
              </h2>
              <p>
                Certain communities within Hailey may designate private chambers or restricted archival circles for sensitive oral traditions. Content shared in restricted spaces is accessible solely to authorized community members and is not exposed to public search crawlers.
              </p>
            </section>

            {/* Section 5 */}
            <section id="blockchain-transparency" className="space-y-3 pt-4 border-t border-[#E0D4C5]/60">
              <h2 className="font-serif text-2xl font-bold text-[#6A1F35] tracking-tight">
                5. Decentralized Ledgers & Blockchain
              </h2>
              <p>
                Please be aware that any transactions finalized on decentralized blockchain networks (such as ticket verification hashes or provenance timestamps) are recorded on public, immutable ledgers. Hailey cannot delete or modify data once written to a public blockchain.
              </p>
            </section>

            {/* Section 6 */}
            <section id="storage-security" className="space-y-3 pt-4 border-t border-[#E0D4C5]/60">
              <h2 className="font-serif text-2xl font-bold text-[#6A1F35] tracking-tight">
                6. Storage & Security Safeguards
              </h2>
              <p>
                We employ industry-standard encryption protocols (TLS/SSL in transit, AES-256 at rest) managed through enterprise-grade Supabase infrastructure with Row-Level Security (RLS) enforcement.
              </p>
            </section>

            {/* Section 7 */}
            <section id="member-rights" className="space-y-3 pt-4 border-t border-[#E0D4C5]/60">
              <h2 className="font-serif text-2xl font-bold text-[#6A1F35] tracking-tight">
                7. Your Rights & Data Portability
              </h2>
              <p>
                Under global privacy legislation (including GDPR, CCPA, and applicable regional frameworks), you hold the right to:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-[#34252A]/80">
                <li>Access and export your cultural stories and account data.</li>
                <li>Rectify inaccurate personal profile information.</li>
                <li>Request account deletion and de-indexing of personal archives.</li>
              </ul>
            </section>

            {/* Section 8 */}
            <section id="stewardship-contact" className="space-y-3 pt-4 border-t border-[#E0D4C5]/60">
              <h2 className="font-serif text-2xl font-bold text-[#6A1F35] tracking-tight">
                8. Data Stewardship & Inquiries
              </h2>
              <p>
                If you have questions regarding our privacy practices, wish to submit a data erasure request, or represent a cultural delegation:
              </p>
              <div className="p-4 rounded-xl bg-[#FAF6EF] border border-[#E0D4C5] text-xs space-y-1 text-[#34252A]/80">
                <span className="font-bold text-[#6A1F35] block">Privacy & Stewardship Office:</span>
                <p>Email: privacy@hailey.archive</p>
                <p>Hailey Cultural Preservation Initiative</p>
              </div>
            </section>

            {/* Bottom Actions */}
            <div className="pt-8 border-t border-[#E0D4C5] flex flex-wrap items-center justify-between gap-4">
              <Link
                to="/signup"
                className="inline-flex items-center gap-2 py-3 px-6 rounded-xl bg-[#6A1F35] text-[#FAF6EF] font-sans font-medium text-xs sm:text-sm shadow-md hover:bg-[#511528] transition-all"
              >
                <span>Continue to Sign Up</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/terms"
                className="inline-flex items-center gap-2 py-3 px-5 rounded-xl bg-[#FAF6EF] border border-[#E0D4C5] text-[#34252A] font-medium text-xs sm:text-sm hover:bg-[#F0E7DA] transition-all"
              >
                <span>Read Terms of Service</span>
                <ExternalLink className="w-4 h-4 text-[#B08A50]" />
              </Link>
            </div>

          </div>

        </div>

      </div>
    </div>
  )
}

export default PrivacyPage
