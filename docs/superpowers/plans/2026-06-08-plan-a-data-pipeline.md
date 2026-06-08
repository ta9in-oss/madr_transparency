# Plan A: Data Pipeline Overhaul

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix corrupted data (151 Malta records, 238 unknown seeds, unnormalized material_type), preserve raw scraper output in `data/raw/`, and produce `data/insights.json` with pre-computed aggregations so the frontend renders without doing any data math.

**Architecture:** Scraper writes immutable raw JSON to `data/raw/`. `scripts/normalize_data.py` reads from `data/raw/`, applies pycountry+Groq normalization, writes clean records to `data/`. `scripts/compute_insights.py` reads from `data/` and writes per-chapter aggregations + Groq-generated narrative to `data/insights.json`. GitHub Actions runs all three steps in sequence.

**Tech Stack:** Python 3.12, pycountry 26.2.16, groq 1.4.0 (llama-3.3-70b-versatile), TypeScript (type declarations only)

---

## File Map

| File | Action | Purpose |
|------|--------|---------|
| `scraper/config.py` | Modify | Add `RAW_DATA_DIR` constant |
| `scraper/writers/json_writer.py` | Modify | Accept `output_dir` param, default to `RAW_DATA_DIR` |
| `scraper/run.py` | Modify | Pass `RAW_DATA_DIR` to writer |
| `scraper/normalize.py` | Modify | Fix multi-country → XX; add `normalize_seed_material()` |
| `scripts/normalize_data.py` | Modify | Read from `data/raw/`, write to `data/`; add seeds material normalization |
| `scripts/compute_insights.py` | Create | Aggregate data → `data/insights.json` with Groq narrative |
| `src/lib/types.ts` | Modify | Add `Insights` type for `data/insights.json` |
| `data/raw/` | Create dir | Holds immutable scraper output |
| `.github/workflows/scrape.yml` | Modify | Add compute-insights step; commit `data/raw/` |
| `tests/test_normalize_pipeline.py` | Create | Tests for material normalization, MT fix, insights shape |

---

### Task 1: Add RAW_DATA_DIR to config and wire scraper to write there

**Files:**
- Modify: `scraper/config.py`
- Modify: `scraper/writers/json_writer.py`
- Modify: `scraper/run.py`

- [ ] **Step 1: Write a failing test**

Create `tests/test_normalize_pipeline.py`:
```python
from pathlib import Path
from scraper.config import DATA_DIR, RAW_DATA_DIR

def test_raw_data_dir_is_data_raw():
    assert RAW_DATA_DIR == DATA_DIR / "raw"

def test_raw_data_dir_is_separate_from_data_dir():
    assert RAW_DATA_DIR != DATA_DIR
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd /home/mohessaid/workspaces/ta9in_oss/madr
python -m pytest tests/test_normalize_pipeline.py::test_raw_data_dir_is_data_raw -v
```
Expected: `ImportError: cannot import name 'RAW_DATA_DIR'`

- [ ] **Step 3: Add RAW_DATA_DIR to config.py**

Edit `scraper/config.py`:
```python
from pathlib import Path

BASE_URL = "https://madr.gov.dz/transparency"
DATA_DIR = Path(__file__).parent.parent / "data"
RAW_DATA_DIR = DATA_DIR / "raw"
REQUEST_DELAY_SECONDS = 1.5
REQUEST_TIMEOUT_SECONDS = 30
MAX_RETRIES = 3

USER_AGENT = (
    "madr-transparency-scraper/1.0 "
    "(+https://github.com/ta9in-oss/madr_transparency)"
)
```

- [ ] **Step 4: Update json_writer.py to default to RAW_DATA_DIR**

Edit `scraper/writers/json_writer.py`:
```python
import json
import dataclasses
from pathlib import Path
from scraper.config import RAW_DATA_DIR


class JsonWriter:
    def __init__(self, output_dir: Path = RAW_DATA_DIR):
        self._output_dir = output_dir
        self._output_dir.mkdir(parents=True, exist_ok=True)

    def write(self, records: list, filename: str) -> Path:
        output_path = self._output_dir / f"{filename}.json"
        serialised = [dataclasses.asdict(r) for r in records]
        output_path.write_text(
            json.dumps(serialised, ensure_ascii=False, indent=2, sort_keys=True),
            encoding="utf-8",
        )
        return output_path
```

- [ ] **Step 5: Run tests to verify they pass**

```bash
python -m pytest tests/test_normalize_pipeline.py -v
```
Expected: `2 passed`

- [ ] **Step 6: Commit**

```bash
git add scraper/config.py scraper/writers/json_writer.py tests/test_normalize_pipeline.py
git commit -m "feat(pipeline): add RAW_DATA_DIR, scraper writes to data/raw/"
```

---

### Task 2: Fix multi-country → XX bug in normalize.py

The current code routes any 4+ char string through `pycountry.search_fuzzy()`. Multi-country strings like `"cote d'ivoire-costa rica-colombie-guatemala"` pass the length check and fuzzy-match to Malta (MT). The fix: detect multiple countries before any lookup; if found, return `'XX'` immediately.

**Files:**
- Modify: `scraper/normalize.py` (around line 60–90, the `normalize_country` function)
- Modify: `tests/test_normalize_pipeline.py`

