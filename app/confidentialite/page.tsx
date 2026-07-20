import Link from "next/link";

export const metadata = { title: "Confidentialité · AlternPilot" };

// Gabarit de politique de confidentialité — à faire valider juridiquement et à
// compléter aux endroits [À COMPLÉTER] avant une mise en production réelle.
export default function ConfidentialitePage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <Link href="/login" className="text-sm text-primary hover:underline">
        ← Retour
      </Link>

      <h1 className="mt-4 text-2xl font-bold tracking-tight text-foreground">
        Politique de confidentialité
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        AlternPilot traite des données personnelles de tuteurs et d&apos;alternants.
        Cette page décrit lesquelles, pourquoi, et vos droits.
      </p>

      <div className="mt-8 space-y-6 text-sm leading-relaxed text-foreground">
        <section>
          <h2 className="text-base font-semibold">Responsable du traitement</h2>
          <p className="mt-1 text-muted-foreground">
            [À COMPLÉTER : nom de l&apos;entreprise, adresse, e-mail de contact].
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold">Données collectées</h2>
          <ul className="mt-1 list-disc space-y-1 pl-5 text-muted-foreground">
            <li>Identité et contact : nom, adresse e-mail.</li>
            <li>Suivi d&apos;alternance : diplôme, rythme, missions, bilans hebdomadaires.</li>
            <li>Facturation : identifiant client Stripe, statut d&apos;abonnement.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-semibold">Finalités</h2>
          <p className="mt-1 text-muted-foreground">
            Fournir le service de suivi d&apos;alternance (calendrier, missions,
            bilans), envoyer des alertes, et gérer l&apos;abonnement.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold">Sous-traitants</h2>
          <ul className="mt-1 list-disc space-y-1 pl-5 text-muted-foreground">
            <li>Hébergement de l&apos;application : Vercel Inc.</li>
            <li>Hébergement de la base de données et authentification : Supabase Inc.</li>
            <li>Génération de textes par IA (suggestions, résumés) : Anthropic.</li>
            <li>Envoi d&apos;e-mails transactionnels : Resend.</li>
            <li>Paiement et facturation : Stripe.</li>
            <li>
              Envoi de SMS/WhatsApp (le cas échéant, si activé par votre
              organisation) : Twilio.
            </li>
            <li>
              Mesure d&apos;audience (le cas échéant, si activée) : PostHog.
            </li>
            <li>
              Suivi des erreurs techniques (le cas échéant, si activé) : Sentry.
            </li>
          </ul>
          <p className="mt-2 text-muted-foreground">
            Ces prestataires n&apos;utilisent vos données que pour fournir ces
            services, dans le cadre de leurs propres engagements de
            confidentialité. Les intégrations marquées « le cas échéant » sont
            désactivées par défaut : sans configuration explicite de
            l&apos;éditeur, elles ne reçoivent aucune donnée.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold">Durée de conservation</h2>
          <p className="mt-1 text-muted-foreground">
            Les données sont conservées le temps de l&apos;utilisation du compte.
            Une suppression de compte (page « Mon compte ») efface
            immédiatement les données personnelles associées. [À COMPLÉTER :
            durée de conservation des sauvegardes techniques et des journaux
            de connexion, le cas échéant].
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold">Vos droits</h2>
          <p className="mt-1 text-muted-foreground">
            Accès, rectification, export et suppression. Une fois connecté, vous
            pouvez <span className="font-medium text-foreground">télécharger vos
            données</span> et <span className="font-medium text-foreground">supprimer
            votre compte</span> depuis la page « Mon compte ». Pour toute demande :
            [À COMPLÉTER : e-mail de contact].
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold">Voir aussi</h2>
          <p className="mt-1 text-muted-foreground">
            <Link href="/mentions-legales" className="text-primary hover:underline">
              Mentions légales
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
