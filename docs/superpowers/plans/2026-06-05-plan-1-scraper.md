# Scraper Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Python scraper that extracts all eight datasets from madr.gov.dz/transparency and writes typed JSON to `data/`, ready to be consumed by the Astro site.

**Architecture:** A single HTTP GET fetches the full page. BeautifulSoup parses it. Eight extractor classes (one per dataset, all inheriting `BaseExtractor`) pull their table rows. A `JsonWriter` serialises each list to `data/{name}.json`. The orchestrator in `run.py` wires them together. All data models are Python dataclasses — typed, serialisable, and mirrored in the site's `src/lib/types.ts`.

**Tech Stack:** Python 3.12 · requests · beautifulsoup4 · lxml · pytest · responses (HTTP mocking)

---

## File Map

```
scraper/
├── __init__.py
├── config.py                        # BASE_URL, paths, delays, retries
├── run.py                           # Orchestrator — entry point for GitHub Action
├── models/
│   ├── __init__.py
│   ├── plant_product.py
│   ├── seedling.py
│   ├── agrochemical.py
│   ├── seed.py
│   ├── potato_seed.py
│   ├── vet_authorization.py
│   ├── vet_distributor.py
│   └── vet_medicine_importer.py
├── extractors/
│   ├── __init__.py
│   ├── base.py                      # BaseExtractor ABC + shared HTML helpers
│   ├── plant_products.py
│   ├── seedlings.py
│   ├── agrochemicals.py
│   ├── seeds.py
│   ├── potato_seeds.py
│   ├── vet_authorizations.py
│   ├── vet_distributors.py
│   └── vet_medicine_importers.py
└── writers/
    ├── __init__.py
    └── json_writer.py

tests/
├── conftest.py
└── scraper/
    ├── fixtures/                    # Saved HTML snippets for offline tests
    │   ├── plant_products_table.html
    │   ├── agrochemicals_table.html
    │   └── vet_distributors_table.html
    ├── test_models.py
    ├── test_base_extractor.py
    ├── test_extractors.py
    └── test_json_writer.py

data/                                # Written by scraper, read by site
requirements.txt
```

---

## Task 1: Scaffold the scraper package

**Files:**
- Create: `scraper/__init__.py`
- Create: `scraper/config.py`
- Create: `scraper/models/__init__.py`
- Create: `scraper/extractors/__init__.py`
- Create: `scraper/writers/__init__.py`
- Create: `requirements.txt`
- Create: `tests/__init__.py`
- Create: `tests/scraper/__init__.py`
- Create: `tests/conftest.py`

- [ ] **Step 1: Create directory structure**

```bash
mkdir -p scraper/models scraper/extractors scraper/writers
mkdir -p tests/scraper/fixtures data
touch scraper/__init__.py scraper/models/__init__.py
touch scraper/extractors/__init__.py scraper/writers/__init__.py
touch tests/__init__.py tests/scraper/__init__.py
```

- [ ] **Step 2: Write `scraper/config.py`**

```python
from pathlib import Path

BASE_URL = "https://madr.gov.dz/transparency"
DATA_DIR = Path(__file__).parent.parent / "data"
REQUEST_DELAY_SECONDS = 1.5
REQUEST_TIMEOUT_SECONDS = 30
MAX_RETRIES = 3

USER_AGENT = (
    "madr-transparency-scraper/1.0 "
    "(+https://github.com/ta9in-oss/madr_transparency)"
)
```

- [ ] **Step 3: Write `requirements.txt`**

```
requests==2.31.0
beautifulsoup4==4.12.3
lxml==5.1.0
pytest==8.1.0
responses==0.25.0
```

- [ ] **Step 4: Write `tests/conftest.py`**

```python
from pathlib import Path

FIXTURES_DIR = Path(__file__).parent / "scraper" / "fixtures"
```

- [ ] **Step 5: Install dependencies**

```bash
pip install -r requirements.txt
```

Expected: all packages install without error.

- [ ] **Step 6: Commit**

```bash
git add scraper/ tests/ requirements.txt data/.gitkeep
git commit -m "🔧 scaffold scraper package structure"
```

---

## Task 2: Discover the page structure

The MADR transparency page uses WordPress + DataTables. Before writing extractors we need to know whether the data is in the initial HTML (client-side DataTables) or loaded via AJAX (server-side DataTables). This task is a manual investigation that informs all extractor code.

