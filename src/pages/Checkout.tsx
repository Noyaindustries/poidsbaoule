import { useMemo, useState } from 'react';
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
import { Gift, Clock, Sparkles, Tag, X } from 'lucide-react';
import type { CheckoutPaymentMethod } from '@/lib/mobile-money-checkout';
import {
  computeAmountDueNow,
  getMerchantPhoneDisplay,
  getMobileMoneyInstructions,
  isMobileMoneyOperator,
  mapCheckoutPaymentToOrderMethod,
} from '@/lib/mobile-money-checkout';

export default function Checkout() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<CheckoutPaymentMethod>('orange');
  const [paymentStrategy, setPaymentStrategy] = useState<'FULL' | '50-50' | 'CASH'>('FULL');
  const [paymentReference, setPaymentReference] = useState('');

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

  const amountDueNow = computeAmountDueNow(finalTotal, paymentMethod, paymentStrategy);

  const mobileInstructions = useMemo(() => {
    if (!isMobileMoneyOperator(paymentMethod)) return null;
    return getMobileMoneyInstructions(paymentMethod, amountDueNow, formData.fullName);
  }, [paymentMethod, amountDueNow, formData.fullName]);

  const handlePlaceOrder = async () => {
    // Mark discount as used if any
    if (appliedDiscount && currentUser) {
      await useDiscount(currentUser.id, appliedDiscount.id);
    }

    // Create and save new order
    const nextOrderId = `PBH-2026-${Math.floor(Math.random() * 900) + 100}`;
    const refTrim = paymentReference.trim();
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
      paymentMethod: mapCheckoutPaymentToOrderMethod(paymentMethod),
      ...(refTrim && paymentMethod !== 'cash' ? { paymentReference: refTrim } : {}),
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
      <div className="container mx-auto max-w-full space-y-6 px-3 pb-20 pt-28 text-center sm:max-w-2xl sm:space-y-8 sm:px-4 sm:pb-24 sm:pt-32">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex flex-col items-center gap-6"
        >
          <div className="h-24 w-24 bg-primary/10 rounded-full flex items-center justify-center">
            <CheckCircle2 className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-2xl font-serif font-bold sm:text-4xl">Commande Confirmée</h1>
          <p className="text-base text-muted-foreground sm:text-lg">
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
    <div className="min-w-0 max-w-[100vw] overflow-x-clip pb-16 pt-20 sm:pb-24 sm:pt-24">
      <div className="container mx-auto max-w-full px-3 sm:px-4 md:px-6">
        <div className="mb-8 flex min-w-0 items-center gap-3 sm:mb-12 sm:gap-4">
          <Button variant="ghost" size="icon" onClick={() => step > 1 ? setStep(step - 1) : navigate('/cart')}>
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <h1 className="truncate text-2xl font-serif font-bold sm:text-4xl">Caisse</h1>
        </div>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-3 lg:gap-16">
          {/* Main Checkout Flow */}
          <div className="lg:col-span-2 space-y-12">
            {/* Steps Indicator */}
            <div className="-mx-1 flex min-w-0 items-center gap-3 overflow-x-auto pb-1 sm:mx-0 sm:gap-4 sm:overflow-visible sm:pb-0">
              <div className={`flex shrink-0 items-center gap-2 ${step >= 1 ? 'text-primary' : 'text-muted-foreground'}`}>
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${step >= 1 ? 'bg-primary text-white' : 'bg-muted'}`}>1</div>
                <span className="text-[10px] font-bold uppercase tracking-widest">Coordonnées</span>
              </div>
              <div className="h-px w-8 shrink-0 bg-muted sm:w-12" />
              <div className={`flex shrink-0 items-center gap-2 ${step >= 2 ? 'text-primary' : 'text-muted-foreground'}`}>
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${step >= 2 ? 'bg-primary text-white' : 'bg-muted'}`}>2</div>
                <span className="text-[10px] font-bold uppercase tracking-widest">Paiement</span>
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
                  <h3 className="text-xl font-serif font-bold">Mobile money & autres moyens</h3>
                  <RadioGroup
                    value={paymentMethod}
                    onValueChange={(v) => setPaymentMethod(v as CheckoutPaymentMethod)}
                    className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3"
                  >
                    <Label
                      htmlFor="orange"
                      className={`flex min-w-0 cursor-pointer flex-col gap-2 rounded-2xl border-2 p-3 transition-all sm:flex-row sm:items-center sm:justify-between sm:p-4 ${paymentMethod === 'orange' ? 'border-primary bg-primary/5' : 'border-muted hover:border-primary/20'}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#FF6600] text-sm font-bold text-white">
                          O
                        </div>
                        <div className="min-w-0 space-y-0.5">
                          <p className="font-bold leading-tight">Orange Money</p>
                          <p className="text-[9px] uppercase tracking-widest text-muted-foreground">Mobile Money</p>
                        </div>
                      </div>
                      <RadioGroupItem value="orange" id="orange" className="sr-only" />
                    </Label>

                    <Label
                      htmlFor="wave"
                      className={`flex min-w-0 cursor-pointer flex-col gap-2 rounded-2xl border-2 p-3 transition-all sm:flex-row sm:items-center sm:justify-between sm:p-4 ${paymentMethod === 'wave' ? 'border-primary bg-primary/5' : 'border-muted hover:border-primary/20'}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#00AEEF] text-sm font-bold text-white">
                          W
                        </div>
                        <div className="min-w-0 space-y-0.5">
                          <p className="font-bold leading-tight">Wave</p>
                          <p className="text-[9px] uppercase tracking-widest text-muted-foreground">Mobile Money</p>
                        </div>
                      </div>
                      <RadioGroupItem value="wave" id="wave" className="sr-only" />
                    </Label>

                    <Label
                      htmlFor="mtn"
                      className={`flex min-w-0 cursor-pointer flex-col gap-2 rounded-2xl border-2 p-3 transition-all sm:flex-row sm:items-center sm:justify-between sm:p-4 ${paymentMethod === 'mtn' ? 'border-primary bg-primary/5' : 'border-muted hover:border-primary/20'}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#FFCC00] text-[10px] font-bold text-black">
                          MTN
                        </div>
                        <div className="min-w-0 space-y-0.5">
                          <p className="font-bold leading-tight">MTN MoMo</p>
                          <p className="text-[9px] uppercase tracking-widest text-muted-foreground">Mobile Money</p>
                        </div>
                      </div>
                      <RadioGroupItem value="mtn" id="mtn" className="sr-only" />
                    </Label>

                    <Label
                      htmlFor="moov"
                      className={`flex min-w-0 cursor-pointer flex-col gap-2 rounded-2xl border-2 p-3 transition-all sm:flex-row sm:items-center sm:justify-between sm:p-4 ${paymentMethod === 'moov' ? 'border-primary bg-primary/5' : 'border-muted hover:border-primary/20'}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#0066B3] text-[9px] font-bold leading-tight text-white">
                          M
                        </div>
                        <div className="min-w-0 space-y-0.5">
                          <p className="font-bold leading-tight">Moov / Flooz</p>
                          <p className="text-[9px] uppercase tracking-widest text-muted-foreground">Mobile Money</p>
                        </div>
                      </div>
                      <RadioGroupItem value="moov" id="moov" className="sr-only" />
                    </Label>

                    <Label
                      htmlFor="bank"
                      className={`flex min-w-0 cursor-pointer flex-col gap-2 rounded-2xl border-2 p-3 transition-all sm:flex-row sm:items-center sm:justify-between sm:p-4 ${paymentMethod === 'bank' ? 'border-primary bg-primary/5' : 'border-muted hover:border-primary/20'}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                          <CreditCard className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 space-y-0.5">
                          <p className="font-bold leading-tight">Virement bancaire</p>
                          <p className="text-[9px] uppercase tracking-widest text-muted-foreground">RIB sur demande</p>
                        </div>
                      </div>
                      <RadioGroupItem value="bank" id="bank" className="sr-only" />
                    </Label>

                    <Label
                      htmlFor="cash"
                      className={`flex min-w-0 cursor-pointer flex-col gap-2 rounded-2xl border-2 p-3 transition-all sm:flex-row sm:items-center sm:justify-between sm:p-4 ${paymentMethod === 'cash' ? 'border-primary bg-primary/5' : 'border-muted hover:border-primary/20'}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                          <Banknote className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 space-y-0.5">
                          <p className="font-bold leading-tight">À la livraison</p>
                          <p className="text-[9px] uppercase tracking-widest text-muted-foreground">Espèces</p>
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
                        className={`flex min-w-0 cursor-pointer flex-col gap-2 rounded-2xl border-2 p-4 transition-all sm:flex-row sm:items-center sm:justify-between sm:p-6 ${paymentStrategy === 'FULL' ? 'border-primary bg-primary/5' : 'border-muted hover:border-primary/20'}`}
                      >
                        <div className="space-y-1">
                          <p className="font-bold">Payer la totalité</p>
                          <p className="text-[10px] text-muted-foreground uppercase tracking-widest">100% à la commande</p>
                        </div>
                        <RadioGroupItem value="FULL" id="full" className="sr-only" />
                      </Label>

                      <Label
                        htmlFor="half"
                        className={`flex min-w-0 cursor-pointer flex-col gap-2 rounded-2xl border-2 p-4 transition-all sm:flex-row sm:items-center sm:justify-between sm:p-6 ${paymentStrategy === '50-50' ? 'border-primary bg-primary/5' : 'border-muted hover:border-primary/20'}`}
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

                <div className="space-y-4 rounded-2xl border bg-muted/30 p-4 sm:p-5">
                  {paymentMethod !== 'cash' && (
                    <div className="flex flex-wrap items-center gap-2 text-primary">
                      <Smartphone className="h-5 w-5 shrink-0" />
                      <span className="font-bold">Montant à régler maintenant</span>
                      <span className="ml-auto rounded-full bg-primary/15 px-3 py-1 text-sm font-bold tabular-nums text-primary">
                        {amountDueNow.toLocaleString('fr-FR')} FCFA
                      </span>
                    </div>
                  )}
                  {paymentMethod !== 'cash' && paymentMethod !== 'bank' && (
                    <p className="text-xs text-muted-foreground">
                      Numéro marchand :{' '}
                      <span className="font-semibold text-foreground">{getMerchantPhoneDisplay()}</span>
                    </p>
                  )}

                  {mobileInstructions && (
                    <div>
                      <p className="text-sm font-semibold text-foreground">{mobileInstructions.headline}</p>
                      <ul className="mt-3 list-inside list-disc space-y-2 text-sm text-muted-foreground">
                        {mobileInstructions.bullets.map((line, i) => (
                          <li key={i} className="leading-relaxed">
                            {line}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {(isMobileMoneyOperator(paymentMethod) || paymentMethod === 'bank') && (
                    <div className="space-y-2">
                      <Label htmlFor="payment-ref" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                        Référence de paiement (optionnel)
                      </Label>
                      <Input
                        id="payment-ref"
                        placeholder={
                          paymentMethod === 'bank'
                            ? 'Ex. référence virement, date d’envoi…'
                            : 'Ex. ID Wave, reçu Orange Money…'
                        }
                        className="rounded-xl"
                        value={paymentReference}
                        onChange={(e) => setPaymentReference(e.target.value)}
                      />
                      <p className="text-[11px] text-muted-foreground">
                        Utile pour accélérer la vérification côté boutique. Vous pouvez laisser vide.
                      </p>
                    </div>
                  )}

                  {paymentMethod === 'bank' && (
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      Après confirmation, vous recevrez les coordonnées bancaires (RIB / IBAN) par e-mail ou WhatsApp pour effectuer le virement du montant de{' '}
                      <span className="font-bold text-foreground">{amountDueNow.toLocaleString('fr-FR')} FCFA</span>. Indiquez la référence de votre commande en libellé.
                    </p>
                  )}

                  {paymentMethod === 'cash' && (
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      Aucun paiement en ligne : vous réglerez la totalité de{' '}
                      <span className="font-bold text-foreground">{finalTotal.toLocaleString('fr-FR')} FCFA</span> en espèces au livreur. Les frais de livraison restent à votre charge.
                    </p>
                  )}
                </div>

                <Button className="w-full h-14 rounded-full text-lg font-bold" onClick={handlePlaceOrder}>
                  Confirmer la commande
                </Button>
              </motion.div>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-5 rounded-3xl border bg-card p-5 sm:top-28 sm:space-y-6 sm:p-8 lg:top-32">
              <h2 className="text-xl font-serif font-bold">Votre Commande</h2>
              
              <div className="space-y-4 max-h-[300px] overflow-auto pr-2">
                {items.map((item) => (
                  <div key={item.id} className="flex min-w-0 gap-3 sm:gap-4">
                    <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-muted sm:h-16 sm:w-16">
                      <img src={item.images[0]} alt={item.name} className="h-full w-full object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
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
                    <div className="flex min-w-0 flex-col gap-2 sm:flex-row">
                      <Input
                        placeholder="Entrez votre code"
                        value={promoInput}
                        onChange={(e) => setPromoInput(e.target.value)}
                        className="h-11 min-w-0 rounded-xl border-none bg-muted/30 text-xs sm:h-10"
                      />
                      <Button
                        size="sm"
                        variant="secondary"
                        className="h-11 shrink-0 rounded-xl px-4 sm:h-10"
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
                
                {step === 2 && paymentMethod !== 'cash' && (
                  <div className="mt-4 space-y-1 rounded-2xl border border-primary/20 bg-primary/5 p-4">
                    <div className="flex justify-between text-sm">
                      <span className="font-bold text-primary">À régler maintenant</span>
                      <span className="font-bold tabular-nums text-primary">
                        {amountDueNow.toLocaleString('fr-FR')} FCFA
                      </span>
                    </div>
                    {amountDueNow < finalTotal && (
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Reste à solder (ex. à la livraison)</span>
                        <span className="font-medium tabular-nums">
                          {(finalTotal - amountDueNow).toLocaleString('fr-FR')} FCFA
                        </span>
                      </div>
                    )}
                  </div>
                )}
                {step === 2 && paymentMethod === 'cash' && (
                  <div className="mt-4 space-y-1 rounded-2xl border border-muted bg-muted/30 p-4">
                    <div className="flex justify-between text-sm">
                      <span className="font-bold">Paiement à la livraison</span>
                      <span className="font-bold tabular-nums">{finalTotal.toLocaleString('fr-FR')} FCFA</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">Total commande (hors livraison).</p>
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
