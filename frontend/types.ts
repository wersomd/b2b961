export enum Role {
  ADMIN = 'ADMIN',
  CLIENT = 'CLIENT',
  SELLER = 'SELLER',
  DRIVER = 'DRIVER'
}

export enum OrderStatus {
  NEW = 'NEW',
  UNDER_CHECK = 'UNDER_CHECK',
  APPROVED = 'APPROVED',
  ASSEMBLING = 'ASSEMBLING',
  TO_DRIVER = 'TO_DRIVER',
  ON_DELIVERY = 'ON_DELIVERY',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  password?: string; // Only for mock logic, do not return from real backend
  companyName?: string;
}

export interface Product {
  id: string;
  name: string;
  unit: string;
  isActive: boolean;
}

export interface OrderItem {
  id: string;
  productId: string | null;
  productName: string;
  quantity: number;
  sellerComment?: string;
}

export interface Order {
  id: string;
  title: string;
  requestDate: string; // ISO Date
  deliveryDate: string; // ISO Date
  createdBy: string; // User ID
  createdByName: string;
  projectName?: string;
  status: OrderStatus;
  comment: string;
  deliveryAddress: string;
  items: OrderItem[];
}