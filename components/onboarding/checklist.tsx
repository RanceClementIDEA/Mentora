import Link from "next/link";

export interface EtapeChecklist {
  label: string;
  hint?: string;
  done: boolean;
  href?: string;
  hrefLabel?: string;
}

/**
 * Checklist de démarrage : guide un nouvel utilisateur à travers les premières
 * étapes pour ne pas rester devant un espace vide. Purement présentationnel —
 * l'état des étapes est calculé par la page à partir des données réelles, et
 * la carte n'est affichée que tant qu'il reste des étapes à faire.
 */
export function Checklist({
  titre = "Premiers pas",
  etapes,
}: {
  titre?: string;
  etapes: EtapeChecklist[];
}) {
  const faites = etapes.filter((e) => e.done).length;
  const pct = etapes.length > 0 ? Math.round((faites / etapes.length) * 100) : 0;

  return (
    <section className="rounded-2xl border bg-card p-5 shadow-soft">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-foreground">{titre}</h2>
        <span className="tabular-nums text-xs text-muted-foreground">
          {faites}/{etapes.length}
        </span>
      </div>

      <div
        className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Progression de la configuration"
      >
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>

      <ul className="mt-4 space-y-3">
        {etapes.map((e) => (
          <li key={e.label} className="flex items-start gap-3">
            <span
              className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-xs ${
                e.done
                  ? "border-emerald-500 bg-emerald-500 text-white"
                  : "border-muted-foreground/40 text-transparent"
              }`}
              aria-hidden
            >
              ✓
            </span>
            <div className="min-w-0 flex-1">
              <div
                className={
                  e.done
                    ? "text-sm text-muted-foreground line-through"
                    : "text-sm font-medium text-foreground"
                }
              >
                <span className="sr-only">
                  {e.done ? "Terminé : " : "À faire : "}
                </span>
                {e.label}
              </div>
              {!e.done && e.hint && (
                <p className="mt-0.5 text-xs text-muted-foreground">{e.hint}</p>
              )}
            </div>
            {!e.done && e.href && (
              <Link
                href={e.href}
                className="shrink-0 rounded-lg border px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:bg-accent"
              >
                {e.hrefLabel ?? "Faire"}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