- [ ] **Step 1: Write failing tests**

Add to `tests/test_normalize_pipeline.py`:
```python
from scraper.normalize import normalize_country

def test_multi_country_string_returns_xx():
    assert normalize_country("cote d'ivoire-costa rica-colombie-guatemala") == "XX"

def test_multi_country_slash_returns_xx():
    assert normalize_country("COSTA RICA / COLOMBIE") == "XX"

def test_multi_country_comma_returns_xx():
    assert normalize_country("France, Espagne, Italie") == "XX"

def test_single_valid_iso2_still_works():
    assert normalize_country("FR") == "FR"

def test_single_country_name_still_works():
    assert normalize_country("Espagne") == "ES"
```

- [ ] **Step 2: Run to verify they fail**

```bash
python -m pytest tests/test_normalize_pipeline.py::test_multi_country_string_returns_xx -v
```
Expected: `FAILED` (currently returns `MT`)

- [ ] **Step 3: Fix normalize_country in scraper/normalize.py**

Find the `normalize_country` function (approximately line 95–140) and add a multi-country check at the top:

```python
_MULTI_COUNTRY_RE = re.compile(
    r"[\/,;]|\s+[-–]\s+|\s+(?:et|ou|or|and)\s+",
    re.IGNORECASE,
)

def normalize_country(raw: str) -> str:
    """Normalize a raw country string to ISO alpha-2 or 'XX'."""
    if not raw or not raw.strip():
        return "XX"

    raw = raw.strip()

    # Multi-country strings (contain separators between country names):
    # detect before any pycountry lookup to avoid fuzzy match returning Malta etc.
    if _MULTI_COUNTRY_RE.search(raw) and len(raw) > 4:
        # Try splitting and resolving each part
        parts = [p.strip() for p in _SPLIT_RE.split(raw) if p.strip()]
        if len(parts) > 1:
            # Multiple parts — flag as multi-origin
            return "XX"

    # Check cache first
    key = _normalize_key(raw)
    if raw in _CACHE:
        return _CACHE[raw]
    if key in _CACHE:
        return _CACHE[key]

    # pycountry lookup
    result = _pycountry_lookup(raw)
    if result:
        _CACHE[raw] = result
        return result

    # Queue for Groq if available
    if raw not in _GROQ_QUEUE:
        _GROQ_QUEUE.append(raw)
    return "XX"
```

NOTE: The full `normalize_country` function already exists in `scraper/normalize.py`. You are replacing it, not adding a second one. Find the existing function starting with `def normalize_country(` and replace the entire function body. Also add `_MULTI_COUNTRY_RE` near `_SPLIT_RE` (around line 60).

- [ ] **Step 4: Run all normalize tests**

```bash
python -m pytest tests/test_normalize_pipeline.py -v
```
Expected: all pass

- [ ] **Step 5: Fix the 151 existing MT records in data/plant-products.json**

Run this one-time fix script inline:
```bash
python -c "
import json
from pathlib import Path

path = Path('data/plant-products.json')
rows = json.loads(path.read_text())
fixed = 0
for r in rows:
    if r.get('country_of_origin') == 'MT':
        prod_zone = r.get('production_zone', '')
        # These are multi-origin banana imports — correct to XX
        r['country_of_origin'] = 'XX'
        fixed += 1
path.write_text(json.dumps(rows, ensure_ascii=False, indent=2), encoding='utf-8')
print(f'Fixed {fixed} MT records → XX')
"
```
Expected output: `Fixed 151 MT records → XX`

- [ ] **Step 6: Commit**

```bash
git add scraper/normalize.py data/plant-products.json tests/test_normalize_pipeline.py
git commit -m "fix(data): multi-country strings → XX; fix 151 Malta false-positives in plant-products"
```

---

### Task 3: Normalize seeds material_type (95+ variants → 6 canonical)

**Files:**
- Modify: `scraper/normalize.py` (add `normalize_seed_material()`)
- Modify: `src/lib/normalize.ts` (add `normalizeSeedMaterial()`)
- Modify: `scripts/normalize_data.py` (apply to seeds.json, seedlings.json)
- Modify: `tests/test_normalize_pipeline.py`

- [ ] **Step 1: Write failing tests**

Add to `tests/test_normalize_pipeline.py`:
```python
from scraper.normalize import normalize_seed_material

def test_seed_material_standard():
    for raw in ['Semence', 'SEMENCE', 'semence', 'SEMENCES', 'semences', 'Semences']:
        assert normalize_seed_material(raw) == 'Semence standard', f"Failed for {raw!r}"

def test_seed_material_hybrid():
    for raw in ['Semences hybrides', 'SEMENCES HYBRIDES', 'Semence hybride F1', 'Hybride']:
        assert normalize_seed_material(raw) == 'Semence hybride', f"Failed for {raw!r}"

def test_seed_material_rootstock():
    for raw in ['PORTE GREFFE', 'porte-greffes', 'M9', 'GF677', 'Porte greffes']:
        assert normalize_seed_material(raw) == 'Porte-greffe', f"Failed for {raw!r}"

def test_seed_material_forage():
    for raw in ['Semence fourragère', 'SEMENCES FOURAGERES', 'luzerne blue moon']:
        assert normalize_seed_material(raw) == 'Semence fourragère', f"Failed for {raw!r}"

def test_seed_material_tuber():
    for raw in ['TUBERCULES', 'tubercule', 'Tubercules']:
        assert normalize_seed_material(raw) == 'Tubercule', f"Failed for {raw!r}"

def test_seed_material_plant():
    for raw in ['PLANTES', 'Plants', 'plante', 'PLANT']:
        assert normalize_seed_material(raw) == 'Plant', f"Failed for {raw!r}"

def test_seed_material_garbage_returns_autre():
    for raw in ['METALAXYL', 'Abamectin 1.88%+Deltamethrin', 'test', 'VOIR ANNEXE']:
        assert normalize_seed_material(raw) == 'Autre', f"Failed for {raw!r}"
```

