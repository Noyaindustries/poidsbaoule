import { WHATSAPP_STORE_DISPLAY } from '@/constants';
import type { Order } from '@/types';

export type CheckoutPaymentMethod = 'wave' | 'orange';

/** Numéro marchand affiché / encaissement (surcharge possible via `.env`). */
export function getMerchantPhoneDisplay(): string {
  const v = import.meta.env.VITE_PAYMENT_MERCHANT_PHONE_DISPLAY;
  return typeof v === 'string' && v.trim() ? v.trim() : WHATSAPP_STORE_DISPLAY;
}

/** Montant à régler tout de suite (hors livraison). */
export function computeAmountDueNow(
  finalTotal: number,
  paymentMethod: CheckoutPaymentMethod,
  paymentStrategy: 'FULL' | '50-50' | 'CASH'
): number {
  void paymentMethod;
  if (paymentStrategy === '50-50') return Math.round(finalTotal / 2);
  return finalTotal;
}

export function isMobileMoneyOperator(m: CheckoutPaymentMethod): m is 'wave' | 'orange' {
  return m === 'wave' || m === 'orange';
}

export function mapCheckoutPaymentToOrderMethod(m: CheckoutPaymentMethod): Order['paymentMethod'] {
  const table: Record<CheckoutPaymentMethod, Order['paymentMethod']> = {
    wave: 'Wave',
    orange: 'Orange Money',
  };
  return table[m];
}

export function getMobileMoneyInstructions(
  operator: 'wave' | 'orange',
  amountFcfa: number,
  customerName: string
): { headline: string; bullets: string[] } {
  const phone = getMerchantPhoneDisplay();
  const amt = `${amountFcfa.toLocaleString('fr-FR')} FCFA`;
  const ref = customerName.trim()
    ? `En libellé ou message, indiquez : « ${customerName.trim()} — POIDS BAOULÉ ».`
    : `En libellé ou message, indiquez : « POIDS BAOULÉ » + votre nom.`;

  switch (operator) {
    case 'wave':
      return {
        headline: `Payer ${amt} avec Wave`,
        bullets: [
          `Ouvrez l’application Wave sur votre téléphone.`,
          `Envoyez ${amt} au numéro ${phone} (compte boutique Poids Baoulé).`,
          ref,
          `Après paiement, confirmez la commande ; vous pouvez indiquer une référence de transaction (optionnel).`,
        ],
      };
    case 'orange':
      return {
        headline: `Payer ${amt} avec Orange Money`,
        bullets: [
          `Ouvrez l’application Orange Money ou le menu transfert sur votre ligne (selon votre forfait).`,
          `Transférez ${amt} vers le numéro ${phone}.`,
          ref,
          `Après paiement, confirmez la commande ; vous pouvez indiquer une référence de transaction (optionnel).`,
        ],
      };
    default:
      return { headline: '', bullets: [] };
  }
}
