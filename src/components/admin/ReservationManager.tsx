import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar as CalendarIcon, Clock, Users, MapPin, 
  MoreVertical, CheckCircle2, AlertCircle, XCircle,
  FileText, Send, Plus, Search, Filter, Camera, 
  Settings, MessageSquare, History, Briefcase, Mail, Phone
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
  SheetDescription, SheetFooter
} from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Select, SelectContent, SelectItem, 
  SelectTrigger, SelectValue 
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useReservations } from '@/lib/ReservationContext';
import { useUsers } from '@/lib/UserContext';
import { Reservation, CustomOrder } from '@/types';

export default function ReservationManager() {
  const [activeTab, setActiveTab] = useState('services');
  const [searchQuery, setSearchQuery] = useState('');
  const { reservations, customOrders, updateReservationStatus, updateCustomOrderStatus } = useReservations();

  const filteredReservations = reservations.filter(res => 
    res.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    res.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCustomOrders = customOrders.filter(order => 
    order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <Tabs defaultValue="services" onValueChange={setActiveTab} className="w-full">
        <div className="flex flex-wrap items-center justify-between gap-6 mb-8">
          <TabsList className="bg-card p-1.5 rounded-full border-none shadow-sm h-auto gap-2">
            <TabsTrigger value="services" className="rounded-full px-8 py-3 data-[state=active]:bg-primary data-[state=active]:text-white transition-all text-xs font-bold uppercase tracking-widest">Prestations</TabsTrigger>
            <TabsTrigger value="custom" className="rounded-full px-8 py-3 data-[state=active]:bg-primary data-[state=active]:text-white transition-all text-xs font-bold uppercase tracking-widest">Sur Mesure</TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-3">
             <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Rechercher..." 
                className="pl-10 rounded-full bg-card border-none shadow-sm w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        <TabsContent value="services" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 text-sans">
            <AnimatePresence>
              {filteredReservations.length > 0 ? filteredReservations.map((res, i) => (
                <motion.div
                  key={res.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className="rounded-[40px] border-none shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden group">
                    <CardHeader className="p-8 pb-4">
                      <div className="flex justify-between items-start">
                        <Badge className={`rounded-full px-3 py-1 text-[10px] uppercase font-bold border-none ${
                          res.status === 'Confirmée' ? 'bg-green-100 text-green-700' : 
                          res.status === 'Annulée' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {res.status}
                        </Badge>
                        <DropdownMenu>
                          <DropdownMenuTrigger 
                            render={
                              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full"><MoreVertical className="h-4 w-4" /></Button>
                            }
                          />
                          <DropdownMenuContent align="end" className="rounded-2xl">
                            <DropdownMenuItem className="p-3 gap-3 rounded-xl" onClick={async () => await updateReservationStatus(res.id, 'Confirmée')}><CheckCircle2 className="h-4 w-4" /> Confirmer</DropdownMenuItem>
                            <DropdownMenuItem className="p-3 gap-3 rounded-xl" onClick={async () => await updateReservationStatus(res.id, 'Terminée')}><Briefcase className="h-4 w-4" /> Terminer</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="p-3 gap-3 rounded-xl text-destructive" onClick={async () => await updateReservationStatus(res.id, 'Annulée')}><XCircle className="h-4 w-4" /> Annuler</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <CardTitle className="text-2xl font-serif font-bold mt-4">{res.type}</CardTitle>
                      <p className="text-sm font-bold text-primary">{res.customerName}</p>
                    </CardHeader>
                    <CardContent className="p-8 space-y-6">
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <CalendarIcon className="h-4 w-4" />
                          <span>{new Date(res.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span>{res.neighborhood}</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <Briefcase className="h-4 w-4" />
                          <span className="font-bold text-foreground">{res.budget}</span>
                        </div>
                      </div>
                      <Separator className="opacity-50" />
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-accent flex items-center justify-center text-accent-foreground font-bold text-xs shrink-0">
                          {res.customerName.split(' ').map(n => n[0]).join('')}
                        </div>
                        <p className="text-xs text-muted-foreground italic line-clamp-2">"{res.description}"</p>
                      </div>
                      <Sheet>
                        <SheetTrigger 
                          render={
                            <Button className="w-full rounded-2xl h-12 text-xs font-bold uppercase tracking-widest bg-muted text-foreground hover:bg-primary hover:text-white transition-all">Gérer la réservation</Button>
                          }
                        />
                        <ReservationDetail res={res} />
                      </Sheet>
                    </CardContent>
                  </Card>
                </motion.div>
              )) : (
                <div className="col-span-full py-20 text-center space-y-4">
                  <p className="text-muted-foreground italic">Aucune réservation trouvée.</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </TabsContent>

        <TabsContent value="custom" className="space-y-6">
           <Card className="rounded-[32px] border-none shadow-sm overflow-hidden text-sans">
            <CardContent className="p-0">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/50 text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground">
                  <tr>
                    <th className="px-8 py-4">Projet</th>
                    <th className="px-8 py-4">Client</th>
                    <th className="px-8 py-4">Étape</th>
                    <th className="px-8 py-4">Date</th>
                    <th className="px-8 py-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredCustomOrders.length > 0 ? filteredCustomOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-muted/20 transition-colors group">
                      <td className="px-8 py-6">
                        <p className="font-bold">{order.type}</p>
                        <p className="text-[10px] text-muted-foreground font-bold tracking-widest">{order.dimensions}</p>
                      </td>
                      <td className="px-8 py-6">{order.customerName}</td>
                      <td className="px-8 py-6">
                        <Badge className={`rounded-full px-3 py-1 border-none text-[10px] uppercase font-bold ${
                          order.status === 'Finition' ? 'bg-amber-100 text-amber-700' : 
                          order.status === 'Étude' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                        }`}>
                          {order.status}
                        </Badge>
                      </td>
                      <td className="px-8 py-6 text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</td>
                      <td className="px-8 py-6 text-right">
                        <Sheet>
                          <SheetTrigger 
                            render={
                              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            }
                          />
                          <CustomOrderDetail order={order} />
                        </Sheet>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={5} className="px-8 py-20 text-center text-muted-foreground italic">Aucun projet sur mesure.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ReservationDetail({ res }: { res: Reservation }) {
  const { updateReservationStatus } = useReservations();
  const [statusSelectOpen, setStatusSelectOpen] = useState(false);
  const [statusValue, setStatusValue] = useState(res.status);
  
  const handleContact = (method: 'whatsapp' | 'email') => {
    const message = `Bonjour ${res.customerName}, je reviens vers vous concernant votre demande de ${res.type} chez Poids Baoulé Home Design...`;
    if (method === 'whatsapp') {
      window.open(`https://wa.me/225${res.phone.replace(/\s/g, '')}?text=${encodeURIComponent(message)}`, '_blank');
    } else {
      window.open(`mailto:${res.email}?subject=Votre projet Poids Baoulé&body=${encodeURIComponent(message)}`, '_blank');
    }
  };

  return (
    <SheetContent className="sm:max-w-2xl w-full overflow-y-auto rounded-l-[40px] border-none shadow-2xl p-0 font-sans">
      <SheetHeader className="p-8 pb-4">
        <div className="flex items-center justify-between mb-4">
          <Badge className="bg-primary/10 text-primary border-none text-[10px] uppercase tracking-widest font-bold">Ref: {res.id}</Badge>
        </div>
        <SheetTitle className="text-3xl font-serif font-bold">{res.type}</SheetTitle>
        <SheetDescription>{res.customerName} • {res.neighborhood}</SheetDescription>
      </SheetHeader>

      <div className="p-8 pt-4 pb-32 space-y-12">
        <section className="grid grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Planning</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <CalendarIcon className="h-4 w-4 text-primary/60" />
                <span className="font-bold">{new Date(res.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>En attente de créneau</span>
              </div>
            </div>
          </div>
           <div className="space-y-4 text-right">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Statut</h3>
             <Select
                value={statusValue}
                open={statusSelectOpen}
                onOpenChange={setStatusSelectOpen}
                onValueChange={async (val: any) => {
                  setStatusSelectOpen(false);
                  const previous = statusValue;
                  setStatusValue(val);
                  try {
                    await updateReservationStatus(res.id, val);
                  } catch {
                    setStatusValue(previous);
                    toast.error('Impossible de mettre à jour le statut de la réservation.');
                  }
                }}
              >
                <SelectTrigger className="w-[180px] h-11 rounded-xl bg-muted/30 border-none text-right">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-none shadow-xl">
                  <SelectItem value="Demande reçue">Demande reçue</SelectItem>
                  <SelectItem value="Confirmée">Confirmée</SelectItem>
                  <SelectItem value="Terminée">Terminée</SelectItem>
                  <SelectItem value="Annulée">Annulée</SelectItem>
                </SelectContent>
              </Select>
          </div>
        </section>

        <Separator className="opacity-50" />

        <section className="space-y-6">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Description du projet</h3>
          <p className="text-sm leading-relaxed text-muted-foreground bg-muted/20 p-6 rounded-3xl italic">
            "{res.description}"
          </p>
        </section>

        <section className="space-y-6">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Coordonnées</h3>
          <div className="space-y-4">
             <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-accent flex items-center justify-center">
                <Phone className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-muted-foreground">Téléphone</p>
                <p className="font-bold">{res.phone}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-accent flex items-center justify-center">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-muted-foreground">Email</p>
                <p className="font-bold">{res.email}</p>
              </div>
            </div>
          </div>
        </section>

        <SheetFooter className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md p-8 border-t flex gap-4">
          <Button variant="outline" className="flex-1 rounded-full h-14" onClick={() => handleContact('email')}>
            <Mail className="mr-2 h-4 w-4" /> Email
          </Button>
          <Button className="flex-[2] rounded-full h-14 text-lg font-bold" onClick={() => handleContact('whatsapp')}>
            <MessageSquare className="mr-2 h-5 w-5" /> WhatsApp
          </Button>
        </SheetFooter>
      </div>
    </SheetContent>
  );
}

function CustomOrderDetail({ order }: { order: CustomOrder }) {
  const { updateCustomOrderStatus } = useReservations();
  const [statusSelectOpen, setStatusSelectOpen] = useState(false);
  const [statusValue, setStatusValue] = useState(order.status);

  const handleContact = (method: 'whatsapp' | 'email') => {
    const message = `Bonjour ${order.customerName}, je vous contacte concernant votre projet sur mesure de ${order.type}...`;
    if (method === 'whatsapp') {
      window.open(`https://wa.me/2250749129153?text=${encodeURIComponent(message)}`, '_blank'); // Admin number or user phone if available
    } else {
      window.open(`mailto:${order.email}?subject=Projet Sur Mesure&body=${encodeURIComponent(message)}`, '_blank');
    }
  };

  return (
    <SheetContent className="sm:max-w-2xl w-full overflow-y-auto rounded-l-[40px] border-none shadow-2xl p-0 font-sans">
      <SheetHeader className="p-8 pb-4">
        <div className="flex items-center justify-between mb-4">
          <Badge className="bg-primary/10 text-primary border-none text-[10px] uppercase tracking-widest font-bold">Ref: {order.id}</Badge>
        </div>
        <SheetTitle className="text-3xl font-serif font-bold">{order.type}</SheetTitle>
        <SheetDescription>{order.customerName} • {order.dimensions}</SheetDescription>
      </SheetHeader>

      <div className="p-8 pt-4 pb-32 space-y-12">
        <section className="grid grid-cols-2 gap-8">
           <div className="space-y-4">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Finition</h3>
            <p className="font-bold text-lg">{order.finish}</p>
          </div>
           <div className="space-y-4 text-right">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Statut</h3>
             <Select
                value={statusValue}
                open={statusSelectOpen}
                onOpenChange={setStatusSelectOpen}
                onValueChange={async (val: any) => {
                  setStatusSelectOpen(false);
                  const previous = statusValue;
                  setStatusValue(val);
                  try {
                    await updateCustomOrderStatus(order.id, val);
                  } catch {
                    setStatusValue(previous);
                    toast.error('Impossible de mettre à jour le statut du projet sur mesure.');
                  }
                }}
              >
                <SelectTrigger className="w-[180px] h-11 rounded-xl bg-muted/30 border-none text-right">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-none shadow-xl">
                  <SelectItem value="Étude">Étude</SelectItem>
                  <SelectItem value="Fabrication">Fabrication</SelectItem>
                  <SelectItem value="Finition">Finition</SelectItem>
                  <SelectItem value="Prêt à livrer">Prêt à livrer</SelectItem>
                </SelectContent>
              </Select>
          </div>
        </section>

        <Separator className="opacity-50" />

        <section className="space-y-6">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Projet & Description</h3>
          <div className="bg-muted/20 p-6 rounded-3xl space-y-4">
            <p className="text-sm leading-relaxed italic">"{order.description}"</p>
            <div className="flex gap-4">
              <Badge variant="outline">Délai: {order.preferredDeadline}</Badge>
              <Badge variant="outline">Dimensions: {order.dimensions}</Badge>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Client</h3>
          <div className="flex items-center gap-4">
            <Mail className="h-5 w-5 text-muted-foreground" />
            <p className="font-bold">{order.email}</p>
          </div>
        </section>

        <SheetFooter className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md p-8 border-t flex gap-4">
          <Button variant="outline" className="flex-1 rounded-full h-14" onClick={() => handleContact('email')}>
            <Mail className="mr-2 h-4 w-4" /> Email
          </Button>
          <Button className="flex-[2] rounded-full h-14 text-lg font-bold" onClick={() => handleContact('whatsapp')}>
            <MessageSquare className="mr-2 h-5 w-5" /> WhatsApp
          </Button>
        </SheetFooter>
      </div>
    </SheetContent>
  );
}
