import { expect, test } from "@playwright/test";

/**
 * Contrôle d'accès : visiter une page du tableau de bord sans session doit
 * toujours renvoyer vers /login — que la protection vienne du middleware
 * (préfixes) ou d'un contrôle en page (requireUser/requireRole). Ce test ne
 * dépend d'aucun backend réel : avec des variables Supabase absentes ou
 * injoignables, `getUser()` échoue proprement et est traité comme « non
 * connecté » (cf. lib/supabase/middleware.ts, lib/auth.ts) — exactement le
 * cas testé ici.
 */

const ROUTES = [
  "/tuteur",
  "/alternant",
  "/admin",
  "/cfa",
  "/superadmin",
  "/2fa",
  "/tableau-de-bord",
  "/mon-compte",
  "/mon-compte/2fa",
  "/onboarding",
  "/admin/membres",
  "/admin/abonnement",
  "/admin/alternants",
  "/admin/referentiels",
  "/admin/modeles-rythme",
  "/superadmin/cfa",
  "/superadmin/journal",
  "/alternant/bilan",
  "/tuteur/alternants/inexistant",
];

for (const route of ROUTES) {
  test(`${route} redirige vers /login sans session`, async ({ page }) => {
    await page.goto(route);
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByRole("heading", { name: "Connexion" })).toBeVisible();
  });
}
