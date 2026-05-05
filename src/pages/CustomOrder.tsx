import { useState } from 'react';
import { motion } from 'motion/react';
import { Send, Upload, Info, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { useReservations } from '@/lib/ReservationContext';
import { apiFormData } from '@/lib/api';

const MOODBOARD_MAX_FILES = 5;
const MOODBOARD_MAX_BYTES = 5 * 1024 * 1024;
const MOODBOARD_ACCEPT = ['image/jpeg', 'image/png', 'image/webp'];

type UploadedMoodboardFile = {
  url: string;
  originalName: string;
  size: number;
  mimeType: string;
};

export default function CustomOrder() {
  const navigate = useNavigate();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formError, setFormError] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadedMoodboard, setUploadedMoodboard] = useState<UploadedMoodboardFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const { addCustomOrder } = useReservations();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    type: '',
    deadline: '',
    description: '',
    dimensions: '',
    finish: '',
    quantity: '1',
    widthCm: '',
    heightCm: '',
    depthCm: '',
    usageContext: '',
    budgetRange: '',
    constraints: '',
    notes: '',
    includeDelivery: true,
    includeInstallation: false,
    expeditedProduction: false,
    desiredColors: '',
    estimatedBudget: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const width = Number(formData.widthCm);
    const height = Number(formData.heightCm);
    const depth = Number(formData.depthCm);
    const quantity = Number(formData.quantity);
    const estimatedBudget = Number(formData.estimatedBudget);

    if (!formData.type || !formData.deadline || !formData.usageContext || !formData.budgetRange) {
      setFormError('Merci de compléter le type de pièce, le délai, le contexte d’usage et la fourchette de budget.');
      return;
    }
    if (!Number.isFinite(quantity) || quantity < 1) {
      setFormError('La quantité doit être supérieure ou égale à 1.');
      return;
    }
    if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
      setFormError('Les dimensions largeur/hauteur doivent être des nombres positifs.');
      return;
    }
    if (formData.depthCm && (!Number.isFinite(depth) || depth <= 0)) {
      setFormError('La profondeur doit être un nombre positif.');
      return;
    }
    if (!Number.isFinite(estimatedBudget) || estimatedBudget <= 0) {
      setFormError('Merci d’indiquer un budget estimatif valide.');
      return;
    }
    if (selectedFiles.length > MOODBOARD_MAX_FILES) {
      setUploadError(`Vous pouvez joindre au maximum ${MOODBOARD_MAX_FILES} images.`);
      return;
    }

    let uploadingStep = false;
    try {
      let moodboardUrls = uploadedMoodboard.map((file) => file.url);
      if (selectedFiles.length > 0) {
        uploadingStep = true;
        setIsUploading(true);
        const form = new FormData();
        selectedFiles.forEach((file) => form.append('files', file));
        const uploadResponse = await apiFormData<{ files: UploadedMoodboardFile[] }>(
          '/api/custom-orders/upload',
          form
        );
        moodboardUrls = uploadResponse.files.map((file) => file.url);
        setUploadedMoodboard(uploadResponse.files);
        uploadingStep = false;
      }

      await addCustomOrder({
        customerName: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || undefined,
        description: formData.description.trim(),
        dimensions: `${width} x ${height}${formData.depthCm ? ` x ${depth}` : ''} cm`,
        finish: formData.finish.trim(),
        color: formData.desiredColors.trim() || formData.finish.trim(),
        type: formData.type,
        moodboard: moodboardUrls,
        preferredDeadline: formData.deadline,
        customization: {
          pieceCategory: formData.type as 'Masque' | 'Miroir' | 'Meuble Niche' | 'Vase / Objet Déco' | 'Luminaire' | 'Autre',
          quantity,
          dimensionsCm: {
            width,
            height,
            ...(formData.depthCm ? { depth } : {}),
          },
          palette: formData.desiredColors
            .split(',')
            .map((v) => v.trim())
            .filter(Boolean),
          finishOptions: formData.finish
            .split(',')
            .map((v) => v.trim())
            .filter(Boolean),
          usageContext: formData.usageContext as 'Intérieur' | 'Extérieur' | 'Mixte',
          budgetRange: formData.budgetRange as
            | 'Moins de 100 000 FCFA'
            | '100 000 - 300 000 FCFA'
            | '300 000 - 600 000 FCFA'
            | 'Plus de 600 000 FCFA',
          constraints: formData.constraints
            .split('\n')
            .map((v) => v.trim())
            .filter(Boolean),
          optionalServices: {
            homeDelivery: formData.includeDelivery,
            onSiteInstallation: formData.includeInstallation,
            expeditedProduction: formData.expeditedProduction,
          },
          estimatedPrice: estimatedBudget,
          notes: formData.notes.trim() || undefined,
        },
      });

      setIsSubmitted(true);
      setSelectedFiles([]);
      setUploadError('');
      toast.success("Demande envoyée !", {
        description: "Nous vous recontacterons sous 48h avec un devis personnalisé.",
      });
      navigate('/admin', { state: { tab: 'reservations' } });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Impossible d'envoyer la demande pour le moment.";
      if (uploadingStep || isUploading) {
        setUploadError(message);
      } else {
        setFormError(message);
      }
      toast.error(message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleMoodboardSelection = (files: FileList | null) => {
    setUploadError('');
    if (!files || files.length === 0) {
      setSelectedFiles([]);
      return;
    }
    const picked = Array.from(files);
    if (picked.length > MOODBOARD_MAX_FILES) {
      setUploadError(`Vous pouvez joindre au maximum ${MOODBOARD_MAX_FILES} images.`);
      return;
    }
    const invalidType = picked.find((file) => !MOODBOARD_ACCEPT.includes(file.type));
    if (invalidType) {
      setUploadError('Formats acceptés: JPG, PNG, WebP.');
      return;
    }
    const oversized = picked.find((file) => file.size > MOODBOARD_MAX_BYTES);
    if (oversized) {
      setUploadError('Chaque image doit faire 5 Mo maximum.');
      return;
    }
    setSelectedFiles(picked);
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
              className="space-y-8 rounded-3xl bg-white/90 p-6 shadow-2xl backdrop-blur-md sm:space-y-10 sm:rounded-[48px] sm:p-10 md:p-12 lg:p-14"
            >
              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-primary">Formulaire Sur Mesure</p>
                <h3 className="font-serif text-3xl font-bold leading-tight sm:text-4xl">Parlons de votre projet</h3>
                <p className="text-sm text-muted-foreground">Informations essentielles pour établir votre devis personnalisé.</p>
              </div>
              <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
                <div className="space-y-3">
                  <Label htmlFor="name" className="text-[10px] uppercase tracking-[0.2em] font-bold ml-2">Nom complet</Label>
                  <Input id="name" placeholder="Votre nom" required className="h-12 rounded-xl px-4 bg-muted/20 border border-input/40 focus:bg-white transition-all" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="email" className="text-[10px] uppercase tracking-[0.2em] font-bold ml-2">Email</Label>
                  <Input id="email" type="email" placeholder="votre@email.com" required className="h-12 rounded-xl px-4 bg-muted/20 border border-input/40 focus:bg-white transition-all" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="phone" className="text-[10px] uppercase tracking-[0.2em] font-bold ml-2">Contact</Label>
                  <Input id="phone" type="tel" placeholder="+225 07 00 00 00 00" className="h-12 rounded-xl px-4 bg-muted/20 border border-input/40 focus:bg-white transition-all" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-3">
                  <Label htmlFor="type" className="text-[10px] uppercase tracking-[0.2em] font-bold ml-4">Type de pièce</Label>
                  <Select onValueChange={(val: string) => setFormData({...formData, type: val})}>
                    <SelectTrigger className="h-14 rounded-xl border border-input/40 px-5 text-base bg-muted/20 focus:bg-white transition-all">
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent side="bottom" sideOffset={8} align="start" className="min-w-[320px] rounded-2xl border border-primary/15 bg-white p-2 shadow-xl ring-0">
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
                    <SelectTrigger className="h-14 rounded-xl border border-input/40 px-5 text-base bg-muted/20 focus:bg-white transition-all">
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent side="bottom" sideOffset={8} align="start" className="min-w-[320px] rounded-2xl border border-primary/15 bg-white p-2 shadow-xl ring-0">
                      <SelectItem value="urgent">Moins de 2 semaines</SelectItem>
                      <SelectItem value="normal">2 à 4 semaines</SelectItem>
                      <SelectItem value="flexible">Flexible</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="quantity" className="text-[10px] uppercase tracking-[0.2em] font-bold ml-4">Quantité</Label>
                  <Input id="quantity" type="number" min={1} className="h-12 rounded-xl px-4 bg-muted/20 border border-input/40 focus:bg-white transition-all" value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})} />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="usageContext" className="text-[10px] uppercase tracking-[0.2em] font-bold ml-4">Usage</Label>
                  <Select onValueChange={(val: string) => setFormData({...formData, usageContext: val})}>
                    <SelectTrigger className="h-14 rounded-xl border border-input/40 px-5 text-base bg-muted/20 focus:bg-white transition-all">
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent side="bottom" sideOffset={8} align="start" className="min-w-[320px] rounded-2xl border border-primary/15 bg-white p-2 shadow-xl ring-0">
                      <SelectItem value="Intérieur">Intérieur</SelectItem>
                      <SelectItem value="Extérieur">Extérieur</SelectItem>
                      <SelectItem value="Mixte">Mixte</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-3">
                  <Label htmlFor="budgetRange" className="text-[10px] uppercase tracking-[0.2em] font-bold ml-4">Fourchette budget</Label>
                  <Select onValueChange={(val: string) => setFormData({...formData, budgetRange: val})}>
                    <SelectTrigger className="h-14 rounded-xl border border-input/40 px-5 text-base bg-muted/20 focus:bg-white transition-all">
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent side="bottom" sideOffset={8} align="start" className="min-w-[320px] rounded-2xl border border-primary/15 bg-white p-2 shadow-xl ring-0">
                      <SelectItem value="Moins de 100 000 FCFA">Moins de 100 000 FCFA</SelectItem>
                      <SelectItem value="100 000 - 300 000 FCFA">100 000 - 300 000 FCFA</SelectItem>
                      <SelectItem value="300 000 - 600 000 FCFA">300 000 - 600 000 FCFA</SelectItem>
                      <SelectItem value="Plus de 600 000 FCFA">Plus de 600 000 FCFA</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="description" className="text-[10px] uppercase tracking-[0.2em] font-bold ml-4">Description de votre projet</Label>
                <Textarea 
                  id="description" 
                  placeholder="Décrivez votre idée, le style recherché, l'emplacement prévu..." 
                  className="min-h-[200px] rounded-[40px] border border-input/40 p-8 bg-muted/20 focus:bg-white transition-all"
                  required
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                <div className="space-y-3">
                  <Label htmlFor="widthCm" className="text-[10px] uppercase tracking-[0.2em] font-bold ml-4">Largeur (cm)</Label>
                  <Input id="widthCm" type="number" min={1} placeholder="ex: 120" className="h-12 rounded-xl px-4 bg-muted/20 border border-input/40 focus:bg-white transition-all" value={formData.widthCm} onChange={e => setFormData({...formData, widthCm: e.target.value})} />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="heightCm" className="text-[10px] uppercase tracking-[0.2em] font-bold ml-4">Hauteur (cm)</Label>
                  <Input id="heightCm" type="number" min={1} placeholder="ex: 80" className="h-12 rounded-xl px-4 bg-muted/20 border border-input/40 focus:bg-white transition-all" value={formData.heightCm} onChange={e => setFormData({...formData, heightCm: e.target.value})} />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="depthCm" className="text-[10px] uppercase tracking-[0.2em] font-bold ml-4">Profondeur (cm, optionnel)</Label>
                  <Input id="depthCm" type="number" min={1} placeholder="ex: 15" className="h-12 rounded-xl px-4 bg-muted/20 border border-input/40 focus:bg-white transition-all" value={formData.depthCm} onChange={e => setFormData({...formData, depthCm: e.target.value})} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-3">
                  <Label htmlFor="finish" className="text-[10px] uppercase tracking-[0.2em] font-bold ml-4">Finitions (séparées par virgules)</Label>
                  <Input id="finish" placeholder="ex: Ciment blanc, Mat, Texturé" className="h-12 rounded-xl px-4 bg-muted/20 border border-input/40 focus:bg-white transition-all" value={formData.finish} onChange={e => setFormData({...formData, finish: e.target.value})} />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="desiredColors" className="text-[10px] uppercase tracking-[0.2em] font-bold ml-4">Palette couleurs (virgules)</Label>
                  <Input id="desiredColors" placeholder="ex: Ivoire, Terracotta, Noir" className="h-12 rounded-xl px-4 bg-muted/20 border border-input/40 focus:bg-white transition-all" value={formData.desiredColors} onChange={e => setFormData({...formData, desiredColors: e.target.value})} />
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="constraints" className="text-[10px] uppercase tracking-[0.2em] font-bold ml-4">Contraintes techniques (une ligne par contrainte)</Label>
                <Textarea id="constraints" placeholder="Ex: Accrochage mural obligatoire&#10;Passage de porte 85 cm max" className="min-h-[120px] rounded-[30px] border border-input/40 p-6 bg-muted/20 focus:bg-white transition-all" value={formData.constraints} onChange={e => setFormData({...formData, constraints: e.target.value})} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex items-center gap-3 text-sm">
                  <input type="checkbox" checked={formData.includeDelivery} onChange={e => setFormData({...formData, includeDelivery: e.target.checked})} />
                  Inclure la livraison
                </label>
                <label className="flex items-center gap-3 text-sm">
                  <input type="checkbox" checked={formData.includeInstallation} onChange={e => setFormData({...formData, includeInstallation: e.target.checked})} />
                  Inclure l'installation sur site
                </label>
                <label className="flex items-center gap-3 text-sm">
                  <input type="checkbox" checked={formData.expeditedProduction} onChange={e => setFormData({...formData, expeditedProduction: e.target.checked})} />
                  Demande urgente (production accélérée)
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-3">
                  <Label htmlFor="estimatedBudget" className="text-[10px] uppercase tracking-[0.2em] font-bold ml-4">Budget estimatif (FCFA)</Label>
                  <Input id="estimatedBudget" type="number" min={1} placeholder="ex: 250000" className="h-12 rounded-xl px-4 bg-muted/20 border border-input/40 focus:bg-white transition-all" value={formData.estimatedBudget} onChange={e => setFormData({...formData, estimatedBudget: e.target.value})} />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="notes" className="text-[10px] uppercase tracking-[0.2em] font-bold ml-4">Notes complémentaires</Label>
                  <Input id="notes" placeholder="Accès chantier, contraintes horaires..." className="h-12 rounded-xl px-4 bg-muted/20 border border-input/40 focus:bg-white transition-all" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} />
                </div>
              </div>

              {formError && (
                <p className="rounded-2xl border border-red-300 bg-red-50 p-4 text-sm text-red-700">
                  {formError}
                </p>
              )}
 
              <div className="space-y-6">
                <Label className="text-[10px] uppercase tracking-[0.2em] font-bold ml-4">Photos d'inspiration (Moodboard)</Label>
                <label
                  htmlFor="moodboard-upload"
                  className="block border-2 border-dashed border-primary/10 rounded-[40px] p-16 text-center space-y-6 hover:bg-primary/5 transition-all cursor-pointer group"
                >
                  <div className="h-20 w-20 bg-primary/5 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                    <Upload className="h-8 w-8 text-primary/40" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-xl font-serif font-bold">
                      {selectedFiles.length > 0
                        ? `${selectedFiles.length} image(s) sélectionnée(s)`
                        : 'Cliquez pour uploader'}
                    </p>
                    <p className="text-sm text-muted-foreground font-light">JPG, PNG, WebP jusqu'à 5MB (Max 5 photos)</p>
                  </div>
                </label>
                <input
                  id="moodboard-upload"
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp"
                  multiple
                  className="hidden"
                  onChange={(e) => handleMoodboardSelection(e.target.files)}
                />
                {selectedFiles.length > 0 && (
                  <ul className="space-y-2 rounded-2xl bg-muted/30 p-4 text-sm">
                    {selectedFiles.map((file) => (
                      <li key={`${file.name}-${file.lastModified}`} className="flex items-center justify-between gap-3">
                        <span className="truncate">{file.name}</span>
                        <span className="text-muted-foreground">{Math.round(file.size / 1024)} KB</span>
                      </li>
                    ))}
                  </ul>
                )}
                {uploadedMoodboard.length > 0 && (
                  <p className="text-sm text-emerald-700">
                    {uploadedMoodboard.length} image(s) déjà téléversée(s) pour cette demande.
                  </p>
                )}
                {uploadError && (
                  <p className="rounded-2xl border border-red-300 bg-red-50 p-4 text-sm text-red-700">
                    {uploadError}
                  </p>
                )}
              </div>
 
              <Button
                type="submit"
                disabled={isUploading}
                className="w-full h-20 rounded-full text-xl font-bold shadow-2xl shadow-primary/20"
              >
                {isUploading ? 'Téléversement en cours...' : 'Envoyer ma demande'} <Send className="ml-3 h-6 w-6" />
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
