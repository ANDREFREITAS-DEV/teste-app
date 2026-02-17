import { $ } from "../core/dom.js";
import { state } from "../core/state.js";
import { openProductModal } from "./product-modal.ui.js";
import { getCategorias, getProdutosAtivos } from "../infra/products.repo.js";

export async function loadAndRenderMenu() {
  const container = $("#menu-container");
  const tabsInner = $("#category-tabs-inner");

  const { data: categorias } = await getCategorias(state.clienteId);
  const { data: produtos } = await getProdutosAtivos(state.clienteId);

  if (!produtos?.length) {
    container.innerHTML = `<div class="text-center text-gray-400 py-10">Cardápio vazio.</div>`;
    return;
  }

  state.productsMap = {};

  /* ===============================
     1) Render Tabs
  ================================ */
  tabsInner.innerHTML = categorias
    .map(
      (cat, index) => `
        <button
          class="tab-btn ${index === 0 ? "active" : ""}"
          data-tab="${cat.id}"
        >
          ${cat.nome}
        </button>
      `
    )
    .join("");

  /* ===============================
     2) Render Menu Sections
  ================================ */
  let html = "";

  categorias.forEach((cat) => {
    const prods = produtos.filter((p) => p.categoria_id === cat.id);
    if (!prods.length) return;

    html += `
      <section
        class="mb-10 category-section"
        id="cat-${cat.id}"
      >
        <h3 class="font-bold text-xl text-gray-800 mb-4">
          ${cat.nome}
        </h3>

        <div class="grid grid-cols-1 gap-4">
          ${prods
            .map((p) => {
              state.productsMap[p.id] = p;
              const imgSafe = p.imagem_url || "https://placehold.co/150";

              return `
                <button
                  type="button"
                  data-product-id="${p.id}"
                  class="text-left bg-white p-3 rounded-2xl shadow-sm border flex gap-4 w-full"
                >
                  <img
                    src="${imgSafe}"
                    class="w-24 h-24 object-cover rounded-xl"
                  />

                  <div class="flex-1">
                    <h4 class="font-bold text-gray-900">${p.nome}</h4>
                    <p class="text-xs text-gray-500 mt-1 line-clamp-2">
                      ${p.descricao || ""}
                    </p>

                    <div class="flex justify-between items-end mt-2">
                      <span class="font-bold text-lg text-theme">
                        R$ ${p.preco.toFixed(2)}
                      </span>

                      <span
                        class="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center"
                      >
                        <i class="fa-solid fa-plus"></i>
                      </span>
                    </div>
                  </div>
                </button>
              `;
            })
            .join("")}
        </div>
      </section>
    `;
  });

  container.innerHTML = html;

  /* ===============================
     3) Click Produto → Modal
  ================================ */
  container.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-product-id]");
    if (!btn) return;

    const id = btn.getAttribute("data-product-id");
    const product = state.productsMap[id];

    if (product) openProductModal(product);
  });

  /* ===============================
     4) Tabs Scroll → Categoria
  ================================ */
  tabsInner.addEventListener("click", (e) => {
    const tab = e.target.closest("[data-tab]");
    if (!tab) return;

    const catId = tab.getAttribute("data-tab");

    // ativa visualmente
    tabsInner.querySelectorAll(".tab-btn").forEach((b) => {
      b.classList.remove("active");
    });
    tab.classList.add("active");

    // scroll suave
    document
      .getElementById("cat-" + catId)
      .scrollIntoView({ behavior: "smooth", block: "start" });
  });

  /* ===============================
     5) Scroll Spy (ativa tab ao rolar)
  ================================ */
  const sections = document.querySelectorAll(".category-section");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.id.replace("cat-", "");

          tabsInner.querySelectorAll(".tab-btn").forEach((b) => {
            b.classList.remove("active");
            if (b.dataset.tab === id) b.classList.add("active");
          });
        }
      });
    },
    { threshold: 0.4 }
  );

  sections.forEach((sec) => observer.observe(sec));
}
