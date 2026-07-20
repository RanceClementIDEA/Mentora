import Link from "next/link";

export const metadata = { title: "Conditions générales · AlternPilot" };

// Gabarit de CGU/CGV — à faire valider juridiquement et à compléter aux
// endroits [À COMPLÉTER] avant une mise en production réelle. Décrit le
// fonctionnement réel du service (offre freemium, facturation Stripe,
// résiliation en libre-service) tel qu'implémenté dans l'application.
export default function ConditionsGeneralesPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <Link href="/login" className="text-sm text-primary hover:underline">
        ← Retour
      </Link>

      <h1 className="mt-4 text-2xl font-bold tracking-tight text-foreground">
        Conditions générales d&apos;utilisation et de vente
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Applicables à l&apos;usage d&apos;AlternPilot par les entreprises, tuteurs,
        alternants et centres de formation.
      </p>

      <div className="mt-8 space-y-6 text-sm leading-relaxed text-foreground">
        <section>
          <h2 className="text-base font-semibold">1. Objet</h2>
          <p className="mt-1 text-muted-foreground">
            AlternPilot est un service en ligne (SaaS) d&apos;aide au suivi de
            l&apos;alternance : calendrier, missions, bilans hebdomadaires,
            alertes et documents liés au contrat d&apos;apprentissage. L&apos;éditeur
            est identifié dans les{" "}
            <Link href="/mentions-legales" className="text-primary hover:underline">
              mentions légales
            </Link>
            .
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold">2. Création de compte et accès</h2>
          <p className="mt-1 text-muted-foreground">
            Un compte tuteur se crée par inscription directe. Les autres
            comptes (administrateurs, alternants, référents CFA) sont créés
            par invitation depuis l&apos;application. Chaque personne est
            responsable de la confidentialité de ses identifiants et de
            l&apos;exactitude des informations renseignées.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold">3. Offres et tarification</h2>
          <p className="mt-1 text-muted-foreground">
            AlternPilot propose une offre gratuite (un alternant suivi) et une
            offre payante au-delà, facturée à l&apos;alternant actif via Stripe.
            Les tarifs en vigueur sont indiqués dans l&apos;application au moment
            de la souscription. [À COMPLÉTER : grille tarifaire précise,
            périodicité de facturation, modalités de TVA].
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold">4. Résiliation</h2>
          <p className="mt-1 text-muted-foreground">
            L&apos;abonnement payant peut être géré ou résilié à tout moment
            depuis le portail de facturation, accessible dans l&apos;application
            (page « Abonnement »). La suppression d&apos;un compte est possible en
            libre-service depuis la page « Mon compte » et entraîne
            l&apos;effacement des données personnelles associées, conformément à
            la{" "}
            <Link href="/confidentialite" className="text-primary hover:underline">
              politique de confidentialité
            </Link>
            .
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold">5. Disponibilité et responsabilité</h2>
          <p className="mt-1 text-muted-foreground">
            L&apos;éditeur s&apos;efforce d&apos;assurer un accès continu au service, sans
            garantie de disponibilité absolue. AlternPilot ne se substitue pas
            aux obligations légales et contractuelles des parties au contrat
            d&apos;apprentissage ; les informations qu&apos;il aide à suivre
            (échéances, statuts) sont fournies à titre indicatif et ne
            dispensent pas de vérifier les démarches auprès des organismes
            compétents (CFA, OPCO). [À COMPLÉTER : limitations de
            responsabilité complémentaires après revue juridique].
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold">6. Propriété intellectuelle</h2>
          <p className="mt-1 text-muted-foreground">
            Les données saisies par un client (alternants, missions, bilans)
            lui restent propres. L&apos;éditeur conserve l&apos;ensemble des droits
            sur le logiciel, sa structure et son contenu éditorial.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold">7. Modification des présentes conditions</h2>
          <p className="mt-1 text-muted-foreground">
            Les présentes conditions peuvent être mises à jour ; la version en
            vigueur est celle publiée sur cette page. [À COMPLÉTER : modalités
            d&apos;information des utilisateurs en cas de modification
            substantielle].
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold">8. Droit applicable</h2>
          <p className="mt-1 text-muted-foreground">
            Les présentes conditions sont soumises au droit français.
            [À COMPLÉTER : tribunal compétent en cas de litige].
          </p>
        </section>
      </div>
    </div>
  );
}