- [ ] **Step 2: Run to verify they fail**

```bash
python -m pytest tests/test_normalize_pipeline.py::test_seed_material_standard -v
```
Expected: `ImportError: cannot import name 'normalize_seed_material'`

- [ ] **Step 3: Add normalize_seed_material to scraper/normalize.py**

Append to `scraper/normalize.py` after `normalize_plant_category`:
```python
def normalize_seed_material(raw: str | None) -> str:
    """Collapse 95+ material_type variants for seeds/seedlings into 6 canonical groups."""
    if not raw:
        return "Autre"
    u = raw.strip().upper()
    u = re.sub(r"[''ʼʻ′`'']", "'", u)
    u = re.sub(r"\s+", " ", u)

    if not u:
        return "Autre"

    # Garbage / chemical names (data entry errors)
    if re.search(r"ABAMECTIN|DELTAMETHRIN|DIFECONAZOLE|ACETAMIPRIDE|METALAXYL|CIFLUFENAMIDE", u):
        return "Autre"
    if u in ("TEST", "VOIR ANNEXE", "BULBES A FLEURES", "DIVERS", "SEMENCE750",
             "FRUIT", "ECHANTILLONS", "SELENCES", "SEMNCES", "SEMECESN",
             "SEMENSES", "SEMANCES", "SEMEENCE"):
        return "Autre"

    # Tuber (pomme de terre)
    if re.search(r"TUBERCUL", u):
        return "Tubercule"

    # Plant / seedling material (starts with PLANT or PLANTE)
    if re.search(r"^PLANT", u) and not re.search(r"SEMENCE", u):
        return "Plant"

    # Rootstock
    if re.search(r"PORTE.?GREFFE|PORTE GREFFE|^M9$|^M09$|^GF677|^GREFFES?$|VITIS VINIFERA", u):
        return "Porte-greffe"

    # Forage seeds
    if re.search(r"FOURAG|FOURRAG|LUZERNE|RHODES GRASS|SORGHUM SUDAN", u):
        return "Semence fourragère"

    # Hybrid seeds
    if re.search(r"HYBRIDE|HYBRID|HYBR|F1", u):
        return "Semence hybride"

    # Standard seeds (most common — check last so hybrids/forage are caught above)
    if re.search(r"SEMENCE|SEMENCES|SEMANCE|Bذور|بذور", u):
        return "Semence standard"

    return "Autre"
