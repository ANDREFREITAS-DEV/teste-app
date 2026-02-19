import { supabase } from "../../supabaseClient.js";

export async function getStoreConfig(clienteId) {
  return supabase
    .from("config_loja")
    .select("*")
    .eq("cliente_id", clienteId)
    .single();
}
