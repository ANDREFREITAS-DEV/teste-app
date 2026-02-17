import { subtotal } from "./cart.service.js";

export function calcTotals(cart, deliveryMode, storeConfig) {
  const sub = subtotal(cart);
  const taxa = deliveryMode === "delivery" ? (storeConfig.taxa_entrega || 0) : 0;
  const total = sub + taxa;
  return { sub, taxa, total };
}
