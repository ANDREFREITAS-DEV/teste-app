import { state } from "./core/state.js";
import { loadCart } from "./core/storage.js";
import { toast } from "./core/dom.js";

import { getClienteBySlug } from "./infra/tenant.repo.js";
import { getStoreConfig } from "./infra/store-config.repo.js";


import { loadAndRenderMenu } from "./ui/menu.ui.js";
import { bindProductModal } from "./ui/product-modal.ui.js";
import { bindCartUI, updateBadge } from "./ui/cart.ui.js";

import { applyStoreThemeAndHeader, bindStoreInfoModal, bindHeaderShrink } from "./ui/store.ui.js";

import { syncPendingOrders } from "./domain/offline.service.js";


// ===============================
// ✅ DEV MODE AUTOMÁTICO (Preview)
// ===============================
const DEV_SLUG = window.location.hostname.includes("vercel.app")
  ? "sal-e-doce"
  : null;

function detectSlug() {
  const host = window.location.hostname;
  const slug = host.split(".")[0];

  if (!slug || slug === "www" || slug === "usezapflow") {
    throw new Error(
      "Abra pelo subdomínio da loja, ex: sal-e-doce.usezapflow.com.br"
    );
  }

  return slug;
}

document.addEventListener("DOMContentLoaded", async () => {
  console.log("🚀 ZapFlow iniciando...");

  try {
    state.cart = loadCart();

    // ✅ AQUI
    state.storeSlug = DEV_SLUG || detectSlug();

    console.log("🏪 SLUG USADO:", state.storeSlug);

    const { data: cliente, error: errCliente } =
      await getClienteBySlug(state.storeSlug);

    if (errCliente || !cliente) {
      throw new Error("Loja não encontrada: " + state.storeSlug);
    }

    state.clienteId = cliente.id;

    const { data: cfg } = await getStoreConfig(state.clienteId);
    state.storeConfig = cfg || {};

    applyStoreThemeAndHeader();

    bindStoreInfoModal();
    bindHeaderShrink(); // ✅ novo
    bindProductModal();
    bindCartUI();

    await loadAndRenderMenu();
    updateBadge();

    console.log("✅ App pronto!");

  } catch (e) {
    console.error("Erro fatal:", e);
    toast(e.message || "Erro fatal", false);
  }

  console.log("✅ App pronto!");

  // ✅ tenta sincronizar pedidos offline quando abrir (sem travar UI)
  syncPendingOrders();

  // ✅ sincroniza automaticamente quando internet voltar
  window.addEventListener("online", () => {
    syncPendingOrders();
  });

});
