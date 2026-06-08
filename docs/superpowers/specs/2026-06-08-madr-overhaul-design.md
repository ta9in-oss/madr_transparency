# MADR Platform Overhaul Design

**Goal:** Fix data integrity issues, replace visx with recharts, and build a Groq-driven analysis pipeline that produces pre-computed insights — so the frontend purely renders and the data story is credible.

**Architecture:**
- `data/raw/*.json` — immutable scraper output (committed, never modified post-scrape)
- `data/*.json` — normalized, enriched final data (overwritten by pipeline each run)
- `data/insights.json` — pre-computed aggregations, top-N lists, anomaly flags for each chapter
- Frontend reads only from `data/*.json` and `data/insights.json` — no aggregation at render time

**Tech Stack:** Python (pipeline), recharts (charts), Astro 5 (SSG), TypeScript

---

## Sub-project A: Data Pipeline Overhaul

### A1 — Raw data preservation
- Scraper writes to `data/raw/*.json` (new step before normalize)
- `normalize_data.py` reads from `data/raw/`, writes to `data/`
- Workflow: scrape → preserve raw → normalize → insights → commit both `data/raw/` and `data/`

### A2 — Fix MT (Malta) bug in plant-products
- Root cause: `normalize_country()` called `pycountry.search_fuzzy()` on multi-country strings like `"cote d'ivoire-costa rica-colombie-guatemala"` — fuzzy match returned Malta
- Fix: if input contains `-`, `/`, or `,` between country names → set `country_of_origin = 'XX'`, set `multi_origin = True`
- 151 plant-product records affected — fix in-place on existing data, fix in normalizer for future scrapes

### A3 — Seeds material_type normalization
- 95+ variants of "Semence" → 5 canonical values:
  - `Semence standard` — plain seeds (Semence, SEMENCE, semence, etc.)
  - `Semence hybride` — hybrid seeds (Hybride, F1, HYBRIDE)
  - `Porte-greffe` — rootstock (PORTE GREFFE, porte-greffes, M9, GF677)
  - `Semence fourragère` — forage seeds (fourragère, FOURAGERES, luzerne)
  - `Tubercule` — tubers (TUBERCULES, tubercule)
  - `Autre` — everything else (METALAXYL, Abamectin, test, etc.)
- Apply in both Python (normalize_data.py) and TypeScript (normalize.ts) safety net

### A4 — Vet product type decoding
- Decode opaque codes via static map (from MADR documentation / Groq inference):
  - `PRC` → Produit de la Rente et de Consommation
  - `PRP` → Produit de la Rente et de Promotion
  - `PRD` → Produit de Rente Diagnostique
  - `PRCGP` → Produit de la Rente et de Consommation (Grande Production)
  - `OACRCGP` → Organisme d'Autorisation et de Contrôle
- Use Groq to infer any remaining unlabeled codes
- Store decoded label as `product_type_label` alongside raw code

### A5 — insights.json pre-computation
Run by `scripts/compute_insights.py` after normalization. Produces `data/insights.json`:

```json
{
  "dependency": {
    "total_records": 3958,
    "top_seed_countries": [{"iso": "CN", "count": 416}, ...],
    "banana_share_pct": 66,
    "multi_origin_count": 151,
    "xx_count": 238,
    "material_type_breakdown": {...},
    "top_companies_by_count": [...]
  },
  "chemicals": {
    "total": 5058,
    "top_countries": [{"iso": "ES", "count": 1047}, ...],
    "category_breakdown": {...},
    "top_active_substances": [...],
    "top_companies": [...],
    "hhi_index": 0.043
  },
  "players": {
    "total_permits": 9532,
    "top_10_share_pct": 28,
    "top_companies": [...],
    "hhi_index": 0.031
  },
  "veterinary": {
    "wilayas_covered": 40,
    "wilayas_absent": 18,
    "absent_wilaya_names": [...],
    "top_wilayas": [...],
    "product_type_breakdown": {...}
  },
  "generated_at": "2026-06-08T..."
}
```

### A6 — Workflow update
```yaml
- Scrape → data/raw/
- Normalize (pycountry + Groq) → data/
- Compute insights → data/insights.json
- Commit data/raw/, data/, data/insights.json, scraper/country_cache.json
```

---

## Sub-project B: UI Overhaul

### B1 — Replace visx with recharts
Remove: `@visx/scale`, `@visx/group`, `@visx/axis`, `@visx/text`
Add: `recharts`

Components to rewrite:
- `HorizontalBarChart.tsx` → recharts `BarChart` layout="horizontal"
- `WorldBubbleMap.tsx` → recharts `ScatterChart` + `react-simple-maps` for geo background
- `WilayaGrid.tsx` → recharts `Treemap` or custom SVG (keep if already clean)
- `WilayaMap.tsx` → keep (custom d3-geo, visx not used)

### B2 — RTL design fixes
- Charts: all recharts charts wrap in `dir="ltr"` container (SVG math is LTR)
- Chart titles and axis labels: use `dir="rtl"` text where language is AR
- Bar chart labels: Arabic text right-aligned inside bar label area
- Table headers: RTL-aware column alignment
- Mobile nav: hamburger button position (right side for LTR, left for RTL)
- Chapter nav arrows: flip ← → for RTL direction

### B3 — Copy rewrite (em-dash removal)
Replace all `X — Y` patterns in static copy with proper sentence structure.
Examples:
- `"Spanish products — top supplier"` → `"المرتبة الأولى: إسبانيا"`
- `"Banana alone dominates — hundreds of licences"` → separate sentences
- `"China, America, India — Algeria imports..."` → `"Algeria imports most seeds from China, the US, and India."`
No em-dashes in stat labels, callout context props, or chart titles.

---

## Sub-project C: Groq Analysis Pipeline

### C1 — Analysis prompt design
`scripts/compute_insights.py` uses Groq `llama-3.3-70b-versatile` to:
1. Receive a structured summary of the data (counts, top-N, distributions)
2. Return narrative insights per chapter: anomalies, market concentration flags, data quality notes
3. Store as `insights.narrative` fields in `data/insights.json`

### C2 — Chapter blueprints (what each page shows)
These are stable — charts and tables are wired to these slots regardless of data changes:

**Dependency page:**
- World bubble map: seed/plant import origins (bubble size = count)
- Horizontal bar: top 10 seed source countries  
- Pie/donut: plant product category breakdown (Fruits/Céréales/Plants/etc.)
- Callout: banana share of total (currently ~66%)
- Table: full explorer

**Chemicals page:**
- World bubble map: agrochemical origins
- Horizontal bar: top 10 countries by permit count
- Horizontal bar: top 10 categories
- Callout: Spain as #1 (1,047 permits)
- Table: full explorer with active_substance search

**Players page:**
- Bar chart: top 20 companies by total permits (cross-dataset)
- Callout: HHI concentration index
- Table: full company explorer

**Veterinary page:**
- Wilaya choropleth map: distributor coverage
- Bar: top 20 wilayas by distributor count
- Bar: product type breakdown (decoded labels)
- Callout: absent wilaya count
- Table: distributors explorer

### C3 — Frontend reads insights.json at build time
Each Astro page imports `data/insights.json` and passes pre-computed values directly to components:
```typescript
import insights from '../../data/insights.json';
const { top_countries, category_breakdown } = insights.chemicals;
```
No aggregation in Astro frontmatter — just pass-through to recharts.
