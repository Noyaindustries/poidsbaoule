import { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Search, Filter, Download, FileText, 
  Send, Eye, MoreVertical, CheckCircle2, 
  Clock, AlertCircle, Printer, Mail, 
  CreditCard, History, LayoutDashboard
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuTrigger, DropdownMenuSeparator 
} from '@/components/ui/dropdown-menu';
import { useOrders } from '@/lib/OrderContext';
import { generateInvoicePDF } from '@/lib/admin-utils';

export default function InvoiceList() {
  const [searchQuery, setSearchQuery] = useState('');
  const { orders } = useOrders();

  const handleDownload = (id: string) => {
    generateInvoicePDF(id);
  };

  // Process invoices from real orders
  const invoices = orders
    .filter(o => 
      o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .map(o => ({
      id: o.id,
      client: o.customerName,
      date: new Date(o.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }),
      amount: o.total,
      status: o.status === 'Livrée' || o.status === 'Paiement reçu' ? 'Payée' : 
              o.amountPaid > 0 ? 'Partiel' : 'En attente',
      method: o.paymentMethod,
      balanceDue: o.balanceDue
    }));

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const monthlyCA = orders
    .filter(o => {
      const d = new Date(o.createdAt);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    })
    .reduce((sum, o) => sum + o.amountPaid, 0);

  const paidFactures = orders.filter(o => o.status === 'Livrée' || o.status === 'Paiement reçu').length;
  const pendingAmount = orders.reduce((sum, o) => sum + o.balanceDue, 0);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Rechercher une facture..." 
            className="pl-10 rounded-full bg-card border-none shadow-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-full shadow-sm">
            <Filter className="mr-2 h-4 w-4" /> Filtres
          </Button>
          <Button variant="outline" className="rounded-full shadow-sm">
             <Download className="mr-2 h-4 w-4" /> Exporter PDF
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <RevenueCard label="CA du mois" value={`${monthlyCA.toLocaleString()} F`} sub="Données réelles" />
        <RevenueCard label="Factures Réglées" value={paidFactures.toString()} sub={`${orders.length > 0 ? ((paidFactures / orders.length) * 100).toFixed(0) : 0}% du total`} />
        <RevenueCard label="En attente" value={`${pendingAmount.toLocaleString()} F`} sub="Solde restant à percevoir" color="destructive" />
      </div>

      <Card className="rounded-[32px] border-none shadow-sm overflow-hidden text-sans text-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-muted/50 text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground">
                <tr>
                  <th className="px-8 py-4">N° Facture</th>
                  <th className="px-8 py-4">Client</th>
                  <th className="px-8 py-4">Date Émission</th>
                  <th className="px-8 py-4">Montant</th>
                  <th className="px-8 py-4">Mode</th>
                  <th className="px-8 py-4">Statut</th>
                  <th className="px-8 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {invoices.length > 0 ? invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-muted/20 transition-colors group">
                    <td className="px-8 py-6 font-bold text-xs">{inv.id}</td>
                    <td className="px-8 py-6">{inv.client}</td>
                    <td className="px-8 py-6 text-muted-foreground">{inv.date}</td>
                    <td className="px-8 py-6 font-bold font-sans">{inv.amount.toLocaleString()} F</td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 text-[10px]">
                        <CreditCard className="h-3 w-3 text-muted-foreground" />
                        <span>{inv.method}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <Badge className={`rounded-full px-3 py-1 border-none text-[10px] font-bold ${
                        inv.status === 'Payée' ? 'bg-green-100 text-green-700' : 
                        inv.status === 'Partiel' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {inv.status}
                      </Badge>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => handleDownload(inv.id)} title="Générer Facture PDF"><FileText className="h-4 w-4" /></Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger 
                            render={
                              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full"><MoreVertical className="h-4 w-4" /></Button>
                            }
                          />
                          <DropdownMenuContent align="end" className="rounded-2xl">
                             <DropdownMenuItem className="p-3 gap-3 rounded-xl"><Printer className="h-4 w-4" /> Imprimer</DropdownMenuItem>
                             <DropdownMenuItem className="p-3 gap-3 rounded-xl"><Mail className="h-4 w-4" /> Envoyer par mail</DropdownMenuItem>
                             <DropdownMenuSeparator />
                             <DropdownMenuItem className="p-3 gap-3 rounded-xl text-destructive"><AlertCircle className="h-4 w-4" /> Signaler Erreur</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={7} className="px-8 py-20 text-center text-muted-foreground italic">Aucune facture disponible.</td>
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

function RevenueCard({ label, value, sub, color }: { label: string, value: string, sub: string, color?: string }) {
  return (
    <Card className="rounded-[30px] border-none shadow-sm">
      <CardContent className="p-8 space-y-4">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">{label}</p>
        <p className={`text-4xl font-serif font-bold ${color === 'destructive' ? 'text-destructive' : 'text-primary'}`}>{value}</p>
        <p className="text-[10px] text-muted-foreground font-bold italic">{sub}</p>
      </CardContent>
    </Card>
  );
}
