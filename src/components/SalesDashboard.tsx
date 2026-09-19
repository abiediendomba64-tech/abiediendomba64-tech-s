import React, { useState } from 'react';
import { AppStateData, CustomerCategory } from '../types';
import { formatRupiah, formatNumber, api } from '../services/api';
import { 
  Plus, 
  TrendingUp, 
  Tag, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  Users, 
  CreditCard, 
  Package, 
  FileText,
  DollarSign
} from 'lucide-react';

interface Props {
  state: AppStateData;
  onRefresh: () => void;
}

export const SalesDashboard: React.FC<Props> = ({ state, onRefresh }) => {
  const [activeTab, setActiveTab] = useState<'pesanan_baru' | 'customer_baru' | 'cek_harga' | 'status_pesanan' | 'piutang_saya' | 'riwayat'>('status_pesanan');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sales identification
  const currentSalesName = 'Dimas Aditya';
  const currentSalesId = 'usr-sales-1';

  // Metrics for this sales
  const salesOrders = state.orders.filter(o => o.salesId === currentSalesId || o.salesNama === currentSalesName);
  const pesananHariIniCount = salesOrders.length;
  const sudahTerjualKg = salesOrders.reduce((sum, o) => sum + o.totalKg, 0);
  const totalRealisasiRp = salesOrders.reduce((sum, o) => sum + o.totalHarga, 0);
  const targetBulanIni = 100000000; // 100 Juta
  const piutangCustomerSaya = state.customers.reduce((sum, c) => sum + c.sisaPiutang, 0);
  const customerAktifCount = state.customers.length;

  // New Order Form State
  const [selectedCustomerId, setSelectedCustomerId] = useState(state.customers[0]?.id || '');
  const selectedCustomer = state.customers.find(c => c.id === selectedCustomerId) || state.customers[0];
  const customerTier: CustomerCategory = selectedCustomer ? selectedCustomer.jenis : 'pedagang';

  // Order Items
  const [orderItems, setOrderItems] = useState([
    { stockId: state.stocks[1]?.id || 'stk-2', kg: 50 }
  ]);
  const [metodeBayar, setMetodeBayar] = useState<'lunas' | 'piutang'>('lunas');
  const [catatan, setCatatan] = useState('');
  
  // Special price proposal
  const [ajukanHargaKhusus, setAjukanHargaKhusus] = useState(false);
  const [requestedPriceTotal, setRequestedPriceTotal] = useState(0);
  const [reasonHargaKhusus, setReasonHargaKhusus] = useState('');

  // New Customer Form State
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerJenis, setNewCustomerJenis] = useState<CustomerCategory>('pedagang');
  const [newCustomerArea, setNewCustomerArea] = useState('');
  const [newCustomerHp, setNewCustomerHp] = useState('');
  const [newCustomerLimit, setNewCustomerLimit] = useState(5000000);

  // Calculate pricing based on customer tier
  const getProductPrice = (stockId: string, tier: CustomerCategory) => {
    const item = state.stocks.find(s => s.id === stockId);
    if (!item) return 0;
    if (tier === 'partai_besar') return item.hargaPartai;
    if (tier === 'pedagang') return item.hargaPedagang;
    return item.hargaEceran;
  };

  const calculatedItems = orderItems.map(item => {
    const stock = state.stocks.find(s => s.id === item.stockId);
    const unitPrice = getProductPrice(item.stockId, customerTier);
    return {
      stockId: item.stockId,
      namaProduk: stock ? stock.nama : 'Produk',
      kg: Number(item.kg),
      hargaPerKg: unitPrice,
      subtotal: Number(item.kg) * unitPrice
    };
  });

  const totalCalculatedRp = calculatedItems.reduce((sum, it) => sum + it.subtotal, 0);
  const totalCalculatedKg = calculatedItems.reduce((sum, it) => sum + it.kg, 0);

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) {
      alert('Pilih customer terlebih dahulu');
      return;
    }

    if (totalCalculatedKg <= 0) {
      alert('Kuantitas kg harus lebih dari 0');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: any = {
        salesId: currentSalesId,
        salesNama: currentSalesName,
        customerId: selectedCustomer.id,
        customerNama: selectedCustomer.nama,
        kategoriHarga: customerTier,
        items: calculatedItems,
        statusBayar: metodeBayar,
        catatan
      };

      if (ajukanHargaKhusus && requestedPriceTotal > 0) {
        payload.specialPriceRequested = {
          approved: false,
          standardTotal: totalCalculatedRp,
          requestedTotal: requestedPriceTotal,
          reason: reasonHargaKhusus
        };
      }

      await api.recordOrder(payload);
      alert('Pesanan berhasil dibuat! Stok langsung dikurangi dan Admin menerima notifikasi pengiriman.');
      setActiveTab('status_pesanan');
      onRefresh();
    } catch (err: any) {
      alert(`Gagal: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.addCustomer({
        nama: newCustomerName,
        jenis: newCustomerJenis,
        area: newCustomerArea,
        noHp: newCustomerHp,
        limitKredit: newCustomerLimit,
        salesId: currentSalesId
      });
      alert('Customer baru berhasil didaftarkan');
      setNewCustomerName('');
      setNewCustomerArea('');
      setNewCustomerHp('');
      setActiveTab('pesanan_baru');
      onRefresh();
    } catch (err: any) {
      alert(`Gagal: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & KPI Bar */}
      <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md text-xs font-bold uppercase tracking-wider bg-emerald-800 text-white">
                Dashboard Sales
              </span>
              <span className="text-xs text-stone-500 font-medium">Fokus Customer & Pesanan</span>
            </div>
            <h2 className="text-xl font-bold text-stone-900 mt-1">Portal Penjualan & Pengantaran</h2>
            <p className="text-xs text-stone-600">
              Input pesanan mudah &bull; Harga otomatis per tier &bull; Pantau status pesanan pelanggan.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('pesanan_baru')}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition"
            >
              <Plus className="w-4 h-4" /> + PESANAN BARU
            </button>
            <button
              onClick={() => setActiveTab('customer_baru')}
              className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-stone-300 transition"
            >
              <Users className="w-4 h-4" /> + CUSTOMER BARU
            </button>
          </div>
        </div>

        {/* Sales Metric Grid (From spec: 5 KPIs) */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-4">
          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
            <span className="text-[11px] text-stone-500 block">Pesanan Hari Ini</span>
            <span className="text-lg font-bold text-stone-900">{pesananHariIniCount} pesanan</span>
          </div>
          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
            <span className="text-[11px] text-stone-500 block">Target vs Realisasi</span>
            <span className="text-xs font-bold text-stone-900 block truncate">{formatRupiah(totalRealisasiRp)}</span>
            <span className="text-[10px] text-stone-400">Target: {formatRupiah(targetBulanIni)}</span>
          </div>
          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
            <span className="text-[11px] text-stone-500 block">Sudah Terjual</span>
            <span className="text-lg font-bold text-emerald-800">{formatNumber(sudahTerjualKg)} kg</span>
          </div>
          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
            <span className="text-[11px] text-stone-500 block">Piutang Customer</span>
            <span className="text-xs font-bold text-orange-700 block truncate">{formatRupiah(piutangCustomerSaya)}</span>
            <span className="text-[10px] text-stone-400">Perlu ditagih</span>
          </div>
          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 col-span-2 sm:col-span-1">
            <span className="text-[11px] text-stone-500 block">Customer Aktif</span>
            <span className="text-lg font-bold text-stone-900">{customerAktifCount} toko</span>
          </div>
        </div>

        {/* 6 Action Buttons from spec */}
        <div className="flex flex-wrap gap-2 pt-4">
          {[
            { id: 'pesanan_baru', label: '+ PESANAN BARU' },
            { id: 'customer_baru', label: '+ CUSTOMER BARU' },
            { id: 'cek_harga', label: 'CEK HARGA TIER' },
            { id: 'status_pesanan', label: 'STATUS PESANAN' },
            { id: 'piutang_saya', label: 'PIUTANG SAYA' },
            { id: 'riwayat', label: 'RIWAYAT PENJUALAN' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
              }`}
            >
              [ {tab.label} ]
            </button>
          ))}
        </div>
      </div>

      {/* TAB 1: FORMULIR PESANAN BARU */}
      {activeTab === 'pesanan_baru' && (
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs max-w-2xl mx-auto space-y-5">
          <div className="border-b border-stone-200 pb-3">
            <h3 className="text-base font-bold text-stone-900">Formulir Pesanan Ayam Baru</h3>
            <p className="text-xs text-stone-500">Harga per kg otomatis menyesuaikan kategori pelanggan</p>
          </div>

          <form onSubmit={handleSubmitOrder} className="space-y-4 text-xs">
            {/* 1. Pilih Customer */}
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Pilih Customer:</label>
              <select
                value={selectedCustomerId}
                onChange={e => setSelectedCustomerId(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl bg-white text-sm font-medium"
                required
              >
                {state.customers.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.nama} - {c.area} ({c.jenis.replace('_', ' ').toUpperCase()})
                  </option>
                ))}
              </select>
            </div>

            {/* Customer Status Info Pill */}
            {selectedCustomer && (
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex flex-wrap justify-between gap-2">
                <div>
                  <span className="text-stone-500">Kategori Harga:</span>{' '}
                  <span className="font-bold text-stone-900 uppercase">{selectedCustomer.jenis.replace('_', ' ')}</span>
                </div>
                <div>
                  <span className="text-stone-500">Limit Kredit:</span>{' '}
                  <span className="font-bold text-stone-900">{formatRupiah(selectedCustomer.limitKredit)}</span>
                </div>
                <div>
                  <span className="text-stone-500">Sisa Piutang:</span>{' '}
                  <span className="font-bold text-orange-700">{formatRupiah(selectedCustomer.sisaPiutang)}</span>
                </div>
              </div>
            )}

            {/* 2. Daftar Item Pesanan */}
            <div className="space-y-2">
              <label className="block font-semibold text-stone-700">Pilih Produk & Kuantitas (kg):</label>
              {orderItems.map((item, idx) => {
                const unitPrice = getProductPrice(item.stockId, customerTier);
                return (
                  <div key={idx} className="flex gap-2 items-center bg-stone-50 p-2.5 rounded-xl border border-stone-200">
                    <select
                      value={item.stockId}
                      onChange={e => {
                        const copy = [...orderItems];
                        copy[idx].stockId = e.target.value;
                        setOrderItems(copy);
                      }}
                      className="flex-1 px-2.5 py-1.5 border rounded-lg bg-white"
                    >
                      {state.stocks.filter(s => s.kategori !== 'ayam_hidup').map(s => (
                        <option key={s.id} value={s.id}>
                          {s.nama} (Stok: {formatNumber(s.stokKg)}kg)
                        </option>
                      ))}
                    </select>

                    <div className="w-24">
                      <input
                        type="number"
                        min="1"
                        value={item.kg}
                        onChange={e => {
                          const copy = [...orderItems];
                          copy[idx].kg = Number(e.target.value);
                          setOrderItems(copy);
                        }}
                        className="w-full px-2.5 py-1.5 border rounded-lg bg-white text-center font-bold"
                        placeholder="Kg"
                      />
                    </div>

                    <div className="w-28 text-right font-semibold text-stone-700">
                      @{formatRupiah(unitPrice)}
                    </div>

                    {orderItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setOrderItems(orderItems.filter((_, i) => i !== idx))}
                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg"
                      >
                        &times;
                      </button>
                    )}
                  </div>
                );
              })}

              <button
                type="button"
                onClick={() => setOrderItems([...orderItems, { stockId: state.stocks[2]?.id || 'stk-3', kg: 20 }])}
                className="text-xs font-semibold text-emerald-700 hover:underline flex items-center gap-1 pt-1"
              >
                + Tambah Item Lain
              </button>
            </div>

            {/* 3. Ajukan Harga Khusus (Sesuai instruksi) */}
            <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2">
              <label className="flex items-center gap-2 cursor-pointer font-bold text-amber-950">
                <input
                  type="checkbox"
                  checked={ajukanHargaKhusus}
                  onChange={e => {
                    setAjukanHargaKhusus(e.target.checked);
                    if (e.target.checked && requestedPriceTotal === 0) {
                      setRequestedPriceTotal(Math.round(totalCalculatedRp * 0.95));
                    }
                  }}
                  className="rounded text-amber-600"
                />
                Ajukan Harga Khusus (Memerlukan Persetujuan Owner)
              </label>

              {ajukanHargaKhusus && (
                <div className="space-y-2 pt-2 border-t border-amber-200 text-xs">
                  <div className="flex gap-2 items-center">
                    <span className="text-stone-600">Nominal Permintaan:</span>
                    <input
                      type="number"
                      value={requestedPriceTotal}
                      onChange={e => setRequestedPriceTotal(Number(e.target.value))}
                      className="px-3 py-1.5 border rounded-lg bg-white font-bold text-emerald-800"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      value={reasonHargaKhusus}
                      onChange={e => setReasonHargaKhusus(e.target.value)}
                      placeholder="Alasan (Contoh: Customer beli rutin 100kg setiap hari)"
                      className="w-full px-3 py-1.5 border rounded-lg bg-white"
                      required={ajukanHargaKhusus}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 4. Metode Bayar */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Metode Bayar:</label>
                <select
                  value={metodeBayar}
                  onChange={e => setMetodeBayar(e.target.value as any)}
                  className="w-full px-3 py-2 border rounded-xl bg-white font-medium"
                >
                  <option value="lunas">Tunai (Bayar Saat Kirim)</option>
                  <option value="piutang">Tempo (Piutang Usaha)</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Catatan Pengiriman:</label>
                <input
                  type="text"
                  value={catatan}
                  onChange={e => setCatatan(e.target.value)}
                  placeholder="Kirim subuh jam 05:00 WIB"
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>
            </div>

            {/* Total Summary */}
            <div className="p-4 bg-stone-900 text-white rounded-xl flex items-center justify-between">
              <div>
                <span className="text-stone-400 block text-xs">Total Muatan: {totalCalculatedKg} kg</span>
                <span className="text-xs text-stone-300">
                  {ajukanHargaKhusus ? 'Standar: ' + formatRupiah(totalCalculatedRp) : 'Kategori ' + customerTier.replace('_', ' ').toUpperCase()}
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs text-stone-400 block">Total Tagihan:</span>
                <span className="text-xl font-bold text-emerald-400">
                  {formatRupiah(ajukanHargaKhusus ? requestedPriceTotal : totalCalculatedRp)}
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs transition"
            >
              {isSubmitting ? 'Mengirim Pesanan...' : 'Kirim Pesanan ke Bagian Gudang/Admin'}
            </button>
          </form>
        </div>
      )}

      {/* TAB 2: DAFTARKAN CUSTOMER BARU */}
      {activeTab === 'customer_baru' && (
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs max-w-lg mx-auto space-y-4">
          <div className="border-b border-stone-200 pb-2">
            <h3 className="text-base font-bold text-stone-900">Registrasi Calon Pelanggan Baru</h3>
            <p className="text-xs text-stone-500">Customer baru akan langsung terhubung ke database terpusat</p>
          </div>
          <form onSubmit={handleCreateCustomer} className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold mb-1">Nama Usaha / Pemilik:</label>
              <input
                type="text"
                value={newCustomerName}
                onChange={e => setNewCustomerName(e.target.value)}
                placeholder="Contoh: RM Padang Sederhana"
                className="w-full px-3 py-2 border rounded-xl"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-semibold mb-1">Kategori:</label>
                <select
                  value={newCustomerJenis}
                  onChange={e => setNewCustomerJenis(e.target.value as any)}
                  className="w-full px-3 py-2 border rounded-xl"
                >
                  <option value="pedagang">Pedagang Pasar</option>
                  <option value="partai_besar">Partai Besar / Resto</option>
                  <option value="eceran">Eceran</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold mb-1">Limit Kredit:</label>
                <input
                  type="number"
                  value={newCustomerLimit}
                  onChange={e => setNewCustomerLimit(Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>
            </div>
            <div>
              <label className="block font-semibold mb-1">Alamat / Area Pasar:</label>
              <input
                type="text"
                value={newCustomerArea}
                onChange={e => setNewCustomerArea(e.target.value)}
                placeholder="Pasar Kramat Jati Blok C No. 12"
                className="w-full px-3 py-2 border rounded-xl"
                required
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Nomor WhatsApp / HP:</label>
              <input
                type="text"
                value={newCustomerHp}
                onChange={e => setNewCustomerHp(e.target.value)}
                placeholder="0812-xxxx-xxxx"
                className="w-full px-3 py-2 border rounded-xl"
                required
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 bg-stone-900 text-white font-bold rounded-xl shadow-xs"
            >
              {isSubmitting ? 'Menyimpan...' : 'Simpan Customer Baru'}
            </button>
          </form>
        </div>
      )}

      {/* TAB 3: CEK HARGA TIER */}
      {activeTab === 'cek_harga' && (
        <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs space-y-4">
          <h3 className="font-bold text-stone-900 text-base">Daftar Harga Resmi Per Kategori Customer</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-500 uppercase font-semibold border-y border-stone-200">
                <tr>
                  <th className="py-2.5 px-3">Produk Karkas</th>
                  <th className="py-2.5 px-3">Stok Siap Jual</th>
                  <th className="py-2.5 px-3">Harga Partai Besar</th>
                  <th className="py-2.5 px-3">Harga Pedagang Pasar</th>
                  <th className="py-2.5 px-3">Harga Eceran</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {state.stocks.filter(s => s.kategori !== 'ayam_hidup').map(item => (
                  <tr key={item.id}>
                    <td className="py-3 px-3 font-semibold text-stone-900">{item.nama}</td>
                    <td className="py-3 px-3 font-medium text-emerald-800">{formatNumber(item.stokKg)} kg</td>
                    <td className="py-3 px-3 font-bold text-stone-900">{formatRupiah(item.hargaPartai)}</td>
                    <td className="py-3 px-3 font-bold text-stone-900">{formatRupiah(item.hargaPedagang)}</td>
                    <td className="py-3 px-3 font-bold text-stone-900">{formatRupiah(item.hargaEceran)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: STATUS PESANAN PELANGGAN */}
      {activeTab === 'status_pesanan' && (
        <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs space-y-4">
          <h3 className="font-bold text-stone-900 text-base">Pelacakan Status Pesanan Customer</h3>
          <div className="space-y-3">
            {salesOrders.map(o => (
              <div key={o.id} className="p-4 rounded-xl border border-stone-200 bg-stone-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono font-bold text-stone-900">{o.noFaktur}</span>
                    <span className="text-stone-500">{o.tanggal}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      o.status === 'selesai' ? 'bg-emerald-100 text-emerald-800' :
                      o.status === 'dikirim' ? 'bg-indigo-100 text-indigo-800' :
                      o.status === 'siap_kirim' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {o.status.toUpperCase().replace('_', ' ')}
                    </span>
                  </div>
                  <h4 className="font-bold text-stone-900 text-sm">{o.customerNama}</h4>
                  <p className="text-stone-600">
                    Muatan: {o.items.map(it => `${it.namaProduk} (${it.kg}kg)`).join(', ')} &bull; Total: <b>{o.totalKg} kg</b>
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-base font-bold text-emerald-800">{formatRupiah(o.totalHarga)}</div>
                  <span className={`text-[11px] font-semibold ${o.statusBayar === 'lunas' ? 'text-emerald-700' : 'text-orange-700'}`}>
                    {o.statusBayar === 'lunas' ? 'LUNAS' : `TEMPO (Piutang)`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: PIUTANG SAYA */}
      {activeTab === 'piutang_saya' && (
        <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs space-y-4">
          <h3 className="font-bold text-stone-900 text-base">Monitoring Tagihan Piutang Customer Saya</h3>
          <div className="space-y-3">
            {state.customers.filter(c => c.sisaPiutang > 0).map(c => (
              <div key={c.id} className="p-3.5 rounded-xl border border-stone-200 bg-stone-50 flex items-center justify-between text-xs">
                <div>
                  <h4 className="font-bold text-stone-900 text-sm">{c.nama}</h4>
                  <p className="text-stone-500">Area: {c.area} &bull; WA: {c.noHp}</p>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-stone-500 block">Sisa Piutang:</span>
                  <span className="text-base font-bold text-orange-700">{formatRupiah(c.sisaPiutang)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: RIWAYAT PENJUALAN */}
      {activeTab === 'riwayat' && (
        <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs space-y-4">
          <h3 className="font-bold text-stone-900 text-base">Riwayat Penjualan Lengkap</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-500 uppercase font-semibold border-y border-stone-200">
                <tr>
                  <th className="py-2.5 px-3">Faktur</th>
                  <th className="py-2.5 px-3">Tanggal</th>
                  <th className="py-2.5 px-3">Customer</th>
                  <th className="py-2.5 px-3">Volume</th>
                  <th className="py-2.5 px-3">Total Nilai</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {salesOrders.map(o => (
                  <tr key={o.id}>
                    <td className="py-3 px-3 font-mono font-bold text-stone-900">{o.noFaktur}</td>
                    <td className="py-3 px-3">{o.tanggal}</td>
                    <td className="py-3 px-3 font-semibold text-stone-900">{o.customerNama}</td>
                    <td className="py-3 px-3">{o.totalKg} kg</td>
                    <td className="py-3 px-3 font-bold text-emerald-800">{formatRupiah(o.totalHarga)}</td>
                    <td className="py-3 px-3 capitalize">{o.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
