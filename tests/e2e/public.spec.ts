import { expect, test } from "@playwright/test";

/**
 * Pages publiques : ne dépendent d'aucun backend (Prisma/Supabase), donc
 * exécutables et vérifiées dans n'importe quel environnement, y compris sans
 * base de données réelle.
 */

test("la page de connexion affiche le formulaire attendu", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByRole("heading", { name: "Connexion" })).toBeVisible();
  await expect(page.getByLabel("Email")).toBeVisible();
  await expect(page.getByLabel("Mot de passe")).toBeVisible();
  await expect(page.getByRole("button", { name: "Se connecter" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Mot de passe oublié ?" })).toHaveAttribute(
    "href",
    "/mot-de-passe-oublie",
  );
  await expect(page.getByRole("link", { name: "Créer un compte" })).toHaveAttribute(
    "href",
    "/register",
  );
});

test("la page d'inscription affiche le formulaire attendu", async ({ page }) => {
  await page.goto("/register");
  await expect(page.getByRole("heading", { name: "Créer un compte" })).toBeVisible();
  await expect(page.getByLabel("Nom complet")).toBeVisible();
  await expect(page.getByLabel("Nom de votre entreprise")).toBeVisible();
  await expect(page.getByLabel("Email")).toBeVisible();
  const password = page.getByLabel("Mot de passe");
  await expect(password).toHaveAttribute("minlength", "8");
  await expect(page.getByRole("link", { name: "Se connecter" })).toHaveAttribute(
    "href",
    "/login",
  );
});

test("la demande de réinitialisation de mot de passe est accessible", async ({
  page,
}) => {
  await page.goto("/mot-de-passe-oublie");
  await expect(
    page.getByRole("heading", { name: "Mot de passe oublié" }),
  ).toBeVisible();
  await expect(page.getByLabel("Email")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Envoyer le lien de réinitialisation" }),
  ).toBeVisible();
});

test("la réinitialisation du mot de passe exige une session valide", async ({
  page,
}) => {
  // Sans lien e-mail (donc sans session de récupération), on est renvoyé
  // vers la demande plutôt que de pouvoir définir un mot de passe à l'aveugle.
  await page.goto("/reinitialiser-mot-de-passe");
  await expect(page).toHaveURL(/\/mot-de-passe-oublie/);
});

test.describe("pages légales", () => {
  const pages: [string, string][] = [
    ["/mentions-legales", "Mentions légales"],
    ["/confidentialite", "Politique de confidentialité"],
    [
      "/conditions-generales",
      "Conditions générales d'utilisation et de vente",
    ],
  ];

  for (const [href, titre] of pages) {
    test(`${href} affiche « ${titre} »`, async ({ page }) => {
      await page.goto(href);
      await expect(page.getByRole("heading", { name: titre })).toBeVisible();
    });
  }

  test("les trois pages légales sont reliées entre elles", async ({ page }) => {
    await page.goto("/confidentialite");
    await expect(
      page.getByRole("link", { name: "Mentions légales" }),
    ).toHaveAttribute("href", "/mentions-legales");
    await expect(
      page.getByRole("link", { name: "Conditions générales" }),
    ).toHaveAttribute("href", "/conditions-generales");
  });
});
