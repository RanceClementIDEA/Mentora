import { createClient } from "@/lib/supabase/server";

/**
 * Double authentification (TOTP) via Supabase Auth MFA.
 *
 * Dégradation propre : si la MFA n'est pas activée côté projet Supabase ou si
 * l'utilisateur n'a aucun facteur, tout renvoie « inactif / rien à vérifier »
 * et l'application fonctionne normalement.
 */

export interface MfaEtat {
  /** Au moins un facteur TOTP vérifié est enrôlé. */
  actif: boolean;
  /** Session en aal1 alors qu'un facteur exige aal2 → défi à réaliser. */
  doitVerifier: boolean;
}

/** État MFA complet (pour l'écran « Mon compte »). */
export async function getMfaEtat(): Promise<MfaEtat> {
  const supabase = createClient();
  try {
    const [aal, factors] = await Promise.all([
      supabase.auth.mfa.getAuthenticatorAssuranceLevel(),
      supabase.auth.mfa.listFactors(),
    ]);
    const totp = factors.data?.totp ?? [];
    return {
      actif: totp.some((f) => f.status === "verified"),
      doitVerifier:
        aal.data?.currentLevel === "aal1" && aal.data?.nextLevel === "aal2",
    };
  } catch {
    return { actif: false, doitVerifier: false };
  }
}

/** Vrai si la session doit encore franchir le défi TOTP (aal1 → aal2). */
export async function mfaDoitVerifier(): Promise<boolean> {
  const supabase = createClient();
  try {
    const { data } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    return data?.currentLevel === "aal1" && data?.nextLevel === "aal2";
  } catch {
    return false;
  }
}
