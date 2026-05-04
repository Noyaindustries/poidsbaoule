import { motion } from 'motion/react';
import { ChevronRight, ArrowRight } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { useProducts } from '@/lib/ProductContext';
import { CustomerTestimonialsSection } from '@/components/CustomerTestimonialsSection';

const Hero = () => {
  return (
    <section className="relative flex min-h-[100dvh] min-h-screen w-full max-w-[100vw] items-center overflow-x-clip pt-28 pb-12 sm:pt-36 md:pt-48 md:pb-24">
      {/* Fond seul en overflow-hidden pour ne pas couper ombres / cadre du contenu */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <motion.div 
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="w-full h-full"
        >
          <img 
            src="/PHOTO-2026-04-15-18-25-32_1.jpg" 
            alt="Atelier Poids Baoulé" 
            className="w-full h-full object-cover object-[center_35%] brightness-[0.4]"
            referrerPolicy="no-referrer"
            fetchPriority="high"
            loading="eager"
            decoding="async"
          />
        </motion.div>
      </div>
      
      <div className="container relative z-10 mx-auto max-w-full px-3 sm:px-4 md:px-5">
        <div className="grid min-w-0 grid-cols-1 items-center gap-8 lg:grid-cols-12">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="min-w-0 space-y-8 lg:col-span-8"
          >
            <div className="space-y-2">
              <motion.span 
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6 }}
                transition={{ delay: 0.5 }}
                className="block text-[10px] font-bold uppercase tracking-[0.35em] text-white sm:text-xs sm:tracking-[0.5em]"
              >
                Artisanat d'Exception • Abidjan
              </motion.span>
              <h1 className="break-words text-[clamp(2rem,11vw,3.75rem)] font-serif font-bold leading-[0.9] text-white sm:text-6xl sm:leading-[0.85] md:text-[100px] lg:text-[120px]">
                L'Âme de <br />
                <span className="ml-0 italic text-accent md:ml-12">l'Objet</span>
              </h1>
            </div>
            
            <p className="max-w-xl text-base font-light leading-relaxed text-white/80 sm:text-lg md:text-xl">
              Des créations en ciment blanc et plâtre qui célèbrent l'imperfection sacrée. Chaque pièce est une sculpture vivante pour votre sanctuaire personnel.
            </p>
            
            <div className="flex flex-col gap-4 pt-4 pb-1 sm:flex-row sm:flex-wrap sm:items-center sm:gap-6">
              <Link to="/shop" onClick={() => window.scrollTo(0, 0)} className="inline-flex w-full shrink-0 sm:w-auto">
                <Button
                  size="lg"
                  className="h-14 w-full rounded-full px-8 text-base shadow-2xl shadow-primary/25 ring-offset-2 ring-offset-transparent transition-shadow hover:shadow-primary/35 sm:h-auto sm:w-auto sm:px-10 sm:py-8 sm:text-lg"
                >
                  Explorer la Collection
                </Button>
              </Link>
              <Link
                to="/services"
                className="group flex items-center justify-center gap-3 text-xs font-bold uppercase tracking-widest text-white sm:justify-start"
                onClick={() => window.scrollTo(0, 0)}
              >
                <span>Prestations déco</span>
                <div className="h-[1px] w-12 bg-white/30 group-hover:w-20 transition-all duration-500"></div>
              </Link>
            </div>

            <nav
              className="mt-8 border-t border-white/15 pt-6"
              aria-label="Accès rapide depuis l’accueil"
            >
              <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.35em] text-white/45">Parcourir</p>
              <ul className="flex flex-wrap items-center gap-x-1 gap-y-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/85 sm:text-xs sm:tracking-[0.25em]">
                {(
                  [
                    { label: 'Boutique', to: '/shop', hash: false },
                    { label: 'Sur mesure', to: '/custom', hash: false },
                    { label: 'Prestations', to: '/services', hash: false },
                    { label: 'Notre histoire', to: '/story', hash: false },
                    { label: 'Avis', to: '/#avis-clients', hash: true },
                  ] as const
                ).map((item, i) => (
                  <li key={item.to} className="flex items-center">
                    {i > 0 && <span className="mx-2 text-white/25 select-none" aria-hidden>|</span>}
                    {item.hash ? (
                      <Link
                        to={item.to}
                        onClick={(e) => {
                          if (window.location.pathname !== '/') {
                            return;
                          }
                          e.preventDefault();
                          window.history.replaceState(null, '', '#avis-clients');
                          document.getElementById('avis-clients')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }}
                        className="transition-colors hover:text-accent"
                      >
                        {item.label}
                      </Link>
                    ) : (
                      <Link
                        to={item.to}
                        onClick={() => window.scrollTo(0, 0)}
                        className="transition-colors hover:text-accent"
                      >
                        {item.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotate: 5 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ delay: 0.3, duration: 1.2 }}
            className="hidden min-w-0 max-w-full lg:col-span-4 lg:block"
          >
            <div className="relative mx-auto aspect-[3/4] max-h-[min(70vh,520px)] w-full max-w-[min(100%,340px)] overflow-hidden rounded-[clamp(2rem,8vw,6.25rem)] bg-white/5 shadow-[0_0_0_1px_rgba(255,255,255,0.06),inset_0_0_0_10px_rgba(255,255,255,0.15)] backdrop-blur-sm lg:shadow-[0_0_0_1px_rgba(255,255,255,0.06),inset_0_0_0_12px_rgba(255,255,255,0.15)]">
              <img 
                src="/PHOTO-2026-04-15-18-25-32_2.jpg" 
                className="h-full w-full object-cover"
                referrerPolicy="no-referrer"
                loading="lazy"
                decoding="async"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-8">
                <p className="text-white font-serif italic text-2xl">"L'imperfection est la plus haute forme de beauté."</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Vertical Rail Text */}
      <div className="absolute right-8 top-1/2 -translate-y-1/2 hidden xl:block">
        <div className="flex flex-col items-center gap-12">
          <span className="writing-vertical-rl rotate-180 text-[10px] uppercase tracking-[0.8em] text-white/40 font-bold">WABI-SABI AESTHETIC</span>
          <div className="w-[1px] h-32 bg-gradient-to-b from-white/40 to-transparent"></div>
        </div>
      </div>
    </section>
  );
};

const FeaturedProducts = () => {
  const { products } = useProducts();
  const featured = products;

  return (
    <section className="overflow-x-clip bg-background py-12 sm:py-16 md:py-32">
      <div className="container mx-auto max-w-full px-3 sm:px-4 md:px-6">
        <div className="mb-16 grid grid-cols-1 gap-10 sm:mb-24 sm:gap-16 lg:grid-cols-12">
          <div className="lg:col-span-5 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="space-y-4"
            >
              <span className="text-primary font-bold uppercase tracking-[0.3em] text-[10px]">Curated Selection</span>
              <h2 className="text-3xl font-serif font-bold leading-tight sm:text-4xl md:text-7xl">
                Nos Pièces <br /> <span className="italic">Iconiques</span>
              </h2>
              <p className="text-base leading-relaxed text-muted-foreground sm:text-lg">
                Chaque création est une exploration de la matière et de la forme, sculptée pour capturer l'essence de l'instant présent.
              </p>
              <div className="pt-8">
                <Link to="/shop" onClick={() => window.scrollTo(0, 0)}>
                  <Button variant="outline" className="rounded-full px-8 py-6 border-primary text-primary hover:bg-primary hover:text-white transition-all duration-500">
                    Explorer toute la boutique
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>

          <div className="min-w-0 lg:col-span-7">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              {featured.length === 0 ? (
                <div className="md:col-span-2 rounded-[40px] border border-dashed border-muted-foreground/20 p-10 text-center text-muted-foreground">
                  Aucun produit disponible pour le moment.
                </div>
              ) : featured.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.2, duration: 0.8 }}
                  viewport={{ once: true }}
                  className={index === 0 ? 'md:col-span-2' : ''}
                >
                  <div className="group relative rounded-3xl sm:rounded-[40px]">
                    {/* Rognage uniquement sur le bloc image (+ mobile) pour ne pas couper le survol desktop */}
                    <div
                      className={`relative overflow-hidden rounded-3xl bg-muted sm:rounded-[40px] ${index === 0 ? 'aspect-video sm:aspect-[16/9]' : 'aspect-[4/5]'}`}
                    >
                      <Link
                        to={`/product/${product.id}`}
                        className="relative block h-full w-full"
                        onClick={() => window.scrollTo(0, 0)}
                      >
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105"
                          referrerPolicy="no-referrer"
                          loading="lazy"
                          decoding="async"
                        />
                      </Link>
                      <div className="pointer-events-none absolute inset-0 bg-black/20 opacity-0 transition-opacity duration-500 group-hover:opacity-100 max-md:hidden" />

                      {/* Mobile : dans le bloc rogné pour respecter les coins arrondis */}
                      <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-4 pt-16 md:hidden">
                        <div className="text-white">
                          <p className="mb-1 text-[10px] uppercase tracking-widest text-white/80">{product.category}</p>
                          <h3 className="mb-2 font-serif text-lg font-bold">{product.name}</h3>
                          <p className="mb-3 font-bold tabular-nums">{product.price.toLocaleString()} FCFA</p>
                          {product.stock <= 0 ? (
                            <span
                              className={cn(
                                buttonVariants({ size: 'sm' }),
                                'inline-flex rounded-full bg-white/20 px-4 py-2 text-white/80'
                              )}
                            >
                              Épuisé
                            </span>
                          ) : (
                            <Link
                              to={`/product/${product.id}`}
                              onClick={() => window.scrollTo(0, 0)}
                              className={cn(
                                buttonVariants({ size: 'sm' }),
                                'inline-flex rounded-full bg-white px-4 py-2 text-black hover:bg-white/90'
                              )}
                            >
                              Commander
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Desktop : survol — hors du overflow de l’image pour ne pas être rogné vers le haut */}
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 hidden flex-col justify-end p-4 opacity-0 transition-all duration-500 group-hover:pointer-events-auto group-hover:opacity-100 md:flex md:p-6">
                      <div className="pointer-events-auto w-full max-w-md rounded-3xl bg-white/90 p-4 shadow-2xl backdrop-blur-md transition-colors hover:bg-white sm:p-5">
                        <div className="flex flex-row items-end gap-2 sm:gap-2.5">
                          <Link
                            to={`/product/${product.id}`}
                            onClick={() => window.scrollTo(0, 0)}
                            className="min-w-0 flex-1"
                          >
                            <p className="mb-1 text-[10px] uppercase tracking-widest text-muted-foreground">
                              {product.category}
                            </p>
                            <h3 className="font-serif text-xl font-bold leading-tight">{product.name}</h3>
                            <p className="mt-2 font-bold text-primary tabular-nums">
                              {product.price.toLocaleString()} FCFA
                            </p>
                          </Link>
                          {product.stock <= 0 ? (
                            <span
                              className={cn(
                                buttonVariants({ size: 'sm' }),
                                'shrink-0 self-end rounded-full bg-muted px-4 py-2.5 text-muted-foreground shadow-md sm:px-5 sm:py-3'
                              )}
                            >
                              Épuisé
                            </span>
                          ) : (
                            <Link
                              to={`/product/${product.id}`}
                              onClick={() => window.scrollTo(0, 0)}
                              className={cn(
                                buttonVariants({ size: 'sm' }),
                                'shrink-0 self-end rounded-full bg-primary px-4 py-2.5 text-primary-foreground shadow-lg hover:bg-primary/90 sm:px-5 sm:py-3'
                              )}
                            >
                              Commander
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>

                    {product.stock <= 0 && (
                      <div className="absolute inset-0 z-20 flex items-center justify-center rounded-[40px] bg-black/40 backdrop-blur-[2px]">
                        <Badge className="rounded-full border-none bg-destructive px-4 py-2 font-sans text-[10px] uppercase tracking-[0.3em] text-white shadow-xl">
                          Rupture de Stock
                        </Badge>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const Storytelling = () => {
  return (
    <section className="relative overflow-x-clip bg-muted/30 py-12 sm:py-16 md:py-32">
      <div className="container mx-auto max-w-full px-3 sm:px-4 md:px-6">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-24">
          <div className="relative order-2 lg:order-1">
            <div className="grid grid-cols-2 gap-4">
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 1 }}
                viewport={{ once: true }}
                className="mt-8 aspect-[3/4] overflow-hidden rounded-3xl sm:mt-12 sm:rounded-[60px]"
              >
                <img 
                  src="/PHOTO-2026-04-15-18-25-35.jpg" 
                  alt="Travail de l'artiste" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                  decoding="async"
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: -40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.2 }}
                viewport={{ once: true }}
                className="aspect-[3/4] overflow-hidden rounded-3xl sm:rounded-[60px]"
              >
                <img 
                  src="/PHOTO-2026-04-15-18-25-32.jpg" 
                  alt="Marie-Ange Djédji" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                  decoding="async"
                />
              </motion.div>
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-accent/20 rounded-full blur-3xl -z-10"></div>
          </div>

          <div className="space-y-10 order-1 lg:order-2">
            <div className="space-y-4">
              <span className="text-primary font-bold uppercase tracking-[0.4em] text-[10px]">L'Âme de la Marque</span>
              <h2 className="text-3xl font-serif font-bold leading-tight sm:text-4xl md:text-7xl">
                L'Histoire de <br /> <span className="italic">Marie-Ange</span>
              </h2>
            </div>
            
            <div className="space-y-6 text-base font-light leading-relaxed text-muted-foreground sm:space-y-8 sm:text-lg">
              <p>
                Depuis son plus jeune âge, Marie-Ange Djédji a toujours été animée par une passion profonde pour la création et l'art. Poids Baoulé est née de cette vision : valoriser un savoir-faire unique et créer des pièces qui racontent une histoire.
              </p>
              <p className="border-l-2 border-primary/20 pl-4 italic sm:pl-8">
                "Chaque pièce est une œuvre originale, sculptée à la main en ciment blanc et plâtre, célébrant l'esthétique Wabi-Sabi — où l'imperfection devient une marque d'élégance unique."
              </p>
            </div>

            <Link to="/story">
              <Button
                variant="outline"
                className="h-14 w-full rounded-full border-primary px-8 text-primary transition-all duration-500 hover:bg-primary hover:text-white sm:h-auto sm:w-auto sm:px-10 sm:py-8"
              >
                Découvrir notre Univers
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

const CategoriesMarquee = () => {
  const categories = [
    { name: 'Masques', icon: '' },
    { name: 'Mobilier', icon: '' },
    { name: 'Miroirs', icon: '' },
    { name: 'Vases', icon: '' },
    { name: 'Sculptures', icon: '' },
    { name: 'Luminaires', icon: '' },
  ];

  return (
    <section className="overflow-x-clip border-y border-terracotta-100 bg-terracotta-50 py-12 sm:py-16 md:py-32">
      <div className="flex whitespace-nowrap">
        <motion.div 
          animate={{ x: [0, -1000] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="flex items-center gap-12 pr-12 sm:gap-24 sm:pr-24"
        >
          {[...categories, ...categories].map((cat, index) => (
            <Link 
              key={index} 
              to={`/shop?cat=${cat.name}`}
              className="flex items-center gap-6 group"
            >
              <span className="text-5xl opacity-40 group-hover:opacity-100 transition-opacity">{cat.icon}</span>
              <span className="text-4xl font-serif font-bold uppercase tracking-tighter text-terracotta-900/10 transition-colors group-hover:text-primary sm:text-6xl md:text-[100px]">
                {cat.name}
              </span>
            </Link>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default function Home() {
  return (
    <div className="min-w-0 max-w-[100vw] overflow-x-clip pt-0">
      <Hero />
      <FeaturedProducts />
      <Storytelling />
      <CategoriesMarquee />
      <CustomerTestimonialsSection />
      
      {/* CTA Section */}
      <section className="bg-background px-1 py-16 sm:py-24">
        <div className="container mx-auto max-w-full px-3 text-center sm:px-4">
          <div className="mx-auto max-w-3xl space-y-6 sm:space-y-8">
            <h2 className="text-3xl font-serif font-bold sm:text-4xl md:text-6xl">
              Prêt à transformer <br /> votre intérieur ?
            </h2>
            <p className="text-base text-muted-foreground sm:text-lg">
              Réservez votre consultation personnalisée ou commandez une pièce sur mesure adaptée à votre espace.
            </p>
            <div className="flex w-full max-w-md flex-col items-stretch justify-center gap-3 sm:mx-auto sm:max-w-none sm:flex-row sm:items-center sm:gap-4">
              <Link to="/services" className="w-full sm:w-auto" onClick={() => window.scrollTo(0, 0)}>
                <Button size="lg" className="h-14 w-full rounded-full px-8 text-base sm:h-auto sm:w-auto sm:px-10 sm:py-8 sm:text-lg">
                  Réserver une Consultation
                </Button>
              </Link>
              <Link to="/custom" className="w-full sm:w-auto" onClick={() => window.scrollTo(0, 0)}>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-14 w-full rounded-full border-primary px-8 text-base text-primary hover:bg-primary hover:text-white sm:h-auto sm:w-auto sm:px-10 sm:py-8 sm:text-lg"
                >
                  Créer ma pièce unique
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
