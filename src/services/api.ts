import { AppStateData, SalesOrder, PurchaseRecord, ProductionRecord, EmployeeTaskWork } from '../types';

export const api = {
  async getState(): Promise<AppStateData> {
    const res = await fetch('/api/state');
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to fetch state');
    return json.data;
  },

  async recordPurchase(payload: any): Promise<PurchaseRecord> {
    const res = await fetch('/api/purchase', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Gagal menyimpan pembelian');
    return json.data;
  },

  async recordProduction(payload: any): Promise<ProductionRecord> {
    const res = await fetch('/api/production', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Gagal mencatat produksi');
    return json.data;
  },

  async recordOrder(payload: any): Promise<SalesOrder> {
    const res = await fetch('/api/order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Gagal membuat pesanan');
    return json.data;
  },

  async updateOrderStatus(id: string, status: string): Promise<SalesOrder> {
    const res = await fetch(`/api/order/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Gagal mengubah status');
    return json.data;
  },

  async approveSpecialPrice(id: string, approved: boolean): Promise<SalesOrder> {
    const res = await fetch(`/api/order/${id}/approve-price`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ approved })
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Gagal memproses persetujuan harga');
    return json.data;
  },

  async payCustomerDebt(customerId: string, amount: number, akunKas: string): Promise<boolean> {
    const res = await fetch(`/api/customer/${customerId}/pay`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, akunKas })
    });
    const json = await res.json();
    return json.success;
  },

  async paySupplierDebt(supplierId: string, amount: number, akunKas: string): Promise<boolean> {
    const res = await fetch(`/api/supplier/${supplierId}/pay`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, akunKas })
    });
    const json = await res.json();
    return json.success;
  },

  async addCustomer(customer: any): Promise<any> {
    const res = await fetch('/api/customer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(customer)
    });
    const json = await res.json();
    return json.data;
  },

  async updateCustomer(id: string, updates: any): Promise<any> {
    const res = await fetch(`/api/customer/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Gagal memperbarui data customer');
    return json.data;
  },

  async deleteCustomer(id: string): Promise<boolean> {
    const res = await fetch(`/api/customer/${id}`, { method: 'DELETE' });
    const json = await res.json();
    return json.success;
  },

  // Stock CRUD
  async addStock(stock: any): Promise<any> {
    const res = await fetch('/api/stock', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(stock)
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Gagal menambah stok produk');
    return json.data;
  },

  async updateStock(id: string, updates: any): Promise<any> {
    const res = await fetch(`/api/stock/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Gagal mengubah data stok');
    return json.data;
  },

  async deleteStock(id: string): Promise<boolean> {
    const res = await fetch(`/api/stock/${id}`, { method: 'DELETE' });
    const json = await res.json();
    return json.success;
  },

  // Order CRUD
  async updateOrder(id: string, updates: any): Promise<any> {
    const res = await fetch(`/api/order/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Gagal mengubah data order');
    return json.data;
  },

  async deleteOrder(id: string): Promise<boolean> {
    const res = await fetch(`/api/order/${id}`, { method: 'DELETE' });
    const json = await res.json();
    return json.success;
  },

  // Direct Cash / Bank Movement (Buku Kas & Bank)
  async recordCash(payload: any): Promise<any> {
    const res = await fetch('/api/cash', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Gagal menyimpan transaksi kas');
    return json.data;
  },

  async updateCash(id: string, updates: any): Promise<any> {
    const res = await fetch(`/api/cash/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Gagal mengubah transaksi kas');
    return json.data;
  },

  async deleteCash(id: string): Promise<boolean> {
    const res = await fetch(`/api/cash/${id}`, { method: 'DELETE' });
    const json = await res.json();
    return json.success;
  },

  // Supplier CRUD
  async addSupplier(supplier: any): Promise<any> {
    const res = await fetch('/api/supplier', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(supplier)
    });
    const json = await res.json();
    return json.data;
  },

  async updateSupplier(id: string, updates: any): Promise<any> {
    const res = await fetch(`/api/supplier/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Gagal mengubah supplier');
    return json.data;
  },

  async deleteSupplier(id: string): Promise<boolean> {
    const res = await fetch(`/api/supplier/${id}`, { method: 'DELETE' });
    const json = await res.json();
    return json.success;
  },

  // Employee CRUD
  async addEmployee(employee: any): Promise<any> {
    const res = await fetch('/api/employee', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(employee)
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Gagal menambah karyawan');
    return json.data;
  },

  async updateEmployee(id: string, updates: any): Promise<any> {
    const res = await fetch(`/api/employee/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Gagal mengubah data karyawan');
    return json.data;
  },

  async deleteEmployee(id: string): Promise<boolean> {
    const res = await fetch(`/api/employee/${id}`, { method: 'DELETE' });
    const json = await res.json();
    return json.success;
  },

  // WhatsApp Notification API
  async getWhatsAppReceipt(orderId: string): Promise<any> {
    const res = await fetch(`/api/whatsapp/receipt/${orderId}`);
    const json = await res.json();
    return json.data;
  },

  async sendWhatsAppOrder(orderId: string): Promise<any> {
    const res = await fetch(`/api/whatsapp/receipt/${orderId}`);
    const json = await res.json();
    return json.data;
  },

  async getWhatsAppDailyRecap(): Promise<any> {
    const res = await fetch('/api/whatsapp/recap');
    const json = await res.json();
    return json.data;
  },

  async sendWhatsAppNotification(payload: { phone?: string; message: string; groupLink?: string }): Promise<any> {
    const res = await fetch('/api/whatsapp/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return res.json();
  },

  async recordEmployeeTask(task: any): Promise<EmployeeTaskWork> {
    const res = await fetch('/api/employee/task', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(task)
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Gagal menyimpan hasil kerja');
    return json.data;
  },

  async recordAttendance(pegawaiId: string, status: string, catatan?: string): Promise<any> {
    const res = await fetch('/api/employee/attendance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pegawaiId, status, catatan })
    });
    const json = await res.json();
    return json.data;
  },

  async pushGoogleSheets(): Promise<any> {
    const res = await fetch('/api/sync/sheets/push', { method: 'POST' });
    return res.json();
  },

  async exportGoogleSheets(): Promise<any> {
    const res = await fetch('/api/sync/sheets/export');
    return res.json();
  },

  async syncCloudflare(payload?: any): Promise<any> {
    const res = await fetch('/api/sync/cloudflare', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ payload })
    });
    return res.json();
  },

  async updateSyncSettings(settings: any): Promise<any> {
    const res = await fetch('/api/sync/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    });
    return res.json();
  }
};

export function formatRupiah(num: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(num);
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('id-ID').format(num);
}
