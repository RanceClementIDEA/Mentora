export type PillTone = "neutral" | "info" | "good" | "warn" | "crit";

const STYLES: Record<PillTone, string> = {
  neutral: "bg-muted text-muted-foreground",
  info: "bg-sky-100 text-sky-900 dark:bg-sky-500/20 dark:text-sky-100",
  good: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-200",
  warn: "bg-amber-100 text-amber-900 dark:bg-amber-500/20 dark:text-amber-100",
  crit: "bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-200",
};

/**
 * Pastille de statut (point + libellé) : jamais la couleur seule ne porte
 * l'information, le libellé la nomme toujours. Le point reprend la couleur du
 * texte (`bg-current`) pour rester cohérent sans carte de couleurs séparée.
 */
export function StatusPill({
  tone = "neutral",
  title,
  children,
}: {
  tone?: PillTone;
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      title={title}
      className={`inline-flex items-center gap-1.5 rounded-lg px-2 py-0.5 text-xs font-medium ${STYLES[tone]}`}
    >
      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-current opacity-70" aria-hidden />
      {children}
    </span>
  );
}