**Files:**
- Create: `tests/scraper/fixtures/plant_products_table.html`
- Create: `tests/scraper/fixtures/agrochemicals_table.html`
- Create: `tests/scraper/fixtures/vet_distributors_table.html`

- [ ] **Step 1: Fetch the page and inspect the table markup**

```bash
python3 - <<'EOF'
import requests
from scraper.config import BASE_URL, USER_AGENT

resp = requests.get(BASE_URL, headers={"User-Agent": USER_AGENT}, timeout=30)
print("Status:", resp.status_code)
print("Content-Length:", len(resp.text))

# Look for table tags
tables = resp.text.count("<table")
print("Table tags found:", tables)

# Check if DataTables is server-side (ajax: true) or client-side
if "serverSide" in resp.text or '"serverSide":true' in resp.text:
    print("MODE: server-side DataTables (AJAX pagination needed)")
else:
    print("MODE: client-side DataTables (all rows in HTML)")

# Check how many <tr> rows exist
rows = resp.text.count("<tr")
print("Row tags found:", rows)
EOF
```

Expected: "MODE: client-side DataTables" and row count > 9000.
If server-side, skip to Step 3 (AJAX fallback path).

- [ ] **Step 2 (client-side path): Identify tab panel selectors**

```bash
python3 - <<'EOF'
import requests
from bs4 import BeautifulSoup
from scraper.config import BASE_URL, USER_AGENT

resp = requests.get(BASE_URL, headers={"User-Agent": USER_AGENT}, timeout=30)
soup = BeautifulSoup(resp.text, "lxml")

# Find all tables and count their rows
for i, table in enumerate(soup.find_all("table")):
    rows = table.find_all("tr")
    headers = [th.get_text(strip=True) for th in rows[0].find_all(["th", "td"])] if rows else []
    print(f"Table {i}: {len(rows)-1} data rows | id={table.get('id')} | headers: {headers[:4]}")
EOF
```

Expected output (one line per table — 8 tables total):
```
Table 0: 673 data rows  | id=table_plant_products | headers: ['اسم الشركة...', ...]
Table 1: 384 data rows  | id=table_seedlings       | headers: ['اسم الشركة...', ...]
Table 2: 5058 data rows | id=table_agrochemicals   | headers: ['اسم الشركة...', ...]
...
```

**Record the exact table IDs and column order.** These go into each extractor's `TABLE_ID` and `COLUMNS` constants.

- [ ] **Step 3 (AJAX fallback — only if Step 1 showed server-side): Find the AJAX endpoint**

```bash
python3 - <<'EOF'
import requests, re
from scraper.config import BASE_URL, USER_AGENT

resp = requests.get(BASE_URL, headers={"User-Agent": USER_AGENT}, timeout=30)
# DataTables AJAX URL is often in the initialisation script
matches = re.findall(r'"ajax"\s*:\s*"([^"]+)"', resp.text)
print("AJAX endpoints found:", matches)
EOF
```

If an endpoint is found, the `BaseExtractor` will need a `_fetch_paginated(url, start, length)` method. Add this before writing any extractor. If no endpoint is found and the row count in Step 2 is correct, client-side parsing is confirmed and no AJAX handling is needed.

- [ ] **Step 4: Save HTML fixtures for three representative tables**

```python
# Run this once to save offline fixtures for tests
import requests
from bs4 import BeautifulSoup
from scraper.config import BASE_URL, USER_AGENT
from pathlib import Path

resp = requests.get(BASE_URL, headers={"User-Agent": USER_AGENT}, timeout=30)
soup = BeautifulSoup(resp.text, "lxml")
tables = soup.find_all("table")

fixtures = Path("tests/scraper/fixtures")
# Save first 25 rows of table 0 (plant products), 2 (agrochemicals), 6 (vet distributors)
for idx, name in [(0, "plant_products"), (2, "agrochemicals"), (6, "vet_distributors")]:
    rows = tables[idx].find_all("tr")[:26]  # header + 25 rows
    snippet = str(tables[idx]).replace(
        "<tbody>" + "".join(str(r) for r in tables[idx].find_all("tr")[26:]),
        "<tbody>"
    )
    (fixtures / f"{name}_table.html").write_text(snippet, encoding="utf-8")
    print(f"Saved {name}_table.html ({len(rows)-1} rows)")
```

- [ ] **Step 5: Commit fixtures and discovery notes**

