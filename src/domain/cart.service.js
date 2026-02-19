// src/domain/cart.service.js
// =======================================
// DOMAIN PURO: apenas estrutura e helpers
// (não altera state.cart, não faz push/splice)
// =======================================

export function makeCartItem({ id, nome, preco, img, obs = [], qtd = 1 }) {
  // cartItemId garante que opcionais diferentes viram itens diferentes
  const cartItemId = `${id}-${JSON.stringify(obs)}`;

  return {
    id,
    cartItemId,
    nome,
    preco,
    img,
    obs,
    qtd,
  };
}

// Helper opcional (a store já calcula total também)
export function subtotal(cart) {
  return cart.reduce((acc, i) => acc + i.preco * i.qtd, 0);
}
