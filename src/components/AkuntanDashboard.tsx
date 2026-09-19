import React, { useState } from 'react';
import { AppStateData } from '../types';
import { formatRupiah, formatNumber, api } from '../services/api';
import { 
  FileCheck, 
  BookOpen, 
  FileSpreadsheet, 
  PieChart, 
  CreditCard, 
  DollarSign, 
  Layers, 
  Scale, 
  TrendingUp, 
  Landmark,
  CheckCircle,
  Plus
} from 'lucide-react';

interface Props {
  state: AppStateData;
  onRefresh: () => void;
}

export const AkuntanDashboard: React.FC<Props> = ({ state, onRefresh }) => {
  const [activeTab, setActiveTab] = useState<'verifikasi' | 'jurnal' | 'bukubesar' | 'hpp' | 'piutang' | 'utang' | 'aset' | 'labarugi' | 'neraca' | 'aruskas'>('verifikasi');
  
  // Payment modals
  const [showPayPiutangModal, setShowPayPiutangModal] = useState<string | null>(null);
  const [payPiutangAmount, setPayPiutangAmount] = useState(1000000);
  const [payPiutangKas, setPayPiutangKas] = useState('Kas Operasional');

  const [showPayUtangModal, setShowPayUtangModal] = useState<string | null>(null);
  const [payUtangAmount, setPayUtangAmount] = useState(5000000);
  const [payUtangKas, setPayUtangKas] = useState('Bank BCA Utama');

  // Calculations for financial reports
  const pendapatan = state.accounts.find(a => a.kode === '4101')?.saldo || 0;
  const hpp = state.accounts.find(a => a.kode === '5101')?.saldo || 0;
  const labaKotor = pendapatan - hpp;
  const bebanOpex = state.accounts
    .filter(a => a.kode.startsWith('6'))
    .reduce((sum, a) => sum + a.saldo, 0);
  const labaBersih = labaKotor - bebanOpex;

  // Balance sheet
  const totalAktiva = state.accounts
    .filter(a => a.tipe === 'aktiva')
    .reduce((sum, a) => sum + a.saldo, 0);
  const totalKewajiban = state.accounts
    .filter(a => a.tipe === 'kewajiban')
    .reduce((sum, a) => sum + a.saldo, 0);
  const totalModal = state.accounts
    .filter(a => a.tipe === 'modal')
    .reduce((sum, a) => sum + a.saldo, 0);

  const handlePayPiutang = async (custId: string) => {
    try {
      await api.payCustomerDebt(custId, payPiutangAmount, payPiutangKas);
      alert('Pelunasan piutang berhasil dicatat! Kas bertambah dan jurnal otomatis terbentuk.');
      setShowPayPiutangModal(null);
      onRefresh();
    } catch (err: any) {
      alert(`Gagal: ${err.message}`);
    }
  };

  const handlePayUtang = async (supId: string) => {
    try {
      await api.paySupplierDebt(supId, payUtangAmount, payUtangKas);
      alert('Pembayaran utang supplier berhasil dicatat! Kas berkurang dan jurnal otomatis terbentuk.');
      setShowPayUtangModal(null);
      onRefresh();
    } catch (err: any) {
      alert(`Gagal: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Accountant Top Header */}
      <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md text-xs font-bold uppercase tracking-wider bg-indigo-900 text-white">
                Dashboard Akuntan
              </span>
              <span className="text-xs text-stone-500 font-medium">Sistem Pembukuan Berpasangan Otomatis</span>
            </div>
            <h2 className="text-xl font-bold text-stone-900 mt-1">Verifikasi Transaksi & Buku Besar</h2>
            <p className="text-xs text-stone-600">
              Tidak ada input ganda. Semua transaksi operasional otomatis membentuk jurnal debit/kredit dan buku besar.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-semibold flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-600" /> Jurnal Selaras & Balance
            </span>
          </div>
        </div>

        {/* 10 Navigation Tabs from specification */}
        <div className="flex flex-wrap gap-2 pt-3">
          {[
            { id: 'verifikasi', label: '01 - Verifikasi Transaksi', icon: <FileCheck className="w-3.5 h-3.5" /> },
            { id: 'jurnal', label: '02 - Jurnal Umum', icon: <BookOpen className="w-3.5 h-3.5" /> },
            { id: 'bukubesar', label: '03 - Buku Besar', icon: <FileSpreadsheet className="w-3.5 h-3.5" /> },
            { id: 'hpp', label: '04 - HPP Karkas', icon: <PieChart className="w-3.5 h-3.5" /> },
            { id: 'piutang', label: '05 - Kartu Piutang', icon: <CreditCard className="w-3.5 h-3.5" /> },
            { id: 'utang', label: '06 - Kartu Utang', icon: <DollarSign className="w-3.5 h-3.5" /> },
            { id: 'aset', label: '07 - Aset Tetap', icon: <Layers className="w-3.5 h-3.5" /> },
            { id: 'labarugi', label: '08 - Laba Rugi', icon: <TrendingUp className="w-3.5 h-3.5" /> },
            { id: 'neraca', label: '09 - Neraca', icon: <Scale className="w-3.5 h-3.5" /> },
            { id: 'aruskas', label: '10 - Arus Kas', icon: <Landmark className="w-3.5 h-3.5" /> }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-indigo-900 text-white shadow-xs'
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 01 - VERIFIKASI TRANSAKSI */}
      {activeTab === 'verifikasi' && (
        <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-stone-900 text-base">Verifikasi Transaksi Operasional Terbaru</h3>
            <span className="text-xs text-stone-500 font-medium">Semua data terverifikasi otomatis oleh sistem trigger</span>
          </div>
          <div className="space-y-3">
            {state.journals.slice(0, 6).map(j => (
              <div key={j.id} className="p-3.5 rounded-xl border border-stone-200 bg-stone-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono font-bold text-stone-900">{j.noBukti}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800">
                      {j.tipeTrigger.replace('_', ' ').toUpperCase()}
                    </span>
                    <span className="text-stone-500">{j.tanggal}</span>
                  </div>
                  <p className="text-stone-700 font-medium">{j.keterangan}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-[11px] flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" /> Terverifikasi
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 02 - JURNAL UMUM */}
      {activeTab === 'jurnal' && (
        <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-stone-900 text-base">Jurnal Umum (Double-Entry Bookkeeping)</h3>
            <span className="text-xs text-stone-500">{state.journals.length} Jurnal Tercatat</span>
          </div>
          <div className="space-y-4">
            {state.journals.map(journal => (
              <div key={journal.id} className="border border-stone-200 rounded-xl overflow-hidden">
                <div className="bg-stone-50 px-4 py-2 border-b border-stone-200 flex justify-between items-center text-xs">
                  <div>
                    <span className="font-mono font-bold text-stone-900">{journal.noBukti}</span> &bull; {journal.tanggal}
                    <span className="ml-2 text-stone-600 font-medium">{journal.keterangan}</span>
                  </div>
                  <span className="text-[11px] text-stone-500 font-mono">Ref: {journal.referensiId || '-'}</span>
                </div>
                <table className="w-full text-left text-xs">
                  <thead className="bg-white text-stone-400 font-medium border-b border-stone-100">
                    <tr>
                      <th className="py-2 px-4">Kode & Nama Akun</th>
                      <th className="py-2 px-4 text-right">Debit</th>
                      <th className="py-2 px-4 text-right">Kredit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {journal.lines.map((line, idx) => (
                      <tr key={idx} className="hover:bg-stone-50/50">
                        <td className={`py-2 px-4 ${line.kredit > 0 ? 'pl-8 text-stone-700' : 'font-semibold text-stone-900'}`}>
                          <span className="font-mono mr-2">{line.akunKode}</span>
                          {line.akunNama}
                        </td>
                        <td className="py-2 px-4 text-right font-medium">
                          {line.debit > 0 ? formatRupiah(line.debit) : '-'}
                        </td>
                        <td className="py-2 px-4 text-right font-medium">
                          {line.kredit > 0 ? formatRupiah(line.kredit) : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 03 - BUKU BESAR */}
      {activeTab === 'bukubesar' && (
        <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs space-y-4">
          <h3 className="font-bold text-stone-900 text-base">Buku Besar (General Ledger Accounts)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {state.accounts.map(acc => (
              <div key={acc.kode} className="p-4 rounded-xl border border-stone-200 bg-stone-50 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-mono font-bold text-xs text-indigo-900 bg-indigo-50 px-2 py-0.5 rounded-md">
                    {acc.kode}
                  </span>
                  <span className="text-[11px] text-stone-500 uppercase font-semibold">
                    Saldo Normal: {acc.saldoNormal}
                  </span>
                </div>
                <h4 className="font-bold text-sm text-stone-900">{acc.nama}</h4>
                <div className="flex justify-between items-center pt-2 border-t border-stone-200">
                  <span className="text-xs text-stone-500">Saldo Akhir:</span>
                  <span className="text-base font-black text-stone-900">{formatRupiah(acc.saldo)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 04 - HPP KARKAS */}
      {activeTab === 'hpp' && (
        <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs space-y-4">
          <h3 className="font-bold text-stone-900 text-base">Analisis Pembentukan HPP Karkas Per Batch</h3>
          <p className="text-xs text-stone-600">
            HPP dihitung dari: (Total Biaya Ayam Hidup + Biaya Potong Operasional - Nilai Jual Sampingan Jeroan/Ceker) / Total Kg Karkas Bersih.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-500 uppercase font-semibold border-y border-stone-200">
                <tr>
                  <th className="py-2.5 px-3">Batch</th>
                  <th className="py-2.5 px-3">Ayam Hidup</th>
                  <th className="py-2.5 px-3">Biaya Potong</th>
                  <th className="py-2.5 px-3">Hasil Karkas (kg)</th>
                  <th className="py-2.5 px-3">HPP per Kg Karkas</th>
                  <th className="py-2.5 px-3">Harga Jual Partai</th>
                  <th className="py-2.5 px-3">Margin Laba Kotor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {state.productions.map(prd => {
                  const hargaJualPartai = 33000;
                  const marginPerKg = hargaJualPartai - prd.hppKarkasPerKg;
                  const marginPct = ((marginPerKg / hargaJualPartai) * 100).toFixed(1);
                  return (
                    <tr key={prd.id}>
                      <td className="py-3 px-3 font-mono font-bold text-stone-900">{prd.batchNo}</td>
                      <td className="py-3 px-3">{prd.kgHidup} kg</td>
                      <td className="py-3 px-3">{formatRupiah(prd.biayaPotong)}</td>
                      <td className="py-3 px-3 font-bold text-stone-900">{prd.hasilKarkasKg} kg</td>
                      <td className="py-3 px-3 font-bold text-indigo-900">{formatRupiah(prd.hppKarkasPerKg)}/kg</td>
                      <td className="py-3 px-3">{formatRupiah(hargaJualPartai)}/kg</td>
                      <td className="py-3 px-3 font-bold text-emerald-800">
                        {formatRupiah(marginPerKg)}/kg ({marginPct}%)
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 05 - KARTU PIUTANG CUSTOMER */}
      {activeTab === 'piutang' && (
        <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-stone-900 text-base">Kartu Piutang Customer & Pelunasan</h3>
            <span className="text-xs font-bold text-orange-700">
              Total Piutang Berjalan: {formatRupiah(state.customers.reduce((s, c) => s + c.sisaPiutang, 0))}
            </span>
          </div>
          <div className="space-y-3">
            {state.customers.map(c => (
              <div key={c.id} className="p-4 rounded-xl border border-stone-200 bg-stone-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <h4 className="font-bold text-sm text-stone-900">{c.nama}</h4>
                  <p className="text-stone-500">Area: {c.area} &bull; HP: {c.noHp} &bull; Limit Kredit: {formatRupiah(c.limitKredit)}</p>
                  <p className="text-stone-700 font-semibold mt-1">
                    Sisa Tagihan Piutang: <span className="text-orange-700 font-bold">{formatRupiah(c.sisaPiutang)}</span>
                  </p>
                </div>
                {c.sisaPiutang > 0 && (
                  <button
                    onClick={() => {
                      setShowPayPiutangModal(c.id);
                      setPayPiutangAmount(c.sisaPiutang);
                    }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 transition"
                  >
                    <Plus className="w-3.5 h-3.5" /> Catat Pelunasan
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 06 - KARTU UTANG SUPPLIER */}
      {activeTab === 'utang' && (
        <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-stone-900 text-base">Kartu Utang Supplier Peternak</h3>
            <span className="text-xs font-bold text-rose-700">
              Total Utang Usaha: {formatRupiah(state.suppliers.reduce((s, sup) => s + sup.totalHutang, 0))}
            </span>
          </div>
          <div className="space-y-3">
            {state.suppliers.map(s => (
              <div key={s.id} className="p-4 rounded-xl border border-stone-200 bg-stone-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <h4 className="font-bold text-sm text-stone-900">{s.nama}</h4>
                  <p className="text-stone-500">Kontak: {s.kontak} &bull; Wilayah: {s.area}</p>
                  <p className="text-stone-700 font-semibold mt-1">
                    Kewajiban Utang: <span className="text-rose-700 font-bold">{formatRupiah(s.totalHutang)}</span>
                  </p>
                </div>
                {s.totalHutang > 0 && (
                  <button
                    onClick={() => {
                      setShowPayUtangModal(s.id);
                      setPayUtangAmount(s.totalHutang);
                    }}
                    className="px-4 py-2 bg-rose-700 hover:bg-rose-800 text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 transition"
                  >
                    <Plus className="w-3.5 h-3.5" /> Bayar Utang Peternak
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 07 - ASET TETAP */}
      {activeTab === 'aset' && (
        <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs space-y-4">
          <h3 className="font-bold text-stone-900 text-base">Daftar Aset Tetap & Peralatan Produksi</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl border border-stone-200 bg-stone-50 space-y-1">
              <span className="font-bold text-stone-900 text-sm block">Mesin Pencabut Bulu (2 Unit)</span>
              <p className="text-stone-500">Nilai Perolehan: Rp 25.000.000</p>
              <p className="text-emerald-800 font-semibold">Kondisi: Berfungsi Normal</p>
            </div>
            <div className="p-4 rounded-xl border border-stone-200 bg-stone-50 space-y-1">
              <span className="font-bold text-stone-900 text-sm block">Cold Storage & Chiller 3 Ton</span>
              <p className="text-stone-500">Nilai Perolehan: Rp 45.000.000</p>
              <p className="text-emerald-800 font-semibold">Suhu: 0°C s/d -4°C Stabil</p>
            </div>
            <div className="p-4 rounded-xl border border-stone-200 bg-stone-50 space-y-1">
              <span className="font-bold text-stone-900 text-sm block">Mobil Box Pick-up Pendingin</span>
              <p className="text-stone-500">Nilai Perolehan: Rp 15.000.000 (Aset Armada)</p>
              <p className="text-emerald-800 font-semibold">Kondisi: Siap Kirim</p>
            </div>
          </div>
        </div>
      )}

      {/* 08 - LABA RUGI */}
      {activeTab === 'labarugi' && (
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs max-w-2xl mx-auto space-y-3 text-sm">
          <div className="text-center pb-3 border-b border-stone-200">
            <h3 className="font-bold text-stone-900 text-base">Laporan Laba Rugi Komprehensif</h3>
            <span className="text-xs text-stone-500">Standar Akuntansi Keuangan</span>
          </div>
          <div className="flex justify-between py-1 border-b border-stone-100">
            <span className="font-medium text-stone-800">Pendapatan Usaha Penjualan</span>
            <span className="font-bold text-stone-900">{formatRupiah(pendapatan)}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-stone-100 text-rose-700">
            <span>Beban Pokok Penjualan (HPP Daging)</span>
            <span>({formatRupiah(hpp)})</span>
          </div>
          <div className="flex justify-between py-2 bg-emerald-50 px-3 rounded-lg font-bold text-emerald-950">
            <span>LABA KOTOR USAHA</span>
            <span>{formatRupiah(labaKotor)}</span>
          </div>
          <div className="flex justify-between py-1 text-stone-600">
            <span>Total Beban Operasional & Gaji</span>
            <span>({formatRupiah(bebanOpex)})</span>
          </div>
          <div className="flex justify-between py-2 border-t-2 border-stone-900 font-black text-base">
            <span>LABA BERSIH TAHUN BERJALAN</span>
            <span className="text-emerald-800">{formatRupiah(labaBersih)}</span>
          </div>
        </div>
      )}

      {/* 09 - NERACA */}
      {activeTab === 'neraca' && (
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs max-w-3xl mx-auto space-y-4 text-xs">
          <div className="text-center pb-3 border-b border-stone-200">
            <h3 className="font-bold text-stone-900 text-base">Laporan Posisi Keuangan (Neraca)</h3>
            <span className="text-stone-500">Keseimbangan Aktiva = Kewajiban + Ekuitas</span>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <h4 className="font-bold text-stone-900 text-sm pb-1 border-b border-stone-300">AKTIVA</h4>
              {state.accounts.filter(a => a.tipe === 'aktiva').map(a => (
                <div key={a.kode} className="flex justify-between py-0.5">
                  <span className="text-stone-600">{a.nama}</span>
                  <span className="font-semibold text-stone-900">{formatRupiah(a.saldo)}</span>
                </div>
              ))}
              <div className="flex justify-between pt-2 border-t-2 border-stone-900 font-bold text-sm">
                <span>TOTAL AKTIVA:</span>
                <span>{formatRupiah(totalAktiva)}</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-bold text-stone-900 text-sm pb-1 border-b border-stone-300">KEWAJIBAN (UTANG)</h4>
                {state.accounts.filter(a => a.tipe === 'kewajiban').map(a => (
                  <div key={a.kode} className="flex justify-between py-0.5">
                    <span className="text-stone-600">{a.nama}</span>
                    <span className="font-semibold text-stone-900">{formatRupiah(a.saldo)}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                <h4 className="font-bold text-stone-900 text-sm pb-1 border-b border-stone-300">MODAL & EKUITAS</h4>
                {state.accounts.filter(a => a.tipe === 'modal').map(a => (
                  <div key={a.kode} className="flex justify-between py-0.5">
                    <span className="text-stone-600">{a.nama}</span>
                    <span className="font-semibold text-stone-900">{formatRupiah(a.saldo)}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between pt-2 border-t-2 border-stone-900 font-bold text-sm">
                <span>TOTAL KEWAJIBAN & EKUITAS:</span>
                <span>{formatRupiah(totalKewajiban + totalModal)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 10 - ARUS KAS */}
      {activeTab === 'aruskas' && (
        <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs space-y-4">
          <h3 className="font-bold text-stone-900 text-base">Laporan Arus Kas Operasional</h3>
          <div className="space-y-2 text-xs">
            {state.cashTransactions.map(tx => (
              <div key={tx.id} className="p-3 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-stone-900 block">{tx.keterangan}</span>
                  <span className="text-stone-500">{tx.tanggal} &bull; {tx.akunKas}</span>
                </div>
                <div className={`font-bold text-sm ${tx.tipe === 'masuk' ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {tx.tipe === 'masuk' ? '+' : '-'}{formatRupiah(tx.jumlah)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: Pelunasan Piutang */}
      {showPayPiutangModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-stone-200 text-xs">
            <h3 className="text-base font-bold text-stone-900 mb-2">Terima Pembayaran Piutang</h3>
            <div className="space-y-3">
              <div>
                <label className="block font-semibold mb-1">Nominal Diterima (Rp):</label>
                <input
                  type="number"
                  value={payPiutangAmount}
                  onChange={e => setPayPiutangAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Masuk ke Rekening/Kas:</label>
                <select
                  value={payPiutangKas}
                  onChange={e => setPayPiutangKas(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl"
                >
                  <option value="Kas Operasional">Kas Operasional</option>
                  <option value="Bank BCA Utama">Bank BCA Utama</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button onClick={() => setShowPayPiutangModal(null)} className="px-3 py-1.5 border rounded-xl">Batal</button>
                <button
                  onClick={() => handlePayPiutang(showPayPiutangModal)}
                  className="px-4 py-1.5 bg-emerald-600 text-white font-semibold rounded-xl"
                >
                  Simpan Pelunasan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Pembayaran Utang Supplier */}
      {showPayUtangModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-stone-200 text-xs">
            <h3 className="text-base font-bold text-stone-900 mb-2">Bayar Utang ke Supplier Peternak</h3>
            <div className="space-y-3">
              <div>
                <label className="block font-semibold mb-1">Nominal Pembayaran (Rp):</label>
                <input
                  type="number"
                  value={payUtangAmount}
                  onChange={e => setPayUtangAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Sumber Rekening/Kas:</label>
                <select
                  value={payUtangKas}
                  onChange={e => setPayUtangKas(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl"
                >
                  <option value="Bank BCA Utama">Bank BCA Utama</option>
                  <option value="Kas Operasional">Kas Operasional</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button onClick={() => setShowPayUtangModal(null)} className="px-3 py-1.5 border rounded-xl">Batal</button>
                <button
                  onClick={() => handlePayUtang(showPayUtangModal)}
                  className="px-4 py-1.5 bg-rose-700 text-white font-semibold rounded-xl"
                >
                  Bayar Utang
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
