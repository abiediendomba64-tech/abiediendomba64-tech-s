export type UserRole = 'owner' | 'admin' | 'akuntan' | 'sales' | 'karyawan' | 'hr';

export type AppPage = 'dashboard' | 'owner' | 'admin' | 'akuntan' | 'kasir' | 'customer' | 'buku_kas' | 'karyawan' | 'hr' | 'cloudflare_github';

export type CustomerCategory = 'partai_besar' | 'pedagang' | 'eceran';

export type OrderStatus = 'diterima' | 'diproses' | 'siap_kirim' | 'dikirim' | 'selesai' | 'dibatalkan';

export type PaymentStatus = 'lunas' | 'piutang' | 'utang' | 'sebagian';

export interface Customer {
  id: string;
  nama: string;
  jenis: CustomerCategory;
  area: string;
  noHp: string;
  limitKredit: number;
  sisaPiutang: number;
  totalOrder: number;
  catatan?: string;
  salesId?: string;
}

export interface Supplier {
  id: string;
  nama: string;
  kontak: string;
  area: string;
  totalHutang: number;
  totalPembelianKg: number;
  catatan?: string;
}

export interface StockItem {
  id: string;
  kode: string;
  nama: string;
  kategori: 'ayam_hidup' | 'karkas' | 'fillet' | 'jeroan' | 'kepala_ceker' | 'sayap';
  stokEkor: number;
  stokKg: number;
  minStokKg?: number;
  satuan: 'ekor' | 'kg';
  hppPerKg: number;
  hargaPartai: number;
  hargaPedagang: number;
  hargaEceran: number;
  updatedAt: string;
}

export interface PurchaseRecord {
  id: string;
  noNota: string;
  tanggal: string;
  supplierId: string;
  supplierNama: string;
  jumlahEkor: number;
  beratKg: number;
  hargaPerKg: number;
  totalBiaya: number;
  statusBayar: PaymentStatus;
  catatan?: string;
  createdAt: string;
}

export interface ProductionRecord {
  id: string;
  batchNo: string;
  tanggal: string;
  operatorNama: string;
  ekorMasuk: number;
  kgHidup: number;
  hasilKarkasKg: number;
  hasilJeroanKg: number;
  hasilKepalaCekerKg: number;
  totalHasilKg: number;
  susutKg: number;
  rendemenPersen: number;
  biayaPotong: number;
  hppKarkasPerKg: number;
  catatan?: string;
  createdAt: string;
}

export interface OrderItem {
  stockId: string;
  namaProduk: string;
  kg: number;
  hargaPerKg: number;
  subtotal: number;
}

export interface SalesOrder {
  id: string;
  noFaktur: string;
  tanggal: string;
  salesId: string;
  salesNama: string;
  customerId: string;
  customerNama: string;
  kategoriHarga: CustomerCategory;
  items: OrderItem[];
  totalKg: number;
  totalHarga: number;
  status: OrderStatus;
  statusBayar: PaymentStatus;
  jumlahBayar: number;
  sisaPiutang: number;
  catatan?: string;
  specialPriceRequested?: {
    approved: boolean;
    standardTotal: number;
    requestedTotal: number;
    reason: string;
  };
  createdAt: string;
}

export interface CashTransaction {
  id: string;
  tanggal: string;
  tipe: 'masuk' | 'keluar';
  kategori: 'penjualan' | 'pembelian_ayam' | 'operasional' | 'gaji' | 'es_batu' | 'transport' | 'lainnya';
  jumlah: number;
  keterangan: string;
  referensiId?: string;
  bebanKode?: string;
  akunKas: 'Kas Operasional' | 'Kas Utama' | 'Bank BCA Utama' | 'Bank BCA' | 'Bank Mandiri';
  createdAt: string;
}

export interface JournalLine {
  akunKode: string;
  akunNama: string;
  debit: number;
  kredit: number;
}

