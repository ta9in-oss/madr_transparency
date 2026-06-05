# Chapter Pages & Data Explorer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the four chapter pages with real data, a reusable DataExplorer (search + filter + paginated table), and a HorizontalBarChart using visx — all in Arabic by default with RTL layout.

**Architecture:** Each chapter page is a static Astro page that loads its data at build time, renders a visx chart and a client-side DataExplorer React island. All strings come from i18n files. Layout is RTL when lang=ar.

**Tech Stack:** Astro · React · visx (@visx/shape, @visx/scale, @visx/axis, @visx/group, @visx/tooltip, @visx/text) · Framer Motion · Tailwind CSS (Ink/Forest tokens)

---

## Repo context

- Repo root: `/home/mohessaid/workspaces/ta9in_oss/madr`
- Default language: **Arabic** (`lang: Lang = 'ar'`)
- Data loaders: `src/lib/data.ts` — 8 typed functions, all working
- i18n: `src/lib/i18n.ts` — `t(lang, key)` — all keys in fr/ar/en JSON
- Shared components: BaseLayout, SiteHeader, SiteFooter, StatCard, SectionHeader — all ready
- Design tokens: Ink `#111318`, Forest `#2d6a4f`, Surface `#f3f2ef`, Line `#e5e4e0`, Muted `#6b7280`
- Commit style: gitmoji

## File structure for this plan

```
src/
├── components/
│   ├── charts/
│   │   ├── HorizontalBarChart.tsx   ← visx bar chart (origin countries / categories)
│   │   └── ChartTooltip.tsx         ← shared tooltip
│   └── explorer/
│       ├── DataExplorer.tsx         ← composes Search + Filter + Table
│       ├── SearchBar.tsx
│       ├── FilterBar.tsx
│       └── DataTable.tsx
└── pages/
    ├── dependency.astro             ← Chapter 01
    ├── chemicals.astro              ← Chapter 02
    ├── players.astro                ← Chapter 03
    └── veterinary.astro             ← Chapter 04
```

---

## Task 1: ChartTooltip + HorizontalBarChart (visx)

**Files:**
- Create: `src/components/charts/ChartTooltip.tsx`
- Create: `src/components/charts/HorizontalBarChart.tsx`

The HorizontalBarChart shows a ranked list of items (countries or categories) with their record count. It takes an array of `{label, count}` and renders horizontal bars using visx, with Framer Motion entry animation.

- [ ] **Step 1: Create src/components/charts/ChartTooltip.tsx**

```tsx
interface Props {
  label: string;
  value: number;
  color?: string;
}

export function ChartTooltip({ label, value, color = '#2d6a4f' }: Props) {
  return (
    <div className="bg-ink text-paper text-xs font-mono px-3 py-1.5 rounded shadow-md pointer-events-none">
      <span style={{ color }}>{label}</span>
      <span className="mx-1.5 text-muted">·</span>
      <span className="tabular-nums">{value.toLocaleString()}</span>
    </div>
  );
}
```

- [ ] **Step 2: Create src/components/charts/HorizontalBarChart.tsx**

