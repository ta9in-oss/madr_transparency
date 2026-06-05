from dataclasses import dataclass


@dataclass
class Seed:
    importer_surname: str
    importer_name: str
    company: str
    importer_address: str
    importer_email: str
    importer_phone: str
    known_name: str
    variety: str
    material_type: str
    country_of_origin: str
    production_zone: str
    supplier_surname: str
    supplier_name: str
