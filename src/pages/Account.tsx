import { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Heart,
  Gift,
  User,
  TrendingUp,
  ShoppingBag,
  Clock,
  MapPin,
  Package,
  Pencil,
  Trash2,
  Home,
} from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUsers } from '@/lib/UserContext';
import { useOrders } from '@/lib/OrderContext';
import { useProducts } from '@/lib/ProductContext';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Address, Order } from '@/types';

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function orderStatusVariant(status: Order['status']): string {
  switch (status) {
    case 'Livrée':
      return 'bg-emerald-100 text-emerald-800 border-none';
    case 'Expédiée':
    case 'En préparation':
      return 'bg-blue-100 text-blue-800 border-none';
    case 'Paiement reçu':
      return 'bg-teal-100 text-teal-800 border-none';
    case 'En attente de paiement':
      return 'bg-amber-100 text-amber-900 border-none';
    case 'Annulée':
      return 'bg-slate-200 text-slate-700 border-none';
    default:
      return 'bg-muted text-muted-foreground border-none';
  }
}

function AccountSignedIn() {
  const { currentUser, logout, updateUserFields, toggleWishlist } = useUsers();
  const { orders } = useOrders();
  const { products } = useProducts();

  const [savingProfile, setSavingProfile] = useState(false);
  const [profileName, setProfileName] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [profileCity, setProfileCity] = useState('');

  const [addrStreet, setAddrStreet] = useState('');
  const [addrCity, setAddrCity] = useState('');
  const [addrCountry, setAddrCountry] = useState('Côte d\'Ivoire');
  const [addrDefault, setAddrDefault] = useState(true);
  const [savingAddr, setSavingAddr] = useState(false);

  const userOrders = useMemo(() => {
    if (!currentUser) return [];
    return [...orders.filter((o) => o.customerEmail === currentUser.email)].sort((a, b) =>
      b.createdAt.localeCompare(a.createdAt)
    );
  }, [orders, currentUser]);

  useEffect(() => {
    if (!currentUser) return;
    setProfileName(currentUser.name);
    setProfilePhone(currentUser.phone || '');
    setProfileCity(currentUser.city || '');
  }, [currentUser]);

  if (!currentUser) return null;

  const activeDiscounts = currentUser.wallet.filter((d) => !d.isUsed && new Date(d.expiryDate) > new Date());
  const expiredDiscounts = currentUser.wallet.filter((d) => !d.isUsed && new Date(d.expiryDate) <= new Date());
  const wishlistProducts = products.filter((p) => currentUser.wishlist.includes(p.id));

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await updateUserFields(currentUser.id, {
        name: profileName.trim() || currentUser.name,
        phone: profilePhone.trim(),
        city: profileCity.trim() || undefined,
      });
      toast.success('Profil mis à jour.');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Impossible d’enregistrer.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addrStreet.trim() || !addrCity.trim() || !addrCountry.trim()) {
      toast.error('Renseignez rue, ville et pays.');
      return;
    }
    setSavingAddr(true);
    try {
      const id = `addr_${Date.now()}`;
      let next = [...(currentUser.addresses || [])];
      if (addrDefault) {
        next = next.map((a) => ({ ...a, isDefault: false }));
      }
      const entry: Address = {
        id,
        street: addrStreet.trim(),
        city: addrCity.trim(),
        country: addrCountry.trim(),
        isDefault: addrDefault,
      };
      await updateUserFields(currentUser.id, { addresses: [...next, entry] });
      setAddrStreet('');
      setAddrCity('');
      setAddrCountry("Côte d'Ivoire");
      setAddrDefault(true);
      toast.success('Adresse enregistrée.');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Erreur lors de l’ajout.');
    } finally {
      setSavingAddr(false);
    }
  };

  const removeAddress = async (id: string) => {
    try {
      const next = (currentUser.addresses || []).filter((a) => a.id !== id);
      await updateUserFields(currentUser.id, { addresses: next });
      toast.success('Adresse supprimée.');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Suppression impossible.');
    }
  };

  const setDefaultAddress = async (id: string) => {
    try {
      const next = (currentUser.addresses || []).map((a) => ({
        ...a,
        isDefault: a.id === id,
      }));
      await updateUserFields(currentUser.id, { addresses: next });
      toast.success('Adresse par défaut mise à jour.');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Mise à jour impossible.');
    }
  };

  return (
    <div className="min-h-[100dvh] min-w-0 max-w-[100vw] overflow-x-clip bg-muted/10 pb-20 pt-24 sm:pb-24 sm:pt-28 md:pt-32">
      <div className="container mx-auto max-w-6xl px-3 sm:px-4 md:px-6">
        <header className="mb-10 flex flex-col gap-6 border-b border-border/60 pb-8 md:flex-row md:items-center md:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary font-serif text-xl font-bold text-primary-foreground shadow-md md:h-20 md:w-20 md:text-2xl">
              {initials(currentUser.name)}
            </div>
            <div className="min-w-0 space-y-2">
              <div className="flex flex-wrap items-center gap-2 md:gap-3">
                <h1 className="font-serif text-3xl font-bold tracking-tight md:text-4xl">{currentUser.name}</h1>
                <Badge
                  className={`rounded-full border-none px-3 py-0.5 text-[10px] uppercase tracking-widest ${
                    currentUser.segment === 'VIP'
                      ? 'bg-amber-100 text-amber-800'
                      : currentUser.segment === 'Régulier'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-sky-100 text-sky-800'
                  }`}
                >
                  {currentUser.segment}
                </Badge>
              </div>
              <p className="truncate text-sm text-muted-foreground">{currentUser.email}</p>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                {currentUser.phone ? (
                  <span className="inline-flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 shrink-0" />
                    {currentUser.phone}
                  </span>
                ) : null}
                {currentUser.city ? (
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    {currentUser.city}
                  </span>
                ) : null}
              </div>
            </div>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <Link
              to="/shop"
              onClick={() => window.scrollTo(0, 0)}
              className={cn(buttonVariants({ variant: 'outline' }), 'rounded-full border-primary/20')}
            >
              Continuer mes achats
            </Link>
            <Button
              variant="outline"
              className="rounded-full border-destructive/25 text-destructive hover:bg-destructive/10"
              onClick={() => void logout()}
            >
              Se déconnecter
            </Button>
          </div>
        </header>

        <Tabs defaultValue="vue" className="space-y-8">
          <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1 rounded-2xl bg-muted/60 p-1.5 md:rounded-full">
            <TabsTrigger value="vue" className="rounded-full px-4 py-2.5 text-xs font-bold uppercase tracking-wider data-[state=active]:bg-background data-[state=active]:shadow-sm">
              Aperçu
            </TabsTrigger>
            <TabsTrigger value="infos" className="rounded-full px-4 py-2.5 text-xs font-bold uppercase tracking-wider data-[state=active]:bg-background data-[state=active]:shadow-sm">
              Mes infos
            </TabsTrigger>
            <TabsTrigger value="adresses" className="rounded-full px-4 py-2.5 text-xs font-bold uppercase tracking-wider data-[state=active]:bg-background data-[state=active]:shadow-sm">
              Adresses
            </TabsTrigger>
            <TabsTrigger value="commandes" className="rounded-full px-4 py-2.5 text-xs font-bold uppercase tracking-wider data-[state=active]:bg-background data-[state=active]:shadow-sm">
              Commandes
            </TabsTrigger>
            <TabsTrigger value="favoris" className="rounded-full px-4 py-2.5 text-xs font-bold uppercase tracking-wider data-[state=active]:bg-background data-[state=active]:shadow-sm">
              Favoris
            </TabsTrigger>
          </TabsList>

          <TabsContent value="vue" className="space-y-8 outline-none">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              <div className="space-y-6 lg:col-span-2">
                <Card className="relative overflow-hidden rounded-[32px] border-none bg-primary text-primary-foreground shadow-xl">
                  <div className="pointer-events-none absolute right-0 top-0 p-10 opacity-10">
                    <Gift className="h-40 w-40 rotate-12" />
                  </div>
                  <CardContent className="relative z-10 space-y-6 p-8 md:p-10">
                    <div>
                      <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.35em] opacity-75">Portefeuille remises</p>
                      <p className="font-serif text-4xl font-bold md:text-5xl">
                        {activeDiscounts.reduce((s, d) => s + d.amount, 0).toLocaleString()}{' '}
                        <span className="text-lg font-sans font-normal opacity-90">FCFA</span>
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-3 border-t border-white/20 pt-6">
                      <div className="flex items-center gap-3 rounded-2xl bg-white/10 px-5 py-3 backdrop-blur-sm">
                        <Gift className="h-5 w-5 text-accent" />
                        <div>
                          <p className="text-[10px] font-bold uppercase opacity-70">Actives</p>
                          <p className="text-lg font-bold">{activeDiscounts.length}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 rounded-2xl bg-white/10 px-5 py-3 backdrop-blur-sm">
                        <ShoppingBag className="h-5 w-5 text-accent" />
                        <div>
                          <p className="text-[10px] font-bold uppercase opacity-70">Commandes</p>
                          <p className="text-lg font-bold">{userOrders.length}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 rounded-2xl bg-white/10 px-5 py-3 backdrop-blur-sm">
                        <Heart className="h-5 w-5 text-accent" />
                        <div>
                          <p className="text-[10px] font-bold uppercase opacity-70">Favoris</p>
                          <p className="text-lg font-bold">{wishlistProducts.length}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="space-y-4">
                  <h2 className="font-serif text-2xl font-bold">Remises utilisables</h2>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {activeDiscounts.length > 0 ? (
                      activeDiscounts.map((disc) => (
                        <Card key={disc.id} className="rounded-[28px] border border-primary/10 bg-card shadow-sm">
                          <CardContent className="flex items-center justify-between gap-4 p-6">
                            <div>
                              <p className="text-[10px] font-bold uppercase tracking-widest text-primary">Bon privilégié</p>
                              <p className="mt-1 font-sans text-2xl font-bold tabular-nums">{disc.amount.toLocaleString()} FCFA</p>
                              <p className="mt-2 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                Expire le {new Date(disc.expiryDate).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                              <Gift className="h-6 w-6" />
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <div className="col-span-full rounded-[28px] border-2 border-dashed border-muted-foreground/20 bg-muted/20 p-10 text-center text-muted-foreground">
                        Aucune remise active pour le moment.
                      </div>
                    )}
                  </div>
                </div>

                {expiredDiscounts.length > 0 ? (
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Remises expirées (non utilisées)</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      {expiredDiscounts.map((d) => (
                        <li key={d.id} className="flex justify-between rounded-xl bg-muted/40 px-4 py-2">
                          <span>{d.amount.toLocaleString()} FCFA</span>
                          <span>exp. {new Date(d.expiryDate).toLocaleDateString()}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>

              <div className="space-y-6">
                <Card className="rounded-[28px] border-none shadow-md">
                  <CardHeader>
                    <CardTitle className="font-serif text-xl">Fidélité</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      <span>Progression</span>
                      <span>{userOrders.length} / 10</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary transition-all duration-700"
                        style={{ width: `${Math.min((userOrders.length / 10) * 100, 100)}%` }}
                      />
                    </div>
                    <p className="text-sm italic leading-relaxed text-muted-foreground">
                      {currentUser.segment === 'VIP'
                        ? 'Vous êtes client VIP : merci pour votre confiance.'
                        : currentUser.segment === 'Régulier'
                          ? 'Encore quelques commandes pour atteindre le statut VIP.'
                          : 'Vos avantages fidélité évoluent à chaque commande.'}
                    </p>
                  </CardContent>
                </Card>

                <Card className="rounded-[28px] border-none shadow-md">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="font-serif text-xl">Dernières commandes</CardTitle>
                    <Link
                      to="/cart"
                      onClick={() => window.scrollTo(0, 0)}
                      className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'text-xs text-primary')}
                    >
                      Panier
                    </Link>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-56 pr-3">
                      <div className="space-y-2">
                        {userOrders.length === 0 ? (
                          <p className="py-6 text-center text-sm text-muted-foreground">Aucune commande pour l’instant.</p>
                        ) : (
                          userOrders.slice(0, 6).map((order) => (
                            <div
                              key={order.id}
                              className="flex items-center justify-between gap-2 rounded-xl border border-transparent px-3 py-2.5 hover:bg-muted/50"
                            >
                              <div className="min-w-0">
                                <p className="truncate text-xs font-bold">{order.id}</p>
                                <p className="text-[10px] text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</p>
                              </div>
                              <Badge className={`shrink-0 text-[9px] uppercase ${orderStatusVariant(order.status)}`}>{order.status}</Badge>
                              <span className="shrink-0 text-xs font-bold tabular-nums">{order.total.toLocaleString()} F</span>
                            </div>
                          ))
                        )}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="infos" className="outline-none">
            <Card className="mx-auto max-w-xl rounded-[28px] border-none shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-serif text-2xl">
                  <Pencil className="h-5 w-5 text-primary" />
                  Coordonnées
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  L’e-mail sert d’identifiant de connexion ; pour le modifier, contactez le support.
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveProfile} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="prof-name">Nom complet</Label>
                    <Input
                      id="prof-name"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      className="rounded-xl"
                      autoComplete="name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="prof-email">E-mail</Label>
                    <Input id="prof-email" type="email" value={currentUser.email} disabled className="rounded-xl bg-muted/60" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="prof-phone">Téléphone</Label>
                    <Input
                      id="prof-phone"
                      value={profilePhone}
                      onChange={(e) => setProfilePhone(e.target.value)}
                      placeholder="+225 …"
                      className="rounded-xl"
                      autoComplete="tel"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="prof-city">Ville</Label>
                    <Input
                      id="prof-city"
                      value={profileCity}
                      onChange={(e) => setProfileCity(e.target.value)}
                      placeholder="Abidjan"
                      className="rounded-xl"
                    />
                  </div>
                  <Button type="submit" disabled={savingProfile} className="w-full rounded-full">
                    {savingProfile ? 'Enregistrement…' : 'Enregistrer les modifications'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="adresses" className="outline-none">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              <Card className="rounded-[28px] border-none shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 font-serif text-xl">
                    <Home className="h-5 w-5 text-primary" />
                    Mes adresses
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {(currentUser.addresses || []).length === 0 ? (
                    <p className="text-sm text-muted-foreground">Aucune adresse enregistrée.</p>
                  ) : (
                    <ul className="space-y-3">
                      {(currentUser.addresses || []).map((a) => (
                        <li key={a.id} className="rounded-2xl border border-border/80 bg-card p-4">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              {a.isDefault ? (
                                <Badge className="mb-2 border-none bg-primary/10 text-primary hover:bg-primary/15">Par défaut</Badge>
                              ) : null}
                              <p className="text-sm font-medium leading-snug">{a.street}</p>
                              <p className="mt-1 text-xs text-muted-foreground">
                                {a.city}, {a.country}
                              </p>
                            </div>
                            <div className="flex shrink-0 gap-1">
                              {!a.isDefault ? (
                                <Button type="button" variant="ghost" size="sm" className="h-8 text-xs" onClick={() => void setDefaultAddress(a.id)}>
                                  Définir
                                </Button>
                              ) : null}
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:bg-destructive/10"
                                onClick={() => void removeAddress(a.id)}
                                title="Supprimer"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>

              <Card className="rounded-[28px] border-none shadow-lg">
                <CardHeader>
                  <CardTitle className="font-serif text-xl">Ajouter une adresse</CardTitle>
                  <p className="text-sm text-muted-foreground">Utilisée comme référence pour vos livraisons.</p>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAddAddress} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="addr-street">Rue / quartier</Label>
                      <Input id="addr-street" value={addrStreet} onChange={(e) => setAddrStreet(e.target.value)} className="rounded-xl" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="addr-city">Ville</Label>
                      <Input id="addr-city" value={addrCity} onChange={(e) => setAddrCity(e.target.value)} className="rounded-xl" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="addr-country">Pays</Label>
                      <Input id="addr-country" value={addrCountry} onChange={(e) => setAddrCountry(e.target.value)} className="rounded-xl" />
                    </div>
                    <label className="flex cursor-pointer items-center gap-2 text-sm">
                      <input type="checkbox" checked={addrDefault} onChange={(e) => setAddrDefault(e.target.checked)} className="rounded border-input" />
                      Définir comme adresse par défaut
                    </label>
                    <Button type="submit" disabled={savingAddr} className="w-full rounded-full">
                      {savingAddr ? 'Ajout…' : 'Ajouter l’adresse'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="commandes" className="outline-none">
            <Card className="rounded-[28px] border-none shadow-lg">
              <CardHeader>
                <CardTitle className="font-serif text-2xl">Historique des commandes</CardTitle>
                <p className="text-sm text-muted-foreground">Toutes les commandes associées à votre e-mail.</p>
              </CardHeader>
              <CardContent>
                {userOrders.length === 0 ? (
                  <div className="rounded-2xl border border-dashed py-16 text-center text-muted-foreground">
                    <Package className="mx-auto mb-3 h-10 w-10 opacity-40" />
                    <p>Aucune commande pour le moment.</p>
                    <Link to="/shop" className={cn(buttonVariants(), 'mt-6 rounded-full')}>
                      Découvrir la boutique
                    </Link>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[640px] text-left text-sm">
                      <thead>
                        <tr className="border-b text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                          <th className="pb-3 pr-4">Réf.</th>
                          <th className="pb-3 pr-4">Date</th>
                          <th className="pb-3 pr-4">Statut</th>
                          <th className="pb-3 pr-4">Articles</th>
                          <th className="pb-3 text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {userOrders.map((order) => (
                          <tr key={order.id} className="border-b border-border/40 last:border-0">
                            <td className="py-4 pr-4 font-mono text-xs font-semibold">{order.id}</td>
                            <td className="py-4 pr-4 text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</td>
                            <td className="py-4 pr-4">
                              <Badge className={`text-[10px] uppercase ${orderStatusVariant(order.status)}`}>{order.status}</Badge>
                            </td>
                            <td className="py-4 pr-4 text-muted-foreground">{order.items.length} article(s)</td>
                            <td className="py-4 text-right font-bold tabular-nums">{order.total.toLocaleString()} FCFA</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="favoris" className="outline-none">
            {wishlistProducts.length === 0 ? (
              <Card className="rounded-[28px] border-none py-16 text-center shadow-md">
                <CardContent className="space-y-4">
                  <Heart className="mx-auto h-12 w-12 text-muted-foreground/40" />
                  <p className="text-muted-foreground">Vous n’avez pas encore de favoris.</p>
                  <p className="text-sm text-muted-foreground">
                    Sur une fiche produit, utilisez le cœur à côté du titre pour enregistrer une pièce.
                  </p>
                  <Link to="/shop" className={cn(buttonVariants(), 'rounded-full')}>
                    Parcourir la boutique
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {wishlistProducts.map((p) => (
                  <Card key={p.id} className="overflow-hidden rounded-[28px] border-none shadow-md">
                    <Link to={`/product/${p.id}`} onClick={() => window.scrollTo(0, 0)} className="block">
                      <div className="aspect-[4/5] bg-muted">
                        <img src={p.images[0]} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                    </Link>
                    <CardContent className="space-y-3 p-5">
                      <Link to={`/product/${p.id}`} className="font-serif text-lg font-bold hover:text-primary" onClick={() => window.scrollTo(0, 0)}>
                        {p.name}
                      </Link>
                      <p className="font-bold text-primary tabular-nums">{p.price.toLocaleString()} FCFA</p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="w-full rounded-full"
                        onClick={async () => {
                          try {
                            await toggleWishlist(p.id);
                            toast.success('Retiré des favoris');
                          } catch {
                            toast.error('Action impossible');
                          }
                        }}
                      >
                        Retirer des favoris
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default function Account() {
  const { currentUser, signup, login } = useUsers();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (mode === 'signup') {
        await signup(formData.name, formData.email, formData.phone, formData.password);
        toast.success('Bienvenue chez Poids Baoulé !');
      } else {
        await login(formData.email, formData.password);
        toast.success('Bon retour parmi nous !');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '';
      if (message.toLowerCase().includes('load failed') || message.toLowerCase().includes('fetch')) {
        toast.error('Erreur de connexion au serveur. Vérifiez votre connexion internet.');
      } else {
        toast.error(message || 'Une erreur est survenue. Veuillez réessayer.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (currentUser) {
    return <AccountSignedIn />;
  }

  return (
    <div className="min-h-[100dvh] min-w-0 max-w-[100vw] overflow-x-clip bg-muted/10 pb-20 pt-24 sm:pb-24 sm:pt-28 md:pt-32">
      <div className="container mx-auto max-w-full px-3 sm:px-4 md:px-6">
        <div className="mx-auto max-w-5xl space-y-10">
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[40px] border border-muted/40 bg-white p-10 shadow-xl"
          >
            <div className="grid items-center gap-10 lg:grid-cols-[1.25fr_1fr]">
              <div className="space-y-6">
                <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.35em] text-primary">
                  <ShieldCheck className="h-4 w-4" /> Espace client privilégié
                </span>
                <h1 className="font-serif text-4xl font-bold md:text-5xl">Bienvenue dans votre espace client</h1>
                <p className="text-lg leading-relaxed text-muted-foreground">
                  Connectez-vous ou créez un compte pour suivre vos commandes, gérer vos adresses et profiter d’avantages exclusifs.
                </p>

                <ul className="grid gap-3 sm:grid-cols-2">
                  <li className="flex items-center gap-3 rounded-2xl bg-muted/30 p-4 text-sm text-foreground/80">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <Gift className="h-4 w-4 text-primary" />
                    </div>
                    Remises & portefeuille
                  </li>
                  <li className="flex items-center gap-3 rounded-2xl bg-muted/30 p-4 text-sm text-foreground/80">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <TrendingUp className="h-4 w-4 text-primary" />
                    </div>
                    Programme fidélité VIP
                  </li>
                </ul>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="rounded-[32px] border border-primary/20 bg-primary/5 p-8"
              >
                <div className="mb-8 flex gap-2">
                  <Button variant={mode === 'signin' ? 'secondary' : 'outline'} className="flex-1 rounded-full" onClick={() => setMode('signin')}>
                    Se connecter
                  </Button>
                  <Button variant={mode === 'signup' ? 'secondary' : 'outline'} className="flex-1 rounded-full" onClick={() => setMode('signup')}>
                    S&apos;inscrire
                  </Button>
                </div>

                <form onSubmit={handleAuth} className="space-y-5">
                  {mode === 'signup' && (
                    <div className="space-y-2">
                      <Label htmlFor="name">Nom complet</Label>
                      <Input
                        id="name"
                        placeholder="Jean Kouassi"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required={mode === 'signup'}
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="email">Adresse e-mail</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="jean@exemple.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Mot de passe</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                    />
                  </div>

                  {mode === 'signup' && (
                    <div className="space-y-2">
                      <Label htmlFor="phone">Téléphone</Label>
                      <Input
                        id="phone"
                        placeholder="+225 07 07 07 07"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        required={mode === 'signup'}
                      />
                    </div>
                  )}

                  <Button type="submit" disabled={isLoading} className="h-14 w-full rounded-full text-base font-bold shadow-lg shadow-primary/20">
                    {isLoading ? 'Chargement...' : mode === 'signin' ? 'Se connecter' : 'Créer mon compte'}
                  </Button>
                </form>

                <p className="mt-6 text-center text-sm text-muted-foreground">
                  {mode === 'signin' ? (
                    <>
                      Pas encore membre ?{' '}
                      <button type="button" onClick={() => setMode('signup')} className="font-bold text-primary underline">
                        Créer un compte
                      </button>
                    </>
                  ) : (
                    <>
                      Déjà membre ?{' '}
                      <button type="button" onClick={() => setMode('signin')} className="font-bold text-primary underline">
                        Se connecter
                      </button>
                    </>
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
