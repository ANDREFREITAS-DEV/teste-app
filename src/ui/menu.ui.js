import { $ } from "../core/dom.js";
import { state } from "../core/state.js";
import { openProductModal } from "./product-modal.ui.js";
import { getCategorias, getProdutosAtivos } from "../infra/products.repo.js";

export async function loadAndRenderMenu() {
  const container = $("#menu-container");

  const { data: categorias, error: errCat } = await getCategorias(state.clienteId);
  if (errCat) console.error(errCat);

  const { data: produtos, error: errProd } = await getProdutosAtivos(state.clienteId);
  if (errProd) console.error(errProd);

  if (!produtos?.length) {
    container.innerHTML = `<div class="text-center text-gray-400 py-10">Cardápio vazio.</div>`;
    return;
  }

  state.productsMap = {};
  let html = "";

  (categorias || []).forEach((cat) => {
    const prods = produtos.filter((p) => p.categoria_id === cat.id);
    if (!prods.length) return;

    html += `
      <div class="mb-8">
        <h3 class="font-bold text-xl text-gray-800 mb-4 sticky top-0 bg-gray-50 py-3 z-10 border-b border-gray-100">
          ${cat.nome}
        </h3>
        <div class="grid grid-cols-1 gap-4">
    `;

    html += prods.map((p) => {
      state.productsMap[p.id] = p;
      const imgSafe = p.imagem_url || "https://placehold.co/150";

      return `
        <button type="button"
          data-product-id="${p.id}"
          class="text-left bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex gap-4 cursor-pointer w-full">
          <img src="${imgSafe}" class="w-24 h-24 object-cover rounded-xl bg-gray-100" alt="${p.nome}">
          <div class="flex flex-col justify-between flex-1 py-1">
            <div>
              <h4 class="font-bold text-gray-900">${p.nome}</h4>
              <p class="text-xs text-gray-500 mt-1 line-clamp-2">${p.descricao || ""}</p>
            </div>
            <div class="flex justify-between items-end mt-2">
              <div class="font-bold text-lg text-theme">R$ ${p.preco.toFixed(2)}</div>
              <span class="w-8 h-8 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center">
                <i class="fa-solid fa-plus"></i>
              </span>
            </div>
          </div>
        </button>
      `;
    }).join("");

    html += `</div></div>`;
  });

  container.innerHTML = html;

  // Click delegado (sem window.*)
  container.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-product-id]");
    if (!btn) return;
    const id = btn.getAttribute("data-product-id");
    const product = state.productsMap[id];
    if (product) openProductModal(product);
  });
}
