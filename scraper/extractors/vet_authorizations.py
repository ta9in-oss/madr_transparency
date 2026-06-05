from scraper.extractors.base import BaseExtractor
from scraper.models.vet_authorization import VetAuthorization


class VetAuthorizationsExtractor(BaseExtractor[VetAuthorization]):
    TABLE_ID = "table_6"

    def _parse_row(self, cells: list[str]) -> VetAuthorization:
        # table_6 columns (4 cols):
        # 0: authorization_number, 1: company, 2: product_type, 3: agreement_number
        raw_num = cells[0].strip() if len(cells) > 0 else ""
        return VetAuthorization(
            authorization_number=int(raw_num) if raw_num.isdigit() else 0,
            company=cells[1] if len(cells) > 1 else "",
            company_name_ar="",
            product_type=cells[2] if len(cells) > 2 else "",
            agreement_number=cells[3] if len(cells) > 3 else "",
        )
