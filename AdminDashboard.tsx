import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, Package, ShoppingBag, Users, 
  Calendar, FileText, Settings, TrendingUp, 
  Plus, Search, Filter, Download, MoreVertical,
  AlertCircle, CheckCircle2, Clock, Truck, 
  LogOut, ExternalLink, Bell, Percent
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

// Admin Components
import DashboardView from '@/components/admin/DashboardView';
import ProductManager from '@/components/admin/ProductManager';
import OrderManager from '@/components/admin/OrderManager';
import ClientCRM from '@/components/admin/ClientCRM';
import ReservationManager from '@/components/admin/ReservationManager';
import InvoiceList from '@/components/admin/InvoiceList';
import PromotionManager from '@/components/admin/PromotionManager';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Tableau de Bord', icon: <LayoutDashboard className="h-4 w-4" /> },
    { id: 'products', label: 'Produits', icon: <Package className="h-4 w-4" /> },
    { id: 'orders', label: 'Commandes', icon: <ShoppingBag className="h-4 w-4" /> },
    { id: 'clients', label: 'Clients', icon: <Users className="h-4 w-4" /> },
    { id: 'reservations', label: 'Réservations', icon: <Calendar className="h-4 w-4" /> },
    { id: 'invoices', label: 'Factures', icon: <FileText className="h-4 w-4" /> },
    { id: 'promos', label: 'Promotions', icon: <Percent className="h-4 w-4" /> },
    { id: 'settings', label: 'Paramètres', icon: <Settings className="h-4 w-4" /> },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <DashboardView />;
      case 'products': return <ProductManager />;
      case 'orders': return <OrderManager />;
      case 'clients': return <ClientCRM />;
      case 'reservations': return <ReservationManager />;
      case 'invoices': return <InvoiceList />;
      case 'promos': return <PromotionManager />;
      case 'settings': return (
        <div className="space-y-8">
          <div className="rounded-[40px] bg-card border p-10">
            <h3 className="text-2xl font-serif font-bold mb-4">Paramètres du Back-Office</h3>
            <p className="text-muted-foreground leading-relaxed">
              Gérer les préférences d'administration, les utilisateurs du back-office et les accès au tableau de bord.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
              {[
                { label: 'Notifications', value: 'Activées' },
                { label: 'Mise à jour automatique', value: 'Désactivée' },
                { label: 'Langue', value: 'Français' },
                { label: 'Fuseau horaire', value: 'GMT+0' }
              ].map((item) => (
                <div key={item.label} className="rounded-3xl p-6 bg-muted/50">
                  <p className="text-sm text-muted-foreground uppercase tracking-[0.25em] font-bold mb-2">{item.label}</p>
                  <p className="font-bold">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
          <Button className="rounded-full px-8">Mettre à jour les paramètres</Button>
        </div>
      );
      default: return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] flex font-sans">
      {/* Admin Sidebar */}
      <aside className="w-72 bg-white border-r hidden lg:flex flex-col sticky top-0 h-screen shadow-2xl shadow-terracotta-100/20 z-10">
        <div className="p-8 border-b">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="h-10 w-10 bg-primary rounded-2xl flex items-center justify-center text-white font-serif font-bold shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">PB</div>
            <div>
              <span className="font-serif font-bold text-xl block leading-none">Poids Baoulé</span>
              <span className="text-[10px] uppercase font-bold tracking-[0.3em] opacity-40">Back-Office</span>
            </div>
          </Link>
        </div>
        
        <ScrollArea className="flex-grow p-6">
          <nav className="space-y-2">
            {menuItems.map((item) => (
              <button
                type="button"
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-sm font-bold transition-all duration-300 ${activeTab === item.id ? 'bg-primary text-white shadow-xl shadow-primary/20 translate-x-1' : 'hover:bg-muted text-muted-foreground hover:text-foreground'}`}
              >
                <div className={`${activeTab === item.id ? 'text-white' : 'text-primary/40'}`}>
                  {item.icon}
                </div>
                {item.label}
              </button>
            ))}
          </nav>

          <Separator className="my-8 opacity-50" />
          
          <div className="space-y-2">
            <Link to="/shop" className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-sm font-bold text-muted-foreground hover:bg-muted hover:text-foreground transition-all">
              <ExternalLink className="h-4 w-4 text-primary/40" />
              Voir la Boutique
            </Link>
          </div>
        </ScrollArea>

        <div className="p-6 border-t bg-muted/10">
          <div className="flex items-center gap-4 p-3 rounded-2xl bg-white border shadow-sm">
            <div className="h-10 w-10 rounded-xl bg-accent flex items-center justify-center text-accent-foreground font-bold text-sm shadow-inner">MA</div>
            <div className="flex-grow overflow-hidden">
              <p className="text-xs font-bold truncate">Marie-Ange Djédji</p>
              <p className="text-[10px] text-muted-foreground font-medium">Administrateur</p>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-destructive hover:bg-destructive/10" onClick={() => toast.info("Déconnexion...")}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-grow flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="h-24 bg-white/80 backdrop-blur-md border-b sticky top-0 z-40 px-8 flex items-center justify-between">
          <div className="flex flex-col">
            <h2 className="text-xl font-serif font-bold text-foreground capitalize">
              {menuItems.find(m => m.id === activeTab)?.label}
            </h2>
            <div className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
              <span className="opacity-50">Back-Office</span>
              <span className="opacity-20">•</span>
              <span>{activeTab}</span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-12 w-12 rounded-full relative"
                onClick={() => setNotificationsOpen(!notificationsOpen)}
              >
                <Bell className="h-5 w-5" />
                <span className="absolute top-3 right-3 h-2 w-2 bg-destructive rounded-full border-2 border-white animate-pulse" />
              </Button>
              <AnimatePresence>
                {notificationsOpen && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 10 }}
                    className="absolute right-0 top-14 w-80 bg-white rounded-[32px] shadow-2xl border p-6 z-50 space-y-4"
                  >
                    <div className="flex justify-between items-center">
                      <h4 className="font-bold text-sm">Notifications</h4>
                      <Button variant="ghost" size="sm" className="text-[10px] uppercase font-bold opa-60">Tout lire</Button>
                    </div>
                    <Separator />
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      <NotificationItem 
                        icon={<ShoppingBag className="h-4 w-4 text-primary" />} 
                        title="Nouvelle Commande" 
                        desc="PBH-2026-004 de Awa Diop" 
                        time="Il y a 5 min"
                      />
                      <NotificationItem 
                        icon={<AlertCircle className="h-4 w-4 text-destructive" />} 
                        title="Stock Critique" 
                        desc="Miroir Contrast classique" 
                        time="Il y a 2h"
                      />
                      <NotificationItem 
                        icon={<Calendar className="h-4 w-4 text-blue-500" />} 
                        title="Nouvelle Réservation" 
                        desc="Consultation de Marie K." 
                        time="Hier"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <Separator orientation="vertical" className="h-8" />
            
            <div className="flex items-center gap-4 pl-2">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold">15 Avril 2026</p>
                <p className="text-[10px] text-muted-foreground font-medium">Abidjan, 28°C</p>
              </div>
              <div className="h-12 w-12 rounded-full border-2 border-primary/20 p-1">
                <div className="h-full w-full rounded-full bg-accent flex items-center justify-center font-bold text-xs">MA</div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-grow p-8 md:p-12">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            {renderContent()}
          </motion.div>
        </main>
      </div>
    </div>
  );
}

function NotificationItem({ icon, title, desc, time }: { icon: any, title: string, desc: string, time: string }) {
  return (
    <div className="flex gap-4 p-2 rounded-2xl hover:bg-muted/50 transition-colors cursor-pointer group">
      <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center shrink-0 group-hover:bg-white border-none transition-colors">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-bold truncate">{title}</p>
        <p className="text-[10px] text-muted-foreground truncate">{desc}</p>
        <p className="text-[8px] uppercase font-bold tracking-widest mt-1 opacity-40">{time}</p>
      </div>
    </div>
  );
}

