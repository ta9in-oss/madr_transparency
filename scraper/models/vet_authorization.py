from dataclasses import dataclass


@dataclass
class VetAuthorization:
    authorization_number: int
    company: str
    company_name_ar: str
    product_type: str
    agreement_number: str