```tsx
import { useMemo, useState } from 'react';
import { scaleBand, scaleLinear } from '@visx/scale';
import { Bar } from '@visx/shape';
import { Group } from '@visx/group';
import { AxisBottom } from '@visx/axis';
import { Text } from '@visx/text';
import { motion, AnimatePresence } from 'framer-motion';
import { getCategoryColor } from '../../lib/categoryColors';

export interface BarDatum {
  label: string;
  count: number;
}

interface Props {
  data: BarDatum[];
  width?: number;
  maxBars?: number;
  colorByLabel?: boolean;
  title?: string;
}

const MARGIN = { top: 8, right: 16, bottom: 36, left: 160 };

export function HorizontalBarChart({
  data,
  width = 640,
  maxBars = 15,
  colorByLabel = false,
  title,
}: Props) {
  const [hovered, setHovered] = useState<string | null>(null);

  const sorted = useMemo(
    () => [...data].sort((a, b) => b.count - a.count).slice(0, maxBars),
    [data, maxBars]
  );

  const barHeight = 28;
  const height = sorted.length * barHeight + MARGIN.top + MARGIN.bottom;
  const innerWidth = Math.max(width - MARGIN.left - MARGIN.right, 1);
  const innerHeight = sorted.length * barHeight;

  const xScale = scaleLinear({
    domain: [0, Math.max(...sorted.map((d) => d.count))],
    range: [0, innerWidth],
    nice: true,
  });

  const yScale = scaleBand({
    domain: sorted.map((d) => d.label),
    range: [0, innerHeight],
    padding: 0.25,
  });

  return (
    <div className="w-full overflow-x-auto">
      {title && (
        <p className="text-sm font-mono text-muted mb-3 uppercase tracking-widest">{title}</p>
      )}
      <svg width={width} height={height} role="img">
        <Group top={MARGIN.top} left={MARGIN.left}>
          {sorted.map((d, i) => {
            const barWidth = xScale(d.count);
            const barY = yScale(d.label) ?? 0;
            const bh = yScale.bandwidth();
            const color = colorByLabel ? getCategoryColor(d.label) : '#2d6a4f';
            const isHovered = hovered === d.label;

            return (
              <g
                key={d.label}
                onMouseEnter={() => setHovered(d.label)}
                onMouseLeave={() => setHovered(null)}
                style={{ cursor: 'default' }}
              >
                {/* Label */}
                <Text
                  x={-8}
                  y={barY + bh / 2}
                  textAnchor="end"
                  verticalAnchor="middle"
                  fontSize={11}
                  fontFamily="DM Mono, monospace"
                  fill={isHovered ? color : '#6b7280'}
                  width={MARGIN.left - 12}
                >
                  {d.label}
                </Text>

                {/* Animated bar using motion.rect via foreignObject workaround */}
                <motion.rect
                  x={0}
                  y={barY}
                  height={bh}
                  width={barWidth}
                  fill={color}
                  opacity={isHovered ? 1 : 0.82}
                  rx={2}
                  initial={{ width: 0 }}
                  animate={{ width: barWidth }}
                  transition={{ duration: 0.5, delay: i * 0.03, ease: 'easeOut' }}
                />

                {/* Count label */}
                <motion.text
                  x={barWidth + 6}
                  y={barY + bh / 2}
                  dominantBaseline="middle"
                  fontSize={10}
                  fontFamily="DM Mono, monospace"
                  fill="#6b7280"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 + 0.4 }}
                >
                  {d.count.toLocaleString()}
                </motion.text>
              </g>
            );
          })}

          <AxisBottom
            scale={xScale}
            top={innerHeight}
            stroke="#e5e4e0"
            tickStroke="#e5e4e0"
            tickLabelProps={{ fontSize: 10, fontFamily: 'DM Mono, monospace', fill: '#6b7280' }}
            numTicks={5}
          />
        </Group>
      </svg>
    </div>
  );
}
```

- [ ] **Step 3: Verify build passes**

```bash
npm run build 2>&1 | tail -5
```

Expected: builds without errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/charts/ChartTooltip.tsx src/components/charts/HorizontalBarChart.tsx
git commit -m "✨ add HorizontalBarChart with visx and Framer Motion entry animation"
```

---

## Task 2: DataExplorer — SearchBar + FilterBar + DataTable + DataExplorer

**Files:**
- Create: `src/components/explorer/SearchBar.tsx`
- Create: `src/components/explorer/FilterBar.tsx`
- Create: `src/components/explorer/DataTable.tsx`
- Create: `src/components/explorer/DataExplorer.tsx`

The DataExplorer is a client-side React island. It receives the full dataset as a prop, handles search/filter/pagination in the browser with no server round-trips. All labels from an `i18n` prop (a subset of the translation dict).

- [ ] **Step 1: Create src/components/explorer/SearchBar.tsx**

```tsx
interface Props {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}

export function SearchBar({ value, onChange, placeholder }: Props) {
  return (
    <div className="relative flex-1 min-w-[200px]">
      <svg
        className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
        width="14" height="14" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
      </svg>
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-9 pr-4 py-2 text-sm bg-surface border border-line rounded text-ink placeholder:text-muted focus:outline-none focus:border-forest transition-colors"
      />
    </div>
  );
}
```

- [ ] **Step 2: Create src/components/explorer/FilterBar.tsx**

```tsx
interface Props {
  options: string[];
  selected: string;
  onChange: (v: string) => void;
  placeholder: string;
}

