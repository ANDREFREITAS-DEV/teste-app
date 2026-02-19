import { supabase } from "../../supabaseClient.js";

export async function getCategorias(clienteId) {
  return supabase
    .from("categorias")
    .select("*")
    .eq("cliente_id", clienteId)
    .order("ordem");
}

export async function getProdutosAtivos(clienteId) {
  return supabase
    .from("produtos")
    .select("*")
    .eq("cliente_id", clienteId)
    .eq("ativo", true);
}
