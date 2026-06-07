"""
Data normalization applied at scrape time to produce clean JSON from day 1.
"""

import re
import unicodedata


# ─── Country normalization ────────────────────────────────────────────────────

# Raw string → ISO 3166-1 alpha-2 (case-insensitive after stripping)
_COUNTRY_MAP: dict[str, str] = {
    # Algeria
    "algerie": "DZ", "algérie": "DZ",
    # Spain
    "espagne": "ES", "espegne": "ES", "spain": "ES",
    "espagne-union europeenne": "ES",
    # Italy
    "italie": "IT", "italy": "IT", "italia": "IT", "itali": "IT",
    # China
    "chine": "CN", "china": "CN",
    # Jordan
    "jordanie": "JO", "jordan": "JO", "jordonie": "JO",
    "joredanie": "JO", "jordadie": "JO", "jerdanie": "JO",
    # Turkey
    "turquie": "TR", "turkey": "TR", "turque": "TR", "turkie": "TR",
    "turky": "TR", "turkiye": "TR", "republique de turquie": "TR",
    # Germany
    "allemagne": "DE", "germany": "DE", "allemegne": "DE", "allemand": "DE",
    # Portugal
    "portugal": "PT",
    # Saudi Arabia
    "arabie saoudite": "SA", "arabie saoudia": "SA", "arabie saousite": "SA",
    "l'arabie saoudite": "SA", "saudi arabia": "SA",
    # India
    "inde": "IN", "india": "IN",
    # Belgium
    "belgique": "BE", "belgium": "BE",
    # Thailand
    "thaïlande": "TH", "thaïlande": "TH", "thailande": "TH",
    "thailand": "TH", "thai": "TH", "thaillande": "TH", "thailland": "TH",
    # Netherlands
    "pays bas": "NL", "pays-bas": "NL", "hollande": "NL", "holland": "NL",
    "netherlands": "NL",
    # Hungary
    "hongrie": "HU", "hungary": "HU", "hongarie": "HU",
    # United Kingdom
    "uk": "GB", "royaume-uni": "GB", "royaume uni": "GB",
    "grande bretagne": "GB", "grand bretagne": "GB",
    "angleterre": "GB", "united kingdom": "GB", "united kingdam": "GB",
    # USA
    "usa": "US", "etats unis": "US", "etats-unis": "US", "états-unis": "US",
    "etat unis": "US", "united states": "US",
    # Russia
    "russie": "RU", "russia": "RU",
    # Japan
    "japon": "JP", "japan": "JP",
    # Greece
    "grèce": "GR", "grece": "GR", "greece": "GR",
    # Australia
    "australie": "AU", "australia": "AU",
    # Poland
    "pologne": "PL", "poland": "PL", "polongne": "PL",
    # Tunisia
    "tunisie": "TN", "tunisia": "TN",
    # UAE
    "emirats arabes unis": "AE", "united arab emirate": "AE",
    # Slovenia
    "slovénie": "SI", "slovenie": "SI", "slovinie": "SI",
    # Chile
    "chili": "CL", "chile": "CL", "chilie": "CL",
    # Cyprus
    "chypre": "CY",
    # South Korea
    "corée du sud": "KR", "coree du sud": "KR",
    # Denmark
    "danemark": "DK",
    # Egypt
    "egypte": "EG", "égypte": "EG", "egypt": "EG",
    # Bulgaria
    "bulgarie": "BG", "bulgaria": "BG",
    # Iceland
    "islande": "IS",
    # Malaysia
    "malaisie": "MY",
    # Norway
    "norvege": "NO", "norvège": "NO",
    # Peru
    "pérou": "PE", "perou": "PE", "peru": "PE", "ica-peru": "PE",
    # Austria
    "autriche": "AT",
    # Sweden
    "suède": "SE",
    # Brazil
    "brésil": "BR", "bresil": "BR", "brazil": "BR",
    # Costa Rica (most common first item in multi-country banana strings)
    "costa rica": "CR", "costarica": "CR", "costa-rica": "CR",
    # South Africa
    "afrique du sud": "ZA", "afrique de sud": "ZA", "sud d'afrique": "ZA",
    # Morocco
    "maroc": "MA",
    # France
    "france": "FR",
    # Guatemala
    "guatemala": "GT",
    # Colombia
    "colombie": "CO", "colombia": "CO",
    # Ecuador
    "équateur": "EC", "equateur": "EC",
    # Mexico
    "mexique": "MX", "mexico": "MX",
    # New Zealand
    "nouvelle-zélande": "NZ", "nouvelle zelande": "NZ", "nouvelle zeland": "NZ",
    "new zealand": "NZ", "new zeland": "NZ",
    # Kenya
    "kenya": "KE",
    # Tanzania
    "tanzanie": "TZ", "tanzania": "TZ",
    # Vietnam
    "vietnam": "VN",
    # Serbia
    "serbie": "RS",
    # Lebanon
    "liban": "LB",
    # Croatia
    "croatie": "HR",
    # Argentina
    "argentine": "AR", "argentina": "AR",
    # Switzerland
    "suisse": "CH",
    # Czech Republic
    "republique tcheque": "CZ",
    # Romania
    "roumanie": "RO",
    # Slovakia
    "slovaquie": "SK",
    # Israel
    "israël": "IL", "israel": "IL",
    # Singapore
    "singapour": "SG",
    # Iran
    "iran": "IR",
    # Libya
    "libye": "LY",
    # Ivory Coast
    "cote d'ivoire": "CI", "côte d'ivoire": "CI", "cote d ivoir": "CI",
    "cote divoire": "CI",
    # Cameroon
    "cameroun": "CM", "cameron": "CM", "camiron": "CM",
    # Panama
    "panama": "PA",
}

