import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { ShoppingCart, User, Menu, X, Search, Heart, ChevronRight, Globe, Share2, Phone, Mail, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Toaster } from '@/components/ui/sonner';
import SearchModal from '@/components/SearchModal';
import PrivilegeModal from '@/components/PrivilegeModal';
import { CartProvider, useCart } from '@/lib/CartContext';
import { ProductProvider } from '@/lib/ProductContext';
import { OrderProvider } from '@/lib/OrderContext';
import { UserProvider } from '@/lib/UserContext';
import { ReservationProvider } from '@/lib/ReservationContext';


// Pages (to be created)
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import CustomOrder from './pages/CustomOrder';
import Services from './pages/Services';
import Story from './pages/Story';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Account from './pages/Account';
import AdminDashboard from './pages/AdminDashboard';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const location = useLocation();
  const { totalItems } = useCart();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Accueil', path: '/' },
    { name: 'Boutique', path: '/shop' },
    { name: 'Sur Mesure', path: '/custom' },
    { name: 'Prestations Déco', path: '/services' },
    { name: 'Notre Histoire', path: '/story' },
  ];

  const isHome = location.pathname === '/';
  const linkTextClass = (path: string) => {
    if (isHome && !isScrolled) return 'text-white';
    if (isHome && isScrolled) return 'text-primary';
    return location.pathname === path ? 'text-primary' : 'text-foreground/70';
  };
  const iconColorClass = isHome && !isScrolled ? 'text-white' : 'text-foreground/70';

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-background/80 backdrop-blur-md border-b py-1 md:py-1' : 'bg-transparent pt-4 pb-4 md:py-1'}`}>
      <div className="container mx-auto px-4 relative flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger render={<Button variant="ghost" size="icon" className="lg:hidden"><Menu className={`h-6 w-6 ${iconColorClass}`} /></Button>} />
            <SheetContent side="left" className="w-[300px] sm:w-[400px]">
              <div className="flex flex-col gap-4 mt-8">
                {navLinks.map((link) => (
                  <Link key={link.path} to={link.path} onClick={() => { window.scrollTo(0, 0); setIsMobileMenuOpen(false); }} className="text-xl font-serif hover:text-primary transition-colors">
                    {link.name}
                  </Link>
                ))}
              </div>
            </SheetContent>
          </Sheet>

          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setIsSearchOpen(true)}>
            <Search className={`h-5 w-5 ${iconColorClass}`} />
          </Button>
        </div>

        <Link to="/" className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 lg:static lg:top-auto lg:left-auto lg:translate-x-0 lg:translate-y-0 lg:-ml-6 flex items-center gap-2 group flex-shrink-0" onClick={() => window.scrollTo(0, 0)}>
          <img 
            src="/0-removebg-preview.png" 
            alt="Poids Baoulé Logo" 
            className={
              `${isScrolled ? 'h-[60px] md:h-[120px]' : 'h-[80px] md:h-[150px]'} 
                w-auto object-contain transition-all duration-500 
                drop-shadow-[0_0_20px_rgba(255,255,255,0.4)]
                group-hover:scale-105`
            }
          />
        </Link>

        <div className="hidden lg:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link 
              key={link.path} 
              to={link.path} 
              onClick={() => window.scrollTo(0, 0)}
              className={`text-sm font-medium uppercase tracking-widest hover:text-primary transition-colors ${linkTextClass(link.path)}`}
            >
              {link.name}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <Button variant="ghost" size="icon" className="hidden sm:flex" onClick={() => setIsSearchOpen(true)}>
            <Search className={`h-5 w-5 ${iconColorClass}`} />
          </Button>
          <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
          <Link to="/account" onClick={() => window.scrollTo(0, 0)}>
            <Button variant="ghost" size="icon">
              <User className={`h-5 w-5 ${iconColorClass}`} />
            </Button>
          </Link>
          <Link to="/cart" onClick={() => window.scrollTo(0, 0)}>
            <Button variant="ghost" size="icon" className="relative">
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
import PromoBanner from '@/components/PromoBanner';

const Footer = () => {
  return (
    <footer className="bg-muted pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          <div className="space-y-4">
            <Link to="/" className="block mb-6" onClick={() => window.scrollTo(0, 0)}>
              <img src="/0-removebg-preview.png" alt="Poids Baoulé Logo" className="h-[120px] md:h-[180px] w-auto object-contain drop-shadow-lg" />
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Allier tradition africaine et design contemporain. Chaque pièce est une œuvre originale, sculptée à la main pour célébrer l'élégance de l'imperfection.
            </p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-primary transition-colors"><Globe className="h-5 w-5" /></a>
              <a href="#" className="hover:text-primary transition-colors"><Share2 className="h-5 w-5" /></a>
            </div>
          </div>

          <div>
            <h4 className="font-bold mb-6 uppercase tracking-widest text-sm">Navigation</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link to="/shop" onClick={() => window.scrollTo(0, 0)} className="hover:text-primary transition-colors">Boutique</Link></li>
              <li><Link to="/custom" onClick={() => window.scrollTo(0, 0)} className="hover:text-primary transition-colors">Sur Mesure</Link></li>
              <li><Link to="/services" onClick={() => window.scrollTo(0, 0)} className="hover:text-primary transition-colors">Prestations Déco</Link></li>
              <li><Link to="/story" onClick={() => window.scrollTo(0, 0)} className="hover:text-primary transition-colors">Notre Histoire</Link></li>
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
                <span>+225 07 49 12 91 53</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-primary shrink-0" />
                <span>contact@poidsbaoule.com</span>
              </li>
            </ul>
          </div>
        </div>
        
        <Separator className="mb-8 opacity-20" />
        
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground uppercase tracking-widest">
          <p>© 2026 POIDS BAOULÉ HOME DESIGN. TOUS DROITS RÉSERVÉS.</p>
          <div className="flex items-center gap-4 font-bold">
            <Link to="/admin" onClick={() => window.scrollTo(0, 0)}>
              <Button variant="outline" size="sm" className="h-8 text-[10px] rounded-full hover:bg-primary hover:text-primary-foreground border-muted-foreground/20">
                Admin
              </Button>
            </Link>
            <p className="font-normal">DESIGNED BY NOYA INDUSTRIES</p>
          </div>
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
    <div className="min-h-screen flex flex-col">
      {!isAdminRoute && <PromoBanner />}
      {!isAdminRoute && <Navbar />}
      <main className="flex-grow">
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
        </Routes>
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
      <OrderProvider>
        <UserProvider>
          <PromoProvider>
            <ReservationProvider>
              <CartProvider>
                <Router>
                  <AppLayout />
                </Router>
              </CartProvider>
            </ReservationProvider>
          </PromoProvider>
        </UserProvider>
      </OrderProvider>
    </ProductProvider>
  );
}
