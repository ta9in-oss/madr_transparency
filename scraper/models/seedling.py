from dataclasses import dataclass


@dataclass
class Seedling:
    company: str
    company_name_ar: str
    planting_zone: str
    known_name: str
    variety: str
    material_type: str
    country_of_origin: str
    production_zone: str
