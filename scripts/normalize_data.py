"""
One-shot normalization of existing scraped JSON files.

Reads each data/*.json file, applies normalize_country() to country_of_origin
and normalize_chem_category() to category where applicable, then writes
the file back in-place with consistent camelCase-free compact JSON.

Run from repo root:
    python scripts/normalize_data.py
"""

import json
import sys
from pathlib import Path

# Add repo root so `scraper` package is importable
sys.path.insert(0, str(Path(__file__).parent.parent))

from scraper.normalize import normalize_country, normalize_chem_category

DATA_DIR = Path(__file__).parent.parent / "data"


def normalize_file(path: Path, has_country: bool, has_category: bool, use_chem_cat: bool = False) -> None:
    with open(path) as f:
        rows = json.load(f)

    before_countries: set[str] = set()
    after_countries: set[str] = set()
    before_cats: set[str] = set()
    after_cats: set[str] = set()

    for row in rows:
        if has_country and "country_of_origin" in row:
            raw = row["country_of_origin"] or ""
            before_countries.add(raw)
            normalized = normalize_country(raw)
            after_countries.add(normalized)
            row["country_of_origin"] = normalized

        if has_category and "category" in row:
            raw = row["category"] or ""
            before_cats.add(raw)
            normalized = normalize_chem_category(raw) if use_chem_cat else raw
            after_cats.add(normalized)
            row["category"] = normalized

    with open(path, "w", encoding="utf-8") as f:
        json.dump(rows, f, ensure_ascii=False, indent=2)

    name = path.name
    if has_country:
        print(f"  {name}: country_of_origin  {len(before_countries)} unique → {len(after_countries)} unique")
    if has_category and use_chem_cat:
        print(f"  {name}: category           {len(before_cats)} unique → {len(after_cats)} unique")


def main() -> None:
    print("Normalizing data files...\n")

    normalize_file(DATA_DIR / "agrochemicals.json", has_country=True, has_category=True, use_chem_cat=True)
    normalize_file(DATA_DIR / "seeds.json",         has_country=True, has_category=False)
    normalize_file(DATA_DIR / "seedlings.json",     has_country=True, has_category=False)
    normalize_file(DATA_DIR / "potato-seeds.json",  has_country=True, has_category=False)
    normalize_file(DATA_DIR / "plant-products.json",has_country=True, has_category=False)

    print("\nDone.")


if __name__ == "__main__":
    main()