export interface JournalEntry {
  id: string;
  noBukti: string;
  tanggal: string;
  keterangan: string;
  referensiId?: string;
  tipeTrigger: 'otomatis_pembelian' | 'otomatis_produksi' | 'otomatis_penjualan' | 'otomatis_kas' | 'manual';
  lines: JournalLine[];
  isVerified: boolean;
  createdAt: string;
}

export interface GeneralLedgerAccount {
  kode: string;
  nama: string;
  tipe: 'aktiva' | 'kewajiban' | 'modal' | 'pendapatan' | 'beban';
  saldoNormal: 'debit' | 'kredit';
  saldo: number;
}

export interface Employee {
  id: string;
  nama: string;
  nip: string;
  bagian: 'pemotong' | 'pembersih' | 'penimbang' | 'packing' | 'sopir' | 'kasir' | 'sales' | 'admin' | 'hr';
  statusKerja: 'tetap' | 'kontrak' | 'harian';
  gajiPokok: number;
  uangMakan: number;
  insentifPerKg: number;
  statusAktif: boolean;
  sopWajib: string[];
  createdAt: string;
}

export interface AttendanceRecord {
  id: string;
  pegawaiId: string;
  pegawaiNama: string;
  tanggal: string;
  jamMasuk: string;
  jamPulang?: string;
  status: 'hadir' | 'terlambat' | 'izin' | 'sakit' | 'alpa';
  lemburJam: number;
  catatan?: string;
}

export interface EmployeeTaskWork {
  id: string;
  pegawaiId: string;
  pegawaiNama: string;
  tanggal: string;
  jenisPekerjaan: 'Ayam Masuk' | 'Pemotongan' | 'Pembersihan' | 'Penimbangan & Packing' | 'Pengiriman';
  jumlahEkor: number;
  beratKg: number;
  hasilKarkasKg?: number;
  hasilJeroanKg?: number;
  hasilKepalaCekerKg?: number;
  selesai: boolean;
  statusVerifikasi: 'menunggu' | 'terverifikasi';
  createdAt: string;
}

export interface SOPItem {
  id: string;
  jabatan: string;
  judul: string;
  tujuan: string;
  langkahKerja: string[];
  standarHasil: string;
  larangan: string;
  penanggungJawab: string;
}

export interface SyncSettings {
  googleSheets: {
    enabled: boolean;
    spreadsheetId: string;
    sheetNamePrefix: string;
    autoSync: boolean;
    lastSyncTime?: string;
    status: 'connected' | 'idle' | 'syncing' | 'error';
    syncSummary?: {
      sheetsUpdated: number;
      recordsSynced: number;
      timestamp: string;
    };
  };
  cloudflare: {
    enabled: boolean;
    workerUrl: string;
    authSecret: string;
    lastSyncTime?: string;
    status: 'connected' | 'idle' | 'error';
    customDomain?: string;
  };
  github: {
    enabled: boolean;
    repoUrl: string;
    branch: string;
    token: string;
    autoBackup: boolean;
    lastBackupTime?: string;
  };
  rolePins?: {
    owner: string;
    akuntan: string;
    admin: string;
    kasir: string;
  };
  whatsApp?: {
    enabled: boolean;
    ownerPhone: string;
    akuntanPhone: string;
    targetGroupName: string;
    targetGroupLink?: string;
    apiKey?: string;
    autoSendReceipt: boolean;
    autoSendDailyRecap: boolean;
    lastNotifTime?: string;
  };
  encryption: {
    enabled: boolean;
    algorithm: string;
    masterKeyFingerprint: string;
    deviceName: string;
    activeNodes: number;
  };
}

export interface AppStateData {
  customers: Customer[];
  suppliers: Supplier[];
  stocks: StockItem[];
  purchases: PurchaseRecord[];
  productions: ProductionRecord[];
  orders: SalesOrder[];
  cashTransactions: CashTransaction[];
  journals: JournalEntry[];
  accounts: GeneralLedgerAccount[];
  employees: Employee[];
  attendance: AttendanceRecord[];
  taskWorks: EmployeeTaskWork[];
  sops: SOPItem[];
  syncSettings: SyncSettings;
}
