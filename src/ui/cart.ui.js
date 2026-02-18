import { $, show, hide, toast } from "../core/dom.js";
import { state } from "../core/state.js";
import { saveCart } from "../core/storage.js";
import { changeQty, removeAt } from "../domain/cart.service.js";
import { calcTotals } from "../domain/totals.service.js";
import { buildWhatsappMessage } from "../domain/whatsapp.service.js";
import { insertPedido, insertItensPedido } from "../infra/orders.repo.js";
import { enqueueOrder } from "../core/offline-queue.js"

export function bindCartUI() {
  $("#btn-cart-center").addEventListener("click", openCart);
  $("#btn-close-cart").addEventListener("click", closeCart);

  $("#modal-cart").addEventListener("click", (e) => {
    if (e.target.id === "modal-cart") closeCart();
  });

  // Scroll top
  $("#btn-scroll-top").addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  // Delegação botões do carrinho
  $("#cart-items").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-action]");
    if (!btn) return;

    const action = btn.getAttribute("data-action");
    const idx = parseInt(btn.getAttribute("data-idx"), 10);

    if (Number.isNaN(idx)) return;

    if (action === "minus") changeQty(state.cart, idx, -1);
    if (action === "plus") changeQty(state.cart, idx, 1);
    if (action === "remove") removeAt(state.cart, idx);

    saveCart(state.cart);
    renderCart();
    updateBadge();
  });

  // Entrega / retirada
  $("#btn-delivery").addEventListener("click", () => setDeliveryMode("delivery"));
  $("#btn-pickup").addEventListener("click", () => setDeliveryMode("pickup"));

  // Pagamento
  $("#pay-pix").addEventListener("click", () => selectPayment("Pix"));
  $("#pay-money").addEventListener("click", () => selectPayment("Dinheiro"));
  $("#pay-card").addEventListener("click", () => selectPayment("Cartão"));

  // Pix copy
  $("#btn-copy-pix").addEventListener("click", copyPix);

  // Enviar pedido
  $("#btn-send").addEventListener("click", finalizarPedido);
}

export function updateBadge() {
  const total = state.cart.reduce((acc, i) => acc + i.preco * i.qtd, 0);
  const badge = $("#nav-cart-price");

  if (state.cart.length > 0) {
    badge.innerText = `R$ ${total.toFixed(2)}`;
    badge.classList.remove("hidden");

    // ✅ ativa animação
    badge.classList.add("pulse-badge");
  } else {
    badge.classList.add("hidden");

    // remove animação
    badge.classList.remove("pulse-badge");
  }

}

export function openCart() {
  renderCart();
  updateTotalsUI();
  show($("#modal-cart"));
}

export function closeCart() {
  hide($("#modal-cart"));
}

export function renderCart() {
  const container = $("#cart-items");

  if (!state.cart.length) {
    container.innerHTML = `<div class="text-center py-10 text-gray-400">Carrinho vazio</div>`;
    updateTotalsUI();
    return;
  }

  container.innerHTML = state.cart.map((item, idx) => `
    <div class="flex gap-3 bg-white p-2 rounded-xl border items-center">
      <img src="${item.img}" class="w-16 h-16 rounded-lg object-cover" alt="${item.nome}">
      <div class="flex-1">
        <h4 class="font-bold text-sm">${item.nome}</h4>

        ${
          item.obs?.length
            ? `<ul class="text-[10px] text-gray-500 mt-1 space-y-1">
                ${item.obs.map(o => `
                  <li>↳ ${o.nome} ${o.preco > 0 ? `( +R$ ${o.preco.toFixed(2)} )` : ""}</li>
                `).join("")}
              </ul>`
            : ""
        }

        <div class="flex items-center gap-2 mt-2">
          <button data-action="minus" data-idx="${idx}" class="px-2 py-1 rounded bg-gray-100">-</button>
          <span class="font-bold">${item.qtd}</span>
          <button data-action="plus" data-idx="${idx}" class="px-2 py-1 rounded bg-gray-100">+</button>

          <button data-action="remove" data-idx="${idx}" class="ml-auto text-red-500 px-2 py-1 rounded bg-red-50">
            🗑
          </button>
        </div>
      </div>
    </div>
  `).join("");

  updateTotalsUI();
}

function setDeliveryMode(mode) {
  state.deliveryMode = mode;

  if (mode === "delivery") {
    $("#address-group").classList.remove("hidden");
    $("#btn-delivery").classList.add("active-choice");
    $("#btn-pickup").classList.remove("active-choice");
  } else {
    $("#address-group").classList.add("hidden");
    $("#btn-pickup").classList.add("active-choice");
    $("#btn-delivery").classList.remove("active-choice");
  }

  updateTotalsUI();
}

function selectPayment(method) {
  state.paymentMethod = method;

  const fieldPix = $("#field-pix");
  const fieldTroco = $("#field-troco");

  fieldPix.classList.add("hidden");
  fieldTroco.classList.add("hidden");

  if (method !== "Dinheiro") $("#input-troco").value = "";

  // reset buttons
  ["pay-pix","pay-money","pay-card"].forEach(id => {
    const b = $("#" + id);
    b.classList.remove("border-orange-500","bg-orange-50","ring-2","ring-orange-400");
    b.classList.add("border-gray-200","bg-white");
  });

  const activeId = method === "Pix" ? "pay-pix" : method === "Dinheiro" ? "pay-money" : "pay-card";
  const active = $("#" + activeId);
  active.classList.remove("border-gray-200","bg-white");
  active.classList.add("border-orange-500","bg-orange-50","ring-2","ring-orange-400");

  if (method === "Pix") fieldPix.classList.remove("hidden");
  if (method === "Dinheiro") fieldTroco.classList.remove("hidden");

  toast(`Pagamento: ${method}`);
}

