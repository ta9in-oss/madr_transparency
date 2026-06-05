# MADR Transparency Platform — Design Spec

**Repo:** https://github.com/ta9in-oss/madr_transparency
**Date:** 2026-06-05
**Status:** Awaiting implementation

---

## What We Are Building

A public data journalism site that extracts, structures, and visualises the import permit data published by Algeria's Ministry of Agriculture (MADR) at madr.gov.dz/transparency. The site gives Algerian citizens — and anyone interested in the country's food system — a clear, readable, searchable view of who imports what, from where, and in what quantity.

The source data is paginated HTML tables across eight datasets, totalling roughly 9,900 records. It is technically public but practically inaccessible: no download button, no API, Arabic and French mixed without structure, and no visualisation of any kind. This project fixes that.

---

## Audience

Three overlapping groups:

- **General public** — Algerian citizens who want to understand where their food comes from and who the licensed operators are. They read Arabic first.
- **Journalists and researchers** — people who need the raw data behind a story. They search, filter, and export.
- **Developers and open data contributors** — people who want to learn from a well-structured open source project or contribute to the scraper and visualisations.

---

## Stories

Three editorial chapters plus a veterinary section:

| Chapter | Dataset(s) | Core question |
|---|---|---|
| 01 — Agricultural Dependency | Seeds, seedlings, potato seeds, fruit imports | Where do Algeria's agricultural inputs come from? |
| 02 — 5,000 Chemicals | Agrochemicals (5,058 records) | Who imports pesticides, what active substances are approved, and from which countries? |
| 03 — The Key Players | All datasets combined | Which companies hold the most licenses across sectors? |
| 04 — Veterinary Chain | Vet authorizations, vet distributors, vet medicine importers | How is the poultry and veterinary medicine supply chain structured? |

Each chapter page follows the same structure: an editorial section with key findings and one or two charts, followed by a searchable data explorer for the full dataset.

---

## Format

Hybrid story + explorer. The reader chooses their depth:

- Scroll the editorial narrative to get the finding
- Use the data table below each section to verify, search, or export

---

## Tech Stack

| Layer | Choice | Reason |
|---|---|---|
| Site framework | Astro.js | Static output, Cloudflare Pages native, file-based routing, islands architecture enforces component isolation |
| UI components | shadcn/ui | Accessible, style-owned (code lives in the repo), works with Astro React islands |
| Charts | visx (Airbnb) | D3 primitives as React components — composable, fully controllable, educational |
| Animations | Framer Motion | Declarative, React-native, standard for chart entry and transitions |
| Icons — UI | Lucide React | Ships with shadcn, 1.5px stroke, consistent geometry |
| Icons — content | Iconoir | Same stroke weight and style as Lucide, has wheat, corn, leaf, apple, vial, barn, cow, chicken |
| Illustrations | unDraw | Open source SVGs, single fill color, set to Forest green |
| Scraper | Python (requests + BeautifulSoup) | Tables are server-rendered HTML, no JS execution needed |
| Hosting | Cloudflare Pages | Free tier, global CDN, zero config for static Astro |
| CI/CD | GitHub Actions | Monthly scrape cron + push-triggered rebuild |

---

## Design System

### Colors

Two anchors only. No gradients. Contextual tints appear on hover only, derived from content type.

```
Ink:          #111318   — near-black, all body text and headings
Forest:       #2d6a4f   — primary accent, links, active states, chart fill
Forest Dark:  #1a3d2e   — hover state on Forest elements
Forest Tint:  #2d6a4f18 — light background for highlighted rows
Paper:        #fafaf8   — page background
Surface:      #f3f2ef   — card and table background
Line:         #e5e4e0   — borders and dividers
Muted:        #6b7280   — secondary text, labels
```

Contextual hover tints (used on data rows and chart segments, never at rest):

