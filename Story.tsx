import { motion } from 'motion/react';
import { Quote, Heart, Sparkles, MapPin } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export default function Story() {
  return (
    <div className="pt-24 pb-24">
      {/* Hero */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="/PHOTO-2026-04-15-18-25-32.jpg" 
            alt="Atelier Poids Baoulé" 
            className="w-full h-full object-cover brightness-50"
            referrerPolicy="no-referrer"
            loading="lazy"
            decoding="async"
          />
        </div>
        <div className="container relative z-10 px-4 text-center text-white space-y-4">
          <h1 className="text-5xl md:text-7xl font-serif font-bold">Notre Histoire</h1>
          <p className="text-xl font-light tracking-widest uppercase opacity-80">L'âme de l'artisanat Ivoirien</p>
        </div>
      </section>

      <div className="container mx-auto px-4 mt-24">
        <div className="max-w-4xl mx-auto space-y-24">
          {/* Vision Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <span className="text-primary font-bold uppercase tracking-widest text-xs">Vision fondatrice</span>
              <h2 className="text-4xl font-serif font-bold leading-tight">Allier tradition et modernité</h2>
              <p className="text-muted-foreground leading-relaxed">
                Poids Baoulé Home Design est née d'une volonté simple mais profonde : valoriser le savoir-faire artisanal de la Côte d'Ivoire tout en l'intégrant dans les intérieurs contemporains. 
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Fondée par Marie-Ange Djédji à Abidjan, la marque s'inspire de la richesse culturelle locale et de l'esthétique Wabi-Sabi, qui trouve la beauté dans l'imperfection et l'authenticité des matières.
              </p>
            </div>
            <div className="rounded-3xl overflow-hidden aspect-square shadow-2xl">
              <img src="/PHOTO-2026-04-15-18-25-33_4.jpg" alt="Vision" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
          </div>

          <Separator className="opacity-20" />

          {/* Founder Quote */}
          <div className="text-center space-y-8 py-12">
            <Quote className="h-12 w-12 text-primary mx-auto opacity-30" />
            <h3 className="text-3xl md:text-5xl font-serif font-bold italic leading-tight max-w-3xl mx-auto">
              "Chaque pièce que nous créons raconte une histoire. C'est un dialogue entre la main de l'artisan et la matière brute."
            </h3>
            <div className="space-y-1">
              <p className="font-bold uppercase tracking-widest text-sm">Marie-Ange Djédji</p>
              <p className="text-xs text-muted-foreground">Fondatrice & Directrice Artistique</p>
            </div>
          </div>

          <Separator className="opacity-20" />

          {/* Values Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center space-y-4">
              <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary">
                <Heart className="h-8 w-8" />
              </div>
              <h4 className="font-bold uppercase tracking-widest text-sm">Passion</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">Un amour inconditionnel pour l'art et la création manuelle qui se ressent dans chaque détail.</p>
            </div>
            <div className="text-center space-y-4">
              <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary">
                <Sparkles className="h-8 w-8" />
              </div>
              <h4 className="font-bold uppercase tracking-widest text-sm">Authenticité</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">Des matériaux bruts et naturels travaillés avec respect pour préserver leur caractère originel.</p>
            </div>
            <div className="text-center space-y-4">
              <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary">
                <MapPin className="h-8 w-8" />
              </div>
              <h4 className="font-bold uppercase tracking-widest text-sm">Local</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">Une production 100% Ivoirienne, soutenant l'économie locale et les artisans d'Abidjan.</p>
            </div>
          </div>

          {/* Atelier Section */}
          <div className="bg-muted/30 rounded-[3rem] p-12 md:p-24 space-y-12">
            <div className="text-center space-y-4">
              <h2 className="text-4xl font-serif font-bold">L'Atelier</h2>
              <p className="text-muted-foreground max-w-xl mx-auto">C'est ici, au cœur d'Abidjan, que la magie opère. Entre poussière de plâtre et pigments naturels.</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="rounded-2xl overflow-hidden aspect-square"><img src="/PHOTO-2026-04-15-18-25-33_1.jpg" className="w-full h-full object-cover" referrerPolicy="no-referrer" /></div>
              <div className="rounded-2xl overflow-hidden aspect-square"><img src="/PHOTO-2026-04-15-18-25-33_2.jpg" className="w-full h-full object-cover" referrerPolicy="no-referrer" /></div>
              <div className="rounded-2xl overflow-hidden aspect-square hidden md:block"><img src="/PHOTO-2026-04-15-18-25-34.jpg" className="w-full h-full object-cover" referrerPolicy="no-referrer" /></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
