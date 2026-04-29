import { motion } from 'motion/react';
import { 
  TrendingUp, ShoppingBag, Users, AlertCircle, 
  ArrowUpRight, ArrowDownRight, Clock, CheckCircle2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useOrders } from '@/lib/OrderContext';
import { useProducts } from '@/lib/ProductContext';
import { useUsers } from '@/lib/UserContext';
import { useReservations } from '@/lib/ReservationContext';

export default function DashboardView() {
  const { orders } = useOrders();
  const { products } = useProducts();
  const { users } = useUsers();
  const { reservations } = useReservations();

  // Calculate Stats
  const totalSales = orders.reduce((sum, o) => sum + o.amountPaid, 0);
  const lowStockCount = products.filter(p => p.stock <= 5).length;
  
  const stats = [
    { label: "Ventes Totales", value: `${totalSales.toLocaleString()} FCFA`, icon: <TrendingUp className="h-4 w-4" /> },
    { label: "Commandes", value: orders.length.toString(), icon: <ShoppingBag className="h-4 w-4" /> },
    { label: "Clients", value: users.length.toString(), icon: <Users className="h-4 w-4" /> },
    { label: "Stock Faible", value: lowStockCount.toString(), icon: <AlertCircle className="h-4 w-4" /> },
  ];

  const recentOrders = orders.slice(0, 5);
  const lowStockProducts = products.filter(p => p.stock <= 5).slice(0, 3);
  const recentReservations = reservations.slice(0, 2);

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="rounded-[32px] border-none shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="h-12 w-12 rounded-2xl flex items-center justify-center bg-primary/10 text-primary">
                    {stat.icon}
                  </div>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold">{stat.label}</p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders */}
        <Card className="lg:col-span-2 rounded-[32px] border-none shadow-sm overflow-hidden">
          <CardHeader className="p-8 flex flex-row items-center justify-between">
            <CardTitle className="text-xl font-serif font-bold">Dernières Commandes</CardTitle>
            <Button variant="ghost" size="sm" className="text-[10px] uppercase tracking-widest font-bold">Voir tout</Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/50 text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground">
                  <tr>
                    <th className="px-8 py-4">ID</th>
                    <th className="px-8 py-4">Client</th>
                    <th className="px-8 py-4">Total</th>
                    <th className="px-8 py-4">Statut</th>
                    <th className="px-8 py-4">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {recentOrders.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-8 py-10 text-center text-muted-foreground">
                        Aucune commande réelle pour le moment.
                      </td>
                    </tr>
                  ) : (
                    recentOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-muted/20 transition-colors group">
                        <td className="px-8 py-6 font-bold">{order.id}</td>
                        <td className="px-8 py-6">{order.customerName}</td>
                        <td className="px-8 py-6 font-medium">{order.total.toLocaleString()} F</td>
                        <td className="px-8 py-6">
                          <Badge className={`rounded-full px-3 py-1 border-none text-[10px] ${
                            order.status === 'Livrée' ? 'bg-green-100 text-green-700' : 
                            order.status === 'En préparation' ? 'bg-blue-100 text-blue-700' : 
                            'bg-orange-100 text-orange-700'
                          }`}>
                            {order.status}
                          </Badge>
                        </td>
                        <td className="px-8 py-6 text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Inventory Alerts & Activity */}
        <div className="space-y-8">
          <Card className="rounded-[32px] border-none shadow-sm overflow-hidden">
            <CardHeader className="p-8">
              <CardTitle className="text-xl font-serif font-bold">Alertes Stock</CardTitle>
            </CardHeader>
            <CardContent className="p-8 pt-0 space-y-6">
              {lowStockProducts.length > 0 ? lowStockProducts.map((p) => (
                <div key={p.id} className="flex items-center gap-4 group">
                  <div className="h-14 w-14 rounded-2xl overflow-hidden bg-muted shrink-0 shadow-sm transition-transform group-hover:scale-105">
                    <img src={p.images[0]} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-grow min-w-0">
                    <p className="text-sm font-bold truncate">{p.name}</p>
                    <p className="text-[10px] text-destructive font-bold uppercase tracking-wider">Stock : {p.stock} unités</p>
                  </div>
                  <Button variant="outline" size="sm" className="h-9 rounded-full text-[10px] uppercase font-bold opacity-0 group-hover:opacity-100 transition-opacity">Réapp.</Button>
                </div>
              )) : (
                <p className="text-xs italic text-muted-foreground py-4">Tout est en stock.</p>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-[32px] border-none shadow-sm">
            <CardHeader className="p-8">
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl font-serif font-bold">Réservations Récentes</CardTitle>
                <div className="h-2 w-2 bg-primary rounded-full animate-pulse" />
              </div>
            </CardHeader>
            <CardContent className="p-8 pt-0 space-y-6">
              <div className="space-y-6">
                {recentReservations.length > 0 ? recentReservations.map((res) => (
                  <div key={res.id} className="flex gap-4">
                    <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
                      {res.status === 'Confirmée' ? <CheckCircle2 className="h-5 w-5 text-green-500" /> : <Clock className="h-5 w-5 text-muted-foreground" />}
                    </div>
                    <div>
                      <p className="text-sm font-bold">{res.type} - {res.customerName}</p>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mt-1">{res.status} • {new Date(res.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                )) : (
                  <p className="text-xs italic text-muted-foreground py-4">Aucune demande.</p>
                )}
              </div>
              <Separator className="opacity-50" />
              <Button className="w-full rounded-full h-12 text-xs font-bold uppercase tracking-widest">Voir toutes les demandes</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
