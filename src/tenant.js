import { supabase } from "../supabaseClient.js";

export let CLIENTE_ID = null;
export let STORE_SLUG = null;
export let STORE_CONFIG = {};

export async function detectTenant() {
  const host = window.location.hostname;
  STORE_SLUG = host.split(".")[0];

  console.log("🏪 Loja detectada:", STORE_SLUG);

  if (!STORE_SLUG || STORE_SLUG === "www" || STORE_SLUG === "usezapflow") {
    throw new Error(
      "Abra pelo subdomínio da loja, ex: real-racao.usezapflow.com.br"
    );
  }

  const { data: cliente, error } = await supabase
    .from("clientes")
    .select("id, nome_fantasia")
    .eq("slug", STORE_SLUG)
    .single();

  if (error || !cliente) {
    throw new Error("Loja não encontrada: " + STORE_SLUG);
  }

  CLIENTE_ID = cliente.id;
  console.log("✅ Cliente carregado:", cliente.nome_fantasia);
}

export async function loadStoreConfig() {
  const { data } = await supabase
    .from("config_loja")
    .select("*")
    .eq("cliente_id", CLIENTE_ID)
    .single();

  if (!data) return;

  STORE_CONFIG = data;

  // Tema dinâmico
  const cor = data.cor_primaria || "#F97316";
  document.documentElement.style.setProperty("--theme-color", cor);

  document.getElementById("hero-header").style.backgroundColor = cor;
  document.getElementById("bottom-nav").style.backgroundColor = cor;
  document.getElementById("icon-cart-center").style.color = cor;

  // Nome e logo
  document.getElementById("store-name").innerText = data.nome_fantasia;
  if (data.logo_url) document.getElementById("store-logo").src = data.logo_url;

  // Endereço curto
  if (data.endereco) {
    document.getElementById("header-address-short").innerText =
      data.endereco.split(",")[0];
  }

  // Pix
  if (data.chave_pix) {
    document.getElementById("store-pix-key").value = data.chave_pix;
  }
}
