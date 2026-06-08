"""
Compute pre-aggregated insights from normalized data files.

Usage:
    python scripts/compute_insights.py           # aggregations only
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
    product_type_labels: dict[str, dict] = {}
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
    """Use Groq to generate editorial narrative per chapter. GROQ_API_KEY must be in env."""
    api_key = os.environ.get("GROQ_API_KEY")
    if not api_key:
        print("  GROQ_API_KEY not set — skipping narrative generation")
        return {}

    from groq import Groq
    client = Groq(api_key=api_key)

    CHAPTER_PROMPTS = {
        "dependency": (
            "You are an Algerian data journalist. Based on these agricultural import statistics, "
            "write a 2-sentence editorial insight in EACH of French, Arabic, and English.\n"
            f"Data: {json.dumps(insights['dependency'], ensure_ascii=False)[:1500]}\n"
            "Focus on: banana dominance, China/US/India seed dependency, multi-origin supply risk.\n"
            'Return JSON: {"fr": "...", "ar": "...", "en": "..."}'
        ),
        "chemicals": (
            "You are an Algerian data journalist. Based on these agrochemical import statistics, "
            "write a 2-sentence editorial insight in EACH of French, Arabic, and English.\n"
            f"Data: {json.dumps(insights['chemicals'], ensure_ascii=False)[:1500]}\n"
            "Focus on: Spain as top supplier, China rising, market concentration.\n"
            'Return JSON: {"fr": "...", "ar": "...", "en": "..."}'
        ),
        "players": (
            "You are an Algerian data journalist. Based on these market concentration statistics, "
            "write a 2-sentence editorial insight in EACH of French, Arabic, and English.\n"
            f"Data: {json.dumps(insights['players'], ensure_ascii=False)[:1500]}\n"
            "Focus on: top 10 company share, HHI concentration level.\n"
            'Return JSON: {"fr": "...", "ar": "...", "en": "..."}'
        ),
        "veterinary": (
            "You are an Algerian data journalist. Based on these veterinary sector statistics, "
            "write a 2-sentence editorial insight in EACH of French, Arabic, and English.\n"
            f"Data: {json.dumps(insights['veterinary'], ensure_ascii=False)[:1500]}\n"
            "Focus on: wilayas with zero distributor coverage, southern Algeria gap.\n"
            'Return JSON: {"fr": "...", "ar": "...", "en": "..."}'
        ),
    }

    narratives: dict = {}
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
        encoding="utf-8",
    )
    print(f"\nInsights written to {INSIGHTS_PATH}")
    print(f"  dependency: {insights['dependency']['total_records']} records")
    print(f"  chemicals: {insights['chemicals']['total']} records")
    print(f"  players: {insights['players']['total_permits']} permits, {insights['players']['unique_companies']} companies")
    print(f"  veterinary: {insights['veterinary']['wilayas_covered']}/58 wilayas covered")


if __name__ == "__main__":
    main()
