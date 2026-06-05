from pathlib import Path
from bs4 import BeautifulSoup
from scraper.extractors.plant_products import PlantProductsExtractor
from scraper.extractors.agrochemicals import AgrochemicalsExtractor
from scraper.extractors.vet_distributors import VetDistributorsExtractor
from scraper.models.plant_product import PlantProduct
from scraper.models.agrochemical import Agrochemical
from scraper.models.vet_distributor import VetDistributor

FIXTURES = Path(__file__).parent / "fixtures"


def _load_fixture(name: str) -> BeautifulSoup:
    html = (FIXTURES / name).read_text(encoding="utf-8")
    return BeautifulSoup(f"<html><body>{html}</body></html>", "lxml")


def test_plant_products_returns_plant_product_instances():
    records = PlantProductsExtractor().extract(_load_fixture("plant_products_table.html"))
    assert len(records) > 0
    assert all(isinstance(r, PlantProduct) for r in records)


def test_plant_products_company_name_ar_is_empty():
    records = PlantProductsExtractor().extract(_load_fixture("plant_products_table.html"))
    assert all(r.company_name_ar == "" for r in records)


def test_plant_products_no_empty_company():
    records = PlantProductsExtractor().extract(_load_fixture("plant_products_table.html"))
    assert all(r.company != "" for r in records)


def test_agrochemicals_returns_agrochemical_instances():
    records = AgrochemicalsExtractor().extract(_load_fixture("agrochemicals_table.html"))
    assert len(records) > 0
    assert all(isinstance(r, Agrochemical) for r in records)


def test_agrochemicals_company_name_ar_is_empty():
    records = AgrochemicalsExtractor().extract(_load_fixture("agrochemicals_table.html"))
    assert all(r.company_name_ar == "" for r in records)


def test_vet_distributors_returns_vet_distributor_instances():
    records = VetDistributorsExtractor().extract(_load_fixture("vet_distributors_table.html"))
    assert len(records) > 0
    assert all(isinstance(r, VetDistributor) for r in records)


def test_vet_distributors_number_is_int():
    records = VetDistributorsExtractor().extract(_load_fixture("vet_distributors_table.html"))
    assert all(isinstance(r.number, int) for r in records)
