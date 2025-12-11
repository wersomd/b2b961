import {
  Order,
  OrderItem,
  OrderStatus,
  Product,
  Role,
  User,
} from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

class ApiClient {
  private token: string | null = null;
  private currentUser: User | null = null;

  private get authHeaders() {
    return this.token
      ? { Authorization: `Bearer ${this.token}` }
      : {};
  }

  private async handleResponse<T>(res: Response): Promise<T> {
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(text || `HTTP error ${res.status}`);
    }
    return res.json() as Promise<T>;
  }

  private mapUser(api: any): User {
    return {
      id: String(api.id),
      name: api.name,
      email: api.email,
      role: api.role as Role,
      companyName: api.companyName ?? undefined,
    };
  }

  private mapProduct(api: any): Product {
    return {
      id: String(api.id),
      name: api.name,
      unit: api.unit ?? 'шт',
      isActive: api.is_active ?? api.isActive ?? true,
    };
  }

  private mapOrderItem(api: any): OrderItem {
    return {
      id: String(api.id),
      productId: api.product_id != null ? String(api.product_id) : null,
      productName: api.product_name,
      quantity: api.quantity,
      sellerComment: api.seller_comment ?? undefined,
    };
  }

  private mapOrder(api: any): Order {
    return {
      id: String(api.id),
      title: api.title,
      requestDate: api.request_date,
      deliveryDate: api.delivery_date ?? '',
      createdBy: String(api.created_by_id),
      createdByName: 'Client',
      projectName: api.project_name ?? '',
      status: api.status as OrderStatus,
      comment: api.comment ?? '',
      deliveryAddress: api.delivery_address ?? '',
      items: (api.items ?? []).map((it: any) => this.mapOrderItem(it)),
    };
  }

  private persistSession(token: string, user: User) {
    this.token = token;
    this.currentUser = user;
    localStorage.setItem('auth_token', token);
    localStorage.setItem('auth_user', JSON.stringify(user));
  }

  setToken(token: string | null) {
    this.token = token;
    if (!token) {
      localStorage.removeItem('auth_token');
    }
  }

  logout() {
    this.token = null;
    this.currentUser = null;
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  }

  async restoreSession(): Promise<User | null> {
    const storedToken = localStorage.getItem('auth_token');
    if (!storedToken) return null;

    this.token = storedToken;

    try {
      const user = await this.getCurrentUser();
      this.currentUser = user;
      localStorage.setItem('auth_user', JSON.stringify(user));
      return user;
    } catch (err) {
      this.logout();
      return null;
    }
  }

  async getCurrentUser(): Promise<User> {
    const res = await fetch(`${API_URL}/auth/me`, {
      headers: {
        'Accept': 'application/json',
        ...this.authHeaders,
      },
    });

    const data = await this.handleResponse<any>(res);
    return this.mapUser(data);
  }

  // ---------- Auth ----------

  async login(email: string, password: string): Promise<User> {
    const body = new URLSearchParams();
    body.append('username', email);
    body.append('password', password);

    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body,
    });

    const data = await this.handleResponse<any>(res);
    const user = this.mapUser(data.user);
    this.persistSession(data.access_token, user);
    return user;
  }

  // ---------- Users (Admin) ----------

  async getAllUsers(): Promise<User[]> {
    const res = await fetch(`${API_URL}/users`, {
      headers: {
        'Accept': 'application/json',
        ...this.authHeaders,
      },
    });
    const data = await this.handleResponse<any[]>(res);
    return data.map(u => this.mapUser(u));
  }

  async createUser(userData: Partial<User>): Promise<User> {
    const payload = {
      name: userData.name || 'New User',
      email: userData.email || '',
      role: userData.role || Role.CLIENT,
      // @ts-ignore
      password: (userData as any).password || '12345',
    };

    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.authHeaders,
      },
      body: JSON.stringify(payload),
    });

    const data = await this.handleResponse<any>(res);
    return this.mapUser(data);
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const payload: any = {};
    if (updates.name !== undefined) payload.name = updates.name;
    if (updates.email !== undefined) payload.email = updates.email;
    if (updates.role !== undefined) payload.role = updates.role;
    // @ts-ignore
    if ((updates as any).password !== undefined) payload.password = (updates as any).password;

    const res = await fetch(`${API_URL}/users/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...this.authHeaders,
      },
      body: JSON.stringify(payload),
    });

    const data = await this.handleResponse<any>(res);
    return this.mapUser(data);
  }

  async deleteUser(id: string): Promise<void> {
    const res = await fetch(`${API_URL}/users/${id}`, {
      method: 'DELETE',
      headers: {
        ...this.authHeaders,
      },
    });
    if (!res.ok) {
      throw new Error(`Failed to delete user: ${res.status}`);
    }
  }

  // ---------- Products ----------

  async getProducts(): Promise<Product[]> {
    const res = await fetch(`${API_URL}/products`, {
      headers: {
        'Accept': 'application/json',
        ...this.authHeaders,
      },
    });
    const data = await this.handleResponse<any[]>(res);
    return data.map(p => this.mapProduct(p));
  }

  async createProduct(name: string, unit: string): Promise<Product> {
    const payload = { name, unit, is_active: true };

    const res = await fetch(`${API_URL}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.authHeaders,
      },
      body: JSON.stringify(payload),
    });

    const data = await this.handleResponse<any>(res);
    return this.mapProduct(data);
  }

  async importProducts(newProducts: Array<{ name: string; unit: string }>): Promise<void> {
    const res = await fetch(`${API_URL}/products/import-json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.authHeaders,
      },
      body: JSON.stringify(newProducts),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(text || 'Failed to import products');
    }
  }

  // ---------- Orders ----------

  async getOrders(_user: User): Promise<Order[]> {
    const res = await fetch(`${API_URL}/orders`, {
      headers: {
        'Accept': 'application/json',
        ...this.authHeaders,
      },
    });

    const data = await this.handleResponse<any[]>(res);
    return data.map(o => this.mapOrder(o));
  }

  async getOrderById(orderId: string): Promise<Order | null> {
    const res = await fetch(`${API_URL}/orders/${orderId}`, {
      headers: {
        'Accept': 'application/json',
        ...this.authHeaders,
      },
    });

    if (res.status === 404) return null;
    const data = await this.handleResponse<any>(res);
    return this.mapOrder(data);
  }

  async createOrder(orderData: Partial<Order>, user: User): Promise<Order> {
    const today = new Date().toISOString().slice(0, 10);
    const deliveryDate = orderData.deliveryDate
      ? orderData.deliveryDate.slice(0, 10)
      : today;

    const itemsPayload = (orderData.items || []).map((item) => ({
      product_id: item.productId ? Number(item.productId) : null,
      product_name: item.productName,
      quantity: item.quantity,
      seller_comment: item.sellerComment || null,
    }));

    const payload = {
      title: orderData.title || 'New order',
      request_date: today,
      delivery_date: deliveryDate,
      project_name: orderData.projectName || '',
      status: OrderStatus.NEW,
      comment: orderData.comment || '',
      delivery_address: orderData.deliveryAddress || '',
      items: itemsPayload,
    };

    const res = await fetch(`${API_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.authHeaders,
      },
      body: JSON.stringify(payload),
    });

    const data = await this.handleResponse<any>(res);
    return this.mapOrder(data);
  }

  async updateOrder(orderId: string, updates: Partial<Order>): Promise<Order> {
    if (updates.status) {
      await fetch(`${API_URL}/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...this.authHeaders,
        },
        body: JSON.stringify({ status: updates.status }),
      });
    }

    if (updates.items && updates.items.length > 0) {
      for (const item of updates.items) {
        const itemPayload: any = {};
        if (item.productName !== undefined) itemPayload.product_name = item.productName;
        if (item.quantity !== undefined) itemPayload.quantity = item.quantity;
        if (item.sellerComment !== undefined) itemPayload.seller_comment = item.sellerComment;

        await fetch(`${API_URL}/orders/${orderId}/items/${item.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            ...this.authHeaders,
          },
          body: JSON.stringify(itemPayload),
        });
      }
    }

    const updated = await this.getOrderById(orderId);
    if (!updated) {
      throw new Error('Order not found after update');
    }
    return updated;
  }
}

export const db = new ApiClient();
