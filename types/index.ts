export interface Product {
  id: string
  name: string
  brand: string | null
  category: 'electric' | 'acoustic' | 'bass' | 'accessory'
  description: string | null
  price: number
  stock: number
  image_url: string | null
  created_at: string
  avg_rating?: number
  review_count?: number
}

export interface Order {
  id: string
  customer_name: string
  customer_email: string
  customer_phone: string | null
  shipping_address: string
  payment_method: 'gcash' | 'maya' | 'card'
  payment_status: 'Unpaid' | 'Paid' | 'Failed'
  paymongo_payment_id: string | null
  status: 'Pending' | 'Confirmed' | 'Shipped' | 'Delivered'
  total_amount: number
  created_at: string
  order_items?: OrderItem[]
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  quantity: number
  unit_price: number
  product?: Product
}

export interface Review {
  id: string
  product_id: string
  reviewer_name: string
  rating: number
  comment: string | null
  approved: boolean
  created_at: string
}

export interface Admin {
  id: string
  email: string
}

export interface CartItem {
  product: Product
  quantity: number
}
