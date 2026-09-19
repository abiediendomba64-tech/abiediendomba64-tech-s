import React, { useState } from 'react';
import { AppStateData, Customer, CustomerCategory } from '../types';
import { api, formatRupiah, formatNumber } from '../services/api';
import { 
  Users, 
  UserPlus, 
  Search, 
  Phone, 
  MapPin, 
  CreditCard, 
  DollarSign, 
  FileText, 
  Edit3, 
  CheckCircle2, 
  AlertTriangle, 
  TrendingUp,
  X,
  Receipt,
  ExternalLink,
  Trash2,
  MessageSquare
} from 'lucide-react';

interface Props {
  state: AppStateData;
  onRefresh: () => void;
}

export const CustomerMasterPage: React.FC<Props> = ({ state, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('semua');
  const [filterPiutang, setFilterPiutang] = useState<string>('semua');
  
  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [payingCustomer, setPayingCustomer] = useState<Customer | null>(null);
  const [viewHistoryCustomer, setViewHistoryCustomer] = useState<Customer | null>(null);

  // Form states
  const [newCust, setNewCust] = useState({
    nama: '',
    jenis: 'pedagang' as CustomerCategory,
    area: '',
    noHp: '',
    limitKredit: 10000000,
    catatan: ''
  });

  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentAkun, setPaymentAkun] = useState<'Kas Operasional' | 'Bank BCA Utama'>('Kas Operasional');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Summary Metrics
  const totalCustomers = state.customers.length;
  const totalPiutang = state.customers.reduce((sum, c) => sum + c.sisaPiutang, 0);
  const customersWithDebt = state.customers.filter(c => c.sisaPiutang > 0).length;
  const overlimitCustomers = state.customers.filter(c => c.sisaPiutang >= c.limitKredit && c.limitKredit > 0).length;

  // Filtered customers
  const filteredCustomers = state.customers.filter(c => {
    const matchSearch = c.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        c.area.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        c.noHp.includes(searchTerm);
    const matchCategory = selectedCategory === 'semua' || c.jenis === selectedCategory;
    const matchPiutang = filterPiutang === 'semua' ||
                         (filterPiutang === 'berpiutang' && c.sisaPiutang > 0) ||
                         (filterPiutang === 'lunas' && c.sisaPiutang === 0);
    return matchSearch && matchCategory && matchPiutang;
  });

  // Create Customer
  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCust.nama) return;
    setIsSubmitting(true);
    try {
      await api.addCustomer({
        ...newCust,
        limitKredit: Number(newCust.limitKredit)
      });
      setIsAddModalOpen(false);
      setNewCust({
        nama: '',
        jenis: 'pedagang',
        area: '',
        noHp: '',
        limitKredit: 10000000,
        catatan: ''
      });
      onRefresh();
    } catch (err: any) {
      alert('Gagal menambah customer: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update Customer
  const handleUpdateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCustomer) return;
    setIsSubmitting(true);
    try {
      await api.updateCustomer(editingCustomer.id, {
        nama: editingCustomer.nama,
        jenis: editingCustomer.jenis,
        area: editingCustomer.area,
        noHp: editingCustomer.noHp,
        limitKredit: Number(editingCustomer.limitKredit),
        catatan: editingCustomer.catatan
      });
      setEditingCustomer(null);
      onRefresh();
    } catch (err: any) {
      alert('Gagal mengupdate customer: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Customer
  const handleDeleteCustomer = async (id: string, nama: string) => {
    if (!window.confirm(`Yakin ingin menghapus data customer "${nama}"? Data yang terhapus tidak dapat dikembalikan.`)) {
      return;
    }
    setIsSubmitting(true);
    try {
      await api.deleteCustomer(id);
      alert(`Customer ${nama} berhasil dihapus.`);
      if (editingCustomer?.id === id) setEditingCustomer(null);
      onRefresh();
    } catch (err: any) {
      alert('Gagal menghapus customer: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Kirim Pesan Tagihan / Sapa Pelanggan via WhatsApp
  const handleSendWATagihan = (customer: Customer) => {
    const raw = customer.noHp.replace(/\D/g, '');
    const phone = raw.startsWith('0') ? '62' + raw.slice(1) : raw;
    const text = customer.sisaPiutang > 0
      ? `Halo Bpk/Ibu *${customer.nama}*,\nKami dari *GEMA ABADI FARM* ingin menginformasikan rincian tagihan bon ayam potong saat ini sebesar *${formatRupiah(customer.sisaPiutang)}*.\nMohon dapat dikonfirmasi untuk pembayaran/transfer. Terima kasih banyak atas kerjasamanya! 🙏🍗`
      : `Halo Bpk/Ibu *${customer.nama}*,\nKami dari *GEMA ABADI FARM* mengabarkan bahwa pasokan ayam potong segar hari ini tersedia melimpah dan higienis. Silakan berkabar bila memerlukan pesanan baru. Terima kasih! 🙏🍗`;
    const url = `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  // Pay Customer Debt
  const handlePayDebt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payingCustomer || paymentAmount <= 0) return;
    setIsSubmitting(true);
    try {
      await api.payCustomerDebt(payingCustomer.id, paymentAmount, paymentAkun);
      setPayingCustomer(null);
      setPaymentAmount(0);
      onRefresh();
    } catch (err: any) {
      alert('Gagal mencatat pembayaran piutang: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Data Customer */}
      <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-black text-stone-900 tracking-tight">
                Master Data Customer & CRM Piutang
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-900 border border-blue-200">
                Terpisah Khusus
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Kelola database pelanggan, tier harga (Partai/Pedagang/Eceran), batas limit kredit, dan pelunasan piutang
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition"
        >
          <UserPlus className="w-4 h-4" />
          <span>Tambah Pelanggan Baru</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
          <span className="text-xs font-semibold text-stone-500">Total Pelanggan</span>
          <p className="text-xl font-black text-stone-900 mt-1">{totalCustomers} Toko/Mitra</p>
          <span className="text-[11px] text-stone-400">Terdaftar aktif</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
          <span className="text-xs font-semibold text-stone-500">Total Piutang Usaha</span>
          <p className="text-xl font-black text-rose-700 mt-1">{formatRupiah(totalPiutang)}</p>
          <span className="text-[11px] text-stone-400">{customersWithDebt} pelanggan berpiutang</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
          <span className="text-xs font-semibold text-stone-500">Status Overlimit</span>
          <p className="text-xl font-black text-amber-700 mt-1">{overlimitCustomers} Pelanggan</p>
          <span className="text-[11px] text-stone-400">Melebihi limit kredit</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
          <span className="text-xs font-semibold text-stone-500">Total Transaksi Selesai</span>
          <p className="text-xl font-black text-emerald-700 mt-1">
            {state.customers.reduce((sum, c) => sum + c.totalOrder, 0)} Order
          </p>
          <span className="text-[11px] text-stone-400">Akumulasi pesanan</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Cari nama toko/pelanggan, pasar/area (misal: Kramat Jati, Tebet), atau No WA..."
            className="w-full pl-10 pr-4 py-2 bg-stone-50 rounded-xl border border-stone-200 text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
          {/* Tier Category Filter */}
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold text-stone-700 outline-hidden"
          >
            <option value="semua">Semua Tier Kategori</option>
            <option value="partai_besar">Partai Besar (Resto / Hotel)</option>
            <option value="pedagang">Pedagang Pasar / Kios</option>
            <option value="eceran">Eceran / Warung Makan</option>
          </select>

          {/* Debt Status Filter */}
          <select
            value={filterPiutang}
            onChange={e => setFilterPiutang(e.target.value)}
            className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold text-stone-700 outline-hidden"
          >
            <option value="semua">Semua Status Piutang</option>
            <option value="berpiutang">Hanya yang Ada Piutang</option>
            <option value="lunas">Piutang Lunas (Nol)</option>
          </select>
        </div>
      </div>

      {/* Customer Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCustomers.map(customer => {
          const usagePercent = customer.limitKredit > 0 
            ? Math.min(100, Math.round((customer.sisaPiutang / customer.limitKredit) * 100))
            : 0;
          const isOverlimit = customer.sisaPiutang >= customer.limitKredit && customer.limitKredit > 0;
          const sisaLimit = Math.max(0, customer.limitKredit - customer.sisaPiutang);

          return (
            <div
              key={customer.id}
              className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs hover:border-blue-300 transition flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Header Card */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      customer.jenis === 'partai_besar'
                        ? 'bg-purple-100 text-purple-800'
                        : customer.jenis === 'pedagang'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-stone-100 text-stone-700'
                    }`}>
                      {customer.jenis.replace('_', ' ')}
                    </span>
                    <h3 className="text-base font-bold text-stone-900 mt-1.5 leading-snug">
                      {customer.nama}
                    </h3>
                  </div>

                  <div className="flex items-center gap-1">
                    {customer.noHp && (
                      <button
                        onClick={() => handleSendWATagihan(customer)}
                        className="p-1.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition"
                        title="Kirim Pesan WhatsApp / Tagihan"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => setEditingCustomer(customer)}
                      className="p-1.5 text-stone-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      title="Edit Data & Limit Kredit"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteCustomer(customer.id, customer.nama)}
                      className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      title="Hapus Data Pelanggan"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Info details */}
                <div className="space-y-1.5 text-xs text-stone-600">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                    <span className="truncate">{customer.area || 'Area belum dicatat'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                    <span>{customer.noHp || '-'}</span>
                    {customer.noHp && (
                      <a
                        href={`https://wa.me/${customer.noHp.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] text-emerald-600 font-bold hover:underline inline-flex items-center gap-0.5 ml-1"
                      >
                        WA <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                  </div>
                  {customer.catatan && (
                    <div className="p-2 bg-stone-50 rounded-xl text-[11px] text-stone-500 italic">
                      "{customer.catatan}"
                    </div>
                  )}
                </div>

                {/* Piutang & Limit Progress */}
                <div className="pt-3 border-t border-stone-100 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-stone-500">Sisa Piutang:</span>
                    <span className={`font-black ${customer.sisaPiutang > 0 ? 'text-rose-700 font-black' : 'text-stone-700'}`}>
                      {formatRupiah(customer.sisaPiutang)}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isOverlimit ? 'bg-rose-600' : usagePercent > 75 ? 'bg-amber-500' : 'bg-blue-600'
                      }`}
                      style={{ width: `${usagePercent}%` }}
                    ></div>
                  </div>

                  <div className="flex justify-between text-[11px] text-stone-500">
                    <span>Limit: {formatRupiah(customer.limitKredit)}</span>
                    <span className={isOverlimit ? 'font-bold text-rose-600' : 'text-emerald-700 font-semibold'}>
                      Sisa: {formatRupiah(sisaLimit)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-stone-100 flex items-center gap-2">
                {customer.sisaPiutang > 0 ? (
                  <button
                    onClick={() => {
                      setPayingCustomer(customer);
                      setPaymentAmount(customer.sisaPiutang);
                    }}
                    className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition"
                  >
                    <DollarSign className="w-3.5 h-3.5" /> Catat Pembayaran
                  </button>
                ) : (
                  <div className="flex-1 py-1.5 px-2 bg-emerald-50 text-emerald-800 rounded-xl text-[11px] font-bold text-center flex items-center justify-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Piutang Lunas
                  </div>
                )}

                <button
                  onClick={() => setViewHistoryCustomer(customer)}
                  className="py-2 px-3 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-semibold flex items-center gap-1 transition"
                  title="Lihat Histori Pesanan"
                >
                  <Receipt className="w-3.5 h-3.5 text-stone-500" />
                  <span>{customer.totalOrder} Order</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL: ADD CUSTOMER */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-stone-200 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="font-bold text-stone-900 text-base flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-blue-600" /> Tambah Pelanggan Baru
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddCustomer} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-stone-700 block mb-1">Nama Toko / Pelanggan *</label>
                <input
                  type="text"
                  required
                  value={newCust.nama}
                  onChange={e => setNewCust({ ...newCust, nama: e.target.value })}
                  placeholder="Misal: Resto Padang Selera, Kios Ayam Barokah..."
                  className="w-full px-3 py-2 bg-stone-50 rounded-xl border border-stone-200 outline-hidden focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Kategori / Tier *</label>
                  <select
                    value={newCust.jenis}
                    onChange={e => setNewCust({ ...newCust, jenis: e.target.value as CustomerCategory })}
                    className="w-full px-3 py-2 bg-stone-50 rounded-xl border border-stone-200 outline-hidden font-semibold"
                  >
                    <option value="pedagang">Pedagang Pasar</option>
                    <option value="partai_besar">Partai Besar</option>
                    <option value="eceran">Eceran</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Limit Kredit (Rp)</label>
                  <input
                    type="number"
                    step="1000000"
                    value={newCust.limitKredit}
                    onChange={e => setNewCust({ ...newCust, limitKredit: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-stone-50 rounded-xl border border-stone-200 outline-hidden font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">No HP / WhatsApp</label>
                <input
                  type="text"
                  value={newCust.noHp}
                  onChange={e => setNewCust({ ...newCust, noHp: e.target.value })}
                  placeholder="0812-xxxx-xxxx"
                  className="w-full px-3 py-2 bg-stone-50 rounded-xl border border-stone-200 outline-hidden"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Area / Pasar / Kios</label>
                <input
                  type="text"
                  value={newCust.area}
                  onChange={e => setNewCust({ ...newCust, area: e.target.value })}
                  placeholder="Misal: Pasar Induk Kramat Jati Los B-12"
                  className="w-full px-3 py-2 bg-stone-50 rounded-xl border border-stone-200 outline-hidden"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Catatan Khusus</label>
                <textarea
                  rows={2}
                  value={newCust.catatan}
                  onChange={e => setNewCust({ ...newCust, catatan: e.target.value })}
                  placeholder="Spesifikasi karkas yang disukai, jadwal jam kirim..."
                  className="w-full px-3 py-2 bg-stone-50 rounded-xl border border-stone-200 outline-hidden"
                />
              </div>

              <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT CUSTOMER */}
      {editingCustomer && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-stone-200 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="font-bold text-stone-900 text-base flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-blue-600" /> Edit Pelanggan & Limit Kredit
              </h3>
              <button
                onClick={() => setEditingCustomer(null)}
                className="text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateCustomer} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-stone-700 block mb-1">Nama Toko / Pelanggan *</label>
                <input
                  type="text"
                  required
                  value={editingCustomer.nama}
                  onChange={e => setEditingCustomer({ ...editingCustomer, nama: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 rounded-xl border border-stone-200 outline-hidden font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Kategori / Tier</label>
                  <select
                    value={editingCustomer.jenis}
                    onChange={e => setEditingCustomer({ ...editingCustomer, jenis: e.target.value as CustomerCategory })}
                    className="w-full px-3 py-2 bg-stone-50 rounded-xl border border-stone-200 outline-hidden font-semibold"
                  >
                    <option value="pedagang">Pedagang Pasar</option>
                    <option value="partai_besar">Partai Besar</option>
                    <option value="eceran">Eceran</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Limit Kredit (Rp)</label>
                  <input
                    type="number"
                    step="1000000"
                    value={editingCustomer.limitKredit}
                    onChange={e => setEditingCustomer({ ...editingCustomer, limitKredit: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-stone-50 rounded-xl border border-stone-200 outline-hidden font-black text-blue-900"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">No HP / WhatsApp</label>
                <input
                  type="text"
                  value={editingCustomer.noHp}
                  onChange={e => setEditingCustomer({ ...editingCustomer, noHp: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 rounded-xl border border-stone-200 outline-hidden"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Area / Alamat Pasar</label>
                <input
                  type="text"
                  value={editingCustomer.area}
                  onChange={e => setEditingCustomer({ ...editingCustomer, area: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 rounded-xl border border-stone-200 outline-hidden"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Catatan</label>
                <textarea
                  rows={2}
                  value={editingCustomer.catatan || ''}
                  onChange={e => setEditingCustomer({ ...editingCustomer, catatan: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 rounded-xl border border-stone-200 outline-hidden"
                />
              </div>

              <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => handleDeleteCustomer(editingCustomer.id, editingCustomer.nama)}
                  className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Hapus Pelanggan
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingCustomer(null)}
                    className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl font-semibold text-xs transition cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs transition cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? 'Memperbarui...' : 'Simpan Perubahan'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: PAY DEBT */}
      {payingCustomer && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-stone-200 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="font-bold text-stone-900 text-base flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-600" /> Catat Pembayaran Piutang
              </h3>
              <button
                onClick={() => setPayingCustomer(null)}
                className="text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs space-y-1">
              <p className="font-bold text-stone-900 text-sm">{payingCustomer.nama}</p>
              <div className="flex justify-between text-stone-600">
                <span>Sisa Piutang Saat Ini:</span>
                <span className="font-black text-rose-700">{formatRupiah(payingCustomer.sisaPiutang)}</span>
              </div>
            </div>

            <form onSubmit={handlePayDebt} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-stone-700 block mb-1">Nominal Pembayaran (Rp) *</label>
                <input
                  type="number"
                  required
                  min="1000"
                  max={payingCustomer.sisaPiutang}
                  value={paymentAmount}
                  onChange={e => setPaymentAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white rounded-xl border border-stone-300 font-black text-sm text-emerald-950 focus:ring-2 focus:ring-emerald-500 outline-hidden"
                />
                <div className="mt-1 flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setPaymentAmount(payingCustomer.sisaPiutang)}
                    className="text-[10px] px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold"
                  >
                    Lunasi Penuh ({formatRupiah(payingCustomer.sisaPiutang)})
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentAmount(Math.round(payingCustomer.sisaPiutang / 2))}
                    className="text-[10px] px-2 py-0.5 bg-stone-100 text-stone-700 rounded font-bold"
                  >
                    Bayar 50%
                  </button>
                </div>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Setor Masuk Ke Akun *</label>
                <select
                  value={paymentAkun}
                  onChange={e => setPaymentAkun(e.target.value as any)}
                  className="w-full px-3 py-2 bg-stone-50 rounded-xl border border-stone-200 font-semibold text-stone-800"
                >
                  <option value="Kas Operasional">💵 Kas Operasional (Kasir)</option>
                  <option value="Bank BCA Utama">🏦 Bank BCA Utama</option>
                </select>
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-[11px] text-emerald-900 space-y-1">
                <p className="font-bold">Otomasi Transaksi:</p>
                <p>
                  &bull; Saldo sisa piutang otomatis berkurang.<br />
                  &bull; Saldo rekening kas/bank bertambah.<br />
                  &bull; Jurnal Umum penerimaan kas otomatis terbit.<br />
                  &bull; Ter-update otomatis di spreadsheet Google Sheets.
                </p>
              </div>

              <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setPayingCustomer(null)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || paymentAmount <= 0}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold"
                >
                  {isSubmitting ? 'Memproses...' : `Konfirmasi Bayar (${formatRupiah(paymentAmount)})`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: VIEW CUSTOMER ORDER HISTORY */}
      {viewHistoryCustomer && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 border border-stone-200 shadow-xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <h3 className="font-bold text-stone-900 text-base">
                  Riwayat Transaksi: {viewHistoryCustomer.nama}
                </h3>
                <p className="text-xs text-stone-500">
                  Total {viewHistoryCustomer.totalOrder} order &bull; Sisa Piutang: {formatRupiah(viewHistoryCustomer.sisaPiutang)}
                </p>
              </div>
              <button
                onClick={() => setViewHistoryCustomer(null)}
                className="text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              {state.orders.filter(o => o.customerId === viewHistoryCustomer.id).length === 0 ? (
                <div className="py-8 text-center text-stone-400 text-xs">
                  Belum ada catatan order digital tersimpan untuk pelanggan ini.
                </div>
              ) : (
                state.orders
                  .filter(o => o.customerId === viewHistoryCustomer.id)
                  .map(order => (
                    <div key={order.id} className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="font-mono font-bold text-stone-800">{order.noFaktur}</span>
                          <span className="text-stone-400 text-[11px] ml-2">{order.tanggal}</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          order.statusBayar === 'lunas' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {order.statusBayar.toUpperCase()}
                        </span>
                      </div>

                      <div className="space-y-1">
                        {order.items.map((item, i) => (
                          <div key={i} className="flex justify-between text-stone-600 text-[11px]">
                            <span>{item.namaProduk} ({item.kg} kg &times; {formatRupiah(item.hargaPerKg)})</span>
                            <span className="font-semibold text-stone-800">{formatRupiah(item.subtotal)}</span>
                          </div>
                        ))}
                      </div>

                      <div className="pt-2 border-t border-stone-200 flex justify-between font-bold text-stone-900">
                        <span>Total: {order.totalKg} kg</span>
                        <span className="text-amber-800">{formatRupiah(order.totalHarga)}</span>
                      </div>
                    </div>
                  ))
              )}
            </div>

            <div className="pt-3 border-t border-stone-100 text-right">
              <button
                onClick={() => setViewHistoryCustomer(null)}
                className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-semibold"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
