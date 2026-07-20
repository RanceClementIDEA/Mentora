"use client";

import Link from "next/link";
import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";

/**
 * Contenu partagé des frontières d'erreur en cascade (`app/error.tsx`,
 * `app/(dashboard)/error.tsx`). Volontairement absent de `global-error.tsx` :
 * cette dernière doit rester autonome, sans dépendre du reste de l'app.
 */
export function ErrorCard({
  error,
  reset,
  backHref = "/",
  backLabel = "Retour à l'accueil",
}: {
  error: Error & { digest?: string };
  reset: () => void;
  backHref?: string;
  backLabel?: string;
}) {
  // Capture explicite : les frontières d'erreur React ne remontent pas
  // toujours par instrumentation.ts (onRequestError couvre le rendu serveur).
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="flex min-h-[50vh] items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-2xl border bg-card p-6 text-center shadow-soft-lg sm:p-8">
        <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-300">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5"
            aria-hidden
          >
            <path d="M12 9v4M12 17h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          </svg>
        </div>
        <h1 className="mt-4 text-base font-semibold text-foreground">
          Une erreur est survenue
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Le problème a été signalé automatiquement. Vous pouvez réessayer, ou
          revenir en lieu sûr.
        </p>
        {error.digest && (
          <p className="mt-1 text-xs text-muted-foreground/70">
            Référence : {error.digest}
          </p>
        )}
        <div className="mt-5 flex justify-center gap-2">
          <button
            type="button"
            onClick={reset}
            className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            Réessayer
          </button>
          <Link
            href={backHref}
            className="rounded-xl border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            {backLabel}
          </Link>
        </div>
      </div>
    </div>
  );
}
