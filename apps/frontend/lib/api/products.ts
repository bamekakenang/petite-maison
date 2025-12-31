import { apiClient, ApiResponse } from './client';

export interface Product {
  id: number;
  sku: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  category: string;
  imageUrl?: string;
  isActive: boolean;
  minStock: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  search?: string;
}

export interface ProductListParams extends ProductFilters {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const productsApi = {
  async getProducts(params: ProductListParams = {}): Promise<ApiResponse<Product[]>> {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.set('page', params.page.toString());
    if (params.limit) queryParams.set('limit', params.limit.toString());
    if (params.category) queryParams.set('category', params.category);
    if (params.minPrice !== undefined) queryParams.set('minPrice', params.minPrice.toString());
    if (params.maxPrice !== undefined) queryParams.set('maxPrice', params.maxPrice.toString());
    if (params.inStock !== undefined) queryParams.set('inStock', params.inStock.toString());
    if (params.search) queryParams.set('search', params.search);
    if (params.sortBy) queryParams.set('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.set('sortOrder', params.sortOrder);

    const query = queryParams.toString();
    return apiClient.get<Product[]>(`/products${query ? `?${query}` : ''}`);
  },

  async getProduct(id: number): Promise<ApiResponse<Product>> {
    return apiClient.get<Product>(`/products/${id}`);
  },

  async getCategories(): Promise<ApiResponse<string[]>> {
    return apiClient.get<string[]>('/products/categories');
  },

  async getLowStock(): Promise<ApiResponse<Product[]>> {
    return apiClient.get<Product[]>('/products/low-stock');
  },

  async createProduct(data: Partial<Product>): Promise<ApiResponse<Product>> {
    return apiClient.post<Product>('/products', data);
  },

  async updateProduct(id: number, data: Partial<Product>): Promise<ApiResponse<Product>> {
    return apiClient.put<Product>(`/products/${id}`, data);
  },

  async deleteProduct(id: number): Promise<ApiResponse<void>> {
    return apiClient.delete(`/products/${id}`);
  },
};
