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
        known_name="BANANE FRAICHE",
        variety="CAVENDICH",
        country_of_origin="COLOMBIE",
        production_zone="GUAYAS-LOS RIOS",
        category="FRUITS (BANANE)",
    )
    assert p.company == "AB ALIMENTATION"
    assert p.category == "FRUITS (BANANE)"


def test_agrochemical_fields():
    a = Agrochemical(
        company="DEBBANE POUR L'AGRICULTURE ALGERIE",
        product_name="ALUFOS 80%",
        active_substance="Fosétyl-aluminium WP 80%",
        product_type="Fongicide",
        country_of_origin="CN",
        supplier_name="Test Supplier",
        supplier_address="Test Address",
        manufacturer_name="Test Manufacturer",
        manufacturer_address="Test Manufacturer Address",
    )
    assert a.product_type == "Fongicide"
    assert a.country_of_origin == "CN"


def test_vet_distributor_fields():
    d = VetDistributor(
        number=1,
        company="SARL eagle veto pharm",
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
        planting_zone="commune de tixter wilaya de bordj bou arreridj",
        known_name="POMMIER",
        variety="Gala SchnicoRED M9",
        material_type="PLANTES",
        country_of_origin="ITALIE",
        production_zone="CESENA",
        supplier_surname="Test Surname",
        supplier_name="Test Name",
    )
    assert s.planting_zone != ""


def test_vet_authorization_has_integer_number():
    v = VetAuthorization(
        authorization_number=1,
        company="SARL GROUPE SALAM AVICOLE",
        product_type="PRC",
        agreement_number="0715161",
    )
    assert isinstance(v.authorization_number, int)


def test_potato_seed_fields():
    p = PotatoSeed(
        importer_surname="Test",
        importer_name="Importer",
        company="Test Company",
        known_name="Test Variety",
        variety="Test Variety Name",
        material_type="SEEDS",
        country_of_origin="TEST",
        production_zone="Test Zone",
        supplier_surname="Sup",
        supplier_name="Supplier",
        category="Test Category",
    )
    assert p.importer_surname == "Test"
    assert p.category == "Test Category"


def test_seed_fields():
    s = Seed(
        importer_surname="Test",
        importer_name="Importer",
        company="Test Company",
        importer_address="Test Address",
        importer_email="test@example.com",
        importer_phone="123456789",
        known_name="Test Variety",
        variety="Test Variety Name",
        material_type="SEEDS",
        country_of_origin="TEST",
        production_zone="Test Zone",
        supplier_surname="Sup",
        supplier_name="Supplier",
    )
    assert s.importer_email == "test@example.com"
    assert s.importer_phone == "123456789"


def test_vet_medicine_importer_fields():
    v = VetMedicineImporter(
        number=1,
        company="Test Company",
        location="Test Location",
    )
    assert v.number == 1
    assert v.location == "Test Location"