```bash
git add tests/scraper/fixtures/
git commit -m "🔍 save HTML fixtures and document table structure"
```

---

## Task 3: Data models

Eight typed dataclasses, one per dataset. No logic — just data shape.

**Files:**
- Create: all files under `scraper/models/`
- Test: `tests/scraper/test_models.py`

- [ ] **Step 1: Write the failing test**

```python
# tests/scraper/test_models.py
import pytest
from scraper.models.plant_product import PlantProduct
from scraper.models.seedling import Seedling
from scraper.models.agrochemical import Agrochemical
from scraper.models.seed import Seed
from scraper.models.potato_seed import PotatoSeed
from scraper.models.vet_authorization import VetAuthorization
from scraper.models.vet_distributor import VetDistributor
from scraper.models.vet_medicine_importer import VetMedicineImporter


def test_plant_product_fields():
    p = PlantProduct(
        company="AB ALIMENTATION",
        company_name_ar="",
        known_name="BANANE FRAICHE",
        variety="CAVENDICH",
        country_of_origin="COLOMBIE",
        production_zone="GUAYAS-LOS RIOS",
        category="FRUITS (BANANE)",
    )
    assert p.company == "AB ALIMENTATION"
    assert p.company_name_ar == ""
    assert p.category == "FRUITS (BANANE)"


def test_agrochemical_fields():
    a = Agrochemical(
        company="DEBBANE POUR L'AGRICULTURE ALGERIE",
        company_name_ar="",
        product_name="ALUFOS 80%",
        active_substance="Fosétyl-aluminium WP 80%",
        category="Fongicide",
        country_of_origin="CN",
    )
    assert a.category == "Fongicide"
    assert a.country_of_origin == "CN"


def test_vet_distributor_fields():
    d = VetDistributor(
        number=1,
        company="SARL eagle veto pharm",
        company_name_ar="",
        address="Lotissement nezzar rachid merouana batna",
        wilaya="BATNA",
    )
    assert d.number == 1
    assert d.wilaya == "BATNA"


def test_models_are_dataclasses():
    import dataclasses
    for cls in [
        PlantProduct, Seedling, Agrochemical, Seed, PotatoSeed,
        VetAuthorization, VetDistributor, VetMedicineImporter,
    ]:
        assert dataclasses.is_dataclass(cls), f"{cls.__name__} must be a dataclass"
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pytest tests/scraper/test_models.py -v
```

Expected: `ModuleNotFoundError` — models don't exist yet.

- [ ] **Step 3: Write `scraper/models/plant_product.py`**

```python
from dataclasses import dataclass


@dataclass
class PlantProduct:
    company: str
    company_name_ar: str
    known_name: str
    variety: str
    country_of_origin: str
    production_zone: str
    category: str
```

- [ ] **Step 4: Write `scraper/models/seedling.py`**

```python
from dataclasses import dataclass


@dataclass
class Seedling:
    company: str
    company_name_ar: str
    planting_zone: str
    known_name: str
    variety: str
    material_type: str
    country_of_origin: str
    production_zone: str
```

- [ ] **Step 5: Write `scraper/models/agrochemical.py`**

```python
from dataclasses import dataclass


@dataclass
class Agrochemical:
    company: str
    company_name_ar: str
    product_name: str
    active_substance: str
    category: str
    country_of_origin: str
```

- [ ] **Step 6: Write `scraper/models/seed.py`**

```python
from dataclasses import dataclass


@dataclass
class Seed:
    company: str
    company_name_ar: str
    known_name: str
    variety: str
    material_type: str
    country_of_origin: str
    production_zone: str
```

- [ ] **Step 7: Write `scraper/models/potato_seed.py`**

```python
from dataclasses import dataclass


@dataclass
class PotatoSeed:
    company: str
    company_name_ar: str
    known_name: str
    variety: str
    material_type: str
    country_of_origin: str
    production_zone: str
    category: str
```

- [ ] **Step 8: Write `scraper/models/vet_authorization.py`**

```python
from dataclasses import dataclass


@dataclass
class VetAuthorization:
    authorization_number: int
    company: str
    company_name_ar: str
    product_type: str
    agreement_number: str
```

- [ ] **Step 9: Write `scraper/models/vet_distributor.py`**

```python
from dataclasses import dataclass


@dataclass
class VetDistributor:
    number: int
    company: str
    company_name_ar: str
    address: str
    wilaya: str
```

