import { expect, test } from "@playwright/test";

/**
 * Comportements côté client, indépendants de tout backend : bascule de
 * thème et validation native des formulaires (attributs `required`).
 */

test("le bouton de thème bascule la classe sombre sur <html>", async ({ page }) => {
  await page.goto("/login");
  const html = page.locator("html");
  const toggle = page.locator('button[aria-label*="thème" i]');
  await expect(toggle).toBeVisible();

  const wasDark = (await html.getAttribute("class"))?.includes("dark") ?? false;
  await toggle.click();

  if (wasDark) {
    await expect(html).not.toHaveClass(/dark/);
  } else {
    await expect(html).toHaveClass(/dark/);
  }
});

test("le formulaire de connexion bloque la soumission si les champs sont vides", async ({
  page,
}) => {
  await page.goto("/login");
  await page.getByRole("button", { name: "Se connecter" }).click();

  // La validation HTML5 (required) empêche la navigation hors de /login.
  await expect(page).toHaveURL(/\/login$/);
  const emailValide = await page
    .getByLabel("Email")
    .evaluate((el: HTMLInputElement) => el.validity.valid);
  expect(emailValide).toBe(false);
});

test("le mot de passe doit contenir au moins 8 caractères à l'inscription", async ({
  page,
}) => {
  await page.goto("/register");
  await page.getByLabel("Nom complet").fill("Camille Dubois");
  await page.getByLabel("Nom de votre entreprise").fill("Menuiserie Dubois");
  await page.getByLabel("Email").fill("camille@exemple.fr");
  await page.getByLabel("Mot de passe").fill("court1");
  await page.getByRole("button", { name: "Créer mon compte" }).click();

  await expect(page).toHaveURL(/\/register$/);
  const motDePasseValide = await page
    .getByLabel("Mot de passe")
    .evaluate((el: HTMLInputElement) => el.validity.valid);
  expect(motDePasseValide).toBe(false);
});
