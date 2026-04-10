import { Resend } from 'resend'
import { Order, OrderItem, Product } from '@/types'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = process.env.RESEND_FROM_EMAIL || 'orders@stringvault.ph'
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@stringvault.ph'
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://stringvault.vercel.app'

type OrderWithItems = Order & { order_items: (OrderItem & { product: Product })[] }

function itemsHtml(items: (OrderItem & { product: Product })[]) {
  return items
    .map(
      (i) => `
    <tr>
      <td style="padding:8px;border-bottom:1px solid #2e2e2e;">${i.product?.name ?? 'Product'}</td>
      <td style="padding:8px;border-bottom:1px solid #2e2e2e;text-align:center;">${i.quantity}</td>
      <td style="padding:8px;border-bottom:1px solid #2e2e2e;text-align:right;">₱${(i.unit_price * i.quantity).toFixed(2)}</td>
    </tr>`
    )
    .join('')
}

function baseTemplate(title: string, body: string) {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>${title}</title></head>
<body style="margin:0;padding:0;background:#0f0f0f;font-family:Inter,sans-serif;color:#e5e5e5;">
  <div style="max-width:600px;margin:0 auto;padding:32px 16px;">
    <div style="text-align:center;margin-bottom:32px;">
      <h1 style="color:#d4a017;font-size:28px;margin:0;">StringVault</h1>
      <p style="color:#888;font-size:12px;margin:4px 0 0;">Every string tells a story.</p>
    </div>
    ${body}
    <div style="margin-top:40px;padding-top:24px;border-top:1px solid #2e2e2e;text-align:center;color:#666;font-size:12px;">
      <p>© ${new Date().getFullYear()} StringVault. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`
}

export async function sendOrderConfirmation(order: OrderWithItems) {
  const body = `
    <h2 style="color:#d4a017;">Order Confirmed!</h2>
    <p>Hi ${order.customer_name}, thank you for your order. Here's your summary:</p>
    <p style="background:#1a1a1a;padding:12px;border-radius:8px;border-left:3px solid #d4a017;">
      <strong>Order ID:</strong> ${order.id}<br>
      <strong>Payment Method:</strong> ${order.payment_method.toUpperCase()}<br>
      <strong>Date:</strong> ${new Date(order.created_at).toLocaleDateString()}
    </p>
    <table style="width:100%;border-collapse:collapse;margin:20px 0;">
      <thead>
        <tr style="background:#1a1a1a;">
          <th style="padding:10px;text-align:left;color:#d4a017;">Item</th>
          <th style="padding:10px;text-align:center;color:#d4a017;">Qty</th>
          <th style="padding:10px;text-align:right;color:#d4a017;">Price</th>
        </tr>
      </thead>
      <tbody>${itemsHtml(order.order_items)}</tbody>
      <tfoot>
        <tr>
          <td colspan="2" style="padding:12px;font-weight:bold;text-align:right;color:#d4a017;">Total:</td>
          <td style="padding:12px;font-weight:bold;text-align:right;color:#d4a017;">₱${order.total_amount.toFixed(2)}</td>
        </tr>
      </tfoot>
    </table>
    <p style="color:#aaa;">Estimated delivery: 3–7 business days after payment confirmation.</p>
    <p><a href="${SITE_URL}/track?order=${order.id}" style="color:#d4a017;">Track your order →</a></p>`

  return resend.emails.send({
    from: FROM,
    to: order.customer_email,
    subject: `StringVault Order Confirmation – #${order.id.slice(0, 8).toUpperCase()}`,
    html: baseTemplate('Order Confirmation', body),
  })
}

export async function sendStatusUpdate(order: Order) {
  const statusColors: Record<string, string> = {
    Pending: '#888',
    Confirmed: '#d4a017',
    Shipped: '#3b82f6',
    Delivered: '#22c55e',
  }
  const color = statusColors[order.status] ?? '#d4a017'

  const body = `
    <h2 style="color:#d4a017;">Order Status Update</h2>
    <p>Hi ${order.customer_name}, your order status has been updated.</p>
    <p style="background:#1a1a1a;padding:12px;border-radius:8px;border-left:3px solid ${color};">
      <strong>Order ID:</strong> ${order.id}<br>
      <strong>New Status:</strong> <span style="color:${color};font-weight:bold;">${order.status}</span>
    </p>
    <p><a href="${SITE_URL}/track?order=${order.id}" style="color:#d4a017;">Track your order →</a></p>`

  return resend.emails.send({
    from: FROM,
    to: order.customer_email,
    subject: `Your StringVault Order is now: ${order.status}`,
    html: baseTemplate('Order Status Update', body),
  })
}

export async function sendAdminNotification(order: OrderWithItems) {
  const body = `
    <h2 style="color:#d4a017;">New Order Received</h2>
    <p style="background:#1a1a1a;padding:12px;border-radius:8px;">
      <strong>Order ID:</strong> ${order.id}<br>
      <strong>Customer:</strong> ${order.customer_name}<br>
      <strong>Email:</strong> ${order.customer_email}<br>
      <strong>Phone:</strong> ${order.customer_phone ?? 'N/A'}<br>
      <strong>Address:</strong> ${order.shipping_address}<br>
      <strong>Payment:</strong> ${order.payment_method.toUpperCase()}<br>
      <strong>Total:</strong> ₱${order.total_amount.toFixed(2)}
    </p>
    <table style="width:100%;border-collapse:collapse;margin:20px 0;">
      <thead>
        <tr style="background:#1a1a1a;">
          <th style="padding:10px;text-align:left;color:#d4a017;">Item</th>
          <th style="padding:10px;text-align:center;color:#d4a017;">Qty</th>
          <th style="padding:10px;text-align:right;color:#d4a017;">Price</th>
        </tr>
      </thead>
      <tbody>${itemsHtml(order.order_items)}</tbody>
    </table>
    <p><a href="${SITE_URL}/admin/orders/${order.id}" style="color:#d4a017;">View order in dashboard →</a></p>`

  return resend.emails.send({
    from: FROM,
    to: ADMIN_EMAIL,
    subject: `New StringVault Order – ₱${order.total_amount.toFixed(2)} from ${order.customer_name}`,
    html: baseTemplate('New Order Notification', body),
  })
}

export async function sendLowStockAlert(products: { name: string; stock: number }[]) {
  const rows = products
    .map(
      (p) =>
        `<tr><td style="padding:8px;border-bottom:1px solid #2e2e2e;">${p.name}</td>
         <td style="padding:8px;border-bottom:1px solid #2e2e2e;color:#ef4444;font-weight:bold;">${p.stock} left</td></tr>`
    )
    .join('')

  const body = `
    <h2 style="color:#ef4444;">⚠️ Low Stock Alert</h2>
    <p>The following products are running low on stock (≤ 5 units):</p>
    <table style="width:100%;border-collapse:collapse;">
      <thead><tr style="background:#1a1a1a;">
        <th style="padding:10px;text-align:left;color:#d4a017;">Product</th>
        <th style="padding:10px;text-align:left;color:#d4a017;">Stock</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <p><a href="${SITE_URL}/admin/products" style="color:#d4a017;">Manage inventory →</a></p>`

  return resend.emails.send({
    from: FROM,
    to: ADMIN_EMAIL,
    subject: `StringVault Low Stock Alert – ${products.length} product(s) need restocking`,
    html: baseTemplate('Low Stock Alert', body),
  })
}
