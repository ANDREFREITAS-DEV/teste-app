const KEY = "zapflow_pending_orders";

export function loadPendingOrders() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || [];
  } catch {
    return [];
  }
}

export function savePendingOrders(list) {
  localStorage.setItem(KEY, JSON.stringify(list));
}

export function enqueueOrder(orderPayload) {
  const list = loadPendingOrders();
  list.push({
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    payload: orderPayload,
  });

  savePendingOrders(list);
}

export function clearPendingOrders() {
  savePendingOrders([]);
}
