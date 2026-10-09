import React from 'react'
import { BookOpen, MapPin, Globe, Sparkles, Feather } from 'lucide-react'

export function WikipediaCulturalArticle({ entity }) {
  if (!entity) return null

  return (
    <article className="border border-[var(--ink)] bg-[var(--paper)] p-6 md:p-8 shadow-[var(--shadow-hard)] space-y-8">
      {/* Article Header */}
      <div className="border-b border-[var(--line)] pb-5">
        <div className="flex items-center gap-2 text-[var(--clay)] mb-1">
          <BookOpen className="h-4 w-4" />
          <span className="font-mono text-xs uppercase tracking-widest font-bold">
            Hailey Cultural Archive · Editorial Record
          </span>
        </div>
        <h1 className="font-serif text-3xl md:text-5xl font-bold tracking-tight text-[var(--ink)]">
          {entity.name}
        </h1>
        <p className="mt-2 text-base text-[var(--ink-2)] leading-relaxed italic">
          {entity.summary}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Editorial Text (2 cols) */}
        <div className="lg:col-span-2 space-y-6 text-sm text-[var(--ink)] leading-relaxed">
          {/* History & Origins */}
          <section className="space-y-2">
            <h2 className="font-serif text-2xl font-bold text-[var(--ink)] border-b border-[var(--line)] pb-1">
              1. Historical Genesis & Roots
            </h2>
            <p className="text-[var(--ink-2)]">{entity.history}</p>
            <p className="text-[var(--ink-2)]">{entity.origins}</p>
          </section>

          {/* Living Practices & Anthropology */}
          <section className="space-y-3 pt-2">
            <h2 className="font-serif text-2xl font-bold text-[var(--ink)] border-b border-[var(--line)] pb-1">
              2. Living Practices & Arts
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {entity.practices?.map((practice, idx) => (
                <div key={idx} className="border border-[var(--line)] bg-[var(--paper-2)] p-3 rounded">
                  <div className="flex items-center gap-2 font-mono text-xs font-bold text-[var(--clay)]">
                    <Feather className="h-3.5 w-3.5" />
                    <span>Practice {idx + 1}</span>
                  </div>
                  <p className="text-xs text-[var(--ink)] mt-1">{practice}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Chronological Timeline */}
          {entity.timeline?.length > 0 && (
            <section className="space-y-3 pt-2">
              <h2 className="font-serif text-2xl font-bold text-[var(--ink)] border-b border-[var(--line)] pb-1">
                3. Historical Chronology
              </h2>
              <div className="relative border-l-2 border-[var(--clay)] ml-3 pl-4 space-y-4">
                {entity.timeline.map((item, idx) => (
                  <div key={idx} className="relative">
                    <span className="absolute -left-[23px] top-1.5 h-3 w-3 rounded-full bg-[var(--clay)] border-2 border-[var(--paper)]" />
                    <span className="font-mono text-xs font-bold text-[var(--clay)]">{item.year}</span>
                    <p className="text-xs text-[var(--ink-2)] mt-0.5">{item.event}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Academic References & Provenance */}
          {entity.sources?.length > 0 && (
            <section className="space-y-3 pt-4 border-t border-[var(--line)]">
              <h2 className="font-mono text-xs uppercase tracking-widest font-bold text-[var(--ink-2)]">
                Citations & Primary Sources
              </h2>
              <ol className="list-decimal pl-4 space-y-2 text-xs text-[var(--ink-2)] font-mono">
                {entity.sources.map((src, idx) => (
                  <li key={idx}>
                    <span className="font-semibold text-[var(--ink)]">"{src.title}"</span> — {src.author} ({src.publisher}, {src.year}). <span className="text-[10px] text-[var(--clay)]">[{src.license}]</span>
                  </li>
                ))}
              </ol>
            </section>
          )}
        </div>

        {/* Infobox Sidebar (1 col) */}
        <aside className="border border-[var(--ink)] bg-[var(--paper-2)] p-5 shadow-[2px_2px_0_var(--ink)] space-y-4 h-fit">
          <div className="border-b border-[var(--line)] pb-3">
            <span className="font-mono text-[10px] text-[var(--clay)] uppercase font-bold tracking-widest">
              Cultural Infobox
            </span>
            <h3 className="font-serif text-xl font-bold text-[var(--ink)] mt-0.5">
              {entity.name}
            </h3>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-[var(--clay)] shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] text-[var(--ink-2)] uppercase block">Geography & Region</span>
                <span className="font-semibold text-[var(--ink)]">{entity.region}, {entity.country}</span>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Globe className="h-4 w-4 text-[var(--moss)] shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] text-[var(--ink-2)] uppercase block">Language & Speech</span>
                <span className="font-semibold text-[var(--ink)]">{entity.language}</span>
              </div>
            </div>

            {entity.traditionType && (
              <div className="flex items-start gap-2">
                <Sparkles className="h-4 w-4 text-[var(--saffron)] shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] text-[var(--ink-2)] uppercase block">Tradition Classification</span>
                  <span className="font-semibold text-[var(--ink)]">{entity.traditionType}</span>
                </div>
              </div>
            )}

            {entity.religionContext && (
              <div className="pt-2 border-t border-[var(--line)]">
                <span className="text-[10px] text-[var(--ink-2)] uppercase block">Religious Context</span>
                <span className="text-xs text-[var(--ink)]">{entity.religionContext}</span>
              </div>
            )}

            {entity.clothing && (
              <div className="pt-2 border-t border-[var(--line)]">
                <span className="text-[10px] text-[var(--ink-2)] uppercase block">Ceremonial Clothing</span>
                <span className="text-xs text-[var(--ink)]">{entity.clothing}</span>
              </div>
            )}

            {entity.food && (
              <div className="pt-2 border-t border-[var(--line)]">
                <span className="text-[10px] text-[var(--ink-2)] uppercase block">Culinary Arts</span>
                <span className="text-xs text-[var(--ink)]">{entity.food}</span>
              </div>
            )}
          </div>
        </aside>
      </div>
    </article>
  )
}

export default WikipediaCulturalArticle
