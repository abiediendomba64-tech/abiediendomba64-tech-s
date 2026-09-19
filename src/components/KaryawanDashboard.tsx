import React, { useState } from 'react';
import { AppStateData } from '../types';
import { formatNumber, api } from '../services/api';
import { 
  CheckCircle, 
  Clock, 
  ClipboardCheck, 
  Scissors, 
  Truck, 
  BookOpen, 
  Bell, 
  UserCheck,
  Send,
  ThumbsUp
} from 'lucide-react';

interface Props {
  state: AppStateData;
  onRefresh: () => void;
}

export const KaryawanDashboard: React.FC<Props> = ({ state, onRefresh }) => {
  const [activeTab, setActiveTab] = useState<'tugas' | 'input' | 'sop' | 'pengumuman'>('input');
  
  // Selected Employee (simulated login on slaughterhouse floor)
  const [selectedEmpId, setSelectedEmpId] = useState(state.employees[0]?.id || 'emp-1');
  const currentEmp = state.employees.find(e => e.id === selectedEmpId) || state.employees[0];

  // Work Mode Selection for Input
  const [workType, setWorkType] = useState<'Pemotongan' | 'Ayam Masuk'>('Pemotongan');

  // Input fields
  const [jumlahEkor, setJumlahEkor] = useState(300);
  const [beratKg, setBeratKg] = useState(600);
  const [hasilKarkasKg, setHasilKarkasKg] = useState(435);
  const [hasilJeroanKg, setHasilJeroanKg] = useState(48);
  const [hasilKepalaCekerKg, setHasilKepalaCekerKg] = useState(60);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Attendance state
  const today = new Date().toISOString().slice(0, 10);
  const todayAttendance = state.attendance.find(a => a.pegawaiId === selectedEmpId && a.tanggal === today);

  const handleClockIn = async () => {
    try {
      await api.recordAttendance(selectedEmpId, 'hadir', 'Absen shift');
      alert(`Absen Masuk Berhasil untuk ${currentEmp.nama}!`);
      onRefresh();
    } catch (err: any) {
      alert(`Gagal: ${err.message}`);
    }
  };

  const handleClockOut = async () => {
    try {
      await api.recordAttendance(selectedEmpId, 'hadir', 'Absen pulang shift');
      alert(`Absen Pulang Berhasil untuk ${currentEmp.nama}! Terima kasih atas kerja keras hari ini.`);
      onRefresh();
    } catch (err: any) {
      alert(`Gagal: ${err.message}`);
    }
  };

  const handleSubmitWork = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMessage(null);
    try {
      await api.recordEmployeeTask({
        pegawaiId: currentEmp.id,
        pegawaiNama: currentEmp.nama,
        jenisPekerjaan: workType,
        jumlahEkor,
        beratKg,
        hasilKarkasKg: workType === 'Pemotongan' ? hasilKarkasKg : undefined,
        hasilJeroanKg: workType === 'Pemotongan' ? hasilJeroanKg : undefined,
        hasilKepalaCekerKg: workType === 'Pemotongan' ? hasilKepalaCekerKg : undefined,
        selesai: true
      });
      setSuccessMessage('Data hasil kerja berhasil tersimpan dan langsung masuk ke stok karkas & sistem utama!');
      onRefresh();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // SOP for this employee role
  const relevantSOP = state.sops.find(s => s.jabatan.toLowerCase() === currentEmp.bagian.toLowerCase()) || state.sops[0];

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Top Banner (Large and Simple as requested) */}
      <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500 text-white">
                Dashboard Karyawan
              </span>
              <span className="text-xs text-stone-500">Mode Layar Sentuh Sederhana</span>
            </div>
            <h2 className="text-2xl font-black text-stone-900">Halo, {currentEmp.nama}!</h2>
            <p className="text-sm text-stone-600">
              Bagian: <span className="font-bold capitalize text-stone-900">{currentEmp.bagian}</span> ({currentEmp.nip})
            </p>
          </div>

          {/* Quick Employee Switcher (Floor Tablet simulation) */}
          <div className="text-right">
            <span className="text-xs text-stone-400 block mb-1">Ganti Petugas:</span>
            <select
              value={selectedEmpId}
              onChange={e => setSelectedEmpId(e.target.value)}
              className="px-3 py-2 border rounded-xl bg-stone-50 font-bold text-xs"
            >
              {state.employees.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.nama} ({emp.bagian})</option>
              ))}
            </select>
          </div>
        </div>

        {/* Big Action Buttons (Touch Friendly) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
          <button
            onClick={() => setActiveTab('input')}
            className={`py-4 px-3 rounded-2xl font-black text-sm flex flex-col items-center justify-center gap-1.5 transition shadow-xs cursor-pointer ${
              activeTab === 'input'
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-950 border border-emerald-200'
            }`}
          >
            <Scissors className="w-6 h-6" />
            <span>INPUT HASIL KERJA</span>
          </button>

          <button
            onClick={() => {
              if (!todayAttendance) handleClockIn();
              else handleClockOut();
            }}
            className="py-4 px-3 rounded-2xl font-black text-sm bg-blue-50 hover:bg-blue-100 text-blue-950 border border-blue-200 flex flex-col items-center justify-center gap-1.5 transition shadow-xs cursor-pointer"
          >
            <Clock className="w-6 h-6 text-blue-700" />
            <span>{todayAttendance ? (todayAttendance.jamPulang ? 'SUDAH PULANG' : 'ABSEN PULANG') : 'ABSEN MASUK'}</span>
          </button>

          <button
            onClick={() => setActiveTab('tugas')}
            className={`py-4 px-3 rounded-2xl font-black text-sm flex flex-col items-center justify-center gap-1.5 transition shadow-xs cursor-pointer ${
              activeTab === 'tugas'
                ? 'bg-stone-900 text-white'
                : 'bg-stone-100 hover:bg-stone-200 text-stone-900 border border-stone-200'
            }`}
          >
            <ClipboardCheck className="w-6 h-6" />
            <span>TUGAS HARI INI</span>
          </button>

          <button
            onClick={() => setActiveTab('sop')}
            className={`py-4 px-3 rounded-2xl font-black text-sm flex flex-col items-center justify-center gap-1.5 transition shadow-xs cursor-pointer ${
              activeTab === 'sop'
                ? 'bg-amber-600 text-white'
                : 'bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-200'
            }`}
          >
            <BookOpen className="w-6 h-6 text-amber-700" />
            <span>SOP SAYA</span>
          </button>
        </div>
      </div>

      {/* INPUT HASIL KERJA (Central Simplified Tablet Screen) */}
      {activeTab === 'input' && (
        <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-stone-200">
            <div>
              <h3 className="text-lg font-bold text-stone-900">Catat Pekerjaan Hari Ini</h3>
              <p className="text-xs text-stone-500">Ketik angka timbangan fisik & klik Simpan</p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setWorkType('Pemotongan')}
                className={`px-4 py-2 rounded-xl text-xs font-bold ${
                  workType === 'Pemotongan' ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-700'
                }`}
              >
                Pemotongan Karkas
              </button>
              <button
                type="button"
                onClick={() => setWorkType('Ayam Masuk')}
                className={`px-4 py-2 rounded-xl text-xs font-bold ${
                  workType === 'Ayam Masuk' ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-700'
                }`}
              >
                Ayam Masuk
              </button>
            </div>
          </div>

          {successMessage && (
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-950 flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-emerald-600 shrink-0" />
              <div className="text-sm font-semibold">{successMessage}</div>
            </div>
          )}

          <form onSubmit={handleSubmitWork} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-1">
                <label className="block text-xs font-bold text-stone-600 uppercase">Jumlah Ayam (Ekor):</label>
                <input
                  type="number"
                  min="1"
                  value={jumlahEkor}
                  onChange={e => setJumlahEkor(Number(e.target.value))}
                  className="w-full text-2xl font-black text-stone-900 bg-white border border-stone-300 rounded-xl px-3 py-2 text-center"
                  required
                />
              </div>

              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-1">
                <label className="block text-xs font-bold text-stone-600 uppercase">Berat Timbangan (Kg):</label>
                <input
                  type="number"
                  min="1"
                  value={beratKg}
                  onChange={e => setBeratKg(Number(e.target.value))}
                  className="w-full text-2xl font-black text-stone-900 bg-white border border-stone-300 rounded-xl px-3 py-2 text-center"
                  required
                />
              </div>
            </div>

            {workType === 'Pemotongan' && (
              <div className="p-5 bg-emerald-50/60 rounded-2xl border border-emerald-200 space-y-3">
                <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wider">Hasil Timbangan Karkas & Sampingan:</h4>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Daging Karkas (Kg):</label>
                    <input
                      type="number"
                      value={hasilKarkasKg}
                      onChange={e => setHasilKarkasKg(Number(e.target.value))}
                      className="w-full text-xl font-black text-emerald-900 bg-white border border-emerald-300 rounded-xl px-3 py-2 text-center"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Jeroan (Kg):</label>
                    <input
                      type="number"
                      value={hasilJeroanKg}
                      onChange={e => setHasilJeroanKg(Number(e.target.value))}
                      className="w-full text-xl font-black text-stone-900 bg-white border border-stone-300 rounded-xl px-3 py-2 text-center"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Kepala/Ceker (Kg):</label>
                    <input
                      type="number"
                      value={hasilKepalaCekerKg}
                      onChange={e => setHasilKepalaCekerKg(Number(e.target.value))}
                      className="w-full text-xl font-black text-stone-900 bg-white border border-stone-300 rounded-xl px-3 py-2 text-center"
                    />
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-lg rounded-2xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Send className="w-5 h-5" />
              <span>{isSubmitting ? 'MENYIMPAN DATA...' : 'SIMPAN SELESAI'}</span>
            </button>
          </form>
        </div>
      )}

      {/* TUGAS HARI INI */}
      {activeTab === 'tugas' && (
        <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-sm space-y-4">
          <h3 className="text-lg font-bold text-stone-900">Daftar Tugas Shift Hari Ini</h3>
          <div className="space-y-3">
            {[
              { text: 'Periksa kebersihan ruang potong & pisau sembelih', done: true },
              { text: 'Siapkan bak chilling air es suhu 0 - 4 derajat', done: true },
              { text: 'Proses pemotongan batch ayam subuh', done: true },
              { text: 'Timbang karkas bersih dan catat di layar sistem', done: true },
              { text: 'Pembersihan sanitasi lantai dan desinfektan', done: false }
            ].map((task, idx) => (
              <div key={idx} className="p-3.5 rounded-xl border border-stone-200 bg-stone-50 flex items-center gap-3">
                <input
                  type="checkbox"
                  defaultChecked={task.done}
                  className="w-5 h-5 rounded text-emerald-600"
                />
                <span className={`text-sm ${task.done ? 'line-through text-stone-400' : 'font-semibold text-stone-800'}`}>
                  {task.text}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SOP SAYA (Panduan Ringkas) */}
      {activeTab === 'sop' && (
        <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-sm space-y-4">
          <div className="border-b border-stone-200 pb-3">
            <span className="text-xs font-bold text-amber-700 uppercase">Panduan Kerja Bagian: {currentEmp.bagian}</span>
            <h3 className="text-lg font-black text-stone-900 mt-1">{relevantSOP.judul}</h3>
            <p className="text-xs text-stone-600 mt-1">{relevantSOP.tujuan}</p>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase text-stone-500">Langkah Pelaksanaan:</h4>
            {relevantSOP.langkahKerja.map((step, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs font-medium text-stone-800">
                {step}
              </div>
            ))}
          </div>

          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs space-y-1">
            <span className="font-bold text-rose-900 block uppercase">Larangan Keras:</span>
            <p className="text-rose-800">{relevantSOP.larangan}</p>
          </div>
        </div>
      )}
    </div>
  );
};
