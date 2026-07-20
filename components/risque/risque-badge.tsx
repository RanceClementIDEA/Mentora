import { libelleNiveau, type Risque } from "@/lib/risque";
import { StatusPill, type PillTone } from "@/components/status-pill";

const TONE: Record<Risque["niveau"], PillTone> = {
  FAIBLE: "good",
  MODERE: "warn",
  ELEVE: "crit",
};

/** Pastille de niveau de risque (compacte, pour les listes/cartes). */
export function RisqueBadge({ risque }: { risque: Risque }) {
  return (
    <StatusPill
      tone={TONE[risque.niveau]}
      title={risque.facteurs.join(" · ") || "Aucun signal d'alerte"}
    >
      {libelleNiveau(risque.niveau)}
    </StatusPill>
  );
}

/** Encart détaillé (score + facteurs) pour la page d'un alternant. */
export function RisqueCard({ risque }: { risque: Risque }) {
  const border =
    risque.niveau === "ELEVE"
      ? "border-red-200 bg-red-50/60 dark:border-red-500/30 dark:bg-red-500/10"
      : risque.niveau === "MODERE"
        ? "border-amber-200 bg-amber-50/60 dark:border-amber-500/30 dark:bg-amber-500/10"
        : "border-emerald-200 bg-emerald-50/60 dark:border-emerald-500/30 dark:bg-emerald-500/10";

  return (
    <div className={`rounded-2xl border p-4 ${border}`}>
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-semibold text-foreground">
          Risque de décrochage
        </span>
        <RisqueBadge risque={risque} />
      </div>
      {risque.facteurs.length > 0 ? (
        <ul className="mt-2 list-disc space-y-0.5 pl-5 text-sm text-foreground">
          {risque.facteurs.map((f) => (
            <li key={f}>{f}</li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-sm text-muted-foreground">
          Aucun signal d&apos;alerte : missions et bilans à jour.
        </p>
      )}
    </div>
  );
}
