import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { definirNouveauMotDePasse } from "./actions";

export const metadata = { title: "Nouveau mot de passe · AlternPilot" };

export default async function ReinitialiserMotDePassePage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(
      "/mot-de-passe-oublie?error=" +
        encodeURIComponent("Lien invalide ou expiré. Recommencez la demande."),
    );
  }

  return (
    <div>
      <h1 className="text-lg font-semibold text-foreground">
        Nouveau mot de passe
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Choisissez un nouveau mot de passe pour {user.email}.
      </p>

      {searchParams.error && (
        <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200">
          {searchParams.error}
        </p>
      )}

      <form action={definirNouveauMotDePasse} className="mt-5 space-y-4">
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-foreground">
            Nouveau mot de passe
          </span>
          <input
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            autoFocus
            className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-foreground">
            Confirmer le mot de passe
          </span>
          <input
            name="confirmation"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </label>
        <button
          type="submit"
          className="w-full rounded-xl bg-primary py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          Enregistrer le mot de passe
        </button>
      </form>
    </div>
  );
}
