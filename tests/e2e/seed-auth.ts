import { createClient } from "@supabase/supabase-js";

/**
 * Identifiants déterministes pour les scénarios E2E qui nécessitent une
 * session déjà provisionnée (bilan, validation par le tuteur…). Les comptes
 * créés par prisma/seed.ts n'ont pas de mot de passe Supabase Auth connu :
 * pour ne pas coupler la suite E2E à la remise réelle d'un e-mail
 * d'invitation, on crée/réinitialise ici des comptes Auth déterministes via
 * l'API admin (service_role), pour les adresses déjà seedées par Prisma.
 */
export const MOT_DE_PASSE_TEST = "MotDePasseE2E-2026!";

export const TUTEUR_SEED = {
  email: "tuteur@menuiserie-dubois.fr", // doit correspondre à prisma/seed.ts
  password: MOT_DE_PASSE_TEST,
};

export const ALTERNANT_SEED = {
  email: "lea.moreau@exemple.fr", // doit correspondre à prisma/seed.ts
  password: MOT_DE_PASSE_TEST,
};

/**
 * Crée (ou réinitialise le mot de passe d')un compte Supabase Auth pour un
 * e-mail donné. Idempotent. Nécessite NEXT_PUBLIC_SUPABASE_URL +
 * SUPABASE_SERVICE_ROLE_KEY (jamais exposée au navigateur — utilisée
 * uniquement ici, côté script Node, jamais dans le code de l'application).
 */
export async function seedCompteAuth(email: string, password: string): Promise<void> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont requis pour " +
        "seeder les comptes de test.",
    );
  }

  const admin = createClient(url, serviceKey);
  const { data: liste, error: erreurListe } = await admin.auth.admin.listUsers();
  if (erreurListe) throw erreurListe;

  const existant = liste.users.find((u) => u.email === email);
  if (existant) {
    const { error } = await admin.auth.admin.updateUserById(existant.id, { password });
    if (error) throw error;
    return;
  }

  const { error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (error) throw error;
}

/** Seede les deux comptes utilisés par la suite (tuteur + alternant du seed Prisma). */
export async function seedComptesTest(): Promise<void> {
  await seedCompteAuth(TUTEUR_SEED.email, TUTEUR_SEED.password);
  await seedCompteAuth(ALTERNANT_SEED.email, ALTERNANT_SEED.password);
}
