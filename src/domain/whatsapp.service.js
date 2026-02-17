export function buildWhatsappMessage({
  codigo,
  nome,
  tel,
  entregaTexto,
  rua,
  bairro,
  itens,
  subtotal,
  taxa,
  total,
  pagamento,
  troco,
  obsGeral
}) {
  let msg = `*PEDIDO #${codigo}*\n\n`;
  msg += `👤 *${nome}*\n`;
  msg += `📱 ${tel}\n\n`;

  msg += `🚚 *${entregaTexto}*\n`;
  if (rua && bairro) msg += `📍 ${rua}, ${bairro}\n\n`;

  msg += `----------------------\n`;

  itens.forEach((item) => {
    msg += `*${item.qtd}x ${item.nome}*\n`;
    if (item.obs?.length) {
      item.obs.forEach((o) => {
        msg += `   ↳ + ${o.nome}`;
        if (o.preco > 0) msg += ` (+R$ ${o.preco.toFixed(2)})`;
        msg += "\n";
      });
    }
    msg += "\n";
  });

  msg += `----------------------\n`;
  msg += `🧾 Subtotal: R$ ${subtotal.toFixed(2)}\n`;
  if (taxa > 0) msg += `🚚 Taxa Entrega: R$ ${taxa.toFixed(2)}\n`;
  msg += `💰 *TOTAL FINAL: R$ ${total.toFixed(2)}*\n`;
  msg += `💳 Pagamento: ${pagamento}`;
  if (pagamento === "Dinheiro" && troco) msg += ` (Troco: R$ ${troco})`;
  if (obsGeral) msg += `\n\n📝 Obs: ${obsGeral}`;

  return msg;
}
