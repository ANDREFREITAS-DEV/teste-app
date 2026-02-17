import { supabase } from "../supabaseClient.js";
import { CART, saveCart, updateCartUI } from "./cart.js";
import { CLIENTE_ID, STORE_CONFIG } from "./tenant.js";

export async function finalizarPedido() {
  if (!CART.length) {
    alert("Carrinho vazio!");
    return;
  }

  const nome = document.getElementById("input-nome").value.trim();
  const tel = document.getElementById("input-tel").value.trim();

  if (!nome || !tel) {
    alert("Informe Nome e WhatsApp!");
    return;
  }

  const total = CART.reduce((acc, i) => acc + i.preco * i.qtd, 0);

  const { data: pedido, error } = await supabase
    .from("pedidos")
    .insert([
      {
        cliente_id: CLIENTE_ID,
        nome_cliente: nome,
        telefone_cliente: tel,
        total,
        status: "novo",
      },
    ])
    .select()
    .single();

  if (error) {
    alert("Erro ao enviar pedido!");
    console.error(error);
    return;
  }

  // Limpa carrinho
  CART.length = 0;
  saveCart();
  updateCartUI();

  alert("Pedido enviado com sucesso!");

  // WhatsApp
  const linkZap = `https://wa.me/55${STORE_CONFIG.whatsapp}?text=Pedido%20enviado%20#${pedido.id}`;
  window.open(linkZap, "_blank");
}

window.sendOrder = finalizarPedido;
