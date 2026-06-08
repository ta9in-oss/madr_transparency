"""
Data normalization applied at scrape time.

Country normalization strategy (in order):
  1. Already a valid ISO alpha-2 code → return as-is
  2. pycountry lookup (alpha-2, alpha-3, English official/common names)
  3. File-based cache from prior Groq classifications
  4. Multi-country split → try each part through steps 1-3
  5. If GROQ_API_KEY is set at import time, unknown strings are queued for
     batch classification; call flush_groq_queue() to resolve them and
     update the cache (used by scripts/normalize_data.py)
  6. 'XX' for anything still unresolved

To regenerate the cache for a fresh dataset:
    GROQ_API_KEY=<key> python scripts/normalize_data.py --groq
"""

from __future__ import annotations

import json
import os
import re
import unicodedata
from pathlib import Path

import pycountry

# ── Cache ──────────────────────────────────────────────────────────────────────

_CACHE_PATH = Path(__file__).parent / "country_cache.json"

def _load_cache() -> dict[str, str]:
    if _CACHE_PATH.exists():
        try:
            return json.loads(_CACHE_PATH.read_text(encoding="utf-8"))
        except (json.JSONDecodeError, OSError):
            return {}
    return {}

def _save_cache(cache: dict[str, str]) -> None:
    _CACHE_PATH.write_text(
        json.dumps(cache, ensure_ascii=False, indent=2, sort_keys=True),
        encoding="utf-8",
    )

_CACHE: dict[str, str] = _load_cache()

# Queue of raw strings that need Groq resolution (filled during a scrape run)
_GROQ_QUEUE: list[str] = []

# ── Helpers ────────────────────────────────────────────────────────────────────

_SPLIT_RE = re.compile(
    r"[\/,;]|\s+[-–]\s+|\s+(?:et|ou|or|and)\s+", re.IGNORECASE
)

_MULTI_COUNTRY_RE = re.compile(
    r"[\/,;]|\s+[-–]\s+|\s+(?:et|ou|or|and)\s+",
    re.IGNORECASE,
)

_ISO2_RE = re.compile(r"^[A-Z]{2}$")
_ISO3_RE = re.compile(r"^[A-Z]{3}$")


def _normalize_key(s: str) -> str:
    """Strip accents, lowercase, collapse whitespace/punctuation for lookups."""
    # Normalize smart apostrophes to straight
    s = re.sub(r"[''ʼʻ′`‘’ʼʻ]", "'", s)
    # NFD decomposition → drop combining marks (strips accents)
    s = "".join(
        c for c in unicodedata.normalize("NFD", s)
        if unicodedata.category(c) != "Mn"
    )
    return re.sub(r"\s+", " ", s.strip().lower())


def _pycountry_lookup(raw: str) -> str | None:
    """Try pycountry with exact alpha-2, alpha-3, and English name lookups.

    For short codes (2–3 chars) we do EXACT matches only — never fuzzy,
    because pycountry.search_fuzzy('XX') incorrectly returns Malta, etc.
    """
    upper = raw.strip().upper()

    # alpha-2: exact only
    if _ISO2_RE.match(upper):
        c = pycountry.countries.get(alpha_2=upper)
        return c.alpha_2 if c else None

    # alpha-3: exact only
    if _ISO3_RE.match(upper):
        c = pycountry.countries.get(alpha_3=upper)
        return c.alpha_2 if c else None

    # English fuzzy — only for strings that look like actual names (≥4 chars)
    if len(raw.strip()) >= 4:
        try:
            results = pycountry.countries.search_fuzzy(raw.strip())
            if results:
                return results[0].alpha_2
        except LookupError:
            pass

    return None


# ── Groq batch classification ──────────────────────────────────────────────────

def flush_groq_queue() -> int:
    """
    Send all queued unknown country strings to Groq, update the cache.
    Returns the number of strings resolved.
    Call this from scripts/normalize_data.py after a scrape pass.
    """
    global _GROQ_QUEUE
    api_key = os.environ.get("GROQ_API_KEY", "")
    if not api_key:
        raise RuntimeError(
            "GROQ_API_KEY env var not set. "
            "Export it before running: export GROQ_API_KEY=<your_key>"
        )
    if not _GROQ_QUEUE:
        return 0

    # Deduplicate while preserving order
    uniq = list(dict.fromkeys(_GROQ_QUEUE))
    _GROQ_QUEUE = []

    resolved = _classify_with_groq(uniq, api_key)
    _CACHE.update(resolved)
    _save_cache(_CACHE)
    return len(resolved)


