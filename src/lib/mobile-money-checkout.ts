export type CheckoutPaymentMethod = 'cash';

/** Montant à régler tout de suite (hors livraison). */
export function computeAmountDueNow(_finalTotal: number, _paymentMethod: CheckoutPaymentMethod): number {
  return 0;
}
