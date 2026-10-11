import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  ArrowLeft, 
  ArrowRight, 
  ExternalLink, 
  Scale, 
  CheckCircle2
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

const SECTIONS = [
  { id: 'acceptance', title: '1. Acceptance of Terms' },
  { id: 'eligibility', title: '2. Eligibility & Account Security' },
  { id: 'cultural-integrity', title: '3. Cultural Heritage & Integrity' },
  { id: 'intellectual-property', title: '4. Intellectual Property & Provenance' },
  { id: 'blockchain-collectibles', title: '5. Digital Passes & On-Chain Records' },
  { id: 'code-of-conduct', title: '6. Community Code of Conduct' },
  { id: 'limitation-liability', title: '7. Disclaimers & Limitation of Liability' },
  { id: 'amendments-contact', title: '8. Amendments & Contact' },
]

export function TermsPage() {
  const [activeSection, setActiveSection] = useState('acceptance')

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
            <span className="text-[#6A1F35] font-semibold">Terms & Conditions</span>
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
              to="/privacy"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-[#FAF6EF] bg-[#6A1F35] hover:bg-[#511528] px-3.5 py-1.5 rounded-lg transition-colors shadow-sm"
            >
              <span>View Privacy Policy</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Editorial Header */}
        <div className="space-y-4 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#B08A50]/15 text-[#B08A50] text-xs font-semibold uppercase tracking-widest">
            <Scale className="w-3.5 h-3.5" />
            <span>Official Hailey Charter</span>
          </div>

          <div className="font-serif text-3xl sm:text-5xl text-[#34252A] tracking-tight">
            <BlurText
              text="Terms of Service"
              delay={35}
              animateBy="words"
              direction="top"
            />
          </div>

          <p className="text-sm sm:text-base text-[#34252A]/80 leading-relaxed font-sans">
            Effective Date: October 2026 · Hailey is dedicated to preserving, celebrating, and interconnecting global cultural heritage. By using our services, you agree to safeguard this archival trust and adhere to these terms.
          </p>
        </div>

        {/* Key Highlights Card (Neumorphic Callout) */}
        <div className="neu-card rounded-2xl bg-[#F0E7DA]/60 border border-[#E0D4C5] p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-2.5 text-[#6A1F35]">
            <BotanicalEmblem className="h-6 w-6" />
            <h3 className="font-serif font-bold text-lg text-[#34252A]">
              Our Covenant of Cultural Respect
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-[#34252A]/80 leading-relaxed max-w-4xl">
            Hailey is not merely a social feed; it is a living sanctuary of oral histories, festivals, community traditions, and cultural heritage. All participants must treat traditional knowledge, indigenous customs, and community artifacts with profound dignity and authentic attribution.
          </p>
        </div>

        {/* Main Content Grid: Sidebar Table of Contents + Legal Text */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Sticky Sidebar Navigation (Desktop) */}
          <div className="lg:col-span-4 sticky top-24 space-y-4">
            <div className="neu-card rounded-2xl bg-white/70 border border-[#E0D4C5] p-5 space-y-3">
              <span className="text-[11px] font-sans font-bold uppercase tracking-wider text-[#B08A50] block">
                Table of Contents
              </span>
              <nav className="space-y-1">
                {SECTIONS.map((sec) => (
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
                  Quick Links
                </span>
                <Link
                  to="/privacy"
                  className="w-full inline-flex items-center justify-between px-3 py-2 text-xs rounded-xl bg-[#FAF6EF] border border-[#E0D4C5] text-[#34252A] hover:border-[#6A1F35]/40 transition-colors"
                >
                  <span>Privacy Policy</span>
                  <ExternalLink className="w-3.5 h-3.5 text-[#B08A50]" />
                </Link>
                <Link
                  to="/signup"
                  className="w-full inline-flex items-center justify-between px-3 py-2 text-xs rounded-xl bg-[#6A1F35]/10 border border-[#6A1F35]/20 text-[#6A1F35] font-semibold hover:bg-[#6A1F35]/15 transition-colors"
                >
                  <span>Create Account</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>

          {/* Legal Body Articles */}
          <div className="lg:col-span-8 neu-card rounded-3xl bg-white/80 border border-[#E0D4C5] p-6 sm:p-10 space-y-10 shadow-sm leading-relaxed text-[#34252A]/85 text-sm sm:text-base">
            
            {/* Section 1 */}
            <section id="acceptance" className="space-y-3 pt-2">
              <h2 className="font-serif text-2xl font-bold text-[#6A1F35] tracking-tight">
                1. Acceptance of Terms
              </h2>
              <p>
                By accessing, browsing, registering for, or interacting with Hailey (the “Platform,” “we,” “us,” or “our”), you acknowledge that you have read, understood, and agree to be bound by these Terms of Service (“Terms”) and our accompanying Privacy Policy.
              </p>
              <p>
                If you do not agree with any part of these Terms, you must immediately cease accessing and using the platform.
              </p>
            </section>

            {/* Section 2 */}
            <section id="eligibility" className="space-y-3 pt-4 border-t border-[#E0D4C5]/60">
              <h2 className="font-serif text-2xl font-bold text-[#6A1F35] tracking-tight">
                2. Eligibility & Account Security
              </h2>
              <p>
                To create an account and archive cultural content or acquire festival passes on Hailey, you must be at least 13 years old (or the legal age of digital consent in your jurisdiction). If you are under the age of majority, you must have parental or guardian consent.
              </p>
              <p>
                You are solely responsible for maintaining the confidentiality of your account credentials, password, and linked digital wallets. You agree to notify Hailey immediately upon discovering any unauthorized use or security compromise of your account.
              </p>
            </section>

            {/* Section 3 */}
            <section id="cultural-integrity" className="space-y-3 pt-4 border-t border-[#E0D4C5]/60">
              <h2 className="font-serif text-2xl font-bold text-[#6A1F35] tracking-tight">
                3. Cultural Heritage & Integrity
              </h2>
              <p>
                Hailey exists to cultivate authentic connection across global traditions, festivals, and vernacular customs. Members agree to uphold truthfulness, respectful discourse, and historical fidelity when submitting narratives, oral testimonies, photographs, and event listings.
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-[#34252A]/80">
                <li>Appropriation or caricature of indigenous or sacred ceremonies for mockery or malicious intent is strictly prohibited.</li>
                <li>Attribution to community custodians, elders, or originators must be provided wherever feasible.</li>
                <li>Secret or sacred knowledge designated strictly for ceremonial community eyes must not be published without explicit hereditary permission.</li>
              </ul>
            </section>

            {/* Section 4 */}
            <section id="intellectual-property" className="space-y-3 pt-4 border-t border-[#E0D4C5]/60">
              <h2 className="font-serif text-2xl font-bold text-[#6A1F35] tracking-tight">
                4. Intellectual Property & Provenance
              </h2>
              <p>
                You retain ownership of the original text, photographs, audio recordings, and cultural stories that you publish on Hailey. However, by posting content, you grant Hailey a non-exclusive, worldwide, royalty-free license to host, display, index, and archive that content for platform preservation purposes.
              </p>
              <p>
                The Hailey brand, botanical emblems, software interfaces, and design tokens remain the exclusive intellectual property of Hailey and its licensors.
              </p>
            </section>

            {/* Section 5 */}
            <section id="blockchain-collectibles" className="space-y-3 pt-4 border-t border-[#E0D4C5]/60">
              <h2 className="font-serif text-2xl font-bold text-[#6A1F35] tracking-tight">
                5. Digital Passes & On-Chain Records
              </h2>
              <p>
                Certain festival passes, cultural patron badges, and archival certifications may be recorded on decentralized blockchain ledgers. When you interact with on-chain contracts or acquire tickets:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-[#34252A]/80">
                <li>Transactions executed on public blockchains are immutable and cannot be reversed by Hailey.</li>
                <li>You are solely responsible for transaction gas fees, wallet security, and verifying contract addresses.</li>
                <li>Event organizers are independent entities responsible for venue admittance and event execution.</li>
              </ul>
            </section>

            {/* Section 6 */}
            <section id="code-of-conduct" className="space-y-3 pt-4 border-t border-[#E0D4C5]/60">
              <h2 className="font-serif text-2xl font-bold text-[#6A1F35] tracking-tight">
                6. Community Code of Conduct
              </h2>
              <p>
                Hailey maintains zero tolerance for hate speech, harassment, discrimination based on race, ethnicity, religion, caste, nationality, gender, or sexual orientation. Violating these principles results in immediate suspension and revocation of archival privileges.
              </p>
            </section>

            {/* Section 7 */}
            <section id="limitation-liability" className="space-y-3 pt-4 border-t border-[#E0D4C5]/60">
              <h2 className="font-serif text-2xl font-bold text-[#6A1F35] tracking-tight">
                7. Disclaimers & Limitation of Liability
              </h2>
              <p>
                Hailey is provided on an “as is” and “as available” basis without warranties of any kind. To the fullest extent permitted by law, Hailey and its contributors shall not be liable for any indirect, incidental, or consequential damages resulting from platform usage, data loss, or festival disruptions.
              </p>
            </section>

            {/* Section 8 */}
            <section id="amendments-contact" className="space-y-3 pt-4 border-t border-[#E0D4C5]/60">
              <h2 className="font-serif text-2xl font-bold text-[#6A1F35] tracking-tight">
                8. Amendments & Contact
              </h2>
              <p>
                We reserve the right to revise these Terms to reflect legislative changes, platform upgrades, or cultural charter revisions. We will notify active accounts of material updates.
              </p>
              <div className="p-4 rounded-xl bg-[#FAF6EF] border border-[#E0D4C5] text-xs space-y-1 text-[#34252A]/80">
                <span className="font-bold text-[#6A1F35] block">Questions or Legal Inquiries:</span>
                <p>Email: legal@hailey.archive</p>
                <p>Cultural Stewardship Council · Hailey Archive</p>
              </div>
            </section>

            {/* Bottom Actions */}
            <div className="pt-8 border-t border-[#E0D4C5] flex flex-wrap items-center justify-between gap-4">
              <Link
                to="/signup"
                className="inline-flex items-center gap-2 py-3 px-6 rounded-xl bg-[#6A1F35] text-[#FAF6EF] font-sans font-medium text-xs sm:text-sm shadow-md hover:bg-[#511528] transition-all"
              >
                <span>Accept & Create Account</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/privacy"
                className="inline-flex items-center gap-2 py-3 px-5 rounded-xl bg-[#FAF6EF] border border-[#E0D4C5] text-[#34252A] font-medium text-xs sm:text-sm hover:bg-[#F0E7DA] transition-all"
              >
                <span>Read Privacy Policy</span>
                <ExternalLink className="w-4 h-4 text-[#B08A50]" />
              </Link>
            </div>

          </div>

        </div>

      </div>
    </div>
  )
}

export default TermsPage
