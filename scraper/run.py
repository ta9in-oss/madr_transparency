import time
import logging
import requests
from bs4 import BeautifulSoup

from scraper.config import (
    BASE_URL, USER_AGENT, REQUEST_DELAY_SECONDS, REQUEST_TIMEOUT_SECONDS,
)
from scraper.extractors.plant_products import PlantProductsExtractor
from scraper.extractors.seedlings import SeedlingsExtractor
from scraper.extractors.agrochemicals import AgrochemicalsExtractor
from scraper.extractors.seeds import SeedsExtractor
from scraper.extractors.potato_seeds import PotatoSeedsExtractor
from scraper.extractors.vet_authorizations import VetAuthorizationsExtractor
from scraper.extractors.vet_distributors import VetDistributorsExtractor
from scraper.extractors.vet_medicine_importers import VetMedicineImportersExtractor
from scraper.writers.json_writer import JsonWriter

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
log = logging.getLogger(__name__)

EXTRACTORS = [
    (PlantProductsExtractor(),       "plant-products"),
    (SeedlingsExtractor(),           "seedlings"),
    (AgrochemicalsExtractor(),       "agrochemicals"),
    (SeedsExtractor(),               "seeds"),
    (PotatoSeedsExtractor(),         "potato-seeds"),
    (VetAuthorizationsExtractor(),   "vet-authorizations"),
    (VetDistributorsExtractor(),     "vet-distributors"),
    (VetMedicineImportersExtractor(), "vet-medicine-importers"),
]


def run() -> None:
    session = requests.Session()
    session.headers.update({"User-Agent": USER_AGENT})

    log.info("Fetching %s", BASE_URL)
    response = session.get(BASE_URL, timeout=REQUEST_TIMEOUT_SECONDS)
    response.raise_for_status()

    soup = BeautifulSoup(response.text, "lxml")
    writer = JsonWriter()
    total_records = 0

    for extractor, filename in EXTRACTORS:
        log.info("Extracting %s", filename)
        records = extractor.extract(soup)
        if not records:
            log.warning("  No records extracted for %s — check TABLE_ID", filename)
        output = writer.write(records, filename)
        log.info("  wrote %d records → %s", len(records), output.name)
        total_records += len(records)
        time.sleep(REQUEST_DELAY_SECONDS)

    log.info("Done. %d total records across %d datasets.", total_records, len(EXTRACTORS))


if __name__ == "__main__":
    run()
