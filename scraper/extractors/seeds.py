from scraper.extractors.base import BaseExtractor
from scraper.models.seed import Seed


class SeedsExtractor(BaseExtractor[Seed]):
    TABLE_ID = "table_5"

    def _parse_row(self, cells: list[str]) -> Seed:
        # table_5 columns (13 cols):
        # 0: importer_surname, 1: importer_name, 2: company, 3: importer_address,
        # 4: importer_email, 5: importer_phone, 6: known_name, 7: variety,
        # 8: material_type, 9: country_of_origin, 10: production_zone,
        # 11: supplier_surname, 12: supplier_name
        return Seed(
            company=cells[2] if len(cells) > 2 else "",
            company_name_ar="",
            known_name=cells[6] if len(cells) > 6 else "",
            variety=cells[7] if len(cells) > 7 else "",
            material_type=cells[8] if len(cells) > 8 else "",
            country_of_origin=cells[9] if len(cells) > 9 else "",
            production_zone=cells[10] if len(cells) > 10 else "",
        )
