# Plan B: UI Overhaul — Recharts + RTL + Copy

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace visx with recharts in all chart components, fix RTL design nuances across all pages, and rewrite em-dash copy into proper sentence structure. This plan is independent of Plan A and can run in parallel.

**Architecture:** Two visx-dependent components (`HorizontalBarChart.tsx` uses @visx/scale/group/axis/text; `WorldMap.tsx` uses @visx/geo) are rewritten from scratch using recharts. All other charts (WilayaMap, WilayaGrid, WorldBubbleMap) already use no visx and are left untouched. The unused `WorldBubbleMap.tsx` is deleted. RTL fixes target chart wrappers, nav arrow direction, and table alignment.

**Tech Stack:** recharts 2.x, framer-motion (kept for animations), React, TypeScript, Tailwind CSS

---

## File Map

| File | Action | Purpose |
|------|--------|---------|
| `src/components/charts/HorizontalBarChart.tsx` | Rewrite | Replace visx with recharts BarChart |
| `src/components/charts/WorldMap.tsx` | Rewrite | Replace @visx/geo with react-simple-maps |
| `src/components/charts/WorldBubbleMap.tsx` | Delete | Unused component |
| `src/components/shared/SiteHeader.astro` | Modify | RTL: hamburger left on mobile for AR |
| `src/components/shared/ChapterNav.astro` | Modify | Flip arrow direction for RTL |
| `src/pages/index.astro` | Modify | Remove em-dashes, rewrite prose |
| `src/pages/fr/index.astro` | Modify | Same |
| `src/pages/en/index.astro` | Modify | Same |
| `src/pages/dependency.astro` | Modify | Remove em-dashes in callout/section text |
| `src/pages/fr/dependency.astro` | Modify | Same |
| `src/pages/en/dependency.astro` | Modify | Same |
| `src/pages/chemicals.astro` | Modify | Remove em-dashes |
| `src/pages/fr/chemicals.astro` | Modify | Same |
| `src/pages/en/chemicals.astro` | Modify | Same |
| `src/pages/veterinary.astro` | Modify | Remove em-dashes |
| `src/pages/fr/veterinary.astro` | Modify | Same |
| `src/pages/en/veterinary.astro` | Modify | Same |
| `src/pages/players.astro` | Modify | Remove em-dashes |
| `src/pages/fr/players.astro` | Modify | Same |
| `src/pages/en/players.astro` | Modify | Same |
| `package.json` | Modify | Add recharts + react-simple-maps; remove @visx/* |

---

### Task 1: Install recharts, remove visx chart packages

**Files:**
- Modify: `package.json` (via npm)

- [ ] **Step 1: Install recharts and react-simple-maps**

```bash
cd /home/mohessaid/workspaces/ta9in_oss/madr
npm install recharts react-simple-maps
```

- [ ] **Step 2: Remove visx packages that are only used for charts**

The packages used ONLY for charting (safe to remove after rewrite):
`@visx/scale`, `@visx/group`, `@visx/axis`, `@visx/text`, `@visx/geo`

NOTE: Check first — `@visx/hierarchy`, `@visx/shape`, `@visx/tooltip` may be unused too:
```bash
grep -rn "@visx" src/ --include="*.tsx" --include="*.ts" --include="*.astro"
```
Remove only packages with zero remaining imports after the rewrites in Tasks 2 and 3.

Do NOT remove yet — remove after HorizontalBarChart and WorldMap rewrites are complete.

- [ ] **Step 3: Build to confirm recharts installed correctly**

```bash
npm run build 2>&1 | tail -5
```
Expected: `[build] Complete!`

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "deps: add recharts + react-simple-maps"
```

---

### Task 2: Rewrite HorizontalBarChart.tsx with recharts

The current component uses `@visx/scale`, `@visx/group`, `@visx/axis`, `@visx/text`, `framer-motion`, and a custom `ResizeObserver`. The recharts version uses `BarChart` with `layout="vertical"` (recharts calls horizontal bars "vertical" because the bars grow left-to-right). Recharts handles responsive sizing via `ResponsiveContainer`.

**Files:**
- Rewrite: `src/components/charts/HorizontalBarChart.tsx`

- [ ] **Step 1: Read the current file to understand the Props interface**

Current Props:
```typescript
interface Props {
  data: BarDatum[];        // { label: string; count: number }[]
  width?: number;          // ignored in new version
  maxBars?: number;        // default 15
  colorByLabel?: boolean;  // use getCategoryColor() per bar
  title?: string;
  isRtl?: boolean;
}
```

- [ ] **Step 2: Write the new HorizontalBarChart.tsx**

```typescript
import { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, LabelList,
} from 'recharts';
import { getCategoryColor } from '../../lib/categoryColors';

export interface BarDatum {
  label: string;
  count: number;
}

interface Props {
  data: BarDatum[];
  maxBars?: number;
  colorByLabel?: boolean;
  title?: string;
  isRtl?: boolean;
}

const DEFAULT_COLOR = '#2d6a4f';

export function HorizontalBarChart({
  data,
  maxBars = 15,
  colorByLabel = false,
  title,
  isRtl = false,
}: Props) {
  const sorted = useMemo(
    () => [...data].sort((a, b) => b.count - a.count).slice(0, maxBars),
    [data, maxBars]
  );

  // recharts "vertical" layout = horizontal bars
  const barHeight = 28;
  const chartHeight = sorted.length * barHeight + 60;

  // For RTL: reverse the bar direction by inverting the x-axis
  const xAxisReversed = isRtl;

  return (
    <div className="w-full" style={{ direction: 'ltr' }}>
      {title && (
        <p
          className="text-sm font-medium text-ink mb-3"
          style={{ direction: isRtl ? 'rtl' : 'ltr' }}
        >
          {title}
        </p>
      )}
      <ResponsiveContainer width="100%" height={chartHeight}>
        <BarChart
          data={sorted}
          layout="vertical"
          margin={{ top: 4, right: 48, bottom: 4, left: isRtl ? 16 : 160 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e4e0" horizontal={false} />
          <XAxis
            type="number"
            reversed={xAxisReversed}
            tick={{ fontSize: 11, fontFamily: 'ui-monospace, monospace', fill: '#6b7280' }}
            tickLine={{ stroke: '#e5e4e0' }}
            axisLine={{ stroke: '#e5e4e0' }}
            tickFormatter={(v: number) => (Number.isInteger(v) ? v.toLocaleString() : '')}
          />
          <YAxis
            type="category"
            dataKey="label"
            width={isRtl ? 200 : 155}
            orientation={isRtl ? 'right' : 'left'}
            tick={{
              fontSize: 12,
              fontFamily: 'ui-monospace, monospace',
              fill: '#6b7280',
              textAnchor: isRtl ? 'start' : 'end',
            }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            cursor={{ fill: 'rgba(45,106,79,0.06)' }}
            contentStyle={{
              fontSize: 12,
              fontFamily: 'ui-monospace, monospace',
              border: '1px solid #e5e4e0',
              borderRadius: 4,
              background: '#fafaf8',
            }}
            formatter={(value: number) => [value.toLocaleString(), '']}
          />
          <Bar dataKey="count" radius={[0, 2, 2, 0]} maxBarSize={22}>
            {sorted.map((entry, i) => (
              <Cell
                key={entry.label}
                fill={colorByLabel ? getCategoryColor(entry.label) : DEFAULT_COLOR}
                opacity={0.85}
              />
            ))}
            <LabelList
              dataKey="count"
              position={isRtl ? 'left' : 'right'}
              style={{ fontSize: 11, fontFamily: 'ui-monospace, monospace', fill: '#6b7280' }}
              formatter={(v: number) => v.toLocaleString()}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
```

- [ ] **Step 3: Build and fix any TypeScript errors**

```bash
npm run build 2>&1 | grep -E "error|Error|warning" | head -20
```
Fix any type errors. Common issue: `recharts` Cell `key` prop — ensure it uses a unique string.

- [ ] **Step 4: Delete WorldBubbleMap.tsx (unused)**

```bash
rm src/components/charts/WorldBubbleMap.tsx
```

Verify it's not imported anywhere:
```bash
grep -rn "WorldBubbleMap" src/ --include="*.astro" --include="*.tsx"
```
Expected: no output (zero imports).

- [ ] **Step 5: Build again**

```bash
npm run build 2>&1 | tail -5
```
Expected: `[build] Complete!`

- [ ] **Step 6: Commit**

```bash
git add src/components/charts/HorizontalBarChart.tsx
git rm src/components/charts/WorldBubbleMap.tsx
git commit -m "feat(ui): replace visx HorizontalBarChart with recharts; delete unused WorldBubbleMap"
```

---

### Task 3: Rewrite WorldMap.tsx — replace @visx/geo with react-simple-maps

The current `WorldMap.tsx` uses `@visx/geo`'s `Mercator` component to project world topojson. The new version uses `react-simple-maps` which provides its own geojson projection system and has no visx dependency.

`WorldMap.tsx` props: `data: { iso: string; count: number; label: string }[]`, `title?: string`

**Files:**
- Rewrite: `src/components/charts/WorldMap.tsx`

- [ ] **Step 1: Write the new WorldMap.tsx**

```typescript
import { useMemo, useState } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from 'react-simple-maps';

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

interface CountryDatum {
  iso: string;
  count: number;
  label: string;
}

interface Props {
  data: CountryDatum[];
  title?: string;
}

function countToFill(count: number, max: number): string {
  if (count === 0) return '#e8f5e9';
  const intensity = Math.min(count / max, 1);
  if (intensity < 0.1) return '#c8e6c9';
  if (intensity < 0.3) return '#81c784';
  if (intensity < 0.6) return '#4caf50';
  if (intensity < 0.85) return '#2e7d32';
  return '#1b5e20';
}

// react-simple-maps uses numeric ISO 3166-1 codes in world-atlas
// We need alpha-2 → numeric mapping for the top countries we show
// For the full mapping, we rely on country ISO stored in our data matching
// the alpha-2 codes that react-simple-maps exposes via geo.properties.ISO_A2
export function WorldMap({ data, title }: Props) {
  const [tooltip, setTooltip] = useState<{ label: string; count: number } | null>(null);

  const countByIso = useMemo(() => {
    const map: Record<string, number> = {};
    for (const d of data) {
      map[d.iso] = d.count;
    }
    return map;
  }, [data]);

  const labelByIso = useMemo(() => {
    const map: Record<string, string> = {};
    for (const d of data) {
      map[d.iso] = d.label;
    }
    return map;
  }, [data]);

  const maxCount = useMemo(
    () => Math.max(...data.map((d) => d.count), 1),
    [data]
  );

  return (
    <div className="w-full" style={{ direction: 'ltr' }}>
      {title && (
        <p className="text-sm font-medium text-ink mb-2">{title}</p>
      )}
      <div className="relative">
        <ComposableMap
          projectionConfig={{ scale: 130, center: [10, 20] }}
          width={800}
          height={400}
          style={{ width: '100%', height: 'auto' }}
        >
          <ZoomableGroup zoom={1} minZoom={1} maxZoom={1}>
            <Geographies geography={GEO_URL}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const iso = geo.properties.ISO_A2 as string;
                  const count = countByIso[iso] ?? 0;
                  const label = labelByIso[iso] ?? iso;
                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={countToFill(count, maxCount)}
                      stroke="#fff"
                      strokeWidth={0.4}
                      style={{
                        default: { outline: 'none' },
                        hover: { outline: 'none', opacity: 0.8 },
                        pressed: { outline: 'none' },
                      }}
                      onMouseEnter={() => {
                        if (count > 0) setTooltip({ label, count });
                      }}
                      onMouseLeave={() => setTooltip(null)}
                    />
                  );
                })
              }
            </Geographies>
          </ZoomableGroup>
        </ComposableMap>
        {tooltip && (
          <div
            className="absolute top-2 left-2 bg-paper border border-line rounded px-2 py-1 text-xs font-mono pointer-events-none"
            style={{ zIndex: 10 }}
          >
            {tooltip.label}: {tooltip.count.toLocaleString()}
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Add @types/topojson-specification type if missing**

The old file had a `// @ts-ignore` for world-atlas. The new file uses `react-simple-maps` which handles the topojson internally — no manual import needed. Remove the old import if it was left.

- [ ] **Step 3: Build and verify**

```bash
npm run build 2>&1 | grep -E "error|Error" | grep -v "//\|deprecated" | head -20
```
If `react-simple-maps` has no bundled types, add: `npm install -D @types/react-simple-maps` or use `declare module 'react-simple-maps'` if no types exist.

```bash
npm run build 2>&1 | tail -5
```
Expected: `[build] Complete!`

- [ ] **Step 4: Remove visx packages that are now unused**

After both rewrites, verify no remaining visx imports:
```bash
grep -rn "@visx" src/ --include="*.tsx" --include="*.ts" --include="*.astro"
```
Expected: zero results.

Now remove them:
```bash
npm uninstall @visx/axis @visx/geo @visx/group @visx/scale @visx/text @visx/shape @visx/tooltip @visx/hierarchy
```

If `world-atlas` and `topojson-client` are now only used by react-simple-maps (internally), check if they're still directly imported:
```bash
grep -rn "world-atlas\|topojson-client" src/ --include="*.tsx" --include="*.ts"
```
Remove if unused: `npm uninstall world-atlas topojson-client @types/topojson-client @types/topojson-specification`

- [ ] **Step 5: Final build check**

```bash
npm run build 2>&1 | tail -5
```
Expected: `[build] Complete!`

- [ ] **Step 6: Commit**

```bash
git add src/components/charts/WorldMap.tsx package.json package-lock.json
git commit -m "feat(ui): replace @visx/geo WorldMap with react-simple-maps; remove visx dependencies"
```

---

### Task 4: Fix RTL design nuances

**Files:**
- Modify: `src/components/shared/ChapterNav.astro`
- Modify: `src/components/shared/SiteHeader.astro`
- Check all pages using `HorizontalBarChart` — the `isRtl` prop must be passed correctly

- [ ] **Step 1: Read ChapterNav.astro to understand current arrow direction**

```bash
cat src/components/shared/ChapterNav.astro
```

- [ ] **Step 2: Fix ChapterNav arrow direction for RTL**

In `ChapterNav.astro`, the "previous chapter" arrow points ← and "next" points →. In RTL mode, these should flip. The fix is to swap the arrow characters based on `lang`:

Find the arrow characters (→ ← or similar) and change them to:
```astro
---
const isRtl = lang === 'ar';
const prevArrow = isRtl ? '→' : '←';
const nextArrow = isRtl ? '←' : '→';
---
```

Use `prevArrow` and `nextArrow` in the template instead of hardcoded characters.

- [ ] **Step 3: Verify HorizontalBarChart isRtl prop is passed correctly**

Search all pages for `HorizontalBarChart` usages and verify `isRtl` is set:
```bash
grep -n "HorizontalBarChart" src/pages/*.astro src/pages/fr/*.astro src/pages/en/*.astro
```

On Arabic pages (`src/pages/dependency.astro`, `src/pages/chemicals.astro`, etc.), `isRtl={true}` must be present. On FR and EN pages, `isRtl={false}`.

Fix any pages where `isRtl` is missing or wrong. The AR pages are at `src/pages/*.astro` (not `fr/` or `en/`).

- [ ] **Step 4: Fix table column alignment in DataExplorer for RTL**

```bash
cat src/components/explorer/DataExplorer.tsx | head -60
```

In the DataExplorer table, column headers and cells should use `text-right` for Arabic (`lang === 'ar'`) and `text-left` for FR/EN. Check if the component receives a `lang` prop or `isRtl` prop; if not, add one and pass it from each page.

The fix pattern — in DataExplorer.tsx, if the component has no RTL support:
```typescript
interface Props {
  // ... existing props
  isRtl?: boolean;
}
// In the table:
<th className={`... ${isRtl ? 'text-right' : 'text-left'}`}>
```

- [ ] **Step 5: Build**

```bash
npm run build 2>&1 | tail -5
```
Expected: `[build] Complete!`

- [ ] **Step 6: Commit**

```bash
git add src/components/shared/ChapterNav.astro src/components/explorer/DataExplorer.tsx \
        src/pages/*.astro
git commit -m "fix(rtl): flip chapter nav arrows; fix HorizontalBarChart isRtl; table alignment"
```

---

### Task 5: Remove em-dashes from all copy

Em-dashes (—) in inline copy make text feel staccato. Replace all `X — Y` patterns with either commas, colons, or full sentence breaks. This affects `context` props on `InsightCallout`, stat label text, and hardcoded strings in page markup.

**Strategy per usage pattern:**
- `"Spanish products — top supplier"` → `"المرتبة الأولى: إسبانيا"` / `"Top supplier: Spain"`
- `"Banana alone dominates — hundreds of licences"` → two sentences: `"Banana dominates the list. Hundreds of licences for a single fruit..."` 
- `"China, America, India — Algeria imports..."` → `"Algeria imports most seeds from China, the US, and India."`
- `"19 wilayas — no vet distributor"` → `"19 wilayas have no licensed vet distributor."`
- Chart title `"... — 58 Algerian wilayas"` → `"... across Algeria's 58 wilayas"`

**Files:** All 15 `.astro` page files. Edit each to remove em-dashes from static strings.

- [ ] **Step 1: Find all em-dash occurrences**

```bash
grep -rn "—\| -- " src/pages/ --include="*.astro" | grep -v "^.*:1:---" | grep -v "^.*:[0-9]*:---" | grep -v "<!--"
```

- [ ] **Step 2: Fix src/pages/chemicals.astro (AR version)**

Find lines like:
```
منتج إسباني — المرتبة الأولى
```
Replace with:
```
المرتبة الأولى · إسبانيا
```

Find:
```
title="خريطة مصادر الاستيراد — من أين تأتي المواد الكيميائية الزراعية؟"
```
Replace with:
```
title="خريطة مصادر الاستيراد: من أين تأتي المواد الكيميائية؟"
```

Find InsightCallout context props with em-dashes and rewrite as full sentences without em-dashes.

- [ ] **Step 3: Fix fr/chemicals.astro**

Same pattern — replace each `— ` occurrence in French copy:
- `"produits espagnols — 1er fournisseur"` → `"1er fournisseur : Espagne"`
- `"produits italiens — 2e"` → `"2e fournisseur : Italie"`
- `"produits chinois — 3e et en hausse"` → `"3e fournisseur : Chine (en hausse)"`
- `"Carte des sources d'importation — d'où..."` → `"Carte des sources d'importation des produits phytosanitaires"`

- [ ] **Step 4: Fix en/chemicals.astro**

- `"Spanish products — top supplier"` → `"Top supplier: Spain"`
- `"Italian products — 2nd"` → `"2nd supplier: Italy"`
- `"Chinese products — 3rd and rising"` → `"3rd supplier: China (rising)"`
- `"Map of import sources — where..."` → `"Map of import sources for agrochemicals"`

- [ ] **Step 5: Fix dependency pages (AR / FR / EN)**

AR `src/pages/dependency.astro`:
- `"الرهان الأكبر — الموز"` → `"الموز: الاعتماد الأكبر"`
- `"الموز وحده يُهيمن على قائمة النباتات — مئات الرخص لفاكهة واحدة"` → two sentences without em-dash
- All `context=` prop em-dashes → rewrite as sentences

FR `src/pages/fr/dependency.astro`:
- `"Le pari le plus risqué — la banane"` → `"La banane : le pari le plus risqué"`
- `"La banane domine cette liste — des centaines..."` → `"La banane domine cette liste. Des centaines..."`

EN `src/pages/en/dependency.astro`:
- `"The biggest dependency — banana"` → `"Banana: the biggest dependency"`
- `"Banana alone dominates this list — hundreds of licences..."` → `"Banana alone dominates this list. Hundreds of licences..."`

- [ ] **Step 6: Fix players pages (AR / FR / EN)**

Each has a context prop like `"PROFERT SPA holds 448 licenses — ~5% of all..."`.
Replace: `"PROFERT SPA holds 448 licenses, roughly 5% of all agricultural import permits. The market is concentrated."`

- [ ] **Step 7: Fix veterinary pages (AR / FR / EN)**

Each has map title and section text with em-dashes:
- `"... coverage by wilaya — 58 Algerian wilayas"` → `"Veterinary distributor coverage across Algeria's 58 wilayas"`
- `"These wilayas have no licensed veterinary distributor — most in the south..."` → `"These wilayas have no licensed veterinary distributor. Most are in the south..."`

- [ ] **Step 8: Verify no em-dashes remain in page content**

```bash
grep -rn "—" src/pages/ --include="*.astro" | grep -v "^.*:[0-9]*:---" | grep -v "<!--" | grep -v "company_ar.*'—'"
```
Expected: zero results (the only `—` left should be in the `company_ar: c.nameAr || '—'` fallback which is intentional).

- [ ] **Step 9: Build**

```bash
npm run build 2>&1 | tail -5
```
Expected: `[build] Complete!`

- [ ] **Step 10: Commit**

```bash
git add src/pages/
git commit -m "fix(copy): remove em-dashes from all page copy; rewrite as clear sentences"
```

---

### Task 6: Final build and bundle size check

- [ ] **Step 1: Run full build**

```bash
npm run build 2>&1 | tail -10
```
Expected: `[build] Complete!` with 15 pages.

- [ ] **Step 2: Check bundle size**

```bash
du -sh dist/ && find dist/_astro/ -name "*.js" | xargs wc -c | sort -n | tail -5
```
recharts is ~300KB gzipped. Verify the bundle hasn't ballooned unexpectedly.

- [ ] **Step 3: Final commit if anything pending**

```bash
git status
```
If clean, done. If not:
```bash
git add -A
git commit -m "feat(ui): complete recharts migration + RTL fixes + em-dash copy cleanup"
```

- [ ] **Step 4: Push**

```bash
git push
```