```ts
const categoryColors = {
  banane:      '#ca8a04',  // warm yellow
  tomate:      '#dc2626',  // tomato red
  pommier:     '#ea580c',  // apple
  olive:       '#84823a',  // olive
  vigne:       '#7c3aed',  // grape
  mais:        '#d97706',  // corn
  fongicide:   '#16a34a',  // muted green
  insecticide: '#b45309',  // amber-brown
  herbicide:   '#0369a1',  // cool blue
  palmier:     '#92400e',  // date palm brown
}
```

### Typography

| Role | Font | Weight | Size |
|---|---|---|---|
| Display / headings | Space Grotesk | 700 | 2.25rem–1.05rem |
| Body | Inter | 400 | 0.875rem |
| Data values, codes, counts | DM Mono | 400 | 0.78rem |
| Arabic content | Noto Sans Arabic | 400–600 | matched to Inter size |

All fonts from Google Fonts. Loaded with `font-display: swap`.

### Language

Three languages: French (fr), Arabic (ar), English (en).

- **Default:** French (most source data is French)
- **Arabic** is right-to-left; the layout flips entirely when `lang=ar` is active
- Arabic company names default to the French transliteration from MADR; the `companyNameAr` field is reserved for a future enrichment pass using the CNRC Sidjilcom registry (sidjilcom.cnrc.dz)
- All user-facing strings live exclusively in `src/i18n/{fr,ar,en}.json`. No string is hardcoded in any component.

---

## Repository Structure

```
madr_transparency/
│
├── scraper/                         # Python data extraction package
│   ├── run.py                       # Orchestrator — iterates over all extractors
│   ├── config.py                    # Base URL, output paths, request settings
│   ├── models/                      # Typed dataclasses, one per dataset
│   │   ├── plant_product.py
│   │   ├── seedling.py
│   │   ├── agrochemical.py
│   │   ├── seed.py
│   │   ├── potato_seed.py
│   │   ├── vet_authorization.py
│   │   ├── vet_distributor.py
│   │   └── vet_medicine_importer.py
│   ├── extractors/                  # One class per dataset, all inherit BaseExtractor
│   │   ├── base.py                  # Pagination, retry, rate limiting
│   │   ├── plant_products.py
│   │   ├── seedlings.py
│   │   ├── agrochemicals.py
│   │   ├── seeds.py
│   │   ├── potato_seeds.py
│   │   ├── vet_authorizations.py
│   │   ├── vet_distributors.py
│   │   └── vet_medicine_importers.py
│   ├── writers/
│   │   └── json_writer.py           # Serialises models to data/ as JSON
│   └── requirements.txt
│
├── data/                            # Generated JSON — boundary between scraper and site
│   ├── plant-products.json
│   ├── seedlings.json
│   ├── agrochemicals.json
│   ├── seeds.json
│   ├── potato-seeds.json
│   ├── vet-authorizations.json
│   ├── vet-distributors.json
│   └── vet-medicine-importers.json
│
├── src/
│   ├── i18n/
│   │   ├── fr.json                  # Primary language
│   │   ├── ar.json
│   │   └── en.json
│   │
│   ├── lib/
│   │   ├── types.ts                 # Shared TypeScript types (mirrors Python models)
│   │   ├── i18n.ts                  # useTranslation(lang, key) utility
│   │   ├── data.ts                  # Data loading helpers (reads from data/)
│   │   └── categoryColors.ts        # Semantic hover color map
│   │
│   ├── layouts/
│   │   └── BaseLayout.astro         # HTML shell, font loading, lang/dir attribute
│   │
│   ├── components/
│   │   ├── ui/                      # shadcn components (Button, Input, Badge, Table…)
│   │   │
│   │   ├── shared/                  # Used across all pages
│   │   │   ├── SiteHeader.astro     # Nav, language switcher
│   │   │   ├── SiteFooter.astro     # Source attribution, repo link, last updated
│   │   │   ├── StatCard.tsx         # Single large number with label
│   │   │   ├── SectionHeader.tsx    # Chapter number + title + lead text
│   │   │   └── LanguageSwitcher.tsx
│   │   │
│   │   ├── charts/                  # visx chart components, all accept typed data props
│   │   │   ├── HorizontalBarChart.tsx
│   │   │   ├── TreeMap.tsx
│   │   │   ├── ChoroplethMap.tsx    # Algeria wilaya map for vet distributor coverage
│   │   │   ├── BubbleChart.tsx      # Company size by number of licenses
│   │   │   └── ChartTooltip.tsx     # Shared tooltip component
│   │   │
│   │   ├── explorer/                # Data explorer (shared across chapters)
│   │   │   ├── DataExplorer.tsx     # Composes SearchBar + Filters + DataTable
│   │   │   ├── SearchBar.tsx
│   │   │   ├── FilterBar.tsx
│   │   │   └── DataTable.tsx        # Sortable, paginated, category-color rows
│   │   │
│   │   └── chapters/                # Chapter-specific editorial components
│   │       ├── DependencyChapter.tsx
│   │       ├── ChemicalsChapter.tsx
│   │       ├── PlayersChapter.tsx
│   │       └── VeterinaryChapter.tsx
│   │
│   └── pages/
│       ├── index.astro              # Landing — stats overview + chapter cards
│       ├── dependency.astro         # Chapter 01
│       ├── chemicals.astro          # Chapter 02
│       ├── players.astro            # Chapter 03
│       └── veterinary.astro         # Chapter 04
│
├── .github/
│   └── workflows/
│       └── scrape.yml               # Auto-trigger: monthly cron + scraper code push
│
├── wrangler.toml                    # Cloudflare Pages config
├── astro.config.mjs
├── tailwind.config.mjs
└── tsconfig.json
```

