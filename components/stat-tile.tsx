export type StatTileTone = "default" | "warn" | "crit";

const BAR: Record<StatTileTone, string> = {
  default: "bg-border",
  warn: "bg-amber-500",
  crit: "bg-red-500",
};
const NUMBER: Record<StatTileTone, string> = {
  default: "text-foreground",
  warn: "text-amber-700 dark:text-amber-400",
  crit: "text-red-600 dark:text-red-400",
};

/** Tuile de synthèse (KPI) avec liseré d'état : neutre tant qu'il n'y a rien à signaler. */
export function StatTile({
  label,
  valeur,
  tone = "default",
}: {
  label: string;
  valeur: number;
  tone?: StatTileTone;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border bg-card p-5 shadow-soft">
      <div className={`absolute inset-y-0 left-0 w-[3px] ${BAR[tone]}`} aria-hidden />
      <div className={`text-2xl font-bold tabular-nums ${NUMBER[tone]}`}>{valeur}</div>
      <div className="mt-1 text-xs text-muted-foreground">{label}</div>
    </div>
  );
}
