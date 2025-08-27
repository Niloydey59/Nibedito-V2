import { ApiResponse } from './api';

export interface OrderItem {
  _id?: string;
  product: string | {
    _id: string;
    name: string;
    price: number;
    slug: string;
    thumbnailImage?: string;
  };
  variant: string;
  quantity: number;
  cost: number;
  productDetails?: {
    name: string;
    price: number;
    slug: string;
  };
  variantDetails?: {
    color: string;
    size: string;
  };
}

export interface DiscountBreakdown {
  productDiscount: number;
  shippingDiscount: number;
}

export interface Order {
  _id: string;
  user: string | {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    addresses?: any[];
    defaultAddress?: any;
  };
  items: OrderItem[];
  street: string;
  city: string;
  state: string;
  addressDetails?: string;
  phone: string;
  email: string;
  dateOrdered: string;
  totalPrice: number;
  shippingRegion: string;
  shippingCost: number;
  freeShipping: boolean;
  coupon?: string | {
    _id: string;
    code: string;
    discountOptions: any;
  };
  couponDetails?: {
    code: string;
    productDiscount: number;
    shippingDiscount: number;
  };
  discountAmount: number;
  discountBreakdown: DiscountBreakdown;
  finalPrice: number;
  status: 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  payment?: string;
  isPaid: boolean;
  paidAt?: string;
  isGift: boolean;
  giftNote?: string;
  giftMessage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderRequest {
  cartId: string;
  street: string;
  city: string;
  state: string;
  addressDetails?: string;
  phone: string;
  email: string;
  paymentMethod: string;
  couponId?: string;
  couponCode?: string;
  productDiscountAmount?: number;
  shippingDiscountAmount?: number;
  finalPrice: number;
  shippingRegion: string;
  isGift?: boolean;
  giftNote?: string;
}

export interface GetAllOrdersParams {
  status?: string;
  userId?: string;
  isGift?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  order?: 'asc' | 'desc';
}

export interface OrdersResponse {
  orders: Order[];
  pagination: {
    total: number;
    page: number;
    pages: number;
  };
}

export interface UpdateOrderStatusRequest {
  status: string;
}

export interface UpdateOrderPaymentStatusRequest {
  isPaid: boolean;
}

export interface OrderService {
  createOrder(orderData: CreateOrderRequest): Promise<{ success: boolean; data?: Order; error?: string }>;
  getUserOrders(): Promise<{ success: boolean; data?: Order[]; error?: string }>;
  getOrderById(orderId: string): Promise<{ success: boolean; data?: Order; error?: string }>;
  getAllOrders?(params?: GetAllOrdersParams): Promise<ApiResponse<OrdersResponse>>;
  updateOrderStatus?(orderId: string, status: string): Promise<ApiResponse<{ order: Order }>>;
  updateOrderPaymentStatus?(orderId: string, isPaid: boolean): Promise<ApiResponse<{ order: Order }>>;
  deleteOrder?(orderId: string): Promise<ApiResponse>;
}
