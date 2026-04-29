import { motion } from 'motion/react';
import { ChevronRight, ArrowRight, Star, Quote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { useProducts } from '@/lib/ProductContext';

const Hero = () => {
  return (
    <section className="relative min-h-screen w-full overflow-hidden flex items-center">
      {/* Background Image with Parallax-like feel */}
      <div className="absolute inset-0 z-0">
        <motion.div 
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="w-full h-full"
        >
          <img 
            src="/PHOTO-2026-04-15-18-25-32_1.jpg" 
            alt="Atelier Poids Baoulé" 
            className="w-full h-full object-cover brightness-[0.4]"
            referrerPolicy="no-referrer"
            fetchPriority="high"
            loading="eager"
            decoding="async"
          />
        </motion.div>
      </div>
      
      <div className="container relative z-10 px-4 mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="lg:col-span-8 space-y-8"
          >
            <div className="space-y-2">
              <motion.span 
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6 }}
                transition={{ delay: 0.5 }}
                className="text-xs uppercase tracking-[0.5em] font-bold text-white block"
              >
                Artisanat d'Exception • Abidjan
              </motion.span>
              <h1 className="text-4xl sm:text-6xl md:text-[100px] lg:text-[120px] font-serif font-bold leading-[0.85] text-white">
                L'Âme de <br /> 
                <span className="italic text-accent ml-2 md:ml-12">l'Objet</span>
              </h1>
            </div>
            
            <p className="max-w-xl text-lg md:text-xl font-light text-white/80 font-sans leading-relaxed">
              Des créations en ciment blanc et plâtre qui célèbrent l'imperfection sacrée. Chaque pièce est une sculpture vivante pour votre sanctuaire personnel.
            </p>
            
            <div className="flex flex-wrap items-center gap-6 pt-4">
              <Link to="/shop" onClick={() => window.scrollTo(0, 0)}>
                <Button size="lg" className="rounded-full px-10 py-8 text-lg bg-primary hover:bg-primary/90 shadow-2xl shadow-primary/20">
                  Explorer la Collection
                </Button>
              </Link>
              <Link to="/services" className="group flex items-center gap-3 text-white font-bold tracking-widest uppercase text-xs" onClick={() => window.scrollTo(0, 0)}>
                <span>Prestations Déco</span>
                <div className="h-[1px] w-12 bg-white/30 group-hover:w-20 transition-all duration-500"></div>
              </Link>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.8, rotate: 5 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ delay: 0.3, duration: 1.2 }}
            className="hidden lg:block lg:col-span-4"
          >
            <div className="relative aspect-[3/4] rounded-[100px] overflow-hidden border-[12px] border-white/10 backdrop-blur-sm">
              <img 
                src="/PHOTO-2026-04-15-18-25-32_2.jpg" 
                className="w-full h-full object-cover"
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
  const featured = products.slice(0, 3);

  return (
    <section className="py-16 md:py-32 bg-background overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-24">
          <div className="lg:col-span-5 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="space-y-4"
            >
              <span className="text-primary font-bold uppercase tracking-[0.3em] text-[10px]">Curated Selection</span>
              <h2 className="text-4xl md:text-7xl font-serif font-bold leading-tight">Nos Pièces <br /> <span className="italic">Iconiques</span></h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
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

          <div className="lg:col-span-7">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {featured.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.2, duration: 0.8 }}
                  viewport={{ once: true }}
                  className={index === 0 ? "md:col-span-2" : ""}
                >
                  <Link to={`/product/${product.id}`} className="group block relative" onClick={() => window.scrollTo(0, 0)}>
                    <div className={`relative overflow-hidden rounded-[40px] bg-muted ${index === 0 ? 'aspect-[16/9]' : 'aspect-[4/5]'}`}>
                      <img 
                        src={product.images[0]} 
                        alt={product.name} 
                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                        referrerPolicy="no-referrer"
                        loading="lazy"
                        decoding="async"
                      />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      
                      <div className="absolute bottom-8 left-8 right-8 flex justify-between items-end translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 md:flex hidden">
                        <div className="bg-white/90 backdrop-blur-md p-6 rounded-3xl shadow-2xl">
                          <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">{product.category}</p>
                          <h3 className="text-xl font-serif font-bold">{product.name}</h3>
                          <p className="text-primary font-bold mt-2">{product.price.toLocaleString()} FCFA</p>
                        </div>
                        <Button 
                          size="sm" 
                          className="rounded-full px-6 py-3 bg-primary text-primary-foreground hover:bg-primary/90 shadow-2xl"
                          disabled={product.stock <= 0}
                        >
                          {product.stock <= 0 ? "Épuisé" : "Commander"}
                        </Button>
                      </div>

                      {product.stock <= 0 && (
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center">
                          <Badge className="bg-destructive text-white border-none font-sans uppercase text-[10px] tracking-[0.3em] px-4 py-2 rounded-full shadow-xl">
                            Rupture de Stock
                          </Badge>
                        </div>
                      )}

                      {/* Mobile: Always visible */}
                      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent md:hidden">
                        <div className="text-white">
                          <p className="text-[10px] uppercase tracking-widest text-white/80 mb-1">{product.category}</p>
                          <h3 className="text-lg font-serif font-bold mb-2">{product.name}</h3>
                          <p className="text-white font-bold mb-3">{product.price.toLocaleString()} FCFA</p>
                          <Button size="sm" className="rounded-full px-4 py-2 bg-white text-black hover:bg-white/90">
                            Commander
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Link>
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
    <section className="py-16 md:py-32 bg-muted/30 overflow-hidden relative">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
          <div className="relative order-2 lg:order-1">
            <div className="grid grid-cols-2 gap-4">
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 1 }}
                viewport={{ once: true }}
                className="rounded-[60px] overflow-hidden aspect-[3/4] mt-12"
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
                className="rounded-[60px] overflow-hidden aspect-[3/4]"
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
              <h2 className="text-4xl md:text-7xl font-serif font-bold leading-tight">L'Histoire de <br /> <span className="italic">Marie-Ange</span></h2>
            </div>
            
            <div className="space-y-8 text-muted-foreground leading-relaxed text-lg font-light">
              <p>
                Depuis son plus jeune âge, Marie-Ange Djédji a toujours été animée par une passion profonde pour la création et l'art. Poids Baoulé est née de cette vision : valoriser un savoir-faire unique et créer des pièces qui racontent une histoire.
              </p>
              <p className="border-l-2 border-primary/20 pl-8 italic">
                "Chaque pièce est une œuvre originale, sculptée à la main en ciment blanc et plâtre, célébrant l'esthétique Wabi-Sabi — où l'imperfection devient une marque d'élégance unique."
              </p>
            </div>

            <Link to="/story">
              <Button variant="outline" className="rounded-full px-10 py-8 border-primary text-primary hover:bg-primary hover:text-white transition-all duration-500">
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
    <section className="py-16 md:py-32 bg-terracotta-50 border-y border-terracotta-100 overflow-hidden">
      <div className="flex whitespace-nowrap">
        <motion.div 
          animate={{ x: [0, -1000] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="flex gap-24 items-center pr-24"
        >
          {[...categories, ...categories].map((cat, index) => (
            <Link 
              key={index} 
              to={`/shop?cat=${cat.name}`}
              className="flex items-center gap-6 group"
            >
              <span className="text-5xl opacity-40 group-hover:opacity-100 transition-opacity">{cat.icon}</span>
              <span className="text-6xl md:text-[100px] font-serif font-bold text-terracotta-900/10 group-hover:text-primary transition-colors uppercase tracking-tighter">
                {cat.name}
              </span>
            </Link>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

const Testimonials = () => {
  const testimonials = [
    {
      name: "Sarah K.",
      role: "Architecte d'intérieur",
      content: "Les pièces de Poids Baoulé apportent une âme incroyable à mes projets. La texture et la pureté du ciment blanc sont uniques.",
      stars: 5
    },
    {
      name: "Jean-Marc A.",
      role: "Collectionneur",
      content: "Un travail artisanal d'une finesse rare. Le masque Songe Rêvé est devenu la pièce centrale de mon salon.",
      stars: 5
    },
    {
      name: "Leila B.",
      role: "Cliente",
      content: "Le service de consultation déco m'a permis de transformer mon appartement en un véritable havre de paix Wabi-Sabi.",
      stars: 5
    }
  ];

  return (
    <section className="py-24 bg-primary text-white overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <div className="absolute top-10 left-10 w-64 h-64 border border-white rounded-full"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 border border-white rounded-full"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16 space-y-4">
          <span className="uppercase tracking-[0.3em] text-xs opacity-80">Témoignages</span>
          <h2 className="text-4xl md:text-5xl font-serif font-bold">Ce que disent nos clients</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="bg-white/10 border-white/20 backdrop-blur-sm text-white h-full">
                <CardContent className="p-8 flex flex-col justify-between h-full space-y-6">
                  <Quote className="h-10 w-10 text-accent opacity-50" />
                  <p className="text-lg italic font-light leading-relaxed">"{t.content}"</p>
                  <div className="space-y-2">
                    <div className="flex gap-1">
                      {[...Array(t.stars)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-accent text-accent" />
                      ))}
                    </div>
                    <div>
                      <p className="font-bold">{t.name}</p>
                      <p className="text-xs opacity-60 uppercase tracking-widest">{t.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default function Home() {
  return (
    <div className="pt-0">
      <Hero />
      <FeaturedProducts />
      <Storytelling />
      <CategoriesMarquee />
      <Testimonials />
      
      {/* CTA Section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto space-y-8">
            <h2 className="text-4xl md:text-6xl font-serif font-bold">Prêt à transformer <br /> votre intérieur ?</h2>
            <p className="text-lg text-muted-foreground">
              Réservez votre consultation personnalisée ou commandez une pièce sur mesure adaptée à votre espace.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/services" onClick={() => window.scrollTo(0, 0)}>
                <Button size="lg" className="rounded-full px-10 py-8 text-lg">
                  Réserver une Consultation
                </Button>
              </Link>
              <Link to="/custom" onClick={() => window.scrollTo(0, 0)}>
                <Button size="lg" variant="outline" className="rounded-full px-10 py-8 text-lg border-primary text-primary hover:bg-primary hover:text-white">
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
