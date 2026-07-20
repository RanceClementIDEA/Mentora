"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

/**
 * Envoie un e-mail de réinitialisation de mot de passe. Redirige toujours vers
 * le même message, que le compte existe ou non (évite de révéler si une
 * adresse e-mail est enregistrée).
 */
export async function demanderReinitialisation(formData: FormData): Promise<void> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();

  if (email) {
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${siteUrl()}/auth/callback?next=/reinitialiser-mot-de-passe`,
    });
    if (error) {
      console.error("[mot-de-passe-oublie]", error.message);
    }
  }

  redirect("/mot-de-passe-oublie?envoye=1");
}
