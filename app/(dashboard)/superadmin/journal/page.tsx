import Link from "next/link";
import { requireSuperAdmin } from "@/lib/auth";
import { getJournalAudit } from "@/lib/data/audit";

export const metadata = { title: "Journal d'audit · AlternPilot" };

const ACTION_LABELS: Record<string, string> = {
  IMPERSONATION_START: "Consultation ouverte",
  IMPERSONATION_STOP: "Consultation fermée",
};

function formatDateHeure(d: Date): string {
  const jj = String(d.getUTCDate()).padStart(2, "0");
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const hh = String(d.getUTCHours()).padStart(2, "0");
  const mi = String(d.getUTCMinutes()).padStart(2, "0");
  return `${jj}/${mm}/${d.getUTCFullYear()} ${hh}:${mi} UTC`;
}

export default async function JournalAuditPage() {
  await requireSuperAdmin();
  const entrees = await getJournalAudit(200);

  const th = "px-3 py-2 text-left text-xs font-semibold text-muted-foreground";
  const td = "px-3 py-2.5 text-sm align-middle";

  return (
    <div>
      <Link href="/superadmin" className="text-sm text-primary hover:underline">
        ← Mode administrateur
      </Link>

      <h1 className="mt-3 text-xl font-semibold text-foreground">
        Journal d&apos;audit
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Traçabilité des consultations d&apos;espaces en mode administrateur.
      </p>

      {entrees.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed bg-card p-8 text-center text-sm text-muted-foreground">
          Aucun accès enregistré pour l&apos;instant.
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-2xl border bg-card shadow-soft">
          <table className="w-full min-w-[720px] border-collapse">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className={th}>Date</th>
                <th className={th}>Action</th>
                <th className={th}>Administrateur</th>
                <th className={th}>Espace consulté</th>
              </tr>
            </thead>
            <tbody>
              {entrees.map((e) => (
                <tr key={e.id} className="border-b last:border-0">
                  <td className={`${td} whitespace-nowrap text-muted-foreground`}>
                    {formatDateHeure(e.createdAt)}
                  </td>
                  <td className={td}>
                    <span
                      className={`rounded-lg px-2 py-0.5 text-xs font-medium ${
                        e.action === "IMPERSONATION_START"
                          ? "bg-amber-100 text-amber-900 dark:bg-amber-500/20 dark:text-amber-100"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {ACTION_LABELS[e.action] ?? e.action}
                    </span>
                  </td>
                  <td className={`${td} text-muted-foreground`}>{e.acteurEmail}</td>
                  <td className={`${td} text-foreground`}>
                    {e.cibleNom || "—"}
                    {e.cibleType && (
                      <span className="ml-1 text-xs text-muted-foreground">
                        ({e.cibleType === "user" ? "compte" : "alternant"})
                      </span>
                    )}
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
