import React from 'react';
import { UserRole, SyncSettings, AppPage } from '../types';
import { 
  Building2, 
  ShieldCheck, 
  Table, 
  Settings, 
  UserCheck, 
  Briefcase, 
  Calculator, 
  TrendingUp, 
  Users, 
  HardHat,
  ShoppingCart,
  Wallet,
  LayoutDashboard,
  Cloud,
  Lock,
  GitBranch,
  KeyRound,
  MessageSquare
} from 'lucide-react';

interface Props {
  currentPage: AppPage;
  onSelectPage: (page: AppPage) => void;
  currentRole: UserRole;
  onSelectRole: (role: UserRole) => void;
  syncSettings: SyncSettings;
  onOpenSyncModal: () => void;
  onRequestRoleAccess: (role: UserRole | 'customer' | 'buku_kas' | 'cloudflare_github', page?: AppPage) => void;
  onOpenWhatsAppModal: () => void;
}

export const HeaderNav: React.FC<Props> = ({
  currentPage,
  onSelectPage,
  currentRole,
  onSelectRole,
  syncSettings,
  onOpenSyncModal,
  onRequestRoleAccess,
  onOpenWhatsAppModal
}) => {
  const roles: Array<{ id: UserRole; label: string; icon: React.ReactNode; requiresPin: boolean }> = [
    { id: 'owner', label: 'Owner (Rekap Eksekutif)', icon: <Building2 className="w-3.5 h-3.5" />, requiresPin: true },
    { id: 'akuntan', label: 'Akuntan (Audit & Jurnal)', icon: <Calculator className="w-3.5 h-3.5" />, requiresPin: true },
    { id: 'admin', label: 'Admin Operasional', icon: <Briefcase className="w-3.5 h-3.5" />, requiresPin: true },
    { id: 'sales', label: 'Sales & Order', icon: <TrendingUp className="w-3.5 h-3.5" />, requiresPin: false },
    { id: 'karyawan', label: 'Karyawan (Lantai Potong)', icon: <HardHat className="w-3.5 h-3.5" />, requiresPin: false },
    { id: 'hr', label: 'HR & Karyawan', icon: <Users className="w-3.5 h-3.5" />, requiresPin: false }
  ];

  const handleRoleClick = (roleId: UserRole) => {
    // If switching to sensitive role (owner, akuntan, admin) from a different role, trigger PIN modal
    if ((roleId === 'owner' || roleId === 'akuntan' || roleId === 'admin') && currentRole !== roleId && currentRole !== 'owner') {
      onRequestRoleAccess(roleId, 'dashboard');
    } else {
      onSelectPage('dashboard');
      onSelectRole(roleId);
    }
  };

  const handlePageClick = (page: AppPage) => {
    // Restrict Buku Kas / Audit if accessed by non-authorized role
    if (page === 'buku_kas' && currentRole !== 'akuntan' && currentRole !== 'owner') {
      onRequestRoleAccess('buku_kas', 'buku_kas');
      return;
    }
    if (page === 'cloudflare_github' && currentRole !== 'owner') {
      onRequestRoleAccess('cloudflare_github', 'cloudflare_github');
      return;
    }
    onSelectPage(page);
  };

  // Get current portal display badge
  const getRoleBadge = () => {
    if (currentPage === 'kasir') {
      return {
        label: 'POS Kasir Toko (Terisolasi)',
        color: 'bg-amber-100 text-amber-900 border-amber-300'
      };
    }
    switch (currentRole) {
      case 'owner':
        return { label: 'Portal Owner & Rekapitulasi', color: 'bg-stone-900 text-white border-stone-800' };
      case 'akuntan':
        return { label: 'Portal Akuntan (Audit Jurnal)', color: 'bg-emerald-100 text-emerald-900 border-emerald-300' };
      case 'admin':
        return { label: 'Portal Admin Operasional', color: 'bg-blue-100 text-blue-900 border-blue-300' };
      case 'karyawan':
        return { label: 'Portal Karyawan Lantai Potong', color: 'bg-orange-100 text-orange-900 border-orange-300' };
      default:
        return { label: `Portal ${currentRole.toUpperCase()}`, color: 'bg-stone-100 text-stone-800 border-stone-300' };
    }
  };

  const currentBadge = getRoleBadge();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Top Branding & Status Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3 border-b border-stone-100 gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center font-black text-xl shadow-xs shrink-0">
              🍗
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-black text-stone-900 tracking-tight text-base sm:text-lg">
                  GEMA ABADI FARM
                </h1>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${currentBadge.color}`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1 animate-pulse"></span>
                  {currentBadge.label}
                </span>
              </div>
              <p className="text-xs text-stone-500">
                Sistem Ayam Potong &bull; Pemisahan Halaman Cloudflare & Cadangan GitHub &bull; Triggers Real-Time
              </p>
            </div>
          </div>

          {/* Cloudflare, GitHub, Sheets & Security Quick Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => handlePageClick('cloudflare_github')}
              title="Pusat Cloudflare Pages & GitHub Data"
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                currentPage === 'cloudflare_github'
                  ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                  : 'bg-amber-50 text-amber-900 border-amber-200 hover:bg-amber-100'
              }`}
            >
              <Cloud className="w-3.5 h-3.5 text-amber-600" />
              <span>Cloudflare & Git</span>
            </button>

            <button
              onClick={onOpenWhatsAppModal}
              title="Notifikasi WA Otomatis & Kirim Pesan Grup"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Notif WA</span>
            </button>

            <button
              id="btn-sheets-badge"
              onClick={onOpenSyncModal}
              title="Status Sinkronisasi 15-Sheet Google Sheets"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition cursor-pointer"
            >
              <Table className="w-3.5 h-3.5 text-emerald-600" />
              <span>Sheets Sync</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            </button>

            <button
              id="btn-crypto-badge"
              onClick={onOpenSyncModal}
              title="Kriptografi AES-256-GCM End-to-End Encryption"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-indigo-50 text-indigo-800 border border-indigo-200 hover:bg-indigo-100 transition cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
              <span>E2EE</span>
            </button>

            <button
              id="btn-open-settings"
              onClick={onOpenSyncModal}
              className="p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-xl border border-stone-200 transition cursor-pointer"
              title="Buka Pengaturan & Sinkronisasi"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Primary Page Navigation (Pemisahan Page POS, Owner, Akuntan, Data CRM) */}
        <div className="flex flex-col md:flex-row md:items-center justify-between py-2 gap-2 border-b border-stone-100">
          
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            
            {/* Page POS (Kasir) */}
            <button
              onClick={() => onSelectPage('kasir')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                currentPage === 'kasir'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-stone-700 hover:bg-amber-50 hover:text-amber-800'
              }`}
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>Page POS (Kasir)</span>
              <span className={`px-1.5 py-0.2 rounded-md text-[9px] font-black ${
                currentPage === 'kasir' ? 'bg-amber-800 text-white' : 'bg-amber-100 text-amber-800'
              }`}>
                Input POS
              </span>
            </button>

            {/* Page Dashboard Divisi */}
            <button
              onClick={() => onSelectPage('dashboard')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                currentPage === 'dashboard'
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Page Dashboard</span>
            </button>

            {/* Page Data Master & CRM */}
            <button
              onClick={() => handlePageClick('customer')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                currentPage === 'customer'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-stone-700 hover:bg-blue-50 hover:text-blue-800'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Page Data Customer</span>
              <span className={`px-1.5 py-0.2 rounded-md text-[9px] font-black ${
                currentPage === 'customer' ? 'bg-blue-800 text-white' : 'bg-blue-100 text-blue-800'
              }`}>
                CRM
              </span>
            </button>

            {/* Page Buku Kas & Bank (Hanya Akuntan/Owner) */}
            <button
              onClick={() => handlePageClick('buku_kas')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                currentPage === 'buku_kas'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-stone-700 hover:bg-emerald-50 hover:text-emerald-800'
              }`}
            >
              <Wallet className="w-3.5 h-3.5" />
              <span>Buku Kas & Audit</span>
              <span className={`px-1.5 py-0.2 rounded-md text-[9px] font-black ${
                currentPage === 'buku_kas' ? 'bg-emerald-800 text-white' : 'bg-emerald-100 text-emerald-800'
              }`}>
                Akuntan
              </span>
            </button>

            {/* Page Cloudflare & GitHub */}
            <button
              onClick={() => handlePageClick('cloudflare_github')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                currentPage === 'cloudflare_github'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-stone-700 hover:bg-indigo-50 hover:text-indigo-800'
              }`}
            >
              <Cloud className="w-3.5 h-3.5" />
              <span>Page Cloudflare & Git</span>
            </button>

          </div>

          {/* Role Hierarchy Switcher with PIN Guard */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
            <span className="text-[11px] font-semibold text-stone-400 mr-1 shrink-0 flex items-center gap-1">
              <KeyRound className="w-3 h-3 text-stone-500" /> Otorisasi:
            </span>
            {roles.map((r) => {
              const isRoleActive = currentPage === 'dashboard' && currentRole === r.id;
              return (
                <button
                  key={r.id}
                  id={`btn-role-${r.id}`}
                  onClick={() => handleRoleClick(r.id)}
                  title={r.requiresPin ? `Membutuhkan PIN Otorisasi ${r.label}` : `Buka ${r.label}`}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs whitespace-nowrap transition cursor-pointer ${
                    isRoleActive
                      ? 'bg-stone-900 text-white font-bold shadow-xs ring-1 ring-stone-900'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100 font-medium'
                  }`}
                >
                  {r.icon}
                  <span>{r.label.split(' ')[0]}</span>
                  {r.requiresPin && currentRole !== r.id && (
                    <Lock className="w-2.5 h-2.5 text-stone-400 ml-0.5" />
                  )}
                </button>
              );
            })}
          </div>

        </div>

      </div>
    </header>
  );
};
