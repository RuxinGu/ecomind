const MENU = [
  { id: 1, name: 'Taro Milk Tea', cat: 'Milk Tea', desc: 'Creamy taro, tapioca pearls', price: 6.5, color: '#E8D5F5', stroke: '#C4A8E0', straw: '#B090D0', badge: 'fave' },
  { id: 2, name: 'Strawberry Lychee', cat: 'Fruit Tea', desc: 'Sweet fruit tea, lychee jelly', price: 6.75, color: '#FFD4E2', stroke: '#F0A0C0', straw: '#E8809C' },
  { id: 3, name: 'Matcha Oat Latte', cat: 'Milk Tea', desc: 'Earthy matcha, silky oat milk', price: 7, color: '#C8EDE3', stroke: '#80C8B0', straw: '#50A878', badge: 'new' },
  { id: 4, name: 'Mango Passionfruit', cat: 'Fruit Tea', desc: 'Tropical blend, coconut jelly', price: 6.75, color: '#FDE8C0', stroke: '#F0C070', straw: '#E0A030' },
  { id: 5, name: 'Blue Ocean Slush', cat: 'Slushie', desc: 'Blueberry citrus slushie', price: 6.25, color: '#D4EBFA', stroke: '#90C8EE', straw: '#60A8D8' },
  { id: 6, name: 'Honeydew Dream', cat: 'Seasonal', desc: 'Melon milk tea, basil seeds', price: 7.25, color: '#FBF1C0', stroke: '#E0D070', straw: '#C8B030', badge: 'seasonal' },
  { id: 7, name: 'Classic Brown Sugar', cat: 'Milk Tea', desc: 'Tiger sugar, fresh milk', price: 6.5, color: '#FDDCC4', stroke: '#F0B890', straw: '#D08040' },
  { id: 8, name: 'Passion Fruit Green Tea', cat: 'Fruit Tea', desc: 'Tangy passion, jasmine green', price: 6, color: '#EAF7DF', stroke: '#A0D870', straw: '#70B840' }
];

let cart = [];
let modalItem = null;

function money(value) {
  return `$${Number(value || 0).toFixed(2)}`;
}