- [ ] **Step 10: Write `scraper/models/vet_medicine_importer.py`**

```python
from dataclasses import dataclass


@dataclass
class VetMedicineImporter:
    number: int
    company: str
    company_name_ar: str
    location: str
```

- [ ] **Step 11: Run tests to verify they pass**

```bash
pytest tests/scraper/test_models.py -v
```

Expected: 4 tests PASS.

- [ ] **Step 12: Commit**

```bash
git add scraper/models/ tests/scraper/test_models.py
git commit -m "✨ add typed data models for all eight datasets"
```

---

## Task 4: BaseExtractor

Handles HTML parsing, row iteration, and `str` cleaning shared by all extractors.

**Files:**
- Create: `scraper/extractors/base.py`
- Test: `tests/scraper/test_base_extractor.py`

- [ ] **Step 1: Write the failing test**

```python
# tests/scraper/test_base_extractor.py
import pytest
from pathlib import Path
from bs4 import BeautifulSoup
from scraper.extractors.base import BaseExtractor

FIXTURES = Path(__file__).parent / "fixtures"

HTML_WITH_TABLE = """
<table id="test-table">
  <thead><tr><th>Col A</th><th>Col B</th></tr></thead>
  <tbody>
    <tr><td>  hello  </td><td>world</td></tr>
    <tr><td>foo</td><td>  bar  </td></tr>
  </tbody>
</table>
"""


class ConcreteExtractor(BaseExtractor):
    TABLE_ID = "test-table"

    def _parse_row(self, cells: list[str]):
        return {"a": cells[0], "b": cells[1]}


def test_get_rows_returns_all_body_rows():
    soup = BeautifulSoup(HTML_WITH_TABLE, "lxml")
    extractor = ConcreteExtractor()
    rows = extractor._get_rows(soup)
    assert len(rows) == 2


def test_cells_are_stripped():
    soup = BeautifulSoup(HTML_WITH_TABLE, "lxml")
    extractor = ConcreteExtractor()
    rows = extractor._get_rows(soup)
    assert rows[0] == ["hello", "world"]
    assert rows[1] == ["foo", "bar"]


def test_extract_calls_parse_row_for_each_row():
    soup = BeautifulSoup(HTML_WITH_TABLE, "lxml")
    extractor = ConcreteExtractor()
    results = extractor.extract(soup)
    assert results == [{"a": "hello", "b": "world"}, {"a": "foo", "b": "bar"}]


def test_empty_table_returns_empty_list():
    html = '<table id="test-table"><thead><tr><th>A</th></tr></thead><tbody></tbody></table>'
    soup = BeautifulSoup(html, "lxml")
    extractor = ConcreteExtractor()
    assert extractor.extract(soup) == []
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pytest tests/scraper/test_base_extractor.py -v
```

Expected: `ModuleNotFoundError` or `ImportError`.

- [ ] **Step 3: Write `scraper/extractors/base.py`**

```python
from abc import ABC, abstractmethod
from typing import TypeVar, Generic
from bs4 import BeautifulSoup

T = TypeVar("T")


class BaseExtractor(ABC, Generic[T]):
    TABLE_ID: str  # subclasses set this to the HTML table's id attribute

    def extract(self, soup: BeautifulSoup) -> list[T]:
        rows = self._get_rows(soup)
        return [self._parse_row(cells) for cells in rows]

    def _get_rows(self, soup: BeautifulSoup) -> list[list[str]]:
        table = soup.find("table", {"id": self.TABLE_ID})
        if table is None:
            return []
        tbody = table.find("tbody")
        if tbody is None:
            return []
        result = []
        for tr in tbody.find_all("tr"):
            cells = [td.get_text(separator=" ", strip=True) for td in tr.find_all("td")]
            if any(cells):  # skip empty rows
                result.append(cells)
        return result

    @abstractmethod
    def _parse_row(self, cells: list[str]) -> T:
        ...
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
pytest tests/scraper/test_base_extractor.py -v
```

