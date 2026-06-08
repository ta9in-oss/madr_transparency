from pathlib import Path
from scraper.config import DATA_DIR, RAW_DATA_DIR


def test_raw_data_dir_is_data_raw():
    assert RAW_DATA_DIR == DATA_DIR / "raw"


def test_raw_data_dir_is_separate_from_data_dir():
    assert RAW_DATA_DIR != DATA_DIR
