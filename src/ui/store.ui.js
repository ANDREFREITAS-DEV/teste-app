import { $, show, hide } from "../core/dom.js";
import { state } from "../core/state.js";

export function applyStoreThemeAndHeader() {
  const cfg = state.storeConfig;

  const cor = cfg.cor_primaria || "#F97316";
  document.documentElement.style.setProperty("--theme-color", cor);

  $("#hero-header").style.backgroundColor = cor;
  $("#bottom-nav").style.backgroundColor = cor;
  $("#icon-cart-center").style.color = cor;

  $("#store-name").innerText = cfg.nome_fantasia || "Minha Loja";

  if (cfg.logo_url) $("#store-logo").src = cfg.logo_url;

  if (cfg.endereco) {
    const rua = cfg.endereco.split(",")[0];
    $("#header-address-short").innerText = rua;
  }
}

export function bindStoreInfoModal() {
  const modal = $("#modal-info");

  $("#btn-open-store").addEventListener("click", () => {
    const cfg = state.storeConfig;

    $("#info-logo").src = cfg.logo_url || "https://placehold.co/100";
    $("#info-name").innerText = cfg.nome_fantasia || "Minha Loja";
    $("#info-address").innerText = cfg.endereco || "Endereço não informado";
    $("#info-hours").innerText = cfg.horario_funcionamento || "Horário não informado";
    $("#info-phone").innerText = cfg.whatsapp ? `WhatsApp: ${cfg.whatsapp}` : "Contato não informado";

    show(modal);
  });

  $("#btn-close-info").addEventListener("click", () => hide(modal));

  modal.addEventListener("click", (e) => {
    if (e.target === modal) hide(modal);
  });
}
