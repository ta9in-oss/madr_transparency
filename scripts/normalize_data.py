"""
Normalize existing scraped JSON files.

Reads from data/raw/ (immutable scraper output) and writes to data/ (normalized).
Falls back to data/ if raw doesn't exist yet (first-run compatibility).

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
    normalize_seed_material,
    decode_vet_product_type,
    flush_groq_queue,
    _GROQ_QUEUE,
    _CACHE,
)
from scraper.config import DATA_DIR, RAW_DATA_DIR

RAW_DIR = RAW_DATA_DIR  # data/raw/
OUT_DIR = DATA_DIR       # data/


def normalize_file(
    in_path: Path,
    out_path: Path,
    has_country: bool,
    has_category: bool,
    use_chem_cat: bool = False,
    use_plant_cat: bool = False,
    use_material: bool = False,
    use_vet_type: bool = False,
) -> tuple[set[str], set[str]]:
    """Normalize one file. Reads from in_path (raw), writes to out_path (normalized).
    Falls back to out_path if in_path doesn't exist yet (first-run compat).
    Returns (before_countries, after_countries).
    """
    # Fall back to out_path if raw doesn't exist yet (first-run compat)
    read_path = in_path if in_path.exists() else out_path
    with open(read_path, encoding="utf-8") as f:
        rows = json.load(f)

    before_countries: set[str] = set()
    after_countries: set[str] = set()
    before_cats: set[str] = set()
    after_cats: set[str] = set()
    before_mats: set[str] = set()
    after_mats: set[str] = set()

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

        if use_material and "material_type" in row:
            raw_mat = row.get("material_type") or ""
            before_mats.add(raw_mat)
            row["material_type"] = normalize_seed_material(raw_mat)
            after_mats.add(row["material_type"])

        if use_vet_type and "product_type" in row:
            row["product_type_label"] = decode_vet_product_type(row.get("product_type"))

    out_path.parent.mkdir(parents=True, exist_ok=True)
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(rows, f, ensure_ascii=False, indent=2)

    name = out_path.name
    src = "raw" if read_path == in_path else "data (fallback)"
    if has_country:
        xx = sum(1 for r in rows if r.get("country_of_origin") == "XX")
        print(f"  {name} [{src}]: country {len(before_countries)} unique → {len(after_countries)} unique  ({xx} XX remaining)")
    elif not has_country and not has_category and not use_material and not use_vet_type:
        print(f"  {name} [{src}]: passthrough (no normalization)")
    if has_category and (use_chem_cat or use_plant_cat):
        print(f"  {name}: category {len(before_cats)} unique → {len(after_cats)} unique")
    if use_material:
        print(f"  {name}: material {len(before_mats)} unique → {len(after_mats)} unique")

    return before_countries, after_countries


# (in_path, out_path, has_country, has_category, use_chem_cat, use_plant_cat, use_material, use_vet_type)
FILES = [
    (RAW_DIR / "agrochemicals.json",          OUT_DIR / "agrochemicals.json",          True,  True,  True,  False, False, False),
    (RAW_DIR / "plant-products.json",         OUT_DIR / "plant-products.json",         True,  True,  False, True,  False, False),
    (RAW_DIR / "seeds.json",                  OUT_DIR / "seeds.json",                  True,  False, False, False, True,  False),
    (RAW_DIR / "seedlings.json",              OUT_DIR / "seedlings.json",              True,  False, False, False, True,  False),
    (RAW_DIR / "potato-seeds.json",           OUT_DIR / "potato-seeds.json",           True,  False, False, False, False, False),
    (RAW_DIR / "vet-authorizations.json",     OUT_DIR / "vet-authorizations.json",     True,  False, False, False, False, True),
    (RAW_DIR / "vet-distributors.json",       OUT_DIR / "vet-distributors.json",       False, False, False, False, False, False),
    (RAW_DIR / "vet-medicine-importers.json", OUT_DIR / "vet-medicine-importers.json", False, False, False, False, False, False),
]


def run_pass(label: str) -> None:
    print(f"\n{label}")
    for in_path, out_path, hc, hcat, chem, plant, mat, vet in FILES:
        normalize_file(in_path, out_path, hc, hcat, chem, plant, mat, vet)


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
