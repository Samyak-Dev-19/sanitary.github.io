const API_BASE = "https://YOUR-BACKEND-DOMAIN/api"; // change after deploy

let products = [];
let cart = [];

function money(cents) {
  return (cents / 100).toFixed(2);
}

async function loadProducts() {
  const res = await fetch(`${API_BASE}/products`);
  products = await res.json();
  renderProducts();
}

function renderProducts() {
  const grid = document.querySelector(".product-grid");
  grid.innerHTML = products
    .map(
      p => `
      <div class="product-card">
        <img src="${p.imageUrl}" alt="${p.name}" />
        <h3>${p.name}</h3>
        <p>$${money(p.priceCents)}</p>
        <button onclick="addToCart('${p._id}')">Add to Cart</button>
      </div>
    `
    )
    .join("");
}

function addToCart(productId) {
  const item = cart.find(i => i.productId === productId);
  if (item) item.qty += 1;
  else cart.push({ productId, qty: 1 });

  document.getElementById("cart-count").innerText = cart.length;
  renderCart();
}

function renderCart() {
  const itemsEl = document.getElementById("cart-items");
  const totalEl = document.getElementById("cart-total");

  let total = 0;
  itemsEl.innerHTML = cart
    .map(i => {
      const p = products.find(x => x._id === i.productId);
      const line = p.priceCents * i.qty;
      total += line;

      return `
        <div style="display:flex;justify-content:space-between;align-items:center;margin:10px 0;">
          <div>
            <strong>${p.name}</strong><br/>
            $${money(p.priceCents)} × 
            <button onclick="decQty('${i.productId}')">-</button>
            ${i.qty}
            <button onclick="incQty('${i.productId}')">+</button>
          </div>
          <div>
            $${money(line)}
            <button onclick="removeItem('${i.productId}')" style="margin-left:10px;">✕</button>
          </div>
        </div>
      `;
    })
    .join("");

  totalEl.innerText = money(total);
}

function incQty(productId) {
  cart = cart.map(i => (i.productId === productId ? { ...i, qty: i.qty + 1 } : i));
  renderCart();
}

function decQty(productId) {
  cart = cart
    .map(i => (i.productId === productId ? { ...i, qty: Math.max(1, i.qty - 1) } : i));
  renderCart();
}

function removeItem(productId) {
  cart = cart.filter(i => i.productId !== productId);
  document.getElementById("cart-count").innerText = cart.length;
  renderCart();
}

async function startCheckout() {
  if (cart.length === 0) return alert("Cart is empty");

  const res = await fetch(`${API_BASE}/checkout/create-checkout-session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cart })
  });
  const data = await res.json();

  if (!res.ok) return alert(data.error || "Checkout failed");
  window.location.href = data.url; // redirect to Stripe Checkout
}

window.openCart = function () {
  document.getElementById("cartModal").style.display = "flex";
  renderCart();
};

window.closeCart = function () {
  document.getElementById("cartModal").style.display = "none";
};

window.startCheckout = startCheckout;
window.addToCart = addToCart;
window.incQty = incQty;
window.decQty = decQty;
window.removeItem = removeItem;


loadProducts();
