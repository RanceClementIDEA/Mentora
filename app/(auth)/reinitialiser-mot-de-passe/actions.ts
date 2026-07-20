"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getAppUser, homePathForUser } from "@/lib/auth";

const base = "/reinitialiser-mot-de-passe";

/**
 * Définit le nouveau mot de passe. Nécessite la session de récupération
 * établie par le lien e-mail (via /auth/callback) — sans elle, on ne sait pas
 * pour quel compte agir.
 */
export async function definirNouveauMotDePasse(formData: FormData): Promise<void> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect(
      "/mot-de-passe-oublie?error=" +
        encodeURIComponent("Lien invalide ou expiré. Recommencez la demande."),
    );
  }

  const password = String(formData.get("password") ?? "");
  const confirmation = String(formData.get("confirmation") ?? "");

  if (password.length < 8) {
    redirect(
      `${base}?error=` +
        encodeURIComponent("Le mot de passe doit contenir au moins 8 caractères."),
    );
  }
  if (password !== confirmation) {
    redirect(
      `${base}?error=` +
        encodeURIComponent("Les deux mots de passe ne correspondent pas."),
    );
  }

  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    redirect(
      `${base}?error=` + encodeURIComponent("Échec de la mise à jour. Réessayez."),
    );
  }

  revalidatePath("/", "layout");
  const appUser = await getAppUser();
  redirect(appUser ? homePathForUser(appUser) : "/login");
}
