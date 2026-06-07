# Boba Garden Public Deployment

This app is ready to deploy as a public Render web service.

## Render Blueprint

The root `render.yaml` includes a `boba-garden-orders` service.

1. Push this repository to GitHub.
2. In Render, create or sync a Blueprint from `render.yaml`.
3. Deploy the `boba-garden-orders` service.
4. Open the deployed service URL.

Useful pages:

- Customer ordering page: `/`
- Owner orders screen: `/orders`
- QR code page: `/qr`
- Health check: `/health`

## Online Payments

Online payment uses Stripe Checkout. Customers enter card details on Stripe's hosted payment page.

Add these environment variables in Render before enabling payment:

- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `PUBLIC_URL=https://boba-garden-orders.onrender.com`

Create a Stripe webhook endpoint that points to:

`https://boba-garden-orders.onrender.com/api/stripe/webhook`

Subscribe the webhook to:

- `checkout.session.completed`

Orders start as unpaid. When Stripe confirms the Checkout Session through the webhook, the owner screen marks the order as paid.

## Data Storage

Orders are saved to `DATA_DIR/orders.json`.

For Render production, `DATA_DIR` is set to `/var/data`, and the Blueprint attaches a persistent disk at `/var/data`. That keeps orders through restarts and redeploys.

## Public QR Code

After deployment, open `/qr` on the Render URL and use that QR code for customers. The QR code will point to the public Render domain, so customers do not need to be on the same Wi-Fi.
