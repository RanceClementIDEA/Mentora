import { execSync } from "node:child_process";
import { seedComptesTest } from "./seed-auth";

/**
 * Préparation avant la suite E2E.
 *
 * DATABASE_URL peut être présente sans pointer vers une base réellement
 * joignable (ex. valeur de convenance utilisée pour permettre au build de
 * démarrer) : sa seule présence ne prouve rien. On tente donc pour de vrai
 * la synchronisation du schéma + le seed, et on ne considère le backend
 * comme disponible (E2E_BACKEND_OK, lu par `skipSiPasDeBackend` dans
 * utils.ts) que si cette étape réussit réellement — sinon les scénarios
 * dépendant d'un compte connecté s'ignorent, et seules les pages publiques /
 * redirections restent testées.
 */
export default async function globalSetup(): Promise<void> {
  if (!process.env.DATABASE_URL) {
    avertirBackendIndisponible("DATABASE_URL absente");
    return;
  }

  try {
    execSync("npx prisma db push --skip-generate --accept-data-loss", {
      stdio: "pipe",
      timeout: 15_000,
    });
    execSync("npx tsx prisma/seed.ts", { stdio: "pipe", timeout: 15_000 });
  } catch (e) {
    avertirBackendIndisponible(
      e instanceof Error ? e.message.split("\n")[0] : "erreur inconnue",
    );
    return;
  }

  // Preuve réelle de connectivité (pas seulement la présence de la variable) :
  // héritée par les workers, spawnés après la fin de globalSetup (doc Playwright).
  process.env.E2E_BACKEND_OK = "1";

  // Comptes tuteur/alternant de test (best-effort : ne bloque pas la suite
  // si la clé service_role n'est pas fournie — les scénarios « bilan »
  // s'ignorent alors via skipSiPasDeBackend).
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      await seedComptesTest();
    } catch (e) {
      console.warn(
        "[e2e] Échec de la création des comptes de test :",
        e instanceof Error ? e.message : e,
      );
    }
  }
}

function avertirBackendIndisponible(raison: string): void {
  console.warn(
    `\n[e2e] Backend réel indisponible (${raison}) : seuls les scénarios ` +
      "indépendants du backend (pages publiques, redirections, comportement " +
      "client) s'exécuteront. Renseignez DATABASE_URL/DIRECT_URL et les " +
      "variables Supabase vers un vrai projet pour lancer la suite complète.\n",
  );
}
