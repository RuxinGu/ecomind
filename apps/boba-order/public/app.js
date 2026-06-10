const MENU = [
  { id: 1, name: 'Lemon Red Tea', cat: 'Tea', desc: 'Iced red tea with fresh lemon & lime slices', price: 4.00, color: '#FDE8C0', badge: 'fave', fruit: '#F6D54B', drink: '#B75A38' },
  { id: 2, name: 'Mango Matcha', cat: 'Latte', desc: 'Layered mango, oat milk & ceremonial matcha', price: 5.00, color: '#C8EDE3', badge: 'new', fruit: '#F5A623', drink: '#7BBE76' },
  { id: 3, name: 'Lemonade', cat: 'Lemonade', desc: 'Sparkling lemonade with cucumber & lemon', price: 3.00, color: '#FBF9C0', badge: null, fruit: '#F6E15B', drink: '#F9F3A5' },
  { id: 4, name: 'Orange Lemon Tea', cat: 'Fruit Tea', desc: 'Vibrant orange juice with lime & cucumber', price: 4.00, color: '#FFE680', badge: 'new', fruit: '#F28C28', drink: '#F0A83A' }
];

let cart = [];
let modalItem = null;

const PHOTOS = {
  1: '/images/lemon-red-tea.png',
  2: '/images/mango-matcha.png',
  3: '/images/lemonade.png',
  4: '/images/orange-lemon-tea.png'
};

function renderMenu(filter) {
  filter = filter || 'All';
  const body = document.getElementById('menu-body');
  const items = filter === 'All' ? MENU : MENU.filter((item) => item.cat === filter);
  if (items.length === 0) {
    body.innerHTML = '<p style="text-align:center;padding:40px;color:var(--muted)">No items in this category</p>';
    return;
  }
  const cards = items.map((item) => {
    const badge = item.badge ? `<span class="badge">${item.badge}</span>` : '';
    return `<div class="card" onclick="openModal(${item.id})">
      <div class="card-top-color" style="background:${item.color}"></div>
      ${badge}
      <img class="card-photo" src="${PHOTOS[item.id]}" alt="${item.name}">
      <div class="card-name">${item.name}</div>
      <div class="card-desc">${item.desc}</div>
      <div class="card-footer">
        <span class="card-price">$${item.price.toFixed(2)}</span>
        <button class="add-circle" onclick="quickAdd(event,${item.id})">+</button>
      </div>
    </div>`;
  }).join('');
  body.innerHTML = `<div class="section-heading">Our Menu</div><div class="cards">${cards}</div>`;
}

function filterMenu(el, cat) {
  document.querySelectorAll('.pill').forEach((pill) => pill.classList.remove('active'));
  el.classList.add('active');
  renderMenu(cat);
}

function openModal(id) {
  modalItem = MENU.find((item) => item.id === id);
  if (!modalItem) return;
  document.getElementById('modal-photo').src = PHOTOS[id];
  document.getElementById('modal-photo').alt = modalItem.name;
  document.getElementById('modal-title').textContent = modalItem.name;
  document.getElementById('modal-desc').textContent = `${modalItem.desc} · $${modalItem.price.toFixed(2)}`;
  document.querySelectorAll('#modal-sizes .modal-opt').forEach((button, index) => button.classList.toggle('sel', index === 0));
  document.querySelectorAll('#modal-toppings .modal-opt').forEach((button, index) => button.classList.toggle('sel', index === 0));
  document.getElementById('modal-bg').classList.add('open');
}

function closeModalBg(event) {
  if (event.target === document.getElementById('modal-bg')) closeModal();
}

function closeModal() {
  document.getElementById('modal-bg').classList.remove('open');
  modalItem = null;
}

function pickModalOpt(el) {
  el.closest('.modal-opts').querySelectorAll('.modal-opt').forEach((button) => button.classList.remove('sel'));
  el.classList.add('sel');
}

function pickModalTop(el) {
  const selected = Array.from(el.closest('.modal-opts').querySelectorAll('.sel'));
  if (el.classList.contains('sel')) {
    el.classList.remove('sel');
    return;
  }
  if (selected.length >= 2) return;
  el.classList.add('sel');
}

function addFromModal() {
  if (!modalItem) return;
  const sizeEl = document.querySelector('#modal-sizes .sel');
  const sizeLabel = sizeEl ? sizeEl.textContent.trim() : 'Regular';
  const sizeMod = sizeLabel.indexOf('+$1') >= 0 ? 1 : 0;
  const toppings = Array.from(document.querySelectorAll('#modal-toppings .sel')).map((button) => button.textContent.trim());
  addToCart(modalItem, sizeLabel.split('·')[0].trim(), sizeMod, toppings);
  closeModal();
}

function quickAdd(event, id) {
  event.stopPropagation();
  const item = MENU.find((entry) => entry.id === id);
  addToCart(item, 'Regular', 0, ['Tapioca pearls']);
}

function addToCart(item, size, priceMod, toppings) {
  cart.push({ id: Date.now() + Math.random(), item, size, toppings, qty: 1, price: item.price + priceMod });
  updateCartUI();
}

function cartTotal() {
  return cart.reduce((sum, entry) => sum + entry.price * entry.qty, 0);
}

