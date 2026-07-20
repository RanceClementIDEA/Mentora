"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";
import "./globals.css";

/**
 * Filet de sécurité ultime : ne se déclenche que si `app/layout.tsx` lui-même
 * échoue. Doit fournir son propre <html>/<body> et rester volontairement
 * autonome (aucune dépendance au reste de l'app, qui vient d'échouer).
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="fr">
      <body>
        <div className="flex min-h-screen items-center justify-center bg-muted p-4">
          <div className="w-full max-w-sm rounded-2xl border bg-card p-6 text-center shadow-soft-lg sm:p-8">
            <div className="text-lg font-bold tracking-tight">
              Altern<span className="text-primary">Pilot</span>
            </div>
            <h1 className="mt-4 text-base font-semibold text-foreground">
              L&apos;application a rencontré un problème
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Le problème a été signalé automatiquement. Essayez de recharger
              la page.
            </p>
            <button
              type="button"
              onClick={reset}
              className="mt-5 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              Recharger
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
