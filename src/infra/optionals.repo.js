import { supabase } from "../../supabaseClient.js";

export async function getGruposOpcionaisByProduto(produtoId) {
  return supabase
    .from("grupos_opcionais")
    .select("*, opcionais (*)")
    .eq("produto_id", produtoId)
    .order("ordem");
}
