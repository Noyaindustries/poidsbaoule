import { useState } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, ShieldCheck, CreditCard, Smartphone, Banknote, Truck, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { Link, useNavigate } from 'react-router-dom';
import { PRODUCTS } from '@/constants';
import { toast } from 'sonner';
import { useCart } from '@/lib/CartContext';
import { useProducts } from '@/lib/ProductContext';
import { useOrders } from '@/lib/OrderContext';
import { useUsers } from '@/lib/UserContext';
import { usePromos } from '@/lib/PromoContext';
import { Gift, Clock, AlertCircle, Sparkles, Tag, Check, X } from 'lucide-react';

export default function Checkout() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('wave');
  const [paymentStrategy, setPaymentStrategy] = useState<'FULL' | '50-50' | 'CASH'>('FULL');

  const { items, clearCart, totalPrice } = useCart();
  const { decrementStock } = useProducts();
  const { addOrder } = useOrders();
  const { currentUser, useDiscount } = useUsers();

  const [formData, setFormData] = useState({
    fullName: currentUser?.name || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
    address: '',
    city: 'Abidjan',
    commune: ''
  });

  const [appliedDiscount, setAppliedDiscount] = useState<any>(null);
  const { validatePromo } = usePromos();
  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<any>(null);

  const activeDiscounts = currentUser?.wallet.filter(d => !d.isUsed && new Date(d.expiryDate) > new Date()) || [];

  const handleApplyPromo = async () => {
    if (!promoInput) return;
    const promo = await validatePromo(promoInput);
    if (promo) {
      setAppliedPromo(promo);
      toast.success(`Code ${promo.code} appliqué !`);
      setPromoInput('');
    } else {
      toast.error("Code promo invalide ou expiré");
    }
  };

  const getDiscountAmount = () => {
    let total = 0;
    if (appliedDiscount) total += appliedDiscount.amount;
    if (appliedPromo) {
      if (appliedPromo.discountType === 'percentage') {
        total += (totalPrice * appliedPromo.discountValue) / 100;
      } else {
        total += appliedPromo.discountValue;
      }
    }
    return total;
  };

  const finalTotal = Math.max(0, totalPrice - getDiscountAmount());

  const handlePlaceOrder = async () => {
    // Mark discount as used if any
    if (appliedDiscount && currentUser) {
      await useDiscount(currentUser.id, appliedDiscount.id);
    }

    // Create and save new order
    const nextOrderId = `PBH-2026-${Math.floor(Math.random() * 900) + 100}`;
    await addOrder({
      id: nextOrderId,
      userId: currentUser?.id || "guest-" + Math.random().toString(36).substr(2, 9),
      customerName: formData.fullName,
      customerEmail: formData.email,
      customerPhone: formData.phone,
      items: [...items],
      total: finalTotal,
      paymentStrategy: paymentMethod === 'cash' ? 'CASH' : paymentStrategy,
      amountPaid: paymentMethod === 'cash' ? 0 : (paymentStrategy === '50-50' ? finalTotal / 2 : finalTotal),
      balanceDue: paymentMethod === 'cash' ? finalTotal : (paymentStrategy === '50-50' ? finalTotal / 2 : 0),
      status: paymentMethod === 'cash' ? "En attente de paiement" : "Paiement reçu",
      paymentMethod: paymentMethod as any,
      shippingAddress: {
        id: "addr-" + nextOrderId,
        street: formData.address + ", " + formData.commune,
        city: formData.city,
        country: "Côte d'Ivoire",
        isDefault: true
      },
      createdAt: new Date().toISOString()
    });
    
    toast.success("Commande passée avec succès !");
    clearCart();
    setStep(3);
  };

  if (step === 3) {
    return (
      <div className="pt-32 pb-24 container mx-auto px-4 max-w-2xl text-center space-y-8">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex flex-col items-center gap-6"
        >
          <div className="h-24 w-24 bg-primary/10 rounded-full flex items-center justify-center">
            <CheckCircle2 className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-4xl font-serif font-bold">Commande Confirmée</h1>
          <p className="text-muted-foreground text-lg">
            Merci pour votre achat ! Votre commande <span className="font-bold text-foreground">#PBH-2026-001</span> a été enregistrée. Vous recevrez un email de confirmation avec votre facture PDF sous peu.
          </p>
          <div className="bg-muted/30 p-6 rounded-2xl border w-full text-left space-y-4">
            <h4 className="font-bold uppercase tracking-widest text-xs">Prochaines étapes</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2"><div className="h-1.5 w-1.5 bg-primary rounded-full" /> Préparation de votre colis (1-2 jours)</li>
              <li className="flex items-center gap-2"><div className="h-1.5 w-1.5 bg-primary rounded-full" /> Appel de notre livreur pour fixer l'heure et confirmer les frais de livraison</li>
              <li className="flex items-center gap-2"><div className="h-1.5 w-1.5 bg-primary rounded-full" /> Livraison à votre domicile</li>
            </ul>
          </div>
          <Link to="/shop" onClick={() => window.scrollTo(0, 0)}>
            <Button className="rounded-full px-10">Continuer mes achats</Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-24">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-4 mb-12">
          <Button variant="ghost" size="icon" onClick={() => step > 1 ? setStep(step - 1) : navigate('/cart')}>
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-4xl font-serif font-bold">Caisse</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          {/* Main Checkout Flow */}
          <div className="lg:col-span-2 space-y-12">
            {/* Steps Indicator */}
            <div className="flex items-center gap-4">
              <div className={`flex items-center gap-2 ${step >= 1 ? 'text-primary' : 'text-muted-foreground'}`}>
                <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-sm ${step >= 1 ? 'bg-primary text-white' : 'bg-muted'}`}>1</div>
                <span className="font-bold uppercase tracking-widest text-[10px]">Coordonnées</span>
              </div>
              <div className="h-[1px] w-12 bg-muted" />
              <div className={`flex items-center gap-2 ${step >= 2 ? 'text-primary' : 'text-muted-foreground'}`}>
                <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-sm ${step >= 2 ? 'bg-primary text-white' : 'bg-muted'}`}>2</div>
                <span className="font-bold uppercase tracking-widest text-[10px]">Paiement</span>
              </div>
            </div>

            {step === 1 && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-8"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="fname">Nom complet</Label>
                    <Input id="fname" placeholder="Jean Kouassi" className="rounded-xl h-12" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="jean@email.com" className="rounded-xl h-12" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Téléphone</Label>
                    <Input id="phone" placeholder="+225 07 ..." className="rounded-xl h-12" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="commune">Commune (Abidjan)</Label>
                    <Input id="commune" placeholder="ex: Cocody, Riviera 3" className="rounded-xl h-12" value={formData.commune} onChange={e => setFormData({...formData, commune: e.target.value})} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Précisions adresse (Rue, Villa, Appt)</Label>
                  <Input id="address" placeholder="ex: Rue des Jardins, Villa 45" className="rounded-xl h-12" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                </div>
                <Button className="w-full h-14 rounded-full text-lg font-bold" onClick={() => setStep(2)}>
                  Continuer vers le paiement
                </Button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-12"
              >
                {/* Discount Wallet Section */}
                {activeDiscounts.length > 0 && (
                  <section className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Sparkles className="h-5 w-5 text-primary" />
                      <h3 className="text-xl font-serif font-bold">Portefeuille Privilégié</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {activeDiscounts.map(disc => (
                        <div 
                          key={disc.id} 
                          onClick={() => setAppliedDiscount(appliedDiscount?.id === disc.id ? null : disc)}
                          className={`p-6 rounded-3xl border-2 transition-all cursor-pointer relative overflow-hidden group ${
                            appliedDiscount?.id === disc.id ? 'border-primary bg-primary/5' : 'border-muted hover:border-primary/20'
                          }`}
                        >
                          <div className="flex justify-between items-start gap-4">
                            <div className="space-y-1">
                              <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Remise disponible</p>
                              <p className="text-2xl font-bold">{disc.amount.toLocaleString()} FCFA</p>
                              <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-2">
                                <Clock className="h-3 w-3" /> Expire le {new Date(disc.expiryDate).toLocaleDateString()}
                              </p>
                            </div>
                            <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center ${
                              appliedDiscount?.id === disc.id ? 'border-primary bg-primary' : 'border-muted'
                            }`}>
                              {appliedDiscount?.id === disc.id && <CheckCircle2 className="h-4 w-4 text-white" />}
                            </div>
                          </div>
                          {appliedDiscount?.id === disc.id && (
                            <div className="absolute top-0 right-0 p-2">
                              <Badge className="bg-primary text-white text-[8px] uppercase tracking-tighter">Appliquée</Badge>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground italic px-2">
                      {appliedDiscount ? "La remise sera déduite automatiquement de votre total." : "Cliquez sur une remise pour l'activer sur cette commande."}
                    </p>
                  </section>
                )}

                <div className="space-y-6">
                  <h3 className="text-xl font-serif font-bold">Choisir un moyen de paiement</h3>
                  <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Label
                      htmlFor="wave"
                      className={`flex items-center justify-between p-6 rounded-2xl border-2 cursor-pointer transition-all ${paymentMethod === 'wave' ? 'border-primary bg-primary/5' : 'border-muted hover:border-primary/20'}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 bg-[#00AEEF] rounded-lg flex items-center justify-center text-white font-bold">W</div>
                        <div className="space-y-1">
                          <p className="font-bold">Wave</p>
                          <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Mobile Money</p>
                        </div>
                      </div>
                      <RadioGroupItem value="wave" id="wave" className="sr-only" />
                    </Label>

                    <Label
                      htmlFor="orange"
                      className={`flex items-center justify-between p-6 rounded-2xl border-2 cursor-pointer transition-all ${paymentMethod === 'orange' ? 'border-primary bg-primary/5' : 'border-muted hover:border-primary/20'}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 bg-[#FF6600] rounded-lg flex items-center justify-center text-white font-bold">O</div>
                        <div className="space-y-1">
                          <p className="font-bold">Orange Money</p>
                          <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Mobile Money</p>
                        </div>
                      </div>
                      <RadioGroupItem value="orange" id="orange" className="sr-only" />
                    </Label>

                    <Label
                      htmlFor="bank"
                      className={`flex items-center justify-between p-6 rounded-2xl border-2 cursor-pointer transition-all ${paymentMethod === 'bank' ? 'border-primary bg-primary/5' : 'border-muted hover:border-primary/20'}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center text-muted-foreground">
                          <CreditCard className="h-5 w-5" />
                        </div>
                        <div className="space-y-1">
                          <p className="font-bold">Virement Bancaire</p>
                          <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Confirmation manuelle</p>
                        </div>
                      </div>
                      <RadioGroupItem value="bank" id="bank" className="sr-only" />
                    </Label>

                    <Label
                      htmlFor="cash"
                      className={`flex items-center justify-between p-6 rounded-2xl border-2 cursor-pointer transition-all ${paymentMethod === 'cash' ? 'border-primary bg-primary/5' : 'border-muted hover:border-primary/20'}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center text-muted-foreground">
                          <Banknote className="h-5 w-5" />
                        </div>
                        <div className="space-y-1">
                          <p className="font-bold">Paiement à la livraison</p>
                          <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Espèces uniquement</p>
                        </div>
                      </div>
                      <RadioGroupItem value="cash" id="cash" className="sr-only" />
                    </Label>
                  </RadioGroup>
                </div>

                {paymentMethod !== 'cash' && (
                  <div className="space-y-6">
                    <h3 className="text-xl font-serif font-bold">Modalité de paiement</h3>
                    <RadioGroup 
                      value={paymentStrategy} 
                      onValueChange={(val: any) => setPaymentStrategy(val)} 
                      className="grid grid-cols-1 md:grid-cols-2 gap-4"
                    >
                      <Label
                        htmlFor="full"
                        className={`flex items-center justify-between p-6 rounded-2xl border-2 cursor-pointer transition-all ${paymentStrategy === 'FULL' ? 'border-primary bg-primary/5' : 'border-muted hover:border-primary/20'}`}
                      >
                        <div className="space-y-1">
                          <p className="font-bold">Payer la totalité</p>
                          <p className="text-[10px] text-muted-foreground uppercase tracking-widest">100% à la commande</p>
                        </div>
                        <RadioGroupItem value="FULL" id="full" className="sr-only" />
                      </Label>

                      <Label
                        htmlFor="half"
                        className={`flex items-center justify-between p-6 rounded-2xl border-2 cursor-pointer transition-all ${paymentStrategy === '50-50' ? 'border-primary bg-primary/5' : 'border-muted hover:border-primary/20'}`}
                      >
                        <div className="space-y-1">
                          <p className="font-bold">Acompte 50%</p>
                          <p className="text-[10px] text-muted-foreground uppercase tracking-widest text-primary">50% maintenant, 50% à la livraison</p>
                        </div>
                        <RadioGroupItem value="50-50" id="half" className="sr-only" />
                      </Label>
                    </RadioGroup>
                  </div>
                )}

                <div className="bg-muted/30 p-6 rounded-2xl border space-y-4">
                  <div className="flex items-center gap-2 text-primary font-bold">
                    <Smartphone className="h-5 w-5" />
                    <span>Instructions de paiement</span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Après avoir cliqué sur "Confirmer la commande", vous devrez effectuer le transfert au numéro suivant : <span className="font-bold text-foreground">07 49 12 91 53</span>. 
                    Veuillez indiquer votre nom en référence. Votre commande sera traitée dès réception du paiement.
                  </p>
                </div>

                <Button className="w-full h-14 rounded-full text-lg font-bold" onClick={handlePlaceOrder}>
                  Confirmer la commande
                </Button>
              </motion.div>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-card border rounded-3xl p-8 space-y-6 sticky top-32">
              <h2 className="text-xl font-serif font-bold">Votre Commande</h2>
              
              <div className="space-y-4 max-h-[300px] overflow-auto pr-2">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="h-16 w-16 rounded-lg overflow-hidden bg-muted shrink-0">
                      <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-grow">
                      <p className="text-sm font-bold line-clamp-1">{item.name}</p>
                      <p className="text-xs text-muted-foreground">Qté: {item.quantity}</p>
                      <p className="text-sm font-bold text-primary mt-1">{(item.price * item.quantity).toLocaleString()} FCFA</p>
                    </div>
                  </div>
                ))}
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Sous-total</span>
                  <span className="font-bold">{totalPrice.toLocaleString()} FCFA</span>
                </div>
                {appliedDiscount && (
                  <div className="flex justify-between text-sm text-green-600 font-bold">
                    <span className="flex items-center gap-1"><Gift className="h-3 w-3" /> Remise Privilégiée</span>
                    <span>- {appliedDiscount.amount.toLocaleString()} FCFA</span>
                  </div>
                )}
                {appliedPromo && (
                  <div className="flex justify-between text-sm text-green-600 font-bold">
                    <span className="flex items-center gap-1"><Tag className="h-3 w-3" /> Code {appliedPromo.code}</span>
                    <span>- {appliedPromo.discountType === 'percentage' ? `${appliedPromo.discountValue}%` : `${appliedPromo.discountValue.toLocaleString()} FCFA`}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Livraison</span>
                  <span className="font-bold text-[10px] uppercase tracking-widest text-primary">À la charge du client</span>
                </div>
                <div className="flex justify-between text-lg pt-2 border-t mt-2">
                  <span className="font-serif font-bold">Total commande</span>
                  <span className="font-bold text-primary">{finalTotal.toLocaleString()} FCFA</span>
                </div>

                {!appliedPromo && (
                  <div className="pt-4 space-y-3">
                    <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground ml-2">Code Promotionnel</p>
                    <div className="flex gap-2">
                      <Input 
                        placeholder="Entrez votre code" 
                        value={promoInput}
                        onChange={e => setPromoInput(e.target.value)}
                        className="rounded-xl h-10 bg-muted/30 border-none text-xs"
                      />
                      <Button 
                        size="sm" 
                        variant="secondary" 
                        className="rounded-xl px-4 h-10"
                        onClick={handleApplyPromo}
                      >
                        Appliquer
                      </Button>
                    </div>
                  </div>
                )}
                
                {appliedPromo && (
                  <div className="pt-4">
                    <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-green-700">
                        <Tag className="h-4 w-4" />
                        <span className="text-xs font-bold uppercase tracking-widest">{appliedPromo.code}</span>
                      </div>
                      <button onClick={() => setAppliedPromo(null)} className="text-green-700 hover:scale-110 transition-transform">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
                
                {(paymentMethod === 'cash' || paymentStrategy === '50-50') && (
                  <div className="bg-primary/5 p-4 rounded-2xl border border-primary/20 space-y-1 mt-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-primary font-bold">À payer maintenant</span>
                      <span className="font-bold text-primary">
                        {paymentMethod === 'cash' ? '0' : (finalTotal / 2).toLocaleString()} FCFA
                      </span>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Reste à la livraison</span>
                      <span>{paymentMethod === 'cash' ? finalTotal.toLocaleString() : (finalTotal / 2).toLocaleString()} FCFA</span>
                    </div>
                  </div>
                )}
                
                <p className="text-[10px] text-muted-foreground italic text-center pt-2">Note : Hors frais de livraison à régler sur place.</p>
              </div>

              <div className="pt-4 space-y-4">
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground uppercase tracking-widest">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  <span>Paiement 100% sécurisé</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
