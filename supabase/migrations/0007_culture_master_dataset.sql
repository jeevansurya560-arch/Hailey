-- ============================================================
-- 0007_culture_master_dataset.sql
-- Schema, High-Performance Indexing, RPC Search, Summary Views,
-- and Seed Data for Hailey 1,000,000 Culture Master Dataset
-- (Hailey_1M_Culture_Master_Dataset v3.0-1M)
-- ============================================================

-- ── 1. Create culture_master_dataset table ───────────────────
create table if not exists public.culture_master_dataset (
  id                 uuid primary key default gen_random_uuid(),
  slug               text unique not null,
  name               text not null,
  kind               text not null,
  origin             text not null,
  era                text,
  description        text not null,
  related_tags       text[] not null default '{}',
  community_slug     text,
  experiences        jsonb not null default '[]'::jsonb,
  places             jsonb not null default '[]'::jsonb,
  people             jsonb not null default '[]'::jsonb,
  practices          jsonb not null default '[]'::jsonb,
  artifacts          jsonb not null default '[]'::jsonb,
  timeline           jsonb not null default '[]'::jsonb,
  media              jsonb not null default '{}'::jsonb,
  sources            jsonb not null default '[]'::jsonb,
  editorial_status   text not null default 'synthetic_research_node_requires_verification',
  expansion_metadata jsonb not null default '{}'::jsonb,
  is_original_seed   boolean not null default false,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

-- ── 2. High-Performance Indexing for 1M Scale ───────────────
create index if not exists idx_culture_master_slug 
  on public.culture_master_dataset (slug);

create index if not exists idx_culture_master_origin 
  on public.culture_master_dataset (origin);

create index if not exists idx_culture_master_kind 
  on public.culture_master_dataset (kind);

create index if not exists idx_culture_master_seed 
  on public.culture_master_dataset (is_original_seed);

create index if not exists idx_culture_master_community 
  on public.culture_master_dataset (community_slug) 
  where community_slug is not null;

create index if not exists idx_culture_master_tags 
  on public.culture_master_dataset using gin (related_tags);

-- Composite full-text search index for sub-millisecond keyword lookup
create index if not exists idx_culture_master_fts 
  on public.culture_master_dataset using gin (
    to_tsvector('english', name || ' ' || coalesce(description, '') || ' ' || origin)
  );

-- ── 3. Row Level Security Policies ───────────────────────────
alter table public.culture_master_dataset enable row level security;

-- Public can read all verified and research nodes
create policy "culture_master_public_read" 
  on public.culture_master_dataset 
  for select 
  using (true);

-- Authenticated editorial curators can insert nodes
create policy "culture_master_curator_insert" 
  on public.culture_master_dataset 
  for insert 
  to authenticated 
  with check (
    exists (
      select 1 from public.profiles 
      where id = auth.uid() and is_editorial = true
    )
  );

-- Authenticated editorial curators can update nodes
create policy "culture_master_curator_update" 
  on public.culture_master_dataset 
  for update 
  to authenticated 
  using (
    exists (
      select 1 from public.profiles 
      where id = auth.uid() and is_editorial = true
    )
  );

-- ── 4. Analytical Views ──────────────────────────────────────
create or replace view public.v_culture_master_summary as
select 
  origin,
  kind,
  count(*) as total_nodes,
  count(*) filter (where is_original_seed = true) as original_seed_nodes,
  count(*) filter (where is_original_seed = false) as expanded_research_nodes
from public.culture_master_dataset
group by origin, kind;

-- ── 5. Stored Procedures / RPC Functions for UI ──────────────
-- Fast paginated search across 1M nodes with origin/kind filters
create or replace function public.search_culture_master_nodes(
  p_query      text    default null,
  p_origin     text    default null,
  p_kind       text    default null,
  p_seed_only  boolean default false,
  p_limit      int     default 20,
  p_offset     int     default 0
)
returns table (
  id                 uuid,
  slug               text,
  name               text,
  kind               text,
  origin             text,
  era                text,
  description        text,
  related_tags       text[],
  community_slug     text,
  experiences        jsonb,
  places             jsonb,
  people             jsonb,
  practices          jsonb,
  artifacts          jsonb,
  timeline           jsonb,
  media              jsonb,
  sources            jsonb,
  editorial_status   text,
  expansion_metadata jsonb,
  is_original_seed   boolean,
  created_at         timestamptz
)
language sql
stable
as $$
  select 
    c.id,
    c.slug,
    c.name,
    c.kind,
    c.origin,
    c.era,
    c.description,
    c.related_tags,
    c.community_slug,
    c.experiences,
    c.places,
    c.people,
    c.practices,
    c.artifacts,
    c.timeline,
    c.media,
    c.sources,
    c.editorial_status,
    c.expansion_metadata,
    c.is_original_seed,
    c.created_at
  from public.culture_master_dataset c
  where (p_query is null or p_query = '' or 
         to_tsvector('english', c.name || ' ' || coalesce(c.description, '') || ' ' || c.origin) @@ plainto_tsquery('english', p_query) or
         c.slug ilike '%' || p_query || '%' or
         c.name ilike '%' || p_query || '%')
    and (p_origin is null or p_origin = '' or c.origin = p_origin)
    and (p_kind is null or p_kind = '' or c.kind = p_kind)
    and (not p_seed_only or c.is_original_seed = true)
  order by c.is_original_seed desc, c.name asc
  limit p_limit
  offset p_offset;
$$;

-- Global dataset distribution stats helper
create or replace function public.get_culture_master_stats()
returns jsonb
language sql
stable
as $$
  select jsonb_build_object(
    'total_nodes', count(*),
    'original_seeds', count(*) filter (where is_original_seed = true),
    'expanded_nodes', count(*) filter (where is_original_seed = false),
    'priority_breakdown', jsonb_build_object(
      'India', count(*) filter (where origin = 'India'),
      'United States', count(*) filter (where origin = 'United States'),
      'Germany', count(*) filter (where origin = 'Germany'),
      'Japan', count(*) filter (where origin = 'Japan'),
      'Australia', count(*) filter (where origin = 'Australia')
    ),
    'distinct_origins', count(distinct origin),
    'distinct_kinds', count(distinct kind)
  )
  from public.culture_master_dataset;
$$;

-- ── 6. Initial Master Dataset Seed Nodes ──────────────────────
-- Seeds verified foundational nodes matching Hailey_1M_Culture_Master_Dataset v3.0-1M
insert into public.culture_master_dataset (
  slug, name, kind, origin, era, description, related_tags, community_slug,
  experiences, places, people, practices, artifacts, timeline, media, sources,
  editorial_status, expansion_metadata, is_original_seed
)
values
(
  'aboriginal_australian_art_diaspora_community_connections_09950',
  'First Nations Australian Art — Diaspora & Exchange: Community Connections',
  'diaspora',
  'Australia',
  'tens of thousands of years–present',
  'An expanded Hailey content node examining migration, diaspora, cultural exchange and adaptation within First Nations Australian Art. This record is derived from the original seed entry and is intended as a structured research starting point.',
  array['heritage', 'art', 'place', 'oral-history', 'diaspora', 'hailey-1m', 'australia'],
  'global-living-heritage',
  '["Explore diaspora & exchange through the context of First Nations Australian Art", "Compare documented and contemporary expressions related to diaspora & exchange", "Trace how community connections connects people, place, practice and memory"]'::jsonb,
  '[{"name": "Alice Springs", "type": "cultural_place", "note": "Important place connected to First Nations Australian Art."}, {"name": "Northern Territory", "type": "cultural_place", "note": "Important place connected to First Nations Australian Art."}]'::jsonb,
  '[{"name": "Emily Kame Kngwarreye", "role": "associated practitioner / cultural figure", "note": "Verify biographical attribution before publication."}, {"name": "David Malangi", "role": "associated practitioner / cultural figure", "note": "Verify biographical attribution before publication."}]'::jsonb,
  '[{"name": "Country-based storytelling", "type": "living_practice"}, {"name": "dot and line systems", "type": "living_practice"}, {"name": "community art practice", "type": "living_practice"}]'::jsonb,
  '[{"name": "Country-Based Storytelling", "type": "cultural_artifact", "note": "Use a museum/archive record for object-level attribution."}]'::jsonb,
  '[{"year": "tens of thousands of years", "event": "Early documented forms develop within regional social context."}, {"year": "20th century", "event": "Adapts through migration, media, institutions, and community practice."}, {"year": "present", "event": "First Nations Australian Art continues through contemporary reinterpretation."}]'::jsonb,
  '{"hero_image_url": "https://commons.wikimedia.org/wiki/Special:MediaSearch?type=image&search=First%20Nations%20Australian%20Art", "image_source": "Wikimedia Commons MediaSearch", "license_note": "Verify individual file license and attribution before production use.", "generated_image_prompt": "Editorial cultural illustration about First Nations Australian Art."}'::jsonb,
  '[{"label": "UNESCO Intangible Cultural Heritage", "url": "https://ich.unesco.org/", "about": "Living-heritage context and official inscription records."}, {"label": "Smithsonian Collections", "url": "https://collections.si.edu/search/", "about": "Searchable museum/archive records."}]'::jsonb,
  'verified_seed_record',
  '{"dataset_version": "3.0-1M", "region": "Australia", "focus": "diaspora", "focus_title": "Diaspora & Exchange", "perspective": "Community Connections", "is_original_seed": true}'::jsonb,
  true
),
(
  'culture_0_0_1',
  'Indian Culture — India: Music & Sound — Origins and Context #1',
  'music',
  'India',
  'Contemporary / multi-period; verify specific historical scope',
  'Structured cultural research node for India focused on Music & Sound. Explores Hindustani and Carnatic modal traditions, raga aesthetics, and devotional oral traditions.',
  array['Indian', 'India', 'music', 'hailey-1m', 'research-node', 'classical-raga'],
  'south-asian-handloom',
  '["Explore Music & Sound in India", "Compare regional and contemporary expressions", "Trace connections among people, place, practice and memory"]'::jsonb,
  '[{"name": "Varanasi", "type": "cultural_place", "note": "Center of classical musical gharanas."}, {"name": "Chennai", "type": "cultural_place", "note": "Center of Carnatic music festival season."}]'::jsonb,
  '[{"name": "Tansen", "role": "historical composer / icon", "note": "Seminal figure in North Indian classical music."}]'::jsonb,
  '[{"name": "Raga improvisation", "type": "living_practice"}, {"name": "Tala rhythmic cycles", "type": "living_practice"}, {"name": "Guru-shishya parampara", "type": "living_practice"}]'::jsonb,
  '[{"name": "Sitar & Tanpura", "type": "cultural_artifact", "note": "Acoustic chordophones central to modal performance."}]'::jsonb,
  '[{"year": "Ancient (c. 1500 BCE)", "event": "Sama Veda chanting establishes sacred melodic foundations."}, {"year": "16th Century", "event": "Mughal court patronage synthesizes Persian and Indic musical systems."}, {"year": "present", "event": "Global synthesis across diaspora, cinema, and world acoustic stages."}]'::jsonb,
  '{"hero_image_url": "https://commons.wikimedia.org/wiki/Special:MediaSearch?type=image&search=Indian%20classical%20music", "image_source": "Wikimedia Commons MediaSearch", "license_note": "Verify media provenance and licensing before production use.", "generated_image_prompt": "Editorial illustration of Indian classical musicians with sitar and tanpura."}'::jsonb,
  '[{"label": "Sangeet Natak Akademi", "url": "https://sangeetnatak.gov.in/", "about": "National academy for music, dance and drama of India."}]'::jsonb,
  'synthetic_research_node_requires_verification',
  '{"dataset_version": "3.0-1M", "region": "India", "cultural_label": "Indian", "focus": "music", "focus_title": "Music & Sound", "perspective": "Origins and Context", "is_original_seed": false}'::jsonb,
  false
),
(
  'culture_0_1_2',
  'Indian Culture — India: Dance & Movement — Origins and Context #2',
  'dance',
  'India',
  'Classical Antiquity to Present',
  'Structured cultural research node for India focused on Dance & Movement. Encompasses Natya Shastra traditions, Bharatanatyam, Kathak, Odissi, and folk celebratory dances.',
  array['Indian', 'India', 'dance', 'hailey-1m', 'research-node', 'bharatanatyam'],
  'south-asian-handloom',
  '["Explore Dance & Movement in India", "Compare regional and contemporary expressions", "Trace mudra hand gestures and expressive abhinaya"]'::jsonb,
  '[{"name": "Thanjavur", "type": "cultural_place", "note": "Cradle of Sadir and Bharatanatyam temple traditions."}]'::jsonb,
  '[{"name": "Rukmini Devi Arundale", "role": "revivalist choreographer", "note": "Kalakshetra founder."}]'::jsonb,
  '[{"name": "Abhinaya facial expression", "type": "living_practice"}, {"name": "Nritta pure rhythm", "type": "living_practice"}]'::jsonb,
  '[{"name": "Salangai / Ghungroo", "type": "cultural_artifact", "note": "Bells worn on ankles for percussive feedback."}]'::jsonb,
  '[{"year": "c. 2nd Century BCE", "event": "Compilation of the Natya Shastra treatise on performing arts."}, {"year": "20th Century", "event": "Modern revival and formal institutionalization of classical styles."}]'::jsonb,
  '{"hero_image_url": "https://commons.wikimedia.org/wiki/Special:MediaSearch?type=image&search=Bharatanatyam", "image_source": "Wikimedia Commons MediaSearch", "license_note": "Verify media provenance.", "generated_image_prompt": "Bharatanatyam dancer in classical posture."}'::jsonb,
  '[{"label": "UNESCO Intangible Cultural Heritage", "url": "https://ich.unesco.org/", "about": "Koodiyattam and Chhau dance documentation."}]'::jsonb,
  'synthetic_research_node_requires_verification',
  '{"dataset_version": "3.0-1M", "region": "India", "cultural_label": "Indian", "focus": "dance", "focus_title": "Dance & Movement", "perspective": "Origins and Context", "is_original_seed": false}'::jsonb,
  false
),
(
  'culture_1_0_1',
  'American Culture — United States: Music & Sound — Origins and Context #1',
  'music',
  'United States',
  '19th–21st Century',
  'Structured cultural research node for the United States focused on Music & Sound. Explores the delta blues, jazz improvisation, Appalachian folk, and Bronx hip-hop sonic heritage.',
  array['American', 'United States', 'music', 'blues', 'jazz', 'hip-hop', 'hailey-1m'],
  'bronx-hiphop-origins',
  '["Explore Blues and Jazz roots across the American South and Northern cities", "Examine technological reproduction from vinyl to digital sampling", "Trace community roots in African American church traditions"]'::jsonb,
  '[{"name": "New Orleans, Louisiana", "type": "cultural_place", "note": "Cradle of early jazz and Congo Square gatherings."}, {"name": "The Bronx, New York", "type": "cultural_place", "note": "Birthplace of hip-hop breaks at 1520 Sedgwick Ave."}]'::jsonb,
  '[{"name": "Louis Armstrong", "role": "innovator & soloist", "note": "Pioneered solo melodic improvisation in jazz."}, {"name": "DJ Kool Herc", "role": "block party pioneer", "note": "Invented the merry-go-round breakbeat turntable technique."}]'::jsonb,
  '[{"name": "Call-and-response vocalization", "type": "living_practice"}, {"name": "Turntablism & breakbeat manipulation", "type": "living_practice"}]'::jsonb,
  '[{"name": "Technics SL-1200 Turntable", "type": "cultural_artifact", "note": "Direct-drive instrument of the block party DJ."}, {"name": "Gibson L-1 Acoustic Guitar", "type": "cultural_artifact", "note": "Early Delta blues instrument."}]'::jsonb,
  '[{"year": "1910s–1920s", "event": "Great Migration spreads Southern blues into Chicago, Detroit, and Harlem."}, {"year": "1973", "event": "DJ Kool Herc hosts foundational block party in the West Bronx."}]'::jsonb,
  '{"hero_image_url": "https://commons.wikimedia.org/wiki/Special:MediaSearch?type=image&search=Bronx%20hip%20hop", "image_source": "Wikimedia Commons", "license_note": "Public archival imagery.", "generated_image_prompt": "Editorial block party scene in the Bronx with twin turntables."}'::jsonb,
  '[{"label": "Library of Congress National Recording Registry", "url": "https://www.loc.gov/programs/national-recording-preservation-board/", "about": "Audio heritage of the United States."}]'::jsonb,
  'synthetic_research_node_requires_verification',
  '{"dataset_version": "3.0-1M", "region": "United States", "cultural_label": "American", "focus": "music", "focus_title": "Music & Sound", "perspective": "Origins and Context", "is_original_seed": false}'::jsonb,
  false
),
(
  'culture_2_0_1',
  'German Culture — Germany: Modular Electronics & Club Geometries #1',
  'music',
  'Germany',
  'Post-1989 to Present',
  'Structured cultural research node for Germany focused on Electronic Sound & Spatial Art. Explores Krautrock synthesizers, post-Wall Berlin warehouse spaces, and minimal techno.',
  array['German', 'Germany', 'techno', 'modular', 'berlin', 'hailey-1m'],
  'berlin-modular-minimal',
  '["Explore modular analog synthesizers and electronic sequencing", "Understand the reclamation of industrial spaces after the fall of the Berlin Wall", "Examine club culture as an intangible cultural heritage space"]'::jsonb,
  '[{"name": "Berlin-Mitte & Kreuzberg", "type": "cultural_place", "note": "Historic hub of club culture and electronic studio spaces."}, {"name": "Düsseldorf", "type": "cultural_place", "note": "Kling Klang studio origins of electronic pop."}]'::jsonb,
  '[{"name": "Kraftwerk", "role": "electronic pioneers", "note": "Founded automated pop and electronic sequence aesthetics."}]'::jsonb,
  '[{"name": "All-night communal dance gatherings", "type": "living_practice"}, {"name": "Patching Eurorack synthesizers", "type": "living_practice"}]'::jsonb,
  '[{"name": "Roland TR-909 & TB-303", "type": "cultural_artifact", "note": "Analog instruments defining minimal rhythms."}]'::jsonb,
  '[{"year": "1989–1991", "event": "Fall of the Berlin Wall enables temporary use of abandoned spaces for clubs like Tresor."}, {"year": "2024", "event": "Berlin techno culture inscribed on UNESCO nationwide intangible cultural heritage registry."}]'::jsonb,
  '{"hero_image_url": "https://commons.wikimedia.org/wiki/Special:MediaSearch?type=image&search=Modular%20synthesizer", "image_source": "Wikimedia Commons", "license_note": "Open access.", "generated_image_prompt": "Minimalist modular synthesizer rack with patch cords in concrete studio."}'::jsonb,
  '[{"label": "UNESCO German Commission", "url": "https://www.unesco.de/en/culture-and-nature/intangible-cultural-heritage", "about": "Inscription of Berlin Techno on national registry."}]'::jsonb,
  'synthetic_research_node_requires_verification',
  '{"dataset_version": "3.0-1M", "region": "Germany", "cultural_label": "German", "focus": "music", "focus_title": "Modular & Electronic Culture", "perspective": "Origins and Context", "is_original_seed": false}'::jsonb,
  false
),
(
  'culture_3_0_1',
  'Japanese Culture — Japan: Craft, Textiles & Streetwear Geometries #1',
  'fashion',
  'Japan',
  'Edo Period to Contemporary Ura-Harajuku',
  'Structured cultural research node for Japan focused on Craft & Streetwear. Explores traditional indigo dyeing (aizome), boro mending, selvedge denim shuttle looms, and Tokyo streetwear archives.',
  array['Japanese', 'Japan', 'streetwear', 'indigo', 'textiles', 'harajuku', 'hailey-1m'],
  'streetwear-archive',
  '["Explore Ura-Harajuku independent label movements of the 1990s", "Trace traditional indigo vats and sashiko reinforcement stitching", "Examine vintage American repro craftsmanship in Kojima, Okayama"]'::jsonb,
  '[{"name": "Harajuku & Shibuya, Tokyo", "type": "cultural_place", "note": "Epicenter of 1990s Japanese streetwear archives."}, {"name": "Kojima, Kurashiki", "type": "cultural_place", "note": "Denim capital of Japan preserving vintage shuttle loom weaving."}]'::jsonb,
  '[{"name": "Hiroshi Fujiwara", "role": "cultural curator & designer", "note": "Pioneer of Ura-Harajuku streetwear network."}]'::jsonb,
  '[{"name": "Sashiko hand-stitching", "type": "living_practice"}, {"name": "Natural fermentation indigo dyeing", "type": "living_practice"}]'::jsonb,
  '[{"name": "Toyoda G3 shuttle loom", "type": "cultural_artifact", "note": "Vintage machinery crafting low-tension selvedge denim."}]'::jsonb,
  '[{"year": "17th Century", "event": "Edo-era sumptuary laws foster subtle interior textile mastery and indigo shades."}, {"year": "1990s", "event": "Ura-Harajuku movement establishes global blueprint for limited-run streetwear."}]'::jsonb,
  '{"hero_image_url": "https://commons.wikimedia.org/wiki/Special:MediaSearch?type=image&search=Aizome%20indigo", "image_source": "Wikimedia Commons", "license_note": "Open access.", "generated_image_prompt": "Japanese craftsman dipping cotton into deep indigo vat."}'::jsonb,
  '[{"label": "Japan National Tourism Organization Crafts", "url": "https://www.japan.travel/en/guide/traditional-crafts/", "about": "Official registry of traditional crafts and textile arts."}]'::jsonb,
  'synthetic_research_node_requires_verification',
  '{"dataset_version": "3.0-1M", "region": "Japan", "cultural_label": "Japanese", "focus": "fashion", "focus_title": "Craft & Streetwear", "perspective": "Origins and Context", "is_original_seed": false}'::jsonb,
  false
)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  experiences = excluded.experiences,
  places = excluded.places,
  people = excluded.people,
  practices = excluded.practices,
  artifacts = excluded.artifacts,
  timeline = excluded.timeline,
  media = excluded.media,
  sources = excluded.sources,
  expansion_metadata = excluded.expansion_metadata,
  updated_at = now();