---

## Data Contract

The `data/` directory is the hard boundary between the scraper and the site. The scraper writes it, the site reads it. Neither side imports from the other.

Each JSON file is an array of typed objects. Example for agrochemicals:

```ts
type Agrochemical = {
  company:         string   // "DEBBANE POUR L'AGRICULTURE ALGERIE"
  companyNameAr:   string   // "" — reserved for CNRC enrichment
  productName:     string   // "ALUFOS 80%"
  activeSubstance: string   // "Fosétyl-aluminium WP 80%"
  category:        string   // "Fongicide"
  countryOfOrigin: string   // "CN"
}
```

Types are defined once in `src/lib/types.ts` and used by both the data-loading utilities and the chart/table components.

---

## Scraper Design

`BaseExtractor` handles everything that is common across all eight datasets:

- Fetching all pages (DataTables pagination, 25 records per page by default; scraper requests `?length=-1` or iterates pages)
- Retry with exponential backoff on HTTP errors
- Polite rate limiting (1–2 second delay between requests)
- Returning a typed list of model instances

Each subclass defines only:
1. Which tab to target (CSS selector or tab index)
2. The column-to-field mapping

`JsonWriter` serialises the list to `data/{dataset-name}.json` with sorted keys for clean diffs in version control.

---

## i18n Structure

