import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, Percent, Trash2, Calendar, 
  ToggleLeft, ToggleRight, Megaphone, 
  Clock, AlertCircle, CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { usePromos } from '@/lib/PromoContext';
import { ADMIN_QUICK_ACTION_EVENT } from '@/lib/admin-utils';
import { toast } from 'sonner';

export default function PromotionManager() {
  const { promoCodes, addPromo, togglePromo, deletePromo } = usePromos();
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    const onQuick = (e: Event) => {
      if ((e as CustomEvent<string>).detail === 'new-promo') {
        setIsAdding(true);
      }
    };
    window.addEventListener(ADMIN_QUICK_ACTION_EVENT, onQuick as EventListener);
    return () => window.removeEventListener(ADMIN_QUICK_ACTION_EVENT, onQuick as EventListener);
  }, []);

  const [formData, setFormData] = useState({
    code: '',
    discountType: 'percentage' as 'percentage' | 'fixed',
    discountValue: '',
    expiryDate: '',
    announcementText: '',
    isIndefinite: true
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code || !formData.discountValue) {
      toast.error("Veuillez remplir les champs obligatoires");
      return;
    }

    await addPromo({
      code: formData.code.toUpperCase(),
      discountType: formData.discountType,
      discountValue: Number(formData.discountValue),
      expiryDate: formData.isIndefinite ? undefined : formData.expiryDate,
      isActive: true,
      announcementText: formData.announcementText || `Nouveau code promo : ${formData.code.toUpperCase()} ! Profitez de -${formData.discountValue}${formData.discountType === 'percentage' ? '%' : ' FCFA'} sur votre commande.`
    });

    toast.success("Promotion créée avec succès !");
    setIsAdding(false);
    setFormData({
      code: '',
      discountType: 'percentage',
      discountValue: '',
      expiryDate: '',
      announcementText: '',
      isIndefinite: true
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-serif font-bold">Promotions & Offres</h2>
          <p className="text-muted-foreground">Gérez vos codes promos et les annonces du site.</p>
        </div>
        <Button 
          onClick={() => setIsAdding(!isAdding)} 
          className="rounded-full px-6 bg-primary shadow-lg shadow-primary/20"
        >
          {isAdding ? "Annuler" : (
            <><Plus className="mr-2 h-4 w-4" /> Nouvelle Promotion</>
          )}
        </Button>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <Card className="rounded-[32px] border-none shadow-xl bg-primary/5">
              <CardContent className="p-8">
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="code" className="text-[10px] uppercase font-bold tracking-widest px-2">Code Promo</Label>
                      <Input 
                        id="code" 
                        placeholder="EX: ETE2026" 
                        value={formData.code}
                        onChange={e => setFormData({...formData, code: e.target.value})}
                        className="rounded-2xl h-12 border-none bg-white shadow-inner font-bold uppercase tracking-widest"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-[10px] uppercase font-bold tracking-widest px-2">Type</Label>
                        <select 
                          className="w-full h-12 rounded-2xl bg-white border-none shadow-inner px-4 text-sm font-bold appearance-none cursor-pointer"
                          value={formData.discountType}
                          onChange={e => setFormData({...formData, discountType: e.target.value as any})}
                        >
                          <option value="percentage">Pourcentage (%)</option>
                          <option value="fixed">Montant fixe (FCFA)</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] uppercase font-bold tracking-widest px-2">Valeur</Label>
                        <Input 
                          type="number" 
                          placeholder="20" 
                          value={formData.discountValue}
                          onChange={e => setFormData({...formData, discountValue: e.target.value})}
                          className="rounded-2xl h-12 border-none bg-white shadow-inner font-bold"
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <input 
                          type="checkbox" 
                          id="indefinite" 
                          checked={formData.isIndefinite}
                          onChange={e => setFormData({...formData, isIndefinite: e.target.checked})}
                          className="h-4 w-4 rounded border-primary text-primary focus:ring-primary"
                        />
                        <Label htmlFor="indefinite" className="text-sm font-medium">Durée indéterminée (Pas de date limite)</Label>
                      </div>
                      
                      {!formData.isIndefinite && (
                        <div className="space-y-2">
                          <Label htmlFor="expiry" className="text-[10px] uppercase font-bold tracking-widest px-2">Date d'expiration</Label>
                          <Input 
                            id="expiry" 
                            type="date" 
                            value={formData.expiryDate}
                            onChange={e => setFormData({...formData, expiryDate: e.target.value})}
                            className="rounded-2xl h-12 border-none bg-white shadow-inner"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="announcement" className="text-[10px] uppercase font-bold tracking-widest px-2">Message d'annonce sur le site</Label>
                      <textarea 
                        id="announcement"
                        placeholder="Texte qui sera affiché dans le bandeau en haut du site..."
                        value={formData.announcementText}
                        onChange={e => setFormData({...formData, announcementText: e.target.value})}
                        className="w-full h-32 rounded-3xl bg-white border-none shadow-inner p-4 text-sm resize-none focus:ring-1 focus:ring-primary/20"
                      />
                    </div>
                    <div className="pt-4">
                      <Button type="submit" className="w-full h-14 rounded-full text-lg font-bold">Activer la promotion</Button>
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {promoCodes.map((promo) => (
          <Card key={promo.id} className={`rounded-[32px] border-none shadow-sm transition-all hover:shadow-lg ${!promo.isActive ? 'opacity-60' : ''}`}>
            <CardHeader className="p-8 pb-4">
              <div className="flex justify-between items-start">
                <div className="h-12 w-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                  <Percent className="h-6 w-6" />
                </div>
                <div className="flex gap-2">
                   <Button 
                    variant="ghost" 
                    size="icon" 
                    className={`h-8 w-8 rounded-full ${promo.isActive ? 'text-green-600' : 'text-muted-foreground'}`}
                    onClick={async () => await togglePromo(promo.id)}
                  >
                    {promo.isActive ? <ToggleRight className="h-6 w-6" /> : <ToggleLeft className="h-6 w-6" />}
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 rounded-full text-destructive hover:bg-destructive/10"
                    onClick={async () => {
                      if (confirm("Supprimer cette promotion ?")) await deletePromo(promo.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <CardTitle className="text-2xl font-serif font-bold mt-4 tracking-widest uppercase">{promo.code}</CardTitle>
              <p className="text-xs font-bold text-primary mt-1">
                {promo.discountValue}{promo.discountType === 'percentage' ? '%' : ' FCFA'} de remise
              </p>
            </CardHeader>
            <CardContent className="p-8 pt-4 space-y-6">
              <div className="space-y-3">
                <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Message d'annonce :</p>
                <div className="bg-muted/30 p-4 rounded-2xl">
                  <p className="text-xs italic leading-relaxed">"{promo.announcementText}"</p>
                </div>
              </div>

              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground pt-4 border-t">
                <div className="flex items-center gap-2">
                  <Clock className="h-3 w-3" />
                  <span>{promo.expiryDate ? `Expire le ${new Date(promo.expiryDate).toLocaleDateString()}` : "Permanent"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-3 w-3" />
                  <span>{promo.usageCount} utilisations</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {promoCodes.length === 0 && !isAdding && (
          <div className="col-span-full py-20 text-center space-y-4 bg-muted/20 rounded-[40px] border-2 border-dashed">
            <Megaphone className="h-12 w-12 mx-auto opacity-20" />
            <p className="text-muted-foreground italic">Aucune promotion active pour le moment.</p>
            <Button variant="outline" onClick={() => setIsAdding(true)} className="rounded-full">Créer ma première offre</Button>
          </div>
        )}
      </div>
    </div>
  );
}
