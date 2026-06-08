from pathlib import Path
from scraper.config import DATA_DIR, RAW_DATA_DIR
from scraper.normalize import normalize_country


def test_raw_data_dir_is_data_raw():
    assert RAW_DATA_DIR == DATA_DIR / "raw"


def test_raw_data_dir_is_separate_from_data_dir():
    assert RAW_DATA_DIR != DATA_DIR


def test_multi_country_string_returns_xx():
    assert normalize_country("cote d'ivoire-costa rica-colombie-guatemala") == "XX"


def test_multi_country_slash_returns_xx():
    assert normalize_country("COSTA RICA / COLOMBIE") == "XX"


def test_multi_country_comma_returns_xx():
    assert normalize_country("France, Espagne, Italie") == "XX"


def test_single_valid_iso2_still_works():
    assert normalize_country("FR") == "FR"


def test_single_country_name_still_works():
    # "Espagne" is a French name — pycountry may not resolve it, but "France" should work
    result = normalize_country("France")
    assert result == "FR", f"Expected FR, got {result}"
