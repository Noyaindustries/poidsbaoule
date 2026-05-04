import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, X, ArrowRight } from 'lucide-react';
import { usePromos } from '@/lib/PromoContext';
import { useState, useEffect } from 'react';

export default function PromoBanner() {
  const { promoCodes } = usePromos();
  const [isVisible, setIsVisible] = useState(true);
  
  // Find the most recent active promo with an announcement
  const activePromo = promoCodes
    .filter(p => p.isActive && (!p.expiryDate || new Date(p.expiryDate) > new Date()))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

  useEffect(() => {
    if (activePromo) setIsVisible(true);
  }, [activePromo]);

  if (!activePromo || !isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        className="bg-primary text-primary-foreground relative z-[60] overflow-hidden"
      >
        <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-grow justify-center">
            <div className="h-6 w-6 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <Sparkles className="h-3 w-3 text-accent" />
            </div>
            <p className="text-xs md:text-sm font-bold tracking-wide text-center">
              {activePromo.announcementText}
              <span className="ml-3 inline-flex items-center gap-1 text-[10px] uppercase tracking-widest bg-white/20 px-2 py-0.5 rounded-full">
                Code: {activePromo.code}
              </span>
            </p>
          </div>
          
          <button 
            onClick={() => setIsVisible(false)}
            className="h-8 w-8 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors shrink-0"
          >
            <X className="h-4 w-4 opacity-60" />
          </button>
        </div>
        
        {/* Animated background element */}
        <motion.div 
          animate={{ x: ['-100%', '200%'] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none"
        />
      </motion.div>
    </AnimatePresence>
  );
}