Expected: 4 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add scraper/extractors/base.py tests/scraper/test_base_extractor.py
git commit -m "✨ add BaseExtractor with HTML row parsing"
```

---

## Task 5: PlantProductsExtractor (reference implementation)

This is the pattern all other extractors follow. Read this task before writing the remaining seven.

**Note:** Replace `TABLE_ID = "..."` with the actual `id` attribute found in Task 2, Step 2. The column indices below assume the order observed during discovery: `[company, known_name, variety, country_of_origin, production_zone, category]`. Adjust if the order differs.

**Files:**
- Create: `scraper/extractors/plant_products.py`
- Test: `tests/scraper/test_extractors.py`

- [ ] **Step 1: Write the failing test**

```python
# tests/scraper/test_extractors.py
from pathlib import Path
from bs4 import BeautifulSoup
from scraper.extractors.plant_products import PlantProductsExtractor
from scraper.models.plant_product import PlantProduct

FIXTURES = Path(__file__).parent / "fixtures"


def _load_fixture(name: str) -> BeautifulSoup:
    html = (FIXTURES / name).read_text(encoding="utf-8")
    # Wrap the table snippet in a minimal page so lxml parses it cleanly
    return BeautifulSoup(f"<html><body>{html}</body></html>", "lxml")


def test_plant_products_returns_list_of_plant_product():
    soup = _load_fixture("plant_products_table.html")
    records = PlantProductsExtractor().extract(soup)
    assert len(records) > 0
    assert all(isinstance(r, PlantProduct) for r in records)


def test_plant_products_first_record():
    soup = _load_fixture("plant_products_table.html")
    records = PlantProductsExtractor().extract(soup)
    first = records[0]
    assert first.company == "AB ALIMENTATION"
    assert "BANANE" in first.known_name.upper()
    assert first.company_name_ar == ""
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pytest tests/scraper/test_extractors.py::test_plant_products_returns_list_of_plant_product -v
```

Expected: `ModuleNotFoundError`.

- [ ] **Step 3: Write `scraper/extractors/plant_products.py`**

```python
from scraper.extractors.base import BaseExtractor
from scraper.models.plant_product import PlantProduct


class PlantProductsExtractor(BaseExtractor[PlantProduct]):
    # Replace with actual table id found during Task 2 discovery
    TABLE_ID = "table_plant_products"

    def _parse_row(self, cells: list[str]) -> PlantProduct:
        return PlantProduct(
            company=cells[0],
            company_name_ar="",
            known_name=cells[1],
            variety=cells[2],
            country_of_origin=cells[3],
            production_zone=cells[4],
            category=cells[5] if len(cells) > 5 else "",
        )
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
pytest tests/scraper/test_extractors.py -v
```

Expected: 2 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add scraper/extractors/plant_products.py tests/scraper/test_extractors.py
git commit -m "✨ add PlantProductsExtractor"
```

---

## Task 6: Remaining seven extractors

Follow the exact same pattern as Task 5. Add one test per extractor to `tests/scraper/test_extractors.py` before writing the extractor. Column indices come from Task 2 discovery output.

**Files:** one `.py` file per extractor in `scraper/extractors/`

- [ ] **Step 1: Write `scraper/extractors/seedlings.py`**

```python
from scraper.extractors.base import BaseExtractor
from scraper.models.seedling import Seedling


class SeedlingsExtractor(BaseExtractor[Seedling]):
    TABLE_ID = "table_seedlings"  # replace with actual id from Task 2

    def _parse_row(self, cells: list[str]) -> Seedling:
        return Seedling(
            company=cells[0],
            company_name_ar="",
            planting_zone=cells[1],
            known_name=cells[2],
            variety=cells[3],
            material_type=cells[4],
            country_of_origin=cells[5],
            production_zone=cells[6] if len(cells) > 6 else "",
        )
```

- [ ] **Step 2: Write `scraper/extractors/agrochemicals.py`**

```python
from scraper.extractors.base import BaseExtractor
from scraper.models.agrochemical import Agrochemical


class AgrochemicalsExtractor(BaseExtractor[Agrochemical]):
    TABLE_ID = "table_agrochemicals"  # replace with actual id from Task 2

    def _parse_row(self, cells: list[str]) -> Agrochemical:
        return Agrochemical(
            company=cells[0],
            company_name_ar="",
            product_name=cells[1],
            active_substance=cells[2],
            category=cells[3],
            country_of_origin=cells[4] if len(cells) > 4 else "",
        )
```

- [ ] **Step 3: Write `scraper/extractors/seeds.py`**

