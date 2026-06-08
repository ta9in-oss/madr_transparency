import json
import dataclasses
from pathlib import Path
from scraper.config import RAW_DATA_DIR


class JsonWriter:
    def __init__(self, output_dir: Path = RAW_DATA_DIR):
        self._output_dir = output_dir
        self._output_dir.mkdir(parents=True, exist_ok=True)

    def write(self, records: list, filename: str) -> Path:
        output_path = self._output_dir / f"{filename}.json"
        serialised = [dataclasses.asdict(r) for r in records]
        output_path.write_text(
            json.dumps(serialised, ensure_ascii=False, indent=2, sort_keys=True),
            encoding="utf-8",
        )
        return output_path
