"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/auth";
import { inviterUtilisateur } from "@/lib/invitations";

const base = "/superadmin/cfa";

function erreur(msg: string): never {
  redirect(`${base}?error=${encodeURIComponent(msg)}`);
}

/** Crée un centre de formation (CFA). */
export async function creerCfa(formData: FormData): Promise<void> {
  await requireSuperAdmin();
  const nom = String(formData.get("nom") ?? "").trim();
  if (!nom) erreur("Nom du CFA requis.");

  await prisma.cfa.create({ data: { nom } });
  revalidatePath(base);
  redirect(`${base}?ok=cfa`);
}

/** Invite un référent CFA rattaché à un centre (rôle CFA_REFERENT). */
export async function inviterReferent(
  cfaId: string,
  formData: FormData,
): Promise<void> {
  await requireSuperAdmin();

  const cfa = await prisma.cfa.findUnique({ where: { id: cfaId }, select: { id: true } });
  if (!cfa) erreur("CFA introuvable.");

  const nom = String(formData.get("nom") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!nom || !email) erreur("Nom et e-mail requis.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) erreur("E-mail invalide.");

  const [userExist, altExist] = await Promise.all([
    prisma.user.findUnique({ where: { email } }),
    prisma.alternant.findUnique({ where: { email } }),
  ]);
  if (userExist || altExist) erreur("Cet e-mail est déjà associé à un compte.");

  await prisma.user.create({
    data: { email, nom, role: "CFA_REFERENT", cfaId },
  });
  const invitation = await inviterUtilisateur(email);

  revalidatePath(base);
  redirect(`${base}?ok=referent${invitation.invited ? "&mail=1" : ""}`);
}

/** Rattache un diplôme (référentiel) à un CFA. */
export async function rattacherReferentiel(
  cfaId: string,
  formData: FormData,
): Promise<void> {
  await requireSuperAdmin();
  const referentielId = String(formData.get("referentielId") ?? "").trim();
  if (!referentielId) erreur("Sélectionnez un diplôme.");

  const [cfa, ref] = await Promise.all([
    prisma.cfa.findUnique({ where: { id: cfaId }, select: { id: true } }),
    prisma.referentiel.findUnique({ where: { id: referentielId }, select: { id: true } }),
  ]);
  if (!cfa || !ref) erreur("CFA ou diplôme introuvable.");

  await prisma.referentiel.update({
    where: { id: referentielId },
    data: { cfaId },
  });
  revalidatePath(base);
  redirect(`${base}?ok=rattache`);
}

/** Détache un diplôme de son CFA. */
export async function detacherReferentiel(referentielId: string): Promise<void> {
  await requireSuperAdmin();
  await prisma.referentiel.update({
    where: { id: referentielId },
    data: { cfaId: null },
  });
  revalidatePath(base);
  redirect(`${base}?ok=detache`);
}
