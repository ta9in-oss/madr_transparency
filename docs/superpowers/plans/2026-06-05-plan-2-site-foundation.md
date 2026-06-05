# Site Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Scaffold the Astro.js site with design system, i18n, data utilities, and all shared components — the complete foundation for chapter pages and charts in Plan 3.

**Architecture:** Astro static site with React islands for interactive components; JSON data files in `data/` are imported at build time into typed TypeScript structures; all strings live in `src/i18n/{fr,ar,en}.json`; design tokens are Tailwind custom properties.

**Tech Stack:** Astro 4 · @astrojs/react · @astrojs/tailwind · @astrojs/cloudflare · Tailwind CSS · shadcn/ui · TypeScript · Vitest · Framer Motion · visx · Lucide React · Iconoir

---

## Repo context

- Repo root: `/home/mohessaid/workspaces/ta9in_oss/madr`
- Data files already committed in `data/` (8 JSON files, 9,532 records total)
- Python scraper lives in `scraper/` — do not touch it
- Commits use gitmoji format: `✨ add ...`, `🔧 configure ...`, `🎨 style ...`, `📝 add ...`
- Spec: `docs/superpowers/specs/2026-06-05-madr-transparency-design.md`

## File structure for this plan

```
madr/
├── package.json
├── astro.config.mjs
├── tailwind.config.mjs
├── tsconfig.json
├── wrangler.toml
├── vitest.config.ts
│
├── src/
│   ├── i18n/
│   │   ├── fr.json
│   │   ├── ar.json
│   │   └── en.json
│   ├── lib/
│   │   ├── types.ts
│   │   ├── categoryColors.ts
│   │   ├── i18n.ts
│   │   └── data.ts
│   ├── layouts/
│   │   └── BaseLayout.astro
│   ├── components/
│   │   └── shared/
│   │       ├── SiteHeader.astro
│   │       ├── SiteFooter.astro
│   │       ├── LanguageSwitcher.tsx
│   │       ├── StatCard.tsx
│   │       └── SectionHeader.tsx
│   └── pages/
│       └── index.astro
│
└── tests/
    └── site/
        ├── i18n.test.ts
        ├── types.test.ts
        └── data.test.ts
```

---

## Task 1: Astro scaffold + all dependencies

**Files:**
- Create: `package.json`
- Create: `astro.config.mjs`
- Create: `tailwind.config.mjs` (skeleton — tokens added in Task 2)
- Create: `tsconfig.json`
- Create: `wrangler.toml`
- Create: `vitest.config.ts`
- Create: `src/env.d.ts`

- [ ] **Step 1: Create package.json**

```json
{
  "name": "madr-transparency",
  "type": "module",
  "version": "0.1.0",
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

- [ ] **Step 2: Install all dependencies**

```bash
cd /home/mohessaid/workspaces/ta9in_oss/madr

npm install astro @astrojs/react @astrojs/tailwind @astrojs/cloudflare
npm install react react-dom
npm install -D @types/react @types/react-dom typescript
npm install tailwindcss
npm install framer-motion
npm install @visx/group @visx/scale @visx/shape @visx/axis @visx/tooltip @visx/hierarchy @visx/text @visx/geo
npm install lucide-react iconoir-react
npm install -D vitest @vitest/ui happy-dom
npm install class-variance-authority clsx tailwind-merge
npm install @radix-ui/react-slot
npm install @radix-ui/react-dropdown-menu
```

Expected: `node_modules/` created, no errors.

- [ ] **Step 3: Create astro.config.mjs**

```js
// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  output: 'static',
  adapter: cloudflare(),
  integrations: [
    react(),
    tailwind({ applyBaseStyles: false }),
  ],
  i18n: {
    defaultLocale: 'fr',
    locales: ['fr', 'ar', 'en'],
    routing: {
      prefixDefaultLocale: false,
    },
  },
});
```

- [ ] **Step 4: Create tailwind.config.mjs (skeleton)**

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {},
  },
  plugins: [],
};
```

- [ ] **Step 5: Create tsconfig.json**

```json
{
  "extends": "astro/tsconfigs/strict",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@lib/*": ["./src/lib/*"],
      "@components/*": ["./src/components/*"],
      "@i18n/*": ["./src/i18n/*"]
    }
  }
}
```

- [ ] **Step 6: Create wrangler.toml**

```toml
name = "madr-transparency"
pages_build_output_dir = "dist"
```

- [ ] **Step 7: Create vitest.config.ts**

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'happy-dom',
    include: ['tests/**/*.test.ts', 'tests/**/*.test.tsx'],
  },
  resolve: {
    alias: {
      '@': '/src',
      '@lib': '/src/lib',
    },
  },
});
```

- [ ] **Step 8: Create src/env.d.ts**

```ts
/// <reference types="astro/client" />
```

- [ ] **Step 9: Create src/pages/index.astro (placeholder)**

```astro
---
---
<html lang="fr">
  <head><title>MADR Transparency</title></head>
  <body><p>Coming soon</p></body>
</html>
```

- [ ] **Step 10: Verify Astro builds**

```bash
npm run build
```

Expected: `dist/` created, no errors.

- [ ] **Step 11: Commit**

```bash
git add package.json package-lock.json astro.config.mjs tailwind.config.mjs tsconfig.json wrangler.toml vitest.config.ts src/env.d.ts src/pages/index.astro
git commit -m "🎉 scaffold Astro site with React, Tailwind and Cloudflare adapter"
```

---

## Task 2: Design tokens — Tailwind config + global CSS + fonts

**Files:**
- Modify: `tailwind.config.mjs`
- Create: `src/styles/global.css`

The design system has two anchor colors (Ink, Forest) with semantic tints, and four fonts loaded from Google Fonts. All design decisions live in these two files — no magic numbers anywhere else.

- [ ] **Step 1: Write the failing test**

Create `tests/site/tokens.test.ts`:

```ts
import { describe, it, expect } from 'vitest';

