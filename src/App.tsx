import { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Menu, Search, ChevronDown, MessageCircle, Phone, Mail, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Toaster } from '@/components/ui/sonner';
import SearchModal from '@/components/SearchModal';
import PrivilegeModal from '@/components/PrivilegeModal';
import { CartProvider, useCart } from '@/lib/CartContext';
import { ProductProvider } from '@/lib/ProductContext';
import { OrderProvider } from '@/lib/OrderContext';
import { UserProvider } from '@/lib/UserContext';
import { ReservationProvider } from '@/lib/ReservationContext';
import { BrandingProvider, useBranding } from '@/lib/BrandingContext';
import { CategoryProvider } from '@/lib/CategoryContext';
import { TestimonialProvider } from '@/lib/TestimonialContext';
import { cn } from '@/lib/utils';
import { WHATSAPP_STORE_CHAT_URL, WHATSAPP_STORE_DISPLAY, WHATSAPP_STORE_PHONE_E164 } from '@/constants';

const Home = lazy(() => import('./pages/Home'));
const Shop = lazy(() => import('./pages/Shop'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const CustomOrder = lazy(() => import('./pages/CustomOrder'));
const Services = lazy(() => import('./pages/Services'));
const Story = lazy(() => import('./pages/Story'));
const Cart = lazy(() => import('./pages/Cart'));
const Checkout = lazy(() => import('./pages/Checkout'));
const Account = lazy(() => import('./pages/Account'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const InfoPage = lazy(() => import('./pages/InfoPage'));

const MOBILE_NAV_GROUPS = [
  {
    title: 'Découvrir',
    links: [
      { name: 'Accueil', path: '/' },
      { name: 'Boutique', path: '/shop' },
      { name: 'Notre histoire', path: '/story' },
    ],
  },
  {
    title: 'Services',
    links: [
      { name: 'Sur mesure', path: '/custom' },
      { name: 'Prestations déco', path: '/services' },
    ],
  },
  {
    title: 'Communauté',
    links: [{ name: 'Avis clients', path: '/#avis-clients' }],
  },
] as const;

const DESKTOP_TAIL_LINKS = [
  { name: 'Notre histoire', path: '/story' },
  { name: 'Avis clients', path: '/#avis-clients' },
] as const;

const DESKTOP_SERVICE_LINKS = [
  {
    name: 'Sur mesure',
    path: '/custom',
    description: 'Pièce unique, dimensions, finitions — devis et suivi sur projet.',
  },
  {
    name: 'Prestations déco',
    path: '/services',
    description: 'Consultation, coaching déco et réservation de prestations à Abidjan.',
  },
] as const;

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { totalItems } = useCart();
  const { resolvedHomeLogo } = useBranding();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isServicesMenuOpen, setIsServicesMenuOpen] = useState(false);
  const servicesMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isHome = location.pathname === '/';
  const isHeroNav = isHome && !isScrolled;
  const isServicesRoute = location.pathname === '/custom' || location.pathname === '/services';
  const logoHeightClass = isHeroNav
    ? 'h-[80px] md:h-[150px]'
    : isHome
      ? 'h-[60px] md:h-[120px]'
      : 'h-[48px] md:h-[56px]';
  const linkTextClass = (path: string) => {
    if (path === '/#avis-clients') {
      if (isHome && !isScrolled) return 'text-white';
      if (isHome && isScrolled) return 'text-primary';
      return 'text-foreground/70';
    }
    if (isHome && !isScrolled) return 'text-white';
    if (isHome && isScrolled) return 'text-primary';
    return location.pathname === path ? 'text-primary' : 'text-foreground/70';
  };

  const handleNavLinkClick = (path: string) => (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (path === '/#avis-clients' && location.pathname === '/') {
      e.preventDefault();
      window.history.replaceState(null, '', '#avis-clients');
      document.getElementById('avis-clients')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setIsMobileMenuOpen(false);
      return;
    }
    if (path !== '/#avis-clients') {
      window.scrollTo(0, 0);
    }
    setIsMobileMenuOpen(false);
    setIsServicesMenuOpen(false);
  };

  useEffect(() => {
    setIsServicesMenuOpen(false);
  }, [location.pathname, location.hash]);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!servicesMenuRef.current) return;
      if (servicesMenuRef.current.contains(event.target as Node)) return;
      setIsServicesMenuOpen(false);
    };
    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, []);

  const baseNavLink = 'shrink-0 text-sm font-medium uppercase tracking-widest transition-colors hover:text-primary';

  const servicesTriggerClass = cn(
    baseNavLink,
    'inline-flex items-center gap-0.5 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-primary/30',
    isHeroNav &&
      (isServicesRoute
        ? 'text-white underline decoration-white/45 underline-offset-[6px]'
        : 'text-white'),
    isHome && isScrolled && 'text-primary',
    !isHome && (isServicesRoute ? 'text-primary' : 'text-foreground/70')
  );

  const iconColorClass = isHome && !isScrolled ? 'text-white' : 'text-foreground/70';

  /** Recherche + compte : survol / focus orange */
  const searchAccountIconBtnClass = cn(
    'transition-colors hover:!text-[#FF6600] focus-visible:!text-[#FF6600]',
    isHome && !isScrolled ? 'text-white' : 'text-foreground/70'
  );

  return (
    <nav
      id="navigation-principale"
      className={
        isHeroNav
          ? 'fixed left-0 right-0 top-0 z-50 w-full max-w-[100vw] bg-transparent pt-[max(1rem,env(safe-area-inset-top))] pb-2 transition-all duration-300 sm:pt-[max(1.25rem,env(safe-area-inset-top))] md:pb-3'
          : 'fixed left-0 right-0 top-0 z-50 w-full max-w-[100vw] border-b bg-background/80 pt-[max(0.375rem,env(safe-area-inset-top))] pb-1.5 backdrop-blur-md transition-all duration-300 md:pb-2'
      }
    >
      <div className="container mx-auto grid min-w-0 max-w-full grid-cols-[auto_1fr_auto] items-center gap-2 pl-[max(0.25rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] sm:gap-3 sm:pl-2 sm:pr-5 md:pl-3 md:pr-6 lg:flex lg:items-center lg:gap-6">
        <div className="flex min-w-0 shrink-0 items-center gap-1 sm:gap-1.5">
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger render={<Button variant="ghost" size="icon" className="lg:hidden"><Menu className={`h-6 w-6 ${iconColorClass}`} /></Button>} />
            <SheetContent side="left" className="w-[300px] sm:w-[400px]">
              <div className="mt-6 pr-1">
                <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-muted-foreground">Menu</p>
                <div className="mt-6 space-y-8 pb-8">
                  {MOBILE_NAV_GROUPS.map((group) => (
                    <div key={group.title}>
                      <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.28em] text-primary/80">
                        {group.title}
                      </p>
                      <ul className="space-y-1">
                        {group.links.map((link) => (
                          <li key={link.path}>
                            <Link
                              to={link.path}
                              onClick={handleNavLinkClick(link.path)}
                              className="block rounded-lg py-2.5 pl-1 text-lg font-serif text-foreground transition-colors hover:bg-muted/60 hover:text-primary"
                            >
                              {link.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </SheetContent>
          </Sheet>

          <Button
            variant="ghost"
            size="icon"
            className={cn('lg:hidden', searchAccountIconBtnClass)}
            onClick={() => setIsSearchOpen(true)}
          >
            <Search className="h-5 w-5" />
          </Button>
        </div>

        <Link
          to="/"
          className="group flex min-w-0 shrink-0 items-center justify-self-center lg:-ml-1 lg:justify-self-auto"
          onClick={() => window.scrollTo(0, 0)}
        >
          <img
            src={resolvedHomeLogo}
            alt="Poids Baoulé Logo"
            className={`${logoHeightClass} w-auto max-w-[min(100%,52vw)] object-contain transition-all duration-500 sm:max-w-none ${
              isHeroNav ? 'drop-shadow-[0_0_20px_rgba(255,255,255,0.4)]' : ''
            } group-hover:scale-105`}
          />
        </Link>

        <nav
          className="hidden min-w-0 flex-1 items-center justify-center gap-4 lg:flex xl:gap-5"
          aria-label="Navigation principale"
        >
          <Link
            to="/shop"
            onClick={handleNavLinkClick('/shop')}
            className={cn(baseNavLink, linkTextClass('/shop'))}
          >
            Boutique
          </Link>

          <div
            ref={servicesMenuRef}
            className="relative z-50"
            onMouseEnter={() => setIsServicesMenuOpen(true)}
            onMouseLeave={() => setIsServicesMenuOpen(false)}
          >
            <button
              type="button"
              className={cn(servicesTriggerClass)}
              aria-haspopup="menu"
              onClick={() => setIsServicesMenuOpen((prev) => !prev)}
            >
              Services
              <ChevronDown
                className={cn(
                  'h-3.5 w-3.5 opacity-70 transition-transform duration-200',
                  isServicesMenuOpen && 'rotate-180'
                )}
                aria-hidden
              />
            </button>
            {isServicesMenuOpen && (
              <div className="absolute left-1/2 top-full z-50 mt-0 w-[min(19rem,calc(100vw-2rem))] -translate-x-1/2 rounded-xl border border-border/80 bg-popover/95 p-2 shadow-xl backdrop-blur-md supports-[backdrop-filter]:bg-popover/90">
                <p className="px-2 pb-1.5 text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Nos services</p>
                <div className="space-y-0.5">
                  {DESKTOP_SERVICE_LINKS.map((item) => (
                    <button
                      key={item.path}
                      type="button"
                      onClick={() => {
                        setIsServicesMenuOpen(false);
                        window.scrollTo(0, 0);
                        navigate(item.path);
                      }}
                      className="block w-full cursor-pointer rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-primary/10 focus:bg-primary/10 focus:outline-none"
                    >
                      <span className="block text-sm font-semibold text-foreground">{item.name}</span>
                      <span className="mt-0.5 block text-xs leading-snug text-muted-foreground">{item.description}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {DESKTOP_TAIL_LINKS.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={handleNavLinkClick(link.path)}
              className={cn(baseNavLink, linkTextClass(link.path))}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center justify-self-end gap-2 sm:gap-4 lg:ml-auto">
          <Button
            variant="ghost"
            size="icon"
            className={cn('hidden sm:flex', searchAccountIconBtnClass)}
            onClick={() => setIsSearchOpen(true)}
          >
            <Search className="h-5 w-5" />
          </Button>
          <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
          <Link to="/account" onClick={() => window.scrollTo(0, 0)}>
            <Button variant="ghost" size="icon" className={searchAccountIconBtnClass}>
              <User className="h-5 w-5" />
            </Button>
          </Link>
          <Link to="/cart" onClick={() => window.scrollTo(0, 0)}>
            <Button
              variant="ghost"
              size="icon"
              className={`relative rounded-full border-2 transition-colors ${
                isHeroNav
                  ? 'border-white/40 bg-white/5 hover:bg-white/15'
                  : 'border-foreground/20 bg-background/50 hover:bg-muted/60'
              }`}
            >
              <ShoppingCart className={`h-5 w-5 ${iconColorClass}`} />
              {totalItems > 0 && (
                <Badge className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center p-0 text-[10px] bg-primary text-primary-foreground">
                  {totalItems}
                </Badge>
              )}
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
};

import { PromoProvider } from '@/lib/PromoContext';
const Footer = () => {
  const { resolvedHomeLogo } = useBranding();
  const location = useLocation();

  const goAvisClients = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (location.pathname === '/') {
      e.preventDefault();
      window.history.replaceState(null, '', '#avis-clients');
      document.getElementById('avis-clients')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <footer className="bg-muted pt-12 pb-[max(2rem,env(safe-area-inset-bottom))] sm:pt-16 sm:pb-8">
      <div className="container mx-auto max-w-full px-3 sm:px-4 md:px-6">
        <div className="grid grid-cols-1 gap-10 sm:gap-12 md:grid-cols-2 lg:grid-cols-4 mb-10 sm:mb-12">
          <div className="flex flex-col items-center space-y-4 text-center sm:items-start sm:text-left">
            <Link to="/" className="mb-6 block max-w-full" onClick={() => window.scrollTo(0, 0)}>
              <img
                src={resolvedHomeLogo}
                alt="Poids Baoulé Logo"
                className="mx-auto h-[88px] w-auto max-w-full object-contain drop-shadow-lg sm:mx-0 sm:h-[120px] md:h-[180px]"
              />
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Allier tradition africaine et design contemporain. Chaque pièce est une œuvre originale, sculptée à la main pour célébrer l'élégance de l'imperfection.
            </p>
            <div className="flex gap-4">
              <a
                href={WHATSAPP_STORE_CHAT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors"
                aria-label="Écrire sur WhatsApp"
              >
                <MessageCircle className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-bold mb-6 uppercase tracking-widest text-sm">Navigation</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <Link to="/" onClick={() => window.scrollTo(0, 0)} className="hover:text-primary transition-colors">
                  Accueil
                </Link>
              </li>
              <li>
                <Link to="/shop" onClick={() => window.scrollTo(0, 0)} className="hover:text-primary transition-colors">
                  Boutique
                </Link>
              </li>
              <li>
                <Link to="/story" onClick={() => window.scrollTo(0, 0)} className="hover:text-primary transition-colors">
                  Notre histoire
                </Link>
              </li>
              <li>
                <Link to="/custom" onClick={() => window.scrollTo(0, 0)} className="hover:text-primary transition-colors">
                  Sur mesure
                </Link>
              </li>
              <li>
                <Link to="/services" onClick={() => window.scrollTo(0, 0)} className="hover:text-primary transition-colors">
                  Prestations déco
                </Link>
              </li>
              <li>
                <Link to="/#avis-clients" onClick={goAvisClients} className="hover:text-primary transition-colors">
                  Avis clients
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-6 uppercase tracking-widest text-sm">Aide & Infos</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link to="/faq" className="hover:text-primary transition-colors">FAQ</Link></li>
              <li><Link to="/shipping" className="hover:text-primary transition-colors">Livraison & Retours</Link></li>
              <li><Link to="/terms" className="hover:text-primary transition-colors">CGV / Mentions légales</Link></li>
              <li><Link to="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-6 uppercase tracking-widest text-sm">Contact</h4>
            <ul className="space-y-4 text-sm text-muted-foreground">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-primary shrink-0" />
                <span>Abidjan, Côte d'Ivoire</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-primary shrink-0" />
                <a
                  href={`tel:+${WHATSAPP_STORE_PHONE_E164}`}
                  className="transition-colors hover:text-primary"
                >
                  +225 {WHATSAPP_STORE_DISPLAY}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-primary shrink-0" />
                <span>contact@poidsbaoule.com</span>
              </li>
            </ul>
          </div>
        </div>
        
        <Separator className="mb-8 opacity-20" />
        
        <div className="flex flex-col items-center justify-between gap-4 text-center text-[10px] text-muted-foreground uppercase tracking-widest sm:text-xs md:flex-row md:text-left">
          <p className="max-w-full leading-relaxed">© 2026 POIDS BAOULÉ HOME DESIGN. TOUS DROITS RÉSERVÉS.</p>
          <p className="shrink-0 font-bold">DESIGNED BY NOYA INDUSTRIES</p>
        </div>
      </div>
    </footer>
  );
};

const AppLayout = () => {
  const location = useLocation();
  const [isPrivilegeModalOpen, setIsPrivilegeModalOpen] = useState(false);
  const isAdminRoute = location.pathname.startsWith('/admin');

  useEffect(() => {
    // One-time cleanup of legacy simulation keys
    const cleanupDone = localStorage.getItem('pb-prod-cleanup-v1');
    if (!cleanupDone) {
      const keysToRemove = ['orders_data', 'products_data', 'promo_data', 'reservations_data'];
      keysToRemove.forEach(key => localStorage.removeItem(key));
      localStorage.setItem('pb-prod-cleanup-v1', 'true');
      console.log("Production cleanup: Legacy simulation data removed.");
    }

    const hasSeenModal = localStorage.getItem('privilege-modal-seen');
    if (!hasSeenModal) {
      const timer = setTimeout(() => {
        setIsPrivilegeModalOpen(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <div className="flex min-h-[100dvh] min-w-0 max-w-[100vw] flex-col overflow-x-clip">
      {!isAdminRoute && <Navbar />}
      <main className="min-w-0 flex-1 grow">
        <Suspense fallback={<div className="container mx-auto px-4 py-20 text-center text-muted-foreground">Chargement...</div>}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/custom" element={<CustomOrder />} />
            <Route path="/services" element={<Services />} />
            <Route path="/story" element={<Story />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/account/*" element={<Account />} />
            <Route path="/admin/*" element={<AdminDashboard />} />
            <Route path="/faq" element={<InfoPage slug="faq" />} />
            <Route path="/shipping" element={<InfoPage slug="shipping" />} />
            <Route path="/terms" element={<InfoPage slug="terms" />} />
            <Route path="/contact" element={<InfoPage slug="contact" />} />
          </Routes>
        </Suspense>
      </main>
      {!isAdminRoute && <Footer />}
      {!isAdminRoute && <Toaster position="top-center" />}
      <PrivilegeModal
        isOpen={isPrivilegeModalOpen}
        onClose={() => setIsPrivilegeModalOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <ProductProvider>
      <CategoryProvider>
        <OrderProvider>
          <UserProvider>
            <PromoProvider>
              <ReservationProvider>
                <TestimonialProvider>
                <CartProvider>
                  <Router>
                    <BrandingProvider>
                      <AppLayout />
                    </BrandingProvider>
                  </Router>
                </CartProvider>
                </TestimonialProvider>
              </ReservationProvider>
            </PromoProvider>
          </UserProvider>
        </OrderProvider>
      </CategoryProvider>
    </ProductProvider>
  );
}