_SPLIT_RE = re.compile(r"[\/,;]|\s+[-–]\s+|\s+(?:et|ou|or|and)\s+", re.IGNORECASE)


def _strip_accents(s: str) -> str:
    return "".join(
        c for c in unicodedata.normalize("NFD", s) if unicodedata.category(c) != "Mn"
    )


def normalize_country(raw: str) -> str:
    """Return ISO 3166-1 alpha-2 code for a raw country string.
    For multi-country values, returns the first recognized country.
    Returns 'XX' for unrecognized values.
    """
    if not raw:
        return "XX"
    trimmed = raw.strip()
    if not trimmed:
        return "XX"

    # Already a 2-letter code?
    if re.match(r"^[A-Z]{2}$", trimmed):
        return trimmed

    # Normalize for lookup: strip accents, lowercase, collapse whitespace
    key = _strip_accents(trimmed).lower()
    key = re.sub(r"\s+", " ", key).strip()

    if key in _COUNTRY_MAP:
        return _COUNTRY_MAP[key]

    # Try splitting on common separators, return first match
    for part in _SPLIT_RE.split(trimmed):
        p = _strip_accents(part.strip()).lower()
        p = re.sub(r"\s+", " ", p).strip()
        if p and p in _COUNTRY_MAP:
            return _COUNTRY_MAP[p]

    return "XX"


# ─── Chemical category normalization ─────────────────────────────────────────

