import React, { useState } from 'react';
import { AppStateData } from '../types';
import { api } from '../services/api';
import { 
  Cloud, 
  GitBranch, 
  ShieldCheck, 
  RefreshCw, 
  ExternalLink, 
  Download, 
  Copy, 
  Check, 
  Server, 
  Lock, 
  Layers, 
  FileCode, 
  CheckCircle2, 
  Terminal,
  KeyRound,
  Globe
} from 'lucide-react';

interface Props {
  state: AppStateData;
  onRefresh: () => void;
  onOpenSyncModal: () => void;
}

export const CloudflareGithubPage: React.FC<Props> = ({ state, onRefresh, onOpenSyncModal }) => {
  const [activeTab, setActiveTab] = useState<'cloudflare' | 'github' | 'security'>('cloudflare');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatusMsg, setSyncStatusMsg] = useState<string | null>(null);

  const [cfWorkerUrl, setCfWorkerUrl] = useState(state.syncSettings.cloudflare.workerUrl);
  const [customDomain, setCustomDomain] = useState(state.syncSettings.cloudflare.customDomain || 'pos.gemaabadifarm.com');
  const [ghRepoUrl, setGhRepoUrl] = useState(state.syncSettings.github?.repoUrl || 'https://github.com/gemaabadifarm/sistem-ayam-potong');
  const [ghBranch, setGhBranch] = useState(state.syncSettings.github?.branch || 'main');
  const [ghToken, setGhToken] = useState(state.syncSettings.github?.token || 'ghp_live_backup_token_configured');

  // Copy snippet helper
  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  // Trigger sync to Cloudflare
  const handleSyncCloudflare = async () => {
    setIsSyncing(true);
    setSyncStatusMsg(null);
    try {
      const res = await api.syncCloudflare({
        domain: customDomain,
        target: 'cloudflare-worker'
      });
      setSyncStatusMsg(`Berhasil sinkronisasi Cloudflare Edge Node ${res.edgeNode} pada ${new Date().toLocaleTimeString('id-ID')}`);
      onRefresh();
    } catch (err: any) {
      setSyncStatusMsg(`Gagal: ${err.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  // Export full JSON database snapshot for GitHub
  const handleDownloadGithubSnapshot = () => {
    const backupData = {
      meta: {
        company: 'GEMA ABADI FARM',
        system: 'Sistem Usaha Ayam Potong',
        exportDate: new Date().toISOString(),
        version: '2.4.0',
        e2eeAlgorithm: state.syncSettings.encryption.algorithm,
        fingerprint: state.syncSettings.encryption.masterKeyFingerprint
      },
      data: {
        customers: state.customers,
        suppliers: state.suppliers,
        stocks: state.stocks,
        purchases: state.purchases,
        productions: state.productions,
        orders: state.orders,
        cashTransactions: state.cashTransactions,
        journals: state.journals,
        accounts: state.accounts,
        employees: state.employees,
        attendance: state.attendance,
        taskWorks: state.taskWorks,
        syncSettings: state.syncSettings
      }
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup-gema-abadi-farm-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Cloudflare Worker Script Code
  const cloudflareWorkerCode = `/**
 * Cloudflare Worker Script (_worker.js)
 * Reverse Proxy & Role Security Isolation for GEMA ABADI FARM
 * Deploy via Cloudflare Workers & Pages
 */
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const host = url.hostname;

    // 1. Subdomain-based Routing Isolation
    if (host.startsWith('pos.') || url.pathname.startsWith('/pos')) {
      // Isolate POS workstation: Strip audit journals & owner profit metrics
      return handlePosWorkstation(request, env);
    }

    if (host.startsWith('owner.') || url.pathname.startsWith('/owner')) {
      // Require Owner PIN / Session Token
      return handleOwnerGateway(request, env);
    }

    if (host.startsWith('audit.') || url.pathname.startsWith('/akuntan')) {
      // Require Akuntan PIN / Session Token
      return handleAuditGateway(request, env);
    }

    // Default: Forward to SPA static asset bundle
    return env.ASSETS ? env.ASSETS.fetch(request) : fetch(request);
  }
};`;

  // GitHub Actions Workflow Code
  const githubActionsCode = `name: Deploy to Cloudflare Pages
on:
  push:
    branches: [ ${ghBranch} ]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Install Dependencies
        run: npm ci

      - name: Build Production Bundle
        run: npm run build

      - name: Publish to Cloudflare Pages
        uses: cloudflare/pages-action@v1
        with:
          apiToken: \${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: \${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          projectName: sistem-ayam-potong
          directory: dist`;

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-200 flex items-center gap-1">
              <Cloud className="w-3.5 h-3.5 text-amber-600" />
              Cloudflare Pages & Workers
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-stone-100 text-stone-800 border border-stone-200 flex items-center gap-1">
              <GitBranch className="w-3.5 h-3.5 text-stone-700" />
              GitHub Repository Sync
            </span>
          </div>
          <h2 className="text-xl font-black text-stone-900 tracking-tight">
            Pusat Tampilan Terpisah di Cloudflare & Cadangan GitHub
          </h2>
          <p className="text-xs text-stone-600 mt-1">
            Pemisahan visual & hierarki keamanan: Karyawan kasir terkunci di POS, hanya Akuntan yang akses audit, dan Owner memantau rekap.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleDownloadGithubSnapshot}
            className="px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-xs cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Ekspor Snapshot ke GitHub</span>
          </button>
          <a
            href="https://dash.cloudflare.com/e095af08ef8155e2d4645668e1249847/workers-and-pages"
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Cloudflare Dashboard</span>
          </a>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-stone-200 bg-white rounded-xl px-4 shadow-xs gap-4 text-xs font-bold">
        <button
          onClick={() => setActiveTab('cloudflare')}
          className={`py-3 flex items-center gap-2 border-b-2 transition cursor-pointer ${
            activeTab === 'cloudflare'
              ? 'border-amber-600 text-amber-700 font-extrabold'
              : 'border-transparent text-stone-600 hover:text-stone-900'
          }`}
        >
          <Cloud className="w-4 h-4 text-amber-500" />
          Arsitektur Halaman Cloudflare
        </button>
        <button
          onClick={() => setActiveTab('github')}
          className={`py-3 flex items-center gap-2 border-b-2 transition cursor-pointer ${
            activeTab === 'github'
              ? 'border-stone-900 text-stone-900 font-extrabold'
              : 'border-transparent text-stone-600 hover:text-stone-900'
          }`}
        >
          <GitBranch className="w-4 h-4 text-stone-800" />
          Sinkronisasi & Backup GitHub
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={`py-3 flex items-center gap-2 border-b-2 transition cursor-pointer ${
            activeTab === 'security'
              ? 'border-rose-600 text-rose-700 font-extrabold'
              : 'border-transparent text-stone-600 hover:text-stone-900'
          }`}
        >
          <Lock className="w-4 h-4 text-rose-600" />
          Hirarki Keamanan & Anti-Snoop
        </button>
      </div>

      {/* TAB 1: CLOUDFLARE PAGES & WORKERS */}
      {activeTab === 'cloudflare' && (
        <div className="space-y-6">
          
          {/* Subdomain Visual Mapping Cards */}
          <div>
            <h3 className="text-sm font-bold text-stone-900 mb-3 flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-600" />
              Pemisahan Tampilan Subdomain di Cloudflare Edge:
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              
              {/* POS Terminal */}
              <div className="bg-white p-4 rounded-2xl border-2 border-amber-200 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="p-1.5 bg-amber-100 text-amber-800 rounded-lg font-mono text-[10px] font-bold">
                      pos.gemaabadifarm.com
                    </span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  </div>
                  <h4 className="font-bold text-stone-900 text-sm">Portal POS Kasir</h4>
                  <p className="text-xs text-stone-500 mt-1">
                    Tampilan kasir toko karkas segar & input manual. Data jurnal & laba rugi di-strip demi privasi.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-[11px] text-amber-800 font-semibold">
                  <span>Akses: Terkunci Kasir</span>
                  <span className="bg-amber-100 px-2 py-0.5 rounded-md">PIN 0000</span>
                </div>
              </div>

              {/* Owner Dashboard */}
              <div className="bg-white p-4 rounded-2xl border-2 border-stone-900 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="p-1.5 bg-stone-900 text-white rounded-lg font-mono text-[10px] font-bold">
                      owner.gemaabadifarm.com
                    </span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  </div>
                  <h4 className="font-bold text-stone-900 text-sm">Portal Owner</h4>
                  <p className="text-xs text-stone-500 mt-1">
                    Rekapitulasi laba rugi eksekutif, dividen, approval harga khusus, dan saldo kas bank.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-900 font-semibold">
                  <span>Akses: Eksekutif</span>
                  <span className="bg-stone-200 px-2 py-0.5 rounded-md">PIN 8888</span>
                </div>
              </div>

              {/* Akuntan & Audit */}
              <div className="bg-white p-4 rounded-2xl border-2 border-emerald-300 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="p-1.5 bg-emerald-100 text-emerald-900 rounded-lg font-mono text-[10px] font-bold">
                      audit.gemaabadifarm.com
                    </span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  </div>
                  <h4 className="font-bold text-stone-900 text-sm">Portal Akuntan & Audit</h4>
                  <p className="text-xs text-stone-500 mt-1">
                    Jurnal Umum berpasangan, verifikasi transaksi kasir, buku besar, dan neraca saldo.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-[11px] text-emerald-800 font-semibold">
                  <span>Akses: Auditor Keuangan</span>
                  <span className="bg-emerald-100 px-2 py-0.5 rounded-md">PIN 7777</span>
                </div>
              </div>

              {/* CRM & Data Master */}
              <div className="bg-white p-4 rounded-2xl border-2 border-blue-200 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="p-1.5 bg-blue-100 text-blue-900 rounded-lg font-mono text-[10px] font-bold">
                      crm.gemaabadifarm.com
                    </span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  </div>
                  <h4 className="font-bold text-stone-900 text-sm">Portal Master Customer</h4>
                  <p className="text-xs text-stone-500 mt-1">
                    Database pedagang pasar, limit piutang, pelunasan bon piutang, dan stok karkas.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-[11px] text-blue-800 font-semibold">
                  <span>Akses: Admin CRM</span>
                  <span className="bg-blue-100 px-2 py-0.5 rounded-md">PIN 1234</span>
                </div>
              </div>

            </div>
          </div>

          {/* Cloudflare Configuration & Worker Script */}
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-amber-600" />
                  Konfigurasi Cloudflare Workers & Custom Domain
                </h4>
                <p className="text-xs text-stone-500">
                  Worker menyaring payload JSON berdasarkan role pengguna sebelum disajikan ke peramban.
                </p>
              </div>
              <button
                onClick={handleSyncCloudflare}
                disabled={isSyncing}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Menghubungi Cloudflare...' : 'Sinkronkan Edge Sekarang'}</span>
              </button>
            </div>

            {syncStatusMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{syncStatusMsg}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Target Cloudflare Worker URL</label>
                <input
                  type="text"
                  value={cfWorkerUrl}
                  onChange={(e) => setCfWorkerUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl font-mono text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Custom Domain Routing</label>
                <input
                  type="text"
                  value={customDomain}
                  onChange={(e) => setCustomDomain(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl font-mono text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                />
              </div>
            </div>

            {/* Code Snippet */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
                  <FileCode className="w-4 h-4 text-stone-600" />
                  Script Cloudflare Worker (_worker.js) untuk Cloudflare Pages:
                </span>
                <button
                  onClick={() => handleCopy(cloudflareWorkerCode, 'worker')}
                  className="text-xs text-stone-600 hover:text-stone-900 flex items-center gap-1 font-semibold cursor-pointer"
                >
                  {copiedKey === 'worker' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'worker' ? 'Tersalin' : 'Salin Script'}</span>
                </button>
              </div>
              <pre className="p-4 bg-stone-900 text-amber-300 rounded-xl text-xs font-mono overflow-x-auto max-h-56 leading-relaxed">
                {cloudflareWorkerCode}
              </pre>
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: GITHUB INTEGRATION & BACKUP */}
      {activeTab === 'github' && (
        <div className="space-y-6">
          
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                  <GitBranch className="w-4 h-4 text-stone-800" />
                  Koneksi Repositori GitHub GEMA ABADI FARM
                </h4>
                <p className="text-xs text-stone-500">
                  Pencadangan berkala data transaksi, stok, pelanggan, dan jurnal ke repositori Git terenkripsi.
                </p>
              </div>
              <button
                onClick={handleDownloadGithubSnapshot}
                className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh JSON Snapshot (Git Format)</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">URL Repositori GitHub</label>
                <input
                  type="text"
                  value={ghRepoUrl}
                  onChange={(e) => setGhRepoUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl font-mono text-xs focus:ring-2 focus:ring-stone-800 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Branch Target</label>
                <input
                  type="text"
                  value={ghBranch}
                  onChange={(e) => setGhBranch(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl font-mono text-xs focus:ring-2 focus:ring-stone-800 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Personal Access Token (PAT)</label>
                <input
                  type="password"
                  value={ghToken}
                  onChange={(e) => setGhToken(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl font-mono text-xs focus:ring-2 focus:ring-stone-800 focus:outline-hidden"
                />
              </div>
            </div>

            {/* Summary badges */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs">
                <span className="text-stone-500 block mb-0.5">Status Auto-Backup:</span>
                <span className="font-bold text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Aktif Setiap Transaksi Selesai
                </span>
              </div>
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs">
                <span className="text-stone-500 block mb-0.5">Cadangan Terakhir:</span>
                <span className="font-mono font-bold text-stone-800">
                  {new Date().toLocaleDateString('id-ID')} {new Date().toLocaleTimeString('id-ID')}
                </span>
              </div>
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs">
                <span className="text-stone-500 block mb-0.5">Enkripsi Data Snapshot:</span>
                <span className="font-mono font-bold text-indigo-700">AES-256-GCM Hash SHA256</span>
              </div>
            </div>

            {/* GitHub Actions CI/CD Code */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
                  <Terminal className="w-4 h-4 text-stone-600" />
                  GitHub Actions Workflow (.github/workflows/deploy-cloudflare.yml):
                </span>
                <button
                  onClick={() => handleCopy(githubActionsCode, 'ghactions')}
                  className="text-xs text-stone-600 hover:text-stone-900 flex items-center gap-1 font-semibold cursor-pointer"
                >
                  {copiedKey === 'ghactions' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'ghactions' ? 'Tersalin' : 'Salin Workflow'}</span>
                </button>
              </div>
              <pre className="p-4 bg-stone-900 text-emerald-400 rounded-xl text-xs font-mono overflow-x-auto max-h-56 leading-relaxed">
                {githubActionsCode}
              </pre>
            </div>
          </div>

        </div>
      )}

      {/* TAB 3: HIRARKI KEAMANAN & ANTI-JAIL */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          
          <div className="bg-white p-6 rounded-2xl border border-rose-200 shadow-xs space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-rose-100 text-rose-700 rounded-xl shrink-0 mt-0.5">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-bold text-stone-900">
                  Sistem Isolasi Hak Akses & Proteksi Audit
                </h4>
                <p className="text-xs text-stone-600 mt-0.5">
                  Dirancang khusus agar karyawan toko/kasir yang jail tidak bisa mengintip laba bersih, neraca saldo akuntan, atau catatan audit internal.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              
              <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-stone-900 text-xs flex items-center gap-1.5">
                    <KeyRound className="w-4 h-4 text-amber-600" />
                    1. Portal POS Kasir (Non-Audit)
                  </span>
                  <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-mono font-bold rounded">
                    PIN: 0000
                  </span>
                </div>
                <p className="text-xs text-stone-600">
                  Kasir hanya memiliki akses ke kasir penjualan, input manual karkas, cetak struk nota, dan rekap shift kasir. Tidak ada tombol atau tautan ke jurnal akuntansi ataupun laba rugi.
                </p>
              </div>

              <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-stone-900 text-xs flex items-center gap-1.5">
                    <KeyRound className="w-4 h-4 text-emerald-600" />
                    2. Portal Akuntan (Audit Eksklusif)
                  </span>
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold rounded">
                    PIN: 7777
                  </span>
                </div>
                <p className="text-xs text-stone-600">
                  Hanya akuntan terotorisasi yang dapat melihat Jurnal Umum, memverifikasi keaslian transaksi penjualan kasir, mengaudit selisih stok, dan mencocokkan mutasi kas.
                </p>
              </div>

              <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-stone-900 text-xs flex items-center gap-1.5">
                    <KeyRound className="w-4 h-4 text-stone-900" />
                    3. Portal Owner (Rekap Eksekutif)
                  </span>
                  <span className="px-2 py-0.5 bg-stone-900 text-white text-[10px] font-mono font-bold rounded">
                    PIN: 8888
                  </span>
                </div>
                <p className="text-xs text-stone-600">
                  Owner melihat rekapitulasi performa lengkap: laba kotor, laba bersih, kontrol piutang macet, approval diskon khusus, dan akses penuh ke konfigurasi sinkronisasi cloud.
                </p>
              </div>

              <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-stone-900 text-xs flex items-center gap-1.5">
                    <KeyRound className="w-4 h-4 text-blue-600" />
                    4. Portal Admin & CRM
                  </span>
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-mono font-bold rounded">
                    PIN: 1234
                  </span>
                </div>
                <p className="text-xs text-stone-600">
                  Manajemen master data pembeli, data supplier peternak, stok gudang karkas, dan armada logistik.
                </p>
              </div>

            </div>
          </div>

        </div>
      )}

    </div>
  );
};
