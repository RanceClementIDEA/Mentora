"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { dashboardPathForRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import {
  IMPERSONATION_COOKIE,
  estSuperAdmin,
  lireImpersonation,
} from "@/lib/superadmin";
import { journaliser, type CibleAudit } from "@/lib/data/audit";

/** E-mail authentifié réel (jamais l'identité empruntée), si super-admin. */
async function acteurSuperAdmin(): Promise<string | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.email && estSuperAdmin(user.email) ? user.email : null;
}

/**
 * Bascule vers l'identité d'un `User` ou d'un `Alternant` et ouvre son portail.
 * Journalise l'accès (audit) et notifie l'entité consultée (transparence).
 */
export async function impersonner(
  k: "user" | "alternant",
  id: string,
): Promise<void> {
  const acteurEmail = await acteurSuperAdmin();
  if (!acteurEmail) redirect("/");

  let destination: string;
  let cible: CibleAudit;
  let notifierUserId: string | null = null;

  if (k === "user") {
    const u = await prisma.user.findUnique({
      where: { id },
      select: { role: true, nom: true, organisationId: true },
    });
    if (!u) redirect("/superadmin?error=introuvable");
    destination = dashboardPathForRole(u.role);
    cible = { type: "user", id, nom: u.nom, organisationId: u.organisationId };
    notifierUserId = id; // on informe la personne consultée
  } else {
    const a = await prisma.alternant.findUnique({
      where: { id },
      select: { nom: true, organisationId: true, tuteurId: true },
    });
    if (!a) redirect("/superadmin?error=introuvable");
    destination = "/alternant";
    cible = { type: "alternant", id, nom: a.nom, organisationId: a.organisationId };
    notifierUserId = a.tuteurId; // on informe le tuteur
  }

  await journaliser("IMPERSONATION_START", acteurEmail, cible);

  // Transparence : trace in-app pour l'entité consultée (sans e-mail).
  if (notifierUserId) {
    await prisma.notification.create({
      data: {
        userId: notifierUserId,
        contenu: `L'espace « ${cible.nom} » a été consulté par le support (${acteurEmail}) en mode administrateur.`,
      },
    });
  }

  cookies().set(IMPERSONATION_COOKIE, JSON.stringify({ k, id }), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8, // 8 h
  });
  revalidatePath("/", "layout");
  redirect(destination);
}

/** Met fin à la bascule (journalisée) et revient au tableau de bord super-admin. */
export async function arreterImpersonation(): Promise<void> {
  const acteurEmail = await acteurSuperAdmin();
  const imp = lireImpersonation();

  if (acteurEmail && imp) {
    const cible =
      imp.k === "user"
        ? await prisma.user.findUnique({
            where: { id: imp.id },
            select: { nom: true, organisationId: true },
          })
        : await prisma.alternant.findUnique({
            where: { id: imp.id },
            select: { nom: true, organisationId: true },
          });
    await journaliser("IMPERSONATION_STOP", acteurEmail, {
      type: imp.k,
      id: imp.id,
      nom: cible?.nom ?? "",
      organisationId: cible?.organisationId ?? null,
    });
  }

  cookies().delete(IMPERSONATION_COOKIE);
  revalidatePath("/", "layout");
  redirect("/superadmin");
}
