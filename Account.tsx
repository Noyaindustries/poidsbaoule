import { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, ShieldCheck, Heart, Gift, User, Lock, Truck, TrendingUp, ShoppingBag, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUsers } from '@/lib/UserContext';
import { useOrders } from '@/lib/OrderContext';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';

export default function Account() {
  const { currentUser, signup, login, logout } = useUsers();
  const { orders } = useOrders();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '' });

  const [isLoading, setIsLoading] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (mode === 'signup') {
        await signup(formData.name, formData.email, formData.phone, formData.password);
        toast.success("Bienvenue chez Poids Baoulé !");
      } else {
        await login(formData.email, formData.password);
        toast.success("Bon retour parmi nous !");
      }
    } catch (err: any) {
      const message = err.message || "";
      if (message.toLowerCase().includes('load failed') || message.toLowerCase().includes('fetch')) {
        toast.error("Erreur de connexion au serveur. Veuillez vérifier votre connexion internet.");
      } else {
        toast.error(message || "Une erreur est survenue. Veuillez réessayer.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (currentUser) {
    const userOrders = orders.filter(o => o.customerEmail === currentUser.email);
    const activeDiscounts = currentUser.wallet.filter(d => !d.isUsed && new Date(d.expiryDate) > new Date());
    const expiredDiscounts = currentUser.wallet.filter(d => !d.isUsed && new Date(d.expiryDate) <= new Date());

    return (
      <div className="pt-32 pb-24 min-h-screen bg-muted/10">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto space-y-12">
            {/* Profile Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <h1 className="text-4xl font-serif font-bold">{currentUser.name}</h1>
                  <Badge className={`rounded-full px-4 py-1 border-none ${
                    currentUser.segment === 'VIP' ? 'bg-amber-100 text-amber-700' : 
                    currentUser.segment === 'Régulier' ? 'bg-green-100 text-green-700' : 
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {currentUser.segment}
                  </Badge>
                </div>
                <p className="text-muted-foreground">{currentUser.email} • Membre {currentUser.segment}</p>
              </div>
              <Button variant="outline" className="rounded-full px-8 border-destructive/20 text-destructive hover:bg-destructive/10" onClick={async () => await logout()}>
                Se déconnecter
              </Button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Wallet Section */}
              <div className="lg:col-span-2 space-y-8">
                <Card className="rounded-[40px] border-none shadow-xl overflow-hidden bg-primary text-primary-foreground relative">
                  <div className="absolute top-0 right-0 p-12 opacity-10 rotate-12">
                    <Gift className="h-48 w-48" />
                  </div>
                  <CardContent className="p-12 relative z-10 space-y-8">
                    <div>
                      <h3 className="text-[10px] uppercase tracking-[0.4em] font-bold opacity-70 mb-4">Mon Portefeuille / Remises</h3>
                      <p className="text-5xl font-serif font-bold">
                        {activeDiscounts.reduce((sum, d) => sum + d.amount, 0).toLocaleString()} <span className="text-xl">FCFA</span>
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-4 pt-4 border-t border-white/20">
                      <div className="bg-white/10 backdrop-blur-md rounded-2xl px-6 py-4 flex items-center gap-3">
                        <Gift className="h-5 w-5 text-accent" />
                        <div>
                          <p className="text-[10px] uppercase font-bold opacity-60">Offres actives</p>
                          <p className="text-lg font-bold">{activeDiscounts.length}</p>
                        </div>
                      </div>
                      <div className="bg-white/10 backdrop-blur-md rounded-2xl px-6 py-4 flex items-center gap-3">
                        <ShoppingBag className="h-5 w-5 text-accent" />
                        <div>
                          <p className="text-[10px] uppercase font-bold opacity-60">Commandes</p>
                          <p className="text-lg font-bold">{userOrders.length}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="space-y-6">
                  <h2 className="text-2xl font-serif font-bold flex items-center gap-3">
                    Mes Remises Spéciales
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {activeDiscounts.length > 0 ? activeDiscounts.map(disc => (
                      <Card key={disc.id} className="rounded-[32px] border-none shadow-sm bg-accent/5 overflow-hidden group">
                        <CardContent className="p-6 flex justify-between items-center h-full">
                          <div className="space-y-1">
                            <p className="text-[10px] uppercase tracking-widest font-bold text-primary">Bon d'Achat Privilégié</p>
                            <p className="text-2xl font-bold font-sans">{disc.amount.toLocaleString()} FCFA</p>
                            <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-2">
                              <Clock className="h-3 w-3" />
                              <span>Expire le {new Date(disc.expiryDate).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                            <Gift className="h-6 w-6" />
                          </div>
                        </CardContent>
                      </Card>
                    )) : (
                      <div className="col-span-2 p-12 text-center border-2 border-dashed rounded-[40px] bg-muted/20">
                        <p className="text-muted-foreground">Vous n'avez pas de remises actives pour le moment.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Sidebar: Status & History */}
              <div className="space-y-8">
                <Card className="rounded-[40px] border-none shadow-sm p-8 space-y-6">
                  <h3 className="text-xl font-serif font-bold">Progression Fidélité</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-muted-foreground">
                        <span>Évolution {currentUser.segment}</span>
                        <span>{userOrders.length} commandes</span>
                      </div>
                      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary transition-all duration-1000" 
                          style={{ width: `${Math.min((userOrders.length / 10) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed italic">
                      {currentUser.segment === 'VIP' 
                        ? "Félicitations ! Vous êtes un client VIP de Poids Baoulé." 
                        : currentUser.segment === 'Régulier' 
                        ? "Plus que quelques commandes pour devenir VIP !" 
                        : "Bienvenue ! Vos premières remises arrivent bientôt."}
                    </p>
                  </div>
                </Card>

                <Card className="rounded-[40px] border-none shadow-sm p-8">
                  <h3 className="text-xl font-serif font-bold mb-6">Dernières Commandes</h3>
                  <ScrollArea className="h-64">
                    <div className="space-y-4">
                      {userOrders.map(order => (
                        <div key={order.id} className="flex justify-between items-center p-3 hover:bg-muted/30 rounded-2xl transition-colors border-b last:border-0 pb-4">
                          <div>
                            <p className="text-xs font-bold">{order.id}</p>
                            <p className="text-[10px] text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</p>
                          </div>
                          <p className="text-xs font-bold">{order.total.toLocaleString()} F</p>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-24 min-h-screen bg-muted/10">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto space-y-10">
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[40px] bg-white border border-muted/40 p-10 shadow-xl"
          >
            <div className="grid gap-10 lg:grid-cols-[1.25fr_1fr] items-center">
              <div className="space-y-6">
                <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-xs uppercase tracking-[0.35em] font-bold text-primary">
                  <ShieldCheck className="h-4 w-4" /> Espace client privilégié
                </span>
                <h1 className="text-4xl md:text-5xl font-serif font-bold">Bienvenue dans votre espace client</h1>
                <p className="text-muted-foreground leading-relaxed text-lg">
                  Connectez-vous ou créez un compte pour accéder à votre espace privilégié, suivre vos commandes et profiter d'avantages exclusifs.
                </p>

                <ul className="grid gap-3 sm:grid-cols-2">
                  <li className="flex items-center gap-3 text-sm text-foreground/80 bg-muted/30 p-4 rounded-2xl">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Gift className="h-4 w-4 text-primary" />
                    </div>
                    Remises exclusives & Wallet
                  </li>
                  <li className="flex items-center gap-3 text-sm text-foreground/80 bg-muted/30 p-4 rounded-2xl">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <TrendingUp className="h-4 w-4 text-primary" />
                    </div>
                    Programme VIP évolutif
                  </li>
                </ul>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="rounded-[32px] border border-primary/20 bg-primary/5 p-8"
              >
                <div className="flex gap-2 mb-8">
                  <Button
                    variant={mode === 'signin' ? 'secondary' : 'outline'}
                    className="rounded-full flex-1"
                    onClick={() => setMode('signin')}
                  >
                    Se connecter
                  </Button>
                  <Button
                    variant={mode === 'signup' ? 'secondary' : 'outline'}
                    className="rounded-full flex-1"
                    onClick={() => setMode('signup')}
                  >
                    S'inscrire
                  </Button>
                </div>

                <form onSubmit={handleAuth} className="space-y-5">
                  {mode === 'signup' && (
                    <div className="space-y-2">
                      <Label htmlFor="name">Nom complet</Label>
                      <Input id="name" placeholder="Jean Kouassi" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required={mode === 'signup'} />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="email">Adresse e-mail</Label>
                    <Input id="email" type="email" placeholder="jean@exemple.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Mot de passe</Label>
                    <Input id="password" type="password" placeholder="••••••••" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required />
                  </div>

                  {mode === 'signup' && (
                    <div className="space-y-2">
                      <Label htmlFor="phone">Téléphone</Label>
                      <Input id="phone" placeholder="+225 07 07 07 07" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} required={mode === 'signup'} />
                    </div>
                  )}

                  <Button type="submit" disabled={isLoading} className="w-full h-14 rounded-full text-base font-bold shadow-lg shadow-primary/20">
                    {isLoading ? 'Chargement...' : (mode === 'signin' ? 'Se connecter' : 'Créer mon compte')}
                  </Button>
                </form>

                <p className="mt-6 text-center text-sm text-muted-foreground">
                  {mode === 'signin' ? (
                    <>Pas encore membre ? <button onClick={() => setMode('signup')} className="text-primary underline font-bold">Créer un compte</button></>
                  ) : (
                    <>Déjà membre ? <button onClick={() => setMode('signin')} className="text-primary underline font-bold">Se connecter</button></>
                  )}
                </p>
              </motion.div>
            </div>
          </motion.section>
        </div>
      </div>
    </div>
  );
}

// Sub-components used in profile view (already available via icons)
const GiftIcon = Gift;
const ClockIcon = Clock;
const UserIcon = User;
const ShoppingBagIcon = ShoppingBag;
