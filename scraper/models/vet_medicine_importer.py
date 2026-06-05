from dataclasses import dataclass


@dataclass
class VetMedicineImporter:
    number: int
    company: str
    company_name_ar: str
    location: str
