import { prisma } from "@/lib/prisma";

/** Modèles de rythme d'une organisation (gabarits réutilisables). */
export function getModelesForOrg(organisationId: string) {
  return prisma.modeleRythme.findMany({
    where: { organisationId },
    orderBy: { nom: "asc" },
    select: { id: true, nom: true, rythme: true, createdAt: true },
  });
}