```python
from scraper.extractors.base import BaseExtractor
from scraper.models.seed import Seed


class SeedsExtractor(BaseExtractor[Seed]):
    TABLE_ID = "table_seeds"  # replace with actual id from Task 2

    def _parse_row(self, cells: list[str]) -> Seed:
        return Seed(
            company=cells[0],
            company_name_ar="",
            known_name=cells[1],
            variety=cells[2],
            material_type=cells[3],
            country_of_origin=cells[4],
            production_zone=cells[5] if len(cells) > 5 else "",
        )
```

- [ ] **Step 4: Write `scraper/extractors/potato_seeds.py`**

```python
from scraper.extractors.base import BaseExtractor
from scraper.models.potato_seed import PotatoSeed


class PotatoSeedsExtractor(BaseExtractor[PotatoSeed]):
    TABLE_ID = "table_potato_seeds"  # replace with actual id from Task 2

    def _parse_row(self, cells: list[str]) -> PotatoSeed:
        return PotatoSeed(
            company=cells[0],
            company_name_ar="",
            known_name=cells[1],
            variety=cells[2],
            material_type=cells[3],
            country_of_origin=cells[4],
            production_zone=cells[5] if len(cells) > 5 else "",
            category=cells[6] if len(cells) > 6 else "",
        )
```

- [ ] **Step 5: Write `scraper/extractors/vet_authorizations.py`**

```python
from scraper.extractors.base import BaseExtractor
from scraper.models.vet_authorization import VetAuthorization


class VetAuthorizationsExtractor(BaseExtractor[VetAuthorization]):
    TABLE_ID = "table_vet_authorizations"  # replace with actual id from Task 2

    def _parse_row(self, cells: list[str]) -> VetAuthorization:
        return VetAuthorization(
            authorization_number=int(cells[0]) if cells[0].isdigit() else 0,
            company=cells[1],
            company_name_ar="",
            product_type=cells[2],
            agreement_number=cells[3] if len(cells) > 3 else "",
        )
```

- [ ] **Step 6: Write `scraper/extractors/vet_distributors.py`**

```python
from scraper.extractors.base import BaseExtractor
from scraper.models.vet_distributor import VetDistributor


class VetDistributorsExtractor(BaseExtractor[VetDistributor]):
    TABLE_ID = "table_vet_distributors"  # replace with actual id from Task 2

    def _parse_row(self, cells: list[str]) -> VetDistributor:
        return VetDistributor(
            number=int(cells[0]) if cells[0].isdigit() else 0,
            company=cells[1],
            company_name_ar="",
            address=cells[2],
            wilaya=cells[3] if len(cells) > 3 else "",
        )
```

- [ ] **Step 7: Write `scraper/extractors/vet_medicine_importers.py`**

```python
from scraper.extractors.base import BaseExtractor
from scraper.models.vet_medicine_importer import VetMedicineImporter


class VetMedicineImportersExtractor(BaseExtractor[VetMedicineImporter]):
    TABLE_ID = "table_vet_medicine_importers"  # replace with actual id from Task 2

    def _parse_row(self, cells: list[str]) -> VetMedicineImporter:
        return VetMedicineImporter(
            number=int(cells[0]) if cells[0].isdigit() else 0,
            company=cells[1],
            company_name_ar="",
            location=cells[2] if len(cells) > 2 else "",
        )
```

- [ ] **Step 8: Add tests for agrochemicals and vet distributors**

Append to `tests/scraper/test_extractors.py`:

```python
from scraper.extractors.agrochemicals import AgrochemicalsExtractor
from scraper.models.agrochemical import Agrochemical
from scraper.extractors.vet_distributors import VetDistributorsExtractor
from scraper.models.vet_distributor import VetDistributor


def test_agrochemicals_returns_list_of_agrochemical():
    soup = _load_fixture("agrochemicals_table.html")
    records = AgrochemicalsExtractor().extract(soup)
    assert len(records) > 0
    assert all(isinstance(r, Agrochemical) for r in records)


def test_vet_distributors_returns_list_of_vet_distributor():
    soup = _load_fixture("vet_distributors_table.html")
    records = VetDistributorsExtractor().extract(soup)
    assert len(records) > 0
    assert all(isinstance(r, VetDistributor) for r in records)
    assert all(isinstance(r.number, int) for r in records)
```

- [ ] **Step 9: Run all extractor tests**

```bash
pytest tests/scraper/test_extractors.py -v
```

Expected: all tests PASS.

- [ ] **Step 10: Commit**

```bash
git add scraper/extractors/ tests/scraper/test_extractors.py
git commit -m "✨ add extractors for all eight datasets"
```

