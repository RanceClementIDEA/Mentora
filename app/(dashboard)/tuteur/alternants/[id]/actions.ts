"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { StatutMission } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { PeriodeSchema, chevaucheRythme, parseRythme } from "@/lib/rythme";

const base = (id: string) => `/tuteur/alternants/${id}`;

/** Vérifie que l'alternant est bien suivi par le tuteur courant. */
async function assertOwned(alternantId: string) {
  const user = await requireRole(["TUTEUR"]);
  const alternant = await prisma.alternant.findUnique({ where: { id: alternantId } });
  if (!alternant || alternant.tuteurId !== user.entityId) {
    // Ne divulgue pas l'existence de la ressource d'un autre tuteur.
    redirect("/tuteur");
  }
  return alternant;
}

/** Ajoute une période au rythme d'alternance. */
export async function ajouterPeriode(
  alternantId: string,
  formData: FormData,
): Promise<void> {
  const alternant = await assertOwned(alternantId);

  const parsed = PeriodeSchema.safeParse({
    debut: String(formData.get("debut") ?? ""),
    fin: String(formData.get("fin") ?? ""),
    type: String(formData.get("type") ?? ""),
  });
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? "Période invalide.";
    redirect(`${base(alternantId)}?error=${encodeURIComponent(msg)}`);
  }

  const rythme = parseRythme(alternant.rythmeAlternance);
  if (chevaucheRythme(rythme, parsed.data)) {
    redirect(
      `${base(alternantId)}?error=${encodeURIComponent(
        "Cette période en chevauche une autre.",
      )}`,
    );
  }

  const next = [...rythme, parsed.data].sort((a, b) => a.debut.localeCompare(b.debut));
  await prisma.alternant.update({
    where: { id: alternantId },
    data: { rythmeAlternance: next },
  });

  revalidatePath(base(alternantId));
  redirect(base(alternantId));
}

/**
 * Ajoute une mission au Kanban de l'alternant (statut « À faire »).
 * Utilisé notamment par l'ajout rapide d'une mission suggérée par l'IA.
 */
export async function ajouterMission(
  alternantId: string,
  formData: FormData,
): Promise<void> {
  const alternant = await assertOwned(alternantId);

  const titre = String(formData.get("titre") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const competenceIdRaw = String(formData.get("competenceId") ?? "").trim();
  const suggereParIA = String(formData.get("suggereParIA") ?? "") === "1";

  if (!titre || !description) {
    redirect(
      `${base(alternantId)}?error=${encodeURIComponent(
        "Titre et description requis.",
      )}`,
    );
  }

  // La compétence, si fournie, doit appartenir au référentiel de l'alternant.
  let competenceId: string | null = null;
  if (competenceIdRaw) {
    const comp = await prisma.competence.findUnique({
      where: { id: competenceIdRaw },
    });
    if (comp && comp.referentielId === alternant.diplomeId) {
      competenceId = comp.id;
    }
  }

  // Échéance optionnelle (AAAA-MM-JJ).
  const echeanceRaw = String(formData.get("echeance") ?? "").trim();
  const echeance = /^\d{4}-\d{2}-\d{2}$/.test(echeanceRaw)
    ? new Date(`${echeanceRaw}T00:00:00.000Z`)
    : null;

  await prisma.mission.create({
    data: {
      titre,
      description,
      statut: StatutMission.A_FAIRE,
      alternantId,
      competenceId,
      suggereParIA,
      echeance,
    },
  });

  revalidatePath(base(alternantId));
  redirect(base(alternantId));
}

/** Vérifie qu'une mission appartient à un alternant suivi par le tuteur courant. */
async function assertMissionOwned(missionId: string) {
  const user = await requireRole(["TUTEUR"]);
  const mission = await prisma.mission.findUnique({
    where: { id: missionId },
    include: { alternant: { select: { id: true, tuteurId: true } } },
  });
  if (!mission || mission.alternant.tuteurId !== user.entityId) {
    redirect("/tuteur");
  }
  return mission;
}

/** Déplace une mission dans une autre colonne du Kanban. */
export async function changerStatutMission(
  missionId: string,
  statut: StatutMission,
): Promise<void> {
  const mission = await assertMissionOwned(missionId);
  await prisma.mission.update({ where: { id: missionId }, data: { statut } });
  revalidatePath(base(mission.alternant.id));
  redirect(base(mission.alternant.id));
}

/** Supprime une mission du Kanban. */
export async function supprimerMission(missionId: string): Promise<void> {
  const mission = await assertMissionOwned(missionId);
  await prisma.mission.delete({ where: { id: missionId } });
  revalidatePath(base(mission.alternant.id));
  redirect(base(mission.alternant.id));
}

/** Valide (en 1 clic) le bilan hebdomadaire d'un alternant suivi. */
export async function validerBilan(bilanId: string): Promise<void> {
  const user = await requireRole(["TUTEUR"]);
  const bilan = await prisma.bilanHebdo.findUnique({
    where: { id: bilanId },
    include: { alternant: { select: { id: true, tuteurId: true } } },
  });
  if (!bilan || bilan.alternant.tuteurId !== user.entityId) {
    redirect("/tuteur");
  }
  await prisma.bilanHebdo.update({
    where: { id: bilanId },
    data: { valideParTuteur: true },
  });
  revalidatePath(base(bilan.alternant.id));
  redirect(base(bilan.alternant.id));
}

/** Enregistre les informations de contrat (échéances légales) d'un alternant. */
export async function enregistrerContrat(
  alternantId: string,
  formData: FormData,
): Promise<void> {
  await assertOwned(alternantId);

  const debutRaw = String(formData.get("dateDebut") ?? "").trim();
  const finRaw = String(formData.get("dateFin") ?? "").trim();
  const opcoRaw = String(formData.get("opco") ?? "").trim();

  const estDate = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s);
  if ((debutRaw && !estDate(debutRaw)) || (finRaw && !estDate(finRaw))) {
    redirect(`${base(alternantId)}?error=${encodeURIComponent("Date invalide.")}`);
  }
  if (debutRaw && finRaw && finRaw < debutRaw) {
    redirect(
      `${base(alternantId)}?error=${encodeURIComponent(
        "La date de fin doit être postérieure à la date de début.",
      )}`,
    );
  }

  await prisma.alternant.update({
    where: { id: alternantId },
    data: {
      dateDebutContrat: debutRaw ? new Date(`${debutRaw}T00:00:00.000Z`) : null,
      dateFinContrat: finRaw ? new Date(`${finRaw}T00:00:00.000Z`) : null,
      opco: opcoRaw || null,
    },
  });

  revalidatePath(base(alternantId));
  redirect(`${base(alternantId)}?contrat=1`);
}

