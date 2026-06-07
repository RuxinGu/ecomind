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

## Data Storage

Orders are saved to `DATA_DIR/orders.json`.

For Render production, `DATA_DIR` is set to `/var/data`, and the Blueprint attaches a persistent disk at `/var/data`. That keeps orders through restarts and redeploys.

## Public QR Code

After deployment, open `/qr` on the Render URL and use that QR code for customers. The QR code will point to the public Render domain, so customers do not need to be on the same Wi-Fi.
