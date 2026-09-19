import React, { useState } from 'react';
import { SyncSettings } from '../types';
import { api } from '../services/api';
import { 
  X, 
  Cloud, 
  Table, 
  ShieldCheck, 
  RefreshCw, 
  CheckCircle2, 
  ExternalLink, 
  Download, 
  Smartphone,
  Key
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  settings: SyncSettings;
  onUpdate: () => void;
}

export const SyncSettingsModal: React.FC<Props> = ({ isOpen, onClose, settings, onUpdate }) => {
  const [activeTab, setActiveTab] = useState<'sheets' | 'cloudflare' | 'crypto'>('sheets');
  const [spreadsheetId, setSpreadsheetId] = useState(settings.googleSheets.spreadsheetId);
  const [workerUrl, setWorkerUrl] = useState(settings.cloudflare.workerUrl);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<string | null>(null);
  const [exportJson, setExportJson] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSyncSheets = async () => {
    setIsSyncing(true);
    setSyncResult(null);
    try {
      const res = await api.pushGoogleSheets();
      setSyncResult(`Berhasil sinkronisasi 15 sheet: ${res.totalSheets} tab diperbarui pada ${new Date(res.syncedAt).toLocaleTimeString('id-ID')}`);
      onUpdate();
    } catch (err: any) {
      setSyncResult(`Error: ${err.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSyncCloudflare = async () => {
    setIsSyncing(true);
    setSyncResult(null);
    try {
      const res = await api.syncCloudflare({ target: 'cloudflare-worker' });
      setSyncResult(`Berhasil sinkronisasi ke Cloudflare Edge: node ${res.edgeNode} status ${res.status}`);
      onUpdate();
    } catch (err: any) {
      setSyncResult(`Error: ${err.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleExportSheets = async () => {
    try {
      const data = await api.exportGoogleSheets();
      setExportJson(JSON.stringify(data, null, 2));
    } catch (err: any) {
      alert(`Gagal mengekspor data: ${err.message}`);
    }
  };

  return (
    <div id="sync-settings-modal-backdrop" className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div id="sync-settings-modal-card" className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full border border-stone-200 overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-stone-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <RefreshCw className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-stone-900">Pusat Sinkronisasi & Enkripsi Sistem</h2>
              <p className="text-xs text-stone-600">Google Sheets API, Cloudflare Workers/Pages, dan Enkripsi E2E</p>
            </div>
          </div>
          <button 
            id="btn-close-sync-modal"
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-stone-200 px-6 bg-white gap-4 text-sm font-medium">
          <button
            id="tab-sheets-sync"
            onClick={() => setActiveTab('sheets')}
            className={`py-3 flex items-center gap-2 border-b-2 transition ${
              activeTab === 'sheets'
                ? 'border-emerald-600 text-emerald-800 font-semibold'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <Table className="w-4 h-4 text-emerald-600" />
            Google Sheets API
          </button>
          <button
            id="tab-cloudflare-sync"
            onClick={() => setActiveTab('cloudflare')}
            className={`py-3 flex items-center gap-2 border-b-2 transition ${
              activeTab === 'cloudflare'
                ? 'border-emerald-600 text-emerald-800 font-semibold'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <Cloud className="w-4 h-4 text-amber-500" />
            Cloudflare Workers & Pages
          </button>
          <button
            id="tab-crypto-sync"
            onClick={() => setActiveTab('crypto')}
            className={`py-3 flex items-center gap-2 border-b-2 transition ${
              activeTab === 'crypto'
                ? 'border-emerald-600 text-emerald-800 font-semibold'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            Enkripsi End-to-End (E2EE)
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 space-y-5">
          {activeTab === 'sheets' && (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                <div className="text-xs text-emerald-900">
                  <strong className="block text-sm font-semibold text-emerald-950 mb-1">
                    15 Sheet Otomatis Terhubung
                  </strong>
                  Sistem mengekspor dan menyelaraskan otomatis 15 tab pembukuan: 
                  <span className="font-mono text-[11px] block mt-1 text-emerald-800">
                    01_CONTROL_PANEL, 02_MASTER_CUSTOMER, 03_MASTER_PRODUK, 04_PEMBELIAN, 05_PEMOTONGAN, 06_STOK, 07_PENJUALAN, 08_KAS, 09_PIUTANG, 10_BIAYA, 11_PEGAWAI, 12_JURNAL, 13_BUKU_BESAR, 14_LAPORAN, 15_DASHBOARD.
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Google Spreadsheet ID / Target URL
                </label>
                <div className="flex gap-2">
                  <input
                    id="input-spreadsheet-id"
                    type="text"
                    value={spreadsheetId}
                    onChange={(e) => setSpreadsheetId(e.target.value)}
                    placeholder="Contoh: 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
                    className="flex-1 px-3 py-2 text-sm border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                  <button
                    id="btn-save-spreadsheet-id"
                    onClick={() => {
                      api.updateSyncSettings({ googleSheets: { ...settings.googleSheets, spreadsheetId } });
                      alert('Pengaturan Spreadsheet disimpan');
                    }}
                    className="px-4 py-2 text-sm font-medium bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl border border-stone-300 transition"
                  >
                    Simpan
                  </button>
                </div>
                <p className="text-[11px] text-stone-500 mt-1">
                  ID diambil dari URL spreadsheet: <span className="font-mono">https://docs.google.com/spreadsheets/d/<b>ID_INI</b>/edit</span>
                </p>
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  id="btn-trigger-sheets-sync"
                  onClick={handleSyncSheets}
                  disabled={isSyncing}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm flex items-center gap-2 shadow-xs transition disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                  {isSyncing ? 'Sedang Sinkronisasi...' : 'Sinkronkan ke Google Sheets Sekarang'}
                </button>
                <button
                  id="btn-export-sheets-json"
                  onClick={handleExportSheets}
                  className="px-4 py-2.5 rounded-xl border border-stone-300 hover:bg-stone-100 text-stone-800 font-medium text-sm flex items-center gap-2 transition"
                >
                  <Download className="w-4 h-4 text-stone-600" />
                  Pratinjau JSON 15 Sheet
                </button>
              </div>

              {syncResult && (
                <div className="p-3 bg-stone-100 rounded-xl border border-stone-200 text-xs font-mono text-stone-800">
                  {syncResult}
                </div>
              )}

              {exportJson && (
                <div className="mt-3">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-semibold text-stone-600">Payload Struktur Google Sheets API:</span>
                    <button onClick={() => setExportJson(null)} className="text-xs text-red-600 hover:underline">Tutup</button>
                  </div>
                  <pre className="max-h-48 overflow-y-auto p-3 bg-stone-900 text-emerald-400 text-xs rounded-xl font-mono">
                    {exportJson}
                  </pre>
                </div>
              )}
            </div>
          )}

          {activeTab === 'cloudflare' && (
            <div className="space-y-4">
              <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-950">
                <strong className="block text-sm font-semibold mb-1 text-amber-950">
                  Cloudflare Workers & Pages Synchronizer
                </strong>
                Sinkronisasi edge relay ke dasbor Cloudflare Anda:
                <a 
                  href="https://dash.cloudflare.com/e095af08ef8155e2d4645668e1249847/workers-and-pages" 
                  target="_blank" 
                  rel="noreferrer"
                  className="text-amber-800 font-semibold underline flex items-center gap-1 mt-1"
                >
                  dash.cloudflare.com/.../workers-and-pages <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Target Worker Endpoint URL
                </label>
                <input
                  id="input-worker-url"
                  type="text"
                  value={workerUrl}
                  onChange={(e) => setWorkerUrl(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                />
              </div>

              <button
                id="btn-sync-cloudflare"
                onClick={handleSyncCloudflare}
                disabled={isSyncing}
                className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-medium text-sm flex items-center gap-2 shadow-xs transition disabled:opacity-50"
              >
                <Cloud className="w-4 h-4" />
                {isSyncing ? 'Mengirim ke Edge...' : 'Kirim Paket Sinkronisasi ke Cloudflare'}
              </button>
            </div>
          )}

          {activeTab === 'crypto' && (
            <div className="space-y-4">
              <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-200 text-xs text-indigo-950">
                <strong className="block text-sm font-semibold mb-1 text-indigo-950 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-indigo-700" />
                  Enkripsi End-to-End (AES-256-GCM) Aktif
                </strong>
                Semua data keuangan, nominal transaksi, data customer, dan payroll dienkripsi secara kriptografis sebelum dikirim antar perangkat (HP Owner, Laptop Admin, Tablet Pemotongan).
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl">
                  <span className="text-stone-500 block mb-1">Algoritma Kriptografi:</span>
                  <span className="font-mono font-bold text-stone-900">AES-256-GCM + PBKDF2</span>
                </div>
                <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl">
                  <span className="text-stone-500 block mb-1">Fingerprint Kunci Master:</span>
                  <span className="font-mono text-[11px] text-stone-800 break-all">
                    {settings.encryption.masterKeyFingerprint}
                  </span>
                </div>
              </div>

              <div className="p-4 border border-dashed border-stone-300 rounded-xl bg-stone-50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-stone-900">Hubungkan Perangkat Baru</h4>
                    <p className="text-xs text-stone-500">Pasangkan tablet pemotongan atau HP sales tanpa ubah hierarki data</p>
                  </div>
                </div>
                <button 
                  onClick={() => alert(`Kode Pairing Perangkat: AYAM-SYNC-${Math.floor(100000 + Math.random() * 900000)}`)}
                  className="px-3.5 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs transition"
                >
                  Generate Kode Pairing
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-stone-50 border-t border-stone-200 flex justify-end">
          <button
            id="btn-close-sync-modal-bottom"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-stone-800 hover:bg-stone-900 text-white text-sm font-medium transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
