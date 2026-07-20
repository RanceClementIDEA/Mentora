import Link from "next/link";
import { dashboardPathForRole, requireUser } from "@/lib/auth";
import { getMfaEtat } from "@/lib/mfa";
import { mettreAJourTelephone, supprimerMonCompte } from "./actions";
import { desactiver2fa } from "./2fa/actions";

export const metadata = { title: "Mon compte · AlternPilot" };

export default async function MonComptePage({
  searchParams,
}: {
  searchParams: { error?: string; tel?: string; ok?: string };
}) {
  const user = await requireUser();
  const mfa = await getMfaEtat();
  const compteSensible = user.role === "ADMIN" || user.isSuperAdmin;

  return (
    <div className="max-w-2xl">
      <Link
        href={dashboardPathForRole(user.role)}
        className="text-sm text-primary hover:underline"
      >
        ← Retour
      </Link>

      <h1 className="mt-3 text-xl font-semibold text-foreground">Mon compte</h1>
      <dl className="mt-4 space-y-1 text-sm">
        <div className="flex gap-2">
          <dt className="text-muted-foreground">Nom :</dt>
          <dd className="text-foreground">{user.nom}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="text-muted-foreground">E-mail :</dt>
          <dd className="text-foreground">{user.email}</dd>
        </div>
      </dl>

      {searchParams.tel && (
        <p className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200">
          Téléphone enregistré.
        </p>
      )}
      {searchParams.ok === "2fa-on" && (
        <p className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200">
          Double authentification activée.
        </p>
      )}
      {searchParams.ok === "2fa-off" && (
        <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100">
          Double authentification désactivée.
        </p>
      )}
      {searchParams.error && (
        <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200">
          {searchParams.error}
        </p>
      )}

      {/* Double authentification (2FA). */}
      <section className="mt-8 rounded-2xl border bg-card p-5 shadow-soft">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-foreground">
            Double authentification (2FA)
          </h2>
          <span
            className={`rounded-lg px-2 py-0.5 text-xs font-medium ${
              mfa.actif
                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-200"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {mfa.actif ? "Activée" : "Inactive"}
          </span>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Un code temporaire (application d&apos;authentification) est demandé en
          plus du mot de passe à chaque connexion.
        </p>

        {compteSensible && !mfa.actif && (
          <p className="mt-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100">
            Fortement recommandée pour un compte administrateur.
          </p>
        )}

        {mfa.actif ? (
          <form action={desactiver2fa} className="mt-3">
            <button
              type="submit"
              className="rounded-xl border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
            >
              Désactiver la 2FA
            </button>
          </form>
        ) : (
          <Link
            href="/mon-compte/2fa"
            className="mt-3 inline-block rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            Activer la 2FA
          </Link>
        )}
      </section>

      <section className="mt-8 rounded-2xl border bg-card p-5 shadow-soft">
        <h2 className="text-sm font-semibold text-foreground">
          Téléphone (alertes SMS)
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Facultatif. Utilisé uniquement pour les alertes critiques par SMS, si
          le service est activé. Laissez vide pour ne pas être contacté par SMS.
        </p>
        <form
          action={mettreAJourTelephone}
          className="mt-3 flex flex-wrap items-center gap-2"
        >
          <input
            name="telephone"
            type="tel"
            defaultValue={user.telephone ?? ""}
            placeholder="+33 6 12 34 56 78"
            autoComplete="tel"
            className="w-full max-w-xs rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
          <button
            type="submit"
            className="rounded-xl border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Enregistrer
          </button>
        </form>
      </section>

      <section className="mt-6 rounded-2xl border bg-card p-5 shadow-soft">
        <h2 className="text-sm font-semibold text-foreground">Mes données</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Téléchargez l&apos;ensemble de vos données personnelles au format JSON.
        </p>
        <a
          href="/api/mon-compte/export"
          className="mt-3 inline-block rounded-xl border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
        >
          Télécharger mes données
        </a>
      </section>

      <section className="mt-6 rounded-2xl border border-red-200 bg-red-50/50 p-5 dark:border-red-500/30 dark:bg-red-500/10">
        <h2 className="text-sm font-semibold text-red-700 dark:text-red-300">
          Supprimer mon compte
        </h2>
        <p className="mt-1 text-sm text-red-700/90 dark:text-red-200/90">
          Action définitive : votre compte et vos données personnelles seront
          supprimés. {user.role === "ALTERNANT"
            ? "Vos missions et bilans seront effacés."
            : "Supprimez d'abord vos alternants le cas échéant."}
        </p>
        <form action={supprimerMonCompte} className="mt-4 space-y-3">
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-red-700 dark:text-red-300">
              Tapez SUPPRIMER pour confirmer
            </span>
            <input
              name="confirmation"
              type="text"
              autoComplete="off"
              placeholder="SUPPRIMER"
              className="w-full max-w-xs rounded-xl border border-red-300 bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-red-400 dark:border-red-500/40 dark:focus:ring-red-500/60"
            />
          </label>
          <button
            type="submit"
            className="rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            Supprimer définitivement
          </button>
        </form>
      </section>
    </div>
  );
}
