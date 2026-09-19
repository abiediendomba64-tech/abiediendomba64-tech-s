import React, { useState, useEffect } from 'react';
import { UserRole, AppStateData, AppPage } from './types';
import { api } from './services/api';
import { HeaderNav } from './components/HeaderNav';
import { OwnerDashboard } from './components/OwnerDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { AkuntanDashboard } from './components/AkuntanDashboard';
import { SalesDashboard } from './components/SalesDashboard';
import { KaryawanDashboard } from './components/KaryawanDashboard';
import { HRDashboard } from './components/HRDashboard';
import { KasirDashboard } from './components/KasirDashboard';
import { CustomerMasterPage } from './components/CustomerMasterPage';
import { BukuKasPage } from './components/BukuKasPage';
import { CloudflareGithubPage } from './components/CloudflareGithubPage';
import { SyncSettingsModal } from './components/SyncSettingsModal';
import { RoleSecurityModal } from './components/RoleSecurityModal';
import { WhatsAppModal } from './components/WhatsAppModal';
import { RefreshCw, ShieldAlert } from 'lucide-react';

export default function App() {
  const [currentPage, setCurrentPage] = useState<AppPage>('dashboard');
  const [currentRole, setCurrentRole] = useState<UserRole>('owner');
  const [state, setState] = useState<AppStateData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);

  // Security Hierarchy Modal State
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);
  const [securityTargetRole, setSecurityTargetRole] = useState<UserRole | 'customer' | 'buku_kas' | 'cloudflare_github'>('owner');
  const [securityTargetPage, setSecurityTargetPage] = useState<AppPage | undefined>(undefined);

  const fetchState = async () => {
    try {
      const data = await api.getState();
      setState(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Gagal memuat status sistem');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchState();
    // Poll every 10 seconds to maintain multi-user real-time state
    const interval = setInterval(fetchState, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleRequestRoleAccess = (target: UserRole | 'customer' | 'buku_kas' | 'cloudflare_github', page?: AppPage) => {
    setSecurityTargetRole(target);
    setSecurityTargetPage(page);
    setIsSecurityModalOpen(true);
  };

  const handleSecuritySuccess = (verifiedRole: UserRole, targetPage?: AppPage) => {
    setCurrentRole(verifiedRole);
    if (targetPage) {
      setCurrentPage(targetPage);
    }
  };

  const handleUpdateRolePin = async (roleKey: string, newPin: string) => {
    if (!state) return;
    try {
      const updatedPins = {
        ...(state.syncSettings.rolePins || {
          owner: '8888',
          akuntan: '7777',
          admin: '1234',
          kasir: '0000'
        }),
        [roleKey]: newPin
      };

      await api.updateSyncSettings({
        rolePins: updatedPins
      });
      fetchState();
    } catch (err: any) {
      alert('Gagal memperbarui PIN: ' + err.message);
    }
  };

  if (isLoading && !state) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex items-center gap-3 text-stone-700">
          <RefreshCw className="w-5 h-5 text-emerald-600 animate-spin" />
          <span className="text-sm font-semibold">Memuat Sistem Usaha Ayam Potong...</span>
        </div>
      </div>
    );
  }

  if (error && !state) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
        <div className="bg-white p-6 rounded-2xl border border-rose-200 shadow-sm max-w-md w-full text-center space-y-3">
          <ShieldAlert className="w-10 h-10 text-rose-600 mx-auto" />
          <h2 className="text-base font-bold text-stone-900">Koneksi Database Terputus</h2>
          <p className="text-xs text-stone-600">{error}</p>
          <button
            onClick={() => {
              setIsLoading(true);
              fetchState();
            }}
            className="px-4 py-2 bg-stone-900 text-white rounded-xl text-xs font-semibold cursor-pointer"
          >
            Coba Hubungkan Ulang
          </button>
        </div>
      </div>
    );
  }

  if (!state) return null;

  return (
    <div className="min-h-screen bg-stone-100 text-stone-900 flex flex-col font-sans">
      {/* Header and Page / Role Navigation */}
      <HeaderNav
        currentPage={currentPage}
        onSelectPage={setCurrentPage}
        currentRole={currentRole}
        onSelectRole={setCurrentRole}
        syncSettings={state.syncSettings}
        onOpenSyncModal={() => setIsSyncModalOpen(true)}
        onRequestRoleAccess={handleRequestRoleAccess}
        onOpenWhatsAppModal={() => setIsWhatsAppModalOpen(true)}
      />

      {/* Main View */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        
        {/* PAGE 1: POS KASIR TOKO (DENGAN INPUT MANUAL & KATALOG CEPAT) */}
        {currentPage === 'kasir' && (
          <KasirDashboard 
            state={state} 
            onRefresh={fetchState}
            onOpenSecurityModal={handleRequestRoleAccess}
          />
        )}

        {/* PAGE 2: DATA CUSTOMER MASTER & CRM */}
        {currentPage === 'customer' && (
          <CustomerMasterPage 
            state={state} 
            onRefresh={fetchState} 
          />
        )}

        {/* PAGE 3: BUKU KAS & AUDIT AKUNTAN */}
        {currentPage === 'buku_kas' && (
          <BukuKasPage 
            state={state} 
            onRefresh={fetchState} 
            onOpenSyncModal={() => setIsSyncModalOpen(true)} 
          />
        )}

        {/* PAGE 4: CLOUDFLARE PAGES/WORKERS & GITHUB BACKUP */}
        {currentPage === 'cloudflare_github' && (
          <CloudflareGithubPage 
            state={state} 
            onRefresh={fetchState} 
            onOpenSyncModal={() => setIsSyncModalOpen(true)} 
          />
        )}

        {/* PAGE 5: DASHBOARD PER DIVISI */}
        {currentPage === 'dashboard' && (
          <>
            {currentRole === 'owner' && (
              <OwnerDashboard 
                state={state} 
                onRefresh={fetchState} 
                onOpenSync={() => setIsSyncModalOpen(true)} 
              />
            )}
            {currentRole === 'admin' && (
              <AdminDashboard 
                state={state} 
                onRefresh={fetchState} 
              />
            )}
            {currentRole === 'akuntan' && (
              <AkuntanDashboard 
                state={state} 
                onRefresh={fetchState} 
              />
            )}
            {currentRole === 'sales' && (
              <SalesDashboard 
                state={state} 
                onRefresh={fetchState} 
              />
            )}
            {currentRole === 'karyawan' && (
              <KaryawanDashboard 
                state={state} 
                onRefresh={fetchState} 
              />
            )}
            {currentRole === 'hr' && (
              <HRDashboard 
                state={state} 
                onRefresh={fetchState} 
              />
            )}
          </>
        )}
      </main>

      {/* Sync, Google Sheets & Cloudflare Modal */}
      <SyncSettingsModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        settings={state.syncSettings}
        onUpdate={fetchState}
      />

      {/* Role Security & PIN Hierarchy Protection Modal */}
      <RoleSecurityModal
        isOpen={isSecurityModalOpen}
        onClose={() => setIsSecurityModalOpen(false)}
        targetRole={securityTargetRole}
        targetPage={securityTargetPage}
        onSuccess={handleSecuritySuccess}
        configuredPins={state.syncSettings.rolePins}
        onUpdatePin={handleUpdateRolePin}
      />

      {/* WhatsApp Notifikasi & Grup Modal */}
      <WhatsAppModal
        isOpen={isWhatsAppModalOpen}
        onClose={() => setIsWhatsAppModalOpen(false)}
        state={state}
        onUpdate={fetchState}
      />

      {/* Footer System Status */}
      <footer className="bg-white border-t border-stone-200 py-3 text-xs text-stone-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>GEMA ABADI FARM &bull; Sistem Terpisah Cloudflare & Data GitHub &bull; Triggers Real-Time Aktif</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] font-mono">
            <span>POS Manual: Siap</span>
            <span>Cloudflare Edge: Terhubung</span>
            <span>GitHub Sync: Siap</span>
            <span>Audit: Terisolasi (PIN)</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
