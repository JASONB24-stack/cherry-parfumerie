// Simple storefront script with localStorage cart persistence

const products = [
  {
    id: 'p1',
    title: 'Cherry Signature',
    price: 28500,
    image: 'http://www.w3.org/2000/svg',
    description: 'A sweet, long-lasting floral with cherry top notes.'
  },
  {
    id: 'p2',
    title: 'Arabian Oud',
    price: 42000,
    image: 'http://www.w3.org/2000/svg',
    description: 'Deep, resinous oud with woody undertones.'
  }
];

// Cart stored as array of {id, qty}
let cart = loadCart();

// Utilities
const formatCurrency = (n) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(n);

// DOM refs
const catalogEl = document.getElementById('catalog');
const cartItemsEl = document.getElementById('cart-items');
const cartSubtotalEl = document.getElementById('cart-subtotal');
const cartDeliveryEl = document.getElementById('cart-delivery');
const cartTotalEl = document.getElementById('cart-total');
const cartCountEl = document.getElementById('cart-count');
const cartToggleBtn = document.getElementById('cart-toggle');
const cartEl = document.getElementById('cart');
const checkoutOpenBtn = document.getElementById('checkout-open');
const checkoutSection = document.getElementById('checkout');
const checkoutForm = document.getElementById('checkout-form');
const checkoutCancelBtn = document.getElementById('checkout-cancel');
const clearCartBtn = document.getElementById('clear-cart');

// Render product catalog
function renderCatalog() {
  catalogEl.innerHTML = products.map(p => `
    <article class="card" aria-labelledby="${p.id}-title">
      <img src="${p.image}" alt="${p.title}" loading="lazy" />
      <h3 id="${p.id}-title">${p.title}</h3>
      <p class="muted">${p.description}</p>
      <p><strong>${formatCurrency(p.price)}</strong></p>
      <div style="margin-top:auto">
        <button class="btn btn-primary" onclick="addToCart('${p.id}')">Add to Cart</button>
      </div>
    </article>
  `).join('');
}

// Cart logic
function addToCart(id) {
  const item = cart.find(i => i.id === id);
  if (item) item.qty += 1;
  else cart.push({ id, qty: 1 });
  saveCart();
  renderCart();
}

function updateQty(id, qty) {
  const idx = cart.findIndex(i => i.id === id);
  if (idx === -1) return;
  if (qty <= 0) cart.splice(idx, 1);
  else cart[idx].qty = qty;
  saveCart();
  renderCart();
}

function removeFromCart(id) {
  cart = cart.filter(i => i.id !== id);
  saveCart();
  renderCart();
}

function calculateTotals() {
  const subtotal = cart.reduce((sum, it) => {
    const p = products.find(x => x.id === it.id);
    return sum + (p.price * it.qty);
  }, 0);
  const delivery = subtotal > 0 ? 1000 : 0; // simple flat delivery
  const total = subtotal + delivery;
  return { subtotal, delivery, total };
}

function renderCart() {
  if (!cart.length) {
    cartItemsEl.innerHTML = '<p>Your cart is empty</p>';
  } else {
    cartItemsEl.innerHTML = cart.map(item => {
      const p = products.find(x => x.id === item.id);
      return `
      <div class="cart-item" data-id="${item.id}">
        <img src="${p.image}" alt="${p.title}" />
        <div style="flex:1">
          <div><strong>${p.title}</strong></div>
          <div style="color:#666">${formatCurrency(p.price)} x ${item.qty}</div>
          <div class="qty-controls" style="margin-top:8px">
            <button class="btn btn-outline" onclick="updateQty('${item.id}', ${item.qty - 1})">−</button>
            <span aria-live="polite" style="min-width:28px;display:inline-block;text-align:center">${item.qty}</span>
            <button class="btn btn-outline" onclick="updateQty('${item.id}', ${item.qty + 1})">+</button>
            <button class="btn btn-outline" style="margin-left:8px" onclick="removeFromCart('${item.id}')">Remove</button>
          </div>
        </div>
      </div>
      `;
    }).join('');
  }

  const totals = calculateTotals();
  cartSubtotalEl.textContent = formatCurrency(totals.subtotal);
  cartDeliveryEl.textContent = formatCurrency(totals.delivery);
  cartTotalEl.textContent = formatCurrency(totals.total);
  cartCountEl.textContent = cart.reduce((s, i) => s + i.qty, 0);

  // update cart toggle aria
  const isOpen = !cartEl.classList.contains('hidden');
  cartToggleBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
}

// Persistence
function saveCart(){
  localStorage.setItem('cherry_cart_v1', JSON.stringify(cart));
}
function loadCart(){
  try {
    const raw = localStorage.getItem('cherry_cart_v1');
    return raw ? JSON.parse(raw) : [];
  } catch(e) { return []; }
}

// Checkout handlers
checkoutOpenBtn?.addEventListener('click', () => {
  checkoutSection.classList.remove('hidden');
  checkoutSection.setAttribute('aria-hidden', 'false');
});
checkoutCancelBtn?.addEventListener('click', () => {
  checkoutSection.classList.add('hidden');
  checkoutSection.setAttribute('aria-hidden', 'true');
});
clearCartBtn?.addEventListener('click', () => {
  cart = [];
  saveCart();
  renderCart();
});

checkoutForm?.addEventListener('submit', (e) => {
  e.preventDefault();
  // Simple client-side validation already handled by required. Here you would call your payment API.
  const totals = calculateTotals();
  if (totals.total === 0) {
    alert('Your cart is empty.');
    return;
  }
  // Mock successful payment
  alert('Payment simulated. Thank you — order placed!');
  cart = [];
  saveCart();
  renderCart();
  checkoutSection.classList.add('hidden');
  checkoutSection.setAttribute('aria-hidden', 'true');
});

// Cart toggle (for small screens)
cartToggleBtn?.addEventListener('click', () => {
  cartEl.classList.toggle('hidden');
  const isHidden = cartEl.classList.contains('hidden');
  cartToggleBtn.setAttribute('aria-expanded', (!isHidden).toString());
});

// init
document.addEventListener('DOMContentLoaded', () => {
  renderCatalog();
  renderCart();
});

// Expose functions for inline onclick handlers
window.addToCart = addToCart;
window.updateQty = updateQty;
window.removeFromCart = removeFromCart;