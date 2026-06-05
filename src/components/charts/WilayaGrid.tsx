import { useState } from 'react';

interface Props {
  counts: Record<string, number>;
  title?: string;
}

// 58 wilayas arranged in approximate geographic grid (col, row)
// Northwest → Northeast across the top, South towards bottom
// Grid is 12 cols × 10 rows
const WILAYAS: { name: string; code: number; col: number; row: number }[] = [
  // Far west / coast
  { name: 'Tlemcen',          code: 13, col: 0,  row: 0 },
  { name: 'Aïn Témouchent',   code: 46, col: 1,  row: 0 },
  { name: 'Oran',             code: 31, col: 2,  row: 0 },
  { name: 'Mostaganem',       code: 27, col: 3,  row: 0 },
  { name: 'Chlef',            code: 2,  col: 4,  row: 0 },
  { name: 'Tipaza',           code: 42, col: 5,  row: 0 },
  { name: 'Alger',            code: 16, col: 6,  row: 0 },
  { name: 'Boumerdès',        code: 35, col: 7,  row: 0 },
  { name: 'Béjaïa',           code: 6,  col: 8,  row: 0 },
  { name: 'Jijel',            code: 18, col: 9,  row: 0 },
  { name: 'Skikda',           code: 21, col: 10, row: 0 },
  { name: 'Annaba',           code: 23, col: 11, row: 0 },

  // Second band
  { name: 'Naâma',            code: 45, col: 0,  row: 1 },
  { name: 'Sidi Bel Abbès',   code: 22, col: 1,  row: 1 },
  { name: 'Mascara',          code: 29, col: 2,  row: 1 },
  { name: 'Relizane',         code: 48, col: 3,  row: 1 },
  { name: 'Tissemsilt',       code: 38, col: 4,  row: 1 },
  { name: 'Aïn Defla',        code: 44, col: 5,  row: 1 },
  { name: 'Médéa',            code: 26, col: 6,  row: 1 },
  { name: 'Bouïra',           code: 10, col: 7,  row: 1 },
  { name: 'Tizi Ouzou',       code: 15, col: 8,  row: 1 },
  { name: 'Mila',             code: 43, col: 9,  row: 1 },
  { name: 'Guelma',           code: 24, col: 10, row: 1 },
  { name: 'El Tarf',          code: 36, col: 11, row: 1 },

  // Third band
  { name: 'Béchar',           code: 8,  col: 0,  row: 2 },
  { name: 'Saïda',            code: 20, col: 1,  row: 2 },
  { name: 'Tiaret',           code: 14, col: 2,  row: 2 },
  { name: 'Djelfa',           code: 17, col: 3,  row: 2 },
  { name: 'M\'Sila',          code: 28, col: 4,  row: 2 },
  { name: 'Bordj Bou Arréridj', code: 34, col: 5, row: 2 },
  { name: 'Sétif',            code: 19, col: 6,  row: 2 },
  { name: 'Batna',            code: 5,  col: 7,  row: 2 },
  { name: 'Oum El Bouaghi',   code: 4,  col: 8,  row: 2 },
  { name: 'Khenchela',        code: 40, col: 9,  row: 2 },
  { name: 'Tébessa',          code: 12, col: 10, row: 2 },
  { name: 'Souk Ahras',       code: 41, col: 11, row: 2 },

  // Fourth band
  { name: 'El Bayadh',        code: 32, col: 1,  row: 3 },
  { name: 'Laghouat',         code: 3,  col: 2,  row: 3 },
  { name: 'Msila',            code: 28, col: 3,  row: 3 },
  { name: 'Biskra',           code: 7,  col: 5,  row: 3 },
  { name: 'El Oued',          code: 39, col: 7,  row: 3 },
  { name: 'Constantine',      code: 25, col: 8,  row: 3 },
  { name: 'Souk Ahras',       code: 41, col: 9,  row: 3 },

  // South band
  { name: 'Tindouf',          code: 37, col: 0,  row: 5 },
  { name: 'Béni Abbès',       code: 53, col: 1,  row: 5 },
  { name: 'Adrar',            code: 1,  col: 2,  row: 5 },
  { name: 'Timimoun',         code: 49, col: 3,  row: 5 },
  { name: 'Ouargla',          code: 30, col: 5,  row: 5 },
  { name: 'Touggourt',        code: 55, col: 6,  row: 5 },
  { name: 'El M\'Ghair',      code: 57, col: 7,  row: 5 },
  { name: 'El Meniaa',        code: 58, col: 5,  row: 6 },
  { name: 'Ouled Djellal',    code: 51, col: 4,  row: 4 },
  { name: 'Bordj Badji Mokhtar', code: 50, col: 2, row: 6 },
  { name: 'Ghardaïa',         code: 47, col: 4,  row: 5 },
  { name: 'In Salah',         code: 53, col: 3,  row: 6 },
  { name: 'Tamanrasset',      code: 11, col: 4,  row: 7 },
  { name: 'In Guezzam',       code: 54, col: 3,  row: 7 },
  { name: 'Djanet',           code: 56, col: 8,  row: 6 },
  { name: 'Illizi',           code: 33, col: 9,  row: 5 },
];

