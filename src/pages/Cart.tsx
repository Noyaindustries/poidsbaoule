import { Link } from 'react-router-dom';
import { Trash2, Minus, Plus, ArrowRight, ShoppingBag, ShieldCheck, Truck, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useCart } from '@/lib/CartContext';

export default function Cart() {
  const { items, updateQuantity, removeFromCart, totalPrice } = useCart();

  const handleUpdateQuantity = (id: string, delta: number) => {
    const item = items.find(item => item.id === id);
    if (item) {
      updateQuantity(id, item.quantity + delta);
    }
  };

  const handleRemoveItem = (id: string) => {
    removeFromCart(id);
    toast.info("Article retiré du panier");
  };

  const subtotal = totalPrice;
  const shipping = subtotal > 200000 ? 0 : 5000;
  const total = subtotal + shipping;

  if (items.length === 0) {
    return (
      <div className="container mx-auto max-w-full space-y-6 px-3 pb-20 pt-28 text-center sm:space-y-8 sm:px-4 sm:pb-24 sm:pt-32">
        <div className="h-32 w-32 bg-muted rounded-full flex items-center justify-center mx-auto">
          <ShoppingBag className="h-16 w-16 text-muted-foreground opacity-20" />
        </div>
        <div className="space-y-4">
          <h1 className="text-2xl font-serif font-bold sm:text-4xl">Votre panier est vide</h1>
          <p className="text-muted-foreground">Il semble que vous n'ayez pas encore ajouté de créations à votre panier.</p>
        </div>
        <Link to="/shop" onClick={() => window.scrollTo(0, 0)}>
          <Button size="lg" className="rounded-full px-10">Découvrir la boutique</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-w-0 max-w-[100vw] overflow-x-clip pb-16 pt-20 sm:pb-24 sm:pt-24">
      <div className="container mx-auto max-w-full px-3 sm:px-4 md:px-6">
        <h1 className="mb-8 text-2xl font-serif font-bold sm:mb-12 sm:text-4xl">Votre Panier</h1>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-3 lg:gap-16">
          {/* Items List */}
          <div className="lg:col-span-2 space-y-8">
            <div className="hidden md:grid grid-cols-6 text-xs uppercase tracking-widest font-bold text-muted-foreground pb-4 border-b">
              <div className="col-span-3">Produit</div>
              <div className="text-center">Prix</div>
              <div className="text-center">Quantité</div>
              <div className="text-right">Total</div>
            </div>

            <div className="space-y-8">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="grid grid-cols-1 items-center gap-4 border-b pb-6 last:border-0 md:grid-cols-6 md:gap-6 md:pb-8"
                >
                  <div className="col-span-3 flex min-w-0 gap-4 sm:gap-6">
                    <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-muted sm:h-24 sm:w-24">
                      <img 
                        src={item.images[0]} 
                        alt={item.name} 
                        className="w-full h-full object-cover" 
                        referrerPolicy="no-referrer" 
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                    <div className="min-w-0 flex-1 space-y-1">
                      <h3 className="text-base font-serif font-bold leading-snug sm:text-lg">{item.name}</h3>
                      <p className="text-xs text-muted-foreground uppercase tracking-widest">{item.category}</p>
                      <button 
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-xs text-primary font-bold flex items-center gap-1 pt-2 hover:underline"
                      >
                        <Trash2 className="h-3 w-3" /> Retirer
                      </button>
                    </div>
                  </div>

                  <div className="text-center font-medium md:block flex justify-between">
                    <span className="md:hidden text-xs uppercase tracking-widest text-muted-foreground">Prix:</span>
                    {item.price.toLocaleString()} FCFA
                  </div>

                  <div className="flex justify-center">
                    <div className="flex items-center border rounded-full p-1 bg-muted/50">
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => handleUpdateQuantity(item.id, -1)}>
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center text-sm font-bold">{item.quantity}</span>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => handleUpdateQuantity(item.id, 1)}>
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  <div className="text-right font-bold text-primary md:block flex justify-between">
                    <span className="md:hidden text-xs uppercase tracking-widest text-muted-foreground">Total:</span>
                    {(item.price * item.quantity).toLocaleString()} FCFA
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-8">
              <Link to="/shop" onClick={() => window.scrollTo(0, 0)}>
                <Button variant="ghost" className="text-primary font-bold uppercase tracking-widest text-xs p-0">
                  <ChevronLeft className="mr-2 h-4 w-4" /> Continuer mes achats
                </Button>
              </Link>
            </div>
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6 rounded-3xl border bg-card p-5 sm:top-28 sm:space-y-8 sm:p-8 lg:top-32">
              <h2 className="text-xl font-serif font-bold sm:text-2xl">Résumé</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Sous-total</span>
                  <span className="font-bold">{subtotal.toLocaleString()} FCFA</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Livraison</span>
                  <span className="font-bold text-xs uppercase tracking-widest text-primary">À la charge du client</span>
                </div>
                <Separator />
                <div className="flex justify-between text-xl">
                  <span className="font-serif font-bold">Total</span>
                  <span className="font-bold text-primary">{subtotal.toLocaleString()} FCFA</span>
                </div>
                <p className="text-[10px] text-muted-foreground italic text-center px-4">Les frais de livraison ne sont pas inclus et seront à régler auprès du livreur.</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="coupon" className="text-[10px] uppercase tracking-widest font-bold opacity-60">Code Promo</Label>
                  <div className="flex min-w-0 flex-col gap-2 sm:flex-row">
                    <Input id="coupon" placeholder="Votre code" className="h-11 min-w-0 rounded-full sm:h-10" />
                    <Button variant="outline" className="h-11 shrink-0 rounded-full sm:h-10">
                      Appliquer
                    </Button>
                  </div>
                </div>
              </div>

              <Link to="/checkout" onClick={() => window.scrollTo(0, 0)}>
                <Button className="w-full h-14 rounded-full text-lg font-bold">
                  Passer à la caisse <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>

              <div className="space-y-4 pt-4">
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  <span>Paiement sécurisé à la livraison</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <Truck className="h-4 w-4 text-primary" />
                  <span>Livraison à domicile à Abidjan</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
