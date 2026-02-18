import { loadPendingOrders, clearPendingOrders } from "../core/offline-queue.js";
import { insertPedido, insertItensPedido } from "../infra/orders.repo.js";

export async function syncPendingOrders() {
  const pendentes = loadPendingOrders();

  if (!pendentes.length) return;

  console.log("📡 Sincronizando pedidos pendentes...", pendentes.length);

  for (const item of pendentes) {
    try {
      const { pedidoPayload, itensPayload } = item.payload;

      // 1) envia pedido
      const { data: pedido, error } = await insertPedido(pedidoPayload);
      if (error) throw error;

      // 2) envia itens
      const itens = itensPayload.map((it) => ({
        ...it,
        pedido_id: pedido.id,
      }));

      const { error: erroItens } = await insertItensPedido(itens);
      if (erroItens) throw erroItens;

      console.log("✅ Pedido pendente enviado:", pedido.id);
    } catch (e) {
      console.warn("⚠️ Falha ao sincronizar pedido pendente:", e);
      return; // para e tenta depois
    }
  }

  // se enviou tudo → limpa fila
  clearPendingOrders();
  console.log("✅ Todos pedidos pendentes sincronizados!");
}
