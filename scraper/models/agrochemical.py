from dataclasses import dataclass


@dataclass
class Agrochemical:
    company: str
    company_name_ar: str
    product_name: str
    active_substance: str
    category: str
    country_of_origin: str