// De-duplicate by name (keep first occurrence)
const UNIQUE_WILAYAS = WILAYAS.filter(
  (w, i, arr) => arr.findIndex((x) => x.name === w.name) === i
);

function getTileColor(count: number): { bg: string; text: string } {
  if (count === 0) return { bg: '#fde8e8', text: '#c92a2a' };
  if (count <= 2) return { bg: '#d8f3dc', text: '#1a3d2e' };
  if (count <= 7) return { bg: '#74c69d', text: '#1a3d2e' };
  return { bg: '#2d6a4f', text: '#fafaf8' };
}

export function WilayaGrid({ counts, title }: Props) {
  const [hovered, setHovered] = useState<string | null>(null);

  const maxCol = Math.max(...UNIQUE_WILAYAS.map((w) => w.col)) + 1;
  const maxRow = Math.max(...UNIQUE_WILAYAS.map((w) => w.row)) + 1;

  const grid: (typeof UNIQUE_WILAYAS[0] | null)[][] = Array.from(
    { length: maxRow },
    () => Array(maxCol).fill(null)
  );
  for (const w of UNIQUE_WILAYAS) {
    grid[w.row][w.col] = w;
  }

  const totalWithCoverage = UNIQUE_WILAYAS.filter((w) => (counts[w.name] ?? 0) > 0).length;
  const totalWithout = UNIQUE_WILAYAS.filter((w) => (counts[w.name] ?? 0) === 0).length;

  return (
    <div className="w-full">
      {title && <p className="text-sm font-medium text-ink mb-3">{title}</p>}

      {/* Summary badges */}
      <div className="flex gap-3 mb-4 text-xs font-mono">
        <span className="px-2 py-1 rounded" style={{ background: '#2d6a4f', color: '#fafaf8' }}>
          {totalWithCoverage} ولاية لديها موزعون
        </span>
        <span className="px-2 py-1 rounded" style={{ background: '#fde8e8', color: '#c92a2a' }}>
          {totalWithout} ولاية بلا تغطية
        </span>
      </div>

      {/* Grid */}
      <div
        className="w-full overflow-x-auto"
        style={{ direction: 'ltr' }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${maxCol}, minmax(56px, 1fr))`,
            gap: 4,
            minWidth: maxCol * 60,
          }}
        >
          {grid.map((row, ri) =>
            row.map((cell, ci) => {
              if (!cell) return <div key={`${ri}-${ci}`} />;
              const count = counts[cell.name] ?? 0;
              const { bg, text } = getTileColor(count);
              const isHov = hovered === cell.name;
              return (
                <div
                  key={cell.name}
                  title={`${cell.name}: ${count} موزع`}
                  onMouseEnter={() => setHovered(cell.name)}
                  onMouseLeave={() => setHovered(null)}
                  style={{
                    background: isHov ? '#1a3d2e' : bg,
                    color: isHov ? '#fafaf8' : text,
                    borderRadius: 4,
                    padding: '4px 2px',
                    fontSize: 9,
                    fontFamily: 'ui-monospace, monospace',
                    textAlign: 'center',
                    cursor: 'default',
                    transition: 'background 0.15s',
                    lineHeight: 1.3,
                    minHeight: 40,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 1,
                  }}
                >
                  <span style={{ fontSize: 10, fontWeight: 700 }}>{count || '—'}</span>
                  <span style={{ fontSize: 8, opacity: 0.85, textAlign: 'center', wordBreak: 'break-word' }}>
                    {cell.name.replace('Bordj Bou Arréridj', 'BBA')}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Color legend */}
      <div className="flex flex-wrap gap-3 mt-4 text-xs font-mono text-muted">
        {[
          { bg: '#2d6a4f', text: '#fafaf8', label: '8+ موزع' },
          { bg: '#74c69d', text: '#1a3d2e', label: '3–7 موزعين' },
          { bg: '#d8f3dc', text: '#1a3d2e', label: '1–2 موزع' },
          { bg: '#fde8e8', text: '#c92a2a', label: 'لا تغطية' },
        ].map((l) => (
          <span key={l.label} className="flex items-center gap-1">
            <span style={{ width: 12, height: 12, borderRadius: 2, background: l.bg, display: 'inline-block' }} />
            {l.label}
          </span>
        ))}
      </div>
    </div>
  );
}
