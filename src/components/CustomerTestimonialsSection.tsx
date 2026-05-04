import { useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, MapPin, Quote, Sparkles, Star, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { CustomerTestimonial } from '@/types';
import { useTestimonials } from '@/lib/TestimonialContext';

function Stars({
  rating,
  className,
  variant = 'light',
}: {
  rating: CustomerTestimonial['rating'];
  className?: string;
  variant?: 'light' | 'dark';
}) {
  const empty =
    variant === 'dark' ? 'fill-white/12 text-white/12' : 'fill-stone-200 text-stone-200';
  const full = 'fill-accent text-accent';
  return (
    <div className={cn('flex gap-0.5', className)} aria-hidden>
      {Array.from({ length: 5 }, (_, i) => (
        <Star key={i} className={cn('h-3.5 w-3.5 sm:h-4 sm:w-4', i < rating ? full : empty)} />
      ))}
    </div>
  );
}

export function CustomerTestimonialsSection() {
  const { testimonials, loading } = useTestimonials();

  const sorted = useMemo(
    () =>
      [...testimonials].sort(
        (a, b) =>
          (a.sortOrder ?? 0) - (b.sortOrder ?? 0) ||
          (b.createdAt || '').localeCompare(a.createdAt || '')
      ),
    [testimonials]
  );

  const featured = useMemo(() => {
    if (sorted.length === 0) return null;
    return sorted.find((t) => t.featured) ?? sorted[0];
  }, [sorted]);

  const others = useMemo(() => {
    if (!featured) return [];
    return sorted.filter((t) => t.id !== featured.id);
  }, [sorted, featured]);

  const stats = useMemo(() => {
    const n = testimonials.length;
    if (n === 0) {
      return [
        { label: 'Note moyenne', value: '—', sub: 'Publiez des témoignages depuis l’admin', icon: Star },
        { label: 'Témoignages', value: '0', sub: 'sur la page d’accueil', icon: Users },
        { label: 'Satisfaction', value: '—', sub: 'Les statistiques suivront vos avis', icon: Sparkles },
      ];
    }
    const sum = testimonials.reduce((s, t) => s + t.rating, 0);
    const avg = (sum / n).toFixed(1).replace('.', ',');
    const five = testimonials.filter((t) => t.rating === 5).length;
    const pct = Math.round((five / n) * 100);
    return [
      { label: 'Note moyenne', value: `${avg} / 5`, sub: `sur ${n} avis publiés`, icon: Star },
      { label: 'Témoignages', value: String(n), sub: 'sur cette page', icon: Users },
      { label: 'Notes 5/5', value: `${pct} %`, sub: 'des avis à la note maximale', icon: Sparkles },
    ];
  }, [testimonials]);

  useEffect(() => {
    const scrollToSection = () => {
      if (window.location.hash !== '#avis-clients') return;
      const el = document.getElementById('avis-clients');
      if (!el) return;
      requestAnimationFrame(() => {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    };
    scrollToSection();
    window.addEventListener('hashchange', scrollToSection);
    return () => window.removeEventListener('hashchange', scrollToSection);
  }, [loading]);

  return (
    <section
      id="avis-clients"
      className="relative overflow-x-clip border-y border-stone-200/80 bg-gradient-to-b from-[#FFFCF7] via-background to-stone-100 py-14 sm:py-20 md:py-28"
    >
      <div
        className="pointer-events-none absolute -left-24 top-20 h-72 w-72 rounded-full bg-primary/[0.06] blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-emerald-500/[0.05] blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.4] mix-blend-multiply"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%234F4437' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
        aria-hidden
      />

      <div className="container relative z-10 mx-auto max-w-6xl px-3 sm:px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5 }}
          className="mx-auto mb-12 max-w-3xl text-center md:mb-16"
        >
          <Badge
            variant="outline"
            className="mb-4 rounded-full border-primary/25 bg-primary/[0.04] px-4 py-1 text-[10px] font-bold uppercase tracking-[0.28em] text-primary"
          >
            Avis clients & témoignages
          </Badge>
          <h2 className="font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl lg:text-[3.25rem]">
            La confiance se construit au fil des matières
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground md:text-lg">
            Architectes, collectionneurs, particuliers : ils racontent leur expérience avec l’atelier — qualité de fabrication,
            écoute et accompagnement.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45, delay: 0.05 }}
          className="mb-14 grid grid-cols-1 gap-4 sm:grid-cols-3"
        >
          {loading
            ? [1, 2, 3].map((k) => (
                <div
                  key={k}
                  className="flex animate-pulse items-center gap-4 rounded-2xl border border-stone-200/90 bg-white/60 p-5"
                >
                  <div className="h-12 w-12 shrink-0 rounded-xl bg-stone-200/80" />
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="h-2 w-24 rounded bg-stone-200/80" />
                    <div className="h-6 w-16 rounded bg-stone-200/80" />
                    <div className="h-2 w-full max-w-[140px] rounded bg-stone-200/60" />
                  </div>
                </div>
              ))
            : stats.map((s) => (
                <div
                  key={s.label}
                  className="flex items-center gap-4 rounded-2xl border border-stone-200/90 bg-white/80 p-5 shadow-sm backdrop-blur-sm"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <s.icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 text-left">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{s.label}</p>
                    <p className="font-serif text-2xl font-bold tabular-nums text-foreground">{s.value}</p>
                    <p className="truncate text-xs text-muted-foreground">{s.sub}</p>
                  </div>
                </div>
              ))}
        </motion.div>

        {loading ? (
          <div className="grid animate-pulse grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
            <div className="h-[420px] rounded-3xl bg-stone-200/50 lg:col-span-5" />
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:col-span-7">
              {[1, 2, 3, 4].map((k) => (
                <div key={k} className="h-56 rounded-2xl bg-stone-200/40" />
              ))}
            </div>
          </div>
        ) : !featured ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mx-auto max-w-lg rounded-2xl border border-dashed border-stone-300 bg-white/70 p-10 text-center shadow-sm"
          >
            <p className="text-sm leading-relaxed text-muted-foreground">
              Aucun témoignage n’est encore publié. Ajoutez-en depuis l’espace administrateur pour les afficher ici.
            </p>
            <Link
              to="/admin"
              className={cn(buttonVariants({ variant: 'default' }), 'mt-6 rounded-full')}
              onClick={() => window.scrollTo(0, 0)}
            >
              Ouvrir l’admin
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="lg:col-span-5"
            >
              <Card
                className={cn(
                  'relative h-full overflow-hidden border-0 bg-gradient-to-br from-stone-900 via-stone-900 to-[#2a1814]',
                  'text-stone-50 shadow-[0_32px_64px_-20px_rgba(79,68,55,0.45)]'
                )}
              >
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(245,166,35,0.12),transparent_55%)]" />
                <div className="absolute right-6 top-6 opacity-[0.07]">
                  <Quote className="h-32 w-32 text-white" strokeWidth={1} />
                </div>
                <CardContent className="relative flex h-full flex-col justify-between gap-8 p-8 md:p-10">
                  <div className="space-y-5">
                    <div className="flex flex-wrap items-center gap-2">
                      <Stars rating={featured.rating} variant="dark" />
                      {featured.verifiedPurchase ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white/90 ring-1 ring-white/15">
                          <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                          Achat vérifié
                        </span>
                      ) : null}
                    </div>
                    <blockquote className="font-serif text-xl font-medium leading-relaxed text-white/95 md:text-2xl md:leading-snug">
                      « {featured.quote} »
                    </blockquote>
                  </div>
                  <div className="flex flex-col gap-4 border-t border-white/10 pt-6 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <p className="text-lg font-bold text-white">{featured.author}</p>
                      <p className="text-sm text-white/60">{featured.role}</p>
                      {featured.context ? (
                        <p className="mt-1 text-xs font-medium uppercase tracking-widest text-accent/90">{featured.context}</p>
                      ) : null}
                    </div>
                    <div className="flex flex-col items-start gap-1 text-xs text-white/50 sm:items-end">
                      {featured.location ? (
                        <span className="inline-flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 shrink-0 text-accent/80" />
                          {featured.location}
                        </span>
                      ) : null}
                      {featured.date ? <span>{featured.date}</span> : null}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:col-span-7 lg:gap-6">
              {others.map((t, index) => (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.06, duration: 0.4 }}
                >
                  <Card className="group h-full border-stone-200/90 bg-white/90 shadow-sm transition-shadow duration-300 hover:shadow-lg">
                    <CardContent className="flex h-full flex-col gap-4 p-6">
                      <div className="flex items-start justify-between gap-3">
                        <Quote className="h-8 w-8 shrink-0 text-primary/20 transition-colors group-hover:text-primary/35" />
                        <Stars rating={t.rating} />
                      </div>
                      <p className="flex-1 text-sm leading-relaxed text-foreground/90 line-clamp-6 md:line-clamp-5">
                        « {t.quote} »
                      </p>
                      <div className="border-t border-stone-100 pt-4">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <p className="font-semibold text-foreground">{t.author}</p>
                            <p className="text-xs text-muted-foreground">{t.role}</p>
                          </div>
                          <div className="text-right text-[10px] text-muted-foreground">
                            {t.location ? <p className="font-medium text-foreground/80">{t.location}</p> : null}
                            {t.date ? <p>{t.date}</p> : null}
                          </div>
                        </div>
                        {t.context ? (
                          <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-primary/80">{t.context}</p>
                        ) : null}
                        {t.verifiedPurchase ? (
                          <p className="mt-2 flex items-center gap-1 text-[10px] font-semibold text-emerald-700">
                            <CheckCircle2 className="h-3 w-3" />
                            Achat vérifié
                          </p>
                        ) : null}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
