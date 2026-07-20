/**
 * Utilitaires de semaine (bilan hebdomadaire). Un bilan est identifié par le
 * lundi (UTC, 00:00) de sa semaine — cohérent avec la contrainte unique
 * [alternantId, semaine] du schéma Prisma.
 */

/** Lundi (UTC, minuit) de la semaine contenant `d`. */
export function lundiDeLaSemaine(d: Date): Date {
  const date = new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()),
  );
  const jour = date.getUTCDay(); // 0 = dimanche … 6 = samedi
  const delta = (jour + 6) % 7; // lundi = 0
  date.setUTCDate(date.getUTCDate() - delta);
  return date;
}

/** Libellé « semaine du JJ/MM/AAAA » à partir d'un lundi. */
export function libelleSemaine(lundi: Date): string {
  const jj = String(lundi.getUTCDate()).padStart(2, "0");
  const mm = String(lundi.getUTCMonth() + 1).padStart(2, "0");
  return `semaine du ${jj}/${mm}/${lundi.getUTCFullYear()}`;
}

// ── Cadence des bilans paramétrable ─────────────────────────────

export type FrequenceBilan = "HEBDO" | "BIMENSUEL" | "MENSUEL";

const MOIS_FR = [
  "janvier", "février", "mars", "avril", "mai", "juin",
  "juillet", "août", "septembre", "octobre", "novembre", "décembre",
];

/** Normalise une valeur libre vers une fréquence connue (défaut : HEBDO). */
export function normFrequence(v: string | null | undefined): FrequenceBilan {
  return v === "BIMENSUEL" || v === "MENSUEL" ? v : "HEBDO";
}

/**
 * Début canonique de la période de bilan contenant `d`, selon la cadence :
 * - HEBDO      → lundi de la semaine ;
 * - BIMENSUEL  → lundi du bloc de 2 semaines (parité de semaine stable) ;
 * - MENSUEL    → 1er jour du mois.
 * Sert de clé unique [alternantId, semaine] du bilan.
 */
export function debutPeriodeBilan(d: Date, frequence: FrequenceBilan): Date {
  if (frequence === "MENSUEL") {
    return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));
  }
  const lundi = lundiDeLaSemaine(d);
  if (frequence === "BIMENSUEL") {
    // Regroupe les semaines par paires stables (indépendamment de « aujourd'hui »).
    const semaines = Math.floor(lundi.getTime() / (7 * 86_400_000));
    if (semaines % 2 !== 0) lundi.setUTCDate(lundi.getUTCDate() - 7);
  }
  return lundi;
}

/** Libellé lisible d'une période de bilan selon la cadence. */
export function libellePeriode(debut: Date, frequence: FrequenceBilan): string {
  if (frequence === "MENSUEL") {
    return `mois de ${MOIS_FR[debut.getUTCMonth()]} ${debut.getUTCFullYear()}`;
  }
  const jj = String(debut.getUTCDate()).padStart(2, "0");
  const mm = String(debut.getUTCMonth() + 1).padStart(2, "0");
  const prefixe = frequence === "BIMENSUEL" ? "quinzaine" : "semaine";
  return `${prefixe} du ${jj}/${mm}/${debut.getUTCFullYear()}`;
}

/** Libellé lisible d'une cadence. */
export function libelleFrequence(frequence: FrequenceBilan): string {
  switch (frequence) {
    case "BIMENSUEL":
      return "Toutes les deux semaines";
    case "MENSUEL":
      return "Mensuel";
    default:
      return "Hebdomadaire";
  }
}
