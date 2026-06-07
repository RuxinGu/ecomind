import express from 'express';
import { randomUUID } from 'node:crypto';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { mkdir, readFile, writeFile } from 'node:fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const appRoot = path.resolve(__dirname, '..');
const publicDir = path.join(appRoot, 'public');
const dataDir = process.env.DATA_DIR || path.join(appRoot, 'data');
const ordersFile = path.join(dataDir, 'orders.json');

const app = express();
const port = Number(process.env.PORT || 5050);

app.set('trust proxy', true);
app.use(express.json({ limit: '1mb' }));
app.use(express.static(publicDir));

let writeQueue = Promise.resolve();

function localIpAddress() {
  const nets = os.networkInterfaces();
  for (const entries of Object.values(nets)) {
    for (const net of entries || []) {
      if (net.family === 'IPv4' && !net.internal) return net.address;
    }
  }
  return 'localhost';
}

function publicBaseUrl(req) {
  const configured = process.env.PUBLIC_URL?.trim();
  if (configured) return configured.replace(/\/$/, '');

  const requestHost = req.get('x-forwarded-host') || req.get('host');
  if (process.env.NODE_ENV === 'production' && requestHost) {
    const proto = (req.get('x-forwarded-proto') || 'https').split(',')[0];
    return `${proto}://${requestHost}`;
  }

  const host = localIpAddress();
  return `http://${host}:${port}`;
}

async function readOrders() {
  try {
    await mkdir(dataDir, { recursive: true });
    const raw = await readFile(ordersFile, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function saveOrders(orders) {
  await mkdir(dataDir, { recursive: true });
  writeQueue = writeQueue.then(() => writeFile(ordersFile, `${JSON.stringify(orders, null, 2)}\n`));
  return writeQueue;
}

function money(value) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.round(number * 100) / 100 : 0;
}

function cleanText(value, max = 120) {
  return String(value || '').trim().slice(0, max);
}

function normalizeOrder(body) {
  const items = Array.isArray(body.items) ? body.items : [];
  const safeItems = items
    .map((entry) => ({
      name: cleanText(entry.name, 80),
      size: cleanText(entry.size, 30) || 'Regular',
      toppings: Array.isArray(entry.toppings) ? entry.toppings.map((t) => cleanText(t, 40)).filter(Boolean).slice(0, 4) : [],
      qty: Math.max(1, Math.min(20, Number.parseInt(entry.qty, 10) || 1)),
      price: money(entry.price)
    }))
    .filter((entry) => entry.name);

  const customer = {
    name: cleanText(body.customer?.name, 80),
    phone: cleanText(body.customer?.phone, 40),
    table: cleanText(body.customer?.table, 80)
  };

  return {
    customer,
    items: safeItems,
    preferences: {
      sweetness: cleanText(body.preferences?.sweetness, 20) || '50%',
      ice: cleanText(body.preferences?.ice, 30) || 'Regular'
    },
    notes: cleanText(body.notes, 500),
    subtotal: money(body.subtotal),
    tax: money(body.tax),
    total: money(body.total)
  };
}

function orderNumber() {
  return `B${Math.floor(1000 + Math.random() * 9000)}`;
}

app.get('/health', (req, res) => {
  res.json({ ok: true });
});

app.get('/api/config', (req, res) => {
  const baseUrl = publicBaseUrl(req);
  res.json({
    baseUrl,
    orderUrl: `${baseUrl}/`,
    ownerUrl: `${baseUrl}/orders`,
    qrUrl: `${baseUrl}/qr`
  });
});

app.get('/api/orders', async (req, res) => {
  const orders = await readOrders();
  res.json({ orders: orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) });
});

app.post('/api/orders', async (req, res) => {
  const input = normalizeOrder(req.body || {});
  if (!input.customer.name) return res.status(400).json({ error: 'Customer name is required.' });
  if (input.items.length === 0) return res.status(400).json({ error: 'Order must include at least one item.' });

  const orders = await readOrders();
  const now = new Date().toISOString();
  const order = {
    id: randomUUID(),
    number: orderNumber(),
    status: 'new',
    createdAt: now,
    updatedAt: now,
    ...input
  };

  orders.push(order);
  await saveOrders(orders);
  res.status(201).json({ order });
});

app.patch('/api/orders/:id', async (req, res) => {
  const status = cleanText(req.body?.status, 20);
  if (!['new', 'completed'].includes(status)) return res.status(400).json({ error: 'Invalid status.' });

  const orders = await readOrders();
  const order = orders.find((entry) => entry.id === req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found.' });

  order.status = status;
  order.updatedAt = new Date().toISOString();
  await saveOrders(orders);
  res.json({ order });
});

app.get('/orders', (req, res) => {
  res.sendFile(path.join(publicDir, 'orders.html'));
});

app.get('/qr', (req, res) => {
  res.sendFile(path.join(publicDir, 'qr.html'));
});

app.listen(port, '0.0.0.0', () => {
  const localBaseUrl = `http://${localIpAddress()}:${port}`;
  console.log(`Boba Garden order page: ${process.env.PUBLIC_URL || localBaseUrl}`);
  console.log(`Owner orders screen: ${(process.env.PUBLIC_URL || localBaseUrl).replace(/\/$/, '')}/orders`);
  console.log(`QR page: ${(process.env.PUBLIC_URL || localBaseUrl).replace(/\/$/, '')}/qr`);
  console.log(`Order data file: ${ordersFile}`);
});
