import json
from pathlib import Path
from dataclasses import dataclass
from scraper.writers.json_writer import JsonWriter


@dataclass
class _SampleModel:
    name: str
    count: int


def test_writes_json_file(tmp_path):
    writer = JsonWriter(output_dir=tmp_path)
    records = [_SampleModel(name="alpha", count=1), _SampleModel(name="beta", count=2)]
    writer.write(records, "sample")
    output = tmp_path / "sample.json"
    assert output.exists()
    data = json.loads(output.read_text(encoding="utf-8"))
    assert len(data) == 2
    assert data[0] == {"count": 1, "name": "alpha"}


def test_keys_are_sorted(tmp_path):
    writer = JsonWriter(output_dir=tmp_path)
    writer.write([_SampleModel(name="z", count=99)], "sorted")
    raw = (tmp_path / "sorted.json").read_text(encoding="utf-8")
    assert raw.index('"count"') < raw.index('"name"')


def test_empty_list_writes_empty_array(tmp_path):
    writer = JsonWriter(output_dir=tmp_path)
    writer.write([], "empty")
    data = json.loads((tmp_path / "empty.json").read_text(encoding="utf-8"))
    assert data == []


def test_utf8_arabic_content_is_preserved(tmp_path):
    @dataclass
    class _Arabic:
        text: str

    writer = JsonWriter(output_dir=tmp_path)
    writer.write([_Arabic(text="استيراد البذور")], "arabic")
    raw = (tmp_path / "arabic.json").read_text(encoding="utf-8")
    assert "استيراد البذور" in raw


def test_returns_output_path(tmp_path):
    writer = JsonWriter(output_dir=tmp_path)
    path = writer.write([_SampleModel(name="x", count=0)], "test")
    assert path == tmp_path / "test.json"
