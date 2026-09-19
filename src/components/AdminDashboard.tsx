import React, { useState } from 'react';
import { AppStateData, OrderStatus, StockItem, Supplier } from '../types';
import { formatRupiah, formatNumber, api } from '../services/api';
import { 
  Inbox, 
  ShoppingCart, 
  Scissors, 
  Truck, 
  Package, 
  Users, 
  Wallet, 
  Plus, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  FileText,
  Printer,
  Edit2,
  Trash2,
  X,
  MessageSquare,
  ExternalLink,
  Save
} from 'lucide-react';

interface Props {
  state: AppStateData;
  onRefresh: () => void;
}

export const AdminDashboard: React.FC<Props> = ({ state, onRefresh }) => {
  const [activeTab, setActiveTab] = useState<'pesanan' | 'pembelian' | 'produksi' | 'pengiriman' | 'stok' | 'partner' | 'kas'>('pesanan');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal / Form States
  const [showPurchaseForm, setShowPurchaseForm] = useState(false);
  const [purchaseData, setPurchaseData] = useState({
    supplierId: state.suppliers[0]?.id || '',
    tanggal: new Date().toISOString().slice(0, 10),
    jumlahEkor: 500,
    beratKg: 1000,
    hargaPerKg: 23500,
    statusBayar: 'lunas' as 'lunas' | 'utang',
    catatan: ''
  });

  const [showProductionForm, setShowProductionForm] = useState(false);
  const [productionData, setProductionData] = useState({
    tanggal: new Date().toISOString().slice(0, 10),
    operatorNama: 'Tim Potong Shift Subuh',
    ekorMasuk: 300,
    kgHidup: 600,
    hasilKarkasKg: 435,
    hasilJeroanKg: 48,
    hasilKepalaCekerKg: 60,
    biayaPotong: 450000,
    catatan: ''
  });

  const [showKasForm, setShowKasForm] = useState(false);
  const [kasData, setKasData] = useState({
    tanggal: new Date().toISOString().slice(0, 10),
    tipe: 'keluar' as 'keluar',
    kategori: 'operasional' as any,
    jumlah: 150000,
    keterangan: 'Pembelian es balok & plastik packing',
    akunKas: 'Kas Operasional' as const
  });

  // Partner Form State
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [customerData, setCustomerData] = useState({
    nama: '',
    jenis: 'pedagang' as any,
    area: '',
    noHp: '',
    limitKredit: 5000000,
    catatan: ''
  });

  // Handlers
  const handleSavePurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const sup = state.suppliers.find(s => s.id === purchaseData.supplierId);
      const totalBiaya = purchaseData.beratKg * purchaseData.hargaPerKg;
      await api.recordPurchase({
        ...purchaseData,
        supplierNama: sup ? sup.nama : 'Supplier Unggas',
        totalBiaya
      });
      alert('Pembelian ayam berhasil dicatat! Stok ayam hidup & jurnal otomatis bertambah.');
      setShowPurchaseForm(false);
      onRefresh();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveProduction = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.recordProduction(productionData);
      alert('Pemotongan berhasil dicatat! Stok ayam hidup berkurang, stok karkas bertambah, rendemen terhitung otomatis.');
      setShowProductionForm(false);
      onRefresh();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: OrderStatus) => {
    try {
      await api.updateOrderStatus(orderId, status);
      onRefresh();
    } catch (err: any) {
      alert(`Gagal: ${err.message}`);
    }
  };

  const handleSaveCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.addCustomer(customerData);
      alert('Customer baru berhasil didaftarkan');
      setShowCustomerForm(false);
      onRefresh();
    } catch (err: any) {
      alert(`Gagal: ${err.message}`);
    }
  };

  // Stock CRUD state & handlers
  const [showStockModal, setShowStockModal] = useState(false);
  const [editingStock, setEditingStock] = useState<StockItem | null>(null);
  const [stockForm, setStockForm] = useState({
    kode: '',
    nama: '',
    kategori: 'karkas' as any,
    stokKg: 0,
    stokEkor: 0,
    hppPerKg: 25000,
    hargaEceran: 38000,
    hargaPedagang: 35000,
    hargaPartai: 33000,
    minStokKg: 50
  });

  const handleOpenAddStock = () => {
    setEditingStock(null);
    setStockForm({
      kode: `KARKAS-${state.stocks.length + 1}`,
      nama: '',
      kategori: 'karkas',
      stokKg: 100,
      stokEkor: 80,
      hppPerKg: 26000,
      hargaEceran: 38000,
      hargaPedagang: 35000,
      hargaPartai: 33000,
      minStokKg: 50
    });
    setShowStockModal(true);
  };

  const handleOpenEditStock = (stock: StockItem) => {
    setEditingStock(stock);
    setStockForm({
      kode: stock.kode,
      nama: stock.nama,
      kategori: stock.kategori,
      stokKg: stock.stokKg,
      stokEkor: stock.stokEkor,
      hppPerKg: stock.hppPerKg,
      hargaEceran: stock.hargaEceran,
      hargaPedagang: stock.hargaPedagang,
      hargaPartai: stock.hargaPartai,
      minStokKg: stock.minStokKg || 50
    });
    setShowStockModal(true);
  };

  const handleSaveStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stockForm.nama || !stockForm.kode) return;
    setIsSubmitting(true);
    try {
      if (editingStock) {
        await api.updateStock(editingStock.id, {
          ...stockForm,
          stokKg: Number(stockForm.stokKg),
          stokEkor: Number(stockForm.stokEkor),
          hppPerKg: Number(stockForm.hppPerKg),
          hargaEceran: Number(stockForm.hargaEceran),
          hargaPedagang: Number(stockForm.hargaPedagang),
          hargaPartai: Number(stockForm.hargaPartai),
          minStokKg: Number(stockForm.minStokKg)
        });
        alert(`Produk ${stockForm.nama} berhasil diperbarui!`);
      } else {
        await api.addStock({
          ...stockForm,
          stokKg: Number(stockForm.stokKg),
          stokEkor: Number(stockForm.stokEkor),
          hppPerKg: Number(stockForm.hppPerKg),
          hargaEceran: Number(stockForm.hargaEceran),
          hargaPedagang: Number(stockForm.hargaPedagang),
          hargaPartai: Number(stockForm.hargaPartai),
          minStokKg: Number(stockForm.minStokKg)
        });
        alert(`Produk ${stockForm.nama} berhasil ditambahkan!`);
      }
      setShowStockModal(false);
      onRefresh();
    } catch (err: any) {
      alert('Gagal menyimpan data stok: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteStock = async (id: string, nama: string) => {
    if (!window.confirm(`Yakin ingin menghapus item stok "${nama}"? Data akan dihapus dari sistem gudang.`)) return;
    setIsSubmitting(true);
    try {
      await api.deleteStock(id);
      alert(`Item ${nama} berhasil dihapus.`);
      onRefresh();
    } catch (err: any) {
      alert('Gagal menghapus stok: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Supplier CRUD state & handlers
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [supplierForm, setSupplierForm] = useState({
    nama: '',
    kontak: '',
    area: '',
    catatan: ''
  });

  const handleOpenAddSupplier = () => {
    setEditingSupplier(null);
    setSupplierForm({ nama: '', kontak: '', area: '', catatan: '' });
    setShowSupplierModal(true);
  };

  const handleOpenEditSupplier = (sup: Supplier) => {
    setEditingSupplier(sup);
    setSupplierForm({
      nama: sup.nama,
      kontak: sup.kontak,
      area: sup.area,
      catatan: ''
    });
    setShowSupplierModal(true);
  };

  const handleSaveSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierForm.nama) return;
    setIsSubmitting(true);
    try {
      if (editingSupplier) {
        await api.updateSupplier(editingSupplier.id, supplierForm);
        alert(`Supplier ${supplierForm.nama} berhasil diperbarui!`);
      } else {
        await api.addSupplier(supplierForm);
        alert(`Supplier ${supplierForm.nama} berhasil ditambahkan!`);
      }
      setShowSupplierModal(false);
      onRefresh();
    } catch (err: any) {
      alert('Gagal menyimpan supplier: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSupplier = async (id: string, nama: string) => {
    if (!window.confirm(`Yakin ingin menghapus supplier "${nama}"?`)) return;
    setIsSubmitting(true);
    try {
      await api.deleteSupplier(id);
      alert(`Supplier ${nama} berhasil dihapus.`);
      onRefresh();
    } catch (err: any) {
      alert('Gagal menghapus supplier: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // WhatsApp Struk Order
  const handleSendOrderWA = async (orderId: string) => {
    try {
      const data = await api.getWhatsAppReceipt(orderId);
      const targetUrl = data?.waUrl || data?.url;
      if (targetUrl) {
        window.open(targetUrl, '_blank');
      } else {
        alert('Format URL WhatsApp tidak dapat digenerate');
      }
    } catch (err: any) {
      alert('Gagal membuat link WhatsApp: ' + err.message);
    }
  };

  // Delete Order
  const handleDeleteOrder = async (orderId: string, noFaktur: string) => {
    if (!window.confirm(`Yakin ingin membatalkan/menghapus pesanan faktur #${noFaktur}? Stok karkas dan saldo piutang akan otomatis dikembalikan ke kondisi semula.`)) return;
    setIsSubmitting(true);
    try {
      await api.deleteOrder(orderId);
      alert(`Pesanan #${noFaktur} berhasil dibatalkan & stok telah dikembalikan!`);
      onRefresh();
    } catch (err: any) {
      alert('Gagal membatalkan pesanan: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Admin Controls & Menu Tabs */}
      <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md text-xs font-bold uppercase tracking-wider bg-stone-800 text-white">
                Dashboard Admin
              </span>
              <span className="text-xs text-stone-500 font-medium">Pusat Penggerak Operasional Harian</span>
            </div>
            <h2 className="text-xl font-bold text-stone-900 mt-1">Kendali Operasional Ayam Potong</h2>
            <p className="text-xs text-stone-600">
              Input pembelian ayam, proses potong karkas, jadwal kirim pesanan, dan kontrol stok barang.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setShowPurchaseForm(true)}
              className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition"
            >
              <Plus className="w-4 h-4" /> Beli Ayam Masuk
            </button>
            <button
              onClick={() => setShowProductionForm(true)}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition"
            >
              <Scissors className="w-4 h-4" /> Catat Pemotongan
            </button>
          </div>
        </div>

        {/* 7 Menu Tabs from Specification */}
        <div className="flex flex-wrap gap-2 pt-3">
          {[
            { id: 'pesanan', label: '01 - Pesanan Masuk', icon: <Inbox className="w-3.5 h-3.5" /> },
            { id: 'pembelian', label: '02 - Pembelian Ayam', icon: <ShoppingCart className="w-3.5 h-3.5" /> },
            { id: 'produksi', label: '03 - Produksi', icon: <Scissors className="w-3.5 h-3.5" /> },
            { id: 'pengiriman', label: '04 - Penjualan & Pengiriman', icon: <Truck className="w-3.5 h-3.5" /> },
            { id: 'stok', label: '05 - Stok Real-Time', icon: <Package className="w-3.5 h-3.5" /> },
            { id: 'partner', label: '06 - Customer & Supplier', icon: <Users className="w-3.5 h-3.5" /> },
            { id: 'kas', label: '07 - Kas Operasional', icon: <Wallet className="w-3.5 h-3.5" /> }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 01 - PESANAN MASUK */}
      {activeTab === 'pesanan' && (
        <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-stone-900 text-base">Alur Pesanan Masuk & Jadwal Kirim</h3>
            <span className="text-xs text-stone-500 font-medium">{state.orders.length} Pesanan Aktif</span>
          </div>
          <div className="space-y-3">
            {state.orders.map(order => (
              <div key={order.id} className="p-4 rounded-xl border border-stone-200 bg-stone-50/50 hover:bg-white transition flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-stone-900 text-sm">{order.noFaktur}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-stone-200 text-stone-800 uppercase">
                      {order.kategoriHarga.replace('_', ' ')}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      order.status === 'selesai' ? 'bg-emerald-100 text-emerald-800' :
                      order.status === 'dikirim' ? 'bg-indigo-100 text-indigo-800' :
                      order.status === 'siap_kirim' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {order.status.toUpperCase().replace('_', ' ')}
                    </span>
                  </div>
                  <div className="text-sm font-semibold text-stone-900">{order.customerNama}</div>
                  <div className="text-xs text-stone-600">
                    Item: {order.items.map(it => `${it.namaProduk} (${it.kg}kg)`).join(', ')} &bull; Total: <b>{order.totalKg} kg</b>
                  </div>
                  <div className="text-xs text-stone-500">
                    Nilai Pesanan: <span className="font-bold text-emerald-800">{formatRupiah(order.totalHarga)}</span> &bull; Sales: {order.salesNama} {order.catatan ? `&bull; "${order.catatan}"` : ''}
                  </div>
                </div>

                {/* Status Advancement Controls */}
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => handleUpdateOrderStatus(order.id, 'diproses')}
                    disabled={order.status === 'diproses'}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                      order.status === 'diproses' ? 'bg-amber-500 text-white' : 'bg-stone-200 hover:bg-stone-300 text-stone-700'
                    }`}
                  >
                    1. Proses
                  </button>
                  <button
                    onClick={() => handleUpdateOrderStatus(order.id, 'siap_kirim')}
                    disabled={order.status === 'siap_kirim'}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                      order.status === 'siap_kirim' ? 'bg-blue-600 text-white' : 'bg-stone-200 hover:bg-stone-300 text-stone-700'
                    }`}
                  >
                    2. Siap Kirim
                  </button>
                  <button
                    onClick={() => handleUpdateOrderStatus(order.id, 'dikirim')}
                    disabled={order.status === 'dikirim'}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                      order.status === 'dikirim' ? 'bg-indigo-600 text-white' : 'bg-stone-200 hover:bg-stone-300 text-stone-700'
                    }`}
                  >
                    3. Dikirim
                  </button>
                  <button
                    onClick={() => handleUpdateOrderStatus(order.id, 'selesai')}
                    disabled={order.status === 'selesai'}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                      order.status === 'selesai' ? 'bg-emerald-600 text-white' : 'bg-stone-200 hover:bg-stone-300 text-stone-700'
                    }`}
                  >
                    4. Selesai
                  </button>
                  <button
                    onClick={() => handleSendOrderWA(order.id)}
                    className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold flex items-center gap-1 transition cursor-pointer"
                    title="Kirim Struk Nota via WhatsApp"
                  >
                    <MessageSquare className="w-3.5 h-3.5" /> WA
                  </button>
                  <button
                    onClick={() => handleDeleteOrder(order.id, order.noFaktur)}
                    className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-semibold transition cursor-pointer"
                    title="Batalkan/Hapus Pesanan (Kembalikan Stok)"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 02 - PEMBELIAN AYAM */}
      {activeTab === 'pembelian' && (
        <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-stone-900 text-base">Riwayat Nota Pembelian Ayam Hidup</h3>
            <button
              onClick={() => setShowPurchaseForm(true)}
              className="px-3.5 py-1.5 bg-stone-900 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Input Pembelian
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-500 uppercase font-semibold border-y border-stone-200">
                <tr>
                  <th className="py-2.5 px-3">No. Nota</th>
                  <th className="py-2.5 px-3">Tanggal</th>
                  <th className="py-2.5 px-3">Supplier</th>
                  <th className="py-2.5 px-3">Ekor</th>
                  <th className="py-2.5 px-3">Berat (kg)</th>
                  <th className="py-2.5 px-3">Harga/kg</th>
                  <th className="py-2.5 px-3">Total Biaya</th>
                  <th className="py-2.5 px-3">Status Bayar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {state.purchases.map(p => (
                  <tr key={p.id}>
                    <td className="py-3 px-3 font-mono font-bold text-stone-900">{p.noNota}</td>
                    <td className="py-3 px-3">{p.tanggal}</td>
                    <td className="py-3 px-3 font-semibold text-stone-900">{p.supplierNama}</td>
                    <td className="py-3 px-3">{p.jumlahEkor}</td>
                    <td className="py-3 px-3 font-bold text-stone-900">{p.beratKg} kg</td>
                    <td className="py-3 px-3">{formatRupiah(p.hargaPerKg)}</td>
                    <td className="py-3 px-3 font-bold text-emerald-800">{formatRupiah(p.totalBiaya)}</td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        p.statusBayar === 'lunas' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {p.statusBayar.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 03 - PRODUKSI */}
      {activeTab === 'produksi' && (
        <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-stone-900 text-base">Hasil Pemotongan & Rendemen Karkas</h3>
              <p className="text-xs text-stone-500">Kalkulasi susut bobot dan pembentukan persediaan karkas otomatis</p>
            </div>
            <button
              onClick={() => setShowProductionForm(true)}
              className="px-3.5 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5"
            >
              <Scissors className="w-4 h-4" /> Catat Pemotongan
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-500 uppercase font-semibold border-y border-stone-200">
                <tr>
                  <th className="py-2.5 px-3">Batch</th>
                  <th className="py-2.5 px-3">Tanggal</th>
                  <th className="py-2.5 px-3">Ayam Masuk</th>
                  <th className="py-2.5 px-3">Karkas Dihasilkan</th>
                  <th className="py-2.5 px-3">Jeroan</th>
                  <th className="py-2.5 px-3">Kepala/Ceker</th>
                  <th className="py-2.5 px-3">Susut (kg)</th>
                  <th className="py-2.5 px-3">Rendemen (%)</th>
                  <th className="py-2.5 px-3">Biaya Potong</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {state.productions.map(prd => (
                  <tr key={prd.id}>
                    <td className="py-3 px-3 font-mono font-bold text-stone-900">{prd.batchNo}</td>
                    <td className="py-3 px-3">{prd.tanggal}</td>
                    <td className="py-3 px-3 font-medium">{prd.ekorMasuk} ekor ({prd.kgHidup} kg)</td>
                    <td className="py-3 px-3 font-bold text-emerald-800">{prd.hasilKarkasKg} kg</td>
                    <td className="py-3 px-3">{prd.hasilJeroanKg} kg</td>
                    <td className="py-3 px-3">{prd.hasilKepalaCekerKg} kg</td>
                    <td className="py-3 px-3 text-amber-700 font-semibold">{prd.susutKg} kg</td>
                    <td className="py-3 px-3 font-bold text-stone-900">{prd.rendemenPersen}%</td>
                    <td className="py-3 px-3 text-stone-600">{formatRupiah(prd.biayaPotong)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 04 - PENGIRIMAN & CETAK SURAT JALAN */}
      {activeTab === 'pengiriman' && (
        <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs space-y-4">
          <h3 className="font-bold text-stone-900 text-base">Surat Jalan & Kontrol Pengiriman Barang Keluar</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {state.orders.map(o => (
              <div key={o.id} className="p-4 rounded-xl border border-stone-200 bg-stone-50 space-y-2 text-xs">
                <div className="flex items-center justify-between border-b border-stone-200 pb-2">
                  <span className="font-bold text-stone-900 font-mono text-sm">{o.noFaktur}</span>
                  <button 
                    onClick={() => alert(`Cetak Surat Jalan #${o.noFaktur} untuk ${o.customerNama}`)}
                    className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 bg-white border border-stone-300 rounded-lg hover:bg-stone-100"
                  >
                    <Printer className="w-3 h-3" /> Cetak Surat Jalan
                  </button>
                </div>
                <div><b>Customer:</b> {o.customerNama}</div>
                <div><b>Rincian Kirim:</b> {o.items.map(it => `${it.namaProduk}: ${it.kg}kg`).join(', ')}</div>
                <div className="flex justify-between items-center pt-1 text-stone-500">
                  <span>Total Muatan: <b>{o.totalKg} kg</b></span>
                  <span className="capitalize font-semibold text-indigo-700">Status: {o.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 05 - STOK REAL-TIME */}
      {activeTab === 'stok' && (
        <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-stone-900 text-base">Status Stok Real-Time Terpusat</h3>
              <span className="text-xs text-stone-500 font-medium">Bisa Tambah, Edit Harga & Stok, serta Hapus Produk Karkas</span>
            </div>
            <button
              onClick={handleOpenAddStock}
              className="px-3.5 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-3.5 h-3.5" /> Tambah Produk Karkas
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {state.stocks.map(item => {
              const isLow = item.stokKg < (item.minStokKg || 50);
              return (
                <div key={item.id} className="p-4 rounded-xl border border-stone-200 bg-stone-50 hover:bg-white transition space-y-2 relative group">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-stone-500">{item.kode}</span>
                    <div className="flex items-center gap-1.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isLow ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {isLow ? 'PERLU RESTOK' : 'AMAN'}
                      </span>
                      <button
                        onClick={() => handleOpenEditStock(item)}
                        className="p-1 text-stone-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                        title="Edit Data Produk & Harga"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteStock(item.id, item.nama)}
                        className="p-1 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                        title="Hapus Produk"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <h4 className="font-bold text-stone-900 text-sm">{item.nama}</h4>
                  <div className="text-2xl font-black text-stone-900">
                    {formatNumber(item.stokKg)} <span className="text-xs font-normal text-stone-500">kg</span>
                    {item.stokEkor > 0 && <span className="text-xs font-semibold text-stone-600 block">({item.stokEkor} ekor)</span>}
                  </div>
                  <div className="text-[11px] text-stone-500 pt-2 border-t border-stone-200 space-y-0.5">
                    <div>HPP/kg: <span className="font-bold text-stone-800">{formatRupiah(item.hppPerKg)}</span></div>
                    <div className="flex justify-between text-stone-600">
                      <span>Ecer: {formatRupiah(item.hargaEceran)}</span>
                      <span>Pdg: {formatRupiah(item.hargaPedagang)}</span>
                      <span>Partai: {formatRupiah(item.hargaPartai)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 06 - CUSTOMER & SUPPLIER */}
      {activeTab === 'partner' && (
        <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-stone-900 text-base">Mitra Bisnis (Customer & Supplier)</h3>
            <button
              onClick={() => setShowCustomerForm(true)}
              className="px-3.5 py-1.5 bg-stone-900 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Tambah Customer
            </button>
          </div>

          <div>
            <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Master Customer</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 text-stone-500 uppercase font-semibold border-y border-stone-200">
                  <tr>
                    <th className="py-2.5 px-3">Nama</th>
                    <th className="py-2.5 px-3">Kategori</th>
                    <th className="py-2.5 px-3">Area</th>
                    <th className="py-2.5 px-3">No. HP</th>
                    <th className="py-2.5 px-3">Limit Kredit</th>
                    <th className="py-2.5 px-3">Sisa Piutang</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {state.customers.map(c => (
                    <tr key={c.id}>
                      <td className="py-3 px-3 font-semibold text-stone-900">{c.nama}</td>
                      <td className="py-3 px-3 capitalize">{c.jenis.replace('_', ' ')}</td>
                      <td className="py-3 px-3">{c.area}</td>
                      <td className="py-3 px-3">{c.noHp}</td>
                      <td className="py-3 px-3">{formatRupiah(c.limitKredit)}</td>
                      <td className="py-3 px-3 font-bold text-orange-700">{formatRupiah(c.sisaPiutang)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="pt-4 border-t border-stone-200">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider">Master Supplier Unggas</h4>
              <button
                onClick={handleOpenAddSupplier}
                className="px-3 py-1.5 bg-stone-800 hover:bg-stone-900 text-white rounded-xl text-xs font-bold flex items-center gap-1 transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Tambah Supplier Baru
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 text-stone-500 uppercase font-semibold border-y border-stone-200">
                  <tr>
                    <th className="py-2.5 px-3">Nama Supplier</th>
                    <th className="py-2.5 px-3">Kontak</th>
                    <th className="py-2.5 px-3">Area</th>
                    <th className="py-2.5 px-3">Total Pembelian</th>
                    <th className="py-2.5 px-3">Sisa Utang Usaha</th>
                    <th className="py-2.5 px-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {state.suppliers.map(s => (
                    <tr key={s.id}>
                      <td className="py-3 px-3 font-semibold text-stone-900">{s.nama}</td>
                      <td className="py-3 px-3">{s.kontak}</td>
                      <td className="py-3 px-3">{s.area}</td>
                      <td className="py-3 px-3">{formatNumber(s.totalPembelianKg)} kg</td>
                      <td className="py-3 px-3 font-bold text-rose-700">{formatRupiah(s.totalHutang)}</td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenEditSupplier(s)}
                            className="p-1 text-stone-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="Edit Supplier"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteSupplier(s.id, s.nama)}
                            className="p-1 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            title="Hapus Supplier"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 07 - KAS OPERASIONAL */}
      {activeTab === 'kas' && (
        <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-stone-900 text-base">Arus Kas Masuk & Keluar Operasional</h3>
            <span className="text-xs text-stone-500">Tercatat di Jurnal Akuntansi</span>
          </div>
          <div className="space-y-2">
            {state.cashTransactions.map(tx => (
              <div key={tx.id} className="p-3 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-stone-900 block">{tx.keterangan}</span>
                  <span className="text-stone-500">{tx.tanggal} &bull; Akun: {tx.akunKas}</span>
                </div>
                <div className={`font-bold text-sm ${tx.tipe === 'masuk' ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {tx.tipe === 'masuk' ? '+' : '-'}{formatRupiah(tx.jumlah)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* POPUP MODAL: Pembelian Ayam */}
      {showPurchaseForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-stone-200">
            <h3 className="text-base font-bold text-stone-900 mb-3">Input Nota Pembelian Ayam Hidup</h3>
            <form onSubmit={handleSavePurchase} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Pilih Supplier:</label>
                <select
                  value={purchaseData.supplierId}
                  onChange={e => setPurchaseData({ ...purchaseData, supplierId: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl"
                  required
                >
                  {state.suppliers.map(s => (
                    <option key={s.id} value={s.id}>{s.nama} ({s.area})</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Jumlah Ekor:</label>
                  <input
                    type="number"
                    value={purchaseData.jumlahEkor}
                    onChange={e => setPurchaseData({ ...purchaseData, jumlahEkor: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-xl"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Total Berat (kg):</label>
                  <input
                    type="number"
                    value={purchaseData.beratKg}
                    onChange={e => setPurchaseData({ ...purchaseData, beratKg: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-xl"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Harga per Kg (Rp):</label>
                  <input
                    type="number"
                    value={purchaseData.hargaPerKg}
                    onChange={e => setPurchaseData({ ...purchaseData, hargaPerKg: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-xl"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Metode Bayar:</label>
                  <select
                    value={purchaseData.statusBayar}
                    onChange={e => setPurchaseData({ ...purchaseData, statusBayar: e.target.value as any })}
                    className="w-full px-3 py-2 border rounded-xl"
                  >
                    <option value="lunas">Lunas (Kas Keluar Langsung)</option>
                    <option value="utang">Utang (Kewajiban Supplier)</option>
                  </select>
                </div>
              </div>
              <div className="p-3 bg-stone-100 rounded-xl font-bold text-sm text-stone-900 flex justify-between">
                <span>Total Estimasi Biaya:</span>
                <span className="text-emerald-800">{formatRupiah(purchaseData.beratKg * purchaseData.hargaPerKg)}</span>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPurchaseForm(false)}
                  className="px-4 py-2 border rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Pembelian'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* POPUP MODAL: Produksi Pemotongan */}
      {showProductionForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-stone-200">
            <h3 className="text-base font-bold text-stone-900 mb-3">Catat Hasil Pemotongan Ayam</h3>
            <form onSubmit={handleSaveProduction} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Ayam Hidup (Ekor):</label>
                  <input
                    type="number"
                    value={productionData.ekorMasuk}
                    onChange={e => setProductionData({ ...productionData, ekorMasuk: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-xl"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Bobot Hidup (Kg):</label>
                  <input
                    type="number"
                    value={productionData.kgHidup}
                    onChange={e => setProductionData({ ...productionData, kgHidup: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-xl"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Karkas (Kg):</label>
                  <input
                    type="number"
                    value={productionData.hasilKarkasKg}
                    onChange={e => setProductionData({ ...productionData, hasilKarkasKg: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-xl"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Jeroan (Kg):</label>
                  <input
                    type="number"
                    value={productionData.hasilJeroanKg}
                    onChange={e => setProductionData({ ...productionData, hasilJeroanKg: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Kepala/Ceker (Kg):</label>
                  <input
                    type="number"
                    value={productionData.hasilKepalaCekerKg}
                    onChange={e => setProductionData({ ...productionData, hasilKepalaCekerKg: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Biaya Potong / Upah Borong (Rp):</label>
                <input
                  type="number"
                  value={productionData.biayaPotong}
                  onChange={e => setProductionData({ ...productionData, biayaPotong: Number(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>
              <div className="p-3 bg-emerald-50 rounded-xl text-emerald-950 font-semibold flex justify-between">
                <span>Rendemen Estimasi:</span>
                <span>{productionData.kgHidup > 0 ? ((productionData.hasilKarkasKg / productionData.kgHidup) * 100).toFixed(1) : 0}%</span>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowProductionForm(false)}
                  className="px-4 py-2 border rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Produksi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* POPUP MODAL: Tambah Customer */}
      {showCustomerForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-stone-200">
            <h3 className="text-base font-bold text-stone-900 mb-3">Registrasi Customer Baru</h3>
            <form onSubmit={handleSaveCustomer} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Nama Usaha / Toko:</label>
                <input
                  type="text"
                  value={customerData.nama}
                  onChange={e => setCustomerData({ ...customerData, nama: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Kategori:</label>
                  <select
                    value={customerData.jenis}
                    onChange={e => setCustomerData({ ...customerData, jenis: e.target.value as any })}
                    className="w-full px-3 py-2 border rounded-xl"
                  >
                    <option value="pedagang">Pedagang</option>
                    <option value="partai_besar">Partai Besar</option>
                    <option value="eceran">Eceran</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Limit Kredit (Rp):</label>
                  <input
                    type="number"
                    value={customerData.limitKredit}
                    onChange={e => setCustomerData({ ...customerData, limitKredit: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Area / Pasar:</label>
                <input
                  type="text"
                  value={customerData.area}
                  onChange={e => setCustomerData({ ...customerData, area: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl"
                  required
                />
              </div>
              <div>
                <label className="block font-semibold text-stone-700 mb-1">No. WhatsApp / HP:</label>
                <input
                  type="text"
                  value={customerData.noHp}
                  onChange={e => setCustomerData({ ...customerData, noHp: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl"
                  required
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCustomerForm(false)}
                  className="px-4 py-2 border rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-stone-900 hover:bg-black text-white font-semibold rounded-xl"
                >
                  Simpan Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* POPUP MODAL: Tambah / Edit Produk Karkas */}
      {showStockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-stone-200 my-8 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
                <Package className="w-5 h-5 text-indigo-600" />
                {editingStock ? `Edit Produk: ${editingStock.nama}` : 'Tambah Produk Karkas Baru'}
              </h3>
              <button
                onClick={() => setShowStockModal(false)}
                className="text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStock} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Kode SKU Produk:</label>
                  <input
                    type="text"
                    value={stockForm.kode}
                    onChange={e => setStockForm({ ...stockForm, kode: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl font-mono uppercase"
                    placeholder="Contoh: KARKAS-01"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Kategori:</label>
                  <select
                    value={stockForm.kategori}
                    onChange={e => setStockForm({ ...stockForm, kategori: e.target.value as any })}
                    className="w-full px-3 py-2 border rounded-xl"
                  >
                    <option value="karkas">Karkas Ayam</option>
                    <option value="parting">Parting / Potongan</option>
                    <option value="boneless">Boneless (Fillet)</option>
                    <option value="sampingan">Jeroan & Sampingan</option>
                    <option value="ayam_hidup">Ayam Hidup</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Nama Produk Karkas:</label>
                <input
                  type="text"
                  value={stockForm.nama}
                  onChange={e => setStockForm({ ...stockForm, nama: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl"
                  placeholder="Contoh: Karkas Broiler Segar 0.9 - 1.0 kg"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Stok Berat (kg):</label>
                  <input
                    type="number"
                    step="0.1"
                    value={stockForm.stokKg}
                    onChange={e => setStockForm({ ...stockForm, stokKg: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border rounded-xl font-bold text-stone-900"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Stok Jumlah (Ekor):</label>
                  <input
                    type="number"
                    value={stockForm.stokEkor}
                    onChange={e => setStockForm({ ...stockForm, stokEkor: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border rounded-xl font-bold text-stone-900"
                  />
                </div>
              </div>

              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
                <span className="font-bold text-[11px] text-stone-600 block uppercase">Harga Pokok (HPP) & Tier Harga Jual (Rp/kg):</span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] text-stone-600">HPP / kg:</label>
                    <input
                      type="number"
                      step="500"
                      value={stockForm.hppPerKg}
                      onChange={e => setStockForm({ ...stockForm, hppPerKg: Number(e.target.value) })}
                      className="w-full px-2.5 py-1.5 border rounded-lg font-semibold bg-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-stone-600">Harga Eceran:</label>
                    <input
                      type="number"
                      step="500"
                      value={stockForm.hargaEceran}
                      onChange={e => setStockForm({ ...stockForm, hargaEceran: Number(e.target.value) })}
                      className="w-full px-2.5 py-1.5 border rounded-lg font-semibold bg-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-stone-600">Harga Pedagang/Katering:</label>
                    <input
                      type="number"
                      step="500"
                      value={stockForm.hargaPedagang}
                      onChange={e => setStockForm({ ...stockForm, hargaPedagang: Number(e.target.value) })}
                      className="w-full px-2.5 py-1.5 border rounded-lg font-semibold bg-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-stone-600">Harga Partai Besar:</label>
                    <input
                      type="number"
                      step="500"
                      value={stockForm.hargaPartai}
                      onChange={e => setStockForm({ ...stockForm, hargaPartai: Number(e.target.value) })}
                      className="w-full px-2.5 py-1.5 border rounded-lg font-semibold bg-white"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-stone-100">
                {editingStock && (
                  <button
                    type="button"
                    onClick={() => {
                      handleDeleteStock(editingStock.id, editingStock.nama);
                      setShowStockModal(false);
                    }}
                    className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Hapus Produk
                  </button>
                )}
                <div className="flex items-center gap-2 ml-auto">
                  <button
                    type="button"
                    onClick={() => setShowStockModal(false)}
                    className="px-4 py-2 border rounded-xl text-stone-700 hover:bg-stone-50 cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? 'Menyimpan...' : 'Simpan Produk'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* POPUP MODAL: Tambah / Edit Supplier */}
      {showSupplierModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-stone-200 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-stone-800" />
                {editingSupplier ? `Edit Supplier: ${editingSupplier.nama}` : 'Tambah Supplier Baru'}
              </h3>
              <button
                onClick={() => setShowSupplierModal(false)}
                className="text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSupplier} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Nama Supplier / Farm:</label>
                <input
                  type="text"
                  value={supplierForm.nama}
                  onChange={e => setSupplierForm({ ...supplierForm, nama: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl"
                  placeholder="Contoh: CV Ternak Unggas Sejahtera"
                  required
                />
              </div>
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Kontak / No. Telepon:</label>
                <input
                  type="text"
                  value={supplierForm.kontak}
                  onChange={e => setSupplierForm({ ...supplierForm, kontak: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl"
                  placeholder="08123456789"
                  required
                />
              </div>
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Area / Wilayah Kandang:</label>
                <input
                  type="text"
                  value={supplierForm.area}
                  onChange={e => setSupplierForm({ ...supplierForm, area: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl"
                  placeholder="Contoh: Sukabumi / Bogor Barat"
                  required
                />
              </div>
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Catatan Tambahan:</label>
                <textarea
                  rows={2}
                  value={supplierForm.catatan}
                  onChange={e => setSupplierForm({ ...supplierForm, catatan: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl"
                  placeholder="Catatan jenis ayam, jadwal kirim, dll."
                />
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-stone-100">
                {editingSupplier && (
                  <button
                    type="button"
                    onClick={() => {
                      handleDeleteSupplier(editingSupplier.id, editingSupplier.nama);
                      setShowSupplierModal(false);
                    }}
                    className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Hapus
                  </button>
                )}
                <div className="flex items-center gap-2 ml-auto">
                  <button
                    type="button"
                    onClick={() => setShowSupplierModal(false)}
                    className="px-4 py-2 border rounded-xl text-stone-700 hover:bg-stone-50 cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-stone-900 hover:bg-black text-white font-bold rounded-xl cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? 'Menyimpan...' : 'Simpan Supplier'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
