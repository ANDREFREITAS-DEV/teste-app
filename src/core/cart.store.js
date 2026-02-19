// src/core/cart.store.js
import { state } from "./state.js";
import { saveCart } from "./storage.js";

let listeners = [];

// UI se registra aqui
export function subscribeCart(fn) {
  listeners.push(fn);
}

// Sempre que carrinho muda:
function notify() {
  saveCart(state.cart);

  const total = state.cart.reduce(
    (acc, i) => acc + i.preco * i.qtd,
    0
  );

  listeners.forEach((fn) => fn(state.cart, total));
}

// ===============================
// API ÚNICA DO CARRINHO
// ===============================

export function cartAdd(item) {
  const existing = state.cart.find((i) => i.id === item.id);

  if (existing) {
    existing.qtd += item.qtd || 1;
  } else {
    state.cart.push(item);
  }

  notify();
}

export function cartChangeQty(idx, delta) {
  const item = state.cart[idx];
  if (!item) return;

  item.qtd += delta;

  if (item.qtd <= 0) {
    state.cart.splice(idx, 1);
  }

  notify();
}

export function cartRemove(idx) {
  state.cart.splice(idx, 1);
  notify();
}

export function cartClear() {
  state.cart = [];
  notify();
}

// 🔥 Força atualização inicial do carrinho carregado do storage
export function cartHydrate() {
  notify();
}
