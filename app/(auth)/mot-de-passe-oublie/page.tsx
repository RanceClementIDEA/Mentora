import Link from "next/link";
import { demanderReinitialisation } from "./actions";

export const metadata = { title: "Mot de passe oublié · AlternPilot" };

export default function MotDePasseOubliePage({
  searchParams,
}: {
  searchParams: { envoye?: string; error?: string };
}) {
  return (
    <div>
      <h1 className="text-lg font-semibold text-foreground">Mot de passe oublié</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Indiquez votre adresse e-mail : si un compte existe, vous recevrez un
        lien pour choisir un nouveau mot de passe.
      </p>

      {searchParams.error && (
        <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200">
          {searchParams.error}
        </p>
      )}

      {searchParams.envoye ? (
        <p className="mt-5 rounded-xl bg-accent px-3 py-2 text-sm text-accent-foreground">
          Si cette adresse est associée à un compte, un e-mail vient de vous
          être envoyé. Pensez à vérifier vos spams.
        </p>
      ) : (
        <form action={demanderReinitialisation} className="mt-5 space-y-4">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-foreground">
              Email
            </span>
            <input
              name="email"
              type="email"
              autoComplete="email"
              required
              autoFocus
              className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </label>
          <button
            type="submit"
            className="w-full rounded-xl bg-primary py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            Envoyer le lien de réinitialisation
          </button>
        </form>
      )}

      <p className="mt-5 text-center text-sm text-muted-foreground">
        <Link href="/login" className="font-medium text-primary hover:underline">
          ← Retour à la connexion
        </Link>
      </p>
    </div>
  );
}
