import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, Filter, Download, UserPlus, 
  Mail, Phone, MapPin, MoreVertical,
  Star, TrendingUp, ShoppingBag, Calendar
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuTrigger, DropdownMenuSeparator 
} from '@/components/ui/dropdown-menu';
import { 
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger,
  SheetDescription
} from '@/components/ui/sheet';
import { toast } from 'sonner';
import { exportToCSV } from '@/lib/admin-utils';
import { useUsers } from '@/lib/UserContext';
import { useOrders } from '@/lib/OrderContext';
import { Gift, Clock, AlertCircle } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';

export default function ClientCRM() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const { users } = useUsers();
  const { orders } = useOrders();

  const getClientData = (user: any) => {
    const userOrders = orders.filter(o => o.customerEmail === user.email);
    const totalValue = userOrders.reduce((sum, o) => sum + o.total, 0);
    return { ...user, orderCount: userOrders.length, totalValue, lastOrder: userOrders[0]?.createdAt || "Jamais" };
  };

  const filteredClients = users.map(getClientData).filter(client => 
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleExport = () => {
    exportToCSV(filteredClients, 'Base_Clients_PBH');
  };

  // Calculate Real Global Stats
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const avgBasket = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  
  const repeatCustomers = users.filter(u => {
    const userOrders = orders.filter(o => o.customerEmail === u.email);
    return userOrders.length > 1;
  }).length;
  const retentionRate = users.length > 0 ? (repeatCustomers / users.length) * 100 : 0;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Rechercher un client..." 
            className="pl-10 rounded-full bg-card border-none shadow-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-full shadow-sm" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" /> Exporter CSV
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard label="Total Clients" value={users.length.toString()} />
        <StatsCard label="Clients VIP" value={users.filter(u => u.segment === 'VIP').length.toString()} />
        <StatsCard label="Panier Moyen" value={`${avgBasket.toLocaleString()} FCFA`} />
        <StatsCard label="Taux de Rétention" value={`${retentionRate.toFixed(1)}%`} />
      </div>

      <Card className="rounded-[32px] border-none shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground">
                <tr>
                  <th className="px-8 py-4">Client</th>
                  <th className="px-8 py-4">Ville</th>
                  <th className="px-8 py-4">Commandes</th>
                  <th className="px-8 py-4">Valeur Totale</th>
                  <th className="px-8 py-4">Segment</th>
                  <th className="px-8 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredClients.map((client) => (
                  <tr key={client.id} className="hover:bg-muted/20 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-accent flex items-center justify-center text-accent-foreground font-bold text-xs">
                          {client.name.split(' ').map((n: string) => n[0]).join('')}
                        </div>
                        <div>
                          <p className="font-bold">{client.name}</p>
                          <p className="text-[10px] text-muted-foreground font-bold tracking-widest">{client.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-muted-foreground">{client.city}</td>
                    <td className="px-8 py-6 font-medium">{client.orderCount}</td>
                    <td className="px-8 py-6 font-bold font-sans">{client.totalValue.toLocaleString()} FCFA</td>
                    <td className="px-8 py-6">
                      <Badge className={`rounded-full px-3 py-1 border-none text-[10px] ${
                        client.segment === 'VIP' ? 'bg-amber-100 text-amber-700' : 
                        client.segment === 'Nouveau' ? 'bg-blue-100 text-blue-700' : 
                        'bg-green-100 text-green-700'
                      }`}>
                        {client.segment}
                      </Badge>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <Sheet>
                        <SheetTrigger 
                          render={
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100" onClick={() => setSelectedClient(client)}>
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          }
                        />
                        <ClientDetails client={selectedClient} />
                      </Sheet>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatsCard({ label, value }: { label: string, value: string }) {
  return (
    <Card className="rounded-[30px] border-none shadow-sm">
      <CardContent className="p-6 space-y-2">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">{label}</p>
        <div className="flex items-end justify-between">
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function ClientDetails({ client: initialClient }: { client: any }) {
  const { addDiscountToUser, users } = useUsers();
  const { orders } = useOrders();
  const [discountAmount, setDiscountAmount] = useState('');
  const [discountExpiry, setDiscountExpiry] = useState('30');

  // Sync with live data
  const client = users.find(u => u.id === initialClient?.id) || initialClient;
  if (!client) return null;

  const clientOrders = orders.filter(o => o.customerEmail === client.email);
  const totalSpent = clientOrders.reduce((sum, o) => sum + o.total, 0);

  const handleOfferDiscount = () => {
    if (!discountAmount || isNaN(Number(discountAmount))) {
      toast.error("Veuillez entrer un montant valide");
      return;
    }
    addDiscountToUser(client.id, Number(discountAmount), Number(discountExpiry));
    toast.success(`Remise de ${discountAmount} FCFA offerte à ${client.name}`);
    setDiscountAmount('');
  };

  return (
    <SheetContent className="sm:max-w-2xl w-full overflow-y-auto rounded-l-[40px] border-none shadow-2xl p-0 font-sans">
      <SheetHeader className="p-8 pb-4">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="h-20 w-20 rounded-full bg-accent flex items-center justify-center text-accent-foreground font-bold text-2xl">
            {client.name.split(' ').map((n: string) => n[0]).join('')}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" className="rounded-full"><Mail className="h-4 w-4" /></Button>
            <Button variant="outline" size="icon" className="rounded-full"><Phone className="h-4 w-4" /></Button>
            <Badge className={`rounded-full px-4 py-1 border-none font-bold text-[10px] ${
              client.segment === 'VIP' ? 'bg-amber-100 text-amber-700' : 
              client.segment === 'Régulier' ? 'bg-green-100 text-green-700' : 
              'bg-blue-100 text-blue-700'
            }`}>
              {client.segment}
            </Badge>
          </div>
        </div>
        <SheetTitle className="text-3xl font-serif font-bold">{client.name}</SheetTitle>
        <SheetDescription>{client.id} • Membre {client.segment}</SheetDescription>
      </SheetHeader>

      <div className="p-8 pt-4 pb-32 space-y-12">
        {/* Offrir une remise Section */}
        <section className="bg-primary/5 p-8 rounded-[40px] space-y-6 border border-primary/10">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Gift className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-bold">Offrir une remise exceptionnelle</h3>
              <p className="text-xs text-muted-foreground">Le montant sera ajouté à son portefeuille client</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-bold text-muted-foreground ml-2">Montant (FCFA)</Label>
              <Input 
                type="number" 
                placeholder="Ex: 10000" 
                className="rounded-2xl bg-white border-none shadow-sm h-12"
                value={discountAmount}
                onChange={(e) => setDiscountAmount(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-bold text-muted-foreground ml-2">Validité (Jours)</Label>
              <select 
                className="w-full h-12 rounded-2xl bg-white border-none shadow-sm px-4 text-sm outline-none"
                value={discountExpiry}
                onChange={(e) => setDiscountExpiry(e.target.value)}
              >
                <option value="7">7 jours</option>
                <option value="15">15 jours</option>
                <option value="30">30 jours</option>
                <option value="90">90 jours</option>
              </select>
            </div>
          </div>
          <Button className="w-full h-12 rounded-full font-bold shadow-lg shadow-primary/20" onClick={handleOfferDiscount}>
            Confirmer l'offre
          </Button>
        </section>

        {/* Client Stats Section */}
        <section className="grid grid-cols-3 gap-6">
          <div className="bg-muted/20 p-6 rounded-[32px] text-center space-y-2">
            <ShoppingBag className="h-4 w-4 mx-auto text-primary" />
            <p className="text-xl font-bold">{clientOrders.length}</p>
            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Achats</p>
          </div>
          <div className="bg-muted/20 p-6 rounded-[32px] text-center space-y-2">
            <TrendingUp className="h-4 w-4 mx-auto text-primary" />
            <p className="text-xl font-bold font-sans">{totalSpent.toLocaleString()}</p>
            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Valeur (F)</p>
          </div>
          <div className="bg-muted/20 p-6 rounded-[32px] text-center space-y-2">
            <div className="flex flex-col items-center gap-1">
              <p className="text-xs font-bold text-primary">{client.wallet.filter((d: any) => !d.isUsed).length}</p>
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Offres act.</p>
            </div>
          </div>
        </section>

        {/* Purchase History Section */}
        <section className="space-y-6">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground border-b pb-4">Historique des commandes</h3>
          <div className="space-y-4">
            {clientOrders.length > 0 ? clientOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-4 bg-muted/10 rounded-2xl hover:bg-muted/20 transition-colors">
                <div>
                  <p className="font-bold">Commande {order.id}</p>
                  <p className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()} • {order.items.length} articles</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">{order.total.toLocaleString()} FCFA</p>
                  <Badge variant="outline" className={`text-[8px] uppercase tracking-tighter ${order.status === 'Livrée' ? 'bg-green-50 text-green-600' : ''}`}>
                    {order.status}
                  </Badge>
                </div>
              </div>
            )) : (
              <p className="text-sm text-center text-muted-foreground py-8 italic">Aucune commande pour le moment.</p>
            )}
          </div>
        </section>
      </div>
    </SheetContent>
  );
}
