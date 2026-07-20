import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { getAlternantOwnedByTuteur } from "@/lib/data/alternants";
import { prisma } from "@/lib/prisma";
import { nbJours, parseRythme } from "@/lib/rythme";
import { libelleFrequence, libellePeriode, normFrequence } from "@/lib/semaine";
import { CalendrierAlternance } from "@/components/calendrier/calendrier-alternance";
import { GenererResume } from "@/components/bilan/generer-resume";
import { RisqueCard } from "@/components/risque/risque-badge";
import { risqueAlternant } from "@/lib/data/risque";
import { getModelesForOrg } from "@/lib/data/modeles";
import { echeancesContrat } from "@/lib/contrat";
import {
  ajouterAction,
  ajouterMission,
  ajouterPeriode,
  appliquerModele,
  basculerAction,
  changerFrequenceBilan,
  enregistrerContrat,
  enregistrerModele,
  supprimerAction,
  supprimerPeriode,
  validerBilan,
} from "./actions";
import { MissionBoard } from "./mission-board";
import { SuggestionsIA } from "./suggestions-ia";

export const metadata = { title: "Calendrier de l'alternant · AlternPilot" };

export default async function AlternantDetailPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { error?: string; contrat?: string; modele?: string };
}) {
  const user = await requireRole(["TUTEUR"]);
  const alternant = await getAlternantOwnedByTuteur(params.id, user.entityId!);
  if (!alternant) notFound();

  const rythme = parseRythme(alternant.rythmeAlternance);
  const today = new Date().toISOString().slice(0, 10);

  const debutIso = alternant.dateDebutContrat?.toISOString().slice(0, 10) ?? "";
  const finIso = alternant.dateFinContrat?.toISOString().slice(0, 10) ?? "";
  const echeances = echeancesContrat({ debutIso, finIso }, today);

  const missions = await prisma.mission.findMany({
    where: { alternantId: alternant.id },
    orderBy: { createdAt: "asc" },
  });

  const bilans = await prisma.bilanHebdo.findMany({
    where: { alternantId: alternant.id },
    orderBy: { semaine: "desc" },
    take: 8,
  });

  const risque = await risqueAlternant(alternant.id, today);
  const frequence = normFrequence(alternant.frequenceBilan);
  const modeles = await getModelesForOrg(alternant.organisationId);

  const actions = await prisma.actionSuivi.findMany({
    where: { alternantId: alternant.id },
    orderBy: [{ fait: "asc" }, { createdAt: "asc" }],
  });

  const inputClass =
    "w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring";

  return (
    <div>
      <Link href="/tuteur" className="text-sm text-primary hover:underline">
        ← Mes alternants
      </Link>

      <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-foreground">{alternant.nom}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{alternant.diplome.nom}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/tuteur/alternants/${alternant.id}/fiche-navette`}
            className="rounded-xl border px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Fiche navette (PDF)
          </Link>
          <a
            href={`/api/alternants/${alternant.id}/calendrier`}
            className="rounded-xl border px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Ajouter au calendrier (.ics)
          </a>
        </div>
      </div>

      <section className="mt-4">
        <RisqueCard risque={risque} />
      </section>

      {/* Plan d'action : suite concrète donnée au score de risque. */}
      <section className="mt-4 rounded-2xl border bg-card p-5 shadow-soft">
        <h2 className="text-sm font-semibold text-foreground">Plan d&apos;action</h2>
        {risque.niveau !== "FAIBLE" &&
          actions.filter((a) => !a.fait).length === 0 && (
            <p className="mt-1 text-sm text-amber-800 dark:text-amber-200">
              Cet alternant est à surveiller : consignez au moins une action de
              suivi.
            </p>
          )}

        {actions.length > 0 && (
          <ul className="mt-3 space-y-2">
            {actions.map((a) => (
              <li
                key={a.id}
                className="flex items-center gap-3 rounded-xl border bg-background px-3 py-2"
              >
                <form action={basculerAction.bind(null, a.id)}>
                  <button
                    type="submit"
                    aria-label={a.fait ? "Marquer à faire" : "Marquer fait"}
                    className={`flex h-5 w-5 items-center justify-center rounded border text-xs ${
                      a.fait
                        ? "border-emerald-500 bg-emerald-500 text-white"
                        : "border-muted-foreground/40 text-transparent hover:border-primary"
                    }`}
                  >
                    ✓
                  </button>
                </form>
                <span
                  className={`flex-1 text-sm ${
                    a.fait
                      ? "text-muted-foreground line-through"
                      : "text-foreground"
                  }`}
                >
                  {a.titre}
                  {a.echeance && (
                    <span className="ml-2 text-xs text-muted-foreground">
                      · pour le {a.echeance.toISOString().slice(0, 10)}
                    </span>
                  )}
                </span>
                <form action={supprimerAction.bind(null, a.id)}>
                  <button
                    type="submit"
                    aria-label="Supprimer l'action"
                    className="rounded-md px-1.5 py-0.5 text-xs text-red-600 transition-colors hover:bg-red-50 dark:hover:bg-red-500/15"
                  >
                    <span aria-hidden>✕</span>
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}

        <form
          action={ajouterAction.bind(null, alternant.id)}
          className="mt-3 flex flex-wrap items-end gap-2"
        >
          <label className="flex-1">
            <span className="mb-1 block text-xs font-medium text-foreground">
              Nouvelle action
            </span>
            <input
              name="titre"
              required
              placeholder="ex. Programmer un point individuel"
              className={inputClass}
            />
          </label>
          <label>
            <span className="mb-1 block text-xs font-medium text-foreground">
              Échéance (option.)
            </span>
            <input type="date" name="echeance" className={inputClass} />
          </label>
          <button
            type="submit"
            className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            Ajouter
          </button>
        </form>
      </section>

      {searchParams.contrat && (
        <p className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200">
          Informations de contrat enregistrées.
        </p>
      )}
      {searchParams.modele && (
        <p className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200">
          {searchParams.modele === "applique"
            ? "Modèle de rythme appliqué."
            : "Rythme enregistré comme modèle."}
        </p>
      )}
      {searchParams.error && (
        <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {searchParams.error}
        </p>
      )}

      {/* Conformité administrative : échéances légales du contrat. */}
      <section className="mt-6 rounded-2xl border bg-card p-5 shadow-soft">
        <h2 className="text-sm font-semibold text-foreground">
          Contrat &amp; échéances légales
        </h2>
        <form
          action={enregistrerContrat.bind(null, alternant.id)}
          className="mt-3 grid gap-3 sm:grid-cols-3"
        >
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-foreground">
              Début du contrat
            </span>
            <input
              type="date"
              name="dateDebut"
              defaultValue={debutIso}
              className={inputClass}
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-foreground">
              Fin du contrat
            </span>
            <input
              type="date"
              name="dateFin"
              defaultValue={finIso}
              className={inputClass}
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-foreground">
              OPCO
            </span>
            <input
              type="text"
              name="opco"
              defaultValue={alternant.opco ?? ""}
              placeholder="ex. OPCO EP"
              className={inputClass}
            />
          </label>
          <div className="sm:col-span-3">
            <button
              type="submit"
              className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              Enregistrer le contrat
            </button>
          </div>
        </form>

        {echeances.length > 0 && (
          <ul className="mt-4 space-y-2">
            {echeances.map((e) => {
              const enRetard = e.joursRestants < 0;
              const proche = !enRetard && e.joursRestants <= 30;
              const libelle =
                e.type === "PERIODE_PROBATOIRE"
                  ? "Fin de période probatoire (45 j)"
                  : "Fin de contrat";
              const info = enRetard
                ? "échéance passée"
                : `dans ${e.joursRestants} j`;
              return (
                <li
                  key={e.type}
                  className={`flex items-center justify-between gap-3 rounded-xl border px-3 py-2 text-sm ${
                    enRetard
                      ? "border-red-200 bg-red-50/60 text-red-800 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200"
                      : proche
                        ? "border-amber-200 bg-amber-50/60 text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100"
                        : "bg-muted text-foreground"
                  }`}
                >
                  <span className="font-medium">{libelle}</span>
                  <span>
                    {e.dateIso}{" "}
                    <span className="text-xs opacity-80">({info})</span>
                  </span>
                </li>
              );
            })}
          </ul>
        )}
        <p className="mt-3 text-xs text-muted-foreground">
          Des rappels automatiques sont envoyés à l&apos;approche de la fin de
          période probatoire (7 j) et de la fin de contrat (30 j).
        </p>
      </section>

      <section className="mt-6">
        <h2 className="mb-3 text-sm font-semibold text-foreground">
          Calendrier d&apos;alternance
        </h2>
        <CalendrierAlternance rythme={rythme} refIso={today} today={today} />
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* Liste des périodes */}
        <div>
          <h2 className="mb-3 text-sm font-semibold text-foreground">Périodes saisies</h2>
          {rythme.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucune période.</p>
          ) : (
            <ul className="space-y-2">
              {rythme.map((p, i) => (
                <li
                  key={`${p.debut}-${p.fin}`}
                  className="flex items-center justify-between gap-3 rounded-xl border bg-card px-4 py-2.5"
                >
                  <div className="text-sm">
                    <span
                      className={`mr-2 inline-block rounded px-2 py-0.5 text-xs font-medium ${
                        p.type === "ECOLE"
                          ? "bg-sky-100 text-sky-900"
                          : "bg-emerald-100 text-emerald-900"
                      }`}
                    >
                      {p.type === "ECOLE" ? "École / CFA" : "Entreprise"}
                    </span>
                    <span className="text-foreground">
                      {p.debut} → {p.fin}
                    </span>
                    <span className="ml-2 text-xs text-muted-foreground">
                      ({nbJours(p)} j)
                    </span>
                  </div>
                  <form action={supprimerPeriode.bind(null, alternant.id, i)}>
                    <button
                      type="submit"
                      className="rounded-lg px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                    >
                      Supprimer
                    </button>
                  </form>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Ajout d'une période */}
        <div>
          <h2 className="mb-3 text-sm font-semibold text-foreground">Ajouter une période</h2>
          <form
            action={ajouterPeriode.bind(null, alternant.id)}
            className="space-y-3 rounded-2xl border bg-card p-4"
          >
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-foreground">Début</span>
              <input type="date" name="debut" required className={inputClass} />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-foreground">Fin</span>
              <input type="date" name="fin" required className={inputClass} />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-foreground">Type</span>
              <select name="type" required className={inputClass} defaultValue="ENTREPRISE">
                <option value="ENTREPRISE">Entreprise</option>
                <option value="ECOLE">École / CFA</option>
              </select>
            </label>
            <button
              type="submit"
              className="w-full rounded-xl bg-primary py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              Ajouter
            </button>
          </form>
        </div>
      </section>

      {/* Modèles de rythme réutilisables (gain de temps par promotion/CFA). */}
      <section className="mt-8 rounded-2xl border bg-card p-5 shadow-soft">
        <h2 className="text-sm font-semibold text-foreground">
          Modèles de rythme
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Réutilisez un rythme type en un clic, ou enregistrez le rythme actuel
          comme modèle pour vos autres alternants.
        </p>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <form
            action={appliquerModele.bind(null, alternant.id)}
            className="flex flex-wrap items-end gap-2"
          >
            <label className="flex-1">
              <span className="mb-1 block text-xs font-medium text-foreground">
                Appliquer un modèle
              </span>
              <select
                name="modeleId"
                defaultValue=""
                required
                className={inputClass}
              >
                <option value="" disabled>
                  {modeles.length === 0 ? "Aucun modèle" : "Choisir un modèle…"}
                </option>
                {modeles.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nom} ({parseRythme(m.rythme).length} période(s))
                  </option>
                ))}
              </select>
            </label>
            <button
              type="submit"
              disabled={modeles.length === 0}
              className="rounded-xl border px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent disabled:opacity-50"
            >
              Appliquer
            </button>
          </form>

          <form
            action={enregistrerModele.bind(null, alternant.id)}
            className="flex flex-wrap items-end gap-2"
          >
            <label className="flex-1">
              <span className="mb-1 block text-xs font-medium text-foreground">
                Enregistrer le rythme actuel
              </span>
              <input
                name="nom"
                required
                placeholder="ex. Promo BTS 2026 — 3 sem./1 sem."
                className={inputClass}
              />
            </label>
            <button
              type="submit"
              className="rounded-xl border px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
            >
              Enregistrer
            </button>
          </form>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Appliquer un modèle remplace le rythme actuel de cet alternant.
        </p>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">
              Kanban des missions
            </h2>
          </div>

          <MissionBoard missions={missions} today={today} />

          {/* Ajout manuel d'une mission (colonne « À faire »). */}
          <form
            action={ajouterMission.bind(null, alternant.id)}
            className="mt-4 grid gap-3 rounded-2xl border bg-card p-4 sm:grid-cols-2"
          >
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-foreground">
                Nouvelle mission
              </span>
              <input
                type="text"
                name="titre"
                required
                placeholder="Titre"
                className={inputClass}
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-foreground">
                Échéance (optionnelle)
              </span>
              <input type="date" name="echeance" className={inputClass} />
            </label>
            <label className="block sm:col-span-2">
              <span className="mb-1 block text-xs font-medium text-foreground">
                Description
              </span>
              <input
                type="text"
                name="description"
                required
                placeholder="Ce que l'alternant doit réaliser"
                className={inputClass}
              />
            </label>
            <div className="sm:col-span-2">
              <button
                type="submit"
                className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
              >
                Ajouter la mission
              </button>
            </div>
          </form>
        </div>

        <SuggestionsIA alternantId={alternant.id} />
      </section>

      <section className="mt-8">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-foreground">Bilans</h2>
          <form
            action={changerFrequenceBilan.bind(null, alternant.id)}
            className="flex items-center gap-2"
          >
            <label className="text-xs text-muted-foreground" htmlFor="frequence">
              Cadence
            </label>
            <select
              id="frequence"
              name="frequence"
              defaultValue={frequence}
              className="rounded-lg border bg-background px-2 py-1 text-xs outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="HEBDO">Hebdomadaire</option>
              <option value="BIMENSUEL">Toutes les 2 semaines</option>
              <option value="MENSUEL">Mensuel</option>
            </select>
            <button
              type="submit"
              className="rounded-lg border px-2 py-1 text-xs font-medium text-foreground transition-colors hover:bg-accent"
            >
              Appliquer
            </button>
          </form>
        </div>
        <p className="mb-3 text-xs text-muted-foreground">
          Cadence actuelle : {libelleFrequence(frequence)}.
        </p>
        {bilans.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Aucun bilan soumis par l&apos;alternant pour l&apos;instant.
          </p>
        ) : (
          <ul className="space-y-3">
            {bilans.map((b) => (
              <li key={b.id} className="rounded-2xl border bg-card p-5 shadow-soft">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-medium capitalize text-foreground">
                    {libellePeriode(b.semaine, frequence)}
                  </span>
                  {b.valideParTuteur ? (
                    <span className="rounded-lg bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-800">
                      Validé
                    </span>
                  ) : (
                    <form action={validerBilan.bind(null, b.id)}>
                      <button
                        type="submit"
                        className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-opacity hover:opacity-90"
                      >
                        Valider
                      </button>
                    </form>
                  )}
                </div>

                <dl className="mt-3 space-y-2 text-sm">
                  <div>
                    <dt className="text-xs font-medium text-muted-foreground">Réussites</dt>
                    <dd className="text-foreground">{b.reussites || "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-muted-foreground">Difficultés</dt>
                    <dd className="text-foreground">{b.difficultes || "—"}</dd>
                  </div>
                  {b.commentaire && (
                    <div>
                      <dt className="text-xs font-medium text-muted-foreground">Commentaire</dt>
                      <dd className="text-foreground">{b.commentaire}</dd>
                    </div>
                  )}
                </dl>

                <div className="mt-3 rounded-xl bg-muted p-3">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <span className="text-xs font-semibold text-foreground">
                      Résumé pour le livret (IA)
                    </span>
                    <GenererResume
                      bilanId={b.id}
                      label={b.resumeIA ? "Régénérer" : "Générer"}
                    />
                  </div>
                  {b.resumeIA ? (
                    <p className="whitespace-pre-line text-sm text-foreground">
                      {b.resumeIA}
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Aucun résumé généré.
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