```

- [ ] **Step 4: Run tests**

```bash
python -m pytest tests/test_normalize_pipeline.py -v
```
Expected: all pass

- [ ] **Step 5: Add normalizeSeedMaterial to src/lib/normalize.ts**

Append to `src/lib/normalize.ts`:
```typescript
export function normalizeSeedMaterial(raw: string | undefined | null): string {
  if (!raw) return 'Autre';
  const u = raw.trim().toUpperCase()
    .replace(/[''ʼʻ′`'']/g, "'")
    .replace(/\s+/g, ' ');
  if (!u) return 'Autre';

  if (/ABAMECTIN|DELTAMETHRIN|DIFECONAZOLE|ACETAMIPRIDE|METALAXYL|CIFLUFENAMIDE/.test(u)) return 'Autre';
  if (['TEST', 'VOIR ANNEXE', 'BULBES A FLEURES', 'DIVERS', 'FRUIT', 'ECHANTILLONS'].includes(u)) return 'Autre';

  if (/TUBERCUL/.test(u)) return 'Tubercule';
  if (/^PLANT/.test(u) && !/SEMENCE/.test(u)) return 'Plant';
  if (/PORTE.?GREFFE|^M9$|^M09$|^GF677|^GREFFES?$|VITIS VINIFERA/.test(u)) return 'Porte-greffe';
  if (/FOURAG|FOURRAG|LUZERNE|RHODES GRASS/.test(u)) return 'Semence fourragère';
  if (/HYBRIDE|HYBRID|HYBR|F1/.test(u)) return 'Semence hybride';
  if (/SEMENCE|SEMENCES|SEMANCE/.test(u)) return 'Semence standard';

  return 'Autre';
}
```

- [ ] **Step 6: Wire into normalize_data.py**

In `scripts/normalize_data.py`, add import and apply to seeds + seedlings:
```python
from scraper.normalize import (
    normalize_chem_category,
    normalize_plant_category,
    normalize_seed_material,
    normalize_country,
    flush_groq_queue,
    _GROQ_QUEUE,
    _CACHE,
)
```

In `normalize_file()`, add a new branch after the plant_cat block:
```python
        if has_material and "material_type" in row:
            raw = row["material_type"] or ""
            row["material_type"] = normalize_seed_material(raw)
```

Update the FILES tuple to 6 elements (add `use_material` column):
```python
# (path, has_country, has_category, use_chem_cat, use_plant_cat, use_material)
FILES = [
    (DATA_DIR / "agrochemicals.json",  True,  True,  True,  False, False),
    (DATA_DIR / "plant-products.json", True,  True,  False, True,  False),
    (DATA_DIR / "seeds.json",          True,  False, False, False, True),
    (DATA_DIR / "seedlings.json",      True,  False, False, False, True),
    (DATA_DIR / "potato-seeds.json",   True,  False, False, False, False),
]
```

Update `normalize_file` signature:
```python
def normalize_file(
    path: Path,
    has_country: bool,
    has_category: bool,
    use_chem_cat: bool = False,
    use_plant_cat: bool = False,
    use_material: bool = False,
) -> tuple[set[str], set[str]]:
```

Update `run_pass`:
```python
def run_pass(label: str) -> None:
    print(f"\n{label}")
    for path, hc, hcat, chem, plant, mat in FILES:
        normalize_file(path, hc, hcat, chem, plant, mat)
```

- [ ] **Step 7: Run normalization to apply to existing data**

```bash
python scripts/normalize_data.py
```
Expected output includes lines like:
```
seeds.json: material 95 unique → 6 unique
seedlings.json: material 60 unique → 6 unique
```

- [ ] **Step 8: Verify**

```bash
python -c "
import json
from collections import Counter
seeds = json.load(open('data/seeds.json'))
print('Seeds material types:', dict(Counter(r['material_type'] for r in seeds)))
seedlings = json.load(open('data/seedlings.json'))
print('Seedlings material types:', dict(Counter(r['material_type'] for r in seedlings)))
"
```
Expected: only 6 values appear in each (`Semence standard`, `Semence hybride`, `Porte-greffe`, `Semence fourragère`, `Tubercule`, `Plant`, `Autre`)

- [ ] **Step 9: Commit**

```bash
git add scraper/normalize.py src/lib/normalize.ts scripts/normalize_data.py \
        data/seeds.json data/seedlings.json tests/test_normalize_pipeline.py
git commit -m "feat(pipeline): normalize seeds material_type (95+ variants → 6 canonical)"
```

---

### Task 4: Decode vet authorization product type codes

**Files:**
- Modify: `scripts/normalize_data.py` (add `decode_vet_product_type()`)
- Modify: `data/vet-authorizations.json` (add `product_type_label` field)
- Modify: `src/lib/types.ts` (add `productTypeLabel` to `VetAuthorization`)
- Modify: `src/lib/data.ts` (map `product_type_label`)

- [ ] **Step 1: Add decode function to normalize_data.py**

Add after the imports section in `scripts/normalize_data.py`:
```python
# MADR veterinary product type code → human-readable label
VET_TYPE_LABELS: dict[str, dict[str, str]] = {
    "PRC": {
        "fr": "Produit de la Rente et de Consommation",
        "ar": "منتج الريع والاستهلاك",
        "en": "Rent & Consumption Product",
    },
    "PRP": {
        "fr": "Produit de la Rente et de Promotion",
        "ar": "منتج الريع والترقية",
        "en": "Rent & Promotion Product",
    },
    "PRD": {
        "fr": "Produit de Rente Diagnostique",
        "ar": "منتج تشخيصي",
        "en": "Diagnostic Rent Product",
    },
    "PRCGP": {
        "fr": "Produit de la Rente et de Consommation (Grande Production)",
        "ar": "منتج الريع والاستهلاك (إنتاج واسع)",
        "en": "Rent & Consumption (Large Scale)",
    },
    "OACRCGP": {
        "fr": "Organisme d'Autorisation et de Contrôle (Grande Production)",
        "ar": "هيئة الترخيص والرقابة (إنتاج واسع)",
        "en": "Authorization & Control Body (Large Scale)",
    },
}

def decode_vet_product_type(code: str) -> dict[str, str]:
    """Return {fr, ar, en} labels for a vet authorization product type code."""
    return VET_TYPE_LABELS.get(code.strip().upper(), {
        "fr": code or "Non classifié",
        "ar": code or "غير مصنف",
        "en": code or "Unclassified",
    })
```

- [ ] **Step 2: Apply to vet-authorizations.json**

Add a `normalize_vet_types()` call in `normalize_data.py`:
```python
def normalize_vet_types() -> None:
    path = DATA_DIR / "vet-authorizations.json"
    rows = json.loads(path.read_text(encoding="utf-8"))
    for row in rows:
        code = row.get("product_type", "")
        row["product_type_label"] = decode_vet_product_type(code)
    path.write_text(json.dumps(rows, ensure_ascii=False, indent=2), encoding="utf-8")
    codes = set(r.get("product_type", "") for r in rows)
    print(f"  vet-authorizations.json: decoded {len(codes)} product type codes")
```

Call it at the end of `main()` in `normalize_data.py`:
```python
    normalize_vet_types()
    print("\nDone.")
```

- [ ] **Step 3: Update TypeScript types**

In `src/lib/types.ts`, update `VetAuthorization`:
```typescript
export interface VetAuthorization {
  company: string;
  companyNameAr: string;
  authorizationNumber: string;
  agreementNumber: string;
  productType: string;
  productTypeLabel: { fr: string; ar: string; en: string };
}
```

- [ ] **Step 4: Update data.ts to include productTypeLabel**

In `src/lib/data.ts`, find `loadVetAuthorizations()` and add the field mapping:
```typescript
productTypeLabel: raw.product_type_label ?? { fr: raw.product_type, ar: raw.product_type, en: raw.product_type },
```

- [ ] **Step 5: Run normalization and verify**

```bash
python scripts/normalize_data.py
python -c "
import json
rows = json.load(open('data/vet-authorizations.json'))
print(rows[0]['product_type'], '->', rows[0]['product_type_label'])
print(rows[1]['product_type'], '->', rows[1]['product_type_label'])
"
```
Expected:
```
PRC -> {'fr': 'Produit de la Rente et de Consommation', 'ar': '...', 'en': '...'}
```

- [ ] **Step 6: Commit**

```bash
git add scripts/normalize_data.py data/vet-authorizations.json src/lib/types.ts src/lib/data.ts
git commit -m "feat(pipeline): decode vet product type codes with multilingual labels"
```

---

### Task 5: Build compute_insights.py — pre-compute all aggregations + Groq narrative

**Files:**
- Create: `scripts/compute_insights.py`
- Create: `src/lib/insights-types.ts` (TypeScript type for insights.json)
- Modify: `tests/test_normalize_pipeline.py`

- [ ] **Step 1: Write failing test for insights shape**

Add to `tests/test_normalize_pipeline.py`:
```python
import subprocess, json, os

def test_compute_insights_produces_valid_json(tmp_path):
    """compute_insights.py must run without error and produce valid insights.json"""
    result = subprocess.run(
        ["python", "scripts/compute_insights.py"],
        capture_output=True, text=True
    )
    assert result.returncode == 0, f"Script failed:\n{result.stderr}"
    insights_path = Path("data/insights.json")
    assert insights_path.exists(), "data/insights.json was not created"
    insights = json.loads(insights_path.read_text())
    # Must have all four chapters
    for chapter in ("dependency", "chemicals", "players", "veterinary"):
        assert chapter in insights, f"Missing chapter: {chapter}"
    # Must have generated_at
    assert "generated_at" in insights
```

- [ ] **Step 2: Run to verify it fails**

```bash
python -m pytest tests/test_normalize_pipeline.py::test_compute_insights_produces_valid_json -v
```
Expected: `FAILED` (script doesn't exist)

- [ ] **Step 3: Create scripts/compute_insights.py**

```python
"""
Compute pre-aggregated insights from normalized data files.

Usage:
    python scripts/compute_insights.py           # deterministic aggregations only
    python scripts/compute_insights.py --groq    # + Groq narrative per chapter

Writes: data/insights.json
"""
from __future__ import annotations

import argparse
import json
import os
import sys
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

DATA_DIR = Path(__file__).parent.parent / "data"
INSIGHTS_PATH = DATA_DIR / "insights.json"


def _top_n(counter: Counter, n: int = 10) -> list[dict]:
    return [{"key": k, "count": v} for k, v in counter.most_common(n)]


def compute_dependency() -> dict:
    plants = json.loads((DATA_DIR / "plant-products.json").read_text())
    seeds = json.loads((DATA_DIR / "seeds.json").read_text())
    seedlings = json.loads((DATA_DIR / "seedlings.json").read_text())
    potato = json.loads((DATA_DIR / "potato-seeds.json").read_text())

    all_rows = plants + seeds + seedlings + potato
    total = len(all_rows)

    seed_countries = Counter(
        r["country_of_origin"] for r in seeds + seedlings + potato
        if r.get("country_of_origin") and r["country_of_origin"] != "XX"
    )
    plant_countries = Counter(
        r["country_of_origin"] for r in plants
        if r.get("country_of_origin") and r["country_of_origin"] != "XX"
    )

    # Banana / fruit dominance
    fruit_count = sum(1 for r in plants if r.get("category") == "Fruits")
    banana_count = sum(
        1 for r in plants
        if r.get("category") == "Fruits" and (
            "banan" in (r.get("known_name") or "").lower() or
            "banan" in (r.get("variety") or "").lower() or
            "cavendish" in (r.get("variety") or "").lower() or
            "musa" in (r.get("variety") or "").lower()
        )
    )

    plant_cat_counts = Counter(r.get("category", "Autre") for r in plants)
    seed_mat_counts = Counter(r.get("material_type", "Autre") for r in seeds + seedlings)

    xx_count = sum(1 for r in all_rows if r.get("country_of_origin") == "XX")
    multi_origin_note = sum(
        1 for r in plants
        if r.get("country_of_origin") == "XX" and r.get("production_zone")
    )

    companies = Counter(r["company"] for r in all_rows if r.get("company"))

    return {
        "total_records": total,
        "top_seed_countries": _top_n(seed_countries),
        "top_plant_countries": _top_n(plant_countries),
        "plant_category_breakdown": dict(plant_cat_counts),
        "seed_material_breakdown": dict(seed_mat_counts),
        "fruit_count": fruit_count,
        "banana_count": banana_count,
        "banana_share_pct": round(banana_count / fruit_count * 100, 1) if fruit_count else 0,
        "xx_count": xx_count,
        "multi_origin_count": multi_origin_note,
        "top_companies": _top_n(companies, 15),
    }


def compute_chemicals() -> dict:
    rows = json.loads((DATA_DIR / "agrochemicals.json").read_text())
    total = len(rows)

    countries = Counter(
        r["country_of_origin"] for r in rows
        if r.get("country_of_origin") and r["country_of_origin"] != "XX"
    )
    categories = Counter(r.get("category", "Non classifié") for r in rows)
    companies = Counter(r["company"] for r in rows if r.get("company"))
    substances = Counter(
        r["active_substance"] for r in rows
        if r.get("active_substance")
    )

    # Herfindahl-Hirschman Index (market concentration) for companies
    shares = [v / total for v in companies.values()]
    hhi = round(sum(s ** 2 for s in shares), 4)

    return {
        "total": total,
        "top_countries": _top_n(countries),
        "category_breakdown": dict(categories),
        "top_companies": _top_n(companies, 15),
        "top_active_substances": _top_n(substances, 10),
        "hhi_companies": hhi,
        "spain_count": countries.get("ES", 0),
        "italy_count": countries.get("IT", 0),
        "china_count": countries.get("CN", 0),
    }


def compute_players() -> dict:
    agro = json.loads((DATA_DIR / "agrochemicals.json").read_text())
    plants = json.loads((DATA_DIR / "plant-products.json").read_text())
    seeds = json.loads((DATA_DIR / "seeds.json").read_text())
    seedlings = json.loads((DATA_DIR / "seedlings.json").read_text())
    potato = json.loads((DATA_DIR / "potato-seeds.json").read_text())
    vet_auths = json.loads((DATA_DIR / "vet-authorizations.json").read_text())
    vet_dist = json.loads((DATA_DIR / "vet-distributors.json").read_text())
    vet_imp = json.loads((DATA_DIR / "vet-medicine-importers.json").read_text())

    all_rows = agro + plants + seeds + seedlings + potato + vet_auths + vet_dist + vet_imp
    total = len(all_rows)

    companies = Counter(r["company"] for r in all_rows if r.get("company"))
    top10_count = sum(v for _, v in companies.most_common(10))
    top10_share = round(top10_count / total * 100, 1) if total else 0

    shares = [v / total for v in companies.values()]
    hhi = round(sum(s ** 2 for s in shares), 4)

    return {
        "total_permits": total,
        "unique_companies": len(companies),
        "top_10_share_pct": top10_share,
        "top_companies": _top_n(companies, 20),
        "hhi_index": hhi,
    }


def compute_veterinary() -> dict:
    auths = json.loads((DATA_DIR / "vet-authorizations.json").read_text())
    dist = json.loads((DATA_DIR / "vet-distributors.json").read_text())
    importers = json.loads((DATA_DIR / "vet-medicine-importers.json").read_text())

    wilaya_counts = Counter(r["wilaya"] for r in dist if r.get("wilaya"))
    wilayas_covered = len(wilaya_counts)
    wilayas_absent = max(0, 58 - wilayas_covered)

    product_types = Counter(r.get("product_type", "") for r in auths)
    product_type_labels = {}
    for r in auths:
        code = r.get("product_type", "")
        label = r.get("product_type_label", {})
        if code and isinstance(label, dict):
            product_type_labels[code] = label

    top_wilayas = _top_n(wilaya_counts, 20)

    return {
        "auth_count": len(auths),
        "distributor_count": len(dist),
        "importer_count": len(importers),
        "wilayas_covered": wilayas_covered,
        "wilayas_absent": wilayas_absent,
        "top_wilayas": top_wilayas,
        "product_type_breakdown": dict(product_types),
        "product_type_labels": product_type_labels,
    }


def fetch_groq_narratives(insights: dict) -> dict:
    """Use Groq to generate one-paragraph editorial narrative per chapter."""
    api_key = os.environ.get("GROQ_API_KEY")
    if not api_key:
        print("  GROQ_API_KEY not set — skipping narrative generation")
        return {}

    from groq import Groq
    client = Groq(api_key=api_key)

    CHAPTER_PROMPTS = {
        "dependency": f"""
You are an Algerian data journalist. Based on these agricultural import statistics, write a
2-sentence editorial insight in EACH of French, Arabic, and English.
Data: {json.dumps(insights['dependency'], ensure_ascii=False)[:1500]}
Focus on: banana dominance, China/US/India seed dependency, multi-origin supply risk.
Return JSON: {{"fr": "...", "ar": "...", "en": "..."}}
""",
        "chemicals": f"""
You are an Algerian data journalist. Based on these agrochemical import statistics, write a
2-sentence editorial insight in EACH of French, Arabic, and English.
Data: {json.dumps(insights['chemicals'], ensure_ascii=False)[:1500]}
Focus on: Spain as top supplier, China rising, market concentration.
Return JSON: {{"fr": "...", "ar": "...", "en": "..."}}
""",
        "players": f"""
You are an Algerian data journalist. Based on these market concentration statistics, write a
2-sentence editorial insight in EACH of French, Arabic, and English.
Data: {json.dumps(insights['players'], ensure_ascii=False)[:1500]}
Focus on: top 10 company share, HHI concentration level.
Return JSON: {{"fr": "...", "ar": "...", "en": "..."}}
""",
        "veterinary": f"""
You are an Algerian data journalist. Based on these veterinary sector statistics, write a
2-sentence editorial insight in EACH of French, Arabic, and English.
Data: {json.dumps(insights['veterinary'], ensure_ascii=False)[:1500]}
Focus on: wilayas with zero distributor coverage, southern Algeria gap.
Return JSON: {{"fr": "...", "ar": "...", "en": "..."}}
""",
    }

    narratives = {}
    for chapter, prompt in CHAPTER_PROMPTS.items():
        try:
            response = client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[{"role": "user", "content": prompt}],
                response_format={"type": "json_object"},
                temperature=0.3,
            )
            text = response.choices[0].message.content
            narratives[chapter] = json.loads(text)
            print(f"  Groq narrative generated for {chapter}")
        except Exception as exc:
            print(f"  Groq narrative failed for {chapter}: {exc}")
            narratives[chapter] = {"fr": "", "ar": "", "en": ""}

    return narratives


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--groq", action="store_true",
                        help="Generate Groq narratives (needs GROQ_API_KEY)")
    args = parser.parse_args()

    print("Computing insights...")
    insights = {
        "dependency": compute_dependency(),
        "chemicals": compute_chemicals(),
        "players": compute_players(),
        "veterinary": compute_veterinary(),
        "generated_at": datetime.now(timezone.utc).isoformat(),
    }

    if args.groq:
        print("\nGenerating Groq narratives...")
        narratives = fetch_groq_narratives(insights)
        for chapter, narrative in narratives.items():
            if chapter in insights:
                insights[chapter]["narrative"] = narrative

    INSIGHTS_PATH.write_text(
        json.dumps(insights, ensure_ascii=False, indent=2),
        encoding="utf-8"
    )
    print(f"\nInsights written to {INSIGHTS_PATH}")
    print(f"  dependency: {insights['dependency']['total_records']} records")
    print(f"  chemicals: {insights['chemicals']['total']} records")
    print(f"  players: {insights['players']['total_permits']} permits, {insights['players']['unique_companies']} companies")
    print(f"  veterinary: {insights['veterinary']['wilayas_covered']}/58 wilayas covered")


if __name__ == "__main__":
    main()
```

- [ ] **Step 4: Run the script and verify**

```bash
python scripts/compute_insights.py
```
Expected output:
```
Computing insights...
Insights written to data/insights.json
  dependency: 3958 records
  chemicals: 5058 records
  players: ~9500 permits, ~400 companies
  veterinary: 40/58 wilayas covered
```

- [ ] **Step 5: Run the test**

```bash
python -m pytest tests/test_normalize_pipeline.py::test_compute_insights_produces_valid_json -v
```
Expected: `PASSED`

- [ ] **Step 6: Create TypeScript type for insights.json**

Create `src/lib/insights-types.ts`:
```typescript
export interface TopN {
  key: string;
  count: number;
}

export interface ChapterNarrative {
  fr: string;
  ar: string;
  en: string;
}

export interface DependencyInsights {
  total_records: number;
  top_seed_countries: TopN[];
  top_plant_countries: TopN[];
  plant_category_breakdown: Record<string, number>;
  seed_material_breakdown: Record<string, number>;
  fruit_count: number;
  banana_count: number;
  banana_share_pct: number;
  xx_count: number;
  multi_origin_count: number;
  top_companies: TopN[];
  narrative?: ChapterNarrative;
}

export interface ChemicalsInsights {
  total: number;
  top_countries: TopN[];
  category_breakdown: Record<string, number>;
  top_companies: TopN[];
  top_active_substances: TopN[];
  hhi_companies: number;
  spain_count: number;
  italy_count: number;
  china_count: number;
  narrative?: ChapterNarrative;
}

export interface PlayersInsights {
  total_permits: number;
  unique_companies: number;
  top_10_share_pct: number;
  top_companies: TopN[];
  hhi_index: number;
  narrative?: ChapterNarrative;
}

export interface VeterinaryInsights {
  auth_count: number;
  distributor_count: number;
  importer_count: number;
  wilayas_covered: number;
  wilayas_absent: number;
  top_wilayas: TopN[];
  product_type_breakdown: Record<string, number>;
  product_type_labels: Record<string, ChapterNarrative>;
  narrative?: ChapterNarrative;
}

export interface Insights {
  dependency: DependencyInsights;
  chemicals: ChemicalsInsights;
  players: PlayersInsights;
  veterinary: VeterinaryInsights;
  generated_at: string;
}
```

- [ ] **Step 7: Commit**

```bash
git add scripts/compute_insights.py src/lib/insights-types.ts data/insights.json \
        tests/test_normalize_pipeline.py
git commit -m "feat(pipeline): compute_insights.py → data/insights.json with Groq narratives"
```

---

### Task 6: Wire raw data preservation into scraper and update workflow

**Files:**
- Modify: `scraper/run.py` (writer already defaults to RAW_DATA_DIR after Task 1 — verify)
- Modify: `scripts/normalize_data.py` (read from `data/raw/`, write to `data/`)
- Modify: `.github/workflows/scrape.yml`

- [ ] **Step 1: Update normalize_data.py to read from data/raw/ and write to data/**

In `scripts/normalize_data.py`, change the DATA_DIR reference so input comes from `data/raw/`:

```python
from scraper.config import DATA_DIR, RAW_DATA_DIR

# Read from raw, write to normalized
RAW_DIR = RAW_DATA_DIR
OUT_DIR = DATA_DIR

# (path_raw, path_out, has_country, has_category, use_chem_cat, use_plant_cat, use_material)
FILES = [
    (RAW_DIR / "agrochemicals.json",  OUT_DIR / "agrochemicals.json",  True,  True,  True,  False, False),
    (RAW_DIR / "plant-products.json", OUT_DIR / "plant-products.json", True,  True,  False, True,  False),
    (RAW_DIR / "seeds.json",          OUT_DIR / "seeds.json",          True,  False, False, False, True),
    (RAW_DIR / "seedlings.json",      OUT_DIR / "seedlings.json",      True,  False, False, False, True),
    (RAW_DIR / "potato-seeds.json",   OUT_DIR / "potato-seeds.json",   True,  False, False, False, False),
]
```

Update `normalize_file` to accept separate `in_path` and `out_path`:
```python
def normalize_file(
    in_path: Path,
    out_path: Path,
    has_country: bool,
    has_category: bool,
    use_chem_cat: bool = False,
    use_plant_cat: bool = False,
    use_material: bool = False,
) -> tuple[set[str], set[str]]:
    with open(in_path, encoding="utf-8") as f:
        rows = json.load(f)
    # ... normalization logic unchanged ...
    out_path.parent.mkdir(parents=True, exist_ok=True)
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(rows, f, ensure_ascii=False, indent=2)
    # ... print stats ...
```

Update `run_pass`:
```python
def run_pass(label: str) -> None:
    print(f"\n{label}")
    for in_path, out_path, hc, hcat, chem, plant, mat in FILES:
        normalize_file(in_path, out_path, hc, hcat, chem, plant, mat)
```

NOTE: When `data/raw/` doesn't exist yet (first run after this change), fall back to `data/` as input:
```python
def normalize_file(in_path: Path, out_path: Path, ...):
    # Fall back to out_path if raw doesn't exist yet (backcompat)
    read_path = in_path if in_path.exists() else out_path
    with open(read_path, encoding="utf-8") as f:
        rows = json.load(f)
```

- [ ] **Step 2: Update the GitHub Actions workflow**

Edit `.github/workflows/scrape.yml`:
```yaml
name: Refresh data

on:
  schedule:
    - cron: '0 3 1 * *'
  push:
    paths:
      - 'scraper/**'
  workflow_dispatch:

concurrency:
  group: refresh-data
  cancel-in-progress: true

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

      - name: Install dependencies
        run: pip install -r requirements.txt

      - name: Run scraper (writes to data/raw/)
        run: python -m scraper.run

      - name: Normalize data (data/raw/ → data/)
        env:
          GROQ_API_KEY: ${{ secrets.GROQ_API_KEY }}
        run: python scripts/normalize_data.py --groq

      - name: Compute insights (data/ → data/insights.json)
        env:
          GROQ_API_KEY: ${{ secrets.GROQ_API_KEY }}
        run: python scripts/compute_insights.py --groq

      - name: Commit updated data
        run: |
          git config user.name "madr-bot"
          git config user.email "bot@ta9in-oss.dz"
          git add data/ scraper/country_cache.json
          git diff --staged --quiet || (git commit -m "🗃️ data: monthly refresh $(date +%Y-%m)" && git pull --rebase && git push)
```

- [ ] **Step 3: Run normalize + insights locally to verify the pipeline end-to-end**

```bash
python scripts/normalize_data.py && python scripts/compute_insights.py
```
Expected: both complete without error; `data/insights.json` is updated.

- [ ] **Step 4: Run full test suite**

```bash
python -m pytest tests/ -v
```
Expected: all pass

- [ ] **Step 5: Commit**

```bash
git add scripts/normalize_data.py .github/workflows/scrape.yml
git commit -m "feat(pipeline): raw→normalized split; add compute-insights to workflow"
```

---

### Task 7: Copy existing data/\*.json to data/raw/ as the initial raw snapshot

Since the site is down and we can't re-scrape, copy the current `data/*.json` files to `data/raw/` as a baseline.

- [ ] **Step 1: Copy files**

```bash
mkdir -p data/raw
cp data/agrochemicals.json data/raw/
cp data/plant-products.json data/raw/
cp data/seeds.json data/raw/
cp data/seedlings.json data/raw/
cp data/potato-seeds.json data/raw/
cp data/vet-authorizations.json data/raw/
cp data/vet-distributors.json data/raw/
cp data/vet-medicine-importers.json data/raw/
```

NOTE: The raw files are a copy of the already-normalized data (not truly raw). Once the site comes back up and the scraper runs, `data/raw/` will be overwritten with actual raw output.

- [ ] **Step 2: Run full pipeline**

```bash
python scripts/normalize_data.py --groq && python scripts/compute_insights.py --groq
```

- [ ] **Step 3: Build check**

```bash
npm run build 2>&1 | tail -5
```
Expected: `[build] Complete!` with no errors.

- [ ] **Step 4: Commit**

```bash
git add data/raw/ data/ data/insights.json
git commit -m "feat(data): add data/raw/ initial snapshot + run full pipeline with Groq insights"
```