function updateTotalsUI() {
  const { sub, taxa, total } = calcTotals(state.cart, state.deliveryMode, state.storeConfig);

  $("#resumo-subtotal").innerText = `R$ ${sub.toFixed(2)}`;
  $("#resumo-taxa").innerText = `R$ ${taxa.toFixed(2)}`;
  $("#resumo-total").innerText = `R$ ${total.toFixed(2)}`;
}

function copyPix() {
  const pixInput = $("#store-pix-key");

  if (!pixInput.value || pixInput.value === "Carregando...") {
    toast("Pix não configurado!", false);
    return;
  }

  navigator.clipboard.writeText(pixInput.value);
  toast("Chave Pix copiada!");
}

async function finalizarPedido() {
  // captura campos
  const val = (id) => ($("#" + id)?.value || "").trim();

  const nome   = val("input-nome");
  const tel    = val("input-tel");
  const rua    = val("input-rua");
  const bairro = val("input-bairro");
  const troco  = val("input-troco");
  const obsGeral = val("input-obs-geral");

  if (!state.cart.length) return toast("Carrinho vazio!", false);
  if (!nome || !tel) return toast("Informe Nome e WhatsApp!", false);

  if (state.deliveryMode === "delivery" && (!rua || !bairro)) {
    return toast("Endereço obrigatório!", false);
  }

  if (!state.paymentMethod) return toast("Selecione pagamento!", false);

  const btn = $("#btn-send");
  const original = btn.innerText;
  btn.innerText = "Enviando...";
  btn.disabled = true;

  try {
    const { sub, taxa, total } = calcTotals(state.cart, state.deliveryMode, state.storeConfig);

    const entregaTexto = state.deliveryMode === "delivery" ? "ENTREGA DELIVERY" : "RETIRAR NO BALCÃO";
    const codigo = Math.floor(1000 + Math.random() * 9000).toString();


    // ===============================
  // ✅ OFFLINE MODE (Fila local)
  // ===============================
  if (!navigator.onLine) {
    enqueueOrder({
      pedidoPayload: {
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

        total: total,
        status: "pendente_offline",
        codigo: codigo,
      },

      itensPayload: state.cart.map((item) => ({
        produto_id: item.id,
        nome: item.nome,
        quantidade: item.qtd,
        preco: item.preco,
        total: item.preco * item.qtd,
        obs: "",
        detalhes: item.obs || [],
      })),
    });

    toast("📦 Pedido salvo offline! Será enviado quando voltar internet.");

    // limpa carrinho
    state.cart = [];
    saveCart(state.cart);
    updateBadge();
    renderCart();
    closeCart();

    // limpa obs
    $("#input-obs-geral").value = "";

    // ✅ destrava botão imediatamente
    btn.innerText = original;
    btn.disabled = false;

    return;
  }


    // 1) pedido
    const { data: pedido, error: erroPedido } = await insertPedido({
      cliente_id: state.clienteId,

      nome_cliente: nome,
      telefone_cliente: tel,

      endereco_rua: state.deliveryMode === "delivery" ? rua : null,
      endereco_bairro: state.deliveryMode === "delivery" ? bairro : null,

      observacao: obsGeral || null,
      tipo_entrega: state.deliveryMode,

      pagamento_metodo: state.paymentMethod,
      pagamento_troco: (state.paymentMethod === "Dinheiro" && troco) ? parseFloat(troco) : 0,

      total: total,
      status: "novo",
      codigo: codigo,
    });

    if (erroPedido) throw erroPedido;

    // 2) itens
    const itens = state.cart.map((item) => ({
      pedido_id: pedido.id,
      produto_id: item.id,

      nome: item.nome,
      quantidade: item.qtd,
      preco: item.preco,
      total: item.preco * item.qtd,

      obs: "",
      detalhes: item.obs || [],
    }));

    const { error: erroItens } = await insertItensPedido(itens);
    if (erroItens) throw erroItens;

    // 3) whatsapp
    const msg = buildWhatsappMessage({
      codigo,
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
      troco: (state.paymentMethod === "Dinheiro" ? troco : ""),
      obsGeral
    });

    // limpar carrinho
    state.cart = [];
    saveCart(state.cart);
    updateBadge();
    renderCart();
    closeCart();

    $("#input-obs-geral").value = "";

    toast("Pedido enviado com sucesso!");

    const zap = state.storeConfig.whatsapp;
    const linkZap = `https://wa.me/55${zap}?text=${encodeURIComponent(msg)}`;
    window.open(linkZap, "_blank");

  } catch (e) {
    console.error("Erro Pedido:", e);
    toast("Erro ao enviar: " + (e.message || "erro"), false);
  } finally {
    btn.innerText = original;
    btn.disabled = false;
  }
}
