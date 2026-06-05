import { useState, useMemo } from 'react';
import { SearchBar } from './SearchBar';
import { FilterBar } from './FilterBar';
import { DataTable } from './DataTable';

interface Column {
  key: string;
  label: string;
  mono?: boolean;
}

interface I18nLabels {
  search_placeholder: string;
  filter_country: string;
  filter_category: string;
  filter_all: string;
  no_results: string;
  showing: string;
  of: string;
  records: string;
  prev: string;
  next: string;
}

interface Props {
  rows: Record<string, string>[];
  columns: Column[];
  searchKeys: string[];
  filterKey?: string;
  filterLabel?: string;
  categoryKey?: string;
  i18n: I18nLabels;
  pageSize?: number;
}

export function DataExplorer({
  rows,
  columns,
  searchKeys,
  filterKey,
  filterLabel,
  categoryKey,
  i18n,
  pageSize = 25,
}: Props) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('');
  const [page, setPage] = useState(1);

  const filterOptions = useMemo(() => {
    if (!filterKey) return [];
    const values = rows
      .map((r) => r[filterKey] ?? '')
      .filter((v) => v !== '');
    return [...new Set(values)].sort();
  }, [rows, filterKey]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return rows.filter((row) => {
      const matchesQuery =
        q === '' ||
        searchKeys.some((k) =>
          (row[k] ?? '').toLowerCase().includes(q)
        );
      const matchesFilter =
        filter === '' || !filterKey || row[filterKey] === filter;
      return matchesQuery && matchesFilter;
    });
  }, [rows, query, filter, searchKeys, filterKey]);

  const totalPages = Math.ceil(filtered.length / pageSize);

  const pageRows = useMemo(
    () => filtered.slice((page - 1) * pageSize, page * pageSize),
    [filtered, page, pageSize]
  );

  function handleQueryChange(v: string) {
    setQuery(v);
    setPage(1);
  }

  function handleFilterChange(v: string) {
    setFilter(v);
    setPage(1);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2 items-center">
        <SearchBar
          value={query}
          onChange={handleQueryChange}
          placeholder={i18n.search_placeholder}
        />
        {filterKey && (
          <FilterBar
            options={filterOptions}
            selected={filter}
            onChange={handleFilterChange}
            placeholder={filterLabel ?? i18n.filter_all}
          />
        )}
        <span className="font-mono text-muted text-sm ms-auto whitespace-nowrap">
          {i18n.showing} {filtered.length} {i18n.of} {rows.length} {i18n.records}
        </span>
      </div>

      <DataTable rows={pageRows} columns={columns} categoryKey={categoryKey} noResults={i18n.no_results} />

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 text-sm border border-line rounded bg-surface text-ink hover:bg-forest-tint transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {i18n.prev}
          </button>
          <span className="text-sm text-muted font-mono">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1.5 text-sm border border-line rounded bg-surface text-ink hover:bg-forest-tint transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {i18n.next}
          </button>
        </div>
      )}
    </div>
  );
}
