import { supabase } from "../../supabaseClient.js";

export function insertPedido(payload) {
  return supabase
    .from("pedidos")
    .insert(payload)
    .select("id, numero_pedido")
    .single();
}


export async function insertItensPedido(itens) {
  return supabase
    .from("itens_pedido")
    .insert(itens);
}
