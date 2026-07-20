"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";

const base = "/admin/modeles-rythme";

/** Supprime un modèle de rythme de l'organisation. */
export async function supprimerModele(modeleId: string): Promise<void> {
  const user = await requireRole(["ADMIN"]);
  if (!user.organisationId) redirect(base);

  // Isolation : ne supprime qu'un modèle de sa propre organisation.
  const modele = await prisma.modeleRythme.findFirst({
    where: { id: modeleId, organisationId: user.organisationId },
    select: { id: true },
  });
  if (modele) {
    await prisma.modeleRythme.delete({ where: { id: modele.id } });
  }
  revalidatePath(base);
  redirect(`${base}?ok=1`);
}
