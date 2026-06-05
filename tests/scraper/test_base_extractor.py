from bs4 import BeautifulSoup
from scraper.extractors.base import BaseExtractor

HTML_WITH_TABLE = """
<table id="test-table">
  <thead><tr><th>Col A</th><th>Col B</th></tr></thead>
  <tbody>
    <tr><td>  hello  </td><td>world</td></tr>
    <tr><td>foo</td><td>  bar  </td></tr>
  </tbody>
</table>
"""


class ConcreteExtractor(BaseExtractor):
    TABLE_ID = "test-table"

    def _parse_row(self, cells: list[str]):
        return {"a": cells[0], "b": cells[1]}


def test_get_rows_returns_all_body_rows():
    soup = BeautifulSoup(HTML_WITH_TABLE, "lxml")
    extractor = ConcreteExtractor()
    rows = extractor._get_rows(soup)
    assert len(rows) == 2


def test_cells_are_stripped():
    soup = BeautifulSoup(HTML_WITH_TABLE, "lxml")
    extractor = ConcreteExtractor()
    rows = extractor._get_rows(soup)
    assert rows[0] == ["hello", "world"]
    assert rows[1] == ["foo", "bar"]


def test_extract_calls_parse_row_for_each_row():
    soup = BeautifulSoup(HTML_WITH_TABLE, "lxml")
    extractor = ConcreteExtractor()
    results = extractor.extract(soup)
    assert results == [{"a": "hello", "b": "world"}, {"a": "foo", "b": "bar"}]


def test_empty_table_returns_empty_list():
    html = '<table id="test-table"><thead><tr><th>A</th></tr></thead><tbody></tbody></table>'
    soup = BeautifulSoup(html, "lxml")
    extractor = ConcreteExtractor()
    assert extractor.extract(soup) == []


def test_missing_table_returns_empty_list():
    html = "<html><body><p>no table here</p></body></html>"
    soup = BeautifulSoup(html, "lxml")
    extractor = ConcreteExtractor()
    assert extractor.extract(soup) == []