function updateCartUI() {
  const total = cartTotal();
  const count = cart.reduce((sum, entry) => sum + entry.qty, 0);
  document.getElementById('cart-count-badge').textContent = count;
  document.getElementById('cart-total-strip').textContent = `$${total.toFixed(2)}`;
  document.getElementById('cart-topbtn').style.display = count > 0 ? 'flex' : 'none';
  document.getElementById('cart-bar').classList.toggle('visible', count > 0);
}

function goCart() {
  renderCart();
  goScreen('cart-screen');
}

function renderCart() {
  const list = document.getElementById('cart-items-list');
  const summary = document.getElementById('cart-summary-box');
  if (cart.length === 0) {
    list.innerHTML = '<p style="text-align:center;padding:40px;color:var(--muted)">Your cart is empty</p>';
    summary.innerHTML = '';
    return;
  }
  list.innerHTML = cart.map((entry) => `<div class="cart-item">
    <img class="cart-item-photo" src="${PHOTOS[entry.item.id]}" alt="${entry.item.name}">
    <div class="cart-item-info">
      <div class="cart-item-name">${entry.item.name}</div>
      <div class="cart-item-mods">${entry.size} · ${entry.toppings.join(', ')}</div>
      <div class="qty-ctrl">
        <button class="qty-btn" onclick="changeQty(${entry.id},-1)">−</button>
        <span class="qty-num">${entry.qty}</span>
        <button class="qty-btn" onclick="changeQty(${entry.id},1)">+</button>
      </div>
    </div>
    <span class="cart-item-price">$${(entry.price * entry.qty).toFixed(2)}</span>
  </div>`).join('');
  const sub = cartTotal();
  const tax = sub * 0.08;
  summary.innerHTML = `<div class="summary-row"><span>Subtotal</span><span>$${sub.toFixed(2)}</span></div>
    <div class="summary-row"><span>Tax (8%)</span><span>$${tax.toFixed(2)}</span></div>
    <div class="summary-row total"><span>Total</span><span>$${(sub + tax).toFixed(2)}</span></div>`;
}

function changeQty(id, delta) {
  const index = cart.findIndex((entry) => entry.id == id);
  if (index < 0) return;
  cart[index].qty += delta;
  if (cart[index].qty <= 0) cart.splice(index, 1);
  updateCartUI();
  renderCart();
}

function goCheckout() {
  if (cart.length === 0) return;
  renderCheckoutReview();
  goScreen('checkout-screen');
}

function renderCheckoutReview() {
  document.getElementById('checkout-review').innerHTML = cart.map((entry) => `<div class="order-review-item">
    <span>${entry.qty}× ${entry.item.name} <span style="color:var(--muted);font-size:11px">(${entry.size})</span></span>
    <span style="color:var(--brown)">$${(entry.price * entry.qty).toFixed(2)}</span>
  </div>`).join('') + `<div class="order-review-item" style="font-weight:500;color:var(--dark)">
    <span>Total</span><span>$${(cartTotal() * 1.08).toFixed(2)}</span>
  </div>`;
}

function pickOpt(el, grp) {
  el.closest(grp === 'sweet' ? '.sweetness-grid' : '.ice-grid').querySelectorAll('.option-btn').forEach((button) => button.classList.remove('selected'));
  el.classList.add('selected');
}

function renderConfirmation(order) {
  const items = order.items || [];
  const preferences = order.preferences || {};
  document.getElementById('conf-order-num').textContent = order.number || '#0000';
  document.getElementById('conf-breakdown').innerHTML = `<div class="ob-title">Order breakdown</div>`
    + items.map((entry) => `<div class="ob-row"><span>${entry.qty}× ${entry.name}</span><span>$${(entry.price * entry.qty).toFixed(2)}</span></div>`).join('')
    + `<div class="ob-row"><span>Sweetness / Ice</span><span>${preferences.sweetness || '50%'} / ${preferences.ice || 'Regular'}</span></div>
      <div class="ob-row"><span>Tax</span><span>$${Number(order.tax || 0).toFixed(2)}</span></div>
      <div class="ob-row total-row"><span>Total paid</span><span>$${Number(order.total || 0).toFixed(2)}</span></div>`;
}

async function placeOrder() {
  const nameInput = document.getElementById('cust-name');
  const name = nameInput.value.trim();
  if (!name) {
    nameInput.focus();
    nameInput.style.borderColor = '#D070A0';
    return;
  }
  const sweet = (document.querySelector('.sweetness-grid .selected') || {}).textContent || '50%';
  const ice = (document.querySelector('.ice-grid .selected') || {}).textContent || 'Regular';
  const sub = cartTotal();
  const tax = sub * 0.08;

  const payload = {
    customer: {
      name,
      phone: document.getElementById('cust-phone').value.trim(),
      table: document.getElementById('cust-table').value.trim()
    },
    notes: document.getElementById('order-notes').value.trim(),
    preferences: { sweetness: sweet, ice },
    items: cart.map((entry) => ({
      name: entry.item.name,
      size: entry.size,
      toppings: entry.toppings,
      qty: entry.qty,
      price: entry.price
    })),
    subtotal: sub,
    tax,
    total: sub + tax
  };

  try {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Could not place order.');
    renderConfirmation(data.order);
  } catch (error) {
    alert(error.message || 'Could not place order.');
    return;
  }

  goScreen('confirm-screen');
}

function newOrder() {
  cart = [];
  updateCartUI();
  goScreen('menu-screen');
}

function goScreen(id) {
  document.querySelectorAll('.screen').forEach((screen) => screen.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  window.scrollTo(0, 0);
}

renderMenu();
