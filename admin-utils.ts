import { toast } from 'sonner';

/**
 * Simulates a CSV export for a given data array
 */
export const exportToCSV = (data: any[], filename: string) => {
  console.log(`Exporting ${data.length} items to ${filename}.csv`);
  toast.success(`Export ${filename}.csv réussi !`, {
    description: `${data.length} lignes traitées.`
  });
};

/**
 * Simulates PDF generation for an invoice
 */
export const generateInvoicePDF = (orderId: string) => {
  toast.promise(
    new Promise((resolve) => setTimeout(resolve, 1500)),
    {
      loading: `Génération de la facture ${orderId}...`,
      success: () => {
        return `Facture ${orderId}.pdf prête !`;
      },
      error: 'Erreur lors de la génération.',
    }
  );
};

/**
 * Simulates sending an email to a client
 */
export const sendAdminEmail = (to: string, subject: string) => {
  toast.success(`E-mail envoyé à ${to}`, {
    description: `Objet : ${subject}`
  });
};
