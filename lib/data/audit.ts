import { prisma } from "@/lib/prisma";

export type ActionAudit = "IMPERSONATION_START" | "IMPERSONATION_STOP";

export interface CibleAudit {
  type: "user" | "alternant";
  id: string;
  nom: string;
  organisationId: string | null;
}

/** Enregistre une entrée d'audit (accès sensible du super-admin). */
export async function journaliser(
  action: ActionAudit,
  acteurEmail: string,
  cible: CibleAudit,
): Promise<void> {
  await prisma.auditLog.create({
    data: {
      action,
      acteurEmail,
      cibleType: cible.type,
      cibleId: cible.id,
      cibleNom: cible.nom,
      organisationId: cible.organisationId ?? undefined,
    },
  });
}

/** Journal d'audit, du plus récent au plus ancien. */
export function getJournalAudit(limit = 100) {
  return prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}