_CHEM_MAP: dict[str, str] = {
    # Fongicide
    "fongicide": "Fongicide", "fongicides": "Fongicide", "fungicide": "Fongicide",
    "fngicide": "Fongicide", "fongicide a usage agricole": "Fongicide",
    "fongicide biologique a usage agricole": "Fongicide",
    "bio fongicide": "Fongicide", "fongicide anti mildiou": "Fongicide",
    "mildiou": "Fongicide", "oidium": "Fongicide",
    "mabid futri": "Fongicide",  # Arabic مبيد فطري
    # Insecticide
    "insecticide": "Insecticide", "insecticides": "Insecticide",
    "incecticide": "Insecticide", "insectiside": "Insecticide",
    "insecticide agricole": "Insecticide", "insecticide mayonnaise": "Insecticide",
    "bio insecticides": "Insecticide", "fumigant": "Insecticide",
    "fumigation": "Insecticide", "appat proteique": "Insecticide",
    "puceron": "Insecticide", "thrips": "Insecticide", "aleurodes": "Insecticide",
    "raticide": "Insecticide",
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
    "bio acaricide": "Acaricide",
    "mabid aanakbi": "Acaricide",  # مبيد عناكبي
    # Herbicide
    "herbicide": "Herbicide", "herbicides": "Herbicide",
    "herebicide": "Herbicide", "hebicide": "Herbicide", "herbecide": "Herbicide",
    "herbicide systemique": "Herbicide", "herbicide selectif": "Herbicide",
    # Correcteur de carence
    "correcteur de carence": "Correcteur de carence",
    "correcteur de carences": "Correcteur de carence",
    "correcteur de carrence": "Correcteur de carence",
    "corecteur de carrence": "Correcteur de carence",
    "correcteur de caranc": "Correcteur de carence",
    "correcteur de carance": "Correcteur de carence",
    "correcteur": "Correcteur de carence",
    "correcteur de sol": "Correcteur de carence",
    "chelate de fer": "Correcteur de carence",
    "acide humique et fulvique": "Correcteur de carence",
    "extraits humiques": "Correcteur de carence",
    "matiere organique": "Correcteur de carence",
    "sel cristalin": "Correcteur de carence",
    "nitrate de calcium": "Correcteur de carence",
    # Biostimulant
    "biostimulant": "Biostimulant", "biostimulants": "Biostimulant",
    "biostumilant": "Biostimulant", "biostumilants": "Biostimulant",
    "biostumulant": "Biostimulant", "biostomulant": "Biostimulant",
    "biostimulmant": "Biostimulant", "bio stimulant": "Biostimulant",
    "bio stimulants": "Biostimulant", "bio-stimulant": "Biostimulant",
    "biostimulant agricole": "Biostimulant",
    "biostimulant biologique": "Biostimulant",
    # Régulateur de croissance
    "regulateur de croissance": "Régulateur de croissance",
    "régulateur de croissance": "Régulateur de croissance",
    "regulateurs de croissances": "Régulateur de croissance",
    "reg": "Régulateur de croissance",
    "substance de croissance": "Régulateur de croissance",
    # Engrais / Fertilisant
    "engrais": "Engrais", "engrai": "Engrais",
    "engrais hydrosoluble": "Engrais", "engrais liquide": "Engrais",
    "engrais solide": "Engrais", "engrais soluble": "Engrais",
    "engrais biologique": "Engrais", "engrais organique": "Engrais",
    "engrais microgranules": "Engrais", "fertilisant": "Engrais",
    "npk": "Engrais", "organique": "Engrais",
    "conditionneur du sol": "Engrais", "conditionneurs des sols": "Engrais",
    # Nématicide
    "nematicide": "Nématicide",
    # Molluscicide
    "molluscicide": "Molluscicide", "mollusicide": "Molluscicide",
    "mollucicide": "Molluscicide",
    # Stimulateur SDN
    "stimulateur de defense naturelle": "Stimulateur SDN",
    "stimulateur de defenses naturelles": "Stimulateur SDN",
    # Adjuvant
    "adjuvant": "Adjuvant", "co-adjuvant": "Adjuvant", "acidifiant": "Adjuvant",
    "repulsif": "Adjuvant",
}

# Physical form codes erroneously entered as categories
_PHYSICAL_FORM = {
    "liquide", "solide", "poudre", "granule", "granules", "microgranule",
    "micro granule", "hydrosoluble", "nc", "n c", "oms", "ec", "wp", "sl", "sp",
    "gel", "sg", "suspension concentree", "pesticide", "pesticides",
    "produit phytosanitaire",
}


def normalize_chem_category(raw: str) -> str:
    """Normalize a raw category string to a canonical group name."""
    if not raw:
        return "Non classifié"
    key = _strip_accents(raw.strip()).lower()
    key = re.sub(r"\s+", " ", key).strip()

    if key in _PHYSICAL_FORM:
        return "Non classifié"
    if key in _CHEM_MAP:
        return _CHEM_MAP[key]

    # Partial prefix matches for long combo strings
    for k, v in _CHEM_MAP.items():
        if key.startswith(k):
            return v

    return raw.strip() or "Non classifié"
