export let CART = JSON.parse(localStorage.getItem("zapflow_cart")) || [];

export function saveCart() {
  localStorage.setItem("zapflow_cart", JSON.stringify(CART));
}

export function updateCartUI() {
  const total = CART.reduce((acc, item) => acc + item.preco * item.qtd, 0);
  const badge = document.getElementById("nav-cart-price");

  if (CART.length > 0) {
    badge.innerText = `R$ ${total.toFixed(2)}`;
    badge.classList.remove("hidden");
  } else {
    badge.classList.add("hidden");
  }
}

window.addToCart = (id, nome, preco, img, obs = [], qtd = 1) => {
  CART.push({ id, nome, preco, qtd, img, obs });

  saveCart();
  updateCartUI();

  Toastify({
    text: "Adicionado ao carrinho!",
    gravity: "bottom",
    position: "center",
    style: { background: "#22c55e" },
  }).showToast();
};
