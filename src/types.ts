export type ProductCategory = 'ropa' | 'calzado';

export type ProductSubcategory = 
  | 'camisetas' 
  | 'sudaderas' 
  | 'chaquetas' 
  | 'pantalones' 
  | 'vestidos'
  | 'zapatillas' 
  | 'botas' 
  | 'casual' 
  | 'elegante';

export interface SizeStock {
  size: string;
  stock: number;
}

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  subcategory: ProductSubcategory;
  price: number;
  originalPrice?: number;
  description: string;
  images: string[];
  colors: string[];
  sizes: SizeStock[];
  featured?: boolean;
  isNew?: boolean;
  rating: number;
  reviewCount: number;
  sku: string;
  material?: string;
}

export interface CartItem {
  productId: string;
  product: Product;
  selectedSize: string;
  selectedColor: string;
  quantity: number;
}

export interface ShippingDetails {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

export type PaymentMethodType = 'card' | 'paypal' | 'apple_pay' | 'bizum';

export interface PaymentDetails {
  method: PaymentMethodType;
  cardNumber?: string;
  cardHolder?: string;
  expiryDate?: string;
  cvv?: string;
  bizumPhone?: string;
}

export interface Order {
  id: string;
  date: string;
  items: {
    productId: string;
    productName: string;
    productImage: string;
    size: string;
    color: string;
    price: number;
    quantity: number;
  }[];
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  shippingDetails: ShippingDetails;
  paymentMethod: PaymentMethodType;
  status: 'completado' | 'procesando' | 'enviado';
}

export interface InventoryLog {
  id: string;
  timestamp: string;
  productId: string;
  productName: string;
  size: string;
  type: 'venta' | 'reposicion' | 'ajuste' | 'nuevo';
  quantityChange: number;
  newStock: number;
  reason?: string;
}

export interface Coupon {
  code: string;
  discountPercentage: number;
  minSpend?: number;
  description: string;
}
