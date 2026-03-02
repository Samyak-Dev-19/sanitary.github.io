// ====== Small helpers ======
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

// ====== Year in footer ======
(() => {
  const y = $("#year");
  if (y) y.textContent = new Date().getFullYear();
})();

// ====== Mobile menu ======
function toggleMenu() {
  const nav = $("#navLinks");
  if (!nav) return;
  nav.classList.toggle("active");
}

// Close menu on link click (mobile)
$$(".nav-links a").forEach(a => {
  a.addEventListener("click", () => {
    const nav = $("#navLinks");
    if (nav && nav.classList.contains("active")) nav.classList.remove("active");
  });
});

// ====== Product filtering (front-end demo) ======
function filterProducts(tag) {
  // active button UI
  $$(".filter-btn").forEach(b => b.classList.remove("active"));
  const btnMap = {
    all: "all",
    daily: "daily",
    night: "night",
    organic: "organic"
  };
  const wanted = btnMap[tag] || "all";
  const buttons = Array.from($$(".filter-btn"));
  const activeBtn = buttons.find(b => b.textContent.trim().toLowerCase() === wanted);
  if (activeBtn) activeBtn.classList.add("active");
  if (wanted === "all") buttons.find(b => b.textContent.trim() === "All")?.classList.add("active");

  // show/hide cards
  const cards = $$(".product-card");
  cards.forEach(card => {
    if (wanted === "all") {
      card.style.display = "";
      return;
    }
    const tags = (card.getAttribute("data-tag") || "").split(/\s+/).filter(Boolean);
    card.style.display = tags.includes(wanted) ? "" : "none";
  });
}

// ====== Toast ======
let toastTimer = null;
function showToast(msg) {
  const toast = $("#toast");
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2200);
}

// ====== Cart (frontend demo). Replace with DB/Stripe API later ======
let cart = []; // [{name, price, qty}]

function addToCart(name, price) {
  const item = cart.find(i => i.name === name);
  if (item) item.qty += 1;
  else cart.push({ name, price, qty: 1 });

  updateCartUI();
  showToast("Added to cart");
}

function incQty(i) {
  if (!cart[i]) return;
  cart[i].qty += 1;
  updateCartUI();
}

function decQty(i) {
  if (!cart[i]) return;
  cart[i].qty = Math.max(1, cart[i].qty - 1);
  updateCartUI();
}

function removeItem(i) {
  if (!cart[i]) return;
  cart.splice(i, 1);
  updateCartUI();
  showToast("Removed");
}

function updateCartUI() {
  const itemsEl = $("#cart-items");
  const totalEl = $("#cart-total");
  const countEl = $("#cart-count");

  if (!itemsEl || !totalEl || !countEl) return;

  let total = 0;
  itemsEl.innerHTML = "";

  if (cart.length === 0) {
    itemsEl.innerHTML = `<div class="cart-empty">Your cart is empty.</div>`;
    totalEl.textContent = "0.00";
    countEl.textContent = "0";
    return;
  }

  cart.forEach((item, idx) => {
    total += item.price * item.qty;

    const row = document.createElement("div");
    row.className = "cart-row";
    row.innerHTML = `
      <div class="cart-row-left">
        <div class="cart-name">${escapeHtml(item.name)}</div>
        <div class="cart-meta">$${item.price.toFixed(2)} × ${item.qty}</div>
        <div class="qty">
          <button type="button" aria-label="Decrease quantity">−</button>
          <span>${item.qty}</span>
          <button type="button" aria-label="Increase quantity">+</button>
        </div>
      </div>
      <div class="cart-row-right">
        <div class="cart-line">$${(item.price * item.qty).toFixed(2)}</div>
        <button class="remove" type="button" aria-label="Remove item">
          <i class="fa-solid fa-trash"></i>
        </button>
      </div>
    `;

    // attach handlers safely
    const [decBtn, incBtn] = row.querySelectorAll(".qty button");
    decBtn.addEventListener("click", () => decQty(idx));
    incBtn.addEventListener("click", () => incQty(idx));
    row.querySelector(".remove").addEventListener("click", () => removeItem(idx));

    itemsEl.appendChild(row);
  });

  totalEl.textContent = total.toFixed(2);
  countEl.textContent = String(cart.length);
}

// ====== Modal open/close ======
function openCart() {
  const modal = $("#cartModal");
  if (!modal) return;
  modal.hidden = false;
  modal.classList.add("show");
  updateCartUI();
  document.body.style.overflow = "hidden";
}

function closeCart() {
  const modal = $("#cartModal");
  if (!modal) return;
  modal.classList.remove("show");
  modal.hidden = true;
  document.body.style.overflow = "";
}

// Close cart on ESC
window.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    const modal = $("#cartModal");
    if (modal && !modal.hidden) closeCart();
  }
});

// Click outside panel already handled by overlay onclick in HTML

// ====== Checkout placeholder ======
function startCheckout() {
  if (cart.length === 0) {
    showToast("Cart is empty");
    return;
  }
  // In your Stripe + Node backend:
  // POST cart -> /api/checkout/create-checkout-session then redirect to returned URL.
  showToast("Stripe checkout will redirect here (backend build)");
}

// ====== Security helper for injecting text ======
function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// ====== Expose functions used by HTML onclick ======
window.toggleMenu = toggleMenu;
window.filterProducts = filterProducts;

window.addToCart = addToCart;
window.openCart = openCart;
window.closeCart = closeCart;
window.startCheckout = startCheckout;