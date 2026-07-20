import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { getModelesForOrg } from "@/lib/data/modeles";
import { parseRythme } from "@/lib/rythme";
import { supprimerModele } from "./actions";

export const metadata = { title: "Modèles de rythme · AlternPilot" };

function formatDate(d: Date): string {
  const jj = String(d.getUTCDate()).padStart(2, "0");
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  return `${jj}/${mm}/${d.getUTCFullYear()}`;
}

export default async function ModelesRythmePage({
  searchParams,
}: {
  searchParams: { ok?: string };
}) {
  const user = await requireRole(["ADMIN"]);
  const modeles = user.organisationId
    ? await getModelesForOrg(user.organisationId)
    : [];

  const th =
    "px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground";
  const td = "px-3 py-2.5 text-sm align-middle";

  return (
    <div>
      <Link href="/admin" className="text-sm text-primary hover:underline">
        ← Administration
      </Link>

      <h1 className="mt-3 text-xl font-semibold text-foreground">
        Modèles de rythme
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Gabarits réutilisables. Ils se créent depuis la fiche d&apos;un alternant
        (« Enregistrer le rythme actuel comme modèle ») et s&apos;appliquent en un
        clic à d&apos;autres alternants.
      </p>

      {searchParams.ok && (
        <p className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200">
          Modèle supprimé.
        </p>
      )}

      {modeles.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed bg-card p-8 text-center text-sm text-muted-foreground">
          Aucun modèle enregistré pour l&apos;instant.
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-2xl border bg-card shadow-soft">
          <table className="w-full min-w-[520px] border-collapse">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className={th}>Modèle</th>
                <th className={th}>Périodes</th>
                <th className={th}>Créé le</th>
                <th className={th} />
              </tr>
            </thead>
            <tbody>
              {modeles.map((m) => (
                <tr key={m.id} className="border-b last:border-0">
                  <td className={`${td} font-medium text-foreground`}>{m.nom}</td>
                  <td className={`${td} tabular-nums text-muted-foreground`}>
                    {parseRythme(m.rythme).length}
                  </td>
                  <td className={`${td} tabular-nums text-muted-foreground`}>
                    {formatDate(m.createdAt)}
                  </td>
                  <td className={`${td} text-right`}>
                    <form action={supprimerModele.bind(null, m.id)}>
                      <button
                        type="submit"
                        className="rounded-lg px-2 py-1 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 dark:hover:bg-red-500/15"
                      >
                        Supprimer
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
