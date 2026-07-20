import Link from "next/link";
import { requireSuperAdmin } from "@/lib/auth";
import { getCfasAvecComptes, getReferentielsAvecCfa } from "@/lib/data/cfa";
import {
  creerCfa,
  detacherReferentiel,
  inviterReferent,
  rattacherReferentiel,
} from "./actions";

export const metadata = { title: "Centres de formation · AlternPilot" };

const OK_MESSAGES: Record<string, string> = {
  cfa: "CFA créé.",
  referent: "Référent invité.",
  rattache: "Diplôme rattaché.",
  detache: "Diplôme détaché.",
};

export default async function SuperAdminCfaPage({
  searchParams,
}: {
  searchParams: { ok?: string; mail?: string; error?: string };
}) {
  await requireSuperAdmin();
  const [cfas, referentiels] = await Promise.all([
    getCfasAvecComptes(),
    getReferentielsAvecCfa(),
  ]);

  const inputClass =
    "w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring";

  return (
    <div>
      <Link href="/superadmin" className="text-sm text-primary hover:underline">
        ← Mode administrateur
      </Link>

      <h1 className="mt-3 text-xl font-semibold text-foreground">
        Centres de formation (CFA)
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Créez un CFA, invitez ses référents et rattachez les diplômes qu&apos;il
        suit. Un référent voit tous les alternants préparant ces diplômes.
      </p>

      {searchParams.ok && (
        <p className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200">
          {OK_MESSAGES[searchParams.ok] ?? "Opération effectuée."}
          {searchParams.ok === "referent" &&
            (searchParams.mail
              ? " Une invitation par e-mail a été envoyée."
              : " Pensez à lui communiquer comment se connecter.")}
        </p>
      )}
      {searchParams.error && (
        <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200">
          {searchParams.error}
        </p>
      )}

      {/* Créer un CFA */}
      <form
        action={creerCfa}
        className="mt-6 flex flex-wrap items-end gap-2 rounded-2xl border bg-card p-5"
      >
        <label className="flex-1">
          <span className="mb-1 block text-xs font-medium text-foreground">
            Nouveau CFA
          </span>
          <input
            name="nom"
            required
            placeholder="Nom du centre de formation"
            className={inputClass}
          />
        </label>
        <button
          type="submit"
          className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          Créer
        </button>
      </form>

      {cfas.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed bg-card p-8 text-center text-sm text-muted-foreground">
          Aucun CFA pour l&apos;instant.
        </div>
      ) : (
        <div className="mt-6 space-y-5">
          {cfas.map((cfa) => {
            const attaches = referentiels.filter((r) => r.cfaId === cfa.id);
            const disponibles = referentiels.filter((r) => r.cfaId !== cfa.id);
            return (
              <section
                key={cfa.id}
                className="rounded-2xl border bg-card p-5 shadow-soft"
              >
                <h2 className="text-base font-semibold text-foreground">
                  {cfa.nom}
                </h2>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {cfa.referents.length} référent(s) · {cfa._count.referentiels}{" "}
                  diplôme(s)
                </p>

                <div className="mt-4 grid gap-5 lg:grid-cols-2">
                  {/* Référents */}
                  <div>
                    <h3 className="text-xs font-semibold text-foreground">
                      Référents
                    </h3>
                    {cfa.referents.length === 0 ? (
                      <p className="mt-1 text-sm text-muted-foreground">
                        Aucun référent.
                      </p>
                    ) : (
                      <ul className="mt-1 space-y-1 text-sm">
                        {cfa.referents.map((r) => (
                          <li key={r.id} className="text-foreground">
                            {r.nom}{" "}
                            <span className="text-xs text-muted-foreground">
                              ({r.email})
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}

                    <form
                      action={inviterReferent.bind(null, cfa.id)}
                      className="mt-3 space-y-2"
                    >
                      <input
                        name="nom"
                        required
                        placeholder="Nom du référent"
                        className={inputClass}
                      />
                      <input
                        name="email"
                        type="email"
                        required
                        placeholder="E-mail du référent"
                        className={inputClass}
                      />
                      <button
                        type="submit"
                        className="rounded-xl border px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-accent"
                      >
                        Inviter un référent
                      </button>
                    </form>
                  </div>

                  {/* Diplômes rattachés */}
                  <div>
                    <h3 className="text-xs font-semibold text-foreground">
                      Diplômes suivis
                    </h3>
                    {attaches.length === 0 ? (
                      <p className="mt-1 text-sm text-muted-foreground">
                        Aucun diplôme rattaché.
                      </p>
                    ) : (
                      <ul className="mt-1 space-y-1">
                        {attaches.map((r) => (
                          <li
                            key={r.id}
                            className="flex items-center justify-between gap-2 text-sm"
                          >
                            <span className="text-foreground">{r.nom}</span>
                            <form action={detacherReferentiel.bind(null, r.id)}>
                              <button
                                type="submit"
                                className="rounded-lg px-2 py-0.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 dark:hover:bg-red-500/15"
                              >
                                Détacher
                              </button>
                            </form>
                          </li>
                        ))}
                      </ul>
                    )}

                    <form
                      action={rattacherReferentiel.bind(null, cfa.id)}
                      className="mt-3 flex flex-wrap items-center gap-2"
                    >
                      <select
                        name="referentielId"
                        defaultValue=""
                        required
                        className="flex-1 rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                      >
                        <option value="" disabled>
                          Rattacher un diplôme…
                        </option>
                        {disponibles.map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.nom}
                            {r.cfa ? ` (actuellement : ${r.cfa.nom})` : ""}
                          </option>
                        ))}
                      </select>
                      <button
                        type="submit"
                        className="rounded-xl border px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
                      >
                        Rattacher
                      </button>
                    </form>
                  </div>
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
