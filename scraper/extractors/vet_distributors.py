from scraper.extractors.base import BaseExtractor
from scraper.models.vet_distributor import VetDistributor


class VetDistributorsExtractor(BaseExtractor[VetDistributor]):
    TABLE_ID = "table_7"

    def _parse_row(self, cells: list[str]) -> VetDistributor:
        # table_7 columns (4 cols):
        # 0: number, 1: company, 2: address, 3: wilaya
        raw_num = cells[0].strip() if len(cells) > 0 else ""
        return VetDistributor(
            number=int(raw_num) if raw_num.isdigit() else 0,
            company=cells[1] if len(cells) > 1 else "",
            company_name_ar="",
            address=cells[2] if len(cells) > 2 else "",
            wilaya=cells[3] if len(cells) > 3 else "",
        )
