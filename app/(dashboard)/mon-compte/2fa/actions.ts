"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

/** Valide le code TOTP saisi pendant l'enrôlement et active la 2FA. */
export async function verifierEnrolement(
  factorId: string,
  formData: FormData,
): Promise<void> {
  await requireUser();
  const code = String(formData.get("code") ?? "").trim();
  if (!/^\d{6}$/.test(code)) {
    redirect(
      "/mon-compte/2fa?error=" + encodeURIComponent("Code à 6 chiffres attendu."),
    );
  }

  const supabase = createClient();
  const { data: ch, error: e1 } = await supabase.auth.mfa.challenge({ factorId });
  if (e1 || !ch) {
    redirect("/mon-compte/2fa?error=" + encodeURIComponent("Échec du défi."));
  }
  const { error: e2 } = await supabase.auth.mfa.verify({
    factorId,
    challengeId: ch.id,
    code,
  });
  if (e2) {
    redirect(
      "/mon-compte/2fa?error=" + encodeURIComponent("Code invalide. Réessayez."),
    );
  }

  revalidatePath("/", "layout");
  redirect("/mon-compte?ok=2fa-on");
}

/** Désactive la 2FA (retire tous les facteurs TOTP). Nécessite d'être en aal2. */
export async function desactiver2fa(): Promise<void> {
  await requireUser();
  const supabase = createClient();
  const { data } = await supabase.auth.mfa.listFactors();
  for (const f of data?.all ?? []) {
    if (f.factor_type === "totp") {
      await supabase.auth.mfa.unenroll({ factorId: f.id });
    }
  }
  revalidatePath("/", "layout");
  redirect("/mon-compte?ok=2fa-off");
}
