"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { dashboardPathForRole, getAppUser } from "@/lib/auth";

function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

/** Connexion e-mail / mot de passe. */
export async function signIn(formData: FormData): Promise<void> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    redirect("/login?error=" + encodeURIComponent("Email et mot de passe requis."));
  }

  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    redirect("/login?error=" + encodeURIComponent("Identifiants invalides."));
  }

  const user = await getAppUser();
  revalidatePath("/", "layout");
  redirect(dashboardPathForRole(user?.role ?? null));
}

/**
 * Inscription self-serve. Volontairement limitée au rôle TUTEUR (le maître
 * d'apprentissage) : ADMIN et CFA_REFERENT sont attribués hors de ce parcours
 * pour éviter toute élévation de privilège via le formulaire public.
 */
export async function signUp(formData: FormData): Promise<void> {
  const nom = String(formData.get("nom") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!nom || !email || !password) {
    redirect("/register?error=" + encodeURIComponent("Tous les champs sont requis."));
  }
  if (password.length < 8) {
    redirect(
      "/register?error=" +
        encodeURIComponent("Le mot de passe doit contenir au moins 8 caractères."),
    );
  }

  const supabase = createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { nom, role: "TUTEUR" },
      emailRedirectTo: `${siteUrl()}/auth/callback`,
    },
  });
  if (error) {
    redirect("/register?error=" + encodeURIComponent(error.message));
  }

  // Provisionne la fiche `User` via Prisma (connexion directe à la base :
  // indépendante de la confirmation e-mail). Idempotent par e-mail.
  await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email, nom, role: "TUTEUR" },
  });

  // Confirmation e-mail désactivée → session immédiate ; sinon on invite à confirmer.
  if (data.session) {
    revalidatePath("/", "layout");
    redirect("/tuteur");
  }
  redirect("/login?checkEmail=1");
}

/** Déconnexion. */
export async function signOut(): Promise<void> {
  const supabase = createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
