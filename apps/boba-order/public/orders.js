function money(value) {
  return `$${Number(value || 0).toFixed(2)}`;
}

function timeLabel(value) {
  return new Date(value).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

function escapeHtml(value) {
  return String(value || '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  })[char]);
}

function orderCard(order) {
  const customerLine = [
    order.customer?.name,
    order.customer?.phone,
    order.customer?.table
  ].filter(Boolean).map(escapeHtml).join(' · ');
  const notes = order.notes ? `<p class="owner-meta"><strong>Notes:</strong> ${escapeHtml(order.notes)}</p>` : '';
  const completeButton = order.status === 'new'
    ? `<button class="complete-btn" type="button" data-complete="${order.id}">Mark complete</button>`
    : '';
  const paymentStatus = order.payment?.status || 'unpaid';
  const paymentText = paymentStatus === 'paid' ? 'Paid online' : paymentStatus === 'pending' ? 'Payment pending' : 'Unpaid';

  return `<article class="owner-card ${order.status === 'completed' ? 'completed' : ''}">
    <div class="owner-card-head">
      <div>
        <h3>${escapeHtml(order.number)}</h3>
        <div class="order-time">${timeLabel(order.createdAt)}</div>
      </div>
      <div class="owner-actions">
        <span class="payment-pill ${paymentStatus === 'paid' ? 'paid' : ''}">${paymentText}</span>
        ${completeButton}
      </div>
    </div>
    <p class="owner-meta">${customerLine || 'No customer details'}</p>
    <p class="owner-meta"><strong>Sweetness / Ice:</strong> ${escapeHtml(order.preferences?.sweetness)} / ${escapeHtml(order.preferences?.ice)}</p>
    ${notes}
    <div class="owner-items">
      ${(order.items || []).map((item) => `
        <div class="owner-item">
          <strong>${item.qty}x</strong>
          <div>
            <strong>${escapeHtml(item.name)}</strong>
            <div class="owner-mods">${escapeHtml(item.size)} · ${escapeHtml((item.toppings || []).join(', ') || 'No toppings')}</div>
          </div>
          <span>${money(item.price * item.qty)}</span>
        </div>`).join('')}
    </div>
    <div class="owner-total">
      <span>Total estimate</span>
      <span>${money(order.total)}</span>
    </div>
  </article>`;
}

function renderOrders(orders) {
  const fresh = orders.filter((order) => order.status === 'new');
  const completed = orders.filter((order) => order.status === 'completed');
  document.getElementById('new-count').textContent = fresh.length;
  document.getElementById('complete-count').textContent = completed.length;
  document.getElementById('new-orders').innerHTML = fresh.length
    ? fresh.map(orderCard).join('')
    : '<div class="empty-state">No new orders yet.</div>';
  document.getElementById('completed-orders').innerHTML = completed.length
    ? completed.slice(0, 20).map(orderCard).join('')
    : '<div class="empty-state">Completed orders will appear here.</div>';
}

async function loadOrders() {
  const res = await fetch('/api/orders');
  const data = await res.json();
  renderOrders(data.orders || []);
}

async function markComplete(id) {
  await fetch(`/api/orders/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'completed' })
  });
  await loadOrders();
}

document.addEventListener('click', (event) => {
  const button = event.target.closest('[data-complete]');
  if (button) markComplete(button.dataset.complete);
});

loadOrders();
setInterval(loadOrders, 4000);