---

## Task 7: JsonWriter

Serialises a list of dataclasses to a JSON file in `data/`. Sorted keys for clean diffs.

**Files:**
- Create: `scraper/writers/json_writer.py`
- Test: `tests/scraper/test_json_writer.py`

- [ ] **Step 1: Write the failing test**

```python
# tests/scraper/test_json_writer.py
import json
import tempfile
from pathlib import Path
from dataclasses import dataclass
from scraper.writers.json_writer import JsonWriter


@dataclass
class _SampleModel:
    name: str
    count: int


def test_writes_json_file(tmp_path):
    writer = JsonWriter(output_dir=tmp_path)
    records = [_SampleModel(name="alpha", count=1), _SampleModel(name="beta", count=2)]
    writer.write(records, "sample")

    output = tmp_path / "sample.json"
    assert output.exists()
    data = json.loads(output.read_text(encoding="utf-8"))
    assert len(data) == 2
    assert data[0] == {"name": "alpha", "count": 1}


def test_keys_are_sorted(tmp_path):
    writer = JsonWriter(output_dir=tmp_path)
    writer.write([_SampleModel(name="z", count=99)], "sorted")
    raw = (tmp_path / "sorted.json").read_text(encoding="utf-8")
    # "count" must come before "name" alphabetically
    assert raw.index('"count"') < raw.index('"name"')


def test_empty_list_writes_empty_array(tmp_path):
    writer = JsonWriter(output_dir=tmp_path)
    writer.write([], "empty")
    data = json.loads((tmp_path / "empty.json").read_text(encoding="utf-8"))
    assert data == []


def test_utf8_content_is_preserved(tmp_path):
    writer = JsonWriter(output_dir=tmp_path)

    @dataclass
    class _Arabic:
        text: str

    writer.write([_Arabic(text="استيراد البذور")], "arabic")
    raw = (tmp_path / "arabic.json").read_text(encoding="utf-8")
    assert "استيراد البذور" in raw
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pytest tests/scraper/test_json_writer.py -v
```

Expected: `ModuleNotFoundError`.

- [ ] **Step 3: Write `scraper/writers/json_writer.py`**

```python
import json
import dataclasses
from pathlib import Path
from scraper.config import DATA_DIR


class JsonWriter:
    def __init__(self, output_dir: Path = DATA_DIR):
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

- [ ] **Step 4: Run tests to verify they pass**

```bash
pytest tests/scraper/test_json_writer.py -v
```

Expected: 4 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add scraper/writers/json_writer.py tests/scraper/test_json_writer.py
git commit -m "✨ add JsonWriter — serialises dataclasses to data/ as UTF-8 JSON"
```

---

## Task 8: Orchestrator and first real data run

**Files:**
- Create: `scraper/run.py`

- [ ] **Step 1: Write `scraper/run.py`**

```python
import time
import logging
import requests
from bs4 import BeautifulSoup

from scraper.config import (
    BASE_URL, USER_AGENT, REQUEST_DELAY_SECONDS, REQUEST_TIMEOUT_SECONDS
)
from scraper.extractors.plant_products import PlantProductsExtractor
from scraper.extractors.seedlings import SeedlingsExtractor
from scraper.extractors.agrochemicals import AgrochemicalsExtractor
from scraper.extractors.seeds import SeedsExtractor
from scraper.extractors.potato_seeds import PotatoSeedsExtractor
from scraper.extractors.vet_authorizations import VetAuthorizationsExtractor
from scraper.extractors.vet_distributors import VetDistributorsExtractor
from scraper.extractors.vet_medicine_importers import VetMedicineImportersExtractor
from scraper.writers.json_writer import JsonWriter

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
log = logging.getLogger(__name__)

EXTRACTORS = [
    (PlantProductsExtractor(),      "plant-products"),
    (SeedlingsExtractor(),          "seedlings"),
    (AgrochemicalsExtractor(),      "agrochemicals"),
    (SeedsExtractor(),              "seeds"),
    (PotatoSeedsExtractor(),        "potato-seeds"),
    (VetAuthorizationsExtractor(),  "vet-authorizations"),
    (VetDistributorsExtractor(),    "vet-distributors"),
    (VetMedicineImportersExtractor(), "vet-medicine-importers"),
]


def run():
    session = requests.Session()
    session.headers.update({"User-Agent": USER_AGENT})

    log.info("Fetching %s", BASE_URL)
    response = session.get(BASE_URL, timeout=REQUEST_TIMEOUT_SECONDS)
    response.raise_for_status()

    soup = BeautifulSoup(response.text, "lxml")
    writer = JsonWriter()

    for extractor, filename in EXTRACTORS:
        log.info("Extracting %s", filename)
        records = extractor.extract(soup)
        output = writer.write(records, filename)
        log.info("  wrote %d records → %s", len(records), output)
        time.sleep(REQUEST_DELAY_SECONDS)

    log.info("Done.")


if __name__ == "__main__":
    run()
```

