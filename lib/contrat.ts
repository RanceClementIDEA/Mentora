/**
 * Logique (pure) des échéances légales d'un contrat d'apprentissage.
 *
 * - Période probatoire : 45 jours à compter du début du contrat. Pendant ce
 *   délai, chaque partie peut rompre librement (art. L6222-18 du Code du
 *   travail). NB : la loi compte 45 jours de formation pratique en entreprise ;
 *   on retient ici une approximation en jours calendaires, à ajuster si besoin.
 * - Fin de contrat : date de fin renseignée.
 *
 * Toutes les dates sont au format ISO « AAAA-MM-JJ » (comparaison
 * lexicographique = comparaison chronologique).
 */

export const JOURS_PERIODE_PROBATOIRE = 45;
/** Fenêtres de rappel (jours avant l'échéance). */
export const SEUIL_RAPPEL_PROBATOIRE = 7;
export const SEUIL_RAPPEL_FIN = 30;

function ajouterJours(iso: string, n: number): string {
  const t = Date.parse(`${iso}T00:00:00Z`) + n * 86_400_000;
  return new Date(t).toISOString().slice(0, 10);
}

function joursEntre(aIso: string, bIso: string): number {
  return Math.round(
    (Date.parse(`${bIso}T00:00:00Z`) - Date.parse(`${aIso}T00:00:00Z`)) /
      86_400_000,
  );
}

/** Fin de la période probatoire = début + 45 jours. */
export function finPeriodeProbatoire(debutIso: string): string {
  return ajouterJours(debutIso, JOURS_PERIODE_PROBATOIRE);
}

export type TypeEcheance = "PERIODE_PROBATOIRE" | "FIN_CONTRAT";

export interface EcheanceContrat {
  type: TypeEcheance;
  dateIso: string;
  /** Jours restants (négatif si l'échéance est passée). */
  joursRestants: number;
}

/** Échéances légales déduites des dates de contrat, avec les jours restants. */
export function echeancesContrat(
  params: { debutIso?: string | null; finIso?: string | null },
  todayIso: string,
): EcheanceContrat[] {
  const out: EcheanceContrat[] = [];
  if (params.debutIso) {
    const dateIso = finPeriodeProbatoire(params.debutIso);
    out.push({
      type: "PERIODE_PROBATOIRE",
      dateIso,
      joursRestants: joursEntre(todayIso, dateIso),
    });
  }
  if (params.finIso) {
    out.push({
      type: "FIN_CONTRAT",
      dateIso: params.finIso,
      joursRestants: joursEntre(todayIso, params.finIso),
    });
  }
  return out;
}

/** Libellé STABLE d'une échéance (sert aussi de clé de déduplication). */
export function messageEcheanceContrat(
  type: TypeEcheance,
  nom: string,
  dateIso: string,
): string {
  return type === "PERIODE_PROBATOIRE"
    ? `Fin de période probatoire pour ${nom} le ${dateIso}.`
    : `Fin de contrat pour ${nom} le ${dateIso}.`;
}

/**
 * Messages de rappel à créer aujourd'hui pour un alternant : une échéance
 * entre dans sa fenêtre de rappel (0 ≤ jours restants ≤ seuil). Déterministe :
 * chaque message est stable, ce qui permet de dédupliquer côté base.
 */
export function rappelsContrat(
  params: { nom: string; debutIso?: string | null; finIso?: string | null },
  todayIso: string,
  seuils: { probatoire: number; fin: number } = {
    probatoire: SEUIL_RAPPEL_PROBATOIRE,
    fin: SEUIL_RAPPEL_FIN,
  },
): string[] {
  const messages: string[] = [];
  const echeances = echeancesContrat(
    { debutIso: params.debutIso, finIso: params.finIso },
    todayIso,
  );
  for (const e of echeances) {
    const seuil =
      e.type === "PERIODE_PROBATOIRE" ? seuils.probatoire : seuils.fin;
    if (e.joursRestants >= 0 && e.joursRestants <= seuil) {
      messages.push(messageEcheanceContrat(e.type, params.nom, e.dateIso));
    }
  }
  return messages;
}
