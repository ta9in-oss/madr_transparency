from scraper.extractors.base import BaseExtractor
from scraper.models.agrochemical import Agrochemical
from scraper.normalize import normalize_chem_category, normalize_country


class AgrochemicalsExtractor(BaseExtractor[Agrochemical]):
    TABLE_ID = "table_3"

    def _parse_row(self, cells: list[str]) -> Agrochemical:
        # table_3 columns (9 cols):
        # 0: company, 1: commercial_name (→ product_name), 2: active_substance,
        # 3: product_type (→ category), 4: country_of_origin,
        # 5: supplier_name, 6: supplier_address, 7: manufacturer_name, 8: manufacturer_address
        return Agrochemical(
            company=cells[0] if len(cells) > 0 else "",
            company_name_ar="",
            product_name=cells[1] if len(cells) > 1 else "",
            active_substance=cells[2] if len(cells) > 2 else "",
            category=normalize_chem_category(cells[3] if len(cells) > 3 else ""),
            country_of_origin=normalize_country(cells[4] if len(cells) > 4 else ""),
        )
