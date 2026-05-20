import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { WHATSAPP_STORE_CHAT_URL, WHATSAPP_STORE_DISPLAY } from '@/constants';

const CONTENT = {
  faq: {
    title: 'FAQ',
    sections: [
      {
        heading: 'Commandes & délais',
        body: 'Chaque pièce est fabriquée ou préparée sur commande. Les délais vous sont confirmés par WhatsApp après validation.',
      },
      {
        heading: 'Paiement',
        body: 'Paiement à la livraison sur Abidjan. Pour les expéditions hors zone, un acompte peut être demandé.',
      },
      {
        heading: 'Pièces sur mesure',
        body: 'Utilisez la page Sur mesure pour décrire votre projet (dimensions, finitions, photos d’inspiration).',
      },
    ],
  },
  shipping: {
    title: 'Livraison & retours',
    sections: [
      {
        heading: 'Livraison Abidjan',
        body: 'Livraison à domicile ou retrait en atelier selon disponibilité. Frais communiqués avant validation.',
      },
      {
        heading: 'Expédition',
        body: 'Expédition possible en Côte d’Ivoire et à l’international pour pièces adaptées à l’emballage.',
      },
      {
        heading: 'Retours',
        body: 'Les pièces artisanales uniques ne sont pas éligibles au retour standard sauf défaut constaté à la réception.',
      },
    ],
  },
  terms: {
    title: 'CGV & mentions légales',
    sections: [
      {
        heading: 'Éditeur',
        body: 'Poids Baoulé Home Design — Abidjan, Côte d’Ivoire. contact@poidsbaoule.com',
      },
      {
        heading: 'Propriété intellectuelle',
        body: 'Photos, textes et créations sont protégés. Toute reproduction sans accord est interdite.',
      },
      {
        heading: 'Données',
        body: 'Les données collectées servent uniquement au traitement de vos commandes et demandes.',
      },
    ],
  },
  contact: {
    title: 'Contact',
    sections: [
      {
        heading: 'WhatsApp',
        body: `Réponse rapide au ${WHATSAPP_STORE_DISPLAY} pour devis, disponibilité et suivi de commande.`,
      },
      {
        heading: 'E-mail',
        body: 'contact@poidsbaoule.com',
      },
      {
        heading: 'Atelier',
        body: 'Abidjan, Côte d’Ivoire — rendez-vous sur demande.',
      },
    ],
  },
} as const;

type InfoSlug = keyof typeof CONTENT;

export default function InfoPage({ slug }: { slug: InfoSlug }) {
  const page = CONTENT[slug];

  return (
    <div className="min-w-0 max-w-[100vw] overflow-x-clip pb-20 pt-24 sm:pt-28">
      <div className="container mx-auto max-w-3xl px-4 md:px-6">
        <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.4em] text-primary">Poids Baoulé</p>
        <h1 className="mb-10 font-serif text-4xl font-bold md:text-5xl">{page.title}</h1>
        <div className="space-y-10">
          {page.sections.map((s) => (
            <section key={s.heading} className="space-y-3">
              <h2 className="font-serif text-xl font-semibold">{s.heading}</h2>
              <p className="leading-relaxed text-muted-foreground">{s.body}</p>
            </section>
          ))}
        </div>
        <div className="mt-12 flex flex-wrap gap-4">
          <a href={WHATSAPP_STORE_CHAT_URL} target="_blank" rel="noopener noreferrer">
            <Button className="rounded-full">Nous écrire sur WhatsApp</Button>
          </a>
          <Link to="/shop">
            <Button variant="outline" className="rounded-full">
              Voir la boutique
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
