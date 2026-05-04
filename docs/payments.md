# Crypto Pay Integration

## Overview

RADAR uses CryptoBot (Crypto Pay) for cryptocurrency payments. Users can purchase Premium subscriptions using USDT-TRC20.

## Pricing

| Plan | Price (USDT) | Duration |
|------|-------------|----------|
| Monthly | 0.65 USDT | 30 days |
| Yearly | 5.4 USDT | 365 days (30% discount) |

## Setup

### 1. Create Crypto Pay Application
1. Open Telegram and find @CryptoBot
2. Go to Crypto Pay → Get tokens
3. Copy your `APP_ID` and `APP_TOKEN`

### 2. Configure Environment Variables
Add to `.env`:
```env
CRYPTOPAY_APP_ID=your_app_id
CRYPTOPAY_APP_TOKEN=your_app_token
CRYPTOPAY_WEBHOOK_SECRET=your_webhook_secret
CRYPTOPAY_API_URL=https://pay.crypt.bot/api
CRYPTOPAY_TESTNET=false
SITE_URL=https://radar.strateg.space
```

### 3. Configure Webhook
In Crypto Pay settings, set webhook URL:
```
https://radar.strateg.space/api/payments/crypto/webhook
```

## Testing

### Testnet Mode
1. Set `CRYPTOPAY_TESTNET=true` in `.env`
2. Use `https://testnet-pay.crypt.bot/api`
3. Get test USDT from @CryptoTestnetBot using `/faucet`

### Test Checklist
- [ ] Create invoice returns valid `pay_url`
- [ ] Webhook receives payment notification
- [ ] Signature verification works
- [ ] Payment status updates correctly
- [ ] Subscription activates on payment
- [ ] Duplicate webhooks handled (idempotency)
- [ ] Expired invoices marked correctly
- [ ] Telegram notification sent to user

## API Endpoints

### Create Invoice
```http
POST /api/payments/crypto/create-invoice
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "plan": "premium_monthly" | "premium_yearly"
}
```

Response:
```json
{
  "invoice_id": "12345",
  "pay_url": "https://t.me/CryptoBot?start=pay-12345",
  "amount_usdt": "0.65",
  "expires_at": "2026-05-04T12:00:00Z"
}
```

### Check Payment Status
```http
GET /api/payments/crypto/status/:invoiceId
Authorization: Bearer <jwt_token>
```

Response:
```json
{
  "invoice_id": "12345",
  "status": "PENDING" | "PAID" | "EXPIRED" | "FAILED",
  "amount_usdt": 0.65,
  "confirmed_at": "2026-05-04T12:05:00Z"
}
```

### Webhook (called by Crypto Pay)
```http
POST /api/payments/crypto/webhook
crypto-pay-api-signature: <hmac_sha256_signature>
Content-Type: application/json

{
  "update_id": 12345,
  "update_type": "invoice_paid",
  "payload": "{\"user_id\":1,\"plan\":\"premium_monthly\"}",
  "invoice": {
    "invoice_id": "12345",
    "status": "paid",
    "asset": "USDT",
    "amount": "0.65"
  }
}
```

## Database Schema

### CryptoPayment
```prisma
model CryptoPayment {
  id            String   @id @default(cuid())
  userId        Int
  invoiceId     String   @unique
  amountUsd     Float
  amountUsdt    Float
  asset         String
  status        CryptoPaymentStatus
  payload       String
  confirmedAt   DateTime?
  createdAt     DateTime @default(now())
}

enum CryptoPaymentStatus {
  PENDING
  PAID
  EXPIRED
  FAILED
}
```

## Security

- Webhook signature verified using HMAC-SHA256
- Payment amounts validated against expected values
- Idempotent processing (duplicate webhooks ignored)
- All secrets stored in environment variables

## Troubleshooting

### Webhook not received
1. Check webhook URL is correct in Crypto Pay settings
2. Verify server is accessible from internet
3. Check nginx is proxying to correct backend port (3002)

### Payment not activating
1. Check webhook logs: `pm2 logs radar-backend | grep crypto-pay`
2. Verify `CRYPTOPAY_WEBHOOK_SECRET` matches Crypto Pay settings
3. Check database for payment record

### Amount mismatch errors
1. Verify USDT prices in `CryptoPayService.PLAN_PRICES_USDT`
2. Check Crypto Pay API response for correct amount

## Monitoring

Logs are available via PM2:
```bash
pm2 logs radar-backend --lines 100
```

Look for:
- `[CryptoPayService] Created invoice...` - Invoice creation
- `[CryptoPayService] Payment confirmed...` - Successful payment
- `[CryptoPayService] Invalid webhook signature` - Security issues
