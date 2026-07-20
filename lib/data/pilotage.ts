import { prisma } from "@/lib/prisma";
import { parseRythme, typeForDate } from "@/lib/rythme";
import { risqueDepuisPrisma } from "@/lib/data/risque";
import { echeancesContrat } from "@/lib/contrat";
import { estEnRetard } from "@/lib/alertes";
import type { Risque } from "@/lib/risque";

export type StatutSemaine = "ECOLE" | "ENTREPRISE" | "HORS" | "NON_SAISI";

export interface ProchaineEcheance {
  label: string;
  dateIso: string;
  joursRestants: number;
}

export interface LignePortefeuille {
  id: string;
  nom: string;
  diplome: string;
  entreprise: string;
  tuteur: string;
  statutSemaine: StatutSemaine;
  missionsEnRetard: number;
  prochaineEcheance: ProchaineEcheance | null;
  risque: Risque;
  actionsOuvertes: number;
}

/**
 * Portefeuille d'alternants avec leurs indicateurs de pilotage (statut de la
 * semaine, missions en retard, prochaine échéance légale, risque, actions de
 * suivi ouvertes). `scope` isole par tuteur ou par organisation.
 */
export async function getPortefeuille(
  scope: { tuteurId: string } | { organisationId: string },
  todayIso: string,
): Promise<LignePortefeuille[]> {
  const alternants = await prisma.alternant.findMany({
    where: scope,
    orderBy: { nom: "asc" },
    select: {
      id: true,
      nom: true,
      rythmeAlternance: true,
      dateDebutContrat: true,
      dateFinContrat: true,
      diplome: { select: { nom: true } },
      organisation: { select: { nom: true } },
      tuteur: { select: { nom: true } },
      missions: { select: { statut: true, echeance: true } },
      bilans: {
        select: { semaine: true, valideParTuteur: true, difficultes: true },
      },
      actions: { where: { fait: false }, select: { id: true } },
    },
  });

  return alternants.map((a) => {
    const rythme = parseRythme(a.rythmeAlternance);
    const type = typeForDate(rythme, todayIso);
    const statutSemaine: StatutSemaine =
      type === "ECOLE"
        ? "ECOLE"
        : type === "ENTREPRISE"
          ? "ENTREPRISE"
          : rythme.length === 0
            ? "NON_SAISI"
            : "HORS";

    const missionsEnRetard = a.missions.filter(
      (m) =>
        m.statut !== "VALIDE" &&
        m.echeance &&
        estEnRetard(m.echeance.toISOString().slice(0, 10), todayIso),
    ).length;

    const echeances = echeancesContrat(
      {
        debutIso: a.dateDebutContrat?.toISOString().slice(0, 10) ?? null,
        finIso: a.dateFinContrat?.toISOString().slice(0, 10) ?? null,
      },
      todayIso,
    )
      .filter((e) => e.joursRestants >= 0)
      .sort((x, y) => x.joursRestants - y.joursRestants);
    const proche = echeances[0];
    const prochaineEcheance: ProchaineEcheance | null = proche
      ? {
          label:
            proche.type === "PERIODE_PROBATOIRE"
              ? "Période probatoire"
              : "Fin de contrat",
          dateIso: proche.dateIso,
          joursRestants: proche.joursRestants,
        }
      : null;

    return {
      id: a.id,
      nom: a.nom,
      diplome: a.diplome.nom,
      entreprise: a.organisation.nom,
      tuteur: a.tuteur.nom,
      statutSemaine,
      missionsEnRetard,
      prochaineEcheance,
      risque: risqueDepuisPrisma(a.missions, a.bilans, todayIso),
      actionsOuvertes: a.actions.length,
    };
  });
}
