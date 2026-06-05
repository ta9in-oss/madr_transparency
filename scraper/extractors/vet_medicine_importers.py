from scraper.extractors.base import BaseExtractor
from scraper.models.vet_medicine_importer import VetMedicineImporter


class VetMedicineImportersExtractor(BaseExtractor[VetMedicineImporter]):
    TABLE_ID = "table_8"

    def _parse_row(self, cells: list[str]) -> VetMedicineImporter:
        # table_8 columns (3 cols):
        # 0: number, 1: company, 2: location
        raw_num = cells[0].strip() if len(cells) > 0 else ""
        return VetMedicineImporter(
            number=int(raw_num) if raw_num.isdigit() else 0,
            company=cells[1] if len(cells) > 1 else "",
            company_name_ar="",
            location=cells[2] if len(cells) > 2 else "",
        )
