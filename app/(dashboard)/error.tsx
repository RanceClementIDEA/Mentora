"use client";

import { ErrorCard } from "@/components/error-card";

/**
 * Frontière d'erreur scopée au tableau de bord : l'en-tête et la navigation
 * de `(dashboard)/layout.tsx` restent visibles (seul le contenu de la page
 * est remplacé), contrairement à `app/error.tsx` qui les ferait disparaître.
 */
export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <ErrorCard error={error} reset={reset} />;
}
