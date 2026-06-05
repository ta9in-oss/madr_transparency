import pytest
import dataclasses
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
    assert a.product_name == "ALUFOS 80%"
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
    for cls in [
        PlantProduct, Seedling, Agrochemical, Seed, PotatoSeed,
        VetAuthorization, VetDistributor, VetMedicineImporter,
    ]:
        assert dataclasses.is_dataclass(cls), f"{cls.__name__} must be a dataclass"


def test_seedling_has_planting_zone():
    s = Seedling(
        company="BOUSSOUALIM KARIM",
        company_name_ar="",
        planting_zone="commune de tixter wilaya de bordj bou arreridj",
        known_name="POMMIER",
        variety="Gala SchnicoRED M9",
        material_type="PLANTES",
        country_of_origin="ITALIE",
        production_zone="CESENA",
    )
    assert s.planting_zone != ""


def test_vet_authorization_has_integer_number():
    v = VetAuthorization(
        authorization_number=1,
        company="SARL GROUPE SALAM AVICOLE",
        company_name_ar="",
        product_type="PRC",
        agreement_number="0715161",
    )
    assert isinstance(v.authorization_number, int)


def test_potato_seed_fields():
    p = PotatoSeed(
        company="Test Company",
        company_name_ar="",
        known_name="Test Variety",
        variety="Test Variety Name",
        material_type="SEEDS",
        country_of_origin="TEST",
        production_zone="Test Zone",
        category="Test Category",
    )
    assert p.company == "Test Company"
    assert p.category == "Test Category"


def test_seed_fields():
    s = Seed(
        company="Test Company",
        company_name_ar="",
        known_name="Test Variety",
        variety="Test Variety Name",
        material_type="SEEDS",
        country_of_origin="TEST",
        production_zone="Test Zone",
    )
    assert s.company == "Test Company"
    assert s.material_type == "SEEDS"


def test_vet_medicine_importer_fields():
    v = VetMedicineImporter(
        number=1,
        company="Test Company",
        company_name_ar="",
        location="Test Location",
    )
    assert v.number == 1
    assert v.location == "Test Location"


def test_all_models_have_company_name_ar():
    for cls in [PlantProduct, Seedling, Agrochemical, Seed, PotatoSeed,
                VetAuthorization, VetDistributor, VetMedicineImporter]:
        field_names = {f.name for f in dataclasses.fields(cls)}
        assert "company_name_ar" in field_names, f"{cls.__name__} missing company_name_ar"
