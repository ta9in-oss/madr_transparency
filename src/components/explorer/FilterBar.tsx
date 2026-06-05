interface Props {
  options: string[];
  selected: string;
  onChange: (v: string) => void;
  placeholder: string;
}

export function FilterBar({ options, selected, onChange, placeholder }: Props) {
  if (options.length === 0) return null;

  return (
    <select
      dir="rtl"
      value={selected}
      onChange={(e) => onChange(e.target.value)}
      className="py-2 px-3 text-sm bg-surface border border-line rounded text-ink focus:border-forest focus:outline-none min-w-[140px] cursor-pointer"
    >
      <option value="">{placeholder}</option>
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  );
}