def _classify_with_groq(strings: list[str], api_key: str) -> dict[str, str]:
    """Call Groq llama-3.3-70b to classify a list of raw country strings."""
    try:
        from groq import Groq  # type: ignore
    except ImportError as e:
        raise ImportError("pip install groq") from e

    client = Groq(api_key=api_key)
    results: dict[str, str] = {}

    # Process in batches of 60 to stay within context
    batch_size = 60
    for i in range(0, len(strings), batch_size):
        batch = strings[i : i + batch_size]
        prompt = (
            "You are an expert country-name normalizer for import-permit data from Algeria.\n"
            "The input strings are country-of-origin values that may be in French, English,\n"
            "Arabic transliteration, or contain typos.\n\n"
            "Return a JSON object mapping each input string exactly to its ISO 3166-1 alpha-2 code.\n"
            "Rules:\n"
            "- Use the standard ISO 3166-1 alpha-2 code (e.g. ES, IT, CN, TR)\n"
            "- For multi-country strings like 'Costa Rica / Colombie', use the FIRST country\n"
            "- Use 'XX' ONLY for strings that are genuinely not a country name\n"
            "- Common French names: Espagne=ES, Italie=IT, Allemagne=DE, Jordanie=JO,\n"
            "  Turquie=TR, Chine=CN, Belgique=BE, Pays Bas=NL, Suisse=CH, Brésil=BR,\n"
            "  Argentine=AR, Pologne=PL, Autriche=AT, Suède=SE, Grèce=GR, Hongrie=HU\n"
            "- Common Arabic: الأردن=JO, إسبانيا=ES, إيطاليا=IT, تركيا=TR\n\n"
            "Input:\n"
            + "\n".join(f"- {s}" for s in batch)
        )

        try:
            response = client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[{"role": "user", "content": prompt}],
                temperature=0,
                response_format={"type": "json_object"},
                max_tokens=1024,
            )
            parsed = json.loads(response.choices[0].message.content)
            for k, v in parsed.items():
                if isinstance(v, str) and (len(v) == 2 or v == "XX"):
                    results[k] = v.upper()
        except Exception as exc:  # noqa: BLE001
            print(f"  Groq batch error: {exc}")

    return results


# ── Public API ─────────────────────────────────────────────────────────────────

def normalize_country(raw: str) -> str:
    """
    Return ISO 3166-1 alpha-2 code for a raw country string.
    For multi-country values, returns the first recognized country.
    Returns 'XX' for unrecognized values (queues for Groq if API key present).
    """
    if not raw:
        return "XX"
    trimmed = raw.strip()
    if not trimmed:
        return "XX"

    # Multi-country strings: detect before pycountry to avoid Malta false-positives
    if len(trimmed) > 4 and _MULTI_COUNTRY_RE.search(trimmed):
        parts = [p.strip() for p in re.split(r"[\/,;]|\s+[-–]\s+|\s+(?:et|ou|or|and)\s+", trimmed, flags=re.IGNORECASE) if p.strip()]
        if len(parts) > 1:
            return "XX"

    # 1. Already an ISO alpha-2 code
    if _ISO2_RE.match(trimmed.upper()) and pycountry.countries.get(alpha_2=trimmed.upper()):
        return trimmed.upper()

    # 2. pycountry (handles English names and ISO codes perfectly)
    iso = _pycountry_lookup(trimmed)
    if iso:
        return iso

    # 3. File cache (from prior Groq runs)
    if trimmed in _CACHE:
        return _CACHE[trimmed]

    # 4. Try splitting multi-country strings
    parts = _SPLIT_RE.split(trimmed)
    if len(parts) > 1:
        for part in parts:
            p = part.strip()
            if not p or len(p) < 2:
                continue
            iso = _pycountry_lookup(p)
            if iso:
                return iso
            if p in _CACHE:
                return _CACHE[p]

    # 5. Queue for Groq batch (resolved by flush_groq_queue())
    if os.environ.get("GROQ_API_KEY"):
        _GROQ_QUEUE.append(trimmed)

    return "XX"


# ── Chemical category normalization ───────────────────────────────────────────
# This is deterministic — no AI needed (the categories are a closed known set)

