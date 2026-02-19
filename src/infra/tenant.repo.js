import { supabase } from "../../supabaseClient.js";

export async function getClienteBySlug(slug) {
  return supabase
    .from("clientes")
    .select("id, nome_fantasia, slug")
    .eq("slug", slug)
    .single();
}
