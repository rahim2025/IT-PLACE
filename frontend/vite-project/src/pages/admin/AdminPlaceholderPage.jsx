import { Construction } from "lucide-react";

export default function AdminPlaceholderPage({ title, description }) {
  return (
    <div>
      <h1 className="text-2xl font-extrabold text-primary">{title}</h1>
      <div className="mt-6 flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface px-6 py-20 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <Construction size={28} />
        </span>
        <h3 className="mt-5 text-lg font-bold text-primary">Coming soon</h3>
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
          {description || `${title} management isn't built yet — this section is reserved for a future update.`}
        </p>
      </div>
    </div>
  );
}
