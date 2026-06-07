from scraper.extractors.base import BaseExtractor
from scraper.models.plant_product import PlantProduct
from scraper.normalize import normalize_country


class PlantProductsExtractor(BaseExtractor[PlantProduct]):
    TABLE_ID = "table_1"

    def _parse_row(self, cells: list[str]) -> PlantProduct:
        return PlantProduct(
            company=cells[0] if len(cells) > 0 else "",
            company_name_ar="",
            known_name=cells[1] if len(cells) > 1 else "",
            variety=cells[2] if len(cells) > 2 else "",
            country_of_origin=normalize_country(cells[3] if len(cells) > 3 else ""),
            production_zone=cells[4] if len(cells) > 4 else "",
            category=cells[5] if len(cells) > 5 else "",
        )