// Verify the color tokens we depend on are exported from the right module.
// This catches typos in token names before they break components at build time.
import tailwindConfig from '../../tailwind.config.mjs';

describe('design tokens', () => {
  it('defines ink color', () => {
    expect(tailwindConfig.theme.extend.colors.ink).toBe('#111318');
  });

  it('defines forest color', () => {
    expect(tailwindConfig.theme.extend.colors.forest).toBe('#2d6a4f');
  });

  it('defines paper color', () => {
    expect(tailwindConfig.theme.extend.colors.paper).toBe('#fafaf8');
  });

  it('defines all font families', () => {
    const fonts = tailwindConfig.theme.extend.fontFamily;
    expect(fonts.display).toBeDefined();
    expect(fonts.body).toBeDefined();
    expect(fonts.mono).toBeDefined();
    expect(fonts.arabic).toBeDefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test tests/site/tokens.test.ts
```

Expected: FAIL — `tailwindConfig.theme.extend.colors` is undefined.

- [ ] **Step 3: Rewrite tailwind.config.mjs with full design tokens**

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        ink:          '#111318',
        forest:       '#2d6a4f',
        'forest-dark': '#1a3d2e',
        'forest-tint': 'rgba(45,106,79,0.09)',
        paper:        '#fafaf8',
        surface:      '#f3f2ef',
        line:         '#e5e4e0',
        muted:        '#6b7280',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body:    ['"Inter"',         'sans-serif'],
        mono:    ['"DM Mono"',       'monospace'],
        arabic:  ['"Noto Sans Arabic"', 'sans-serif'],
      },
      fontSize: {
        'display-lg': ['2.25rem', { lineHeight: '2.75rem', fontWeight: '700' }],
        'display-md': ['1.5rem',  { lineHeight: '2rem',   fontWeight: '700' }],
        'display-sm': ['1.05rem', { lineHeight: '1.5rem', fontWeight: '700' }],
        'body':       ['0.875rem', { lineHeight: '1.5rem' }],
        'data':       ['0.78rem',  { lineHeight: '1.25rem' }],
      },
    },
  },
  plugins: [],
};
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npm test tests/site/tokens.test.ts
```

Expected: PASS — 4 tests passing.

- [ ] **Step 5: Create src/styles/global.css**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Google Fonts — Space Grotesk, Inter, DM Mono, Noto Sans Arabic */
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&family=Inter:wght@400;500&family=DM+Mono:wght@400&family=Noto+Sans+Arabic:wght@400;600&display=swap');

@layer base {
  :root {
    --color-ink:          #111318;
    --color-forest:       #2d6a4f;
    --color-forest-dark:  #1a3d2e;
    --color-forest-tint:  rgba(45, 106, 79, 0.09);
    --color-paper:        #fafaf8;
    --color-surface:      #f3f2ef;
    --color-line:         #e5e4e0;
    --color-muted:        #6b7280;
  }

  html {
    background-color: var(--color-paper);
    color: var(--color-ink);
    font-family: theme('fontFamily.body');
    font-size: theme('fontSize.body[0]');
    -webkit-font-smoothing: antialiased;
  }

  html[lang="ar"],
  html[lang="ar"] * {
    font-family: theme('fontFamily.arabic');
    direction: rtl;
  }

  h1, h2, h3, h4, h5, h6 {
    font-family: theme('fontFamily.display');
    font-weight: 700;
    color: var(--color-ink);
  }

  a {
    color: var(--color-forest);
    text-decoration: none;
  }

  a:hover {
    color: var(--color-forest-dark);
  }

  code, pre, [data-mono] {
    font-family: theme('fontFamily.mono');
    font-size: theme('fontSize.data[0]');
  }
}
```

- [ ] **Step 6: Commit**

```bash
git add tailwind.config.mjs src/styles/global.css tests/site/tokens.test.ts
git commit -m "🎨 add design tokens — Ink/Forest colors, display/body/mono fonts"
```

---

## Task 3: TypeScript types + categoryColors

**Files:**
- Create: `src/lib/types.ts`
- Create: `src/lib/categoryColors.ts`
- Create: `tests/site/types.test.ts`

The JSON files use `snake_case` keys (from Python's `dataclasses.asdict()`). TypeScript types use `camelCase` per convention. The data loading helpers in Task 5 handle the transformation.

- [ ] **Step 1: Write the failing tests**

Create `tests/site/types.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { CATEGORY_COLORS, getCategoryColor } from '@lib/categoryColors';

describe('categoryColors', () => {
  it('has a color for banane', () => {
    expect(CATEGORY_COLORS.banane).toBe('#ca8a04');
  });

  it('has a color for tomate', () => {
    expect(CATEGORY_COLORS.tomate).toBe('#dc2626');
  });

  it('returns forest as default for unknown categories', () => {
    expect(getCategoryColor('xyz_unknown')).toBe('#2d6a4f');
  });

  it('matches category key case-insensitively', () => {
    expect(getCategoryColor('Banane')).toBe('#ca8a04');
    expect(getCategoryColor('TOMATE')).toBe('#dc2626');
  });

  it('has at least 8 categories defined', () => {
    expect(Object.keys(CATEGORY_COLORS).length).toBeGreaterThanOrEqual(8);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test tests/site/types.test.ts
```

Expected: FAIL — cannot find module `@lib/categoryColors`.

- [ ] **Step 3: Create src/lib/types.ts**

```ts
// Each interface mirrors the shape of the corresponding JSON file in data/.
// Field names are camelCase; the data loaders in data.ts transform from snake_case.

export interface PlantProduct {
  company: string;
  companyNameAr: string;
  knownName: string;
  variety: string;
  countryOfOrigin: string;
  productionZone: string;
  category: string;
}

export interface Seedling {
  company: string;
  companyNameAr: string;
  knownName: string;
  variety: string;
  materialType: string;
  productionZone: string;
  plantingZone: string;
  countryOfOrigin: string;
}

export interface Agrochemical {
  company: string;
  companyNameAr: string;
  productName: string;
  activeSubstance: string;
  category: string;
  countryOfOrigin: string;
}

export interface PotatoSeed {
  company: string;
  companyNameAr: string;
  knownName: string;
  variety: string;
  materialType: string;
  productionZone: string;
  countryOfOrigin: string;
  category: string;
}

export interface Seed {
  company: string;
  companyNameAr: string;
  knownName: string;
  variety: string;
  materialType: string;
  productionZone: string;
  countryOfOrigin: string;
}

export interface VetAuthorization {
  company: string;
  companyNameAr: string;
  authorizationNumber: string;
  agreementNumber: string;
  productType: string;
}

export interface VetDistributor {
  company: string;
  companyNameAr: string;
  number: string;
  wilaya: string;
  address: string;
}

export interface VetMedicineImporter {
  company: string;
  companyNameAr: string;
  number: string;
  location: string;
}

export type Lang = 'fr' | 'ar' | 'en';
```

- [ ] **Step 4: Create src/lib/categoryColors.ts**

```ts
// Semantic hover tints per crop / product category.
// Used on data rows and chart segments — never applied at rest, only on hover.
// Keys are lowercase French category names as they appear in the source data.

export const CATEGORY_COLORS: Record<string, string> = {
  banane:      '#ca8a04',
  tomate:      '#dc2626',
  pommier:     '#ea580c',
  olive:       '#84823a',
  vigne:       '#7c3aed',
  mais:        '#d97706',
  fongicide:   '#16a34a',
  insecticide: '#b45309',
  herbicide:   '#0369a1',
  palmier:     '#92400e',
  fruits:      '#ca8a04',
  legumes:     '#16a34a',
};

const FOREST_DEFAULT = '#2d6a4f';

export function getCategoryColor(category: string): string {
  const key = category.toLowerCase();
  return CATEGORY_COLORS[key] ?? FOREST_DEFAULT;
}
```

- [ ] **Step 5: Run test to verify it passes**

```bash
npm test tests/site/types.test.ts
```

Expected: PASS — 5 tests passing.

- [ ] **Step 6: Commit**

```bash
git add src/lib/types.ts src/lib/categoryColors.ts tests/site/types.test.ts
git commit -m "✨ add TypeScript types for all 8 datasets and semantic category colors"
```

---

## Task 4: i18n system — translation utility + lang files

**Files:**
- Create: `src/lib/i18n.ts`
- Create: `src/i18n/fr.json`
- Create: `src/i18n/ar.json`
- Create: `src/i18n/en.json`
- Create: `tests/site/i18n.test.ts`

The translation utility is a pure function that takes a lang code and a dot-notation key, and returns the string. All user-facing strings live exclusively in the JSON files — no string is hardcoded in any component.

- [ ] **Step 1: Write the failing tests**

Create `tests/site/i18n.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { t, getTranslations } from '@lib/i18n';

describe('t()', () => {
  it('returns the French translation for a known key', () => {
    expect(t('fr', 'nav.home')).toBe('Accueil');
  });

  it('returns the Arabic translation for a known key', () => {
    expect(t('ar', 'nav.home')).toBeTruthy();
  });

  it('returns the English translation for a known key', () => {
    expect(t('en', 'nav.home')).toBeTruthy();
  });

  it('returns the key itself for an unknown key', () => {
    expect(t('fr', 'nav.does_not_exist')).toBe('nav.does_not_exist');
  });

  it('resolves nested keys with dot notation', () => {
    const result = t('fr', 'home.title');
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });
});

describe('getTranslations()', () => {
  it('returns the full French translation object', () => {
    const translations = getTranslations('fr');
    expect(translations.nav).toBeDefined();
    expect(translations.home).toBeDefined();
    expect(translations.footer).toBeDefined();
  });

  it('all three langs have the same top-level keys', () => {
    const fr = getTranslations('fr');
    const ar = getTranslations('ar');
    const en = getTranslations('en');
    const frKeys = Object.keys(fr).sort();
    expect(Object.keys(ar).sort()).toEqual(frKeys);
    expect(Object.keys(en).sort()).toEqual(frKeys);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test tests/site/i18n.test.ts
```

Expected: FAIL — cannot find module `@lib/i18n`.

- [ ] **Step 3: Create src/i18n/fr.json**

```json
{
  "nav": {
    "home": "Accueil",
    "dependency": "Dépendance agricole",
    "chemicals": "Produits chimiques",
    "players": "Acteurs clés",
    "veterinary": "Filière vétérinaire",
    "source_code": "Code source"
  },
  "home": {
    "title": "Qui nourrit l'Algérie — et d'où ?",
    "subtitle": "Plus de 9 900 autorisations d'importation délivrées par le ministère de l'Agriculture. Nous les avons extraites, structurées et visualisées pour que vous puissiez comprendre les chaînes de dépendance derrière votre alimentation.",
    "cta_explore": "Explorer les données",
    "cta_story": "Lire l'enquête",
    "total_records": "autorisations au total",
    "datasets": "jeux de données"
  },
  "stats": {
    "agrochemicals": "produits phytosanitaires",
    "seeds": "variétés de semences",
    "fruit_imports": "importations de végétaux",
    "vet_records": "dossiers vétérinaires"
  },
  "chapters": {
    "ch1_num": "01",
    "ch1_title": "La dépendance agricole",
    "ch1_lead": "Semences, plants et origines des fruits cartographiés par pays fournisseur.",
    "ch2_num": "02",
    "ch2_title": "5 000 produits chimiques",
    "ch2_lead": "Qui importe les pesticides, quelles substances actives sont homologuées, et d'où viennent-elles.",
    "ch3_num": "03",
    "ch3_title": "Les acteurs clés",
    "ch3_lead": "Concentration du marché : quelles entreprises détiennent le plus grand nombre d'autorisations.",
    "ch4_num": "04",
    "ch4_title": "La filière vétérinaire",
    "ch4_lead": "Distribution des médicaments vétérinaires et couverture géographique par wilaya.",
    "explore": "Explorer"
  },
  "explorer": {
    "search_placeholder": "Rechercher une entreprise, un produit, un pays...",
    "filter_country": "Pays d'origine",
    "filter_category": "Catégorie",
    "filter_all": "Tous",
    "no_results": "Aucun résultat pour cette recherche.",
    "showing": "Affichage de",
    "of": "sur",
    "records": "enregistrements",
    "prev": "Précédent",
    "next": "Suivant"
  },
  "footer": {
    "source": "Source : Ministère de l'Agriculture et du Développement Rural",
    "source_url": "madr.gov.dz/transparence",
    "updated": "Données mises à jour le",
    "repo": "Code source",
    "open_data": "Données ouvertes"
  },
  "lang": {
    "fr": "Français",
    "ar": "العربية",
    "en": "English"
  }
}
```

- [ ] **Step 4: Create src/i18n/ar.json**

```json
{
  "nav": {
    "home": "الرئيسية",
    "dependency": "الاعتماد الزراعي",
    "chemicals": "المواد الكيميائية",
    "players": "الفاعلون الرئيسيون",
    "veterinary": "القطاع البيطري",
    "source_code": "الكود المصدري"
  },
  "home": {
    "title": "من يُطعم الجزائر — ومن أين؟",
    "subtitle": "أكثر من 9900 رخصة استيراد صادرة عن وزارة الفلاحة. استخرجناها وهيكلناها وصوّرناها بيانياً لتفهم سلاسل التبعية خلف طعامك.",
    "cta_explore": "استكشاف البيانات",
    "cta_story": "قراءة التحقيق",
    "total_records": "رخصة إجمالاً",
    "datasets": "مجموعات بيانات"
  },
  "stats": {
    "agrochemicals": "منتج نباتي صحي",
    "seeds": "صنف بذور",
    "fruit_imports": "استيراد نباتات",
    "vet_records": "ملف بيطري"
  },
  "chapters": {
    "ch1_num": "01",
    "ch1_title": "الاعتماد الزراعي",
    "ch1_lead": "البذور والشتلات وأصول الفواكه مصنّفةً حسب الدول الموردة.",
    "ch2_num": "02",
    "ch2_title": "5000 مادة كيميائية",
    "ch2_lead": "من يستورد المبيدات، وما المواد الفعالة المعتمدة، ومن أين تأتي.",
    "ch3_num": "03",
    "ch3_title": "الفاعلون الرئيسيون",
    "ch3_lead": "تركّز السوق: أيّ الشركات تحمل أكبر عدد من التراخيص.",
    "ch4_num": "04",
    "ch4_title": "القطاع البيطري",
    "ch4_lead": "توزيع الأدوية البيطرية والتغطية الجغرافية حسب الولاية.",
    "explore": "استكشاف"
  },
  "explorer": {
    "search_placeholder": "ابحث عن شركة، منتج، بلد...",
    "filter_country": "بلد المنشأ",
    "filter_category": "الفئة",
    "filter_all": "الكل",
    "no_results": "لا نتائج لهذا البحث.",
    "showing": "عرض",
    "of": "من أصل",
    "records": "سجلات",
    "prev": "السابق",
    "next": "التالي"
  },
  "footer": {
    "source": "المصدر: وزارة الفلاحة والتنمية الريفية",
    "source_url": "madr.gov.dz/transparence",
    "updated": "تاريخ تحديث البيانات",
    "repo": "الكود المصدري",
    "open_data": "بيانات مفتوحة"
  },
  "lang": {
    "fr": "Français",
    "ar": "العربية",
    "en": "English"
  }
}
```

- [ ] **Step 5: Create src/i18n/en.json**

```json
{
  "nav": {
    "home": "Home",
    "dependency": "Agricultural Dependency",
    "chemicals": "Chemicals",
    "players": "Key Players",
    "veterinary": "Veterinary Chain",
    "source_code": "Source code"
  },
  "home": {
    "title": "Who feeds Algeria — and from where?",
    "subtitle": "Over 9,900 import permits issued by the Ministry of Agriculture. We extracted them, structured them, and visualised them so you can understand the dependency chains behind your food.",
    "cta_explore": "Explore the data",
    "cta_story": "Read the investigation",
    "total_records": "permits in total",
    "datasets": "datasets"
  },
  "stats": {
    "agrochemicals": "agrochemical products",
    "seeds": "seed varieties",
    "fruit_imports": "plant imports",
    "vet_records": "veterinary records"
  },
  "chapters": {
    "ch1_num": "01",
    "ch1_title": "Agricultural Dependency",
    "ch1_lead": "Seeds, seedlings, and fruit origins mapped by supplier country.",
    "ch2_num": "02",
    "ch2_title": "5,000 Chemicals",
    "ch2_lead": "Who imports pesticides, what active substances are approved, and where they come from.",
    "ch3_num": "03",
    "ch3_title": "The Key Players",
    "ch3_lead": "Market concentration: which companies hold the most licenses across all sectors.",
    "ch4_num": "04",
    "ch4_title": "The Veterinary Chain",
    "ch4_lead": "Veterinary medicine distribution and geographic coverage by wilaya.",
    "explore": "Explore"
  },
  "explorer": {
    "search_placeholder": "Search company, product, country...",
    "filter_country": "Country of origin",
    "filter_category": "Category",
    "filter_all": "All",
    "no_results": "No results for this search.",
    "showing": "Showing",
    "of": "of",
    "records": "records",
    "prev": "Previous",
    "next": "Next"
  },
  "footer": {
    "source": "Source: Ministry of Agriculture and Rural Development",
    "source_url": "madr.gov.dz/transparence",
    "updated": "Data last updated",
    "repo": "Source code",
    "open_data": "Open data"
  },
  "lang": {
    "fr": "Français",
    "ar": "العربية",
    "en": "English"
  }
}
```

- [ ] **Step 6: Create src/lib/i18n.ts**

```ts
import fr from '@i18n/fr.json';
import ar from '@i18n/ar.json';
import en from '@i18n/en.json';
import type { Lang } from './types';

type TranslationDict = Record<string, Record<string, string>>;

const translations: Record<Lang, TranslationDict> = { fr, ar, en };

export function getTranslations(lang: Lang): TranslationDict {
  return translations[lang];
}

export function t(lang: Lang, key: string): string {
  const [section, ...rest] = key.split('.');
  const dict = translations[lang];
  const sectionDict = dict[section];
  if (!sectionDict) return key;
  const leafKey = rest.join('.');
  return sectionDict[leafKey] ?? key;
}
```

- [ ] **Step 7: Run test to verify it passes**

```bash
npm test tests/site/i18n.test.ts
```

Expected: PASS — 7 tests passing.

- [ ] **Step 8: Commit**

```bash
git add src/lib/i18n.ts src/i18n/fr.json src/i18n/ar.json src/i18n/en.json tests/site/i18n.test.ts
git commit -m "✨ add i18n system with fr/ar/en lang files and t() utility"
```

---

## Task 5: Data loading helpers

**Files:**
- Create: `src/lib/data.ts`
- Create: `tests/site/data.test.ts`

The data loaders import JSON at build time and transform from snake_case JSON keys to camelCase TypeScript interfaces. Because Astro builds statically, these imports are resolved at build time — no runtime file I/O.

- [ ] **Step 1: Write the failing tests**

Create `tests/site/data.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import {
  loadAgrochemicals,
  loadPlantProducts,
  loadSeedlings,
  loadSeeds,
  loadPotatoSeeds,
  loadVetAuthorizations,
  loadVetDistributors,
  loadVetMedicineImporters,
} from '@lib/data';

describe('data loaders', () => {
  it('loads agrochemicals and returns typed records', () => {
    const records = loadAgrochemicals();
    expect(records.length).toBeGreaterThan(0);
    const first = records[0];
    expect(typeof first.company).toBe('string');
    expect(typeof first.productName).toBe('string');
    expect(typeof first.activeSubstance).toBe('string');
    expect(typeof first.category).toBe('string');
    expect(typeof first.countryOfOrigin).toBe('string');
    expect(first.companyNameAr).toBe('');
  });

  it('loads plant products with camelCase fields', () => {
    const records = loadPlantProducts();
    expect(records.length).toBeGreaterThan(0);
    const first = records[0];
    expect(typeof first.knownName).toBe('string');
    expect(typeof first.countryOfOrigin).toBe('string');
  });

  it('loads vet distributors with wilaya field', () => {
    const records = loadVetDistributors();
    expect(records.length).toBeGreaterThan(0);
    expect(typeof records[0].wilaya).toBe('string');
  });

  it('total record count across all datasets is at least 9000', () => {
    const total =
      loadAgrochemicals().length +
      loadPlantProducts().length +
      loadSeedlings().length +
      loadSeeds().length +
      loadPotatoSeeds().length +
      loadVetAuthorizations().length +
      loadVetDistributors().length +
      loadVetMedicineImporters().length;
    expect(total).toBeGreaterThanOrEqual(9000);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test tests/site/data.test.ts
```

Expected: FAIL — cannot find module `@lib/data`.

- [ ] **Step 3: Create src/lib/data.ts**

```ts
import type {
  Agrochemical,
  PlantProduct,
  Seedling,
  Seed,
  PotatoSeed,
  VetAuthorization,
  VetDistributor,
  VetMedicineImporter,
} from './types';

// Raw JSON types match the snake_case keys written by the Python scraper
interface RawAgrochemical {
  company: string; company_name_ar: string; product_name: string;
  active_substance: string; category: string; country_of_origin: string;
}
interface RawPlantProduct {
  company: string; company_name_ar: string; known_name: string;
  variety: string; country_of_origin: string; production_zone: string; category: string;
}
interface RawSeedling {
  company: string; company_name_ar: string; known_name: string;
  variety: string; material_type: string; production_zone: string;
  planting_zone: string; country_of_origin: string;
}
interface RawSeed {
  company: string; company_name_ar: string; known_name: string;
  variety: string; material_type: string; production_zone: string; country_of_origin: string;
}
interface RawPotatoSeed {
  company: string; company_name_ar: string; known_name: string;
  variety: string; material_type: string; production_zone: string;
  country_of_origin: string; category: string;
}
interface RawVetAuthorization {
  company: string; company_name_ar: string;
  authorization_number: string; agreement_number: string; product_type: string;
}
interface RawVetDistributor {
  company: string; company_name_ar: string;
  number: string; wilaya: string; address: string;
}
interface RawVetMedicineImporter {
  company: string; company_name_ar: string; number: string; location: string;
}

import rawAgrochemicals      from '../../data/agrochemicals.json';
import rawPlantProducts      from '../../data/plant-products.json';
import rawSeedlings          from '../../data/seedlings.json';
import rawSeeds              from '../../data/seeds.json';
import rawPotatoSeeds        from '../../data/potato-seeds.json';
import rawVetAuthorizations  from '../../data/vet-authorizations.json';
import rawVetDistributors    from '../../data/vet-distributors.json';
import rawVetMedicineImporters from '../../data/vet-medicine-importers.json';

export function loadAgrochemicals(): Agrochemical[] {
  return (rawAgrochemicals as RawAgrochemical[]).map((r) => ({
    company: r.company, companyNameAr: r.company_name_ar,
    productName: r.product_name, activeSubstance: r.active_substance,
    category: r.category, countryOfOrigin: r.country_of_origin,
  }));
}

export function loadPlantProducts(): PlantProduct[] {
  return (rawPlantProducts as RawPlantProduct[]).map((r) => ({
    company: r.company, companyNameAr: r.company_name_ar,
    knownName: r.known_name, variety: r.variety,
    countryOfOrigin: r.country_of_origin, productionZone: r.production_zone,
    category: r.category,
  }));
}

export function loadSeedlings(): Seedling[] {
  return (rawSeedlings as RawSeedling[]).map((r) => ({
    company: r.company, companyNameAr: r.company_name_ar,
    knownName: r.known_name, variety: r.variety,
    materialType: r.material_type, productionZone: r.production_zone,
    plantingZone: r.planting_zone, countryOfOrigin: r.country_of_origin,
  }));
}

export function loadSeeds(): Seed[] {
  return (rawSeeds as RawSeed[]).map((r) => ({
    company: r.company, companyNameAr: r.company_name_ar,
    knownName: r.known_name, variety: r.variety,
    materialType: r.material_type, productionZone: r.production_zone,
    countryOfOrigin: r.country_of_origin,
  }));
}

export function loadPotatoSeeds(): PotatoSeed[] {
  return (rawPotatoSeeds as RawPotatoSeed[]).map((r) => ({
    company: r.company, companyNameAr: r.company_name_ar,
    knownName: r.known_name, variety: r.variety,
    materialType: r.material_type, productionZone: r.production_zone,
    countryOfOrigin: r.country_of_origin, category: r.category,
  }));
}

export function loadVetAuthorizations(): VetAuthorization[] {
  return (rawVetAuthorizations as RawVetAuthorization[]).map((r) => ({
    company: r.company, companyNameAr: r.company_name_ar,
    authorizationNumber: r.authorization_number, agreementNumber: r.agreement_number,
    productType: r.product_type,
  }));
}

export function loadVetDistributors(): VetDistributor[] {
  return (rawVetDistributors as RawVetDistributor[]).map((r) => ({
    company: r.company, companyNameAr: r.company_name_ar,
    number: r.number, wilaya: r.wilaya, address: r.address,
  }));
}

export function loadVetMedicineImporters(): VetMedicineImporter[] {
  return (rawVetMedicineImporters as RawVetMedicineImporter[]).map((r) => ({
    company: r.company, companyNameAr: r.company_name_ar,
    number: r.number, location: r.location,
  }));
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npm test tests/site/data.test.ts
```

Expected: PASS — 4 tests passing.

- [ ] **Step 5: Commit**

```bash
git add src/lib/data.ts tests/site/data.test.ts
git commit -m "✨ add typed data loaders with snake_case to camelCase transform"
```

---

## Task 6: BaseLayout.astro

**Files:**
- Create: `src/layouts/BaseLayout.astro`

The layout sets the HTML shell with correct `lang` and `dir` attributes for RTL support, loads global CSS, and provides a slot for page content.

- [ ] **Step 1: Create src/layouts/BaseLayout.astro**

```astro
---
import '../styles/global.css';
import type { Lang } from '../lib/types';

interface Props {
  title: string;
  description?: string;
  lang?: Lang;
}

const {
  title,
  description = 'Données publiques du ministère de l\'Agriculture rendues accessibles.',
  lang = 'fr',
} = Astro.props;

const dir = lang === 'ar' ? 'rtl' : 'ltr';
---

<!doctype html>
<html lang={lang} dir={dir} class="bg-paper text-ink">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="description" content={description} />
    <meta name="generator" content={Astro.generator} />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <title>{title}</title>
  </head>
  <body class="min-h-screen flex flex-col font-body antialiased">
    <slot />
  </body>
</html>
```

- [ ] **Step 2: Verify build passes**

```bash
npm run build
```

Expected: builds without errors.

- [ ] **Step 3: Commit**

```bash
git add src/layouts/BaseLayout.astro
git commit -m "✨ add BaseLayout with lang/dir RTL support and global styles"
```

---

## Task 7: SiteHeader.astro + LanguageSwitcher.tsx

**Files:**
- Create: `src/components/shared/SiteHeader.astro`
- Create: `src/components/shared/LanguageSwitcher.tsx`

The header contains the site logo (text mark, no image), navigation links, and the language switcher. The language switcher is a React island (`client:load`) because it is interactive.

- [ ] **Step 1: Create src/components/shared/LanguageSwitcher.tsx**

```tsx
import { useState } from 'react';
import type { Lang } from '../../lib/types';

interface Props {
  current: Lang;
  labels: Record<Lang, string>;
}

export function LanguageSwitcher({ current, labels }: Props) {
  const [open, setOpen] = useState(false);
  const langs: Lang[] = ['fr', 'ar', 'en'];

  function selectLang(lang: Lang) {
    setOpen(false);
    // Reload with new lang prefix; Astro i18n routing handles the path
    const url = new URL(window.location.href);
    const segments = url.pathname.split('/').filter(Boolean);
    const isLangSegment = (s: string): s is Lang => ['fr', 'ar', 'en'].includes(s);
    if (segments.length > 0 && isLangSegment(segments[0])) {
      segments[0] = lang;
    } else if (lang !== 'fr') {
      segments.unshift(lang);
    }
    url.pathname = '/' + segments.join('/');
    window.location.href = url.toString();
  }

  return (
    <div className="relative" role="navigation" aria-label="Language selector">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="listbox"
        className="flex items-center gap-1.5 text-sm font-body text-muted hover:text-ink transition-colors px-2 py-1 rounded"
      >
        <span>{labels[current]}</span>
        <svg width="10" height="6" viewBox="0 0 10 6" fill="none" aria-hidden="true">
          <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <ul
          role="listbox"
          aria-label="Select language"
          className="absolute right-0 mt-1 bg-surface border border-line rounded shadow-sm z-10 min-w-[8rem] py-1"
        >
          {langs.map((lang) => (
            <li
              key={lang}
              role="option"
              aria-selected={lang === current}
              onClick={() => selectLang(lang)}
              className={`px-3 py-1.5 text-sm cursor-pointer hover:bg-forest-tint transition-colors ${
                lang === current ? 'text-forest font-medium' : 'text-ink'
              }`}
            >
              {labels[lang]}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Create src/components/shared/SiteHeader.astro**

```astro
---
import { LanguageSwitcher } from './LanguageSwitcher';
import { t } from '../../lib/i18n';
import type { Lang } from '../../lib/types';

interface Props {
  lang: Lang;
}

const { lang } = Astro.props;

const langLabels = {
  fr: t(lang, 'lang.fr'),
  ar: t(lang, 'lang.ar'),
  en: t(lang, 'lang.en'),
} as const;

const navLinks = [
  { href: '/dependency', label: t(lang, 'nav.dependency') },
  { href: '/chemicals',  label: t(lang, 'nav.chemicals')  },
  { href: '/players',    label: t(lang, 'nav.players')    },
  { href: '/veterinary', label: t(lang, 'nav.veterinary') },
];
---

<header class="border-b border-line bg-paper sticky top-0 z-20">
  <div class="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-6">

    <a href="/" class="font-display font-bold text-ink text-lg tracking-tight shrink-0">
      MADR <span class="text-forest">Transparence</span>
    </a>

    <nav aria-label="Navigation principale" class="hidden md:flex items-center gap-1">
      {navLinks.map(({ href, label }) => (
        <a
          href={href}
          class="text-sm text-muted hover:text-forest transition-colors px-3 py-1.5 rounded hover:bg-forest-tint"
        >
          {label}
        </a>
      ))}
    </nav>

    <div class="flex items-center gap-3">
      <a
        href="https://github.com/ta9in-oss/madr_transparency"
        target="_blank"
        rel="noopener noreferrer"
        aria-label={t(lang, 'nav.source_code')}
        class="text-muted hover:text-ink transition-colors"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
        </svg>
      </a>
      <LanguageSwitcher client:load current={lang} labels={langLabels} />
    </div>

  </div>
</header>
```

- [ ] **Step 3: Verify build passes**

```bash
npm run build
```

Expected: builds without errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/shared/SiteHeader.astro src/components/shared/LanguageSwitcher.tsx
git commit -m "✨ add SiteHeader and LanguageSwitcher React island"
```

---

## Task 8: SiteFooter.astro + StatCard.tsx + SectionHeader.tsx

**Files:**
- Create: `src/components/shared/SiteFooter.astro`
- Create: `src/components/shared/StatCard.tsx`
- Create: `src/components/shared/SectionHeader.tsx`

StatCard and SectionHeader are pure display components — they receive props and render. No client-side JS needed, but written as `.tsx` so they can be used either as server-rendered Astro children or as React islands.

- [ ] **Step 1: Create src/components/shared/SiteFooter.astro**

```astro
---
import { t } from '../../lib/i18n';
import type { Lang } from '../../lib/types';

interface Props {
  lang: Lang;
  lastUpdated?: string;
}

const { lang, lastUpdated } = Astro.props;
---

<footer class="border-t border-line mt-auto">
  <div class="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-sm text-muted">

    <div class="flex flex-col gap-1">
      <span>{t(lang, 'footer.source')}</span>
      <a
        href="https://madr.gov.dz/transparency"
        target="_blank"
        rel="noopener noreferrer"
        class="text-forest hover:text-forest-dark transition-colors"
      >
        {t(lang, 'footer.source_url')}
      </a>
      {lastUpdated && (
        <span class="font-mono text-data">{t(lang, 'footer.updated')} {lastUpdated}</span>
      )}
    </div>

    <div class="flex items-center gap-4">
      <a
        href="https://github.com/ta9in-oss/madr_transparency"
        target="_blank"
        rel="noopener noreferrer"
        class="hover:text-forest transition-colors"
      >
        {t(lang, 'footer.repo')}
      </a>
      <span aria-hidden="true" class="text-line">|</span>
      <span>{t(lang, 'footer.open_data')}</span>
    </div>

  </div>
</footer>
```

- [ ] **Step 2: Create src/components/shared/StatCard.tsx**

```tsx
interface Props {
  value: number | string;
  label: string;
  accent?: boolean;
}

export function StatCard({ value, label, accent = false }: Props) {
  return (
    <div className="flex flex-col gap-1 p-5 bg-surface border border-line rounded-lg">
      <span
        className={`font-display font-bold text-display-md tabular-nums ${
          accent ? 'text-forest' : 'text-ink'
        }`}
      >
        {typeof value === 'number' ? value.toLocaleString('fr-DZ') : value}
      </span>
      <span className="text-sm text-muted font-body">{label}</span>
    </div>
  );
}
```

- [ ] **Step 3: Create src/components/shared/SectionHeader.tsx**

```tsx
interface Props {
  chapterNum: string;
  title: string;
  lead: string;
}

export function SectionHeader({ chapterNum, title, lead }: Props) {
  return (
    <header className="flex flex-col gap-3 mb-10">
      <span className="font-mono text-data text-forest tracking-widest uppercase">
        {chapterNum}
      </span>
      <h1 className="font-display font-bold text-display-lg text-ink leading-tight">
        {title}
      </h1>
      <p className="text-base text-muted max-w-2xl leading-relaxed font-body">
        {lead}
      </p>
    </header>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add src/components/shared/SiteFooter.astro src/components/shared/StatCard.tsx src/components/shared/SectionHeader.tsx
git commit -m "✨ add SiteFooter, StatCard and SectionHeader components"
```

---

## Task 9: index.astro — landing page

**Files:**
- Modify: `src/pages/index.astro`

The landing page displays the four chapter cards with real record counts from the data files. Uses StatCard for summary numbers and a clean grid of chapter entry points.

- [ ] **Step 1: Rewrite src/pages/index.astro**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import SiteHeader from '../components/shared/SiteHeader.astro';
import SiteFooter from '../components/shared/SiteFooter.astro';
import { StatCard } from '../components/shared/StatCard';
import { t } from '../lib/i18n';
import {
  loadAgrochemicals,
  loadPlantProducts,
  loadSeedlings,
  loadSeeds,
  loadPotatoSeeds,
  loadVetAuthorizations,
  loadVetDistributors,
  loadVetMedicineImporters,
} from '../lib/data';
import type { Lang } from '../lib/types';

const lang: Lang = 'fr';

const agrochemicals   = loadAgrochemicals();
const plantProducts   = loadPlantProducts();
const seedlings       = loadSeedlings();
const seeds           = loadSeeds();
const potatoSeeds     = loadPotatoSeeds();
const vetAuths        = loadVetAuthorizations();
const vetDistributors = loadVetDistributors();
const vetImporters    = loadVetMedicineImporters();

const totalRecords =
  agrochemicals.length + plantProducts.length + seedlings.length +
  seeds.length + potatoSeeds.length + vetAuths.length +
  vetDistributors.length + vetImporters.length;

const chapters = [
  {
    num:   t(lang, 'chapters.ch1_num'),
    title: t(lang, 'chapters.ch1_title'),
    lead:  t(lang, 'chapters.ch1_lead'),
    href:  '/dependency',
    count: plantProducts.length + seedlings.length + seeds.length + potatoSeeds.length,
  },
  {
    num:   t(lang, 'chapters.ch2_num'),
    title: t(lang, 'chapters.ch2_title'),
    lead:  t(lang, 'chapters.ch2_lead'),
    href:  '/chemicals',
    count: agrochemicals.length,
  },
  {
    num:   t(lang, 'chapters.ch3_num'),
    title: t(lang, 'chapters.ch3_title'),
    lead:  t(lang, 'chapters.ch3_lead'),
    href:  '/players',
    count: totalRecords,
  },
  {
    num:   t(lang, 'chapters.ch4_num'),
    title: t(lang, 'chapters.ch4_title'),
    lead:  t(lang, 'chapters.ch4_lead'),
    href:  '/veterinary',
    count: vetAuths.length + vetDistributors.length + vetImporters.length,
  },
];
---

<BaseLayout title={t(lang, 'home.title')} lang={lang}>
  <SiteHeader lang={lang} />

  <main class="max-w-6xl mx-auto px-4 sm:px-6 py-14 flex-1">

    <!-- Hero -->
    <section class="mb-16 max-w-3xl">
      <h1 class="font-display font-bold text-display-lg text-ink leading-tight mb-4">
        {t(lang, 'home.title')}
      </h1>
      <p class="text-base text-muted leading-relaxed mb-8 font-body">
        {t(lang, 'home.subtitle')}
      </p>
      <div class="flex flex-wrap gap-3">
        <a
          href="/chemicals"
          class="inline-flex items-center px-5 py-2.5 bg-forest text-paper font-body text-sm rounded hover:bg-forest-dark transition-colors"
        >
          {t(lang, 'home.cta_explore')}
        </a>
        <a
          href="/dependency"
          class="inline-flex items-center px-5 py-2.5 border border-line text-ink font-body text-sm rounded hover:bg-surface transition-colors"
        >
          {t(lang, 'home.cta_story')}
        </a>
      </div>
    </section>

    <!-- Stats row -->
    <section class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-16">
      <StatCard value={agrochemicals.length}   label={t(lang, 'stats.agrochemicals')} accent />
      <StatCard value={seeds.length}            label={t(lang, 'stats.seeds')} />
      <StatCard value={plantProducts.length}    label={t(lang, 'stats.fruit_imports')} />
      <StatCard value={vetAuths.length + vetDistributors.length + vetImporters.length} label={t(lang, 'stats.vet_records')} />
    </section>

    <!-- Chapter cards -->
    <section>
      <div class="grid sm:grid-cols-2 gap-5">
        {chapters.map(({ num, title, lead, href, count }) => (
          <a
            href={href}
            class="group flex flex-col gap-3 p-6 bg-surface border border-line rounded-lg hover:border-forest transition-colors"
          >
            <div class="flex items-baseline justify-between">
              <span class="font-mono text-data text-forest tracking-widest">{num}</span>
              <span class="font-mono text-data text-muted tabular-nums">{count.toLocaleString('fr-DZ')}</span>
            </div>
            <h2 class="font-display font-bold text-display-sm text-ink group-hover:text-forest transition-colors">
              {title}
            </h2>
            <p class="text-sm text-muted leading-relaxed font-body">{lead}</p>
            <span class="text-sm text-forest font-body mt-auto">
              {t(lang, 'chapters.explore')} →
            </span>
          </a>
        ))}
      </div>
    </section>

  </main>

  <SiteFooter lang={lang} />
</BaseLayout>
```

- [ ] **Step 2: Verify build completes with real data**

```bash
npm run build
```

Expected: builds, `dist/index.html` exists, no errors. Total record counts in the page HTML match what we know (9,532 total).

- [ ] **Step 3: Quick smoke check — verify record counts appear in built HTML**

```bash
grep "5 058\|5058\|5,058" dist/index.html | wc -l
```

Expected: at least 1 match (agrochemicals count appears in the stats).

- [ ] **Step 4: Run all tests**

```bash
npm test
```

Expected: all tests passing.

- [ ] **Step 5: Commit**

```bash
git add src/pages/index.astro
git commit -m "✨ add landing page with chapter cards and live record counts"
```

---

## Final verification

- [ ] Run `npm run build` — no TypeScript or build errors
- [ ] Run `npm test` — all tests passing
- [ ] Check `dist/index.html` exists and is non-empty
- [ ] Run `npm run preview` and open `http://localhost:4321` — page loads with correct French text, four chapter cards, and record counts
