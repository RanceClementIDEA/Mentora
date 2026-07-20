import Link from "next/link";
import { redirect } from "next/navigation";
import { requireUser, type AppRole, type AppUser } from "@/lib/auth";
import { mfaDoitVerifier } from "@/lib/mfa";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { DashboardNav, type NavItem } from "@/components/nav/dashboard-nav";
import { signOut } from "../(auth)/actions";
import { arreterImpersonation } from "./superadmin/actions";

const ROLE_LABELS: Record<AppRole, string> = {
  TUTEUR: "Tuteur",
  ADMIN: "Administrateur",
  CFA_REFERENT: "Référent CFA",
  ALTERNANT: "Alternant",
};

/** Destinations principales selon le rôle (ou le mode super-admin). */
function navItemsPour(user: AppUser): NavItem[] {
  if (user.isSuperAdmin && !user.impersonating) {
    return [
      { href: "/superadmin", label: "Mode admin" },
      { href: "/superadmin/cfa", label: "CFA" },
      { href: "/superadmin/journal", label: "Journal" },
    ];
  }
  switch (user.role) {
    case "TUTEUR":
      return [
        { href: "/tableau-de-bord", label: "Tableau de bord" },
        { href: "/tuteur", label: "Mes alternants" },
        { href: "/admin/abonnement", label: "Abonnement" },
      ];
    case "ADMIN":
      return [
        { href: "/tableau-de-bord", label: "Tableau de bord" },
        { href: "/admin", label: "Administration" },
        { href: "/admin/membres", label: "Membres" },
        { href: "/admin/abonnement", label: "Abonnement" },
      ];
    case "ALTERNANT":
      return [
        { href: "/alternant", label: "Mon suivi" },
        { href: "/alternant/bilan", label: "Mon bilan" },
      ];
    case "CFA_REFERENT":
      return [{ href: "/cfa", label: "Espace CFA" }];
    default:
      return [];
  }
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();
  // Défi 2FA : une session en aal1 alors qu'un facteur exige aal2 est renvoyée
  // vers l'écran de vérification avant tout accès au tableau de bord.
  if (await mfaDoitVerifier()) redirect("/2fa");

  const roleLabel =
    user.isSuperAdmin && !user.impersonating
      ? "Mode administrateur"
      : user.role
        ? ROLE_LABELS[user.role]
        : "Compte en attente";

  const items = navItemsPour(user);
  const accueil = user.isSuperAdmin && !user.impersonating ? "/superadmin" : "/";

  return (
    <div className="min-h-screen bg-muted">
      {user.impersonating && (
        <div className="no-print bg-amber-500 text-amber-950 dark:bg-amber-400">
          <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2 px-4 py-2 text-sm">
            <span>
              Mode admin — vous consultez l&apos;espace de{" "}
              <strong>{user.impersonating}</strong>.
            </span>
            <div className="flex items-center gap-2">
              <Link
                href="/superadmin"
                className="rounded-lg bg-amber-950/10 px-3 py-1 text-xs font-medium hover:bg-amber-950/20"
              >
                Changer d&apos;espace
              </Link>
              <form action={arreterImpersonation}>
                <button
                  type="submit"
                  className="rounded-lg bg-amber-950/10 px-3 py-1 text-xs font-medium hover:bg-amber-950/20"
                >
                  Revenir au mode admin
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
      <header className="no-print sticky top-0 z-20 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="mx-auto max-w-5xl px-4">
          <div className="flex items-center justify-between gap-3 py-3">
            <Link
              href={accueil}
              className="text-lg font-bold tracking-tight transition-opacity hover:opacity-80"
            >
              Altern<span className="text-primary">Pilot</span>
            </Link>
            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                href="/mon-compte"
                className="min-w-0 text-right transition-opacity hover:opacity-80"
              >
                <div className="truncate text-sm font-medium text-foreground">
                  {user.nom}
                </div>
                <div className="truncate text-xs text-muted-foreground">
                  {roleLabel}
                </div>
              </Link>
              <ThemeToggle />
              <form action={signOut}>
                <button
                  type="submit"
                  aria-label="Déconnexion"
                  className="rounded-xl border px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-accent"
                >
                  <span className="hidden sm:inline" aria-hidden>
                    Déconnexion
                  </span>
                  <span className="sm:hidden" aria-hidden>
                    Quitter
                  </span>
                </button>
              </form>
            </div>
          </div>
          {items.length > 0 && (
            <div className="pb-2">
              <DashboardNav items={items} />
            </div>
          )}
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
      <footer className="no-print mx-auto flex max-w-5xl flex-wrap items-center gap-x-3 gap-y-1 px-4 pb-8 text-xs text-muted-foreground">
        <Link href="/mentions-legales" className="hover:underline">
          Mentions légales
        </Link>
        <Link href="/confidentialite" className="hover:underline">
          Confidentialité
        </Link>
        <Link href="/conditions-generales" className="hover:underline">
          Conditions générales
        </Link>
      </footer>
    </div>
  );
}
