from dataclasses import dataclass


@dataclass
class Agrochemical:
    company: str
    product_name: str
    active_substance: str
    product_type: str
    country_of_origin: str
    supplier_name: str
    supplier_address: str
    manufacturer_name: str
    manufacturer_address: str