- [ ] **Step 2: Run the scraper for the first time**

```bash
python scraper/run.py
```

Expected output:
```
2026-06-05 ... INFO Fetching https://madr.gov.dz/transparency
2026-06-05 ... INFO Extracting plant-products
2026-06-05 ... INFO   wrote 673 records → data/plant-products.json
2026-06-05 ... INFO Extracting seedlings
2026-06-05 ... INFO   wrote 384 records → data/seedlings.json
2026-06-05 ... INFO Extracting agrochemicals
2026-06-05 ... INFO   wrote 5058 records → data/agrochemicals.json
...
2026-06-05 ... INFO Done.
```

If a dataset shows 0 records, go back to the extractor and check the TABLE_ID against the actual HTML (Task 2, Step 2).

- [ ] **Step 3: Spot-check the output**

```bash
python3 - <<'EOF'
import json
from pathlib import Path

for f in sorted(Path("data").glob("*.json")):
    data = json.loads(f.read_text(encoding="utf-8"))
    print(f"{f.name:<40} {len(data):>6} records")
    if data:
        print("  first:", list(data[0].items())[:3])
EOF
```

Expected: 8 files, record counts matching what we observed on the website (673, 384, 5058, 2866, 35, 161, 249, 106).

- [ ] **Step 4: Run full test suite**

```bash
pytest tests/ -v
```

Expected: all tests PASS.

- [ ] **Step 5: Commit scraper and initial data**

```bash
git add scraper/run.py data/
git commit -m "🗃️ add orchestrator and commit first full data extract"
```

---

## Task 9: GitHub Actions workflow

**Files:**
- Create: `.github/workflows/scrape.yml`

- [ ] **Step 1: Write `.github/workflows/scrape.yml`**

```yaml
name: Refresh data

on:
  schedule:
    - cron: '0 3 1 * *'       # 3 am UTC on the 1st of every month
  push:
    paths:
      - 'scraper/**'           # Re-runs when scraper code changes
  workflow_dispatch:           # Manual trigger for maintainers

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

      - name: Run scraper
        run: python scraper/run.py

      - name: Commit updated data
        run: |
          git config user.name "madr-bot"
          git config user.email "bot@ta9in-oss.dz"
          git add data/
          git diff --staged --quiet || git commit -m "🗃️ data: monthly refresh $(date +%Y-%m)"
          git push
```

- [ ] **Step 2: Commit and push**

```bash
git add .github/workflows/scrape.yml
git commit -m "🤖 add monthly data refresh GitHub Action"
git push
```

- [ ] **Step 3: Verify the workflow appears in GitHub**

Open `https://github.com/ta9in-oss/madr_transparency/actions`. The workflow "Refresh data" should appear. Run it manually via "Run workflow" to confirm it works end-to-end in CI.

Expected: green check, `data/` files updated with a bot commit.

---

## Completion Check

After all tasks are done, run:

```bash
pytest tests/ -v --tb=short
```

Expected: all tests PASS, no warnings.

```bash
python3 - <<'EOF'
import json
from pathlib import Path

expected = {
    "plant-products": 673,
    "seedlings": 384,
    "agrochemicals": 5058,
    "seeds": 2866,
    "potato-seeds": 35,
    "vet-authorizations": 161,
    "vet-distributors": 249,
    "vet-medicine-importers": 106,
}

for name, count in expected.items():
    data = json.loads((Path("data") / f"{name}.json").read_text(encoding="utf-8"))
    status = "OK" if len(data) >= count * 0.95 else "FAIL"
    print(f"{status} {name}: {len(data)} records (expected ~{count})")
EOF
```

All files should show OK. A 5% tolerance allows for minor changes in the live data.

The `data/` directory is now the stable boundary the Astro site (Plan 2) will build against.
