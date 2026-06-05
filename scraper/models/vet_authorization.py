from dataclasses import dataclass


@dataclass
class VetAuthorization:
    authorization_number: int
    company: str
    product_type: str
    agreement_number: str
