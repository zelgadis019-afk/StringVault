const PAYMONGO_BASE = 'https://api.paymongo.com/v1'

function getAuthHeader() {
  const key = process.env.PAYMONGO_SECRET_KEY!
  return 'Basic ' + Buffer.from(key + ':').toString('base64')
}

export async function createSource(params: {
  amount: number // in centavos
  type: 'gcash' | 'paymaya'
  orderId: string
  redirectSuccess: string
  redirectFailed: string
}) {
  const res = await fetch(`${PAYMONGO_BASE}/sources`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: getAuthHeader(),
    },
    body: JSON.stringify({
      data: {
        attributes: {
          amount: params.amount,
          redirect: {
            success: params.redirectSuccess,
            failed: params.redirectFailed,
          },
          type: params.type,
          currency: 'PHP',
          metadata: { order_id: params.orderId },
        },
      },
    }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.errors?.[0]?.detail ?? 'PayMongo source error')
  return data.data
}

export async function createPaymentIntent(params: {
  amount: number // in centavos
  orderId: string
}) {
  const res = await fetch(`${PAYMONGO_BASE}/payment_intents`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: getAuthHeader(),
    },
    body: JSON.stringify({
      data: {
        attributes: {
          amount: params.amount,
          payment_method_allowed: ['card'],
          currency: 'PHP',
          metadata: { order_id: params.orderId },
          description: `StringVault Order #${params.orderId.slice(0, 8).toUpperCase()}`,
        },
      },
    }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.errors?.[0]?.detail ?? 'PayMongo intent error')
  return data.data
}

export async function attachPaymentMethod(intentId: string, paymentMethodId: string) {
  const res = await fetch(`${PAYMONGO_BASE}/payment_intents/${intentId}/attach`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: getAuthHeader(),
    },
    body: JSON.stringify({
      data: {
        attributes: { payment_method: paymentMethodId },
      },
    }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.errors?.[0]?.detail ?? 'PayMongo attach error')
  return data.data
}

export async function createPayment(sourceId: string, amount: number, orderId: string) {
  const res = await fetch(`${PAYMONGO_BASE}/payments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: getAuthHeader(),
    },
    body: JSON.stringify({
      data: {
        attributes: {
          amount,
          source: { id: sourceId, type: 'source' },
          currency: 'PHP',
          metadata: { order_id: orderId },
        },
      },
    }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.errors?.[0]?.detail ?? 'PayMongo payment error')
  return data.data
}

export function verifyWebhookSignature(payload: string, signature: string): boolean {
  const crypto = require('crypto')
  const secret = process.env.PAYMONGO_WEBHOOK_SECRET!
  const computed = crypto.createHmac('sha256', secret).update(payload).digest('hex')
  return computed === signature
}