/** Vérifie qu'une action de suivi porte sur un alternant du tuteur courant. */
async function assertActionOwned(actionId: string) {
  const user = await requireRole(["TUTEUR"]);
  const action = await prisma.actionSuivi.findUnique({
    where: { id: actionId },
    include: { alternant: { select: { id: true, tuteurId: true } } },
  });
  if (!action || action.alternant.tuteurId !== user.entityId) {
    redirect("/tuteur");
  }
  return action;
}

/** Ajoute une action au plan de suivi (rebond sur le score de risque). */
export async function ajouterAction(
  alternantId: string,
  formData: FormData,
): Promise<void> {
  await assertOwned(alternantId);
  const titre = String(formData.get("titre") ?? "").trim();
  if (!titre) {
    redirect(
      `${base(alternantId)}?error=${encodeURIComponent("Intitulé de l'action requis.")}`,
    );
  }
  const echeanceRaw = String(formData.get("echeance") ?? "").trim();
  const echeance = /^\d{4}-\d{2}-\d{2}$/.test(echeanceRaw)
    ? new Date(`${echeanceRaw}T00:00:00.000Z`)
    : null;

  await prisma.actionSuivi.create({ data: { alternantId, titre, echeance } });
  revalidatePath(base(alternantId));
  redirect(base(alternantId));
}

/** Marque une action comme faite / à faire. */
export async function basculerAction(actionId: string): Promise<void> {
  const action = await assertActionOwned(actionId);
  await prisma.actionSuivi.update({
    where: { id: actionId },
    data: { fait: !action.fait },
  });
  revalidatePath(base(action.alternant.id));
  redirect(base(action.alternant.id));
}

/** Supprime une action du plan de suivi. */
export async function supprimerAction(actionId: string): Promise<void> {
  const action = await assertActionOwned(actionId);
  await prisma.actionSuivi.delete({ where: { id: actionId } });
  revalidatePath(base(action.alternant.id));
  redirect(base(action.alternant.id));
}

/** Supprime la période à l'index donné. */
export async function supprimerPeriode(
  alternantId: string,
  index: number,
): Promise<void> {
  const alternant = await assertOwned(alternantId);

  const rythme = parseRythme(alternant.rythmeAlternance);
  const next = rythme.filter((_, i) => i !== index);
  await prisma.alternant.update({
    where: { id: alternantId },
    data: { rythmeAlternance: next },
  });

  revalidatePath(base(alternantId));
  redirect(base(alternantId));
}
