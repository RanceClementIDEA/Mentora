import Link from "next/link";

export const metadata = { title: "Mentions légales · AlternPilot" };

// Gabarit de mentions légales — obligatoire pour tout site professionnel en
// France (LCEN, art. 6-III). À compléter aux endroits [À COMPLÉTER] et à
// faire valider juridiquement avant mise en production réelle.
export default function MentionsLegalesPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <Link href="/login" className="text-sm text-primary hover:underline">
        ← Retour
      </Link>

      <h1 className="mt-4 text-2xl font-bold tracking-tight text-foreground">
        Mentions légales
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Conformément à la loi n° 2004-575 du 21 juin 2004 pour la confiance
        dans l&apos;économie numérique.
      </p>

      <div className="mt-8 space-y-6 text-sm leading-relaxed text-foreground">
        <section>
          <h2 className="text-base font-semibold">Éditeur du site</h2>
          <p className="mt-1 text-muted-foreground">
            [À COMPLÉTER : raison sociale, forme juridique, adresse du siège,
            numéro SIRET, capital social le cas échéant].
            <br />
            E-mail : [À COMPLÉTER].
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold">Directeur de la publication</h2>
          <p className="mt-1 text-muted-foreground">
            [À COMPLÉTER : nom du représentant légal ou de la personne
            responsable de la publication].
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold">Hébergement</h2>
          <p className="mt-1 text-muted-foreground">
            Application hébergée par Vercel Inc. Base de données hébergée par
            Supabase Inc. [À VÉRIFIER : adresses postales et coordonnées
            précises de chaque hébergeur, à jour au moment de la publication].
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold">Propriété intellectuelle</h2>
          <p className="mt-1 text-muted-foreground">
            L&apos;ensemble des éléments du site AlternPilot (textes, structure,
            logo, code) est protégé au titre du droit d&apos;auteur et de la
            propriété intellectuelle. Toute reproduction non autorisée est
            interdite.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold">Droit applicable</h2>
          <p className="mt-1 text-muted-foreground">
            Les présentes mentions légales sont soumises au droit français.
            [À COMPLÉTER : tribunal compétent en cas de litige].
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold">Voir aussi</h2>
          <p className="mt-1 text-muted-foreground">
            <Link href="/confidentialite" className="text-primary hover:underline">
              Politique de confidentialité
            </Link>{" "}
            ·{" "}
            <Link href="/conditions-generales" className="text-primary hover:underline">
              Conditions générales
            </Link>
          </p>
        </section>
      </div>
    </div>
  );
}
