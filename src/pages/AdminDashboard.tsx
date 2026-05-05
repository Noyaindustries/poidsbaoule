import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard, Package, ShoppingBag, Users,
  Calendar, FileText, Settings, LogOut, ExternalLink,
  Bell, Percent, Activity, ShieldCheck, AlertCircle, Search, Plus, PanelLeftClose, PanelLeftOpen,
  ChevronDown, User as UserIcon, Mail, Phone, Store, ChevronRight, LogIn, Tags, MessageSquare,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useUsers } from '@/lib/UserContext';
import { useBranding } from '@/lib/BrandingContext';
import { dispatchAdminQuickAction } from '@/lib/admin-utils';
import type { User } from '@/types';

// Admin Components
import DashboardView from '@/components/admin/DashboardView';
import ProductManager from '@/components/admin/ProductManager';
import OrderManager from '@/components/admin/OrderManager';
import ClientCRM from '@/components/admin/ClientCRM';
import ReservationManager from '@/components/admin/ReservationManager';
import InvoiceList from '@/components/admin/InvoiceList';
import PromotionManager from '@/components/admin/PromotionManager';
import AdminSettingsView from '@/components/admin/AdminSettingsView';
import CategoryManager from '@/components/admin/CategoryManager';
import TestimonialManager from '@/components/admin/TestimonialManager';
import AdminPanelGate from '@/components/admin/AdminPanelGate';
import { clearAdminPanelGate, isAdminPanelGateUnlocked } from '@/lib/adminGate';

const FALLBACK_ADMIN = {
  name: 'Marie-Ange Djédji',
  email: 'atelier@poidsbaoule.ci',
  phone: '+225 …',
  initials: 'MA',
  roleLabel: 'Administrateur',
  variant: 'guest' as const,
};

function initialsFromName(name: string) {
  const p = name.trim().split(/\s+/).filter(Boolean);
  if (p.length === 0) return '?';
  if (p.length === 1) return p[0].slice(0, 2).toUpperCase();
  return (p[0][0] + p[p.length - 1][0]).toUpperCase();
}

function buildAdminProfile(currentUser: User | null) {
  if (currentUser?.role === 'admin') {
    return {
      name: currentUser.name || 'Administrateur',
      email: currentUser.email,
      phone: currentUser.phone || '',
      initials: initialsFromName(currentUser.name || 'Admin'),
      roleLabel: 'Administrateur',
      variant: 'admin' as const,
      segment: currentUser.segment,
    };
  }
  if (currentUser?.role === 'customer') {
    return {
      name: currentUser.name,
      email: currentUser.email,
      phone: currentUser.phone || '',
      initials: initialsFromName(currentUser.name),
      roleLabel: 'Espace client',
      variant: 'customer' as const,
      segment: currentUser.segment,
    };
  }
  return { ...FALLBACK_ADMIN, segment: undefined as string | undefined };
}

function readTableDensity(): 'compact' | 'comfortable' {
  try {
    const raw = localStorage.getItem('pb_admin_preferences_v1');
    if (!raw) return 'comfortable';
    const p = JSON.parse(raw) as { tableDensity?: string };
    return p.tableDensity === 'compact' ? 'compact' : 'comfortable';
  } catch {
    return 'comfortable';
  }
}