export function FilterBar({ options, selected, onChange, placeholder }: Props) {
  if (options.length === 0) return null;
  return (
    <select
      value={selected}
      onChange={(e) => onChange(e.target.value)}
      className="py-2 px-3 text-sm bg-surface border border-line rounded text-ink focus:outline-none focus:border-forest transition-colors min-w-[140px]"
    >
      <option value="">{placeholder}</option>
      {options.map((opt) => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
  );
}
```

- [ ] **Step 3: Create src/components/explorer/DataTable.tsx**

```tsx
import { getCategoryColor } from '../../lib/categoryColors';

interface Column {
  key: string;
  label: string;
  mono?: boolean;
}

interface Props {
  rows: Record<string, string>[];
  columns: Column[];
  categoryKey?: string;
}

export function DataTable({ rows, columns, categoryKey }: Props) {
  if (rows.length === 0) {
    return (
      <div className="py-12 text-center text-sm text-muted font-body">
        لا نتائج لهذا البحث.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded border border-line">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b border-line bg-surface">
            {columns.map((col) => (
              <th
                key={col.key}
                className="px-4 py-2.5 text-start text-xs font-mono text-muted uppercase tracking-wide whitespace-nowrap"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => {
            const category = categoryKey ? row[categoryKey] ?? '' : '';
            const hoverColor = getCategoryColor(category);
            return (
              <tr
                key={i}
                className="border-b border-line last:border-0 hover:bg-forest-tint transition-colors"
                style={{ '--hover-accent': hoverColor } as React.CSSProperties}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`px-4 py-2.5 text-ink align-top ${col.mono ? 'font-mono text-data' : 'font-body'}`}
                  >
                    {row[col.key] ?? '—'}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
```

- [ ] **Step 4: Create src/components/explorer/DataExplorer.tsx**

```tsx
import { useState, useMemo } from 'react';
import { SearchBar } from './SearchBar';
import { FilterBar } from './FilterBar';
import { DataTable } from './DataTable';

interface Column {
  key: string;
  label: string;
  mono?: boolean;
}

interface I18nLabels {
  search_placeholder: string;
  filter_country: string;
  filter_category: string;
  filter_all: string;
  no_results: string;
  showing: string;
  of: string;
  records: string;
  prev: string;
  next: string;
}

interface Props {
  rows: Record<string, string>[];
  columns: Column[];
  searchKeys: string[];
  filterKey?: string;
  filterLabel?: string;
  categoryKey?: string;
  i18n: I18nLabels;
  pageSize?: number;
}

const PAGE_SIZE = 25;

export function DataExplorer({
  rows,
  columns,
  searchKeys,
  filterKey,
  filterLabel,
  categoryKey,
  i18n,
  pageSize = PAGE_SIZE,
}: Props) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('');
  const [page, setPage] = useState(1);

  const filterOptions = useMemo(() => {
    if (!filterKey) return [];
    const seen = new Set<string>();
    for (const row of rows) {
      const v = row[filterKey];
      if (v) seen.add(v);
    }
    return [...seen].sort();
  }, [rows, filterKey]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return rows.filter((row) => {
      const matchesSearch = !q || searchKeys.some((k) => row[k]?.toLowerCase().includes(q));
      const matchesFilter = !filter || (filterKey && row[filterKey] === filter);
      return matchesSearch && matchesFilter;
    });
  }, [rows, query, filter, searchKeys, filterKey]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageRows = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  function handleQuery(v: string) { setQuery(v); setPage(1); }
  function handleFilter(v: string) { setFilter(v); setPage(1); }

  return (
    <div className="flex flex-col gap-4">
      {/* Controls */}
      <div className="flex flex-wrap gap-3 items-center">
        <SearchBar value={query} onChange={handleQuery} placeholder={i18n.search_placeholder} />
        {filterKey && (
          <FilterBar
            options={filterOptions}
            selected={filter}
            onChange={handleFilter}
            placeholder={filterLabel ?? i18n.filter_all}
          />
        )}
        <span className="text-xs text-muted font-mono ms-auto whitespace-nowrap">
          {i18n.showing} {filtered.length.toLocaleString()} {i18n.of} {rows.length.toLocaleString()} {i18n.records}
        </span>
      </div>

      {/* Table */}
      <DataTable rows={pageRows} columns={columns} categoryKey={categoryKey} />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center gap-2 justify-end">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1.5 text-xs border border-line rounded text-ink hover:bg-surface disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {i18n.prev}
          </button>
          <span className="text-xs font-mono text-muted">
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1.5 text-xs border border-line rounded text-ink hover:bg-surface disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {i18n.next}
          </button>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 5: Verify build passes**

```bash
npm run build 2>&1 | tail -5
```

Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add src/components/explorer/
git commit -m "✨ add DataExplorer with search, filter, pagination and sortable table"
```

---

## Task 3: dependency.astro — Chapter 01

**Files:**
- Create: `src/pages/dependency.astro`

Chapter 01 covers seeds, seedlings, potato seeds, and plant products. The chart shows top 15 countries of origin across all four datasets. The explorer shows plant products with filter by category.

- [ ] **Step 1: Create src/pages/dependency.astro**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import SiteHeader from '../components/shared/SiteHeader.astro';
import SiteFooter from '../components/shared/SiteFooter.astro';
import { SectionHeader } from '../components/shared/SectionHeader';
import { HorizontalBarChart } from '../components/charts/HorizontalBarChart';
import { DataExplorer } from '../components/explorer/DataExplorer';
import { t, getTranslations } from '../lib/i18n';
import {
  loadPlantProducts,
  loadSeedlings,
  loadSeeds,
  loadPotatoSeeds,
} from '../lib/data';
import type { Lang } from '../lib/types';

const lang: Lang = 'ar';
const tr = getTranslations(lang);

const plantProducts = loadPlantProducts();
const seedlings     = loadSeedlings();
const seeds         = loadSeeds();
const potatoSeeds   = loadPotatoSeeds();

const allRecords = [...plantProducts, ...seedlings, ...seeds, ...potatoSeeds];
const totalCount = allRecords.length;

// Build country origin chart data
const countryCounts: Record<string, number> = {};
for (const r of allRecords) {
  const countries = r.countryOfOrigin.split(/[,\-\/]/).map(s => s.trim()).filter(Boolean);
  for (const c of countries) {
    if (c) countryCounts[c.toLowerCase()] = (countryCounts[c.toLowerCase()] ?? 0) + 1;
  }
}
const countryChartData = Object.entries(countryCounts)
  .map(([label, count]) => ({ label, count }))
  .sort((a, b) => b.count - a.count)
  .slice(0, 15);

// Explorer rows — plant products with category filter
const explorerRows = plantProducts.map(r => ({
  company:         r.company,
  known_name:      r.knownName,
  variety:         r.variety,
  category:        r.category,
  country_origin:  r.countryOfOrigin,
}));

const explorerColumns = [
  { key: 'company',        label: 'Entreprise' },
  { key: 'known_name',     label: 'Produit',   mono: true },
  { key: 'variety',        label: 'Variété',   mono: true },
  { key: 'category',       label: 'Catégorie', mono: true },
  { key: 'country_origin', label: 'Origine',   mono: true },
];

const explorerI18n = {
  search_placeholder: tr.explorer.search_placeholder,
  filter_country:     tr.explorer.filter_country,
  filter_category:    tr.explorer.filter_category,
  filter_all:         tr.explorer.filter_all,
  no_results:         tr.explorer.no_results,
  showing:            tr.explorer.showing,
  of:                 tr.explorer.of,
  records:            tr.explorer.records,
  prev:               tr.explorer.prev,
  next:               tr.explorer.next,
};
---

<BaseLayout title={t(lang, 'chapters.ch1_title')} lang={lang}>
  <SiteHeader lang={lang} />

  <main class="max-w-6xl mx-auto px-4 sm:px-6 py-12 flex-1">

    <SectionHeader
      chapterNum={t(lang, 'chapters.ch1_num')}
      title={t(lang, 'chapters.ch1_title')}
      lead={t(lang, 'chapters.ch1_lead')}
    />

    <!-- Key finding -->
    <div class="mb-10 p-5 bg-surface border border-line rounded-lg max-w-2xl">
      <p class="text-sm text-muted font-body leading-relaxed">
        <span class="font-mono text-forest text-display-sm font-bold">{totalCount.toLocaleString('ar-DZ')}</span>
        {' '}{t(lang, 'stats.fruit_imports')}
      </p>
    </div>

    <!-- Country of origin chart -->
    <section class="mb-14">
      <HorizontalBarChart
        client:visible
        data={countryChartData}
        title={t(lang, 'explorer.filter_country')}
        maxBars={15}
        colorByLabel={false}
      />
    </section>

    <!-- Data explorer -->
    <section>
      <h2 class="font-display font-bold text-display-sm text-ink mb-6">
        {t(lang, 'chapters.explore')}
      </h2>
      <DataExplorer
        client:visible
        rows={explorerRows}
        columns={explorerColumns}
        searchKeys={['company', 'known_name', 'variety', 'country_origin']}
        filterKey="category"
        filterLabel={t(lang, 'explorer.filter_category')}
        categoryKey="category"
        i18n={explorerI18n}
      />
    </section>

  </main>

  <SiteFooter lang={lang} />
</BaseLayout>
```

- [ ] **Step 2: Verify build**

```bash
npm run build 2>&1 | tail -5
```

Expected: no errors, `/dependency` page in dist.

- [ ] **Step 3: Commit**

```bash
git add src/pages/dependency.astro
git commit -m "✨ add Chapter 01 — Agricultural Dependency with origin chart and explorer"
```

---

## Task 4: chemicals.astro — Chapter 02

**Files:**
- Create: `src/pages/chemicals.astro`

Chapter 02 covers agrochemicals (5,058 records). The chart shows top categories. Explorer shows all with filter by category and country.

- [ ] **Step 1: Create src/pages/chemicals.astro**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import SiteHeader from '../components/shared/SiteHeader.astro';
import SiteFooter from '../components/shared/SiteFooter.astro';
import { SectionHeader } from '../components/shared/SectionHeader';
import { HorizontalBarChart } from '../components/charts/HorizontalBarChart';
import { DataExplorer } from '../components/explorer/DataExplorer';
import { t, getTranslations } from '../lib/i18n';
import { loadAgrochemicals } from '../lib/data';
import type { Lang } from '../lib/types';

const lang: Lang = 'ar';
const tr = getTranslations(lang);

const records = loadAgrochemicals();

// Category chart
const catCounts: Record<string, number> = {};
for (const r of records) {
  const cat = r.category || 'Autre';
  catCounts[cat] = (catCounts[cat] ?? 0) + 1;
}
const categoryChartData = Object.entries(catCounts)
  .map(([label, count]) => ({ label, count }))
  .sort((a, b) => b.count - a.count);

// Country chart
const countryCounts: Record<string, number> = {};
for (const r of records) {
  const c = r.countryOfOrigin || 'Inconnu';
  countryCounts[c] = (countryCounts[c] ?? 0) + 1;
}
const countryChartData = Object.entries(countryCounts)
  .map(([label, count]) => ({ label, count }))
  .sort((a, b) => b.count - a.count)
  .slice(0, 12);

const explorerRows = records.map(r => ({
  company:          r.company,
  product_name:     r.productName,
  active_substance: r.activeSubstance,
  category:         r.category,
  country_origin:   r.countryOfOrigin,
}));

const explorerColumns = [
  { key: 'company',          label: 'Entreprise' },
  { key: 'product_name',     label: 'Produit',    mono: true },
  { key: 'active_substance', label: 'Substance',  mono: true },
  { key: 'category',         label: 'Catégorie',  mono: true },
  { key: 'country_origin',   label: 'Origine',    mono: true },
];

const explorerI18n = {
  search_placeholder: tr.explorer.search_placeholder,
  filter_country: tr.explorer.filter_country,
  filter_category: tr.explorer.filter_category,
  filter_all: tr.explorer.filter_all,
  no_results: tr.explorer.no_results,
  showing: tr.explorer.showing,
  of: tr.explorer.of,
  records: tr.explorer.records,
  prev: tr.explorer.prev,
  next: tr.explorer.next,
};
---

<BaseLayout title={t(lang, 'chapters.ch2_title')} lang={lang}>
  <SiteHeader lang={lang} />

  <main class="max-w-6xl mx-auto px-4 sm:px-6 py-12 flex-1">

    <SectionHeader
      chapterNum={t(lang, 'chapters.ch2_num')}
      title={t(lang, 'chapters.ch2_title')}
      lead={t(lang, 'chapters.ch2_lead')}
    />

    <!-- Stats -->
    <div class="mb-10 p-5 bg-surface border border-line rounded-lg max-w-2xl">
      <p class="text-sm text-muted font-body leading-relaxed">
        <span class="font-mono text-forest text-display-sm font-bold">{records.length.toLocaleString('ar-DZ')}</span>
        {' '}{t(lang, 'stats.agrochemicals')}
      </p>
    </div>

    <!-- Charts -->
    <div class="grid md:grid-cols-2 gap-8 mb-14">
      <section>
        <HorizontalBarChart
          client:visible
          data={categoryChartData}
          title={t(lang, 'explorer.filter_category')}
          colorByLabel={true}
        />
      </section>
      <section>
        <HorizontalBarChart
          client:visible
          data={countryChartData}
          title={t(lang, 'explorer.filter_country')}
          colorByLabel={false}
        />
      </section>
    </div>

    <!-- Explorer -->
    <section>
      <h2 class="font-display font-bold text-display-sm text-ink mb-6">
        {t(lang, 'chapters.explore')}
      </h2>
      <DataExplorer
        client:visible
        rows={explorerRows}
        columns={explorerColumns}
        searchKeys={['company', 'product_name', 'active_substance', 'country_origin']}
        filterKey="category"
        filterLabel={t(lang, 'explorer.filter_category')}
        categoryKey="category"
        i18n={explorerI18n}
      />
    </section>

  </main>

  <SiteFooter lang={lang} />
</BaseLayout>
```

- [ ] **Step 2: Verify build and commit**

```bash
npm run build 2>&1 | tail -5
git add src/pages/chemicals.astro
git commit -m "✨ add Chapter 02 — 5,000 Chemicals with category/country charts and explorer"
```

---

## Task 5: players.astro — Chapter 03

**Files:**
- Create: `src/pages/players.astro`

Chapter 03 shows which companies hold the most licenses across all 8 datasets. Chart: top 20 companies by total record count. Explorer: all records flattened with dataset column.

- [ ] **Step 1: Create src/pages/players.astro**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import SiteHeader from '../components/shared/SiteHeader.astro';
import SiteFooter from '../components/shared/SiteFooter.astro';
import { SectionHeader } from '../components/shared/SectionHeader';
import { HorizontalBarChart } from '../components/charts/HorizontalBarChart';
import { DataExplorer } from '../components/explorer/DataExplorer';
import { t, getTranslations } from '../lib/i18n';
import {
  loadAgrochemicals, loadPlantProducts, loadSeedlings, loadSeeds,
  loadPotatoSeeds, loadVetAuthorizations, loadVetDistributors, loadVetMedicineImporters,
} from '../lib/data';
import type { Lang } from '../lib/types';

const lang: Lang = 'ar';
const tr = getTranslations(lang);

// Flatten all datasets with a dataset label
const allRecords: { company: string; dataset: string }[] = [
  ...loadAgrochemicals().map(r     => ({ company: r.company, dataset: 'Phytosanitaires' })),
  ...loadPlantProducts().map(r     => ({ company: r.company, dataset: 'Végétaux' })),
  ...loadSeedlings().map(r         => ({ company: r.company, dataset: 'Plants' })),
  ...loadSeeds().map(r             => ({ company: r.company, dataset: 'Semences' })),
  ...loadPotatoSeeds().map(r       => ({ company: r.company, dataset: 'Pomme de terre' })),
  ...loadVetAuthorizations().map(r => ({ company: r.company, dataset: 'Vet. autorisations' })),
  ...loadVetDistributors().map(r   => ({ company: r.company, dataset: 'Vet. distributeurs' })),
  ...loadVetMedicineImporters().map(r => ({ company: r.company, dataset: 'Vet. importateurs' })),
];

// Company ranking
const companyCounts: Record<string, number> = {};
for (const r of allRecords) {
  if (r.company) companyCounts[r.company] = (companyCounts[r.company] ?? 0) + 1;
}
const companyChartData = Object.entries(companyCounts)
  .map(([label, count]) => ({ label, count }))
  .sort((a, b) => b.count - a.count)
  .slice(0, 20);

const uniqueCompanies = Object.keys(companyCounts).length;

// Explorer rows
const explorerRows = allRecords.map(r => ({
  company: r.company,
  dataset: r.dataset,
  count:   String(companyCounts[r.company] ?? 1),
}));

const explorerColumns = [
  { key: 'company', label: 'Entreprise' },
  { key: 'dataset', label: 'Secteur',  mono: true },
  { key: 'count',   label: 'Licences', mono: true },
];

const explorerI18n = {
  search_placeholder: tr.explorer.search_placeholder,
  filter_country: tr.explorer.filter_country,
  filter_category: tr.explorer.filter_category,
  filter_all: tr.explorer.filter_all,
  no_results: tr.explorer.no_results,
  showing: tr.explorer.showing,
  of: tr.explorer.of,
  records: tr.explorer.records,
  prev: tr.explorer.prev,
  next: tr.explorer.next,
};
---

<BaseLayout title={t(lang, 'chapters.ch3_title')} lang={lang}>
  <SiteHeader lang={lang} />

  <main class="max-w-6xl mx-auto px-4 sm:px-6 py-12 flex-1">

    <SectionHeader
      chapterNum={t(lang, 'chapters.ch3_num')}
      title={t(lang, 'chapters.ch3_title')}
      lead={t(lang, 'chapters.ch3_lead')}
    />

    <!-- Stats -->
    <div class="mb-10 p-5 bg-surface border border-line rounded-lg max-w-2xl">
      <p class="text-sm text-muted font-body">
        <span class="font-mono text-forest text-display-sm font-bold">{uniqueCompanies.toLocaleString('ar-DZ')}</span>
        {' '}entreprises détentrices de licences d'importation.
      </p>
    </div>

    <!-- Company ranking chart -->
    <section class="mb-14">
      <HorizontalBarChart
        client:visible
        data={companyChartData}
        title="Top 20 entreprises par nombre de licences"
        maxBars={20}
        width={720}
      />
    </section>

    <!-- Explorer -->
    <section>
      <h2 class="font-display font-bold text-display-sm text-ink mb-6">
        {t(lang, 'chapters.explore')}
      </h2>
      <DataExplorer
        client:visible
        rows={explorerRows}
        columns={explorerColumns}
        searchKeys={['company', 'dataset']}
        filterKey="dataset"
        filterLabel="Secteur"
        i18n={explorerI18n}
      />
    </section>

  </main>

  <SiteFooter lang={lang} />
</BaseLayout>
```

- [ ] **Step 2: Verify build and commit**

```bash
npm run build 2>&1 | tail -5
git add src/pages/players.astro
git commit -m "✨ add Chapter 03 — Key Players with company ranking chart"
```

---

## Task 6: veterinary.astro — Chapter 04

**Files:**
- Create: `src/pages/veterinary.astro`

Chapter 04 covers vet authorizations, vet distributors (with wilaya), and vet medicine importers.

- [ ] **Step 1: Create src/pages/veterinary.astro**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import SiteHeader from '../components/shared/SiteHeader.astro';
import SiteFooter from '../components/shared/SiteFooter.astro';
import { SectionHeader } from '../components/shared/SectionHeader';
import { HorizontalBarChart } from '../components/charts/HorizontalBarChart';
import { DataExplorer } from '../components/explorer/DataExplorer';
import { t, getTranslations } from '../lib/i18n';
import {
  loadVetAuthorizations,
  loadVetDistributors,
  loadVetMedicineImporters,
} from '../lib/data';
import type { Lang } from '../lib/types';

const lang: Lang = 'ar';
const tr = getTranslations(lang);

const auths       = loadVetAuthorizations();
const distributors = loadVetDistributors();
const importers   = loadVetMedicineImporters();

// Wilaya distribution chart
const wilayaCounts: Record<string, number> = {};
for (const r of distributors) {
  if (r.wilaya) wilayaCounts[r.wilaya] = (wilayaCounts[r.wilaya] ?? 0) + 1;
}
const wilayaChartData = Object.entries(wilayaCounts)
  .map(([label, count]) => ({ label, count }))
  .sort((a, b) => b.count - a.count)
  .slice(0, 20);

// Product type chart for authorizations
const typeCounts: Record<string, number> = {};
for (const r of auths) {
  const t_ = r.productType || 'Autre';
  typeCounts[t_] = (typeCounts[t_] ?? 0) + 1;
}
const typeChartData = Object.entries(typeCounts)
  .map(([label, count]) => ({ label, count }))
  .sort((a, b) => b.count - a.count);

// Explorer: distributors with wilaya filter
const explorerRows = distributors.map(r => ({
  company: r.company,
  wilaya:  r.wilaya,
  address: r.address,
  number:  r.number,
}));

const explorerColumns = [
  { key: 'company', label: 'Entreprise' },
  { key: 'wilaya',  label: 'Wilaya',  mono: true },
  { key: 'number',  label: 'N°',      mono: true },
  { key: 'address', label: 'Adresse' },
];

const explorerI18n = {
  search_placeholder: tr.explorer.search_placeholder,
  filter_country: tr.explorer.filter_country,
  filter_category: tr.explorer.filter_category,
  filter_all: tr.explorer.filter_all,
  no_results: tr.explorer.no_results,
  showing: tr.explorer.showing,
  of: tr.explorer.of,
  records: tr.explorer.records,
  prev: tr.explorer.prev,
  next: tr.explorer.next,
};
---

<BaseLayout title={t(lang, 'chapters.ch4_title')} lang={lang}>
  <SiteHeader lang={lang} />

  <main class="max-w-6xl mx-auto px-4 sm:px-6 py-12 flex-1">

    <SectionHeader
      chapterNum={t(lang, 'chapters.ch4_num')}
      title={t(lang, 'chapters.ch4_title')}
      lead={t(lang, 'chapters.ch4_lead')}
    />

    <!-- Stats bar -->
    <div class="grid grid-cols-3 gap-4 mb-10">
      <div class="p-4 bg-surface border border-line rounded-lg text-center">
        <div class="font-mono text-forest text-display-sm font-bold">{auths.length}</div>
        <div class="text-xs text-muted font-body mt-1">autorisations</div>
      </div>
      <div class="p-4 bg-surface border border-line rounded-lg text-center">
        <div class="font-mono text-forest text-display-sm font-bold">{distributors.length}</div>
        <div class="text-xs text-muted font-body mt-1">distributeurs</div>
      </div>
      <div class="p-4 bg-surface border border-line rounded-lg text-center">
        <div class="font-mono text-forest text-display-sm font-bold">{importers.length}</div>
        <div class="text-xs text-muted font-body mt-1">importateurs</div>
      </div>
    </div>

    <!-- Charts -->
    <div class="grid md:grid-cols-2 gap-8 mb-14">
      <section>
        <HorizontalBarChart
          client:visible
          data={wilayaChartData}
          title="Distributeurs par wilaya"
          maxBars={20}
        />
      </section>
      <section>
        <HorizontalBarChart
          client:visible
          data={typeChartData}
          title="Types de produits autorisés"
          colorByLabel={false}
        />
      </section>
    </div>

    <!-- Explorer: distributors -->
    <section>
      <h2 class="font-display font-bold text-display-sm text-ink mb-6">
        {t(lang, 'chapters.explore')} — distributeurs
      </h2>
      <DataExplorer
        client:visible
        rows={explorerRows}
        columns={explorerColumns}
        searchKeys={['company', 'wilaya', 'address']}
        filterKey="wilaya"
        filterLabel="Wilaya"
        i18n={explorerI18n}
      />
    </section>

  </main>

  <SiteFooter lang={lang} />
</BaseLayout>
```

- [ ] **Step 2: Verify build and commit**

```bash
npm run build 2>&1 | tail -5
git add src/pages/veterinary.astro
git commit -m "✨ add Chapter 04 — Veterinary Chain with wilaya distribution chart"
```

---

## Task 7: Push and verify deployment

- [ ] **Step 1: Run full test suite**

```bash
npm test
```

Expected: all 20 tests passing.

- [ ] **Step 2: Final build check**

```bash
npm run build 2>&1 | tail -8
ls dist/
```

Expected: dist/ contains index.html, dependency/index.html, chemicals/index.html, players/index.html, veterinary/index.html

- [ ] **Step 3: Push to trigger deploy**

```bash
git push
```

The "Build and deploy" GitHub Actions workflow will run and deploy to Cloudflare Pages automatically.

- [ ] **Step 4: Verify deployment**

After the workflow completes (~2 min), check:
- https://madrdz.ta9in.com — landing page in Arabic
- https://madrdz.ta9in.com/chemicals — chemicals chapter with chart
- https://madrdz.ta9in.com/dependency — dependency chapter
- https://madrdz.ta9in.com/players — players chapter
- https://madrdz.ta9in.com/veterinary — veterinary chapter

Report the live URLs in your status.