_CHEM_MAP: dict[str, str] = {
    # Fongicide
    "fongicide": "Fongicide", "fongicides": "Fongicide", "fungicide": "Fongicide",
    "fngicide": "Fongicide", "fengicide": "Fongicide",
    "fongicide a usage agricole": "Fongicide",
    "fongicide biologique a usage agricole": "Fongicide",
    "bio fongicide": "Fongicide", "fongicide anti mildiou": "Fongicide",
    "mildiou": "Fongicide", "oidium": "Fongicide",
    # Arabic
    "مبيد فطري": "Fongicide",
    # Insecticide
    "insecticide": "Insecticide", "insecticides": "Insecticide",
    "incecticide": "Insecticide", "insectiside": "Insecticide",
    "insecticide agricole": "Insecticide",
    "bio insecticides": "Insecticide", "fumigant": "Insecticide",
    "fumigation": "Insecticide", "appat proteique": "Insecticide",
    "puceron": "Insecticide", "thrips": "Insecticide", "aleurodes": "Insecticide",
    "raticide": "Insecticide",
    "مبيد حشري": "Insecticide",
    # Insecticide / Acaricide
    "insecticide / acaricide": "Insecticide / Acaricide",
    "insecticide/ acaricide": "Insecticide / Acaricide",
    "insecticide/acaricide": "Insecticide / Acaricide",
    "insecticide & acaricide": "Insecticide / Acaricide",
    "insecticide acaricide": "Insecticide / Acaricide",
    "insecticide - acaricide": "Insecticide / Acaricide",
    "insecticide-acaricide": "Insecticide / Acaricide",
    "acaricide / insecticide": "Insecticide / Acaricide",
    "acaricide/insecticide": "Insecticide / Acaricide",
    "acaricide, insecticide": "Insecticide / Acaricide",
    # Acaricide
    "acaricide": "Acaricide", "acaricides": "Acaricide",
    "acaricde": "Acaricide", "acarien": "Acaricide", "acariens": "Acaricide",
    "bio acaricide": "Acaricide", "bio acariens": "Acaricide",
    "مبيد عناكبي": "Acaricide",
    # Herbicide
    "herbicide": "Herbicide", "herbicides": "Herbicide",
    "herebicide": "Herbicide", "hebicide": "Herbicide", "herbecide": "Herbicide",
    "herbicide systemique": "Herbicide", "herbicide selectif": "Herbicide",
    "mauvaise herbes dicotyledone": "Herbicide", "mauvaise herbe": "Herbicide",
    "مبيد أعشاب": "Herbicide",
    # Correcteur de carence
    "correcteur de carence": "Correcteur de carence",
    "correcteur de carences": "Correcteur de carence",
    "correcteur de carrence": "Correcteur de carence",
    "corecteur de carrence": "Correcteur de carence",
    "coreccteur de carrence": "Correcteur de carence",
    "correcteur de caranc": "Correcteur de carence",
    "correcteur de carance": "Correcteur de carence",
    "correcteur": "Correcteur de carence",
    "correcteur de sol": "Correcteur de carence",
    "chelate de fer": "Correcteur de carence",
    "chelate de fer eddha": "Correcteur de carence",
    "microelements chelates eddha": "Correcteur de carence",
    "liquide microelements chelates d eddha": "Correcteur de carence",
    "force ca+b et force fe eco": "Correcteur de carence",
    "solide sel cristallin": "Correcteur de carence",
    "acide humique et fulvique": "Correcteur de carence",
    "extraits humiques": "Correcteur de carence",
    "matiere organique": "Correcteur de carence",
    "sel cristalin": "Correcteur de carence",
    "nitrate de calcium": "Correcteur de carence",
    "مصحح نقص معادن": "Correcteur de carence",
    # Biostimulant
    "biostimulant": "Biostimulant", "biostimulants": "Biostimulant",
    "biostumilant": "Biostimulant", "biostumilants": "Biostimulant",
    "biostumulant": "Biostimulant", "biostomulant": "Biostimulant",
    "biostimulmant": "Biostimulant", "bio stimulant": "Biostimulant",
    "bio stimulants": "Biostimulant", "bio-stimulant": "Biostimulant",
    "biostimulant agricole": "Biostimulant",
    "biostimulant biologique": "Biostimulant",
    "منشط نمو بيولوجي": "Biostimulant",
    # Régulateur de croissance
    "regulateur de croissance": "Régulateur de croissance",
    "regulateurs de croissances": "Régulateur de croissance",
    "substance de croissance": "Régulateur de croissance",
    "منظم نمو": "Régulateur de croissance",
    # Engrais / Fertilisant
    "engrais": "Engrais", "engrai": "Engrais",
    "engrais hydrosoluble": "Engrais", "engrais liquide": "Engrais",
    "engrais solide": "Engrais", "engrais soluble": "Engrais",
    "engrais biologique": "Engrais", "engrais organique": "Engrais",
    "engrais microgranules": "Engrais", "fertilisant": "Engrais",
    "npk": "Engrais", "organique": "Engrais",
    "conditionneur du sol": "Engrais", "conditionneurs des sols": "Engrais",
    "condtionneurs des sols": "Engrais",
    "azote+calcium": "Engrais", "azote calcium": "Engrais",
    "sulphate d'ammonium": "Engrais", "sulphate d'amonium": "Engrais",
    "sulfate d ammonium": "Engrais",
    "سماد": "Engrais",
    # Nématicide
    "nematicide": "Nématicide", "nematicde": "Nématicide",
    "nemakey solari": "Nématicide",
    "مبيد نيماتودا": "Nématicide",
    # Molluscicide
    "molluscicide": "Molluscicide", "mollusicide": "Molluscicide",
    "mollucicide": "Molluscicide", "molluscide": "Molluscicide",
    # Stimulateur SDN
    "stimulateur de defense naturelle": "Stimulateur SDN",
    "stimulateur de defenses naturelles": "Stimulateur SDN",
    "stimulateur de defense naturel": "Stimulateur SDN",
    "stimulateur de defenses naturelle": "Stimulateur SDN",
    "stimulateur de defense": "Stimulateur SDN",
    "simulateur de defense naturelle oidium": "Stimulateur SDN",
    # Adjuvant
    "adjuvant": "Adjuvant", "co-adjuvant": "Adjuvant", "acidifiant": "Adjuvant",
    "repulsif": "Adjuvant", "bio adjuvant": "Adjuvant",
    "booster-adjuvant": "Adjuvant", "booster adjuvant": "Adjuvant",
}

