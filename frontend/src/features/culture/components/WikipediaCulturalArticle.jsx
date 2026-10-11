import React from 'react'
import { BookOpen, MapPin, Globe, Sparkles, Feather } from 'lucide-react'

export function WikipediaCulturalArticle({ entity }) {
  if (!entity) return null

  return (
    <article className="neu-card rounded-3xl bg-[#FAF6EF] border border-[#E0D4C5] p-6 md:p-10 space-y-8">
      {/* Article Header */}
      <div className="border-b border-[#E0D4C5] pb-5">
        <div className="flex items-center gap-2 text-[#B08A50] mb-1.5">
          <BookOpen className="h-4 w-4 text-[#6A1F35]" />
          <span className="font-mono text-xs uppercase tracking-widest font-bold">
            Hailey Cultural Archive · Editorial Record
          </span>
        </div>
        <h1 className="font-serif text-3xl md:text-5xl font-bold tracking-tight text-[#34252A]">
          {entity.name}
        </h1>
        <p className="mt-2 text-base text-[#34252A]/80 leading-relaxed italic">
          {entity.summary}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Editorial Text (2 cols) */}
        <div className="lg:col-span-2 space-y-6 text-sm text-[#34252A] leading-relaxed">
          {/* History & Origins */}
          <section className="space-y-2">
            <h2 className="font-serif text-2xl font-bold text-[#34252A] border-b border-[#E0D4C5] pb-1.5">
              1. Historical Genesis & Roots
            </h2>
            <p className="text-[#34252A]/80">{entity.history}</p>
            <p className="text-[#34252A]/80">{entity.origins}</p>
          </section>

          {/* Living Practices & Anthropology */}
          <section className="space-y-3 pt-2">
            <h2 className="font-serif text-2xl font-bold text-[#34252A] border-b border-[#E0D4C5] pb-1.5">
              2. Living Practices & Arts
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {entity.practices?.map((practice, idx) => (
                <div key={idx} className="neu-card rounded-xl border border-[#E0D4C5] bg-[#F0E7DA] p-4">
                  <div className="flex items-center gap-2 font-mono text-xs font-bold text-[#6A1F35]">
                    <Feather className="h-3.5 w-3.5 text-[#6A1F35]" />
                    <span>Practice {idx + 1}</span>
                  </div>
                  <p className="text-xs text-[#34252A] mt-1.5 leading-relaxed">{practice}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Chronological Timeline */}
          {entity.timeline?.length > 0 && (
            <section className="space-y-3 pt-2">
              <h2 className="font-serif text-2xl font-bold text-[#34252A] border-b border-[#E0D4C5] pb-1.5">
                3. Historical Chronology
              </h2>
              <div className="relative border-l-2 border-[#B08A50] ml-3 pl-4 space-y-4 py-1">
                {entity.timeline.map((item, idx) => (
                  <div key={idx} className="relative">
                    <span className="absolute -left-[23px] top-1.5 h-3 w-3 rounded-full bg-[#6A1F35] border-2 border-[#FAF6EF]" />
                    <span className="font-mono text-xs font-bold text-[#6A1F35]">{item.year}</span>
                    <p className="text-xs text-[#34252A]/80 mt-0.5">{item.event}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Academic References & Provenance */}
          {entity.sources?.length > 0 && (
            <section className="space-y-3 pt-4 border-t border-[#E0D4C5]">
              <h2 className="font-mono text-xs uppercase tracking-widest font-bold text-[#B08A50]">
                Citations & Primary Sources
              </h2>
              <ol className="list-decimal pl-4 space-y-2 text-xs text-[#34252A]/80 font-mono">
                {entity.sources.map((src, idx) => (
                  <li key={idx}>
                    <span className="font-semibold text-[#34252A]">"{src.title}"</span> — {src.author} ({src.publisher}, {src.year}). <span className="text-[10px] text-[#6A1F35] font-bold">[{src.license}]</span>
                  </li>
                ))}
              </ol>
            </section>
          )}
        </div>

        {/* Infobox Sidebar (1 col) */}
        <aside className="neu-card rounded-2xl border border-[#E0D4C5] bg-[#F0E7DA] p-6 space-y-4 h-fit">
          <div className="border-b border-[#E0D4C5] pb-3">
            <span className="font-mono text-[10px] text-[#B08A50] uppercase font-bold tracking-widest">
              Cultural Infobox
            </span>
            <h3 className="font-serif text-xl font-bold text-[#34252A] mt-0.5">
              {entity.name}
            </h3>
          </div>

          <div className="space-y-3.5 font-mono text-xs">
            <div className="flex items-start gap-2.5">
              <MapPin className="h-4 w-4 text-[#6A1F35] shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] text-[#34252A]/60 uppercase block font-semibold">Geography & Region</span>
                <span className="font-semibold text-[#34252A]">{entity.region}, {entity.country}</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Globe className="h-4 w-4 text-[#B08A50] shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] text-[#34252A]/60 uppercase block font-semibold">Language & Speech</span>
                <span className="font-semibold text-[#34252A]">{entity.language}</span>
              </div>
            </div>

            {entity.traditionType && (
              <div className="flex items-start gap-2.5">
                <Sparkles className="h-4 w-4 text-[#A96849] shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] text-[#34252A]/60 uppercase block font-semibold">Tradition Classification</span>
                  <span className="font-semibold text-[#34252A]">{entity.traditionType}</span>
                </div>
              </div>
            )}

            {entity.religionContext && (
              <div className="pt-2.5 border-t border-[#E0D4C5]">
                <span className="text-[10px] text-[#34252A]/60 uppercase block font-semibold">Religious Context</span>
                <span className="text-xs text-[#34252A]">{entity.religionContext}</span>
              </div>
            )}

            {entity.clothing && (
              <div className="pt-2.5 border-t border-[#E0D4C5]">
                <span className="text-[10px] text-[#34252A]/60 uppercase block font-semibold">Ceremonial Clothing</span>
                <span className="text-xs text-[#34252A]">{entity.clothing}</span>
              </div>
            )}

            {entity.food && (
              <div className="pt-2.5 border-t border-[#E0D4C5]">
                <span className="text-[10px] text-[#34252A]/60 uppercase block font-semibold">Culinary Arts</span>
                <span className="text-xs text-[#34252A]">{entity.food}</span>
              </div>
            )}
          </div>
        </aside>
      </div>
    </article>
  )
}

export default WikipediaCulturalArticle
