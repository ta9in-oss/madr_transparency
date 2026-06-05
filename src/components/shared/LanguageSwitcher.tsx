import { useState } from 'react';
import type { Lang } from '../../lib/types';

interface Props {
  current: Lang;
  labels: Record<Lang, string>;
}

export function LanguageSwitcher({ current, labels }: Props) {
  const [open, setOpen] = useState(false);
  const langs: Lang[] = ['fr', 'ar', 'en'];

  function selectLang(lang: Lang) {
    setOpen(false);
    const url = new URL(window.location.href);
    const segments = url.pathname.split('/').filter(Boolean);
    const isLangSegment = (s: string): s is Lang => ['fr', 'ar', 'en'].includes(s);
    if (segments.length > 0 && isLangSegment(segments[0])) {
      segments[0] = lang;
    } else if (lang !== 'fr') {
      segments.unshift(lang);
    }
    url.pathname = '/' + segments.join('/');
    window.location.href = url.toString();
  }

  return (
    <div className="relative" role="navigation" aria-label="Language selector">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="listbox"
        className="flex items-center gap-1.5 text-sm font-body text-muted hover:text-ink transition-colors px-2 py-1 rounded"
      >
        <span>{labels[current]}</span>
        <svg width="10" height="6" viewBox="0 0 10 6" fill="none" aria-hidden="true">
          <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <ul
          role="listbox"
          aria-label="Select language"
          className="absolute right-0 mt-1 bg-surface border border-line rounded shadow-sm z-10 min-w-[8rem] py-1"
        >
          {langs.map((lang) => (
            <li
              key={lang}
              role="option"
              aria-selected={lang === current}
              onClick={() => selectLang(lang)}
              className={`px-3 py-1.5 text-sm cursor-pointer hover:bg-forest-tint transition-colors ${
                lang === current ? 'text-forest font-medium' : 'text-ink'
              }`}
            >
              {labels[lang]}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