_PHYSICAL_FORM = {
    "liquide", "solide", "poudre", "granule", "granules", "microgranule",
    "micro granule", "micro granulaire", "hydrosoluble",
    "nc", "n c", "nc liquide", "nc pate", "liquide nc", "liquide/gel",
    "capsule poudre", "oms", "oms ns", "oms sg", "oms u", "oms u - wg",
    "oms u – wg", "sg oms", "ec", "wp", "sl", "sp", "gel", "sg", "wg",
    "suspension concentree", "suspensio concetree", "suspension concentre",
    "suspension concentré", "granules nc", "pesticide", "pesticides",
    "produit phytosanitaire", "banane", "vitamine",
}


def normalize_chem_category(raw: str) -> str:
    """Normalize a raw category string to a canonical group name."""
    if not raw:
        return "Non classifié"

    # Normalize curly apostrophes and brackets
    cleaned = re.sub(r"[‘’ʼʻ′`'']", "'", raw)
    key = "".join(
        c for c in unicodedata.normalize("NFD", cleaned.strip())
        if unicodedata.category(c) != "Mn"
    )
    key = re.sub(r"[()[\]{}]", " ", key)
    key = re.sub(r"\s+", " ", key.strip().lower())
    key = re.sub(r"[‘’ʼʻ′`'']", " ", key)
    key = re.sub(r"\s+", " ", key.strip())

    if key in _PHYSICAL_FORM:
        return "Non classifié"

    # Chemical-formula strings (contain % or g/kg/g/l) → Non classifié / Correcteur
    if re.search(r"\d+\s*(%|g/kg|g/l|mg/|mol)", key):
        if any(x in key for x in ("fe", "fer", "eddha", "chelat", "microelem")):
            return "Correcteur de carence"
        return "Non classifié"

    # Direct map lookup
    if key in _CHEM_MAP:
        return _CHEM_MAP[key]

    # Prefix match for long combo strings (min key length 5 to avoid false positives)
    for k, v in _CHEM_MAP.items():
        if len(k) >= 5 and key.startswith(k):
            return v

    return raw.strip() or "Non classifié"


# ── Plant product category normalization ─────────────────────────────────────
# Banana chaos (90+ variants) + maize/soya/plants → 6 canonical groups