```json
// fr.json (abbreviated)
{
  "nav": {
    "home": "Accueil",
    "dependency": "Dépendance",
    "chemicals": "Produits chimiques",
    "players": "Acteurs",
    "veterinary": "Vétérinaire"
  },
  "home": {
    "title": "Qui nourrit l'Algérie — et d'où ?",
    "subtitle": "Plus de 9 900 autorisations d'importation rendues publiques. Nous les avons extraites, structurées et visualisées pour que vous puissiez comprendre les chaînes de dépendance derrière votre alimentation.",
    "cta_explore": "Explorer les données",
    "cta_story": "Lire l'enquête"
  },
  "stats": {
    "agrochemicals": "produits phytosanitaires",
    "seeds": "variétés de semences",
    "fruit_imports": "importations de fruits",
    "vet_distributors": "distributeurs vétérinaires"
  },
  "chapters": {
    "ch1_num": "01",
    "ch1_title": "La dépendance agricole",
    "ch1_desc": "Semences, plants et origines des fruits cartographiés par pays",
    "ch2_num": "02",
    "ch2_title": "5 000 produits chimiques",
    "ch2_desc": "Qui importe les pesticides, d'où viennent-ils et qu'est-ce qui est homologué",
    "ch3_num": "03",
    "ch3_title": "Les acteurs clés",
    "ch3_desc": "Concentration du marché et détenteurs du plus grand nombre d'autorisations",
    "ch4_num": "04",
    "ch4_title": "La filière vétérinaire",
    "ch4_desc": "Volaille, médicaments vétérinaires et couverture géographique"
  },
  "explorer": {
    "search_placeholder": "Rechercher une entreprise, un produit...",
    "filter_country": "Pays d'origine",
    "filter_category": "Catégorie",
    "no_results": "Aucun résultat pour cette recherche."
  },
  "footer": {
    "source": "Source : Ministère de l'Agriculture, madr.gov.dz",
    "updated": "Données mises à jour le",
    "repo": "Code source"
  }
}
```

Human translators own `ar.json` and `en.json`. The structure is identical across all three files so reviewers can work line by line without touching code.

---

## GitHub Actions — Scrape Workflow

```yaml
# .github/workflows/scrape.yml

name: Refresh data

on:
  schedule:
    - cron: '0 3 1 * *'         # 3 am UTC on the 1st of every month
  push:
    paths:
      - 'scraper/**'             # Re-runs immediately when scraper code changes
  workflow_dispatch:             # Manual trigger for maintainers

jobs:
  scrape:
    runs-on: ubuntu-latest
    permissions:
      contents: write

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-python@v5
        with:
          python-version: '3.12'
          cache: 'pip'

      - run: pip install -r scraper/requirements.txt

      - run: python scraper/run.py

      - name: Commit updated data
        run: |
          git config user.name "madr-bot"
          git config user.email "bot@ta9in-oss.dz"
          git add data/
          git diff --staged --quiet || git commit -m "data: monthly refresh $(date +%Y-%m)"
          git push
```

Cloudflare Pages is connected to the repo. Any commit to `main` triggers a new static build automatically — no extra workflow step needed.

---

## Deployment

```toml
# wrangler.toml
name = "madr-transparency"
pages_build_output_dir = "dist"
```

Cloudflare Pages build settings:
- Build command: `npm run build`
- Output directory: `dist`
- Node version: 20

The full pipeline on a data refresh: GitHub Action scrapes → commits JSON to `data/` → Cloudflare Pages detects the push → rebuilds static site with fresh data → deploys globally in under 60 seconds.

---

## Principles and Constraints

- **YAGNI strictly.** No feature enters the build unless it serves one of the four chapter stories or the explorer. No admin panel, no user accounts, no comments.
- **SOLID components.** Each chart component has one responsibility: render typed data as a specific visual. It receives data and translations as props. It does not fetch, it does not translate internally, it does not know what page it is on.
- **One source of truth per thing.** Types in `types.ts`. Colors in `categoryColors.ts`. Strings in lang files. Data in `data/`. Never duplicated.
- **Learning-oriented structure.** File names and folder names explain themselves. No abbreviations in component names. A new contributor should understand the project structure in under five minutes.
- **No AI-generated phrasing in editorial content.** All `title`, `subtitle`, `finding`, and `desc` strings in the lang files are written in plain, direct language by a human editor. No filler phrases.

---

## Out of Scope (V1)

- CNRC Sidjilcom enrichment for Arabic company names (V2 task)
- Map visualisation for seed origin countries (needs GeoJSON, deferred)
- PDF or CSV export from the data explorer
- Dark mode
- Comments or user-generated content
