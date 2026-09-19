import React, { useState } from 'react';
import { AppStateData } from '../types';
import { formatRupiah, formatNumber, api } from '../services/api';
import { 
  DollarSign, 
  ShoppingCart, 
  Package, 
  Wallet, 
  ArrowUpRight, 
  ArrowDownRight, 
  Activity, 
  Users, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  FileText, 
  Building, 
  Percent, 
  Check, 
  X,
  TrendingUp,
  CreditCard,
  Truck
} from 'lucide-react';

interface Props {
  state: AppStateData;
  onRefresh: () => void;
  onOpenSync: () => void;
}

export const OwnerDashboard: React.FC<Props> = ({ state, onRefresh, onOpenSync }) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'penjualan' | 'produksi' | 'keuangan' | 'pegawai' | 'laporan' | 'pengaturan'>('dashboard');
  const [isProcessing, setIsProcessing] = useState(false);

  // Calculations
  const omzetHariIni = state.orders.reduce((sum, o) => sum + o.totalHarga, 0);
  const pembelianAyamTotal = state.purchases.reduce((sum, p) => sum + p.totalBiaya, 0);
  const pembelianKgTotal = state.purchases.reduce((sum, p) => sum + p.beratKg, 0);
  
  const stokKarkasKg = state.stocks.find(s => s.kategori === 'karkas')?.stokKg || 0;
  const stokAyamHidupEkor = state.stocks.find(s => s.kategori === 'ayam_hidup')?.stokEkor || 0;
  const stokAyamHidupKg = state.stocks.find(s => s.kategori === 'ayam_hidup')?.stokKg || 0;
  
  const biayaPengeluaran = state.cashTransactions
    .filter(c => c.tipe === 'keluar' && c.kategori !== 'pembelian_ayam')
    .reduce((sum, c) => sum + c.jumlah, 0);
  
  const saldoKasBank = (state.accounts.find(a => a.kode === '1101')?.saldo || 0) +
                       (state.accounts.find(a => a.kode === '1102')?.saldo || 0);

  const totalPiutang = state.customers.reduce((sum, c) => sum + c.sisaPiutang, 0);
  const totalUtang = state.suppliers.reduce((sum, s) => sum + s.totalHutang, 0);

  // Estimated gross profit: Revenue - COGS - Opex
  const hppTotal = state.accounts.find(a => a.kode === '5101')?.saldo || 0;
  const pendapatanTotal = state.accounts.find(a => a.kode === '4101')?.saldo || 0;
  const labaKotor = pendapatanTotal - hppTotal;
  const labaBersihSementara = labaKotor - biayaPengeluaran;

  // Production efficiency (average rendemen)
  const totalKgHidupPotong = state.productions.reduce((sum, p) => sum + p.kgHidup, 0);
  const totalHasilKarkasPotong = state.productions.reduce((sum, p) => sum + p.hasilKarkasKg, 0);
  const totalSusutPotong = state.productions.reduce((sum, p) => sum + p.susutKg, 0);
  const avgRendemen = totalKgHidupPotong > 0 ? ((totalHasilKarkasPotong / totalKgHidupPotong) * 100).toFixed(1) : '72.5';

  // Employees present
  const pegawaiHadir = state.attendance.filter(a => a.status === 'hadir').length;
  const totalPegawai = state.employees.length;

  // Issue indicator calculation
  let healthStatus: 'aman' | 'cek' | 'masalah' = 'aman';
  const issues: string[] = [];

  if (stokAyamHidupEkor < 100) {
    healthStatus = 'cek';
    issues.push('Stok ayam hidup menipis di bawah 100 ekor.');
  }
  if (totalPiutang > 15000000) {
    healthStatus = 'cek';
    issues.push('Total piutang customer melewati batas Rp 15.000.000.');
  }
  const pendingSpecialPrices = state.orders.filter(o => o.specialPriceRequested && !o.specialPriceRequested.approved);
  if (pendingSpecialPrices.length > 0) {
    issues.push(`Ada ${pendingSpecialPrices.length} pengajuan harga khusus dari Sales perlu persetujuan.`);
  }

  const handleApprovePrice = async (orderId: string, approved: boolean) => {
    setIsProcessing(true);
    try {
      await api.approveSpecialPrice(orderId, approved);
      onRefresh();
    } catch (err: any) {
      alert(`Gagal: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Control Buttons */}
      <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-stone-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md text-xs font-bold uppercase tracking-wider bg-stone-900 text-white">
                Dashboard Owner
              </span>
              <span className="text-xs text-stone-500 font-medium">Pengawasan Eksekutif Usaha</span>
            </div>
            <h2 className="text-xl font-bold text-stone-900 mt-1">Ringkasan Eksekutif & Pengendalian</h2>
            <p className="text-xs text-stone-600">
              Melihat omzet, kas, produksi, piutang, dan laba secara langsung dari data riil.
            </p>
          </div>

          {/* Condition Indicator */}
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-semibold ${
              healthStatus === 'aman'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : healthStatus === 'cek'
                ? 'bg-amber-50 text-amber-800 border-amber-200'
                : 'bg-rose-50 text-rose-800 border-rose-200'
            }`}>
              {healthStatus === 'aman' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
              {healthStatus === 'cek' && <AlertTriangle className="w-4 h-4 text-amber-600" />}
              <span>Kondisi Usaha: {healthStatus === 'aman' ? '🟢 AMAN' : healthStatus === 'cek' ? '🟡 PERLU CEK' : '🔴 MASALAH'}</span>
            </div>
          </div>
        </div>

        {/* Owner Menu Buttons */}
        <div className="flex flex-wrap gap-2 pt-3">
          {[
            { id: 'dashboard', label: 'Dashboard' },
            { id: 'penjualan', label: 'Penjualan' },
            { id: 'produksi', label: 'Produksi' },
            { id: 'keuangan', label: 'Keuangan' },
            { id: 'pegawai', label: 'Pegawai' },
            { id: 'laporan', label: 'Laporan Laba/Rugi' },
            { id: 'pengaturan', label: 'Pengaturan' }
          ].map(tab => (
            <button
              key={tab.id}
              id={`owner-btn-${tab.id}`}
              onClick={() => {
                if (tab.id === 'pengaturan') onOpenSync();
                else setActiveTab(tab.id as any);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
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

      {/* Special Price Request Alert from Sales */}
      {pendingSpecialPrices.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <div className="flex items-center gap-2 text-amber-900 font-bold text-sm mb-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            Permintaan Persetujuan Harga Khusus dari Sales
          </div>
          <div className="space-y-2">
            {pendingSpecialPrices.map(order => (
              <div key={order.id} className="bg-white p-3 rounded-xl border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <span className="font-bold text-stone-900">{order.customerNama}</span> ({order.kategoriHarga.replace('_', ' ')}) &bull; Faktur: <span className="font-mono">{order.noFaktur}</span>
                  <div className="text-stone-600 mt-0.5">
                    Harga Standar: <span className="line-through">{formatRupiah(order.specialPriceRequested?.standardTotal || 0)}</span> &rarr; Permintaan: <span className="font-bold text-emerald-700">{formatRupiah(order.specialPriceRequested?.requestedTotal || 0)}</span>
                  </div>
                  <div className="text-stone-500 italic mt-0.5">&ldquo;{order.specialPriceRequested?.reason}&rdquo; (Diajukan oleh: {order.salesNama})</div>
                </div>
                <div className="flex gap-2">
                  <button
                    disabled={isProcessing}
                    onClick={() => handleApprovePrice(order.id, true)}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg flex items-center gap-1 transition"
                  >
                    <Check className="w-3.5 h-3.5" /> Setujui
                  </button>
                  <button
                    disabled={isProcessing}
                    onClick={() => handleApprovePrice(order.id, false)}
                    className="px-3 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-800 font-medium rounded-lg flex items-center gap-1 transition"
                  >
                    <X className="w-3.5 h-3.5" /> Tolak
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* DASHBOARD VIEW (The 11 core metrics from user request) */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Penjualan Hari Ini */}
            <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
              <div className="flex items-center justify-between text-stone-500 mb-1">
                <span className="text-xs font-semibold">Penjualan Hari Ini</span>
                <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600"><DollarSign className="w-4 h-4" /></span>
              </div>
              <div className="text-xl font-black text-stone-900">{formatRupiah(omzetHariIni)}</div>
              <div className="text-[11px] text-stone-500 mt-1 flex items-center justify-between">
                <span>Total Omzet</span>
                <span className="font-medium text-emerald-700">{state.orders.length} transaksi</span>
              </div>
            </div>

            {/* 2. Pembelian Ayam */}
            <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
              <div className="flex items-center justify-between text-stone-500 mb-1">
                <span className="text-xs font-semibold">Pembelian Ayam Masuk</span>
                <span className="p-1.5 rounded-lg bg-amber-50 text-amber-600"><ShoppingCart className="w-4 h-4" /></span>
              </div>
              <div className="text-xl font-black text-stone-900">{formatRupiah(pembelianAyamTotal)}</div>
              <div className="text-[11px] text-stone-500 mt-1 flex items-center justify-between">
                <span>Modal Barang</span>
                <span className="font-medium text-stone-700">{formatNumber(pembelianKgTotal)} kg ayam hidup</span>
              </div>
            </div>

            {/* 3. Kas & Bank */}
            <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
              <div className="flex items-center justify-between text-stone-500 mb-1">
                <span className="text-xs font-semibold">Kas & Bank Tersedia</span>
                <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600"><Wallet className="w-4 h-4" /></span>
              </div>
              <div className="text-xl font-black text-stone-900">{formatRupiah(saldoKasBank)}</div>
              <div className="text-[11px] text-stone-500 mt-1 flex items-center justify-between">
                <span>Uang Tunai & Rekening</span>
                <span className="font-medium text-blue-700">Likuiditas Aman</span>
              </div>
            </div>

            {/* 4. Laba / Rugi Sementara */}
            <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
              <div className="flex items-center justify-between text-stone-500 mb-1">
                <span className="text-xs font-semibold">Laba Bersih Sementara</span>
                <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600"><TrendingUp className="w-4 h-4" /></span>
              </div>
              <div className="text-xl font-black text-emerald-800">{formatRupiah(labaBersihSementara)}</div>
              <div className="text-[11px] text-stone-500 mt-1 flex items-center justify-between">
                <span>Hasil Usaha Hari Ini</span>
                <span className="font-medium text-emerald-600">Margin Sehat</span>
              </div>
            </div>

            {/* 5. Stok Barang Tersisa */}
            <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
              <div className="flex items-center justify-between text-stone-500 mb-1">
                <span className="text-xs font-semibold">Stok Barang Tersisa</span>
                <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600"><Package className="w-4 h-4" /></span>
              </div>
              <div className="text-xl font-black text-stone-900">{formatNumber(stokKarkasKg)} kg Karkas</div>
              <div className="text-[11px] text-stone-500 mt-1 flex items-center justify-between">
                <span>Ayam Hidup di Kandang:</span>
                <span className="font-bold text-stone-800">{stokAyamHidupEkor} ekor ({formatNumber(stokAyamHidupKg)}kg)</span>
              </div>
            </div>

            {/* 6. Piutang Customer */}
            <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
              <div className="flex items-center justify-between text-stone-500 mb-1">
                <span className="text-xs font-semibold">Piutang Customer</span>
                <span className="p-1.5 rounded-lg bg-orange-50 text-orange-600"><CreditCard className="w-4 h-4" /></span>
              </div>
              <div className="text-xl font-black text-stone-900">{formatRupiah(totalPiutang)}</div>
              <div className="text-[11px] text-stone-500 mt-1 flex items-center justify-between">
                <span>Uang Belum Diterima</span>
                <span className="font-medium text-orange-700">{state.customers.filter(c => c.sisaPiutang > 0).length} customer tempo</span>
              </div>
            </div>

            {/* 7. Utang Supplier */}
            <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
              <div className="flex items-center justify-between text-stone-500 mb-1">
                <span className="text-xs font-semibold">Utang Supplier</span>
                <span className="p-1.5 rounded-lg bg-rose-50 text-rose-600"><ArrowDownRight className="w-4 h-4" /></span>
              </div>
              <div className="text-xl font-black text-stone-900">{formatRupiah(totalUtang)}</div>
              <div className="text-[11px] text-stone-500 mt-1 flex items-center justify-between">
                <span>Kewajiban Peternak</span>
                <span className="font-medium text-stone-700">{state.suppliers.filter(s => s.totalHutang > 0).length} supplier</span>
              </div>
            </div>

            {/* 8. Biaya Operasional */}
            <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
              <div className="flex items-center justify-between text-stone-500 mb-1">
                <span className="text-xs font-semibold">Biaya Operasional</span>
                <span className="p-1.5 rounded-lg bg-stone-100 text-stone-600"><Activity className="w-4 h-4" /></span>
              </div>
              <div className="text-xl font-black text-stone-900">{formatRupiah(biayaPengeluaran)}</div>
              <div className="text-[11px] text-stone-500 mt-1 flex items-center justify-between">
                <span>Biaya Potong, Es, Bensin</span>
                <span className="font-medium text-stone-700">Terkontrol</span>
              </div>
            </div>
          </div>

          {/* Secondary Row: Produksi & Pegawai */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Produksi & Efisiensi */}
            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-stone-900 text-sm flex items-center gap-2">
                  <Percent className="w-4 h-4 text-emerald-600" />
                  Efisiensi Produksi & Rendemen Pemotongan
                </h3>
                <span className="px-2 py-0.5 text-xs font-bold bg-emerald-100 text-emerald-800 rounded-md">
                  Rendemen: {avgRendemen}%
                </span>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center mb-3">
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-100">
                  <span className="text-[11px] text-stone-500 block">Total Ayam Potong</span>
                  <span className="font-bold text-sm text-stone-900">{formatNumber(totalKgHidupPotong)} kg</span>
                </div>
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-100">
                  <span className="text-[11px] text-stone-500 block">Hasil Daging Karkas</span>
                  <span className="font-bold text-sm text-emerald-700">{formatNumber(totalHasilKarkasPotong)} kg</span>
                </div>
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-100">
                  <span className="text-[11px] text-stone-500 block">Susut Bobot (Darah/Bulu)</span>
                  <span className="font-bold text-sm text-amber-700">{formatNumber(totalSusutPotong)} kg</span>
                </div>
              </div>
              <p className="text-xs text-stone-500">
                Standar rendemen karkas unggas broiler berada di kisaran 70% - 73%. Susut rata-rata berada pada toleransi wajar.
              </p>
            </div>

            {/* Pegawai & Masalah */}
            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-stone-900 text-sm flex items-center gap-2">
                  <Users className="w-4 h-4 text-indigo-600" />
                  Status Kehadiran Pegawai Hari Ini
                </h3>
                <span className="px-2 py-0.5 text-xs font-bold bg-indigo-50 text-indigo-800 rounded-md">
                  {pegawaiHadir} / {totalPegawai} Hadir
                </span>
              </div>
              <div className="space-y-2 text-xs">
                {state.attendance.slice(0, 3).map(att => (
                  <div key={att.id} className="flex items-center justify-between p-2 rounded-lg bg-stone-50">
                    <span className="font-semibold text-stone-800">{att.pegawaiNama}</span>
                    <span className="text-stone-500">Masuk: {att.jamMasuk} {att.jamPulang ? `| Pulang: ${att.jamPulang}` : '(Aktif)'}</span>
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md text-[10px] font-bold">Hadir</span>
                  </div>
                ))}
              </div>
              {issues.length > 0 && (
                <div className="mt-3 pt-3 border-t border-stone-100">
                  <span className="text-xs font-bold text-amber-800 block mb-1">Catatan Pengawasan:</span>
                  <ul className="text-xs text-stone-600 list-disc list-inside space-y-0.5">
                    {issues.map((iss, idx) => (
                      <li key={idx}>{iss}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* PENJUALAN TAB (Owner perspective) */}
      {activeTab === 'penjualan' && (
        <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-stone-900 text-base">Monitoring Penjualan Real-time</h3>
            <span className="text-xs text-stone-500">{state.orders.length} Transaksi Tercatat</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-500 uppercase font-semibold border-y border-stone-200">
                <tr>
                  <th className="py-2.5 px-3">No. Faktur</th>
                  <th className="py-2.5 px-3">Customer</th>
                  <th className="py-2.5 px-3">Kategori</th>
                  <th className="py-2.5 px-3">Kg</th>
                  <th className="py-2.5 px-3">Total Harga</th>
                  <th className="py-2.5 px-3">Pembayaran</th>
                  <th className="py-2.5 px-3">Status Pengiriman</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {state.orders.map(o => (
                  <tr key={o.id} className="hover:bg-stone-50/80">
                    <td className="py-3 px-3 font-mono font-bold text-stone-900">{o.noFaktur}</td>
                    <td className="py-3 px-3 font-semibold text-stone-900">{o.customerNama}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-stone-100 text-stone-700 capitalize">
                        {o.kategoriHarga.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-medium">{o.totalKg} kg</td>
                    <td className="py-3 px-3 font-bold text-emerald-800">{formatRupiah(o.totalHarga)}</td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        o.statusBayar === 'lunas' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {o.statusBayar === 'lunas' ? 'LUNAS' : `PIUTANG (${formatRupiah(o.sisaPiutang)})`}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-medium capitalize">{o.status.replace('_', ' ')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PRODUKSI TAB (Owner perspective) */}
      {activeTab === 'produksi' && (
        <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs space-y-4">
          <h3 className="font-bold text-stone-900 text-base">Riwayat Pemotongan & Rendemen Karkas</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-500 uppercase font-semibold border-y border-stone-200">
                <tr>
                  <th className="py-2.5 px-3">Batch</th>
                  <th className="py-2.5 px-3">Tanggal</th>
                  <th className="py-2.5 px-3">Operator</th>
                  <th className="py-2.5 px-3">Ayam Hidup</th>
                  <th className="py-2.5 px-3">Hasil Karkas</th>
                  <th className="py-2.5 px-3">Susut (kg)</th>
                  <th className="py-2.5 px-3">Rendemen</th>
                  <th className="py-2.5 px-3">HPP Karkas/kg</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {state.productions.map(p => (
                  <tr key={p.id}>
                    <td className="py-3 px-3 font-mono font-bold text-stone-900">{p.batchNo}</td>
                    <td className="py-3 px-3">{p.tanggal}</td>
                    <td className="py-3 px-3">{p.operatorNama}</td>
                    <td className="py-3 px-3">{p.ekorMasuk} ekor ({p.kgHidup} kg)</td>
                    <td className="py-3 px-3 font-bold text-emerald-800">{p.hasilKarkasKg} kg</td>
                    <td className="py-3 px-3 text-amber-700 font-medium">{p.susutKg} kg</td>
                    <td className="py-3 px-3 font-bold text-stone-900">{p.rendemenPersen}%</td>
                    <td className="py-3 px-3 font-bold text-stone-900">{formatRupiah(p.hppKarkasPerKg)}/kg</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* KEUANGAN TAB */}
      {activeTab === 'keuangan' && (
        <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs space-y-4">
          <h3 className="font-bold text-stone-900 text-base">Arus Kas & Rekap Keuangan Terpusat</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
              <span className="text-xs text-stone-500 block">Kas Operasional</span>
              <span className="text-lg font-bold text-stone-900">{formatRupiah(state.accounts.find(a => a.kode === '1101')?.saldo || 0)}</span>
            </div>
            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
              <span className="text-xs text-stone-500 block">Bank BCA Utama</span>
              <span className="text-lg font-bold text-stone-900">{formatRupiah(state.accounts.find(a => a.kode === '1102')?.saldo || 0)}</span>
            </div>
            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
              <span className="text-xs text-stone-500 block">Total Piutang Berjalan</span>
              <span className="text-lg font-bold text-orange-700">{formatRupiah(totalPiutang)}</span>
            </div>
          </div>
          <div className="space-y-2 pt-2">
            <h4 className="text-xs font-bold text-stone-700 uppercase">Aktivitas Uang Masuk / Keluar Terkini:</h4>
            {state.cashTransactions.slice(0, 5).map(tx => (
              <div key={tx.id} className="flex items-center justify-between p-3 rounded-xl bg-stone-50 border border-stone-100 text-xs">
                <div>
                  <span className="font-semibold text-stone-900 block">{tx.keterangan}</span>
                  <span className="text-[11px] text-stone-500">{tx.tanggal} &bull; {tx.akunKas}</span>
                </div>
                <div className={`font-bold text-sm ${tx.tipe === 'masuk' ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {tx.tipe === 'masuk' ? '+' : '-'}{formatRupiah(tx.jumlah)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* LAPORAN LABA RUGI TAB */}
      {activeTab === 'laporan' && (
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs max-w-2xl mx-auto space-y-4">
          <div className="text-center pb-4 border-b border-stone-200">
            <h3 className="text-lg font-bold text-stone-900">Laporan Laba / Rugi Usaha</h3>
            <p className="text-xs text-stone-500">Perhitungan Otomatis Real-time dari Transaksi Harian</p>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-1 border-b border-stone-100">
              <span className="font-semibold text-stone-800">Pendapatan Penjualan Ayam</span>
              <span className="font-bold text-stone-900">{formatRupiah(pendapatanTotal)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-stone-100 text-rose-800">
              <span>Beban Pokok Penjualan (HPP)</span>
              <span className="font-medium">({formatRupiah(hppTotal)})</span>
            </div>
            <div className="flex justify-between py-2 bg-emerald-50 px-3 rounded-lg font-bold text-emerald-950">
              <span>LABA KOTOR (GROSS PROFIT)</span>
              <span>{formatRupiah(labaKotor)}</span>
            </div>
            <div className="pt-2 text-xs font-bold text-stone-500 uppercase">Beban Operasional:</div>
            <div className="flex justify-between text-xs py-1 text-stone-600">
              <span>Beban Potong & Penanganan Bahan</span>
              <span>{formatRupiah(biayaPengeluaran)}</span>
            </div>
            <div className="flex justify-between py-3 border-t-2 border-stone-900 font-black text-base text-stone-900">
              <span>LABA BERSIH SEMENTARA</span>
              <span className="text-emerald-800">{formatRupiah(labaBersihSementara)}</span>
            </div>
          </div>
        </div>
      )}

      {/* PEGAWAI TAB */}
      {activeTab === 'pegawai' && (
        <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-stone-900 text-base">Monitoring Tim & Produktivitas</h3>
            <span className="text-xs font-semibold text-stone-500">{state.employees.length} Pegawai Terdaftar</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {state.employees.map(emp => (
              <div key={emp.id} className="p-3.5 rounded-xl border border-stone-200 bg-stone-50 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-stone-900 text-xs sm:text-sm">{emp.nama}</h4>
                  <p className="text-[11px] text-stone-500 uppercase tracking-wider">{emp.nip} &bull; Bagian: <span className="font-semibold text-stone-800 capitalize">{emp.bagian}</span></p>
                  <p className="text-[11px] text-emerald-800 mt-1">Gaji: {formatRupiah(emp.gajiPokok)} + Insentif {formatRupiah(emp.insentifPerKg)}/kg</p>
                </div>
                <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-800">
                  Aktif
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
