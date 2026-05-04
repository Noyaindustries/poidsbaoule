import { useState } from 'react';
import { motion } from 'motion/react';
import { Send, Upload, Info, CheckCircle2, Clock, Palette, Ruler } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { useReservations } from '@/lib/ReservationContext';

export default function CustomOrder() {
  const [isSubmitted, setIsSubmitted] = useState(false);

  const { addCustomOrder } = useReservations();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    type: '',
    deadline: '',
    description: '',
    dimensions: '',
    finish: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    await addCustomOrder({
      customerName: formData.name,
      email: formData.email,
      description: formData.description,
      dimensions: formData.dimensions,
      finish: formData.finish,
      color: formData.finish, // Using same field for simplicity or could split
      type: formData.type,
      moodboard: [],
      preferredDeadline: formData.deadline
    });

    setIsSubmitted(true);
    toast.success("Demande envoyée !", {
      description: "Nous vous recontacterons sous 48h avec un devis personnalisé.",
    });
  };

  if (isSubmitted) {
    return (
      <div className="container mx-auto max-w-full space-y-6 px-3 pb-20 pt-28 text-center sm:max-w-2xl sm:space-y-8 sm:px-4 sm:pb-24 sm:pt-32">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex flex-col items-center gap-6"
        >
          <div className="h-24 w-24 bg-primary/10 rounded-full flex items-center justify-center">
            <CheckCircle2 className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-4xl font-serif font-bold">Merci pour votre confiance</h1>
          <p className="text-muted-foreground text-lg">
            Votre demande de création sur mesure a bien été reçue. Marie-Ange et son équipe étudient votre projet et vous enverront un devis détaillé par email dans un délai de 48h.
          </p>
          <Button variant="outline" className="rounded-full" onClick={() => setIsSubmitted(false)}>
            Envoyer une autre demande
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-w-0 max-w-[100vw] overflow-x-clip pb-16 pt-20 sm:pb-24 sm:pt-24">
      {/* Header */}
      <section className="relative overflow-hidden py-20 sm:py-32 md:py-40">
        <div className="absolute inset-0 bg-primary -z-10" />
        <div className="absolute inset-0 opacity-20 mix-blend-overlay">
          <img src="https://picsum.photos/seed/texture-art/1920/1080" alt="Texture" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
        </div>
        <div className="absolute top-0 right-0 w-1/2 h-full bg-white/5 -skew-x-12 translate-x-1/2 -z-10" />
        
        <div className="container relative z-10 mx-auto max-w-full space-y-6 px-3 text-center sm:space-y-8 sm:px-4 md:px-6">
          <motion.span 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[10px] uppercase tracking-[0.5em] font-bold text-white/60 block"
          >
            Co-Création Artisanale
          </motion.span>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-[clamp(2.25rem,10vw,4rem)] font-serif font-bold leading-[0.9] text-white sm:text-6xl md:text-8xl"
          >
            Le <span className="italic">Sur Mesure</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mx-auto max-w-3xl text-base font-light leading-relaxed text-white/80 sm:text-lg md:text-xl"
          >
            Donnez vie à vos visions les plus audacieuses. Nous sculptons des pièces uniques qui s'adaptent parfaitement à l'architecture de votre âme et de votre espace.
          </motion.p>
        </div>
      </section>

      <div className="container mx-auto -mt-12 max-w-full px-3 sm:-mt-16 sm:px-4 md:-mt-20 md:px-6">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16 xl:gap-24">
          {/* Process Info */}
          <div className="lg:col-span-4 space-y-16">
            <div className="space-y-6">
              <h2 className="text-4xl font-serif font-bold leading-tight">Comment ça <br /> <span className="italic">marche ?</span></h2>
              <p className="text-muted-foreground text-lg font-light leading-relaxed">Un processus collaboratif pour une pièce qui vous ressemble, de l'esquisse à l'installation.</p>
            </div>
 
            <div className="space-y-12">
              {[
                { num: "01", title: "Votre Demande", desc: "Remplissez le formulaire avec vos envies, dimensions et inspirations." },
                { num: "02", title: "Étude & Devis", desc: "Nous analysons la faisabilité et vous envoyons un devis sous 48h." },
                { num: "03", title: "Fabrication", desc: "Une fois validé, nous sculptons votre pièce à la main (délai 2-4 semaines)." },
                { num: "04", title: "Livraison", desc: "Votre œuvre unique est livrée et installée chez vous." },
              ].map((step, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex gap-8 group"
                >
                  <div className="h-16 w-16 rounded-[20px] bg-primary/5 flex items-center justify-center shrink-0 font-serif font-bold text-2xl text-primary/40 group-hover:bg-primary group-hover:text-white transition-all duration-500">
                    {step.num}
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-bold uppercase tracking-[0.2em] text-[10px] text-primary">{step.title}</h3>
                    <p className="text-muted-foreground font-light leading-relaxed">{step.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
 
            <div className="p-10 rounded-[40px] bg-muted/30 border border-primary/5 space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
              <Info className="h-8 w-8 text-primary/40" />
              <p className="text-lg leading-relaxed italic font-serif text-foreground/80">
                "Chaque pièce sur mesure est le fruit d'un dialogue entre votre vision et notre savoir-faire. C'est ce qui rend l'artisanat si précieux."
              </p>
              <p className="text-[10px] uppercase tracking-widest font-bold opacity-40">— Marie-Ange Djédji</p>
            </div>
          </div>
 
          {/* Form */}
          <div className="lg:col-span-8">
            <form
              onSubmit={handleSubmit}
              className="space-y-8 rounded-3xl border-none bg-white/80 p-6 shadow-2xl backdrop-blur-md sm:space-y-12 sm:rounded-[60px] sm:p-10 md:p-16 lg:p-20"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-3">
                  <Label htmlFor="name" className="text-[10px] uppercase tracking-[0.2em] font-bold ml-4">Nom complet</Label>
                  <Input id="name" placeholder="Votre nom" required className="h-16 rounded-full px-8 bg-muted/20 border-none focus:bg-white transition-all" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="email" className="text-[10px] uppercase tracking-[0.2em] font-bold ml-4">Email</Label>
                  <Input id="email" type="email" placeholder="votre@email.com" required className="h-16 rounded-full px-8 bg-muted/20 border-none focus:bg-white transition-all" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-3">
                  <Label htmlFor="type" className="text-[10px] uppercase tracking-[0.2em] font-bold ml-4">Type de pièce</Label>
                  <Select onValueChange={(val: string) => setFormData({...formData, type: val})}>
                    <SelectTrigger className="h-16 rounded-full px-8 bg-muted/20 border-none focus:bg-white transition-all">
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl">
                      <SelectItem value="Masque">Masque</SelectItem>
                      <SelectItem value="Miroir">Miroir</SelectItem>
                      <SelectItem value="Meuble Niche">Meuble Niche</SelectItem>
                      <SelectItem value="Vase / Objet Déco">Vase / Objet Déco</SelectItem>
                      <SelectItem value="Autre">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-3">
                  <Label htmlFor="deadline" className="text-[10px] uppercase tracking-[0.2em] font-bold ml-4">Délai souhaité</Label>
                  <Select onValueChange={(val: string) => setFormData({...formData, deadline: val})}>
                    <SelectTrigger className="h-16 rounded-full px-8 bg-muted/20 border-none focus:bg-white transition-all">
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl">
                      <SelectItem value="urgent">Moins de 2 semaines</SelectItem>
                      <SelectItem value="normal">2 à 4 semaines</SelectItem>
                      <SelectItem value="flexible">Flexible</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="description" className="text-[10px] uppercase tracking-[0.2em] font-bold ml-4">Description de votre projet</Label>
                <Textarea 
                  id="description" 
                  placeholder="Décrivez votre idée, le style recherché, l'emplacement prévu..." 
                  className="min-h-[200px] rounded-[40px] p-8 bg-muted/20 border-none focus:bg-white transition-all"
                  required
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-3">
                  <Label htmlFor="dimensions" className="text-[10px] uppercase tracking-[0.2em] font-bold ml-4">Dimensions approximatives</Label>
                  <div className="relative">
                    <Ruler className="absolute left-6 top-6 h-5 w-5 text-primary/40" />
                    <Input id="dimensions" placeholder="ex: 120 x 80 cm" className="h-16 rounded-full pl-16 pr-8 bg-muted/20 border-none focus:bg-white transition-all" value={formData.dimensions} onChange={e => setFormData({...formData, dimensions: e.target.value})} />
                  </div>
                </div>
                <div className="space-y-3">
                  <Label htmlFor="finish" className="text-[10px] uppercase tracking-[0.2em] font-bold ml-4">Finition & Couleur</Label>
                  <div className="relative">
                    <Palette className="absolute left-6 top-6 h-5 w-5 text-primary/40" />
                    <Input id="finish" placeholder="ex: Ciment blanc, Terracotta..." className="h-16 rounded-full pl-16 pr-8 bg-muted/20 border-none focus:bg-white transition-all" value={formData.finish} onChange={e => setFormData({...formData, finish: e.target.value})} />
                  </div>
                </div>
              </div>
 
              <div className="space-y-6">
                <Label className="text-[10px] uppercase tracking-[0.2em] font-bold ml-4">Photos d'inspiration (Moodboard)</Label>
                <div className="border-2 border-dashed border-primary/10 rounded-[40px] p-16 text-center space-y-6 hover:bg-primary/5 transition-all cursor-pointer group">
                  <div className="h-20 w-20 bg-primary/5 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                    <Upload className="h-8 w-8 text-primary/40" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-xl font-serif font-bold">Cliquez pour uploader</p>
                    <p className="text-sm text-muted-foreground font-light">PNG, JPG jusqu'à 5MB (Max 5 photos)</p>
                  </div>
                </div>
              </div>
 
              <Button type="submit" className="w-full h-20 rounded-full text-xl font-bold shadow-2xl shadow-primary/20">
                Envoyer ma demande <Send className="ml-3 h-6 w-6" />
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
