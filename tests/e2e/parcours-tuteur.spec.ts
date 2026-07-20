import { expect, test } from "@playwright/test";
import { skipSiPasDeBackend } from "./utils";

/**
 * Parcours critique du tuteur : inscription → ajout d'un alternant → rythme
 * → Kanban → contrat. Nécessite un vrai projet Supabase (DATABASE_URL +
 * variables Supabase pointant dessus) avec la confirmation d'e-mail
 * désactivée (Authentication → Providers → Email → « Confirm email » off) —
 * réglage courant pour un projet de test, distinct de la production.
 *
 * Étapes dépendantes les unes des autres → mode série : si l'inscription
 * échoue, la suite du parcours n'a pas de sens à continuer isolément.
 */
test.describe.serial("parcours tuteur", () => {
  test.beforeEach(() => skipSiPasDeBackend());

  const suffixe = Date.now();
  const email = `e2e-tuteur-${suffixe}@alternpilot.test`;
  const motDePasse = "MotDePasseE2E-2026!";
  const nomAlternant = `Alternant Test ${suffixe}`;
  const emailAlternant = `e2e-alternant-${suffixe}@alternpilot.test`;

  test("inscription crée le compte, l'organisation et ouvre l'espace tuteur", async ({
    page,
  }) => {
    await page.goto("/register");
    await page.getByLabel("Nom complet").fill("Tuteur E2E");
    await page.getByLabel("Nom de votre entreprise").fill(`Entreprise E2E ${suffixe}`);
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Mot de passe").fill(motDePasse);
    await page.getByRole("button", { name: "Créer mon compte" }).click();

    await expect(page).toHaveURL(/\/tuteur$/);
    await expect(page.getByRole("heading", { name: /^Bonjour/ })).toBeVisible();
  });

  test("le tuteur ajoute un alternant", async ({ page }) => {
    await page.goto("/tuteur");
    await page.getByPlaceholder("Nom complet").fill(nomAlternant);
    await page.getByPlaceholder("Email de l'alternant").fill(emailAlternant);
    await page.locator('select[name="diplomeId"]').selectOption({ index: 1 });
    await page.getByRole("button", { name: "Ajouter & inviter" }).click();

    await expect(page).toHaveURL(/\/tuteur\?ajout=1/);
    await expect(page.getByRole("link", { name: nomAlternant })).toBeVisible();
  });

  test("le tuteur configure le rythme et le contrat, puis pilote le Kanban", async ({
    page,
  }) => {
    await page.goto("/tuteur");
    await page.getByRole("link", { name: nomAlternant }).click();
    await expect(page.getByRole("heading", { name: nomAlternant })).toBeVisible();

    // Rythme d'alternance.
    await page.getByLabel("Début").fill("2026-09-01");
    await page.getByLabel("Fin").fill("2026-09-14");
    await page.getByLabel("Type").selectOption("ENTREPRISE");
    await page.getByRole("button", { name: "Ajouter", exact: true }).click();
    await expect(page.getByText("2026-09-01 → 2026-09-14")).toBeVisible();

    // Contrat.
    await page.getByLabel("Début du contrat").fill("2026-09-01");
    await page.getByLabel("Fin du contrat").fill("2027-08-31");
    await page.getByLabel("OPCO").fill("OPCO EP");
    await page.getByRole("button", { name: "Enregistrer le contrat" }).click();
    await expect(page.getByText("Informations de contrat enregistrées.")).toBeVisible();

    // Kanban : ajout puis déplacement d'une mission.
    const titreMission = `Mission E2E ${suffixe}`;
    await page.getByLabel("Nouvelle mission").fill(titreMission);
    await page.getByLabel("Description").fill("Décrite par le test E2E.");
    await page.getByRole("button", { name: "Ajouter la mission" }).click();
    await expect(page.getByText(titreMission)).toBeVisible();

    await page
      .getByRole("button", { name: "Déplacer vers « En cours »" })
      .click();
    // La carte reste visible ; elle est désormais dans la colonne « En cours ».
    await expect(page.getByText(titreMission)).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Déplacer vers « À faire »" }),
    ).toBeVisible();
  });
});
