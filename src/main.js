import { state } from "./core/state.js";
import { loadCart } from "./core/storage.js";
import { toast } from "./core/dom.js";

import { getClienteBySlug } from "./infra/tenant.repo.js";
import { getStoreConfig } from "./infra/store-config.repo.js";

import { applyStoreThemeAndHeader, bindStoreInfoModal } from "./ui/store.ui.js";
import { loadAndRenderMenu } from "./ui/menu.ui.js";
import { bindProductModal } from "./ui/product-modal.ui.js";
import { bindCartUI, updateBadge } from "./ui/cart.ui.js";

function detectSlug() {
  const host = window.location.hostname;
  const slug = host.split(".")[0];

  if (!slug || slug === "www" || slug === "usezapflow") {
    throw new Error("Abra pelo subdomínio da loja, ex: real-racao.usezapflow.com.br");
  }

  return slug;
}

document.addEventListener("DOMContentLoaded", async () => {
  console.log("🚀 ZapFlow (Etapa 2) iniciando...");

  try {
    // estado inicial
    state.cart = loadCart();

    // tenant
    state.storeSlug = detectSlug();

    const { data: cliente, error: errCliente } = await getClienteBySlug(state.storeSlug);
    if (errCliente || !cliente) throw new Error("Loja não encontrada: " + state.storeSlug);

    state.clienteId = cliente.id;

    // config
    const { data: cfg } = await getStoreConfig(state.clienteId);
    state.storeConfig = cfg || {};

    applyStoreThemeAndHeader();

    // binds (sem window.*)
    bindStoreInfoModal();
    bindProductModal();
    bindCartUI();

    // menu
    await loadAndRenderMenu();

    // badge
    updateBadge();

    // preencher pix se tiver
    // (já vem no applyStoreThemeAndHeader via DOM no store.ui)
    console.log("✅ App pronto.");

  } catch (e) {
    console.error("Erro fatal:", e);
    toast(e.message || "Erro fatal", false);
  }
});
