import { supabase } from "../../supabaseClient.js";

export async function insertPedido(payload) {
  return supabase
    .from("pedidos")
    .insert([payload])
    .select()
    .single();
}

export async function insertItensPedido(itens) {
  return supabase
    .from("itens_pedido")
    .insert(itens);
}
