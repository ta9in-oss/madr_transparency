interface Props {
  chapterNum: string;
  title: string;
  lead: string;
}

export function SectionHeader({ chapterNum, title, lead }: Props) {
  return (
    <header className="flex flex-col gap-3 mb-10">
      <span className="font-mono text-data text-forest tracking-widest uppercase">
        {chapterNum}
      </span>
      <h1 className="font-display font-bold text-display-lg text-ink leading-tight">
        {title}
      </h1>
      <p className="text-base text-muted max-w-2xl leading-relaxed font-body">
        {lead}
      </p>
    </header>
  );
}
