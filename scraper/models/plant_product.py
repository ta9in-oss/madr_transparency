from dataclasses import dataclass


@dataclass
class PlantProduct:
    company: str
    company_name_ar: str
    known_name: str
    variety: str
    country_of_origin: str
    production_zone: str
    category: str