export default function AdminDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout } = useUsers();
  const { branding } = useBranding();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [tableDensity, setTableDensity] = useState<'compact' | 'comfortable'>(readTableDensity);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [adminGateUnlocked, setAdminGateUnlocked] = useState(() => isAdminPanelGateUnlocked());

  const profile = useMemo(() => buildAdminProfile(currentUser), [currentUser]);

  const headerDate = useMemo(
    () =>
      new Date().toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
    []
  );

  const handleLogout = async () => {
    try {
      clearAdminPanelGate();
      await logout();
      toast.success('Déconnexion effectuée');
      navigate('/');
    } catch {
      toast.error('Impossible de se déconnecter');
    }
  };

  useEffect(() => {
    try {
      const raw = localStorage.getItem('pb_admin_preferences_v1');
      if (!raw) return;
      const p = JSON.parse(raw) as { largeText?: boolean };
      if (p.largeText) document.documentElement.classList.add('pb-admin-large-text');
    } catch {
      /* ignore */
    }
    return () => {
      document.documentElement.classList.remove('pb-admin-large-text');
    };
  }, []);

  useEffect(() => {
    const syncDensity = () => setTableDensity(readTableDensity());
    window.addEventListener('pb-admin-prefs-update', syncDensity);
    window.addEventListener('storage', syncDensity);
    return () => {
      window.removeEventListener('pb-admin-prefs-update', syncDensity);
      window.removeEventListener('storage', syncDensity);
    };
  }, []);

  useEffect(() => {
    const requestedTab = (location.state as { tab?: string } | null)?.tab;
    if (!requestedTab) return;
    const allowedTabs = new Set([
      'dashboard',
      'products',
      'categories',
      'orders',
      'clients',
      'reservations',
      'invoices',
      'promos',
      'testimonials',
      'settings',
    ]);
    if (allowedTabs.has(requestedTab)) {
      setActiveTab(requestedTab);
    }
    navigate(location.pathname, { replace: true, state: null });
  }, [location.pathname, location.state, navigate]);

  const menuItems = [
    { id: 'dashboard', label: 'Tableau de Bord', icon: <LayoutDashboard className="h-4 w-4" /> },
    { id: 'products', label: 'Produits', icon: <Package className="h-4 w-4" /> },
    { id: 'categories', label: 'Catégories', icon: <Tags className="h-4 w-4" /> },
    { id: 'orders', label: 'Commandes', icon: <ShoppingBag className="h-4 w-4" /> },
    { id: 'clients', label: 'Clients', icon: <Users className="h-4 w-4" /> },
    { id: 'reservations', label: 'Réservations', icon: <Calendar className="h-4 w-4" /> },
    { id: 'invoices', label: 'Factures', icon: <FileText className="h-4 w-4" /> },
    { id: 'promos', label: 'Promotions', icon: <Percent className="h-4 w-4" /> },
    { id: 'testimonials', label: 'Témoignages', icon: <MessageSquare className="h-4 w-4" /> },
    { id: 'settings', label: 'Paramètres', icon: <Settings className="h-4 w-4" /> },
  ];

  const goToAdminTab = (tab: string, quickAction?: string) => {
    setActiveTab(tab);
    if (quickAction) {
      /* Laisser le temps au module cible de monter avant l’événement (ProductManager, promos, témoignages…). */
      window.setTimeout(() => {
        dispatchAdminQuickAction(quickAction);
      }, 50);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView onQuickNavigate={goToAdminTab} />;
      case 'products': return <ProductManager />;
      case 'categories': return <CategoryManager />;
      case 'orders': return <OrderManager />;
      case 'clients': return <ClientCRM />;
      case 'reservations': return <ReservationManager />;
      case 'invoices': return <InvoiceList />;
      case 'promos': return <PromotionManager />;
      case 'testimonials': return <TestimonialManager />;
      case 'settings':
        return <AdminSettingsView />;
      default:
        return <DashboardView onQuickNavigate={goToAdminTab} />;
    }
  };

  const activeMenu = menuItems.find(m => m.id === activeTab);

  if (!adminGateUnlocked) {
    return <AdminPanelGate onUnlocked={() => setAdminGateUnlocked(true)} />;
  }

  return (
    <div
      className={cn(
        'flex min-h-[100dvh] min-w-0 w-full max-w-[100vw] overflow-x-clip bg-linear-to-b from-slate-100 via-slate-100 to-slate-200/60 font-sans text-foreground',
        tableDensity === 'compact' && 'admin-density-compact'
      )}
    >
      {/* Admin Sidebar */}
      <aside className={`${isSidebarCollapsed ? 'w-24' : 'w-76'} bg-slate-950 text-slate-100 border-r border-slate-800 hidden lg:flex flex-col sticky top-0 h-screen z-20 transition-all duration-300`}>
        <div
          className={`border-b border-slate-800 ${isSidebarCollapsed ? 'flex flex-col items-center gap-2 p-3' : 'flex flex-row items-center gap-2 p-4'}`}
        >
          {isSidebarCollapsed && (
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 shrink-0 rounded-lg text-slate-400 hover:bg-slate-900 hover:text-white"
              onClick={() => setIsSidebarCollapsed((v) => !v)}
              title="Étendre le menu"
              type="button"
            >
              <PanelLeftOpen className="h-5 w-5" />
            </Button>
          )}
          <Link
            to="/"
            className={`flex min-w-0 items-center gap-3 ${isSidebarCollapsed ? 'justify-center' : 'flex-1'}`}
          >
            {branding.adminLogoUrl ? (
              <img
                src={branding.adminLogoUrl}
                alt=""
                className="h-11 w-11 shrink-0 rounded-xl bg-white object-contain p-1 shadow-sm"
              />
            ) : (
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white font-serif text-lg font-bold text-slate-900 shadow-sm">
                PB
              </div>
            )}
            {!isSidebarCollapsed && (
              <div className="min-w-0">
                <span className="font-serif font-bold text-lg block leading-none">Poids Baoulé</span>
                <span className="text-[10px] uppercase font-bold tracking-[0.22em] text-slate-400">Control Center</span>
              </div>
            )}
          </Link>
          {!isSidebarCollapsed && (
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 shrink-0 rounded-lg text-slate-400 hover:bg-slate-900 hover:text-white"
              onClick={() => setIsSidebarCollapsed((v) => !v)}
              title="Réduire le menu"
              type="button"
            >
              <PanelLeftClose className="h-5 w-5" />
            </Button>
          )}
        </div>

        <ScrollArea className="grow p-4">
          {!isSidebarCollapsed && (
            <p className="px-3 mb-2 text-[10px] uppercase tracking-[0.22em] text-slate-500 font-semibold">Navigation</p>
          )}
          <nav className="space-y-1.5">
            {menuItems.map((item) => (
              <motion.button
                type="button"
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-3'} px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeTab === item.id
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                }`}
                title={item.label}
              >
                <div className={`${activeTab === item.id ? 'text-slate-900' : 'text-slate-400'}`}>
                  {item.icon}
                </div>
                {!isSidebarCollapsed && item.label}
              </motion.button>
            ))}
          </nav>

          <Separator className="my-6 bg-slate-800" />

          <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
            {!isSidebarCollapsed && (
              <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-semibold mb-2">Raccourci</p>
            )}
            <Link
              to="/shop"
              className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-3'} px-3 py-2.5 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-800 transition-all`}
              title="Voir la Boutique"
              onClick={() => window.scrollTo(0, 0)}
            >
              <ExternalLink className="h-4 w-4 text-slate-400" />
              {!isSidebarCollapsed && 'Voir la Boutique'}
            </Link>
            <Link
              to="/#avis-clients"
              className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-3'} px-3 py-2.5 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-800 transition-all`}
              title="Section avis sur la page d’accueil"
            >
              <MessageSquare className="h-4 w-4 text-slate-400" />
              {!isSidebarCollapsed && 'Avis (page d’accueil)'}
            </Link>
            <Link
              to="/"
              className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-3'} px-3 py-2.5 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-800 transition-all`}
              title="Page d’accueil"
              onClick={() => window.scrollTo(0, 0)}
            >
              <LayoutDashboard className="h-4 w-4 text-slate-400" />
              {!isSidebarCollapsed && 'Accueil site'}
            </Link>
          </div>
        </ScrollArea>

        <div className="border-t border-slate-800 p-4">
          <div
            className={`flex items-center rounded-xl border border-slate-800 bg-slate-900 p-3 ${isSidebarCollapsed ? 'justify-center' : 'gap-3'}`}
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-800 text-sm font-bold text-slate-200">
              {profile.initials}
            </div>
            {!isSidebarCollapsed && (
              <div className="min-w-0 flex-1 overflow-hidden">
                <p className="truncate text-xs font-bold text-slate-100">{profile.name}</p>
                <p className="truncate text-[10px] font-medium text-slate-400">{profile.roleLabel}</p>
              </div>
            )}
            <Button
              variant="ghost"
              size="icon"
              className={`h-8 w-8 shrink-0 rounded-full text-red-400 hover:bg-red-500/10 hover:text-red-300 ${isSidebarCollapsed ? 'hidden' : ''}`}
              title="Se déconnecter"
              type="button"
              onClick={() => void handleLogout()}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex min-h-0 min-w-0 flex-1 grow flex-col">
        {/* Top Header */}
        <header className="sticky top-0 z-40 flex h-auto min-h-16 items-center justify-between gap-2 border-b border-slate-200 bg-white/95 px-3 py-3 backdrop-blur sm:h-20 sm:px-6 md:px-8">
          <div className="min-w-0 flex-1 pr-2">
            <h2 className="truncate text-base font-semibold capitalize text-slate-900 sm:text-lg md:text-xl">
              {activeMenu?.label}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative hidden xl:block">
              <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                className="h-9 w-64 pl-9 rounded-lg border-slate-200 bg-slate-50 text-sm"
                placeholder="Rechercher commande, client..."
              />
            </div>
            <div className="hidden xl:flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700">
              <Activity className="h-4 w-4" />
              Système opérationnel
            </div>
            <div className="hidden xl:flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700">
              <ShieldCheck className="h-4 w-4" />
              Sécurité active
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    type="button"
                    className="hidden h-9 shrink-0 gap-1.5 rounded-lg px-2.5 text-xs font-semibold shadow-sm sm:flex sm:px-3 lg:gap-2"
                    aria-label="Actions rapides : création et raccourcis"
                  >
                    <Plus className="h-4 w-4 shrink-0" />
                    <span className="hidden lg:inline">Nouvelle action</span>
                    <span className="hidden sm:inline lg:hidden">Actions</span>
                    <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-60" />
                  </Button>
                }
              />
              <DropdownMenuContent align="end" className="w-[min(calc(100vw-2rem),17.5rem)] rounded-xl border-slate-200 p-1 shadow-lg">
                <div className="px-2 py-1.5 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                  Création
                </div>
                <DropdownMenuItem
                  className="cursor-pointer gap-2 rounded-lg"
                  onClick={() => goToAdminTab('products', 'create-product')}
                >
                  <Package className="h-4 w-4 text-slate-500" />
                  Nouveau produit…
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer gap-2 rounded-lg"
                  onClick={() => goToAdminTab('promos', 'new-promo')}
                >
                  <Percent className="h-4 w-4 text-slate-500" />
                  Nouvelle promotion…
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer gap-2 rounded-lg"
                  onClick={() => goToAdminTab('testimonials', 'new-testimonial')}
                >
                  <MessageSquare className="h-4 w-4 text-slate-500" />
                  Nouveau témoignage…
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer gap-2 rounded-lg" onClick={() => goToAdminTab('categories')}>
                  <Tags className="h-4 w-4 text-slate-500" />
                  Gérer les catégories…
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-slate-100" />
                <div className="px-2 py-1.5 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                  Modules
                </div>
                <DropdownMenuItem className="cursor-pointer gap-2 rounded-lg" onClick={() => goToAdminTab('orders')}>
                  <ShoppingBag className="h-4 w-4 text-slate-500" />
                  Commandes
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer gap-2 rounded-lg" onClick={() => goToAdminTab('clients')}>
                  <Users className="h-4 w-4 text-slate-500" />
                  Clients & CRM
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer gap-2 rounded-lg" onClick={() => goToAdminTab('reservations')}>
                  <Calendar className="h-4 w-4 text-slate-500" />
                  Réservations
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer gap-2 rounded-lg" onClick={() => goToAdminTab('invoices')}>
                  <FileText className="h-4 w-4 text-slate-500" />
                  Factures
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-slate-100" />
                <DropdownMenuItem className="cursor-pointer gap-2 rounded-lg" onClick={() => goToAdminTab('dashboard')}>
                  <LayoutDashboard className="h-4 w-4 text-slate-500" />
                  Tableau de bord
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer gap-2 rounded-lg" onClick={() => goToAdminTab('settings')}>
                  <Settings className="h-4 w-4 text-slate-500" />
                  Paramètres
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-slate-100" />
                <DropdownMenuItem
                  className="cursor-pointer gap-2 rounded-lg"
                  onClick={() => {
                    navigate('/shop');
                    window.scrollTo(0, 0);
                  }}
                >
                  <Store className="h-4 w-4 text-slate-500" />
                  Voir la boutique
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <div className="relative">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-10 w-10 rounded-full relative bg-white border border-slate-200 hover:bg-slate-50"
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
                    className="absolute right-0 top-12 z-50 w-[min(20rem,calc(100vw-1.5rem))] max-w-[calc(100vw-2rem)] space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl sm:p-5"
                  >
                    <div className="flex justify-between items-center">
                      <h4 className="font-bold text-sm">Notifications</h4>
                      <Button variant="ghost" size="sm" className="text-[10px] font-bold uppercase opacity-60">Tout lire</Button>
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
            
            <Separator orientation="vertical" className="hidden h-8 sm:block" />

            <div className="flex min-w-0 items-center gap-2 pl-0 sm:pl-2">
              <div className="hidden text-right sm:block">
                <p className="max-w-[10rem] truncate text-xs font-bold capitalize text-slate-800 md:max-w-[14rem]">
                  {headerDate}
                </p>
                <p className="text-[10px] font-medium text-muted-foreground">Abidjan</p>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button
                      variant="ghost"
                      type="button"
                      className="h-auto max-w-[min(100vw-12rem,16rem)] gap-2 rounded-2xl border border-slate-200 bg-white py-1.5 pl-1.5 pr-2 shadow-sm hover:bg-slate-50 sm:max-w-xs"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-slate-800 to-slate-950 text-sm font-bold text-white">
                        {profile.initials}
                      </div>
                      <div className="hidden min-w-0 flex-1 text-left md:block">
                        <p className="truncate text-xs font-bold text-slate-900">{profile.name}</p>
                        <p className="truncate text-[10px] font-medium text-slate-500">{profile.roleLabel}</p>
                      </div>
                      <ChevronDown className="hidden h-4 w-4 shrink-0 text-slate-400 sm:block" />
                    </Button>
                  }
                />
                <DropdownMenuContent align="end" className="w-[min(calc(100vw-2rem),20rem)] rounded-2xl border-slate-200 p-0 shadow-xl">
                  <div className="border-b border-slate-100 bg-slate-50/90 p-4">
                    <div className="flex gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-slate-800 to-slate-950 text-base font-bold text-white">
                        {profile.initials}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold text-slate-900">{profile.name}</p>
                        <div className="mt-1 flex flex-wrap items-center gap-1.5">
                          <Badge
                            variant="secondary"
                            className={`rounded-full px-2 py-0 text-[10px] font-bold uppercase tracking-wide ${
                              profile.variant === 'admin'
                                ? 'border-none bg-primary/15 text-primary'
                                : profile.variant === 'customer'
                                  ? 'border-none bg-sky-100 text-sky-800'
                                  : 'border-none bg-slate-200 text-slate-700'
                            }`}
                          >
                            {profile.roleLabel}
                          </Badge>
                          {profile.segment ? (
                            <Badge variant="outline" className="rounded-full px-2 py-0 text-[10px]">
                              {profile.segment}
                            </Badge>
                          ) : null}
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                      <p className="flex items-center gap-2 truncate">
                        <Mail className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                        <span className="truncate">{profile.email}</span>
                      </p>
                      {profile.phone ? (
                        <p className="flex items-center gap-2 truncate">
                          <Phone className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                          <span className="truncate">{profile.phone}</span>
                        </p>
                      ) : null}
                    </div>
                  </div>
                  <div className="p-1.5">
                    <DropdownMenuItem
                      className="cursor-pointer gap-2 rounded-xl px-3 py-2.5"
                      onClick={() => setActiveTab('settings')}
                    >
                      <Settings className="h-4 w-4 text-slate-500" />
                      <span>Paramètres du back-office</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="cursor-pointer gap-2 rounded-xl px-3 py-2.5"
                      onClick={() => {
                        navigate('/shop');
                        window.scrollTo(0, 0);
                      }}
                    >
                      <Store className="h-4 w-4 text-slate-500" />
                      <span>Voir la boutique</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="cursor-pointer gap-2 rounded-xl px-3 py-2.5"
                      onClick={() => {
                        navigate('/account');
                        window.scrollTo(0, 0);
                      }}
                    >
                      <UserIcon className="h-4 w-4 text-slate-500" />
                      <span>Mon compte client</span>
                      <ChevronRight className="ml-auto h-4 w-4 text-slate-300" />
                    </DropdownMenuItem>
                  </div>
                  <DropdownMenuSeparator className="bg-slate-100" />
                  <div className="p-1.5">
                    {currentUser ? (
                      <DropdownMenuItem
                        className="cursor-pointer gap-2 rounded-xl px-3 py-2.5 text-destructive focus:bg-destructive/10 focus:text-destructive"
                        onClick={() => void handleLogout()}
                      >
                        <LogOut className="h-4 w-4" />
                        Se déconnecter
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem
                        className="cursor-pointer gap-2 rounded-xl px-3 py-2.5"
                        onClick={() => {
                          navigate('/account');
                          window.scrollTo(0, 0);
                        }}
                      >
                        <LogIn className="h-4 w-4 text-slate-500" />
                        Se connecter
                      </DropdownMenuItem>
                    )}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="min-w-0 grow p-4 sm:p-5 md:p-8">
          <section className="mb-8 grid grid-cols-1 xl:grid-cols-3 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="xl:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <p className="text-[10px] uppercase tracking-[0.2em] font-semibold text-slate-500 mb-2">Vue d'ensemble</p>
              <h3 className="text-2xl font-semibold leading-tight mb-2 text-slate-900">
                Centre de pilotage opérationnel
              </h3>
              <p className="text-sm text-slate-600 max-w-2xl">
                Consulte rapidement les indicateurs critiques et bascule vers chaque module de gestion.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.05 }}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <p className="text-[10px] uppercase tracking-[0.2em] font-semibold text-slate-500 mb-2">Etat du jour</p>
              <p className="text-2xl font-semibold text-slate-900">Performance stable</p>
              <p className="text-sm text-slate-600 mt-2">Toutes les briques principales sont opérationnelles.</p>
            </motion.div>
          </section>
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

function NotificationItem({ icon, title, desc, time }: { icon: ReactNode, title: string, desc: string, time: string }) {
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

