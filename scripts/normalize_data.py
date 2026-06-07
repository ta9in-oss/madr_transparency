"""
Normalize existing scraped JSON files in-place.

Usage:
    python scripts/normalize_data.py           # deterministic only
    python scripts/normalize_data.py --groq    # + Groq AI for unknowns (needs GROQ_API_KEY)

Two-pass when --groq is used:
  1. Run pycountry + cache normalization, collect remaining XX strings
  2. Send all XX to Groq (llama-3.3-70b-versatile) in batches of 60
  3. Update scraper/country_cache.json
  4. Re-run normalization with the updated cache
"""

import argparse
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from scraper.normalize import (
    normalize_chem_category,
    normalize_plant_category,
    normalize_country,
    flush_groq_queue,
    _GROQ_QUEUE,
    _CACHE,
)

DATA_DIR = Path(__file__).parent.parent / "data"


def normalize_file(
    path: Path,
    has_country: bool,
    has_category: bool,
    use_chem_cat: bool = False,
    use_plant_cat: bool = False,
) -> tuple[set[str], set[str]]:
    """Normalize one file in-place. Returns (before_countries, after_countries)."""
    with open(path, encoding="utf-8") as f:
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

        if has_category and use_chem_cat and "category" in row:
            raw = row["category"] or ""
            before_cats.add(raw)
            row["category"] = normalize_chem_category(raw)
            after_cats.add(row["category"])

        if has_category and use_plant_cat and "category" in row:
            raw = row["category"] or ""
            before_cats.add(raw)
            row["category"] = normalize_plant_category(raw)
            after_cats.add(row["category"])

    with open(path, "w", encoding="utf-8") as f:
        json.dump(rows, f, ensure_ascii=False, indent=2)

    name = path.name
    if has_country:
        xx = sum(1 for r in rows if r.get("country_of_origin") == "XX")
        print(f"  {name}: country {len(before_countries)} unique → {len(after_countries)} unique  ({xx} XX remaining)")
    if has_category and (use_chem_cat or use_plant_cat):
        print(f"  {name}: category {len(before_cats)} unique → {len(after_cats)} unique")

    return before_countries, after_countries


# (path, has_country, has_category, use_chem_cat, use_plant_cat)
FILES = [
    (DATA_DIR / "agrochemicals.json",  True,  True,  True,  False),
    (DATA_DIR / "plant-products.json", True,  True,  False, True),
    (DATA_DIR / "seeds.json",          True,  False, False, False),
    (DATA_DIR / "seedlings.json",      True,  False, False, False),
    (DATA_DIR / "potato-seeds.json",   True,  False, False, False),
]


def run_pass(label: str) -> None:
    print(f"\n{label}")
    for path, hc, hcat, chem, plant in FILES:
        normalize_file(path, hc, hcat, chem, plant)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--groq", action="store_true",
        help="Use Groq AI to resolve remaining XX strings (needs GROQ_API_KEY env var)",
    )
    args = parser.parse_args()

    run_pass("Pass 1: pycountry + cache normalization")

    if not args.groq:
        print("\nDone. Run with --groq to resolve remaining XX strings via Groq AI.")
        return

    # Count queued unknowns
    queue_size = len(_GROQ_QUEUE)
    if queue_size == 0:
        print("\nNo unknown strings to classify. Done.")
        return

    print(f"\nPass 2: Groq classification for {queue_size} unknown string(s)...")
    import os
    if not os.environ.get("GROQ_API_KEY"):
        print("  ERROR: GROQ_API_KEY not set. Export it first:")
        print("  export GROQ_API_KEY=<your_key>")
        sys.exit(1)

    resolved = flush_groq_queue()
    print(f"  Resolved {resolved} strings via Groq. Cache saved to scraper/country_cache.json.")

    run_pass("Pass 3: re-normalize with updated cache")
    print("\nDone.")


if __name__ == "__main__":
    main()
