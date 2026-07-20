import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { getPortefeuille, type StatutSemaine } from "@/lib/data/pilotage";
import { RisqueBadge } from "@/components/risque/risque-badge";

export const metadata = { title: "Tableau de bord · AlternPilot" };

const STATUT_LABEL: Record<StatutSemaine, string> = {
  ECOLE: "École / CFA",
  ENTREPRISE: "Entreprise",
  HORS: "Hors période",
  NON_SAISI: "Rythme non saisi",
};

export default async function TableauDeBordPage() {
  const user = await requireRole(["TUTEUR", "ADMIN"]);
  const estAdmin = user.role === "ADMIN";

  if (estAdmin && !user.organisationId) {
    return (
      <div>
        <h1 className="text-xl font-semibold text-foreground">Tableau de bord</h1>
        <p className="mt-4 text-sm text-muted-foreground">
          Aucune organisation rattachée.
        </p>
      </div>
    );
  }

  const today = new Date().toISOString().slice(0, 10);
  const lignes = await getPortefeuille(
    estAdmin
      ? { organisationId: user.organisationId! }
      : { tuteurId: user.entityId! },
    today,
  );

  const aSurveiller = lignes.filter((l) => l.risque.niveau !== "FAIBLE").length;
  const retardsTotal = lignes.reduce((n, l) => n + l.missionsEnRetard, 0);
  const echeancesProches = lignes.filter(
    (l) => l.prochaineEcheance && l.prochaineEcheance.joursRestants <= 30,
  ).length;
  const actionsOuvertes = lignes.reduce((n, l) => n + l.actionsOuvertes, 0);

  const th = "px-3 py-2 text-left text-xs font-semibold text-muted-foreground";
  const td = "px-3 py-2.5 text-sm align-middle";

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Tableau de bord</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {estAdmin
              ? "Portefeuille de l'organisation."
              : "Vos alternants en un coup d'œil."}
          </p>
        </div>
        <Link
          href={estAdmin ? "/admin" : "/tuteur"}
          className="rounded-xl border px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-accent"
        >
          ← Retour
        </Link>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Alternants" valeur={lignes.length} />
        <Stat label="À surveiller" valeur={aSurveiller} accent={aSurveiller > 0} />
        <Stat label="Missions en retard" valeur={retardsTotal} accent={retardsTotal > 0} />
        <Stat label="Échéances < 30 j" valeur={echeancesProches} accent={echeancesProches > 0} />
      </div>

      {lignes.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed bg-card p-8 text-center text-sm text-muted-foreground">
          Aucun alternant à afficher.
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-2xl border bg-card shadow-soft">
          <table className="w-full min-w-[820px] border-collapse">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className={th}>Alternant</th>
                {estAdmin && <th className={th}>Tuteur</th>}
                <th className={th}>Semaine</th>
                <th className={th}>Retards</th>
                <th className={th}>Prochaine échéance</th>
                <th className={th}>Risque</th>
                <th className={th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {lignes.map((l) => (
                <tr key={l.id} className="border-b last:border-0">
                  <td className={td}>
                    {estAdmin ? (
                      <span className="font-medium text-foreground">{l.nom}</span>
                    ) : (
                      <Link
                        href={`/tuteur/alternants/${l.id}`}
                        className="font-medium text-primary hover:underline"
                      >
                        {l.nom}
                      </Link>
                    )}
                    <div className="text-xs text-muted-foreground">{l.diplome}</div>
                  </td>
                  {estAdmin && (
                    <td className={`${td} text-muted-foreground`}>{l.tuteur}</td>
                  )}
                  <td className={`${td} text-muted-foreground`}>
                    {STATUT_LABEL[l.statutSemaine]}
                  </td>
                  <td className={td}>
                    {l.missionsEnRetard > 0 ? (
                      <span className="font-medium text-red-600">
                        {l.missionsEnRetard}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">0</span>
                    )}
                  </td>
                  <td className={`${td} text-muted-foreground`}>
                    {l.prochaineEcheance ? (
                      <span
                        className={
                          l.prochaineEcheance.joursRestants <= 30
                            ? "text-amber-700 dark:text-amber-300"
                            : ""
                        }
                      >
                        {l.prochaineEcheance.label} · {l.prochaineEcheance.dateIso}{" "}
                        <span className="text-xs">
                          ({l.prochaineEcheance.joursRestants} j)
                        </span>
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className={td}>
                    <RisqueBadge risque={l.risque} />
                  </td>
                  <td className={`${td} text-muted-foreground`}>
                    {l.actionsOuvertes > 0 ? `${l.actionsOuvertes} en cours` : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {actionsOuvertes > 0 && (
        <p className="mt-3 text-xs text-muted-foreground">
          {actionsOuvertes} action(s) de suivi en cours sur le portefeuille.
        </p>
      )}
    </div>
  );
}

function Stat({
  label,
  valeur,
  accent = false,
}: {
  label: string;
  valeur: number;
  accent?: boolean;
}) {
  return (
    <div className="rounded-2xl border bg-card p-5 shadow-soft">
      <div
        className={`text-2xl font-bold ${accent ? "text-red-600" : "text-foreground"}`}
      >
        {valeur}
      </div>
      <div className="mt-1 text-xs text-muted-foreground">{label}</div>
    </div>
  );
}
