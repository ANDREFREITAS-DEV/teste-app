// src/app/order.controller.js
import { state } from "../core/state.js";
import { cartClear } from "../core/cart.store.js";

import { insertPedido, insertItensPedido } from "../infra/orders.repo.js";
import { calcTotals } from "../domain/totals.service.js";
import { buildWhatsappMessage } from "../domain/whatsapp.service.js";

/**
 * Pedido SEM offline.
 * Se não tiver internet → erro.
 */
export async function submitOrder(formData) {
  if (!navigator.onLine) {
    throw new Error("Sem internet. Conecte-se para enviar o pedido.");
  }

  const { nome, tel, rua, bairro, troco, obsGeral } = formData;

  if (!state.cart.length) throw new Error("Carrinho vazio.");
  if (!nome || !tel) throw new Error("Informe Nome e WhatsApp.");
  if (!state.paymentMethod) throw new Error("Selecione pagamento.");

  if (state.deliveryMode === "delivery" && (!rua || !bairro)) {
    throw new Error("Endereço obrigatório.");
  }

  // Totais oficiais
  const { sub, taxa, total } = calcTotals(
    state.cart,
    state.deliveryMode,
    state.storeConfig
  );

  const entregaTexto =
    state.deliveryMode === "delivery"
      ? "ENTREGA DELIVERY"
      : "RETIRAR NO BALCÃO";

  // 1) Pedido
  const { data: pedido, error: erroPedido } = await insertPedido({
    cliente_id: state.clienteId,

    nome_cliente: nome,
    telefone_cliente: tel,

    endereco_rua: state.deliveryMode === "delivery" ? rua : null,
    endereco_bairro: state.deliveryMode === "delivery" ? bairro : null,

    observacao: obsGeral || null,
    tipo_entrega: state.deliveryMode,

    pagamento_metodo: state.paymentMethod,
    pagamento_troco:
      state.paymentMethod === "Dinheiro" && troco
        ? parseFloat(troco)
        : 0,

    total,
    status: "novo",
  });

  if (erroPedido) throw erroPedido;

  const numeroPedido = pedido.numero_pedido;

  // 2) Itens
  const itens = state.cart.map((item) => ({
    pedido_id: pedido.id,
    produto_id: item.id,

    nome: item.nome,
    quantidade: item.qtd,
    preco: item.preco,
    total: item.preco * item.qtd,

    detalhes: item.obs || [],
  }));

  const { error: erroItens } = await insertItensPedido(itens);
  if (erroItens) throw erroItens;

  // 3) WhatsApp
  const msg = buildWhatsappMessage({
    codigo: numeroPedido,
    nome,
    tel,
    entregaTexto,
    rua: state.deliveryMode === "delivery" ? rua : "",
    bairro: state.deliveryMode === "delivery" ? bairro : "",
    itens: state.cart,
    subtotal: sub,
    taxa,
    total,
    pagamento: state.paymentMethod,
    troco: state.paymentMethod === "Dinheiro" ? troco : "",
    obsGeral,
  });

  // Limpa carrinho
  cartClear();

  return {
    numeroPedido,
    whatsappMessage: msg,
  };
}