_GARBAGE_PLANT_CATS = {
    "non", "oui", "nc", "no", ".", "/", "…", "standard",
    "produit vegetal", "produits perissable", "i-premium", "premium", "prumium",
}

_PLANT_GARBAGE_PREFIXES = ("categori", "catégori", "ralstonia")


def normalize_plant_category(raw: str) -> str:
    """Normalize raw plant-product category to one of 6 canonical groups."""
    if not raw:
        return "Autre"

    cleaned = re.sub(r"[''ʼʻ′`'']", "'", raw.strip())
    u = re.sub(r"\s+", " ", cleaned.upper())

    # Garbage / unclassified
    u_norm = "".join(
        c for c in unicodedata.normalize("NFD", u)
        if unicodedata.category(c) != "Mn"
    ).strip()
    if u_norm in _GARBAGE_PLANT_CATS or any(u_norm.startswith(p.upper()) for p in _PLANT_GARBAGE_PREFIXES):
        return "Autre"

    # Fleurs — check before fruits (FRAÎCHE would match both)
    if "FLEUR" in u:
        return "Fleurs"

    # Fruits — banana, Musa, Cavendish, fresh fruit
    if any(kw in u for kw in ("BANAN", "MUSA", "CAVENDISH", "FRESH GREEN", "MUSACE")):
        return "Fruits"
    if re.search(r"^FRUIT", u) or u in ("FRUIT", "FRUITS", "FRUIT FRAIS"):
        return "Fruits"
    if re.search(r"FRAICHES?|FRAÎCHE|FRAIS[,\s\-–]", u) or "CONSOM" in u:
        return "Fruits"

    # Céréales et protéagineux
    if any(kw in u for kw in ("CEREAL", "CÉRÉAL", "MAIS", "MAÏS", "SOJA", "GRAIN", "TOURTEAUX", "AMIDON")):
        return "Céréales"

    # Plants et matériel végétatif
    if any(kw in u for kw in ("PLANT", "ARBORICOL", "POMMIER", "POIRIER", "VITICOLE", "VITRO", "MICRO-BOUTURE", "VIGNE", "OLIVIER", "ORNEMENT")):
        return "Plants"

    # Semences
    if "SEMENCE" in u or "PETITS POIS" in u:
        return "Semences"

    # Aliments bétail
    if any(kw in u for kw in ("BETAIL", "VOLAILLE", "ALIMENT")):
        return "Aliments bétail"

    return "Autre"


def normalize_seed_material(raw: str | None) -> str:
    """Collapse 95+ material_type variants for seeds/seedlings into 7 canonical groups."""
    if not raw:
        return "Autre"
    u = raw.strip().upper()
    u = re.sub(r"[''ʼʻ′`'']", "'", u)
    u = re.sub(r"\s+", " ", u)

    if not u:
        return "Autre"

    # Garbage / chemical names entered by mistake
    if re.search(r"ABAMECTIN|DELTAMETHRIN|DIFECONAZOLE|ACETAMIPRIDE|METALAXYL|CIFLUFENAMIDE", u):
        return "Autre"
    if u in ("TEST", "VOIR ANNEXE", "BULBES A FLEURES", "DIVERS", "FRUIT", "ECHANTILLONS",
             "SELENCES", "SEMNCES", "SEMECESN", "SEMENSES", "SEMANCES", "SEMEENCE"):
        return "Autre"

    # Tuber (pomme de terre)
    if re.search(r"TUBERCUL", u):
        return "Tubercule"

    # Plant / seedling material (starts with PLANT/PLANTE but is NOT a seed)
    if re.match(r"^PLANT", u) and not re.search(r"SEMENCE", u):
        return "Plant"

    # Rootstock
    if re.search(r"PORTE.?GREFFE|PORTE GREFFE|GREFFES?$|VITIS VINIFERA", u) or u in ("M9", "M09", "GF677"):
        return "Porte-greffe"

    # Forage seeds
    if re.search(r"FOURAG|FOURRAG|LUZERNE|RHODES GRASS|SORGHUM SUDAN", u):
        return "Semence fourragère"

    # Hybrid seeds (check before standard — "Semences hybrides" must not match "Semence standard")
    if re.search(r"HYBRIDE|HYBRID|HYBR|\bF1\b", u):
        return "Semence hybride"

    # Standard seeds
    if re.search(r"SEMENCE|SEMENCES|SEMANCE|بذور", u):
        return "Semence standard"

    return "Autre"
