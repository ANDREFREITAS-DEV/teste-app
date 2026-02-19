import { $, $$, show, hide, toast } from "../core/dom.js";

import { getGruposOpcionaisByProduto } from "../infra/optionals.repo.js";

import { makeCartItem } from "../domain/cart.service.js";
import { cartAdd } from "../core/cart.store.js";


let CURRENT_PRODUCT = null;
let SELECTED_OPTIONS = [];
let ITEM_QTD = 1;

export function bindProductModal() {
  $("#btn-close-product").addEventListener("click", closeProductModal);
  $("#btn-modal-qtd-minus").addEventListener("click", () => changeQtd(-1));
  $("#btn-modal-qtd-plus").addEventListener("click", () => changeQtd(1));
  $("#btn-add-modal").addEventListener("click", confirmAdd);

  $("#modal-product").addEventListener("click", (e) => {
    if (e.target.id === "modal-product") closeProductModal();
  });

  $("#p-modal-options").addEventListener("change", () => {
    enforceMaxSelections();
    updateTotalsAndButton();
  });
}

export async function openProductModal(product) {
  document.body.style.cursor = "wait";

  try {
    const { data: grupos, error } = await getGruposOpcionaisByProduto(product.id);
    document.body.style.cursor = "default";

    // Produto simples: adiciona direto
    if (error || !grupos || grupos.length === 0) {
      addSimple(product);
      return;
    }

    CURRENT_PRODUCT = product;
    ITEM_QTD = 1;
    SELECTED_OPTIONS = [];

    $("#p-modal-img").src = product.imagem_url || "https://placehold.co/300";
    $("#p-modal-title").innerText = product.nome;
    $("#p-modal-desc").innerText = product.descricao || "";
    $("#p-modal-price").innerText = `R$ ${product.preco.toFixed(2)}`;
    $("#p-modal-qtd").innerText = "1";

    renderGroups(grupos);
    updateTotalsAndButton();

    show($("#modal-product"));
  } catch (e) {
    console.error(e);
    document.body.style.cursor = "default";
    addSimple(product);
  }
}

function addSimple(product) {
  const item = makeCartItem({
    id: product.id,
    nome: product.nome,
    preco: product.preco,
    img: product.imagem_url || "https://placehold.co/150",
    obs: [],
    qtd: 1
  });

  cartAdd(item);
  toast("Adicionado ao carrinho!");

}

function renderGroups(grupos) {
  const container = $("#p-modal-options");

  container.innerHTML = (grupos || []).map((grupo) => {
    const tipo = (grupo.minimo === 1 && grupo.maximo === 1) ? "radio" : "checkbox";
    const obrigatorio = grupo.minimo > 0;

    return `
      <div class="mb-6 border-b border-gray-100 pb-4 last:border-0 group-container"
        data-group-id="${grupo.id}"
        data-min="${grupo.minimo}"
        data-max="${grupo.maximo}">
        <div class="flex justify-between items-center mb-3">
          <div>
            <h4 class="font-bold text-gray-800">${grupo.nome}</h4>
            <p class="text-xs text-gray-500">
              ${obrigatorio ? `Escolha mín. ${grupo.minimo}` : "Opcional"}
              ${grupo.maximo > 1 ? `(até ${grupo.maximo})` : ""}
            </p>
          </div>
          ${obrigatorio
            ? `<span class="bg-gray-800 text-white text-[10px] px-2 py-0.5 rounded uppercase font-bold">Obrigatório</span>`
            : `<span class="bg-gray-200 text-gray-600 text-[10px] px-2 py-0.5 rounded uppercase font-bold">Opcional</span>`
          }
        </div>

        <div class="space-y-2">
          ${(grupo.opcionais || []).map((op) => `
            <label class="flex items-center justify-between p-3 rounded-xl border border-gray-100 bg-white hover:bg-gray-50 cursor-pointer transition select-none">
              <div class="flex items-center gap-3">
                <input
                  type="${tipo}"
                  name="group_${grupo.id}"
                  value="${op.id}"
                  data-price="${op.preco_adicional}"
                  data-name="${op.nome}"
                  class="w-5 h-5 text-orange-600 focus:ring-orange-500 border-gray-300"
                />
                <span class="text-sm font-medium text-gray-700">${op.nome}</span>
              </div>

              <span class="text-sm font-bold text-gray-900">
                ${op.preco_adicional > 0 ? `+ R$ ${op.preco_adicional.toFixed(2)}` : "Grátis"}
              </span>
            </label>
          `).join("")}
        </div>

        <div class="msg-error text-red-500 text-xs font-bold mt-2 hidden animate-pulse">
          <i class="fa-solid fa-circle-exclamation mr-1"></i>
          Selecione as opções obrigatórias acima.
        </div>
      </div>
    `;
  }).join("");
}

