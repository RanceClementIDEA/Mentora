import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { verifierEnrolement } from "./actions";

export const metadata = { title: "Activer la 2FA · AlternPilot" };

export default async function Enroler2faPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  await requireUser();
  const supabase = createClient();

  // Nettoie d'éventuels facteurs non vérifiés, puis enrôle un TOTP neuf.
  const { data: liste } = await supabase.auth.mfa.listFactors();
  for (const f of liste?.all ?? []) {
    if (f.factor_type === "totp" && f.status === "unverified") {
      await supabase.auth.mfa.unenroll({ factorId: f.id });
    }
  }
  const { data, error } = await supabase.auth.mfa.enroll({ factorType: "totp" });

  return (
    <div className="max-w-lg">
      <Link href="/mon-compte" className="text-sm text-primary hover:underline">
        ← Mon compte
      </Link>
      <h1 className="mt-3 text-xl font-semibold text-foreground">
        Activer la double authentification
      </h1>

      {error || !data ? (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200">
          Impossible de démarrer l&apos;enrôlement
          {error?.message ? ` : ${error.message}` : "."} La MFA doit être activée
          dans le projet Supabase (Authentication → Providers → MFA).
        </div>
      ) : (
        <>
          <ol className="mt-4 space-y-4 text-sm text-foreground">
            <li>
              <p className="font-medium">
                1. Scannez ce QR code avec votre application d&apos;authentification
                (Google Authenticator, Authy, 1Password…).
              </p>
              <div className="mt-3 inline-block rounded-2xl border bg-white p-4">
                <QrCode svg={data.totp.qr_code} />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Ou saisissez cette clé manuellement :{" "}
                <code className="rounded bg-muted px-1.5 py-0.5">
                  {data.totp.secret}
                </code>
              </p>
            </li>
            <li>
              <p className="font-medium">
                2. Entrez le code à 6 chiffres affiché par l&apos;application.
              </p>
              {searchParams.error && (
                <p className="mt-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200">
                  {searchParams.error}
                </p>
              )}
              <form
                action={verifierEnrolement.bind(null, data.id)}
                className="mt-2 flex flex-wrap items-center gap-2"
              >
                <input
                  name="code"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  pattern="\d{6}"
                  maxLength={6}
                  required
                  placeholder="123456"
                  className="w-32 rounded-xl border bg-background px-3 py-2 text-center text-lg tracking-widest outline-none focus:ring-2 focus:ring-ring"
                />
                <button
                  type="submit"
                  className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
                >
                  Activer la 2FA
                </button>
              </form>
            </li>
          </ol>
        </>
      )}
    </div>
  );
}

/** Affiche le QR code, qu'il soit fourni en SVG brut ou en data-URI. */
function QrCode({ svg }: { svg: string }) {
  if (svg.startsWith("data:")) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={svg} alt="QR code de configuration 2FA" width={180} height={180} />;
  }
  return (
    <div
      className="[&>svg]:h-44 [&>svg]:w-44"
      // SVG fourni par Supabase (source de confiance).
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
