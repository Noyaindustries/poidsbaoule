import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, Filter, MoreVertical, Eye, 
  Trash2, FileText, Send, Truck, CheckCircle2, 
  Clock, AlertCircle, ShoppingBag, Download,
  Mail, Phone, MapPin, CreditCard, ExternalLink,
  Users
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
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { generateInvoicePDF, sendAdminEmail } from '@/lib/admin-utils';
import { useOrders } from '@/lib/OrderContext';
import { Order } from '@/types';

export default function OrderManager() {
  const { orders } = useOrders();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'deposit_pending' | 'deposit_validated' | 'balance_due'>('all');

  const hasHalfDeposit = (order: Order) =>
    order.paymentStrategy === '50-50' && order.amountPaid > 0 && order.balanceDue > 0;
  const isHalfDepositPendingValidation = (order: Order) =>
    order.paymentStrategy === '50-50' && order.amountPaid === 0 && order.balanceDue > 0;

  const filteredOrders = orders.filter(order => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerEmail.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (paymentFilter === 'deposit_pending') return isHalfDepositPendingValidation(order);
    if (paymentFilter === 'deposit_validated') return hasHalfDeposit(order);
    if (paymentFilter === 'balance_due') return order.balanceDue > 0;
    return true;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Livrée': return <Badge className="bg-green-100 text-green-700 border-none rounded-full px-3 py-1 text-[10px]">Livrée</Badge>;
      case 'Expédiée': return <Badge className="bg-purple-100 text-purple-700 border-none rounded-full px-3 py-1 text-[10px]">Expédiée</Badge>;
      case 'En préparation': return <Badge className="bg-blue-100 text-blue-700 border-none rounded-full px-3 py-1 text-[10px]">En préparation</Badge>;
      case 'Paiement reçu': return <Badge className="bg-orange-100 text-orange-700 border-none rounded-full px-3 py-1 text-[10px]">Paiement reçu</Badge>;
      case 'En attente de paiement': return <Badge className="bg-yellow-100 text-yellow-700 border-none rounded-full px-3 py-1 text-[10px]">Attente paiement</Badge>;
      case 'Annulée': return <Badge className="bg-red-100 text-red-700 border-none rounded-full px-3 py-1 text-[10px]">Annulée</Badge>;
      default: return <Badge variant="secondary" className="rounded-full px-3 py-1 text-[10px]">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Rechercher une commande ou un client..." 
            className="pl-10 rounded-full bg-card border-none shadow-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-full border bg-card px-2 py-1 shadow-sm">
            <Button variant={paymentFilter === 'all' ? 'default' : 'ghost'} size="sm" className="rounded-full text-xs" onClick={() => setPaymentFilter('all')}>
              Toutes
            </Button>
            <Button variant={paymentFilter === 'deposit_pending' ? 'default' : 'ghost'} size="sm" className="rounded-full text-xs" onClick={() => setPaymentFilter('deposit_pending')}>
              En attente acompte
            </Button>
            <Button variant={paymentFilter === 'deposit_validated' ? 'default' : 'ghost'} size="sm" className="rounded-full text-xs" onClick={() => setPaymentFilter('deposit_validated')}>
              Acompte validé
            </Button>
            <Button variant={paymentFilter === 'balance_due' ? 'default' : 'ghost'} size="sm" className="rounded-full text-xs" onClick={() => setPaymentFilter('balance_due')}>
              Solde à encaisser
            </Button>
          </div>
          <Button variant="outline" className="rounded-full shadow-sm" onClick={() => generateInvoicePDF("EXPORT_ALL")}>
            <Download className="mr-2 h-4 w-4" /> Exporter (CSV)
          </Button>
        </div>
      </div>

      <Card className="rounded-[32px] border-none shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground">
                <tr>
                  <th className="px-8 py-4">ID Commande</th>
                  <th className="px-8 py-4">Client</th>
                  <th className="px-8 py-4">Date</th>
                  <th className="px-8 py-4">Total</th>
                  <th className="px-8 py-4">Statut</th>
                  <th className="px-8 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-muted/20 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="font-bold">{order.id}</div>
                        {isHalfDepositPendingValidation(order) && (
                          <Badge variant="outline" className="mt-1 border-violet-200 bg-violet-50 text-[9px] text-violet-700">
                            Acompte en attente de validation
                          </Badge>
                        )}
                        {hasHalfDeposit(order) && (
                          <Badge variant="outline" className="mt-1 border-blue-200 bg-blue-50 text-[9px] text-blue-700">
                            Acompte 50% reçu
                          </Badge>
                        )}
                        {order.balanceDue > 0 && (
                          <Badge variant="outline" className="text-[9px] border-amber-200 text-amber-700 bg-amber-50 mt-1">Reste: {order.balanceDue.toLocaleString()} FCFA</Badge>
                        )}
                      </td>
                      <td className="px-8 py-6">
                        <div>
                          <p className="font-bold">{order.customerName}</p>
                          <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">{order.customerEmail}</p>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</td>
                      <td className="px-8 py-6 font-medium font-sans">
                        <div className="space-y-1">
                          <p className="font-bold">{order.total.toLocaleString()} FCFA</p>
                          <p className={`text-[10px] font-bold ${order.amountPaid >= order.total ? 'text-green-600' : 'text-amber-600'}`}>
                            Payé: {order.amountPaid.toLocaleString()} FCFA
                          </p>
                        </div>
                      </td>
                      <td className="px-8 py-6">{getStatusBadge(order.status)}</td>
                      <td className="px-8 py-6 text-right">
                        <Dialog>
                          <DialogTrigger 
                            render={
                              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100" onClick={() => setSelectedOrder(order)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                            }
                          />
                          <OrderDetails order={selectedOrder} />
                        </Dialog>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-8 py-10 text-center text-muted-foreground">
                      Aucune commande trouvée.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function OrderDetails({ order: initialOrder }: { order: any }) {
  const { updateOrderStatus, orders, confirmFinalPayment, validateHalfDeposit } = useOrders();
  
  const order = orders.find(o => o.id === initialOrder?.id) || initialOrder;
  const hasHalfDeposit = order?.paymentStrategy === '50-50' && order?.amountPaid > 0 && order?.balanceDue > 0;
  const needsHalfDepositValidation = order?.paymentStrategy === '50-50' && Number(order?.amountPaid ?? 0) === 0;

  if (!order) return null;

  const handleWhatsApp = (type: 'generic' | 'delay' | 'shipping') => {
    let message = "";
    switch (type) {
      case 'delay':
        message = `Bonjour ${order.customerName}, nous sommes désolés de vous informer d'un léger retard sur votre commande ${order.id}. Nous faisons le maximum pour vous livrer au plus vite. Merci de votre patience.`;
        break;
      case 'shipping':
        message = `Bonjour ${order.customerName}, votre colis pour la commande ${order.id} est en cours de livraison ! Votre facture est disponible sur demande. À très vite !`;
        break;
      default:
        message = `Bonjour ${order.customerName}, je vous contacte concernant votre commande ${order.id} sur Poids Baoulé Home Design.`;
    }
    
    const phone = order.customerPhone.replace(/\s/g, '');
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleEmail = (type: 'generic' | 'tracking' | 'payment') => {
    let subject = "";
    let body = "";
    
    if (type === 'payment') {
      subject = `Rappel de paiement - Commande ${order.id}`;
      body = `Bonjour ${order.customerName},\n\nSauf erreur de notre part, le solde de ${order.balanceDue.toLocaleString()} FCFA pour votre commande ${order.id} reste en attente de règlement.\n\nMerci de nous contacter pour finaliser la livraison.\n\nL'équipe Poids Baoulé`;
    } else if (type === 'tracking') {
      subject = `Suivi de votre commande ${order.id}`;
      body = `Bonjour ${order.customerName},\n\nVotre commande ${order.id} est en route ! Voici les détails de suivi...`;
    } else {
      subject = `Votre commande ${order.id}`;
      body = `Bonjour ${order.customerName},\n\nConcerne votre commande ${order.id} chez Poids Baoulé Home Design.\n\n[Détails ici]`;
    }

    window.location.href = `mailto:${order.customerEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <DialogContent className="w-[96vw] max-w-[1400px] max-h-[90vh] overflow-x-hidden overflow-y-auto rounded-[32px] border-none p-0 font-sans shadow-2xl">
      <DialogHeader className="p-8 pb-4">
        <div className="flex items-center justify-between gap-4 mb-2">
          <Badge className="bg-primary/10 text-primary border-none text-[10px] uppercase tracking-widest font-bold">Commande active</Badge>
          <p className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleString()}</p>
        </div>
        <DialogTitle className="text-3xl font-serif font-bold flex items-center gap-3">
          {order.id}
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => window.open(`/checkout/success/${order.id}`, '_blank')}><ExternalLink className="h-4 w-4" /></Button>
        </DialogTitle>
      </DialogHeader>

      <div className="min-w-0 p-8 pt-4 pb-32 space-y-12">
        {/* Customer & Status Section */}
        <section className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div className="space-y-4">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Client</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Users className="h-4 w-4 text-primary/60" />
                <span className="font-bold">{order.customerName}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>{order.customerEmail}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>{order.customerPhone}</span>
              </div>
            </div>
          </div>
          <div className="space-y-4 text-right">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Modifier le Statut</h3>
            <div className="flex justify-end">
              <Select 
                value={order.status}
                onValueChange={async (val) => {
                  await updateOrderStatus(order.id, val as any);
                  toast.success(`Statut mis à jour : ${val}`);
                }}
              >
                <SelectTrigger className="w-[200px] h-12 rounded-xl bg-muted/30 border-none font-bold text-sm shadow-inner">
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-none shadow-2xl">
                  <SelectItem value="En attente de paiement">Attente paiement</SelectItem>
                  <SelectItem value="Paiement reçu">Paiement reçu</SelectItem>
                  <SelectItem value="En préparation">En préparation</SelectItem>
                  <SelectItem value="Expédiée">Expédiée</SelectItem>
                  <SelectItem value="Livrée">Livrée</SelectItem>
                  <SelectItem value="Annulée">Annulée</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-primary/10 bg-muted/20 p-4">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Moyen de paiement</h3>
          <p className="mt-1 text-sm font-bold text-foreground">{order.paymentMethod}</p>
          {needsHalfDepositValidation && (
            <Badge variant="outline" className="mt-2 border-violet-200 bg-violet-50 text-violet-700">
              Acompte en attente de validation
            </Badge>
          )}
          {hasHalfDeposit && (
            <Badge variant="outline" className="mt-2 border-blue-200 bg-blue-50 text-blue-700">
              Acompte 50% reçu
            </Badge>
          )}
          {order.paymentStrategy && (
            <p className="mt-1 text-xs text-muted-foreground">
              Modalité :{' '}
              <span className="font-medium text-foreground">
                {order.paymentStrategy === '50-50' ? '50 % à la commande' : order.paymentStrategy === 'CASH' ? 'Paiement à la livraison' : 'Paiement intégral'}
              </span>
            </p>
          )}
          {order.paymentReference ? (
            <p className="mt-2 rounded-lg bg-background/80 px-3 py-2 text-sm">
              <span className="text-muted-foreground">Réf. indiquée par le client :</span>{' '}
              <span className="font-mono font-medium">{order.paymentReference}</span>
            </p>
          ) : null}
        </section>

        <Separator className="opacity-50" />

        {/* Financial Summary */}
        <section className="bg-primary/5 p-6 rounded-3xl space-y-4 border border-primary/10 min-w-0">
          <div className="flex justify-between items-center">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Résumé Financier</h3>
            <Badge className={order.balanceDue === 0 ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}>
              {order.balanceDue === 0 ? "SOLDE RÉGLÉ" : "RESTE À PERCEVOIR"}
            </Badge>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-8">
            <div className="space-y-1">
              <p className="text-[8px] uppercase text-muted-foreground font-bold tracking-[0.2em]">Total</p>
              <p className="text-lg font-bold">{order.total.toLocaleString()} F</p>
            </div>
            <div className="space-y-1">
              <p className="text-[8px] uppercase text-muted-foreground font-bold tracking-[0.2em]">Déjà Payé</p>
              <p className="text-lg font-bold text-green-600">{order.amountPaid.toLocaleString()} F</p>
            </div>
            <div className="space-y-1">
              <p className="text-[8px] uppercase text-muted-foreground font-bold tracking-[0.2em]">Reste</p>
              <p className={`text-lg font-bold ${order.balanceDue > 0 ? 'text-amber-600' : 'text-muted-foreground'}`}>
                {order.balanceDue.toLocaleString()} F
              </p>
            </div>
          </div>

          {needsHalfDepositValidation ? (
            <Button
              className="mt-4 h-11 w-full rounded-xl bg-blue-600 text-xs font-bold text-white shadow-lg shadow-blue-600/20"
              onClick={async () => {
                await validateHalfDeposit(order.id);
                toast.success("Acompte 50% validé !");
              }}
            >
              <CheckCircle2 className="mr-2 h-4 w-4" /> Valider acompte 50%
            </Button>
          ) : order.balanceDue > 0 ? (
            <Button 
              className="w-full mt-4 bg-primary text-white rounded-xl h-11 text-xs font-bold shadow-lg shadow-primary/20"
              onClick={async () => {
                await confirmFinalPayment(order.id);
                toast.success("Encaissement du solde confirmé !");
              }}
            >
              <CheckCircle2 className="mr-2 h-4 w-4" /> Confirmer encaissement du solde final
            </Button>
          ) : null}
        </section>

        {order.balanceDue > 0 && (
          <section className="bg-amber-50 p-6 rounded-3xl space-y-4 border border-amber-200">
            <div className="flex items-center gap-2 text-amber-700">
              <AlertCircle className="h-5 w-5" />
              <h3 className="text-[10px] font-bold uppercase tracking-widest">Relance Paiement (Action Requise)</h3>
            </div>
            <p className="text-xs text-amber-700/80 leading-relaxed">
              Un solde de <span className="font-bold">{order.balanceDue.toLocaleString()} FCFA</span> est en attente. 
              Utilisez les raccourcis ci-dessous pour relancer le client.
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="rounded-xl h-10 border-amber-200 hover:bg-amber-100 text-amber-700" 
                onClick={() => {
                  const phone = order.customerPhone.replace(/[\s+]/g, '');
                  const msg = `Bonjour ${order.customerName}, le solde de ${order.balanceDue.toLocaleString()} FCFA pour votre commande ${order.id} est toujours en attente. Merci de nous le confirmer.`;
                  window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
                }}
              >
                 <Phone className="mr-2 h-3 w-3" /> WhatsApp Relance
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="rounded-xl h-10 border-amber-200 hover:bg-amber-100 text-amber-700" 
                onClick={() => handleEmail('payment')}
              >
                 <Mail className="mr-2 h-3 w-3" /> Email Relance
              </Button>
            </div>
          </section>
        )}

        <Separator className="opacity-50" />

        {/* Communication Panel */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Communiquer avec le client</h3>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <p className="text-[10px] uppercase font-bold text-muted-foreground/60 px-2">WhatsApp</p>
              <div className="flex flex-col gap-2">
                <Button variant="outline" size="sm" className="justify-start rounded-xl h-10 border-primary/20 hover:bg-primary/5" onClick={() => handleWhatsApp('generic')}>
                   <Phone className="mr-2 h-3 w-3" /> Message standard
                </Button>
                <Button variant="outline" size="sm" className="justify-start rounded-xl h-10 border-primary/20 hover:bg-primary/5" onClick={() => handleWhatsApp('delay')}>
                   <Clock className="mr-2 h-3 w-3" /> Signaler un retard
                </Button>
                <Button variant="outline" size="sm" className="justify-start rounded-xl h-10 border-green-500/20 text-green-600 hover:bg-green-50" onClick={() => handleWhatsApp('shipping')}>
                   <Truck className="mr-2 h-3 w-3" /> Confirmer Livraison
                </Button>
              </div>
            </div>
            <div className="space-y-3">
              <p className="text-[10px] uppercase font-bold text-muted-foreground/60 px-2">E-mail</p>
              <div className="flex flex-col gap-2">
                <Button variant="outline" size="sm" className="justify-start rounded-xl h-10 border-primary/20 hover:bg-primary/5" onClick={() => handleEmail('generic')}>
                   <Mail className="mr-2 h-3 w-3" /> E-mail libre
                </Button>
                <Button variant="outline" size="sm" className="justify-start rounded-xl h-10 border-primary/20 hover:bg-primary/5" onClick={() => handleEmail('tracking')}>
                   <FileText className="mr-2 h-3 w-3" /> Envoyer Tracking
                </Button>
                <Button variant="outline" size="sm" className="justify-start rounded-xl h-10 border-blue-500/20 text-blue-600 hover:bg-blue-50" onClick={() => generateInvoicePDF(order.id)}>
                   <Download className="mr-2 h-3 w-3" /> Générer Facture
                </Button>
              </div>
            </div>
          </div>
        </section>

        <Separator className="opacity-50" />

        {/* Dynamic Items Section */}
        <section className="space-y-6">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Articles ({order.items?.length || 0})</h3>
          <div className="space-y-6 bg-muted/20 p-6 rounded-[32px]">
            {order.items && order.items.length > 0 ? order.items.map((item: any, idx: number) => (
              <div key={idx} className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl overflow-hidden bg-white shadow-sm shrink-0">
                  <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div className="grow min-w-0">
                  <p className="text-sm font-bold wrap-break-word">{item.name}</p>
                  <p className="text-xs text-muted-foreground italic">Catégorie : {item.category}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold font-sans">{item.price.toLocaleString()} FCFA</p>
                  <p className="text-[10px] text-muted-foreground">Qté: {item.quantity}</p>
                </div>
              </div>
            )) : (
              <p className="text-xs text-center text-muted-foreground py-4 italic">Détails des articles non disponibles pour cette commande.</p>
            )}
          </div>
        </section>

        {/* Shipping & Payment Section */}
        <section className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="h-4 w-4 text-primary" />
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Adresse de Livraison</h3>
            </div>
            <div className="text-sm leading-relaxed p-6 bg-muted/20 rounded-[32px]">
              <p className="font-bold">{order.customerName}</p>
              <p>{order.shippingAddress.street}</p>
              <p>{order.shippingAddress.city}, {order.shippingAddress.country}</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <CreditCard className="h-4 w-4 text-primary" />
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Paiement</h3>
            </div>
            <div className="p-6 bg-muted/20 rounded-[32px] space-y-3">
              <div className="flex justify-between text-xs">
                <span>Méthode:</span>
                <span className="font-bold text-primary">{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span>Total article(s):</span>
                <span className="font-sans font-bold">{order.total.toLocaleString()} FCFA</span>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Livraison:</span>
                <span>Frais à la charge du client</span>
              </div>
              <Separator className="opacity-30" />
              <div className="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span className="text-primary font-sans">{order.total.toLocaleString()} FCFA</span>
              </div>
            </div>
          </div>
        </section>

        {/* Internal Notes */}
        <section className="space-y-4">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Notes Internes (Confidentiel)</h3>
          <Textarea 
            placeholder="Ajouter une note de fabrication ou de suivi..." 
            className="rounded-[32px] min-h-[100px] border-none bg-muted/20 focus-visible:ring-primary/20 p-6"
          />
        </section>

        <div className="sticky bottom-0 mt-6 flex flex-col gap-3 border-t bg-white/90 p-6 backdrop-blur-md sm:flex-row sm:gap-4">
          <Button variant="outline" className="h-14 w-full rounded-full sm:flex-1" onClick={() => generateInvoicePDF(order.id)}>
            <FileText className="mr-2 h-4 w-4" /> Facture PDF
          </Button>
          <Button className="h-14 w-full rounded-full text-lg font-bold sm:flex-2" onClick={() => handleWhatsApp('shipping')}>
            <Truck className="mr-2 h-5 w-5" /> Prévenir Livraison
          </Button>
        </div>
      </div>
    </DialogContent>
  );
}
