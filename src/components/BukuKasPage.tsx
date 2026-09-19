import React, { useState } from 'react';
import { AppStateData, CashTransaction } from '../types';
import { api, formatRupiah, formatNumber } from '../services/api';
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft, 
  PlusCircle, 
  Building, 
  CreditCard, 
  Filter, 
  Download, 
  BookOpen, 
  CheckCircle2, 
  FileSpreadsheet,
  X,
  Search,
  Layers,
  Edit2,
  Trash2
} from 'lucide-react';

interface Props {
  state: AppStateData;
  onRefresh: () => void;
  onOpenSyncModal: () => void;
}

export const BukuKasPage: React.FC<Props> = ({ state, onRefresh, onOpenSyncModal }) => {
  const [activeTab, setActiveTab] = useState<'mutasi' | 'buku_besar'>('mutasi');
  const [filterAkun, setFilterAkun] = useState<string>('semua');
  const [filterTipe, setFilterTipe] = useState<string>('semua');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedLedgerCode, setSelectedLedgerCode] = useState<string>('1101');
  const [isCashModalOpen, setIsCashModalOpen] = useState(false);
  const [editingCashId, setEditingCashId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Cash In/Out Form State
  const [cashForm, setCashForm] = useState({
    tipe: 'keluar' as 'masuk' | 'keluar',
    akunKas: 'Kas Operasional' as CashTransaction['akunKas'],
    kategori: 'operasional' as CashTransaction['kategori'],
    jumlah: 0,
    keterangan: '',
    bebanKode: '6101'
  });

  // Calculate Liquid Balances from General Ledger accounts
  const kasOperasional = state.accounts.find(a => a.kode === '1101')?.saldo || 0;
  const bankBCA = state.accounts.find(a => a.kode === '1102')?.saldo || 0;
  const bankMandiri = state.accounts.find(a => a.kode === '1107')?.saldo || 0;
  const totalLikuiditas = kasOperasional + bankBCA + bankMandiri;

  // Filtered Cash Transactions
  const filteredTransactions = state.cashTransactions.filter(tx => {
    const matchAkun = filterAkun === 'semua' || tx.akunKas === filterAkun;
    const matchTipe = filterTipe === 'semua' || tx.tipe === filterTipe;
    const matchSearch = tx.keterangan.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        tx.kategori.toLowerCase().includes(searchTerm.toLowerCase());
    return matchAkun && matchTipe && matchSearch;
  });

  // Selected GL Account Details
  const selectedAccount = state.accounts.find(a => a.kode === selectedLedgerCode);
  const ledgerJournals = state.journals.filter(j => 
    j.lines.some(l => l.akunKode === selectedLedgerCode)
  );

  // Open Edit Cash Transaction
  const handleOpenEditCash = (tx: CashTransaction) => {
    setEditingCashId(tx.id);
    setCashForm({
      tipe: tx.tipe,
      akunKas: tx.akunKas,
      kategori: tx.kategori,
      jumlah: tx.jumlah,
      keterangan: tx.keterangan,
      bebanKode: tx.bebanKode || '6101'
    });
    setIsCashModalOpen(true);
  };

  // Delete Cash Transaction
  const handleDeleteCash = async (id: string, keterangan: string) => {
    if (!window.confirm(`Yakin ingin menghapus mutasi kas "${keterangan}"?`)) return;
    setIsSubmitting(true);
    try {
      await api.deleteCash(id);
      alert('Transaksi kas berhasil dihapus');
      onRefresh();
    } catch (err: any) {
      alert('Gagal menghapus transaksi kas: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Save Cash Transaction
  const handleSaveCash = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cashForm.jumlah <= 0 || !cashForm.keterangan) return;

    setIsSubmitting(true);
    try {
      if (editingCashId) {
        await api.updateCash(editingCashId, {
          ...cashForm,
          jumlah: Number(cashForm.jumlah)
        });
        alert('Transaksi kas berhasil diperbarui!');
      } else {
        await api.recordCash({
          ...cashForm,
          jumlah: Number(cashForm.jumlah)
        });
        alert('Transaksi kas berhasil dicatat!');
      }
      setIsCashModalOpen(false);
      setEditingCashId(null);
      setCashForm({
        tipe: 'keluar',
        akunKas: 'Kas Operasional',
        kategori: 'operasional',
        jumlah: 0,
        keterangan: '',
        bebanKode: '6101'
      });
      onRefresh();
    } catch (err: any) {
      alert('Gagal menyimpan mutasi kas: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['ID', 'Tanggal', 'Rekening Akun', 'Tipe', 'Kategori', 'Debit (Masuk)', 'Kredit (Keluar)', 'Keterangan'];
    const rows = filteredTransactions.map(t => [
      t.id,
      t.tanggal,
      `"${t.akunKas}"`,
      t.tipe.toUpperCase(),
      t.kategori,
      t.tipe === 'masuk' ? t.jumlah : 0,
      t.tipe === 'keluar' ? t.jumlah : 0,
      `"${t.keterangan.replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Buku_Kas_Ayam_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Buku Kas */}
      <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-black text-stone-900 tracking-tight">
                Buku Besar Kas & Rekening Bank
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-200">
                Terpisah Khusus
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Pantau saldo riil Kas Operasional, Bank BCA, Bank Mandiri &bull; Input pengeluaran operasional &bull; Jurnal otomatis
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-semibold transition"
          >
            <Download className="w-4 h-4 text-stone-500" />
            <span>Ekspor CSV</span>
          </button>
          <button
            onClick={() => setIsCashModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Catat Kas Masuk / Keluar</span>
          </button>
        </div>
      </div>

      {/* Account Balances Grid (3 Accounts + Total) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Kas Operasional */}
        <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500">KAS OPERASIONAL (KASIR)</span>
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <Wallet className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl font-black text-stone-900">{formatRupiah(kasOperasional)}</p>
          <div className="text-[11px] text-stone-500 flex items-center justify-between">
            <span>Akun GL: 1101</span>
            <span className="font-semibold text-emerald-700">Tunai Fisik Toko</span>
          </div>
        </div>

        {/* Bank BCA Utama */}
        <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500">BANK BCA UTAMA</span>
            <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <Building className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl font-black text-blue-900">{formatRupiah(bankBCA)}</p>
          <div className="text-[11px] text-stone-500 flex items-center justify-between">
            <span>Akun GL: 1102</span>
            <span className="font-semibold text-blue-700">Rek: 8820-9988-12</span>
          </div>
        </div>

        {/* Bank Mandiri Operasional */}
        <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500">BANK MANDIRI</span>
            <span className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
              <CreditCard className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl font-black text-amber-900">{formatRupiah(bankMandiri)}</p>
          <div className="text-[11px] text-stone-500 flex items-center justify-between">
            <span>Akun GL: 1107</span>
            <span className="font-semibold text-amber-700">Rek: 137-00-1928</span>
          </div>
        </div>

        {/* Total Liquid Funds */}
        <div className="bg-gradient-to-br from-stone-900 to-stone-800 text-white rounded-2xl p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-300">TOTAL LIKUIDITAS KAS & BANK</span>
            <span className="p-1.5 rounded-lg bg-stone-700 text-emerald-400">
              <Layers className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl font-black text-emerald-400">{formatRupiah(totalLikuiditas)}</p>
          <div className="text-[11px] text-stone-400 flex items-center justify-between">
            <span>Siap Pakai Operasional</span>
            <span className="text-stone-300 font-medium">3 Akun Aktif</span>
          </div>
        </div>
      </div>

      {/* Tabs View Selector: Mutasi Kas vs Buku Besar GL */}
      <div className="bg-white rounded-2xl p-1.5 border border-stone-200 inline-flex gap-1 text-xs">
        <button
          onClick={() => setActiveTab('mutasi')}
          className={`px-4 py-2 rounded-xl font-bold transition ${
            activeTab === 'mutasi'
              ? 'bg-stone-900 text-white shadow-xs'
              : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          Tabel Mutasi Kas & Bank
        </button>
        <button
          onClick={() => setActiveTab('buku_besar')}
          className={`px-4 py-2 rounded-xl font-bold transition ${
            activeTab === 'buku_besar'
              ? 'bg-stone-900 text-white shadow-xs'
              : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          Buku Besar Akun (General Ledger)
        </button>
      </div>

      {/* TAB 1: MUTASI KAS & BANK */}
      {activeTab === 'mutasi' && (
        <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden space-y-4 p-5">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Cari transaksi kas (misal: es batu, upah, bensin, penjualan)..."
                className="w-full pl-10 pr-4 py-2 bg-stone-50 rounded-xl border border-stone-200 outline-hidden focus:bg-white"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
              <select
                value={filterAkun}
                onChange={e => setFilterAkun(e.target.value)}
                className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-semibold text-stone-700 outline-hidden"
              >
                <option value="semua">Semua Akun Rekening</option>
                <option value="Kas Operasional">Kas Operasional</option>
                <option value="Bank BCA Utama">Bank BCA Utama</option>
                <option value="Bank Mandiri">Bank Mandiri</option>
              </select>

              <select
                value={filterTipe}
                onChange={e => setFilterTipe(e.target.value)}
                className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-semibold text-stone-700 outline-hidden"
              >
                <option value="semua">Semua Tipe</option>
                <option value="masuk">Pemasukan (Debit Kas)</option>
                <option value="keluar">Pengeluaran (Kredit Kas)</option>
              </select>
            </div>
          </div>

          {/* Mutation Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-stone-50 text-stone-600 font-bold border-b border-stone-200">
                  <th className="py-2.5 px-3">Tanggal</th>
                  <th className="py-2.5 px-3">Rekening Akun</th>
                  <th className="py-2.5 px-3">Uraian / Keterangan</th>
                  <th className="py-2.5 px-3">Kategori</th>
                  <th className="py-2.5 px-3 text-right">Pemasukan (Masuk)</th>
                  <th className="py-2.5 px-3 text-right">Pengeluaran (Keluar)</th>
                  <th className="py-2.5 px-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-stone-400">
                      Tidak ada data mutasi kas sesuai filter pencarian.
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map(tx => (
                    <tr key={tx.id} className="hover:bg-stone-50">
                      <td className="py-2.5 px-3 text-stone-500 font-mono">{tx.tanggal}</td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded-md font-semibold text-[11px] ${
                          tx.akunKas === 'Bank BCA Utama'
                            ? 'bg-blue-50 text-blue-800'
                            : tx.akunKas === 'Bank Mandiri'
                            ? 'bg-amber-50 text-amber-800'
                            : 'bg-emerald-50 text-emerald-800'
                        }`}>
                          {tx.akunKas}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-stone-900">{tx.keterangan}</td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-stone-100 text-stone-600 uppercase">
                          {tx.kategori.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-emerald-700">
                        {tx.tipe === 'masuk' ? formatRupiah(tx.jumlah) : '-'}
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-rose-700">
                        {tx.tipe === 'keluar' ? formatRupiah(tx.jumlah) : '-'}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenEditCash(tx)}
                            className="p-1 text-stone-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                            title="Edit Transaksi Kas"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteCash(tx.id, tx.keterangan)}
                            className="p-1 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                            title="Hapus Transaksi Kas"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: GENERAL LEDGER (BUKU BESAR AKUN) */}
      {activeTab === 'buku_besar' && (
        <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-stone-900">Buku Besar Akun (General Ledger)</h3>
              <p className="text-xs text-stone-500">Pilih akun akuntansi untuk melihat mutasi debit, kredit, dan saldo berjalan</p>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-stone-700">Pilih Akun:</label>
              <select
                value={selectedLedgerCode}
                onChange={e => setSelectedLedgerCode(e.target.value)}
                className="px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-stone-800 outline-hidden"
              >
                {state.accounts.map(acc => (
                  <option key={acc.kode} value={acc.kode}>
                    {acc.kode} - {acc.nama} ({acc.tipe.toUpperCase()})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {selectedAccount && (
            <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div>
                <span className="font-mono font-bold text-blue-800 text-sm">{selectedAccount.kode}</span>
                <h4 className="text-base font-black text-stone-900">{selectedAccount.nama}</h4>
                <p className="text-stone-500">
                  Tipe: {selectedAccount.tipe.toUpperCase()} &bull; Saldo Normal: {selectedAccount.saldoNormal.toUpperCase()}
                </p>
              </div>
              <div className="text-right">
                <span className="text-stone-500 block">Saldo Akhir Akun:</span>
                <span className="text-xl font-black text-emerald-700">
                  {formatRupiah(selectedAccount.saldo)}
                </span>
              </div>
            </div>
          )}

          {/* Ledger Entries Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-stone-50 text-stone-600 font-bold border-b border-stone-200">
                  <th className="py-2.5 px-3">Tanggal</th>
                  <th className="py-2.5 px-3">No Bukti Jurnal</th>
                  <th className="py-2.5 px-3">Keterangan Transaksi</th>
                  <th className="py-2.5 px-3 text-right">Debit</th>
                  <th className="py-2.5 px-3 text-right">Kredit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {ledgerJournals.map(j => {
                  const line = j.lines.find(l => l.akunKode === selectedLedgerCode);
                  if (!line) return null;
                  return (
                    <tr key={j.id} className="hover:bg-stone-50">
                      <td className="py-2.5 px-3 font-mono text-stone-500">{j.tanggal}</td>
                      <td className="py-2.5 px-3 font-mono font-semibold text-blue-800">{j.noBukti}</td>
                      <td className="py-2.5 px-3 font-medium text-stone-900">{j.keterangan}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-stone-800">
                        {line.debit > 0 ? formatRupiah(line.debit) : '-'}
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-stone-800">
                        {line.kredit > 0 ? formatRupiah(line.kredit) : '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: INPUT KAS MASUK / KELUAR */}
      {isCashModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-stone-200 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="font-bold text-stone-900 text-base flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-emerald-600" /> Catat Kas Masuk / Keluar
              </h3>
              <button
                onClick={() => setIsCashModalOpen(false)}
                className="text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCash} className="space-y-3 text-xs">
              {/* Tipe Selector */}
              <div>
                <label className="font-bold text-stone-700 block mb-1">Jenis Mutasi *</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setCashForm({ ...cashForm, tipe: 'keluar' })}
                    className={`py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 transition ${
                      cashForm.tipe === 'keluar'
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                    }`}
                  >
                    <ArrowDownLeft className="w-4 h-4" />
                    <span>Pengeluaran Kas</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCashForm({ ...cashForm, tipe: 'masuk' })}
                    className={`py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 transition ${
                      cashForm.tipe === 'masuk'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                    }`}
                  >
                    <ArrowUpRight className="w-4 h-4" />
                    <span>Pemasukan Kas</span>
                  </button>
                </div>
              </div>

              {/* Rekening Kas */}
              <div>
                <label className="font-bold text-stone-700 block mb-1">Pilih Rekening Kas/Bank *</label>
                <select
                  value={cashForm.akunKas}
                  onChange={e => setCashForm({ ...cashForm, akunKas: e.target.value as any })}
                  className="w-full px-3 py-2 bg-stone-50 rounded-xl border border-stone-200 font-semibold text-stone-800 outline-hidden"
                >
                  <option value="Kas Operasional">💵 Kas Operasional (Kasir / Lantai Potong)</option>
                  <option value="Bank BCA Utama">🏦 Bank BCA Utama (Giro Farm)</option>
                  <option value="Bank Mandiri">🏛️ Bank Mandiri (Operasional)</option>
                </select>
              </div>

              {/* Kategori */}
              <div>
                <label className="font-bold text-stone-700 block mb-1">Kategori Transaksi *</label>
                <select
                  value={cashForm.kategori}
                  onChange={e => setCashForm({ ...cashForm, kategori: e.target.value as any })}
                  className="w-full px-3 py-2 bg-stone-50 rounded-xl border border-stone-200 font-semibold text-stone-800 outline-hidden"
                >
                  {cashForm.tipe === 'keluar' ? (
                    <>
                      <option value="es_batu">🧊 Beban Es Balok Pendingin (Akun 6103)</option>
                      <option value="transport">⛽ Beban Bensin & Armada Kirim (Akun 6104)</option>
                      <option value="operasional">⚙️ Beban Listrik, Air & Sanitasi (Akun 6105)</option>
                      <option value="gaji">👥 Beban Upah Harian & Insentif (Akun 6102)</option>
                      <option value="pembelian_ayam">🐔 Pembelian Ayam ke Peternak</option>
                      <option value="lainnya">📦 Operasional / Kemasan Lainnya (Akun 6199)</option>
                    </>
                  ) : (
                    <>
                      <option value="penjualan">🍗 Penerimaan Penjualan Tunai</option>
                      <option value="lainnya">💰 Setoran Modal / Penerimaan Lain</option>
                    </>
                  )}
                </select>
              </div>

              {/* Nominal */}
              <div>
                <label className="font-bold text-stone-700 block mb-1">Nominal (Rp) *</label>
                <input
                  type="number"
                  required
                  min="1000"
                  value={cashForm.jumlah || ''}
                  onChange={e => setCashForm({ ...cashForm, jumlah: Number(e.target.value) })}
                  placeholder="Masukkan nominal uang..."
                  className="w-full px-3 py-2 bg-white rounded-xl border border-stone-300 font-black text-sm text-stone-900 focus:ring-2 focus:ring-emerald-500 outline-hidden"
                />
              </div>

              {/* Keterangan */}
              <div>
                <label className="font-bold text-stone-700 block mb-1">Keterangan / Uraian *</label>
                <textarea
                  rows={2}
                  required
                  value={cashForm.keterangan}
                  onChange={e => setCashForm({ ...cashForm, keterangan: e.target.value })}
                  placeholder="Misal: Pembelian 15 balok es batu untuk perendaman karkas batch 2..."
                  className="w-full px-3 py-2 bg-stone-50 rounded-xl border border-stone-200 outline-hidden"
                />
              </div>

              <div className="p-3 bg-stone-50 rounded-xl text-[11px] text-stone-600 space-y-1">
                <p className="font-bold text-stone-900">Efek Otomatis Sistem:</p>
                <p>&bull; Saldo rekening kas/bank ter-update seketika.</p>
                <p>&bull; Jurnal Umum double-entry langsung dibukukan.</p>
                <p>&bull; Sheet 08_KAS & 13_BUKU_BESAR di Google Sheets tersinkron.</p>
              </div>

              <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCashModalOpen(false)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || cashForm.jumlah <= 0}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Transaksi Kas'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
