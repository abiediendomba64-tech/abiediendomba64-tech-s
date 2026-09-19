import React, { useState } from 'react';
import { UserRole, AppPage } from '../types';
import { ShieldCheck, ShieldAlert, Lock, KeyRound, X, Check, Eye, EyeOff, AlertTriangle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  targetRole: UserRole | 'customer' | 'buku_kas' | 'cloudflare_github' | 'kasir';
  targetPage?: AppPage;
  onSuccess: (role: UserRole, page?: AppPage) => void;
  configuredPins?: {
    owner: string;
    akuntan: string;
    admin: string;
    kasir: string;
  };
  onUpdatePin?: (role: string, newPin: string) => void;
}

export const RoleSecurityModal: React.FC<Props> = ({
  isOpen,
  onClose,
  targetRole,
  targetPage,
  onSuccess,
  configuredPins,
  onUpdatePin
}) => {
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isChangingPin, setIsChangingPin] = useState(false);
  const [newPinInput, setNewPinInput] = useState('');

  if (!isOpen) return null;

  // Resolve target name & default PIN
  let targetName = 'Portal Akses';
  let requiredRoleKey: 'owner' | 'akuntan' | 'admin' | 'kasir' = 'owner';
  let badgeColor = 'bg-stone-900 text-white';

  if (targetRole === 'owner') {
    targetName = 'Portal Owner & Rekapitulasi Eksekutif';
    requiredRoleKey = 'owner';
    badgeColor = 'bg-amber-600 text-white';
  } else if (targetRole === 'akuntan' || targetRole === 'buku_kas') {
    targetName = 'Portal Akuntan (Audit & Jurnal Umum)';
    requiredRoleKey = 'akuntan';
    badgeColor = 'bg-emerald-700 text-white';
  } else if (targetRole === 'admin' || targetRole === 'customer') {
    targetName = 'Portal Admin (Master Customer & Gudang)';
    requiredRoleKey = 'admin';
    badgeColor = 'bg-blue-700 text-white';
  } else if (targetRole === 'cloudflare_github') {
    targetName = 'Portal Integrasi Cloudflare & GitHub';
    requiredRoleKey = 'owner';
    badgeColor = 'bg-indigo-700 text-white';
  } else if (targetRole === 'kasir') {
    targetName = 'Portal POS Kasir';
    requiredRoleKey = 'kasir';
    badgeColor = 'bg-amber-500 text-white';
  } else {
    targetName = `Portal ${targetRole.toUpperCase()}`;
    requiredRoleKey = 'admin';
  }

  const defaultPins = {
    owner: '8888',
    akuntan: '7777',
    admin: '1234',
    kasir: '0000',
    ...configuredPins
  };

  const expectedPin = defaultPins[requiredRoleKey];

  const handleVerify = () => {
    if (pin === expectedPin || pin === defaultPins.owner) { // Master owner pin can unlock any
      setErrorMsg(null);
      setPin('');
      const mappedRole: UserRole = 
        targetRole === 'buku_kas' ? 'akuntan' :
        targetRole === 'customer' ? 'admin' :
        targetRole === 'cloudflare_github' ? 'owner' : 
        targetRole === 'kasir' ? 'sales' :
        targetRole;
      onSuccess(mappedRole, targetPage);
      onClose();
    } else {
      setErrorMsg(`PIN Tidak Sesuai! Akses ditolak demi keamanan audit data.`);
      setPin('');
    }
  };

  const handleKeypadPress = (val: string) => {
    if (pin.length < 6) {
      setPin(prev => prev + val);
    }
  };

  const handleClear = () => {
    setPin('');
    setErrorMsg(null);
  };

  const handleSaveNewPin = () => {
    if (newPinInput.length < 4) {
      alert('PIN baru minimal 4 angka!');
      return;
    }
    if (onUpdatePin) {
      onUpdatePin(requiredRoleKey, newPinInput);
      alert(`PIN untuk ${targetName} berhasil diubah ke ${newPinInput}`);
      setIsChangingPin(false);
      setNewPinInput('');
    }
  };

  return (
    <div id="role-security-modal-backdrop" className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
      <div id="role-security-card" className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-stone-200 overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 bg-stone-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-600 text-white shadow-xs">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight">Otorisasi Keamanan Hirarki</h3>
              <p className="text-[11px] text-stone-400">Pemisahan Hak Akses Karyawan & Audit</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          
          <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 text-center space-y-1">
            <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block">
              Membuka Akses Menuju:
            </span>
            <div className={`inline-block px-3 py-1 rounded-lg text-xs font-black shadow-xs ${badgeColor}`}>
              {targetName}
            </div>
            <p className="text-[11px] text-stone-500 pt-1">
              Karyawan kasir/toko tidak diizinkan melihat audit akuntan & rekap profit tanpa izin PIN.
            </p>
          </div>

          {/* PIN Input Display */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-stone-700 text-center">
              Masukkan 4-Digit PIN Akses:
            </label>
            <div className="flex items-center justify-center gap-2">
              <div className="relative w-48">
                <input
                  type={showPin ? "text" : "password"}
                  maxLength={6}
                  value={pin}
                  onChange={(e) => {
                    setPin(e.target.value.replace(/\D/g, ''));
                    setErrorMsg(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleVerify();
                  }}
                  placeholder="••••"
                  autoFocus
                  className="w-full text-center text-2xl tracking-[0.4em] font-black py-2.5 bg-stone-100 border-2 border-stone-300 rounded-xl focus:border-stone-900 focus:bg-white focus:outline-hidden transition"
                />
              </div>
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="p-2.5 text-stone-500 hover:text-stone-800 bg-stone-100 rounded-xl border border-stone-200 cursor-pointer"
                title="Lihat / Sembunyikan PIN"
              >
                {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {errorMsg && (
              <div className="flex items-center gap-1.5 p-2 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs font-semibold justify-center">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
          </div>

          {/* Virtual Numeric Keypad for Touch Terminals (e.g. Android/Tablet/Touchscreen) */}
          <div className="grid grid-cols-3 gap-2 pt-1 max-w-[240px] mx-auto">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', 'OK'].map((key) => {
              if (key === 'C') {
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={handleClear}
                    className="py-2.5 rounded-xl bg-stone-200 hover:bg-rose-100 hover:text-rose-700 text-stone-700 font-bold text-sm cursor-pointer transition active:scale-95"
                  >
                    C
                  </button>
                );
              }
              if (key === 'OK') {
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={handleVerify}
                    className="py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm cursor-pointer transition active:scale-95 flex items-center justify-center"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                );
              }
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleKeypadPress(key)}
                  className="py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-base cursor-pointer transition active:scale-95 border border-stone-200"
                >
                  {key}
                </button>
              );
            })}
          </div>

          {/* Quick PIN Reference for Demo & Authorized Operators */}
          <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl text-[11px] text-amber-900 space-y-1">
            <div className="flex items-center justify-between font-bold">
              <span className="flex items-center gap-1">
                <KeyRound className="w-3.5 h-3.5 text-amber-700" />
                Referensi Kunci Akses Standar:
              </span>
              <button
                type="button"
                onClick={() => setIsChangingPin(!isChangingPin)}
                className="text-[10px] text-amber-800 underline hover:text-amber-950 font-semibold cursor-pointer"
              >
                {isChangingPin ? 'Batal' : 'Ganti PIN'}
              </button>
            </div>
            <div className="grid grid-cols-2 gap-1.5 font-mono text-[11px] text-stone-700 pt-0.5">
              <div className="bg-white/90 px-2 py-1 rounded-md border border-amber-200 flex justify-between">
                <span>Owner:</span> <strong className="text-amber-950">{defaultPins.owner}</strong>
              </div>
              <div className="bg-white/90 px-2 py-1 rounded-md border border-amber-200 flex justify-between">
                <span>Akuntan:</span> <strong className="text-amber-950">{defaultPins.akuntan}</strong>
              </div>
              <div className="bg-white/90 px-2 py-1 rounded-md border border-amber-200 flex justify-between">
                <span>Admin:</span> <strong className="text-amber-950">{defaultPins.admin}</strong>
              </div>
              <div className="bg-white/90 px-2 py-1 rounded-md border border-amber-200 flex justify-between">
                <span>Kasir:</span> <strong className="text-amber-950">{defaultPins.kasir}</strong>
              </div>
            </div>
          </div>

          {/* Change PIN Section */}
          {isChangingPin && (
            <div className="p-3 bg-stone-100 rounded-xl border border-stone-300 space-y-2 text-xs">
              <span className="font-bold text-stone-800 block">Ubah PIN Akses ({requiredRoleKey.toUpperCase()}):</span>
              <div className="flex gap-2">
                <input
                  type="text"
                  maxLength={6}
                  placeholder="PIN Baru (4-6 angka)"
                  value={newPinInput}
                  onChange={(e) => setNewPinInput(e.target.value.replace(/\D/g, ''))}
                  className="flex-1 px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-xs"
                />
                <button
                  type="button"
                  onClick={handleSaveNewPin}
                  className="px-3 py-1.5 bg-stone-900 text-white rounded-lg font-bold text-xs cursor-pointer hover:bg-stone-800"
                >
                  Simpan PIN
                </button>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-stone-300 hover:bg-stone-100 text-stone-700 font-semibold text-xs transition cursor-pointer"
            >
              Batal / Tetap di Halaman Ini
            </button>
            <button
              type="button"
              onClick={handleVerify}
              className="flex-1 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Buka Akses</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
