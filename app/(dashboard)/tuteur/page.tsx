import Link from "next/link";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { getAlternantsForTuteur, tuteurAUneMission } from "@/lib/data/alternants";
import { getNotificationsForUser } from "@/lib/data/notifications";
import { etatAbonnement } from "@/lib/data/abonnement";
import { getReferentiels } from "@/lib/data/referentiels";
import { risquesForTuteur } from "@/lib/data/risque";
import { placesGratuitesRestantes } from "@/lib/abonnement";
import { parseRythme, typeForDate } from "@/lib/rythme";
import { RisqueBadge } from "@/components/risque/risque-badge";
import { StatusPill, type PillTone } from "@/components/status-pill";
import { Checklist, type EtapeChecklist } from "@/components/onboarding/checklist";
import { ajouterAlternantTuteur } from "./actions";

export const metadata = { title: "Espace tuteur · AlternPilot" };

const CANAL_LABEL: Record<string, string> = {
  EMAIL: "E-mail",
  SMS: "SMS",
  WHATSAPP: "WhatsApp",
};

function formatDate(d: Date): string {
  const jj = String(d.getUTCDate()).padStart(2, "0");
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  return `${jj}/${mm}/${d.getUTCFullYear()}`;
}

export default async function TuteurPage({
  searchParams,
}: {
  searchParams: { error?: string; ajout?: string; invite?: string };
}) {
  const user = await requireRole(["TUTEUR"]);
  if (!user.organisationId) redirect("/onboarding");

  const today = new Date().toISOString().slice(0, 10);
  const [alternants, notifications, etat, referentiels, risques, aMission] =
    await Promise.all([
      getAlternantsForTuteur(user.entityId!),
      getNotificationsForUser(user.entityId!),
      etatAbonnement(user.organisationId),
      getReferentiels(),
      risquesForTuteur(user.entityId!, today),
      tuteurAUneMission(user.entityId!),
    ]);

  // Onboarding : étapes de démarrage, calculées sur les données réelles.
  const aAlternant = alternants.length > 0;
  const aRythme = alternants.some(
    (a) => parseRythme(a.rythmeAlternance).length > 0,
  );
  const premierAlternant = alternants[0]?.id;
  const etapes: EtapeChecklist[] = [
    { label: "Créer votre entreprise", done: true },
    {
      label: "Ajouter votre premier alternant",
      hint: "Renseignez son nom, son e-mail et son diplôme.",
      done: aAlternant,
      href: "#ajouter-alternant",
      hrefLabel: "Ajouter",
    },
    {
      label: "Saisir un rythme d'alternance",
      hint: aAlternant
        ? "Ouvrez la fiche d'un alternant et ajoutez ses périodes."
        : "Disponible après l'ajout d'un alternant.",
      done: aRythme,
      href: premierAlternant ? `/tuteur/alternants/${premierAlternant}` : undefined,
      hrefLabel: "Ouvrir",
    },
    {
      label: "Créer une première mission",
      hint: aAlternant
        ? "Dans le Kanban de l'alternant, ajoutez une mission."
        : "Disponible après l'ajout d'un alternant.",
      done: aMission,
      href: premierAlternant ? `/tuteur/alternants/${premierAlternant}` : undefined,
      hrefLabel: "Ouvrir",
    },
  ];
  const onboardingTermine = etapes.every((e) => e.done);

  const inputClass =
    "w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring";

  return (
    <div>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Bonjour {user.nom}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {etat.actif
              ? "Abonnement actif."
              : `Offre gratuite : ${placesGratuitesRestantes(etat.nbAlternants)} place(s) restante(s).`}
          </p>
        </div>
      </div>

      {searchParams.ajout && (
        <p className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200">
          Alternant ajouté.{" "}
          {searchParams.invite
            ? "Une invitation lui a été envoyée par e-mail."
            : "Pensez à lui créer un accès pour qu'il se connecte."}
        </p>
      )}
      {searchParams.error && (
        <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200">
          {searchParams.error}
        </p>
      )}

      {!onboardingTermine && (
        <div className="mt-6">
          <Checklist etapes={etapes} />
        </div>
      )}

      {notifications.length > 0 && (
        <section className="mt-6 rounded-2xl border bg-card p-5 shadow-soft">
          <h2 className="text-sm font-semibold text-foreground">Alertes récentes</h2>
          <ul className="mt-3 space-y-2">
            {notifications.map((n) => (
              <li
                key={n.id}
                className="flex items-start gap-3 rounded-xl bg-muted px-3 py-2 text-sm"
              >
                <span className="mt-0.5 shrink-0">
                  <StatusPill tone="neutral">
                    {CANAL_LABEL[n.canal] ?? n.canal}
                  </StatusPill>
                </span>
                <span className="flex-1 text-foreground">{n.contenu}</span>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {formatDate(n.envoyeLe)}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <h2 className="mt-8 text-sm font-semibold text-foreground">Mes alternants</h2>
      {alternants.length === 0 ? (
        <div className="mt-3 rounded-2xl border border-dashed bg-card p-8 text-center text-sm text-muted-foreground">
          Aucun alternant pour l&apos;instant — ajoutez-en un ci-dessous.
        </div>
      ) : (
        <ul className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {alternants.map((a) => {
            const rythme = parseRythme(a.rythmeAlternance);
            const typeAuj = typeForDate(rythme, today);
            const statutLabel =
              typeAuj === "ECOLE"
                ? "École / CFA"
                : typeAuj === "ENTREPRISE"
                  ? "Entreprise"
                  : rythme.length === 0
                    ? "Rythme non saisi"
                    : "Hors période";
            const statutTone: PillTone =
              typeAuj === "ECOLE" ? "info" : typeAuj === "ENTREPRISE" ? "good" : "neutral";
            const risque = risques.get(a.id);
            return (
              <li key={a.id}>
                <Link
                  href={`/tuteur/alternants/${a.id}`}
                  className="block rounded-2xl border bg-card p-5 shadow-soft transition-colors hover:border-primary/50"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="text-sm font-semibold text-foreground">{a.nom}</div>
                    {risque && <RisqueBadge risque={risque} />}
                  </div>
                  <div className="mt-0.5 text-xs text-muted-foreground">
                    {a.diplome.nom}
                  </div>
                  <div className="mt-3">
                    <StatusPill tone={statutTone}>{statutLabel}</StatusPill>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      {/* Ajout d'un alternant (soumis au quota freemium). */}
      {etat.peutAjouter ? (
        <form
          id="ajouter-alternant"
          action={ajouterAlternantTuteur}
          className="mt-6 grid scroll-mt-24 gap-3 rounded-2xl border bg-card p-5 sm:grid-cols-2"
        >
          <div className="text-sm font-semibold text-foreground sm:col-span-2">
            Ajouter un alternant
          </div>
          <input name="nom" required placeholder="Nom complet" className={inputClass} />
          <input
            name="email"
            type="email"
            required
            placeholder="Email de l'alternant"
            className={inputClass}
          />
          <select name="diplomeId" required defaultValue="" className={inputClass}>
            <option value="" disabled>
              Diplôme préparé…
            </option>
            {referentiels.map((r) => (
              <option key={r.id} value={r.id}>
                {r.nom}
              </option>
            ))}
          </select>
          <div className="sm:col-span-2">
            <button
              type="submit"
              className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              Ajouter &amp; inviter
            </button>
            <p className="mt-2 text-xs text-muted-foreground">
              L&apos;alternant reçoit un e-mail pour créer son mot de passe.
            </p>
          </div>
        </form>
      ) : (
        <div className="mt-6 rounded-2xl border border-dashed bg-card p-6 text-center">
          <p className="text-sm text-foreground">
            Vous avez atteint la limite de l&apos;offre gratuite.
          </p>
          <Link
            href="/admin/abonnement"
            className="mt-3 inline-block rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            Passer à l&apos;offre payante
          </Link>
        </div>
      )}
    </div>
  );
}
