from scraper.extractors.base import BaseExtractor
from scraper.models.seedling import Seedling
from scraper.normalize import normalize_country


class SeedlingsExtractor(BaseExtractor[Seedling]):
    TABLE_ID = "table_2"

    def _parse_row(self, cells: list[str]) -> Seedling:
        # table_2 columns (9 cols):
        # 0: company, 1: planting_zone, 2: known_name, 3: variety,
        # 4: material_type, 5: country_of_origin, 6: production_zone,
        # 7: supplier_surname, 8: supplier_name
        return Seedling(
            company=cells[0] if len(cells) > 0 else "",
            company_name_ar="",
            planting_zone=cells[1] if len(cells) > 1 else "",
            known_name=cells[2] if len(cells) > 2 else "",
            variety=cells[3] if len(cells) > 3 else "",
            material_type=cells[4] if len(cells) > 4 else "",
            country_of_origin=normalize_country(cells[5] if len(cells) > 5 else ""),
            production_zone=cells[6] if len(cells) > 6 else "",
        )
