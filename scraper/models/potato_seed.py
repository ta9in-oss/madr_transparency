from dataclasses import dataclass


@dataclass
class PotatoSeed:
    importer_surname: str
    importer_name: str
    company: str
    known_name: str
    variety: str
    material_type: str
    country_of_origin: str
    production_zone: str
    supplier_surname: str
    supplier_name: str
    category: str
