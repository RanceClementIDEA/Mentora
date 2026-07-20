import { redirect } from "next/navigation";
import { getAppUser, homePathForUser } from "@/lib/auth";
import { mfaDoitVerifier } from "@/lib/mfa";
import { signOut } from "../(auth)/actions";
import { verifier2fa } from "./actions";

export const metadata = { title: "Vérification · AlternPilot" };

export default async function Defi2faPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const user = await getAppUser();
  if (!user) redirect("/login");
  // Session déjà au bon niveau (ou aucun facteur) → pas de défi à afficher.
  if (!(await mfaDoitVerifier())) redirect(homePathForUser(user));

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted p-4">
      <div className="w-full max-w-sm rounded-2xl border bg-card p-6 shadow-soft-lg sm:p-8">
        <h1 className="text-lg font-semibold text-foreground">
          Vérification en deux étapes
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Entrez le code à 6 chiffres de votre application d&apos;authentification.
        </p>

        {searchParams.error && (
          <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200">
            {searchParams.error}
          </p>
        )}

        <form action={verifier2fa} className="mt-4 space-y-3">
          <input
            name="code"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="\d{6}"
            maxLength={6}
            required
            autoFocus
            placeholder="123456"
            className="w-full rounded-xl border bg-background px-3 py-2 text-center text-lg tracking-widest outline-none focus:ring-2 focus:ring-ring"
          />
          <button
            type="submit"
            className="w-full rounded-xl bg-primary py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            Vérifier
          </button>
        </form>

        <form action={signOut} className="mt-4 text-center">
          <button
            type="submit"
            className="text-xs text-muted-foreground hover:underline"
          >
            Se déconnecter
          </button>
        </form>
      </div>
    </div>
  );
}
