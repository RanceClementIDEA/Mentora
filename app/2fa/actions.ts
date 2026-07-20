"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getAppUser, homePathForUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

/** Vérifie le code TOTP à la connexion et élève la session en aal2. */
export async function verifier2fa(formData: FormData): Promise<void> {
  const user = await getAppUser();
  if (!user) redirect("/login");

  const code = String(formData.get("code") ?? "").trim();
  if (!/^\d{6}$/.test(code)) {
    redirect("/2fa?error=" + encodeURIComponent("Code à 6 chiffres attendu."));
  }

  const supabase = createClient();
  const { data: liste } = await supabase.auth.mfa.listFactors();
  const factor = (liste?.totp ?? []).find((f) => f.status === "verified");
  if (!factor) {
    // Aucun facteur : rien à vérifier, on laisse passer.
    redirect(homePathForUser(user));
  }

  const { data: ch, error: e1 } = await supabase.auth.mfa.challenge({
    factorId: factor.id,
  });
  if (e1 || !ch) {
    redirect("/2fa?error=" + encodeURIComponent("Échec du défi. Réessayez."));
  }
  const { error: e2 } = await supabase.auth.mfa.verify({
    factorId: factor.id,
    challengeId: ch.id,
    code,
  });
  if (e2) {
    redirect("/2fa?error=" + encodeURIComponent("Code invalide. Réessayez."));
  }

  revalidatePath("/", "layout");
  const rafraichi = await getAppUser();
  redirect(rafraichi ? homePathForUser(rafraichi) : "/login");
}
