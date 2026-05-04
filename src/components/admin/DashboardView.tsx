import { motion } from 'motion/react';
import {
  TrendingUp,
  ShoppingBag,
  Users,
  AlertCircle,
  Clock,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
  Package,
  CalendarDays,
  Wallet,
  Target,
  Percent,
  TriangleAlert,
  CircleDot,
  Tags,
  Settings,
  FileText,
  Calendar,
  ExternalLink,
  MessageSquare,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { Link } from 'react-router-dom';
import { useOrders } from '@/lib/OrderContext';
import { useProducts } from '@/lib/ProductContext';
import { useUsers } from '@/lib/UserContext';
import { useReservations } from '@/lib/ReservationContext';
import { DashboardPremiumCharts } from '@/components/admin/dashboard/AdminPremiumCharts';

export type DashboardQuickNavigate = (tab: string, quickAction?: string) => void;

type DashboardViewProps = {
  /** Ouvre un module admin (et optionnellement une action rapide type formulaire création). */
  onQuickNavigate?: DashboardQuickNavigate;
};

export default function DashboardView({ onQuickNavigate }: DashboardViewProps) {
  const { orders } = useOrders();
  const { products } = useProducts();
  const { users } = useUsers();
  const { reservations } = useReservations();

  // Calculate Stats
  const totalSales = orders.reduce((sum, o) => sum + o.amountPaid, 0);
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const lowStockCount = products.filter(p => p.stock <= 5).length;
  const avgCart = orders.length ? totalRevenue / orders.length : 0;
  const conversionRate = users.length ? (orders.length / users.length) * 100 : 0;
  const paidOrders = orders.filter(o => o.status !== 'En attente de paiement').length;
  const paymentCompletion = orders.length ? (paidOrders / orders.length) * 100 : 0;
  const outOfStockCount = products.filter(p => p.stock <= 0).length;
  const today = new Date().toDateString();
  const ordersToday = orders.filter(o => new Date(o.createdAt).toDateString() === today).length;
  const reservationsToday = reservations.filter(r => new Date(r.createdAt).toDateString() === today).length;
  const unpaidOrders = orders.filter(o => o.status === 'En attente de paiement').length;

  const monthlyRevenueGoal = 3000000;
  const monthlyOrdersGoal = 80;
  const revenueGoalProgress = Math.min(100, (totalSales / monthlyRevenueGoal) * 100);
  const ordersGoalProgress = Math.min(100, (orders.length / monthlyOrdersGoal) * 100);

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const label = date.toLocaleDateString('fr-FR', { weekday: 'short' });
    const dayOrders = orders.filter(o => new Date(o.createdAt).toDateString() === date.toDateString());
    const amount = dayOrders.reduce((sum, o) => sum + o.amountPaid, 0);
    return { label, count: dayOrders.length, amount };
  });
  const stats = [
    {
      label: "CA encaissé",
      value: `${totalSales.toLocaleString()} FCFA`,
      icon: <Wallet className="h-4 w-4" />,
      trend: paymentCompletion >= 60 ? 'up' : 'down',
      meta: `${paymentCompletion.toFixed(0)}% des commandes payées`
    },
    {
      label: "Panier moyen",
      value: `${avgCart.toLocaleString(undefined, { maximumFractionDigits: 0 })} FCFA`,
      icon: <TrendingUp className="h-4 w-4" />,
      trend: avgCart >= 50000 ? 'up' : 'down',
      meta: `${orders.length} commande(s) traitée(s)`
    },
    {
      label: "Taux de conversion",
      value: `${conversionRate.toFixed(1)}%`,
      icon: <Target className="h-4 w-4" />,
      trend: conversionRate >= 20 ? 'up' : 'down',
      meta: `${orders.length} commandes / ${users.length} clients`
    },
    {
      label: "Stock critique",
      value: lowStockCount.toString(),
      icon: <AlertCircle className="h-4 w-4" />,
      trend: outOfStockCount > 0 ? 'down' : 'up',
      meta: `${outOfStockCount} rupture(s) totale(s)`
    },
  ];

  const recentOrders = orders.slice(0, 5);
  const lowStockProducts = products.filter(p => p.stock <= 5).slice(0, 3);
  const recentReservations = reservations.slice(0, 2);
  const timeline = [
    ...orders.slice(0, 4).map((o) => ({
      id: `order-${o.id}`,
      type: 'Commande',
      label: `${o.customerName} • ${o.total.toLocaleString()} F`,
      date: o.createdAt,
      status: o.status,
    })),
    ...reservations.slice(0, 4).map((r) => ({
      id: `reservation-${r.id}`,
      type: 'Réservation',
      label: `${r.customerName} • ${r.type}`,
      date: r.createdAt,
      status: r.status,
    })),
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 6);
  const topProducts = [...products]
    .sort((a, b) => (b.price * b.stock) - (a.price * a.stock))
    .slice(0, 4);

  const priorityAlerts = [
    ...(outOfStockCount > 0 ? [{
      id: 'out-of-stock',
      tone: 'critical',
      title: 'Ruptures de stock détectées',
      description: `${outOfStockCount} produit(s) en rupture totale.`
    }] : []),
    ...(lowStockCount > 0 ? [{
      id: 'low-stock',
      tone: 'warning',
      title: 'Stock critique à traiter',
      description: `${lowStockCount} produit(s) sous le seuil de sécurité.`
    }] : []),
    ...(unpaidOrders > 0 ? [{
      id: 'unpaid-orders',
      tone: 'warning',
      title: 'Paiements en attente',
      description: `${unpaidOrders} commande(s) en attente de paiement.`
    }] : []),
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="xl:col-span-2">
        <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="h-1 w-full bg-linear-to-r from-emerald-500 via-primary to-indigo-500" />
          <CardHeader className="p-5 pb-3 border-b border-slate-100">
            <CardTitle className="text-lg font-semibold text-slate-900">Objectifs mensuels</CardTitle>
          </CardHeader>
          <CardContent className="p-5 grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <p className="font-medium text-slate-700">Objectif CA encaissé</p>
                <p className="text-slate-500">{totalSales.toLocaleString()} / {monthlyRevenueGoal.toLocaleString()} F</p>
              </div>
              <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                <motion.div
                  className="h-full bg-emerald-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${revenueGoalProgress}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                />
              </div>
              <p className="text-xs text-slate-500">{revenueGoalProgress.toFixed(1)}% atteint</p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <p className="font-medium text-slate-700">Objectif commandes</p>
                <p className="text-slate-500">{orders.length} / {monthlyOrdersGoal}</p>
              </div>
              <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                <motion.div
                  className="h-full bg-primary rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${ordersGoalProgress}%` }}
                  transition={{ duration: 0.8, delay: 0.1, ease: 'easeOut' }}
                />
              </div>
              <p className="text-xs text-slate-500">{ordersGoalProgress.toFixed(1)}% atteint</p>
            </div>
          </CardContent>
        </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.05 }}>
        <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <CardHeader className="p-5 pb-3 border-b border-slate-100">
            <CardTitle className="text-lg font-semibold text-slate-900">Alertes prioritaires</CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-3">
            {priorityAlerts.length === 0 ? (
              <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-sm text-emerald-700">
                Aucun signal critique détecté.
              </div>
            ) : (
              priorityAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`rounded-lg border p-3 ${
                    alert.tone === 'critical'
                      ? 'bg-red-50 border-red-200 text-red-700'
                      : 'bg-amber-50 border-amber-200 text-amber-700'
                  }`}
                >
                  <div className="flex items-center gap-2 font-semibold text-sm mb-1">
                    <TriangleAlert className="h-4 w-4" />
                    {alert.title}
                  </div>
                  <p className="text-xs">{alert.description}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.1 }} className="xl:col-span-3">
        <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <CardContent className="p-5 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="rounded-xl bg-slate-50 border border-slate-200 p-4">
              <p className="text-xs text-slate-500 mb-1">Commandes du jour</p>
              <p className="text-2xl font-semibold text-slate-900">{ordersToday}</p>
            </div>
            <div className="rounded-xl bg-slate-50 border border-slate-200 p-4">
              <p className="text-xs text-slate-500 mb-1">Réservations du jour</p>
              <p className="text-2xl font-semibold text-slate-900">{reservationsToday}</p>
            </div>
            <div className="rounded-xl bg-slate-50 border border-slate-200 p-4">
              <p className="text-xs text-slate-500 mb-1">Produits en ligne</p>
              <p className="text-2xl font-semibold text-slate-900">{products.length}</p>
            </div>
            <div className="rounded-xl bg-slate-50 border border-slate-200 p-4">
              <p className="text-xs text-slate-500 mb-1">CA total commandé</p>
              <p className="text-2xl font-semibold text-slate-900">{totalRevenue.toLocaleString()} F</p>
            </div>
          </CardContent>
        </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.15 }}>
        <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <CardHeader className="p-5 pb-3">
            <CardTitle className="text-sm font-semibold text-slate-900">Actions rapides</CardTitle>
          </CardHeader>
          <CardContent className="max-h-[min(70vh,22rem)] space-y-1.5 overflow-y-auto p-5 pt-0 pr-2">
            <Button
              type="button"
              className="h-9 w-full justify-start rounded-lg text-xs font-medium"
              onClick={() => onQuickNavigate?.('products', 'create-product')}
            >
              <Package className="mr-2 h-4 w-4 shrink-0" />
              Nouveau produit…
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-9 w-full justify-start rounded-lg text-xs font-medium"
              onClick={() => onQuickNavigate?.('categories')}
            >
              <Tags className="mr-2 h-4 w-4 shrink-0" />
              Catégories & visuels
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-9 w-full justify-start rounded-lg text-xs font-medium"
              onClick={() => onQuickNavigate?.('promos', 'new-promo')}
            >
              <Percent className="mr-2 h-4 w-4 shrink-0" />
              Nouvelle promotion…
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-9 w-full justify-start rounded-lg text-xs font-medium"
              onClick={() => onQuickNavigate?.('orders')}
            >
              <ShoppingBag className="mr-2 h-4 w-4 shrink-0" />
              Commandes
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-9 w-full justify-start rounded-lg text-xs font-medium"
              onClick={() => onQuickNavigate?.('clients')}
            >
              <Users className="mr-2 h-4 w-4 shrink-0" />
              Clients & CRM
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-9 w-full justify-start rounded-lg text-xs font-medium"
              onClick={() => onQuickNavigate?.('reservations')}
            >
              <Calendar className="mr-2 h-4 w-4 shrink-0" />
              Réservations
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-9 w-full justify-start rounded-lg text-xs font-medium"
              onClick={() => onQuickNavigate?.('invoices')}
            >
              <FileText className="mr-2 h-4 w-4 shrink-0" />
              Factures
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-9 w-full justify-start rounded-lg text-xs font-medium"
              onClick={() => onQuickNavigate?.('testimonials', 'new-testimonial')}
            >
              <MessageSquare className="mr-2 h-4 w-4 shrink-0" />
              Témoignages page d’accueil…
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-9 w-full justify-start rounded-lg text-xs font-medium"
              onClick={() => onQuickNavigate?.('settings')}
            >
              <Settings className="mr-2 h-4 w-4 shrink-0" />
              Paramètres & logos
            </Button>
            <Separator className="my-2" />
            <Link
              to="/shop"
              className={cn(
                buttonVariants({ variant: 'ghost', size: 'default' }),
                'h-9 w-full justify-start rounded-lg text-xs font-medium no-underline hover:no-underline'
              )}
            >
              <ExternalLink className="mr-2 h-4 w-4 shrink-0" />
              Voir la boutique
            </Link>
          </CardContent>
        </Card>
        </motion.div>
      </div>

      <DashboardPremiumCharts last7Days={last7Days} products={products} />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ y: -4 }}
          >
            <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-lg transition-shadow">
              <CardContent className="p-5 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="h-10 w-10 rounded-xl flex items-center justify-center bg-slate-100 text-slate-700">
                    {stat.icon}
                  </div>
                </div>
                <div>
                  <p className="text-[11px] text-slate-500 font-medium">{stat.label}</p>
                  <p className="text-2xl font-semibold mt-1 text-slate-900">{stat.value}</p>
                  <div className="mt-2 flex items-center gap-1 text-xs">
                    {stat.trend === 'up' ? (
                      <ArrowUpRight className="h-3.5 w-3.5 text-emerald-600" />
                    ) : (
                      <ArrowDownRight className="h-3.5 w-3.5 text-red-600" />
                    )}
                    <span className={stat.trend === 'up' ? 'text-emerald-600 font-medium' : 'text-red-600 font-medium'}>
                      {stat.meta}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Recent Orders */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.3 }} className="lg:col-span-2">
        <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <CardHeader className="p-5 flex flex-row items-center justify-between border-b border-slate-100">
            <CardTitle className="text-lg font-semibold text-slate-900">Dernières commandes</CardTitle>
            <Button variant="ghost" size="sm" className="text-xs font-medium text-slate-600">Voir tout</Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-[11px] font-semibold text-slate-500">
                  <tr>
                    <th className="px-5 py-3">ID</th>
                    <th className="px-5 py-3">Client</th>
                    <th className="px-5 py-3">Total</th>
                    <th className="px-5 py-3">Statut</th>
                    <th className="px-5 py-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentOrders.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-10 text-center text-slate-500">
                        Aucune commande réelle pour le moment.
                      </td>
                    </tr>
                  ) : (
                    recentOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-5 py-4 font-semibold text-slate-900">{order.id}</td>
                        <td className="px-5 py-4 text-slate-700">{order.customerName}</td>
                        <td className="px-5 py-4 font-medium text-slate-900">{order.total.toLocaleString()} F</td>
                        <td className="px-5 py-4">
                          <Badge className={`rounded-full px-2.5 py-1 border-none text-[10px] ${
                            order.status === 'Livrée' ? 'bg-green-100 text-green-700' : 
                            order.status === 'En préparation' ? 'bg-blue-100 text-blue-700' : 
                            'bg-orange-100 text-orange-700'
                          }`}>
                            {order.status}
                          </Badge>
                        </td>
                        <td className="px-5 py-4 text-slate-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
        </motion.div>

        {/* Inventory Alerts & Activity */}
        <div className="space-y-8">
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.35 }}>
          <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <CardHeader className="p-5 border-b border-slate-100">
              <CardTitle className="text-lg font-semibold text-slate-900">Alertes stock</CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              {lowStockProducts.length > 0 ? lowStockProducts.map((p) => (
                <div key={p.id} className="flex items-center gap-3 group">
                  <div className="h-12 w-12 rounded-xl overflow-hidden bg-muted shrink-0 border border-slate-200">
                    <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="grow min-w-0">
                    <p className="text-sm font-semibold truncate text-slate-900">{p.name}</p>
                    <p className="text-xs text-red-600 font-medium">Stock : {p.stock} unités</p>
                  </div>
                  <Button variant="outline" size="sm" className="h-8 rounded-lg text-xs font-medium">Réapp.</Button>
                </div>
              )) : (
                <p className="text-xs text-slate-500 py-2">Tout est en stock.</p>
              )}
            </CardContent>
          </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.4 }}>
          <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <CardHeader className="p-5 border-b border-slate-100">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg font-semibold text-slate-900">Réservations récentes</CardTitle>
                <div className="h-2 w-2 bg-primary rounded-full animate-pulse" />
              </div>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div className="space-y-4">
                {recentReservations.length > 0 ? recentReservations.map((res) => (
                  <div key={res.id} className="flex gap-3">
                    <div className="h-9 w-9 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                      {res.status === 'Confirmée' ? <CheckCircle2 className="h-5 w-5 text-green-500" /> : <Clock className="h-5 w-5 text-muted-foreground" />}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{res.type} - {res.customerName}</p>
                      <p className="text-xs text-slate-500 mt-1">{res.status} • {new Date(res.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                )) : (
                  <p className="text-xs text-slate-500 py-2">Aucune demande.</p>
                )}
              </div>
              <Separator />
              <Button className="w-full rounded-lg h-10 text-xs font-medium">Voir toutes les demandes</Button>
            </CardContent>
          </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.45 }}>
          <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <CardHeader className="p-5 border-b border-slate-100">
              <CardTitle className="text-lg font-semibold text-slate-900">Top produits à forte valeur</CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-3">
              {topProducts.length === 0 ? (
                <p className="text-xs text-slate-500">Aucun produit disponible.</p>
              ) : (
                topProducts.map((product) => (
                  <div key={product.id} className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">{product.name}</p>
                      <p className="text-xs text-slate-500">{product.stock} en stock</p>
                    </div>
                    <Badge className="bg-slate-100 text-slate-700 border-none">
                      {(product.price * product.stock).toLocaleString()} F
                    </Badge>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
          </motion.div>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.5 }}>
      <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <CardHeader className="p-5 border-b border-slate-100">
          <CardTitle className="text-lg font-semibold text-slate-900">Activité récente</CardTitle>
        </CardHeader>
        <CardContent className="p-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/50">
              <div className="flex items-center gap-2 text-slate-700 mb-2">
                <ShoppingBag className="h-4 w-4" />
                <p className="text-xs font-semibold">Commandes</p>
              </div>
              <p className="text-sm text-slate-600">{orders.length} commandes enregistrées au total.</p>
            </div>
            <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/50">
              <div className="flex items-center gap-2 text-slate-700 mb-2">
                <CalendarDays className="h-4 w-4" />
                <p className="text-xs font-semibold">Réservations</p>
              </div>
              <p className="text-sm text-slate-600">{reservations.length} demandes de réservation suivies.</p>
            </div>
            <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/50">
              <div className="flex items-center gap-2 text-slate-700 mb-2">
                <Users className="h-4 w-4" />
                <p className="text-xs font-semibold">Clients</p>
              </div>
              <p className="text-sm text-slate-600">{users.length} profils clients actifs dans la base.</p>
            </div>
          </div>
        </CardContent>
      </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.55 }}>
        <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <CardHeader className="p-5 border-b border-slate-100">
            <CardTitle className="text-lg font-semibold text-slate-900">Timeline activité</CardTitle>
          </CardHeader>
          <CardContent className="p-5">
            {timeline.length === 0 ? (
              <p className="text-sm text-slate-500">Aucune activité récente à afficher.</p>
            ) : (
              <div className="space-y-3">
                {timeline.map((item, idx) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.04 }}
                    className="rounded-lg border border-slate-200 p-3 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <CircleDot className="h-3.5 w-3.5 text-primary" />
                          <p className="text-xs font-semibold text-slate-700 uppercase tracking-wide">{item.type}</p>
                        </div>
                        <p className="text-sm font-medium text-slate-900 truncate">{item.label}</p>
                        <p className="text-xs text-slate-500 mt-1">
                          {new Date(item.date).toLocaleString('fr-FR')}
                        </p>
                      </div>
                      <Badge className="bg-slate-100 text-slate-700 border-none text-[10px]">
                        {item.status}
                      </Badge>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