function cupSVG(item, w = 58, h = 82) {
  const pw = w * 0.69;
  const ph = h * 0.79;
  const px = (w - pw) / 2;
  const py = h * 0.18;
  const sx = w / 2 - w * 0.075;
  const sy = h * 0.025;
  const bubbles = [[0.38, 0.54, 0.056], [0.62, 0.62, 0.056], [0.3, 0.64, 0.05], [0.55, 0.7, 0.045], [0.7, 0.54, 0.044]];
  const bubs = bubbles.map(([bx, by, br]) => `<circle cx="${w * bx}" cy="${h * by}" r="${w * br}" fill="#3D2314" opacity="0.82"/>`).join('');
  return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="${px}" y="${py}" width="${pw}" height="${ph}" rx="${w * 0.16}" fill="${item.color}" stroke="${item.stroke}" stroke-width="1.5"/>
    <rect x="${px + w * 0.07}" y="${py + h * 0.07}" width="${pw - w * 0.14}" height="${ph - h * 0.07}" rx="${w * 0.12}" fill="${item.color}" opacity="0.7"/>
    ${bubs}
    <rect x="${sx}" y="${sy}" width="${w * 0.15}" height="${h * 0.19}" rx="${w * 0.05}" fill="${item.straw}"/>
    <rect x="${px}" y="${py}" width="${pw}" height="${h * 0.1}" rx="${w * 0.16}" fill="white" opacity="0.28"/>
  </svg>`;
}

function renderMenu(filter = 'All') {
  const body = document.getElementById('menu-body');
  const items = filter === 'All' ? MENU : MENU.filter((item) => item.cat === filter);
  const cats = [...new Set(items.map((item) => item.cat))];
  body.innerHTML = cats.map((cat) => {
    const catItems = items.filter((item) => item.cat === cat);
    return `<div class="section-heading">${cat}</div>
      <div class="cards">
        ${catItems.map((item) => `
          <article class="card" data-open="${item.id}">
            <div class="card-top-color" style="background:${item.color}"></div>
            ${item.badge ? `<span class="badge">${item.badge}</span>` : ''}
            <div class="cup">${cupSVG(item)}</div>
            <div class="card-name">${item.name}</div>
            <div class="card-desc">${item.desc}</div>
            <div class="card-footer">
              <span class="card-price">${money(item.price)}</span>
              <button class="add-circle" type="button" data-quick="${item.id}" aria-label="Quick add ${item.name}">+</button>
            </div>
          </article>`).join('')}
      </div>`;
  }).join('');
}

function goScreen(id) {
  document.querySelectorAll('.screen').forEach((screen) => screen.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  window.scrollTo(0, 0);
}

function openModal(id) {
  modalItem = MENU.find((item) => item.id === Number(id));
  if (!modalItem) return;
  document.getElementById('modal-title').textContent = modalItem.name;
  document.getElementById('modal-desc').textContent = `${modalItem.desc} · ${money(modalItem.price)}`;
  document.querySelectorAll('#modal-sizes .modal-opt').forEach((button, index) => button.classList.toggle('sel', index === 0));
  document.querySelectorAll('#modal-toppings .modal-opt').forEach((button, index) => button.classList.toggle('sel', index === 0));
  document.getElementById('modal-bg').classList.add('open');
}

function closeModal() {
  document.getElementById('modal-bg').classList.remove('open');
  modalItem = null;
}

function addToCart(item, size, priceMod, toppings) {
  cart.push({
    id: String(Date.now() + Math.random()),
    item,
    name: item.name,
    size,
    toppings,
    qty: 1,
    price: item.price + priceMod
  });
  updateCartUI();
}

function quickAdd(id) {
  const item = MENU.find((entry) => entry.id === Number(id));
  if (item) addToCart(item, 'Regular', 0, ['Tapioca pearls']);
}

function cartSubtotal() {
  return cart.reduce((sum, entry) => sum + entry.price * entry.qty, 0);
}

function updateCartUI() {
  const count = cart.reduce((sum, entry) => sum + entry.qty, 0);
  const total = cartSubtotal() * 1.08;
  document.getElementById('cart-count-badge').textContent = count;
  document.getElementById('cart-total-strip').textContent = money(total);
  document.getElementById('cart-topbtn').hidden = count === 0;
  document.getElementById('cart-bar').classList.toggle('visible', count > 0);
}

function renderCart() {
  const list = document.getElementById('cart-items-list');
  const summary = document.getElementById('cart-summary-box');
  if (cart.length === 0) {
    list.innerHTML = '<p class="empty-state">Your cart is empty.</p>';
    summary.innerHTML = '';
    return;
  }
  list.innerHTML = cart.map((entry) => `
    <article class="cart-item">
      <div>${cupSVG(entry.item, 42, 58)}</div>
      <div>
        <div class="cart-item-name">${entry.name}</div>
        <div class="cart-item-mods">${entry.size} · ${entry.toppings.join(', ') || 'No toppings'}</div>
        <div class="qty-ctrl">
          <button class="qty-btn" type="button" data-qty="${entry.id}" data-delta="-1">-</button>
          <span>${entry.qty}</span>
          <button class="qty-btn" type="button" data-qty="${entry.id}" data-delta="1">+</button>
        </div>
      </div>
      <span class="cart-item-price">${money(entry.price * entry.qty)}</span>
    </article>`).join('');
  const sub = cartSubtotal();
  const tax = sub * 0.08;
  summary.innerHTML = `
    <div class="summary-row"><span>Subtotal</span><span>${money(sub)}</span></div>
    <div class="summary-row"><span>Estimated tax</span><span>${money(tax)}</span></div>
    <div class="summary-row total"><span>Total estimate</span><span>${money(sub + tax)}</span></div>`;
}

function changeQty(id, delta) {
  const index = cart.findIndex((entry) => entry.id === id);
  if (index < 0) return;
  cart[index].qty += Number(delta);
  if (cart[index].qty <= 0) cart.splice(index, 1);
  updateCartUI();
  renderCart();
}

function renderCheckoutReview() {
  const sub = cartSubtotal();
  const tax = sub * 0.08;
  document.getElementById('checkout-review').innerHTML = cart.map((entry) => `
    <div class="review-row">
      <span>${entry.qty}x ${entry.name} <small>(${entry.size})</small></span>
      <strong>${money(entry.price * entry.qty)}</strong>
    </div>`).join('') + `
    <div class="review-row total"><span>Total estimate</span><strong>${money(sub + tax)}</strong></div>`;
}

function selectedText(selector, fallback) {
  return document.querySelector(`${selector} .selected`)?.textContent.trim() || fallback;
}

async function placeOrder() {
  const error = document.getElementById('checkout-error');
  const button = document.getElementById('place-order-btn');
  const name = document.getElementById('cust-name').value.trim();
  if (!name) {
    error.textContent = 'Please enter a name for the order.';
    document.getElementById('cust-name').focus();
    return;
  }

  const sub = cartSubtotal();
  const payload = {
    customer: {
      name,
      phone: document.getElementById('cust-phone').value.trim(),
      table: document.getElementById('cust-table').value.trim()
    },
    notes: document.getElementById('order-notes').value.trim(),
    preferences: {
      sweetness: selectedText('#sweet-grid', '50%'),
      ice: selectedText('#ice-grid', 'Regular')
    },
    items: cart.map((entry) => ({
      name: entry.name,
      size: entry.size,
      toppings: entry.toppings,
      qty: entry.qty,
      price: entry.price
    })),
    subtotal: sub,
    tax: sub * 0.08,
    total: sub * 1.08
  };

  button.disabled = true;
  button.textContent = 'Sending...';
  error.textContent = '';

  try {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Could not send order.');
    showConfirmation(data.order);
  } catch (err) {
    error.textContent = err.message;
  } finally {
    button.disabled = false;
    button.textContent = 'Send order to counter';
  }
}

function showConfirmation(order) {
  document.getElementById('conf-order-num').textContent = order.number;
  document.getElementById('conf-breakdown').innerHTML = `
    ${order.items.map((entry) => `
      <div class="review-row">
        <span>${entry.qty}x ${entry.name}</span>
        <strong>${money(entry.price * entry.qty)}</strong>
      </div>`).join('')}
    <div class="review-row"><span>Sweetness / Ice</span><strong>${order.preferences.sweetness} / ${order.preferences.ice}</strong></div>
    <div class="review-row total"><span>Total estimate</span><strong>${money(order.total)}</strong></div>`;
  cart = [];
  updateCartUI();
  goScreen('confirm-screen');
}

document.addEventListener('click', (event) => {
  const filter = event.target.closest('[data-filter]');
  if (filter) {
    document.querySelectorAll('.pill').forEach((button) => button.classList.remove('active'));
    filter.classList.add('active');
    renderMenu(filter.dataset.filter);
    return;
  }

  const card = event.target.closest('[data-open]');
  const quick = event.target.closest('[data-quick]');
  if (quick) {
    quickAdd(quick.dataset.quick);
    return;
  }
  if (card) {
    openModal(card.dataset.open);
    return;
  }

  const screenButton = event.target.closest('[data-screen]');
  if (screenButton) {
    goScreen(screenButton.dataset.screen);
    return;
  }

  const qty = event.target.closest('[data-qty]');
  if (qty) {
    changeQty(qty.dataset.qty, qty.dataset.delta);
    return;
  }

  if (event.target.closest('#cart-topbtn') || event.target.closest('#view-order-btn')) {
    renderCart();
    goScreen('cart-screen');
    return;
  }

  if (event.target.closest('#continue-checkout')) {
    if (cart.length > 0) {
      renderCheckoutReview();
      goScreen('checkout-screen');
    }
    return;
  }

  const option = event.target.closest('.option-btn');
  if (option) {
    option.parentElement.querySelectorAll('.option-btn').forEach((button) => button.classList.remove('selected'));
    option.classList.add('selected');
    return;
  }

  const modalOption = event.target.closest('#modal-sizes .modal-opt');
  if (modalOption) {
    document.querySelectorAll('#modal-sizes .modal-opt').forEach((button) => button.classList.remove('sel'));
    modalOption.classList.add('sel');
    return;
  }

  const topping = event.target.closest('#modal-toppings .modal-opt');
  if (topping) {
    const selected = [...document.querySelectorAll('#modal-toppings .modal-opt.sel')];
    if (topping.classList.contains('sel')) {
      topping.classList.remove('sel');
    } else if (selected.length < 2) {
      topping.classList.add('sel');
    }
    return;
  }

  if (event.target.closest('#modal-add-btn')) {
    if (!modalItem) return;
    const sizeLabel = document.querySelector('#modal-sizes .sel')?.textContent.trim() || 'Regular · $0';
    const priceMod = sizeLabel.includes('+$1') ? 1 : 0;
    const toppings = [...document.querySelectorAll('#modal-toppings .sel')].map((button) => button.textContent.trim());
    addToCart(modalItem, sizeLabel.split('·')[0].trim(), priceMod, toppings);
    closeModal();
    return;
  }

  if (event.target.id === 'modal-bg') {
    closeModal();
    return;
  }

  if (event.target.closest('#place-order-btn')) {
    placeOrder();
    return;
  }

  if (event.target.closest('#new-order-btn')) {
    goScreen('menu-screen');
  }
});

renderMenu();
