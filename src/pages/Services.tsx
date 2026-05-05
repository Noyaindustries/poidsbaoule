import { useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Calendar, Home, Palette, Sparkles, CheckCircle2, ArrowRight, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useReservations } from '@/lib/ReservationContext';

export default function Services() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formError, setFormError] = useState('');
  const [selectedServiceTitle, setSelectedServiceTitle] = useState('');
  const bookingFormRef = useRef<HTMLElement | null>(null);

  const services = [
    {
      title: "Consultation déco à domicile",
      description: "Un rendez-vous d'une heure pour échanger sur vos envies, optimiser votre espace et définir une direction artistique.",
      price: "Sur devis",
      icon: <Home className="h-8 w-8" />,
      features: ["Analyse de l'espace", "Conseils d'aménagement", "Recommandations shopping", "Abidjan et environs"]
    },
    {
      title: "Aménagement d'intérieur complet",
      description: "Une prise en charge totale de votre projet, de la conception 3D à la mise en scène finale de vos pièces.",
      price: "Sur devis",
      icon: <Sparkles className="h-8 w-8" />,
      features: ["Plans & 3D", "Sélection mobilier & objets", "Suivi de chantier", "Mise en scène finale"]
    },
    {
      title: "Conseil couleurs & matières",
      description: "Définition d'une palette chromatique et choix des textures pour créer une atmosphère harmonieuse et apaisante.",
      price: "Sur devis",
      icon: <Palette className="h-8 w-8" />,
      features: ["Nuancier personnalisé", "Échantillons matières", "Harmonie globale", "Dossier technique"]
    }
  ];

  const { addReservation } = useReservations();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    service: '',
    surface: '',
    neighborhood: '',
    description: '',
    projectType: '',
    interventionType: '',
    preferredDate: '',
    preferredTimeSlot: '',
    estimatedDurationHours: '2',
    city: 'Abidjan',
    addressNote: '',
    rooms: '',
    estimatedCost: '',
    optionsShoppingList: true,
    options3dPlan: false,
    optionsInstallationStyling: false,
    optionsFollowUpVisit: false,
    notes: '',
  });

  const selectServiceAndGoToForm = (serviceTitle: string) => {
    const serviceMap: Record<string, string> = {
      "Consultation déco à domicile": "Consultation déco",
      "Aménagement d'intérieur complet": "Aménagement complet",
      "Conseil couleurs & matières": "Conseil couleurs",
    };

    const serviceValue = serviceMap[serviceTitle];
    if (!serviceValue) {
      return;
    }

    setSelectedServiceTitle(serviceTitle);
    setFormData((prev) => ({ ...prev, service: serviceValue }));
    setFormError('');
    bookingFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const surface = Number(formData.surface);
    const estimatedDurationHours = Number(formData.estimatedDurationHours);
    const estimatedCost = Number(formData.estimatedCost);

    if (!formData.service || !formData.projectType || !formData.interventionType) {
      setFormError('Veuillez sélectionner la prestation, le type de projet et le mode d’intervention.');
      return;
    }
    if (!formData.preferredDate || !formData.preferredTimeSlot) {
      setFormError('Veuillez renseigner une date et un créneau souhaités.');
      return;
    }
    if (!Number.isFinite(surface) || surface <= 0) {
      setFormError('La surface doit être un nombre positif.');
      return;
    }
    if (!Number.isFinite(estimatedDurationHours) || estimatedDurationHours < 1) {
      setFormError('La durée estimée doit être d’au moins 1 heure.');
      return;
    }
    if (!Number.isFinite(estimatedCost) || estimatedCost <= 0) {
      setFormError('Le coût estimatif doit être un montant valide.');
      return;
    }

    try {
      await addReservation({
        customerName: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        type: formData.service as 'Consultation déco' | 'Aménagement complet' | 'Conseil couleurs' | 'Mise en scène',
        description: formData.description.trim(),
        surface,
        neighborhood: formData.neighborhood.trim(),
        preferredDates: [new Date(formData.preferredDate)],
        budget: `${estimatedCost.toLocaleString('fr-FR')} FCFA`,
        photos: [],
        serviceDetails: {
          projectType: formData.projectType as 'Résidentiel' | 'Commercial' | 'Hôtellerie' | 'Bureau' | 'Autre',
          interventionType: formData.interventionType as 'À domicile' | 'À distance' | 'Hybride',
          preferredDate: formData.preferredDate,
          preferredTimeSlot: formData.preferredTimeSlot as 'Matin (09h-12h)' | 'Après-midi (14h-18h)' | 'Soirée (18h-20h)',
          estimatedDurationHours,
          roomsInScope: formData.rooms
            .split(',')
            .map((v) => v.trim())
            .filter(Boolean),
          options: {
            shoppingList: formData.optionsShoppingList,
            ['3dPlan']: formData.options3dPlan,
            installationStyling: formData.optionsInstallationStyling,
            followUpVisit: formData.optionsFollowUpVisit,
          },
          location: {
            city: formData.city.trim(),
            neighborhood: formData.neighborhood.trim(),
            addressNote: formData.addressNote.trim() || undefined,
          },
          estimatedCost,
          notes: formData.notes.trim() || undefined,
        },
      });

      setIsSubmitted(true);
      toast.success("Demande de réservation envoyée !");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Impossible d'envoyer la réservation.";
      setFormError(message);
      toast.error(message);
    }
  };

  if (isSubmitted) {
    return (
      <div className="container mx-auto max-w-full space-y-6 px-3 pb-20 pt-28 text-center sm:max-w-2xl sm:space-y-8 sm:px-4 sm:pb-24 sm:pt-32">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 sm:h-24 sm:w-24">
          <CheckCircle2 className="h-10 w-10 text-primary sm:h-12 sm:w-12" />
        </div>
        <h1 className="text-2xl font-serif font-bold sm:text-4xl">Demande Envoyée</h1>
        <p className="text-base text-muted-foreground sm:text-lg">
          Nous avons bien reçu votre demande de prestation. Un membre de notre équipe vous contactera par téléphone ou par email sous 24h pour confirmer vos disponibilités et finaliser la réservation.
        </p>
        <Button variant="outline" className="rounded-full" onClick={() => setIsSubmitted(false)}>
          Retour aux services
        </Button>
      </div>
    );
  }

  return (
    <div className="min-w-0 max-w-[100vw] overflow-x-clip pb-16 pt-20 sm:pb-24 sm:pt-24">
      {/* Hero */}
      <section className="relative flex min-h-[50vh] items-center overflow-hidden py-20 sm:min-h-[60vh] sm:py-32 md:py-40">
        <div className="absolute inset-0 z-0">
          <img 
            src="/PHOTO-2026-04-15-18-25-33.jpg" 
            alt="Poids Baoulé Interior" 
            className="w-full h-full object-cover brightness-[0.3]"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="absolute top-0 left-0 w-1/2 h-full bg-primary/5 skew-x-12 -translate-x-1/2 -z-10" />

        
        <div className="container mx-auto max-w-full space-y-6 px-3 text-center sm:space-y-8 sm:px-4 md:px-6">
          <motion.span 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[10px] uppercase tracking-[0.5em] font-bold text-primary block"
          >
            Art de Vivre • Design d'Intérieur
          </motion.span>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-[clamp(2.25rem,10vw,4rem)] font-serif font-bold leading-[0.9] sm:text-6xl md:text-8xl"
          >
            Sublimez votre <br /> <span className="italic">Sanctuaire</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mx-auto max-w-3xl text-base font-light leading-relaxed text-muted-foreground sm:text-lg md:text-xl"
          >
            Marie-Ange Djédji et son équipe vous accompagnent dans la création d'intérieurs qui ont une âme, inspirés par la nature, la matière et l'artisanat d'exception.
          </motion.p>
        </div>
      </section>

      <div className="container mx-auto -mt-12 max-w-full px-3 sm:-mt-16 sm:px-4 md:-mt-20 md:px-6">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-12">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2, duration: 0.8 }}
              viewport={{ once: true }}
            >
              <Card
                className={`h-full border-none shadow-2xl transition-all duration-700 rounded-[50px] overflow-hidden group bg-white/80 backdrop-blur-md ${
                  selectedServiceTitle === service.title
                    ? 'ring-2 ring-primary/30 shadow-primary/20'
                    : 'hover:shadow-primary/10'
                }`}
              >
                <CardContent className="flex h-full flex-col space-y-8 p-6 sm:space-y-10 sm:p-10 md:p-12">
                  <div className="h-20 w-20 rounded-[30px] bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-700 group-hover:scale-110 group-hover:rotate-6">
                    {service.icon}
                  </div>
                  <div className="space-y-6 flex-grow">
                    <h3 className="text-3xl font-serif font-bold leading-tight">{service.title}</h3>
                    <p className="text-muted-foreground text-lg font-light leading-relaxed">{service.description}</p>
                    <ul className="space-y-4 pt-6">
                      {service.features.map(f => (
                        <li key={f} className="flex items-center gap-4 text-xs font-bold uppercase tracking-[0.2em] opacity-60 group-hover:opacity-100 transition-opacity">
                          <CheckCircle2 className="h-5 w-5 text-primary/40" /> {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="pt-10 flex items-center justify-between border-t border-primary/5">
                    <span className="font-bold text-xl text-primary">{service.price}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      aria-label={`Choisir ${service.title} et aller au formulaire`}
                      aria-pressed={selectedServiceTitle === service.title}
                      onClick={() => selectServiceAndGoToForm(service.title)}
                      className={`h-14 w-14 rounded-full p-0 transition-all duration-500 group-hover:translate-x-2 focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 ${
                        selectedServiceTitle === service.title
                          ? 'bg-primary text-white'
                          : 'hover:bg-primary hover:text-white active:scale-95'
                      }`}
                    >
                      <ArrowRight className="h-6 w-6" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Booking Form */}
      <section ref={bookingFormRef} className="py-32">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-start">
            <div className="space-y-12">
              <div className="space-y-6">
                <h2 className="text-4xl md:text-5xl font-serif font-bold">Réserver une <br /> Prestation</h2>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  Prêt à commencer votre projet ? Remplissez ce formulaire et nous vous recontacterons pour fixer un premier rendez-vous.
                </p>
              </div>

              <div className="space-y-8">
                <div className="flex gap-6 items-start">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <MapPin className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-bold uppercase tracking-widest text-xs mb-1">Zone d'intervention</h4>
                    <p className="text-muted-foreground">Abidjan (Cocody, Marcory, Zone 4, Riviera) et Grand-Bassam.</p>
                  </div>
                </div>
                <div className="flex gap-6 items-start">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Calendar className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-bold uppercase tracking-widest text-xs mb-1">Disponibilités</h4>
                    <p className="text-muted-foreground">Du Lundi au Samedi, de 9h à 18h.</p>
                  </div>
                </div>
              </div>

              <div className="p-8 rounded-3xl bg-primary text-white space-y-4">
                <h4 className="font-serif text-2xl font-bold italic">"Votre maison doit raconter l'histoire de qui vous êtes, et être une collection de ce que vous aimez."</h4>
                <p className="text-xs uppercase tracking-widest opacity-70">— Marie-Ange Djédji</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-card border rounded-3xl p-8 md:p-12 space-y-8 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom complet</Label>
                  <Input id="name" placeholder="Votre nom" required className="rounded-xl" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input id="phone" placeholder="+225 ..." required className="rounded-xl" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="votre@email.com" required className="rounded-xl" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="service">Prestation souhaitée</Label>
                  <Select value={formData.service} onValueChange={(val: string) => setFormData({...formData, service: val})}>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Consultation déco">Consultation à domicile</SelectItem>
                      <SelectItem value="Aménagement complet">Aménagement complet</SelectItem>
                      <SelectItem value="Conseil couleurs">Conseil couleurs & matières</SelectItem>
                      <SelectItem value="Mise en scène">Mise en scène & styling</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="surface">Surface approx. (m²)</Label>
                  <Input id="surface" type="number" placeholder="ex: 50" className="rounded-xl" value={formData.surface} onChange={e => setFormData({...formData, surface: e.target.value})} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="projectType">Type de projet</Label>
                  <Select onValueChange={(val: string) => setFormData({...formData, projectType: val})}>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Résidentiel">Résidentiel</SelectItem>
                      <SelectItem value="Commercial">Commercial</SelectItem>
                      <SelectItem value="Hôtellerie">Hôtellerie</SelectItem>
                      <SelectItem value="Bureau">Bureau</SelectItem>
                      <SelectItem value="Autre">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="interventionType">Mode d'intervention</Label>
                  <Select onValueChange={(val: string) => setFormData({...formData, interventionType: val})}>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="À domicile">À domicile</SelectItem>
                      <SelectItem value="À distance">À distance</SelectItem>
                      <SelectItem value="Hybride">Hybride</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="preferredDate">Date souhaitée</Label>
                  <Input id="preferredDate" type="date" className="rounded-xl" value={formData.preferredDate} onChange={e => setFormData({...formData, preferredDate: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="preferredTimeSlot">Créneau</Label>
                  <Select onValueChange={(val: string) => setFormData({...formData, preferredTimeSlot: val})}>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Matin (09h-12h)">Matin (09h-12h)</SelectItem>
                      <SelectItem value="Après-midi (14h-18h)">Après-midi (14h-18h)</SelectItem>
                      <SelectItem value="Soirée (18h-20h)">Soirée (18h-20h)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="estimatedDurationHours">Durée estimée (h)</Label>
                  <Input id="estimatedDurationHours" type="number" min={1} className="rounded-xl" value={formData.estimatedDurationHours} onChange={e => setFormData({...formData, estimatedDurationHours: e.target.value})} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="neighborhood">Quartier / Commune (Abidjan)</Label>
                <Input id="neighborhood" placeholder="ex: Cocody Riviera 3" className="rounded-xl" value={formData.neighborhood} onChange={e => setFormData({...formData, neighborhood: e.target.value})} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="city">Ville</Label>
                  <Input id="city" placeholder="Abidjan" className="rounded-xl" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="estimatedCost">Coût estimatif (FCFA)</Label>
                  <Input id="estimatedCost" type="number" min={1} placeholder="ex: 180000" className="rounded-xl" value={formData.estimatedCost} onChange={e => setFormData({...formData, estimatedCost: e.target.value})} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="rooms">Pièces concernées (virgules)</Label>
                <Input id="rooms" placeholder="ex: Salon, Chambre parentale" className="rounded-xl" value={formData.rooms} onChange={e => setFormData({...formData, rooms: e.target.value})} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="addressNote">Précisions de lieu</Label>
                <Input id="addressNote" placeholder="Immeuble, étage, accès..." className="rounded-xl" value={formData.addressNote} onChange={e => setFormData({...formData, addressNote: e.target.value})} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Décrivez votre projet</Label>
                <Textarea id="description" placeholder="Quelles sont vos attentes ? Quel est le style actuel de votre espace ?" className="min-h-[120px] rounded-xl" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
              </div>

              <div className="space-y-3 rounded-2xl border border-primary/10 p-4">
                <p className="text-xs font-bold uppercase tracking-widest text-primary">Options souhaitées</p>
                <label className="flex items-center gap-3 text-sm"><input type="checkbox" checked={formData.optionsShoppingList} onChange={e => setFormData({...formData, optionsShoppingList: e.target.checked})} /> Shopping list personnalisée</label>
                <label className="flex items-center gap-3 text-sm"><input type="checkbox" checked={formData.options3dPlan} onChange={e => setFormData({...formData, options3dPlan: e.target.checked})} /> Plan 3D</label>
                <label className="flex items-center gap-3 text-sm"><input type="checkbox" checked={formData.optionsInstallationStyling} onChange={e => setFormData({...formData, optionsInstallationStyling: e.target.checked})} /> Mise en place / styling</label>
                <label className="flex items-center gap-3 text-sm"><input type="checkbox" checked={formData.optionsFollowUpVisit} onChange={e => setFormData({...formData, optionsFollowUpVisit: e.target.checked})} /> Visite de suivi</label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes complémentaires</Label>
                <Textarea id="notes" placeholder="Contraintes de planning, priorités, préférences..." className="min-h-[100px] rounded-xl" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} />
              </div>

              {formError && (
                <p className="rounded-xl border border-red-300 bg-red-50 p-3 text-sm text-red-700">
                  {formError}
                </p>
              )}

              <Button type="submit" className="w-full h-14 rounded-full text-lg font-bold">
                Réserver ma consultation
              </Button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