function enforceMaxSelections() {
  const groups = $$(".group-container", $("#p-modal-options"));

  groups.forEach((g) => {
    const max = parseInt(g.dataset.max || "0", 10);
    const name = `group_${g.dataset.groupId}`;
    const inputs = $$(`input[name="${name}"]`, g);

    // Para checkbox, limitar max
    const checked = inputs.filter(i => i.checked);
    if (inputs[0]?.type === "checkbox" && max > 0 && checked.length > max) {
      // desmarca o último que foi marcado (aproximação: desmarca o último checked)
      const last = checked[checked.length - 1];
      last.checked = false;
      toast(`Máximo de ${max} opções neste grupo!`, false);
    }
  });
}

function changeQtd(delta) {
  ITEM_QTD += delta;
  if (ITEM_QTD < 1) ITEM_QTD = 1;
  $("#p-modal-qtd").innerText = String(ITEM_QTD);
  updateTotalsAndButton();
}

function updateTotalsAndButton() {
  if (!CURRENT_PRODUCT) return;

  SELECTED_OPTIONS = [];
  let optionsTotal = 0;

  const checked = $$("#p-modal-options input:checked");
  checked.forEach((input) => {
    const price = parseFloat(input.dataset.price || "0");
    const groupContainer = input.closest(".group-container");
    const groupTitle = groupContainer?.querySelector("h4")?.innerText || "Opções";

    SELECTED_OPTIONS.push({
      grupo: groupTitle,
      nome: input.dataset.name,
      preco: price,
    });

    optionsTotal += price;
  });

  const unit = CURRENT_PRODUCT.preco + optionsTotal;
  const total = unit * ITEM_QTD;

  const isValid = validateRequiredGroups();

  const btn = $("#btn-add-modal");
  if (isValid) {
    btn.disabled = false;
    btn.classList.remove("bg-gray-400");
    btn.classList.add("bg-green-600");
    btn.innerHTML = `
      <div class="flex justify-between w-full">
        <span>Adicionar</span>
        <span>R$ ${total.toFixed(2)}</span>
      </div>
    `;
  } else {
    btn.disabled = false;
    btn.classList.remove("bg-green-600");
    btn.classList.add("bg-gray-400");
    btn.innerHTML = `<span class="w-full text-center text-white">Selecione obrigatórios</span>`;
  }
}

function validateRequiredGroups() {
  const groups = $$(".group-container", $("#p-modal-options"));
  let ok = true;

  groups.forEach((g) => {
    const min = parseInt(g.dataset.min || "0", 10);
    const msg = $(".msg-error", g);

    msg?.classList.add("hidden");
    g.classList.remove("border-red-300", "bg-red-50");

    if (min > 0) {
      const name = `group_${g.dataset.groupId}`;
      const checked = $$(`input[name="${name}"]:checked`, g);
      if (checked.length < min) ok = false;
    }
  });

  if (!ok) showValidationErrors();
  return ok;
}

function showValidationErrors() {
  const groups = $$(".group-container", $("#p-modal-options"));
  let first = null;

  groups.forEach((g) => {
    const min = parseInt(g.dataset.min || "0", 10);
    if (min <= 0) return;

    const name = `group_${g.dataset.groupId}`;
    const checked = $$(`input[name="${name}"]:checked`, g);
    if (checked.length < min) {
      g.classList.add("border-red-300", "bg-red-50");
      $(".msg-error", g)?.classList.remove("hidden");
      if (!first) first = g;
    }
  });

  if (first) first.scrollIntoView({ behavior: "smooth", block: "center" });
}

function confirmAdd() {
  if (!CURRENT_PRODUCT) return;

  // valida de novo, sem “gambiarra”
  const ok = validateRequiredGroups();
  if (!ok) {
    toast("Faltam opções obrigatórias!", false);
    return;
  }

  const optionsTotal = SELECTED_OPTIONS.reduce((acc, o) => acc + o.preco, 0);
  const finalUnit = CURRENT_PRODUCT.preco + optionsTotal;

  const item = makeCartItem({
    id: CURRENT_PRODUCT.id,
    nome: CURRENT_PRODUCT.nome,
    preco: finalUnit,
    img: CURRENT_PRODUCT.imagem_url || "https://placehold.co/150",
    obs: SELECTED_OPTIONS.map(o => ({ grupo: o.grupo, nome: o.nome, preco: o.preco })),
    qtd: ITEM_QTD
  });

  cartAdd(item);

  toast("Adicionado ao carrinho!");
  closeProductModal();

}

function closeProductModal() {
  hide($("#modal-product"));
  CURRENT_PRODUCT = null;
  SELECTED_OPTIONS = [];
  ITEM_QTD = 1;
}
