export function makeCartItem({ id, nome, preco, img, obs = [], qtd = 1 }) {
  const cartItemId = `${id}-${JSON.stringify(obs)}`;
  return { id, cartItemId, nome, preco, img, obs, qtd };
}

export function addToCart(cart, item) {
  const existing = cart.find(x => x.cartItemId === item.cartItemId);
  if (existing) existing.qtd += item.qtd;
  else cart.push(item);
  return cart;
}

export function removeAt(cart, idx) {
  cart.splice(idx, 1);
  return cart;
}

export function changeQty(cart, idx, delta) {
  const it = cart[idx];
  if (!it) return cart;
  it.qtd += delta;
  if (it.qtd <= 0) cart.splice(idx, 1);
  return cart;
}

export function subtotal(cart) {
  return cart.reduce((acc, i) => acc + i.preco * i.qtd, 0);
}
