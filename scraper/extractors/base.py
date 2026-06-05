from abc import ABC, abstractmethod
from typing import TypeVar, Generic
from bs4 import BeautifulSoup

T = TypeVar("T")


class BaseExtractor(ABC, Generic[T]):
    TABLE_ID: str  # subclasses set this to the HTML table's id attribute

    def extract(self, soup: BeautifulSoup) -> list[T]:
        rows = self._get_rows(soup)
        return [self._parse_row(cells) for cells in rows]

    def _get_rows(self, soup: BeautifulSoup) -> list[list[str]]:
        table = soup.find("table", {"id": self.TABLE_ID})
        if table is None:
            return []
        tbody = table.find("tbody")
        if tbody is None:
            return []
        result = []
        for tr in tbody.find_all("tr"):
            cells = [td.get_text(separator=" ", strip=True) for td in tr.find_all("td")]
            if any(cells):
                result.append(cells)
        return result

    @abstractmethod
    def _parse_row(self, cells: list[str]) -> T:
        ...
