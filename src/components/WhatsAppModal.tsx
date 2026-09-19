import React, { useState } from 'react';
import { SyncSettings, AppStateData } from '../types';
import { api, formatRupiah, formatNumber } from '../services/api';
import { 
  X, 
  Send, 
  Copy, 
  Check, 
  Settings, 
  Users, 
  MessageSquare, 
  Smartphone, 
  Share2, 
  FileText, 
  ExternalLink,
  Save
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  state: AppStateData;
  onUpdate: () => void;
}

export const WhatsAppModal: React.FC<Props> = ({
  isOpen,
  onClose,
  state,
  onUpdate
}) => {
  const currentWA = state.syncSettings.whatsApp || {
    enabled: true,
    ownerPhone: '6281234567890',
    akuntanPhone: '6281298765432',
    targetGroupName: 'Grup WA Operasional & Keuangan Farm',
    targetGroupLink: 'https://chat.whatsapp.com/GemaAbadiFarmSync',
    apiKey: 'wa_notifier_token',
    autoSendReceipt: true,
    autoSendDailyRecap: true,
    lastNotifTime: new Date().toISOString()
  };

  const [ownerPhone, setOwnerPhone] = useState(currentWA.ownerPhone);
  const [akuntanPhone, setAkuntanPhone] = useState(currentWA.akuntanPhone);
  const [targetGroupName, setTargetGroupName] = useState(currentWA.targetGroupName);
  const [targetGroupLink, setTargetGroupLink] = useState(currentWA.targetGroupLink || '');
  const [autoSendReceipt, setAutoSendReceipt] = useState(currentWA.autoSendReceipt);
  const [autoSendDailyRecap, setAutoSendDailyRecap] = useState(currentWA.autoSendDailyRecap);

  // Manual Custom Message State
  const [manualPhone, setManualPhone] = useState('');
  const [manualMessage, setManualMessage] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  // Generate real-time daily recap text
  const totalOmzet = state.orders.reduce((sum, o) => sum + o.totalHarga, 0);
  const totalKgKarkas = state.orders.reduce((sum, o) => sum + o.totalKg, 0);
  const kasTunaiMasuk = state.cashTransactions.filter(c => c.tipe === 'masuk').reduce((sum, c) => sum + c.jumlah, 0);
  const totalPiutang = state.customers.reduce((sum, c) => sum + c.sisaPiutang, 0);
  const totalStokKg = state.stocks.reduce((sum, s) => sum + (s.kategori !== 'ayam_hidup' ? s.stokKg : 0), 0);

  const recapText = `📊 *LAPORAN REKAPITULASI HARIAN*\n*GEMA ABADI FARM - AYAM POTONG SEGAR*\n🗓 ${new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}\n----------------------------------------\n💰 *Total Omset:* Rp ${totalOmzet.toLocaleString('id-ID')}\n⚖️ *Karkas Terjual:* ${totalKgKarkas.toFixed(1)} kg\n💵 *Kas Masuk Toko:* Rp ${kasTunaiMasuk.toLocaleString('id-ID')}\n💳 *Total Piutang Berjalan:* Rp ${totalPiutang.toLocaleString('id-ID')}\n🐔 *Sisa Stok Karkas:* ${totalStokKg.toFixed(1)} kg\n----------------------------------------\n✅ _Database Live & Real-Time Sync_`;

  const handleCopyRecap = () => {
    navigator.clipboard.writeText(recapText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleSendToOwner = () => {
    const clean = ownerPhone.replace(/\D/g, '');
    const phone = clean.startsWith('0') ? '62' + clean.slice(1) : clean;
    const url = `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(recapText)}`;
    window.open(url, '_blank');
  };

  const handleSendToGroup = () => {
    if (targetGroupLink && targetGroupLink.includes('chat.whatsapp.com')) {
      // If invitation link, open invite or fallback to generic share
      const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(recapText)}`;
      window.open(url, '_blank');
    } else {
      const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(recapText)}`;
      window.open(url, '_blank');
    }
  };

  const handleSendManual = () => {
    if (!manualMessage) {
      alert('Tuliskan pesan WhatsApp terlebih dahulu');
      return;
    }
    const clean = manualPhone.replace(/\D/g, '');
    const phone = clean.startsWith('0') ? '62' + clean.slice(1) : clean;
    const url = clean 
      ? `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(manualMessage)}`
      : `https://api.whatsapp.com/send?text=${encodeURIComponent(manualMessage)}`;
    window.open(url, '_blank');
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await api.updateSyncSettings({
        whatsApp: {
          enabled: true,
          ownerPhone,
          akuntanPhone,
          targetGroupName,
          targetGroupLink,
          apiKey: currentWA.apiKey || 'token_wa',
          autoSendReceipt,
          autoSendDailyRecap,
          lastNotifTime: new Date().toISOString()
        }
      });
      alert('Pengaturan Notifikasi WhatsApp berhasil disimpan!');
      onUpdate();
    } catch (err: any) {
      alert('Gagal menyimpan konfigurasi: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 border border-stone-200 shadow-2xl space-y-6 my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-stone-900 tracking-tight flex items-center gap-2">
                Notifikasi WhatsApp & Grup Manajemen
              </h2>
              <p className="text-xs text-stone-500">
                Kirim struk nota kasir ke pembeli & rekap omset harian otomatis ke Grup WhatsApp Farm
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Section 1: Quick Action Rekap Harian */}
        <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
              <Share2 className="w-4 h-4 text-emerald-700" /> Format Pesan Rekapitulasi Real-Time Hari Ini
            </span>
            <button
              onClick={handleCopyRecap}
              className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 bg-white border border-emerald-300 rounded-lg text-emerald-800 hover:bg-emerald-100 transition cursor-pointer"
            >
              {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{isCopied ? 'Tersalin!' : 'Salin Teks'}</span>
            </button>
          </div>

          <pre className="p-3 bg-white rounded-xl border border-emerald-200 text-stone-800 text-[11px] font-mono whitespace-pre-wrap leading-relaxed max-h-36 overflow-y-auto">
            {recapText}
          </pre>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              onClick={handleSendToGroup}
              className="flex-1 min-w-[160px] py-2 px-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition cursor-pointer"
            >
              <Users className="w-4 h-4" />
              <span>Kirim ke Grup WhatsApp Farm</span>
              <ExternalLink className="w-3 h-3" />
            </button>

            <button
              onClick={handleSendToOwner}
              className="py-2 px-3 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition cursor-pointer"
            >
              <Smartphone className="w-4 h-4" />
              <span>Kirim ke Owner ({ownerPhone})</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Section 2: Input Manual Pesan WA Bebas */}
        <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-3">
          <h3 className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
            <Send className="w-3.5 h-3.5 text-stone-600" /> Kirim Pesan / Notifikasi Manual
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                No. WhatsApp Tujuan:
              </label>
              <input
                type="text"
                placeholder="Contoh: 08123456789 atau 628..."
                value={manualPhone}
                onChange={e => setManualPhone(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
              <span className="text-[10px] text-stone-400">Kosongkan untuk pilih kontak saat kirim</span>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                Isi Pesan:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ketik pesan konfirmasi order, tagihan, atau info pasokan ayam..."
                  value={manualMessage}
                  onChange={e => setManualMessage(e.target.value)}
                  className="flex-1 px-3 py-2 bg-white border border-stone-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
                <button
                  onClick={handleSendManual}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shrink-0 transition cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" /> Kirim
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Konfigurasi Nomor & Grup WA Target */}
        <form onSubmit={handleSaveConfig} className="space-y-4 pt-2 border-t border-stone-100">
          <h3 className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
            <Settings className="w-3.5 h-3.5 text-stone-600" /> Konfigurasi Nomor & Tautan Grup WhatsApp
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Nomor WhatsApp Owner (Owner / Manager)
              </label>
              <input
                type="text"
                value={ownerPhone}
                onChange={e => setOwnerPhone(e.target.value)}
                required
                className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                placeholder="6281234567890"
              />
              <span className="text-[10px] text-stone-400">Gunakan format internasional (awalan 62)</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Nomor WhatsApp Akuntan / Auditor
              </label>
              <input
                type="text"
                value={akuntanPhone}
                onChange={e => setAkuntanPhone(e.target.value)}
                required
                className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                placeholder="6281298765432"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Nama Grup WhatsApp Farm
              </label>
              <input
                type="text"
                value={targetGroupName}
                onChange={e => setTargetGroupName(e.target.value)}
                required
                className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                placeholder="Grup WA Manajemen GEMA ABADI FARM"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Tautan / Link Invite Grup WhatsApp (Opsional)
              </label>
              <input
                type="text"
                value={targetGroupLink}
                onChange={e => setTargetGroupLink(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                placeholder="https://chat.whatsapp.com/..."
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-3 gap-3 border-t border-stone-100">
            <div className="flex items-center gap-4 text-xs">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoSendReceipt}
                  onChange={e => setAutoSendReceipt(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-stone-700 font-medium">Sediakan Tombol WA di Struk Kasir</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoSendDailyRecap}
                  onChange={e => setAutoSendDailyRecap(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-stone-700 font-medium">Sertakan Rekap Harian di Dashboard</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="py-2 px-4 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition cursor-pointer disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Menyimpan...' : 'Simpan Pengaturan WA'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
