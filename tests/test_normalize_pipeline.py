from pathlib import Path
from scraper.config import DATA_DIR, RAW_DATA_DIR
from scraper.normalize import normalize_country, normalize_seed_material


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


def test_seed_material_standard():
    for raw in ['Semence', 'SEMENCE', 'semence', 'SEMENCES', 'semences', 'Semences']:
        assert normalize_seed_material(raw) == 'Semence standard', f"Failed for {raw!r}"


def test_seed_material_hybrid():
    for raw in ['Semences hybrides', 'SEMENCES HYBRIDES', 'Semence hybride F1', 'Hybride']:
        assert normalize_seed_material(raw) == 'Semence hybride', f"Failed for {raw!r}"


def test_seed_material_rootstock():
    for raw in ['PORTE GREFFE', 'porte-greffes', 'M9', 'Porte greffes']:
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
    for raw in ['METALAXYL', 'test', 'VOIR ANNEXE', 'Abamectin 1.88%+Deltamethrin 4.48%']:
        assert normalize_seed_material(raw) == 'Autre', f"Failed for {raw!r}"
