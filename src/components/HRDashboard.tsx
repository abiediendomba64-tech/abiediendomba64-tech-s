import React, { useState } from 'react';
import { AppStateData, Employee } from '../types';
import { formatRupiah, formatNumber, api } from '../services/api';
import { 
  Users, 
  Clock, 
  DollarSign, 
  BookOpen, 
  Plus, 
  CheckCircle, 
  ShieldAlert, 
  Award,
  Calendar,
  Trash2,
  Edit2,
  X,
  UserCheck
} from 'lucide-react';

interface Props {
  state: AppStateData;
  onRefresh: () => void;
}

export const HRDashboard: React.FC<Props> = ({ state, onRefresh }) => {
  const [activeTab, setActiveTab] = useState<'pegawai' | 'absensi' | 'payroll' | 'sop'>('pegawai');
  const [showAddEmpModal, setShowAddEmpModal] = useState(false);
  const [editingEmp, setEditingEmp] = useState<Employee | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form for new/edit employee
  const [nama, setNama] = useState('');
  const [bagian, setBagian] = useState<Employee['bagian']>('pemotong');
  const [statusKerja, setStatusKerja] = useState<Employee['statusKerja']>('tetap');
  const [gajiPokok, setGajiPokok] = useState(3500000);
  const [uangMakan, setUangMakan] = useState(500000);
  const [insentifPerKg, setInsentifPerKg] = useState(150);

  const resetForm = () => {
    setNama('');
    setBagian('pemotong');
    setStatusKerja('tetap');
    setGajiPokok(3500000);
    setUangMakan(500000);
    setInsentifPerKg(150);
    setEditingEmp(null);
    setShowAddEmpModal(false);
  };

  const handleOpenEdit = (emp: Employee) => {
    setEditingEmp(emp);
    setNama(emp.nama);
    setBagian(emp.bagian);
    setStatusKerja(emp.statusKerja);
    setGajiPokok(emp.gajiPokok);
    setUangMakan(emp.uangMakan);
    setInsentifPerKg(emp.insentifPerKg);
    setShowAddEmpModal(true);
  };

  const handleSubmitEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama.trim()) {
      alert('Nama pegawai harus diisi!');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingEmp) {
        await api.updateEmployee(editingEmp.id, {
          nama: nama.trim(),
          bagian,
          statusKerja,
          gajiPokok: Number(gajiPokok),
          uangMakan: Number(uangMakan),
          insentifPerKg: Number(insentifPerKg)
        });
        alert(`Data pegawai "${nama}" berhasil diperbarui!`);
      } else {
        const nip = `KARY-${Math.floor(100 + Math.random() * 900)}`;
        await api.addEmployee({
          nama: nama.trim(),
          nip,
          bagian,
          statusKerja,
          gajiPokok: Number(gajiPokok),
          uangMakan: Number(uangMakan),
          insentifPerKg: Number(insentifPerKg),
          sopWajib: ['SOP-01-HIGIENE', 'SOP-03-POTONG']
        });
        alert(`Pegawai baru "${nama}" berhasil didaftarkan dengan NIP ${nip}!`);
      }
      resetForm();
      onRefresh();
    } catch (err: any) {
      alert('Gagal menyimpan data pegawai: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteEmployee = async (emp: Employee) => {
    if (!window.confirm(`Yakin ingin menghapus pegawai "${emp.nama}" (${emp.nip})? Data absensi dan riwayat akan disesuaikan.`)) {
      return;
    }

    try {
      await api.deleteEmployee(emp.id);
      alert(`Pegawai "${emp.nama}" berhasil dihapus.`);
      onRefresh();
    } catch (err: any) {
      alert('Gagal menghapus pegawai: ' + err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md text-xs font-bold uppercase tracking-wider bg-rose-900 text-white">
                Dashboard HR & SOP
              </span>
              <span className="text-xs text-stone-500 font-medium">Pengelolaan SDM & Standar Mutu</span>
            </div>
            <h2 className="text-xl font-bold text-stone-900 mt-1">Manajemen Ketenagakerjaan & SOP</h2>
            <p className="text-xs text-stone-600">
              Absensi kehadiran, perhitungan upah insentif kg karkas, dan SOP higienis/halal per jabatan.
            </p>
          </div>

          <button
            onClick={() => setShowAddEmpModal(true)}
            className="px-4 py-2 bg-stone-900 hover:bg-black text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition"
          >
            <Plus className="w-4 h-4" /> Tambah Pegawai
          </button>
        </div>

        {/* 4 Tabs */}
        <div className="flex flex-wrap gap-2 pt-3">
          {[
            { id: 'pegawai', label: 'Data Pegawai', icon: <Users className="w-3.5 h-3.5" /> },
            { id: 'absensi', label: 'Absensi Harian', icon: <Clock className="w-3.5 h-3.5" /> },
            { id: 'payroll', label: 'Estimasi Upah & Insentif', icon: <DollarSign className="w-3.5 h-3.5" /> },
            { id: 'sop', label: 'SOP Center Terstruktur', icon: <BookOpen className="w-3.5 h-3.5" /> }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-rose-900 text-white shadow-xs'
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 1. DATA PEGAWAI */}
      {activeTab === 'pegawai' && (
        <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-stone-900 text-base">Daftar Karyawan Rumah Potong Ayam</h3>
            <span className="text-xs text-stone-500 font-medium">{state.employees.length} Karyawan</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {state.employees.map(emp => (
              <div key={emp.id} className="p-4 rounded-xl border border-stone-200 bg-stone-50 space-y-2 text-xs hover:border-rose-200 transition">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-sm text-stone-900">{emp.nama}</h4>
                    <span className="font-mono text-[11px] text-stone-500">{emp.nip}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase">
                    {emp.statusKerja}
                  </span>
                </div>
                <div className="pt-1 text-stone-700">
                  Bagian: <b className="capitalize">{emp.bagian.replace(/_/g, ' ')}</b>
                </div>
                <div className="text-stone-600">
                  Gaji Pokok: <b>{formatRupiah(emp.gajiPokok)}</b> &bull; Uang Makan: {formatRupiah(emp.uangMakan)}
                </div>
                <div className="text-emerald-800 font-semibold">
                  Insentif: {formatRupiah(emp.insentifPerKg)} / kg potong
                </div>
                <div className="pt-2 border-t border-stone-200 flex items-center justify-between">
                  <span className="text-[11px] text-stone-500">SOP: {emp.sopWajib.length} wajib</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEdit(emp)}
                      className="px-2 py-1 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-md font-semibold flex items-center gap-1 transition cursor-pointer"
                      title="Ubah data pegawai"
                    >
                      <Edit2 className="w-3 h-3" /> Edit
                    </button>
                    <button
                      onClick={() => handleDeleteEmployee(emp)}
                      className="p-1 text-rose-600 hover:bg-rose-100 rounded-md transition cursor-pointer"
                      title="Hapus data pegawai"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. ABSENSI HARIAN */}
      {activeTab === 'absensi' && (
        <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs space-y-4">
          <h3 className="font-bold text-stone-900 text-base">Rekap Kehadiran Shift Hari Ini</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-500 uppercase font-semibold border-y border-stone-200">
                <tr>
                  <th className="py-2.5 px-3">Nama Pegawai</th>
                  <th className="py-2.5 px-3">Tanggal</th>
                  <th className="py-2.5 px-3">Jam Masuk</th>
                  <th className="py-2.5 px-3">Jam Pulang</th>
                  <th className="py-2.5 px-3">Lembur</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Catatan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {state.attendance.map(a => (
                  <tr key={a.id}>
                    <td className="py-3 px-3 font-semibold text-stone-900">{a.pegawaiNama}</td>
                    <td className="py-3 px-3">{a.tanggal}</td>
                    <td className="py-3 px-3 font-mono">{a.jamMasuk} WIB</td>
                    <td className="py-3 px-3 font-mono">{a.jamPulang ? `${a.jamPulang} WIB` : 'Sedang Bertugas'}</td>
                    <td className="py-3 px-3">{a.lemburJam > 0 ? `${a.lemburJam} Jam` : '-'}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {a.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-stone-500">{a.catatan || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. ESTIMASI UPAH & PAYROLL */}
      {activeTab === 'payroll' && (
        <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-stone-900 text-base">Perhitungan Upah Kerja & Insentif Kinerja</h3>
              <p className="text-xs text-stone-500">Otomatis mengakumulasi hasil tonase karkas yang dikerjakan pegawai</p>
            </div>
          </div>
          <div className="space-y-3">
            {state.employees.map(emp => {
              // Calculate tonnage handled by this employee
              const tasks = state.taskWorks.filter(t => t.pegawaiId === emp.id);
              const totalKgHandled = tasks.reduce((sum, t) => sum + (t.hasilKarkasKg || t.beratKg), 0);
              const insentifEarned = totalKgHandled * emp.insentifPerKg;
              const totalGajiEstimasi = emp.gajiPokok + emp.uangMakan + insentifEarned;

              return (
                <div key={emp.id} className="p-4 rounded-xl border border-stone-200 bg-stone-50 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                  <div>
                    <h4 className="font-bold text-sm text-stone-900">{emp.nama} ({emp.bagian.toUpperCase()})</h4>
                    <p className="text-stone-500">
                      Gaji Pokok: {formatRupiah(emp.gajiPokok)} &bull; Uang Makan: {formatRupiah(emp.uangMakan)}
                    </p>
                    <p className="text-stone-700 font-semibold mt-1">
                      Kinerja Hari Ini: <span className="text-emerald-700 font-bold">{formatNumber(totalKgHandled)} kg karkas</span> &rarr; Insentif: <span className="text-emerald-800 font-bold">+{formatRupiah(insentifEarned)}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-stone-500 block">Total Estimasi Take Home Pay:</span>
                    <span className="text-lg font-black text-stone-900">{formatRupiah(totalGajiEstimasi)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. SOP CENTER */}
      {activeTab === 'sop' && (
        <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs space-y-5">
          <div>
            <h3 className="font-bold text-stone-900 text-base">Standar Operasional Prosedur (SOP) Resmi</h3>
            <p className="text-xs text-stone-500">Pedoman baku kebersihan, higienis, dan kehalalan rumah potong ayam</p>
          </div>
          <div className="space-y-4">
            {state.sops.map(sop => (
              <div key={sop.id} className="border border-stone-200 rounded-xl p-4 bg-stone-50/60 space-y-3 text-xs">
                <div className="flex items-center justify-between border-b border-stone-200 pb-2">
                  <div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 uppercase mr-2">
                      {sop.jabatan}
                    </span>
                    <span className="font-bold text-stone-900 text-sm">{sop.judul}</span>
                  </div>
                  <span className="text-stone-500 text-[11px]">PJ: {sop.penanggungJawab}</span>
                </div>
                <p className="text-stone-600"><b>Tujuan:</b> {sop.tujuan}</p>
                <div>
                  <b className="text-stone-700 block mb-1">Langkah Prosedur:</b>
                  <div className="space-y-1 pl-2">
                    {sop.langkahKerja.map((step, sIdx) => (
                      <div key={sIdx} className="text-stone-800">&bull; {step}</div>
                    ))}
                  </div>
                </div>
                <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-900">
                  <b>Larangan Keras:</b> {sop.larangan}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* POPUP MODAL: Tambah / Edit Pegawai */}
      {showAddEmpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-stone-200 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="text-base font-bold text-stone-900">
                {editingEmp ? `Edit Pegawai: ${editingEmp.nama}` : 'Pendaftaran Karyawan Baru'}
              </h3>
              <button
                onClick={resetForm}
                className="p-1 text-stone-400 hover:text-stone-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitEmployee} className="space-y-3 pt-3 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Nama Lengkap:</label>
                <input
                  type="text"
                  value={nama}
                  onChange={e => setNama(e.target.value)}
                  placeholder="Contoh: Budi Santoso"
                  className="w-full px-3 py-2 border rounded-xl border-stone-300 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Divisi / Bagian:</label>
                  <select
                    value={bagian}
                    onChange={e => setBagian(e.target.value as Employee['bagian'])}
                    className="w-full px-3 py-2 border rounded-xl border-stone-300 bg-white"
                  >
                    <option value="pemotong">Pemotong (Juru Sembelih Halal)</option>
                    <option value="pembersih">Pembersih & Pencabut Bulu</option>
                    <option value="penimbang">Penimbang & QC Mutu</option>
                    <option value="packing">Packing & Kemasan</option>
                    <option value="sopir">Driver & Pengiriman Armada</option>
                    <option value="kasir">Kasir Toko</option>
                    <option value="sales">Sales & Distribusi</option>
                    <option value="admin">Admin Operasional</option>
                    <option value="hr">HR & Personalia</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Status Ikatan:</label>
                  <select
                    value={statusKerja}
                    onChange={e => setStatusKerja(e.target.value as Employee['statusKerja'])}
                    className="w-full px-3 py-2 border rounded-xl border-stone-300 bg-white"
                  >
                    <option value="tetap">Karyawan Tetap</option>
                    <option value="kontrak">Kontrak PKWT</option>
                    <option value="harian">Harian Lepas / Borong</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Gaji Pokok (Rp):</label>
                  <input
                    type="number"
                    value={gajiPokok}
                    onChange={e => setGajiPokok(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-xl border-stone-300"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Uang Makan (Rp):</label>
                  <input
                    type="number"
                    value={uangMakan}
                    onChange={e => setUangMakan(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-xl border-stone-300"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Insentif per Kg Karkas (Rp):</label>
                <input
                  type="number"
                  value={insentifPerKg}
                  onChange={e => setInsentifPerKg(Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded-xl border-stone-300"
                  required
                />
                <span className="text-[10px] text-stone-500 mt-0.5 block">
                  Dihitung otomatis dari total kg karkas ayam yang diproses pegawai bersangkutan.
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 border border-stone-300 hover:bg-stone-50 rounded-xl text-stone-700 font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-rose-900 hover:bg-rose-950 text-white font-semibold rounded-xl cursor-pointer"
                >
                  {isSubmitting ? 'Menyimpan...' : (editingEmp ? 'Simpan Perubahan' : 'Daftarkan Pegawai')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
