import { test, type Page } from "@playwright/test";

/**
 * À appeler en tête d'un test qui nécessite un compte réel (connexion,
 * données Prisma). S'appuie sur E2E_BACKEND_OK, positionnée par
 * global-setup.ts UNIQUEMENT si la synchronisation du schéma + le seed ont
 * réellement réussi — la simple présence de DATABASE_URL ne suffit pas (elle
 * peut être une valeur de convenance non joignable). Sans backend réel
 * confirmé, le test est marqué « ignoré » plutôt qu'en échec.
 */
export function skipSiPasDeBackend(): void {
  test.skip(
    process.env.E2E_BACKEND_OK !== "1",
    "Nécessite un backend réel (DATABASE_URL + variables Supabase joignables).",
  );
}

/** Connexion via le formulaire (compte déjà provisionné, e.g. par le seed). */
export async function loginAs(
  page: Page,
  email: string,
  password: string,
): Promise<void> {
  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Mot de passe").fill(password);
  await page.getByRole("button", { name: "Se connecter" }).click();
}
