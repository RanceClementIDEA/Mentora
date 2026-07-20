"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";

export interface NavItem {
  href: string;
  label: string;
}

/**
 * Navigation principale adaptée au rôle. L'élément actif est le lien dont le
 * chemin correspond le plus précisément à l'URL courante (le plus long préfixe),
 * afin que les pages de détail surlignent bien leur rubrique parente.
 */
export function DashboardNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();

  const actif = useMemo(() => {
    const matches = items.filter(
      (i) => pathname === i.href || pathname.startsWith(`${i.href}/`),
    );
    return matches.sort((a, b) => b.href.length - a.href.length)[0]?.href;
  }, [pathname, items]);

  if (items.length === 0) return null;

  return (
    <nav
      aria-label="Navigation principale"
      className="-mx-1 flex gap-1 overflow-x-auto"
    >
      {items.map((item) => {
        const estActif = item.href === actif;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={estActif ? "page" : undefined}
            className={`shrink-0 rounded-xl px-3 py-1.5 text-sm font-medium transition-colors ${
              estActif
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
