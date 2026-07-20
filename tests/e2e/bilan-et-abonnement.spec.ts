import { expect, test } from "@playwright/test";
import { skipSiPasDeBackend, loginAs } from "./utils";
import { ALTERNANT_SEED, TUTEUR_SEED } from "./seed-auth";

/**
 * Bilan hebdomadaire (soumission par l'alternant, validation par le tuteur)
 * et mur de paiement freemium. Utilise les comptes du seed Prisma
 * (prisma/seed.ts), avec des mots de passe Supabase Auth déterministes
 * créés par global-setup.ts (voir seed-auth.ts). Nécessite un vrai projet
 * Supabase avec confirmation d'e-mail désactivée.
 */
test.describe.serial("bilan hebdomadaire", () => {
  test.beforeEach(() => skipSiPasDeBackend());

  test("l'alternant soumet son bilan de la semaine", async ({ page }) => {
    await loginAs(page, ALTERNANT_SEED.email, ALTERNANT_SEED.password);
    await page.goto("/alternant/bilan");

    const reussites = "Prise de cotes en autonomie (test E2E).";
    await page.getByLabel("Réussites de la semaine").fill(reussites);
    await page.getByLabel("Difficultés rencontrées").fill("Réglage machine (test E2E).");
    await page
      .getByRole("button", { name: "Enregistrer mon bilan" })
      .click();

    await expect(page).toHaveURL(/\/alternant\/bilan$/);
    await expect(page.getByLabel("Réussites de la semaine")).toHaveValue(reussites);
  });

  test("le tuteur valide le bilan de l'alternant", async ({ page }) => {
    await loginAs(page, TUTEUR_SEED.email, TUTEUR_SEED.password);
    await page.goto("/tuteur");
    await page.getByRole("link", { name: "Léa Moreau" }).click();

    await page.getByRole("button", { name: "Valider" }).first().click();
    await expect(page.getByText("Validé").first()).toBeVisible();
  });
});

test.describe("mur de paiement freemium", () => {
  test.beforeEach(() => skipSiPasDeBackend());

  test("s'affiche une fois la limite gratuite atteinte", async ({ page }) => {
    // Le tuteur du seed suit déjà 2 alternants (limite gratuite = 1).
    await loginAs(page, TUTEUR_SEED.email, TUTEUR_SEED.password);
    await page.goto("/tuteur");

    await expect(
      page.getByText("Vous avez atteint la limite de l'offre gratuite."),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Passer à l'offre payante" }),
    ).toHaveAttribute("href", "/admin/abonnement");
  });
});
