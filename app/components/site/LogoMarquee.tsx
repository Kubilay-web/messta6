// Sonsuz kayan logo/etiket şeridi (KOTA hero altındaki müşteri logoları karşılığı).
// globals.scss içindeki `animate-ticker` keyframe'ini kullanır; hover'da durur.
export default function LogoMarquee({ items }: { items: string[] }) {
  const row = [...items, ...items];
  return (
    <div className="group relative overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)]">
      <div className="flex w-max animate-ticker items-center gap-16 pr-16">
        {row.map((label, i) => (
          <span
            key={`${label}-${i}`}
            className="whitespace-nowrap font-syne text-2xl font-bold tracking-tight text-ink/35 transition-colors hover:text-ink"
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
