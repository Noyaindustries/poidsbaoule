import { motion, AnimatePresence } from 'motion/react';
import { X, Crown, Star, Gift, Truck, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface PrivilegeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PrivilegeModal({ isOpen, onClose }: PrivilegeModalProps) {
  const handleClose = () => {
    localStorage.setItem('privilege-modal-seen', 'true');
    onClose();
  };

  const handleSignUp = () => {
    // TODO: Rediriger vers la page d'inscription
    handleClose();
  };

  const handleSignIn = () => {
    // TODO: Rediriger vers la page de connexion
    handleClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md mx-auto p-0 border-none bg-transparent shadow-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.3 }}
          className="relative bg-gradient-to-br from-primary/95 to-primary text-white rounded-[32px] p-8 overflow-hidden"
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-4 right-4">
              <Crown className="h-16 w-16" />
            </div>
            <div className="absolute bottom-4 left-4">
              <Star className="h-12 w-12" />
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Content */}
          <div className="relative z-10 text-center space-y-6">
            <div className="flex justify-center">
              <div className="h-16 w-16 rounded-full bg-white/20 flex items-center justify-center">
                <Crown className="h-8 w-8" />
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-serif font-bold">Devenez Client Privilégié</h2>
              <p className="text-white/90 text-sm leading-relaxed">
                Accédez à des avantages exclusifs réservés à nos clients les plus fidèles
              </p>
            </div>

            {/* Avantages */}
            <div className="space-y-3 text-left">
              <div className="flex items-center gap-3 text-sm">
                <Gift className="h-4 w-4 text-yellow-300 shrink-0" />
                <span>Remises exclusives jusqu'à -20%</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Truck className="h-4 w-4 text-yellow-300 shrink-0" />
                <span>Livraison prioritaire gratuite</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Shield className="h-4 w-4 text-yellow-300 shrink-0" />
                <span>Accès anticipé aux nouvelles collections</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Star className="h-4 w-4 text-yellow-300 shrink-0" />
                <span>Service client dédié</span>
              </div>
            </div>

            {/* Buttons */}
            <div className="space-y-3 pt-2">
              <Button
                onClick={handleSignUp}
                className="w-full h-12 rounded-full bg-white text-primary hover:bg-white/90 font-bold shadow-lg"
              >
                S'inscrire maintenant
              </Button>
              <Button
                onClick={handleSignIn}
                variant="ghost"
                className="w-full h-12 rounded-full text-white border-white/30 hover:bg-white/10"
              >
                Déjà membre ? Se connecter
              </Button>
            </div>

            <p className="text-xs text-white/60">
              Rejoignez notre communauté exclusive de connaisseurs d'art
            </p>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}