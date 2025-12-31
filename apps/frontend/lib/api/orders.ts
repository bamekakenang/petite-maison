import { apiClient, ApiResponse } from './client';
import { Product } from './products';
import { User } from './auth';

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';

export interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  product: Product;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  createdAt: string;
}

export interface Order {
  id: number;
  orderNumber: string;
  userId: number;
  user?: User;
  status: OrderStatus;
  totalAmount: number;
  shippingAddress: string;
  billingAddress: string;
  paymentMethod: string;
  paymentStatus: PaymentStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
}

export interface CreateOrderData {
  items: Array<{
    productId: number;
    quantity: number;
  }>;
  shippingAddress: string;
  billingAddress: string;
  paymentMethod?: string;
  notes?: string;
}

export interface OrderStats {
  total: number;
  byStatus: {
    pending: number;
    confirmed: number;
    processing: number;
    shipped: number;
    delivered: number;
    cancelled: number;
  };
  totalRevenue: number;
}

export const ordersApi = {
  async getOrders(page = 1, limit = 10): Promise<ApiResponse<Order[]>> {
    return apiClient.get<Order[]>(`/orders?page=${page}&limit=${limit}`);
  },

  async getOrder(id: number): Promise<ApiResponse<Order>> {
    return apiClient.get<Order>(`/orders/${id}`);
  },

  async createOrder(data: CreateOrderData): Promise<ApiResponse<Order>> {
    return apiClient.post<Order>('/orders', data);
  },

  async updateOrderStatus(id: number, status: OrderStatus): Promise<ApiResponse<Order>> {
    return apiClient.put<Order>(`/orders/${id}/status`, { status });
  },

  async processPayment(id: number): Promise<ApiResponse<Order>> {
    return apiClient.post<Order>(`/orders/${id}/pay`);
  },

  async getOrderStats(): Promise<ApiResponse<OrderStats>> {
    return apiClient.get<OrderStats>('/orders/stats');
  },
};
