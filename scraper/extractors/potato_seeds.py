from scraper.extractors.base import BaseExtractor
from scraper.models.potato_seed import PotatoSeed
from scraper.normalize import normalize_country


class PotatoSeedsExtractor(BaseExtractor[PotatoSeed]):
    TABLE_ID = "table_4"

    def _parse_row(self, cells: list[str]) -> PotatoSeed:
        # table_4 columns (11 cols):
        # 0: importer_surname, 1: importer_name, 2: company, 3: known_name,
        # 4: variety, 5: material_type, 6: country_of_origin, 7: production_zone,
        # 8: supplier_surname, 9: supplier_name, 10: category
        return PotatoSeed(
            company=cells[2] if len(cells) > 2 else "",
            company_name_ar="",
            known_name=cells[3] if len(cells) > 3 else "",
            variety=cells[4] if len(cells) > 4 else "",
            material_type=cells[5] if len(cells) > 5 else "",
            country_of_origin=normalize_country(cells[6] if len(cells) > 6 else ""),
            production_zone=cells[7] if len(cells) > 7 else "",
            category=cells[10] if len(cells) > 10 else "",
        )
