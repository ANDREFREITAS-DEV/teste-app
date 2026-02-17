import { supabase } from "../supabaseClient.js";
import { CLIENTE_ID } from "./tenant.js";
import { openProductModal } from "../product-modal.js";

export let PRODUCTS_MAP = {};

export async function loadProducts() {
  const container = document.getElementById("menu-container");

  const { data: categorias } = await supabase
    .from("categorias")
    .select("*")
    .eq("cliente_id", CLIENTE_ID)
    .order("ordem");

  const { data: produtos } = await supabase
    .from("produtos")
    .select("*")
    .eq("cliente_id", CLIENTE_ID)
    .eq("ativo", true);

  if (!produtos?.length) {
    container.innerHTML =
      `<div class="text-center text-gray-400 py-10">Cardápio vazio.</div>`;
    return;
  }

  PRODUCTS_MAP = {};
  let html = "";

  categorias.forEach((cat) => {
    const prods = produtos.filter((p) => p.categoria_id === cat.id);
    if (!prods.length) return;

    html += `
      <div class="mb-8">
        <h3 class="font-bold text-xl text-gray-800 mb-4 sticky top-0 bg-gray-50 py-3 z-10 border-b">
          ${cat.nome}
        </h3>
        <div class="grid gap-4">
    `;

    html += prods
      .map((p) => {
        PRODUCTS_MAP[p.id] = p;
        const imgSafe = p.imagem_url || "https://placehold.co/150";

        return `
          <div onclick="window.handleProductClick('${p.id}')"
               class="bg-white p-3 rounded-2xl shadow-sm border flex gap-4 cursor-pointer">
            <img src="${imgSafe}" class="w-24 h-24 rounded-xl object-cover">
            <div class="flex-1">
              <h4 class="font-bold">${p.nome}</h4>
              <p class="text-xs text-gray-500 mt-1">
                ${p.descricao || ""}
              </p>
              <div class="font-bold text-lg mt-2 text-theme">
                R$ ${p.preco.toFixed(2)}
              </div>
            </div>
          </div>
        `;
      })
      .join("");

    html += `</div></div>`;
  });

  container.innerHTML = html;
}

window.handleProductClick = (id) => {
  if (PRODUCTS_MAP[id]) openProductModal(PRODUCTS_MAP[id]);
};
