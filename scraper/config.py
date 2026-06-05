from pathlib import Path

BASE_URL = "https://madr.gov.dz/transparency"
DATA_DIR = Path(__file__).parent.parent / "data"
REQUEST_DELAY_SECONDS = 1.5
REQUEST_TIMEOUT_SECONDS = 30
MAX_RETRIES = 3

USER_AGENT = (
    "madr-transparency-scraper/1.0 "
    "(+https://github.com/ta9in-oss/madr_transparency)"
)
