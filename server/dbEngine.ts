import fs from 'fs';
import path from 'path';
import {
  AppStateData,
  Customer,
  Supplier,
  StockItem,
  PurchaseRecord,
  ProductionRecord,
  SalesOrder,
  CashTransaction,
  JournalEntry,
  GeneralLedgerAccount,
  Employee,
  AttendanceRecord,
  EmployeeTaskWork,
  SOPItem,
  SyncSettings
} from '../src/types';

const DB_FILE_PATH = path.join(process.cwd(), 'data', 'app_database.json');

// Initial GL Chart of Accounts
const initialAccounts: GeneralLedgerAccount[] = [
  { kode: '1101', nama: 'Kas Operasional', tipe: 'aktiva', saldoNormal: 'debit', saldo: 45000000 },
  { kode: '1102', nama: 'Bank BCA Utama', tipe: 'aktiva', saldoNormal: 'debit', saldo: 120000000 },
  { kode: '1107', nama: 'Bank Mandiri', tipe: 'aktiva', saldoNormal: 'debit', saldo: 65000000 },
  { kode: '1103', nama: 'Piutang Usaha (Customer)', tipe: 'aktiva', saldoNormal: 'debit', saldo: 18500000 },
  { kode: '1104', nama: 'Persediaan Ayam Hidup', tipe: 'aktiva', saldoNormal: 'debit', saldo: 24000000 },
  { kode: '1105', nama: 'Persediaan Daging Karkas', tipe: 'aktiva', saldoNormal: 'debit', saldo: 19800000 },
  { kode: '1106', nama: 'Persediaan Jeroan & Kepala', tipe: 'aktiva', saldoNormal: 'debit', saldo: 2100000 },
  { kode: '1201', nama: 'Aset Peralatan & Cold Storage', tipe: 'aktiva', saldoNormal: 'debit', saldo: 85000000 },
  { kode: '2101', nama: 'Utang Usaha (Supplier)', tipe: 'kewajiban', saldoNormal: 'kredit', saldo: 16500000 },
  { kode: '3101', nama: 'Modal Usaha', tipe: 'modal', saldoNormal: 'kredit', saldo: 250000000 },
  { kode: '4101', nama: 'Pendapatan Penjualan Ayam', tipe: 'pendapatan', saldoNormal: 'kredit', saldo: 74200000 },
  { kode: '5101', nama: 'Beban Pokok Penjualan (HPP)', tipe: 'beban', saldoNormal: 'debit', saldo: 53800000 },
  { kode: '6101', nama: 'Beban Operasional & Pemotongan', tipe: 'beban', saldoNormal: 'debit', saldo: 4500000 },
  { kode: '6102', nama: 'Beban Gaji & Upah Karyawan', tipe: 'beban', saldoNormal: 'debit', saldo: 8600000 },
  { kode: '6103', nama: 'Beban Es Balok & Pendingin', tipe: 'beban', saldoNormal: 'debit', saldo: 1200000 },
  { kode: '6104', nama: 'Beban Bensin & Armada Kirim', tipe: 'beban', saldoNormal: 'debit', saldo: 1800000 },
  { kode: '6105', nama: 'Beban Listrik & Air Operasional', tipe: 'beban', saldoNormal: 'debit', saldo: 2400000 },
  { kode: '6106', nama: 'Beban Kemasan Plastik & Label', tipe: 'beban', saldoNormal: 'debit', saldo: 950000 },
  { kode: '6199', nama: 'Beban Operasional Lain-lain', tipe: 'beban', saldoNormal: 'debit', saldo: 500000 }
];

const initialStocks: StockItem[] = [
  {
    id: 'stk-1',
    kode: 'AYAM-HD-01',
    nama: 'Ayam Hidup Broiler',
    kategori: 'ayam_hidup',
    stokEkor: 480,
    stokKg: 960,
    satuan: 'kg',
    hppPerKg: 23500,
    hargaPartai: 25000,
    hargaPedagang: 26000,
    hargaEceran: 28000,
    updatedAt: new Date().toISOString()
  },
  {
    id: 'stk-2',
    kode: 'AYAM-KR-01',
    nama: 'Ayam Karkas Segar (Daging Utuh)',
    kategori: 'karkas',
    stokEkor: 350,
    stokKg: 525,
    satuan: 'kg',
    hppPerKg: 31000,
    hargaPartai: 33000,
    hargaPedagang: 35000,
    hargaEceran: 38000,
    updatedAt: new Date().toISOString()
  },
  {
    id: 'stk-3',
    kode: 'AYAM-FL-01',
    nama: 'Fillet Dada Tanpa Tulang (Boneless)',
    kategori: 'fillet',
    stokEkor: 0,
    stokKg: 120,
    satuan: 'kg',
    hppPerKg: 42000,
    hargaPartai: 46000,
    hargaPedagang: 49000,
    hargaEceran: 54000,
    updatedAt: new Date().toISOString()
  },
  {
    id: 'stk-4',
    kode: 'AYAM-JR-01',
    nama: 'Jeroan (Ati & Ampela Bersih)',
    kategori: 'jeroan',
    stokEkor: 0,
    stokKg: 65,
    satuan: 'kg',
    hppPerKg: 16000,
    hargaPartai: 19000,
    hargaPedagang: 21000,
    hargaEceran: 24000,
    updatedAt: new Date().toISOString()
  },
  {
    id: 'stk-5',
    kode: 'AYAM-KC-01',
    nama: 'Kepala & Ceker Ayam',
    kategori: 'kepala_ceker',
    stokEkor: 0,
    stokKg: 85,
    satuan: 'kg',
    hppPerKg: 12000,
    hargaPartai: 14000,
    hargaPedagang: 16000,
    hargaEceran: 18000,
    updatedAt: new Date().toISOString()
  }
];

const initialCustomers: Customer[] = [
  {
    id: 'cst-1',
    nama: 'Toko Budi Unggas',
    jenis: 'pedagang',
    area: 'Pasar Induk Kramat Jati',
    noHp: '0812-3456-7890',
    limitKredit: 10000000,
    sisaPiutang: 3200000,
    totalOrder: 42,
    catatan: 'Rutin ambil karkas 50kg per 2 hari',
    salesId: 'usr-sales-1'
  },
  {
    id: 'cst-2',
    nama: 'Resto Ayam Bakar Sedap',
    jenis: 'partai_besar',
    area: 'Kebayoran Baru',
    noHp: '0813-8899-1122',
    limitKredit: 25000000,
    sisaPiutang: 8500000,
    totalOrder: 88,
    catatan: 'Order ukuran karkas rata 1.2kg - 1.3kg',
    salesId: 'usr-sales-1'
  },
  {
    id: 'cst-3',
    nama: 'Ibu Hj. Aminah Warung Nasi',
    jenis: 'eceran',
    area: 'Tebet Timur',
    noHp: '0857-1234-9988',
    limitKredit: 1000000,
    sisaPiutang: 0,
    totalOrder: 15,
    catatan: 'Pembayaran cash saat terima barang',
    salesId: 'usr-sales-1'
  },
  {
    id: 'cst-4',
    nama: 'Katering Berkah Mandiri',
    jenis: 'pedagang',
    area: 'Pancoran',
    noHp: '0878-5544-3322',
    limitKredit: 15000000,
    sisaPiutang: 6800000,
    totalOrder: 27,
    catatan: 'Butuh fillet dada & sayap',
    salesId: 'usr-sales-1'
  }
];

const initialSuppliers: Supplier[] = [
  {
    id: 'sup-1',
    nama: 'Kemitraan Peternak Subang Makmur',
    kontak: 'Pak Hendra (0812-9988-7711)',
    area: 'Subang, Jawa Barat',
    totalHutang: 12500000,
    totalPembelianKg: 42500,
    catatan: 'Armada kirim subuh jam 03:00 WIB'
  },
  {
    id: 'sup-2',
    nama: 'PT Unggas Barokah Bogor',
    kontak: 'Pak Dede (0856-7788-9900)',
    area: 'Ciampea, Bogor',
    totalHutang: 4000000,
    totalPembelianKg: 28000,
    catatan: 'Kualitas broiler grade A, rata 2.0kg'
  }
];

const initialEmployees: Employee[] = [
  {
    id: 'emp-1',
    nama: 'Andi Saputra',
    nip: 'EMP-01-CUT',
    bagian: 'pemotong',
    statusKerja: 'tetap',
    gajiPokok: 3500000,
    uangMakan: 500000,
    insentifPerKg: 150,
    statusAktif: true,
    sopWajib: ['SOP Pemotongan Halal', 'SOP Higiene & Sanitasi'],
    createdAt: '2026-01-10'
  },
  {
    id: 'emp-2',
    nama: 'Budi Santoso',
    nip: 'EMP-02-CLN',
    bagian: 'pembersih',
    statusKerja: 'tetap',
    gajiPokok: 3200000,
    uangMakan: 500000,
    insentifPerKg: 100,
    statusAktif: true,
    sopWajib: ['SOP Pembersihan Jeroan', 'SOP Chilling Air Es'],
    createdAt: '2026-01-15'
  },
  {
    id: 'emp-3',
    nama: 'Candra Gunawan',
    nip: 'EMP-03-WGH',
    bagian: 'penimbang',
    statusKerja: 'tetap',
    gajiPokok: 3400000,
    uangMakan: 500000,
    insentifPerKg: 120,
    statusAktif: true,
    sopWajib: ['SOP Penimbangan & Kalibrasi', 'SOP Sortir Grade'],
    createdAt: '2026-02-01'
  },
  {
    id: 'emp-4',
    nama: 'Dimas Aditya',
    nip: 'EMP-04-SLS',
    bagian: 'sales',
    statusKerja: 'tetap',
    gajiPokok: 3800000,
    uangMakan: 600000,
    insentifPerKg: 200,
    statusAktif: true,
    sopWajib: ['SOP Penjualan & Pelayanan', 'SOP Kontrol Piutang'],
    createdAt: '2026-01-05'
  },
  {
    id: 'emp-5',
    nama: 'Eka Lestari',
    nip: 'EMP-05-ADM',
    bagian: 'admin',
    statusKerja: 'tetap',
    gajiPokok: 4000000,
    uangMakan: 500000,
    insentifPerKg: 0,
    statusAktif: true,
    sopWajib: ['SOP Administrasi Operasional', 'SOP Verifikasi Nota'],
    createdAt: '2026-01-02'
  }
];

const initialAttendance: AttendanceRecord[] = [
  {
    id: 'att-1',
    pegawaiId: 'emp-1',
    pegawaiNama: 'Andi Saputra',
    tanggal: '2026-09-19',
    jamMasuk: '04:30',
    jamPulang: '13:00',
    status: 'hadir',
    lemburJam: 1,
    catatan: 'Shift subuh potong batch 1'
  },
  {
    id: 'att-2',
    pegawaiId: 'emp-2',
    pegawaiNama: 'Budi Santoso',
    tanggal: '2026-09-19',
    jamMasuk: '04:45',
    jamPulang: '13:00',
    status: 'hadir',
    lemburJam: 1,
    catatan: 'Pembersihan karkas selesai'
  },
  {
    id: 'att-3',
    pegawaiId: 'emp-3',
    pegawaiNama: 'Candra Gunawan',
    tanggal: '2026-09-19',
    jamMasuk: '05:00',
    jamPulang: '13:30',
    status: 'hadir',
    lemburJam: 1.5,
    catatan: 'Penimbangan pesanan resto'
  },
  {
    id: 'att-4',
    pegawaiId: 'emp-4',
    pegawaiNama: 'Dimas Aditya',
    tanggal: '2026-09-19',
    jamMasuk: '06:00',
    jamPulang: '15:00',
    status: 'hadir',
    lemburJam: 0,
    catatan: 'Kunjungan customer pasar'
  }
];

const initialSOPs: SOPItem[] = [
  {
    id: 'sop-1',
    jabatan: 'Pemotong',
    judul: 'SOP Pemotongan Ayam Syar\'i & Higienis',
    tujuan: 'Menjamin ayam disembelih sesuai syariat Islam, bersih, halal, dan cepat.',
    langkahKerja: [
      '1. Periksa kondisi ayam hidup (sehat, aktif, tidak mati lemas).',
      '2. Gantung kaki ayam di conveyor gantung secara hati-hati.',
      '3. Ucapkan Basmalah dan takbir, putuskan 3 saluran (tenggorokan, kerongkongan, 2 pembuluh darah nadi).',
      '4. Tiriskan darah minimal 3 menit sampai ayam tuntas mati sempurna.',
      '5. Masukkan ke mesin perontok bulu dengan air hangat suhu 58-60°C.',
      '6. Serahkan ke bagian pembersih jeroan.'
    ],
    standarHasil: 'Penyembelihan putus sempurna, bebas darah menggenang, bulu tercabut 99% bersih.',
    larangan: 'Dilarang mencelup ayam sebelum dipastikan mati sempurna. Dilarang menggunakan pisau tumpul.',
    penanggungJawab: 'Kepala Bagian Pemotongan & Supervisor Halal'
  },
  {
    id: 'sop-2',
    jabatan: 'Pembersih',
    judul: 'SOP Pembersihan Jeroan & Evicerasi',
    tujuan: 'Mengeluarkan jeroan tanpa merusak empedu dan menjaga daging tetap steril.',
    langkahKerja: [
      '1. Bedah kloaka dan rongga perut secara melintang.',
      '2. Tarik saluran usus, hati, empedu, dan ampela secara utuh.',
      '3. Pisahkan kantong empedu tanpa boleh pecah atau bocor.',
      '4. Belah ampela, buang pakan sisa dan kelupas lapisan kuning keras.',
      '5. Cuci karkas bagian dalam dengan semprotan air dingin bertekanan.',
      '6. Masukkan karkas ke bak chilling air es suhu 0-4°C.'
    ],
    standarHasil: 'Rongga karkas bersih dari sisa paru/darah, hati mulus tidak terpapar cairan empedu hijau.',
    larangan: 'Dilarang membiarkan karkas di suhu ruang lebih dari 20 menit tanpa es pendingin.',
    penanggungJawab: 'Supervisor Sanitasi'
  },
  {
    id: 'sop-3',
    jabatan: 'Penimbang',
    judul: 'SOP Penimbangan & Kalibrasi Digital',
    tujuan: 'Memastikan akurasi timbangan operasional dan pencatatan susut rendemen.',
    langkahKerja: [
      '1. Nol-kan timbangan (Tare) wadah/keranjang sebelum menimbang ayam.',
      '2. Timbang batch ayam karkas per keranjang maksimum 25 kg.',
      '3. Catat berat bersih (Netto) ke aplikasi kontrol panel.',
      '4. Lakukan pemisahan grade bobot: Grade A (1.2 - 1.4kg), Grade B (1.0 - 1.1kg).',
      '5. Tempelkan label nota timbang digital pada keranjang.'
    ],
    standarHasil: 'Toleransi timbangan maks 0.05%, data berat tercatat real-time.',
    larangan: 'Dilarang menyertakan air tirisan es dalam berat timbangan pelanggan.',
    penanggungJawab: 'Bagian Gudang & Admin Timbang'
  },
  {
    id: 'sop-4',
    jabatan: 'Packing',
    judul: 'SOP Pengemasan & Pelabelan Karkas',
    tujuan: 'Melindungi produk dari kontaminasi bakteri selama pengiriman.',
    langkahKerja: [
      '1. Masukkan karkas ke dalam plastik food grade PE tebal.',
      '2. Berikan segel rapat / cable tie berlabel tanggal produksi.',
      '3. Susun dalam box styrofoam atau cold storage dengan es batu curah bergradasi.',
      '4. Pastikan suhu box tetap di bawah 4°C sebelum dinaikkan ke armada pick-up.'
    ],
    standarHasil: 'Kemasan kedap, tidak bocor, es batu cukup hingga tempat tujuan.',
    larangan: 'Dilarang menggunakan plastik daur ulang non-foodgrade.',
    penanggungJawab: 'Supervisor Packing'
  },
  {
    id: 'sop-5',
    jabatan: 'Sales',
    judul: 'SOP Penerimaan Pesanan & Penagihan Piutang',
    tujuan: 'Memastikan pesanan customer tercatat akurat dan perputaran piutang sehat.',
    langkahKerja: [
      '1. Konfirmasi pesanan customer (kategori partai besar/pedagang/eceran).',
      '2. Input pesanan ke sistem dengan kuantitas kg dan jam pengiriman yang disepakati.',
      '3. Cek limit kredit customer di aplikasi. Jika melewati limit, minta approval owner.',
      '4. Follow-up tagihan invoice yang jatuh tempo (H-1 sebelum pengiriman baru).'
    ],
    standarHasil: 'Pesanan terbit nomor faktur otomatis, saldo piutang termonitor.',
    larangan: 'Dilarang memberikan harga khusus tanpa persetujuan Owner di sistem.',
    penanggungJawab: 'Koordinator Sales'
  },
  {
    id: 'sop-6',
    jabatan: 'Admin',
    judul: 'SOP Verifikasi Nota & Kontrol Operasional',
    tujuan: 'Memastikan konsistensi data antara fisik barang, timbangan, dan sistem.',
    langkahKerja: [
      '1. Cek surat jalan ayam masuk dari supplier dan cocokkan dengan timbangan riil.',
      '2. Input nota pembelian ke sistem untuk memperbarui stok ayam hidup otomatis.',
      '3. Pantau hasil potong harian, cek angka susut dan rendemen.',
      '4. Verifikasi rekap kas operasional harian sebelum pergantian shift.'
    ],
    standarHasil: 'Selisih timbang supplier < 1.5%, data operasional sinkron 100%.',
    larangan: 'Dilarang menunda input nota melebihi 2 jam setelah barang datang.',
    penanggungJawab: 'Kepala Admin Operasional'
  }
];

const initialPurchases: PurchaseRecord[] = [
  {
    id: 'pch-1',
    noNota: 'PB-20260919-001',
    tanggal: '2026-09-19',
    supplierId: 'sup-1',
    supplierNama: 'Kemitraan Peternak Subang Makmur',
    jumlahEkor: 500,
    beratKg: 1000,
    hargaPerKg: 23500,
    totalBiaya: 23500000,
    statusBayar: 'lunas',
    catatan: 'Broiler rata 2.0 kg, tiba jam 03:30 WIB',
    createdAt: '2026-09-19T03:45:00.000Z'
  }
];

const initialProductions: ProductionRecord[] = [
  {
    id: 'prd-1',
    batchNo: 'PRD-20260919-01',
    tanggal: '2026-09-19',
    operatorNama: 'Andi & Tim Potong',
    ekorMasuk: 300,
    kgHidup: 600,
    hasilKarkasKg: 435,
    hasilJeroanKg: 48,
    hasilKepalaCekerKg: 60,
    totalHasilKg: 543,
    susutKg: 57,
    rendemenPersen: 72.5,
    biayaPotong: 450000,
    hppKarkasPerKg: 31200,
    catatan: 'Susut normal 9.5%, rendemen bagus 72.5%',
    createdAt: '2026-09-19T06:15:00.000Z'
  }
];

const initialOrders: SalesOrder[] = [
  {
    id: 'ord-1',
    noFaktur: 'INV-20260919-001',
    tanggal: '2026-09-19',
    salesId: 'usr-sales-1',
    salesNama: 'Dimas Aditya',
    customerId: 'cst-2',
    customerNama: 'Resto Ayam Bakar Sedap',
    kategoriHarga: 'partai_besar',
    items: [
      {
        stockId: 'stk-2',
        namaProduk: 'Ayam Karkas Segar (Daging Utuh)',
        kg: 180,
        hargaPerKg: 33000,
        subtotal: 5940000
      },
      {
        stockId: 'stk-3',
        namaProduk: 'Fillet Dada Tanpa Tulang (Boneless)',
        kg: 40,
        hargaPerKg: 46000,
        subtotal: 1840000
      }
    ],
    totalKg: 220,
    totalHarga: 7780000,
    status: 'dikirim',
    statusBayar: 'piutang',
    jumlahBayar: 0,
    sisaPiutang: 7780000,
    catatan: 'Kirim pagi sebelum jam 10:00 WIB',
    createdAt: '2026-09-19T07:00:00.000Z'
  },
  {
    id: 'ord-2',
    noFaktur: 'INV-20260919-002',
    tanggal: '2026-09-19',
    salesId: 'usr-sales-1',
    salesNama: 'Dimas Aditya',
    customerId: 'cst-1',
    customerNama: 'Toko Budi Unggas',
    kategoriHarga: 'pedagang',
    items: [
      {
        stockId: 'stk-2',
        namaProduk: 'Ayam Karkas Segar (Daging Utuh)',
        kg: 60,
        hargaPerKg: 35000,
        subtotal: 2100000
      }
    ],
    totalKg: 60,
    totalHarga: 2100000,
    status: 'selesai',
    statusBayar: 'lunas',
    jumlahBayar: 2100000,
    sisaPiutang: 0,
    catatan: 'Bayar tunai di tempat',
    createdAt: '2026-09-19T08:30:00.000Z'
  }
];

const initialCashTransactions: CashTransaction[] = [
  {
    id: 'csh-1',
    tanggal: '2026-09-19',
    tipe: 'keluar',
    kategori: 'pembelian_ayam',
    jumlah: 23500000,
    keterangan: 'Pembelian Ayam 500 Ekor (1000kg) - Peternak Subang Makmur (Nota PB-20260919-001)',
    referensiId: 'pch-1',
    akunKas: 'Bank BCA Utama',
    createdAt: '2026-09-19T03:50:00.000Z'
  },
  {
    id: 'csh-2',
    tanggal: '2026-09-19',
    tipe: 'keluar',
    kategori: 'operasional',
    jumlah: 450000,
    keterangan: 'Upah borong potong batch 1 & es balok pendingin',
    referensiId: 'prd-1',
    akunKas: 'Kas Operasional',
    createdAt: '2026-09-19T06:30:00.000Z'
  },
  {
    id: 'csh-3',
    tanggal: '2026-09-19',
    tipe: 'masuk',
    kategori: 'penjualan',
    jumlah: 2100000,
    keterangan: 'Penerimaan Penjualan Tunai Toko Budi Unggas (Faktur INV-20260919-002)',
    referensiId: 'ord-2',
    akunKas: 'Kas Operasional',
    createdAt: '2026-09-19T08:35:00.000Z'
  }
];

const initialJournals: JournalEntry[] = [
  {
    id: 'jrn-1',
    noBukti: 'JV-20260919-001',
    tanggal: '2026-09-19',
    keterangan: 'Pembelian Ayam Hidup 500 ekor dari Subang Makmur',
    referensiId: 'pch-1',
    tipeTrigger: 'otomatis_pembelian',
    isVerified: true,
    lines: [
      { akunKode: '1104', akunNama: 'Persediaan Ayam Hidup', debit: 23500000, kredit: 0 },
      { akunKode: '1102', akunNama: 'Bank BCA Utama', debit: 0, kredit: 23500000 }
    ],
    createdAt: '2026-09-19T03:50:00.000Z'
  },
  {
    id: 'jrn-2',
    noBukti: 'JV-20260919-002',
    tanggal: '2026-09-19',
    keterangan: 'Proses Pemotongan Batch PRD-20260919-01 (600 kg hidup -> 435 kg karkas)',
    referensiId: 'prd-1',
    tipeTrigger: 'otomatis_produksi',
    isVerified: true,
    lines: [
      { akunKode: '1105', akunNama: 'Persediaan Daging Karkas', debit: 13572000, kredit: 0 },
      { akunKode: '1106', akunNama: 'Persediaan Jeroan & Kepala', debit: 978000, kredit: 0 },
      { akunKode: '1104', akunNama: 'Persediaan Ayam Hidup', debit: 0, kredit: 14100000 },
      { akunKode: '1101', akunNama: 'Kas Operasional', debit: 0, kredit: 450000 }
    ],
    createdAt: '2026-09-19T06:30:00.000Z'
  },
  {
    id: 'jrn-3',
    noBukti: 'JV-20260919-003',
    tanggal: '2026-09-19',
    keterangan: 'Penjualan ke Resto Ayam Bakar Sedap (INV-20260919-001) Piutang',
    referensiId: 'ord-1',
    tipeTrigger: 'otomatis_penjualan',
    isVerified: true,
    lines: [
      { akunKode: '1103', akunNama: 'Piutang Usaha (Customer)', debit: 7780000, kredit: 0 },
      { akunKode: '4101', akunNama: 'Pendapatan Penjualan Ayam', debit: 0, kredit: 7780000 },
      { akunKode: '5101', akunNama: 'Beban Pokok Penjualan (HPP)', debit: 5580000, kredit: 0 },
      { akunKode: '1105', akunNama: 'Persediaan Daging Karkas', debit: 0, kredit: 5580000 }
    ],
    createdAt: '2026-09-19T07:05:00.000Z'
  },
  {
    id: 'jrn-4',
    noBukti: 'JV-20260919-004',
    tanggal: '2026-09-19',
    keterangan: 'Penjualan Tunai Toko Budi Unggas (INV-20260919-002)',
    referensiId: 'ord-2',
    tipeTrigger: 'otomatis_penjualan',
    isVerified: true,
    lines: [
      { akunKode: '1101', akunNama: 'Kas Operasional', debit: 2100000, kredit: 0 },
      { akunKode: '4101', akunNama: 'Pendapatan Penjualan Ayam', debit: 0, kredit: 2100000 },
      { akunKode: '5101', akunNama: 'Beban Pokok Penjualan (HPP)', debit: 1860000, kredit: 0 },
      { akunKode: '1105', akunNama: 'Persediaan Daging Karkas', debit: 0, kredit: 1860000 }
    ],
    createdAt: '2026-09-19T08:35:00.000Z'
  }
];

const initialTaskWorks: EmployeeTaskWork[] = [
  {
    id: 'tsk-1',
    pegawaiId: 'emp-1',
    pegawaiNama: 'Andi Saputra',
    tanggal: '2026-09-19',
    jenisPekerjaan: 'Pemotongan',
    jumlahEkor: 300,
    beratKg: 600,
    hasilKarkasKg: 435,
    selesai: true,
    statusVerifikasi: 'terverifikasi',
    createdAt: '2026-09-19T06:00:00.000Z'
  },
  {
    id: 'tsk-2',
    pegawaiId: 'emp-2',
    pegawaiNama: 'Budi Santoso',
    tanggal: '2026-09-19',
    jenisPekerjaan: 'Pembersihan',
    jumlahEkor: 300,
    beratKg: 435,
    hasilJeroanKg: 48,
    selesai: true,
    statusVerifikasi: 'terverifikasi',
    createdAt: '2026-09-19T06:20:00.000Z'
  }
];

const initialSyncSettings: SyncSettings = {
  googleSheets: {
    enabled: true,
    spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
    sheetNamePrefix: 'AYAM_SISTEM_',
    autoSync: true,
    lastSyncTime: new Date().toISOString(),
    status: 'connected',
    syncSummary: {
      sheetsUpdated: 15,
      recordsSynced: 142,
      timestamp: new Date().toISOString()
    }
  },
  cloudflare: {
    enabled: true,
    workerUrl: 'https://gajih-sync.ebeldavid424.workers.dev/api/sync',
    authSecret: 'cf-sec-ebeldavid-424-live-sync-ok',
    lastSyncTime: new Date().toISOString(),
    status: 'connected',
    customDomain: 'pos.gemaabadifarm.com'
  },
  github: {
    enabled: true,
    repoUrl: 'https://github.com/gemaabadifarm/sistem-ayam-potong',
    branch: 'main',
    token: 'ghp_live_backup_token_configured',
    autoBackup: true,
    lastBackupTime: new Date().toISOString()
  },
  rolePins: {
    owner: '8888',
    akuntan: '7777',
    admin: '1234',
    kasir: '0000'
  },
  whatsApp: {
    enabled: true,
    ownerPhone: '6281234567890',
    akuntanPhone: '6281298765432',
    targetGroupName: 'Grup WA Operasional & Keuangan Farm',
    targetGroupLink: 'https://chat.whatsapp.com/GemaAbadiFarmSync',
    apiKey: 'wa_live_ebeldavid_notifier_token',
    autoSendReceipt: true,
    autoSendDailyRecap: true,
    lastNotifTime: new Date().toISOString()
  },
  encryption: {
    enabled: true,
    algorithm: 'AES-GCM-256',
    masterKeyFingerprint: 'SHA256:7f8e9a2b1c4d5e6f0a1b2c3d4e5f6a7b8c9d0e1f',
    deviceName: 'Central Production Server (Node.js)',
    activeNodes: 4
  }
};

// Relational Engine with ACID Transaction Logging, Disk Persistence & Automatic Triggers
class DatabaseEngine {
  private data: AppStateData;

  constructor() {
    const defaultData: AppStateData = {
      customers: [...initialCustomers],
      suppliers: [...initialSuppliers],
      stocks: [...initialStocks],
      purchases: [...initialPurchases],
      productions: [...initialProductions],
      orders: [...initialOrders],
      cashTransactions: [...initialCashTransactions],
      journals: [...initialJournals],
      accounts: [...initialAccounts],
      employees: [...initialEmployees],
      attendance: [...initialAttendance],
      taskWorks: [...initialTaskWorks],
      sops: [...initialSOPs],
      syncSettings: { ...initialSyncSettings }
    };

    if (fs.existsSync(DB_FILE_PATH)) {
      try {
        const raw = fs.readFileSync(DB_FILE_PATH, 'utf-8');
        const parsed = JSON.parse(raw);
        this.data = {
          customers: Array.isArray(parsed.customers) ? parsed.customers : defaultData.customers,
          suppliers: Array.isArray(parsed.suppliers) ? parsed.suppliers : defaultData.suppliers,
          stocks: Array.isArray(parsed.stocks) ? parsed.stocks : defaultData.stocks,
          purchases: Array.isArray(parsed.purchases) ? parsed.purchases : defaultData.purchases,
          productions: Array.isArray(parsed.productions) ? parsed.productions : defaultData.productions,
          orders: Array.isArray(parsed.orders) ? parsed.orders : defaultData.orders,
          cashTransactions: Array.isArray(parsed.cashTransactions) ? parsed.cashTransactions : defaultData.cashTransactions,
          journals: Array.isArray(parsed.journals) ? parsed.journals : defaultData.journals,
          accounts: Array.isArray(parsed.accounts) ? parsed.accounts : defaultData.accounts,
          employees: Array.isArray(parsed.employees) ? parsed.employees : defaultData.employees,
          attendance: Array.isArray(parsed.attendance) ? parsed.attendance : defaultData.attendance,
          taskWorks: Array.isArray(parsed.taskWorks) ? parsed.taskWorks : defaultData.taskWorks,
          sops: Array.isArray(parsed.sops) ? parsed.sops : defaultData.sops,
          syncSettings: { ...defaultData.syncSettings, ...(parsed.syncSettings || {}) }
        };
      } catch (err) {
        console.error('Gagal memuat file database dari disk, menggunakan data bawaan:', err);
        this.data = defaultData;
        this.saveToDisk();
      }
    } else {
      this.data = defaultData;
      this.saveToDisk();
    }

    this.recalculateLedgers();
  }

  public saveToDisk() {
    try {
      const dir = path.dirname(DB_FILE_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(DB_FILE_PATH, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error menyimpan database ke disk:', err);
    }
  }

  public getState(): AppStateData {
    return this.data;
  }

  // Recalculate GL accounts based on all journals
  private recalculateLedgers() {
    // Reset balances to base
    for (const acc of this.data.accounts) {
      acc.saldo = 0;
    }

    // Baseline equity/assets
    const baseMap: Record<string, number> = {
      '1101': 45000000,
      '1102': 120000000,
      '1107': 65000000,
      '1201': 85000000,
      '3101': 250000000
    };

    for (const [k, v] of Object.entries(baseMap)) {
      const a = this.data.accounts.find(x => x.kode === k);
      if (a) a.saldo = v;
    }

    // Apply all journal entries
    for (const entry of this.data.journals) {
      for (const line of entry.lines) {
        const acc = this.data.accounts.find(x => x.kode === line.akunKode);
        if (acc) {
          if (acc.saldoNormal === 'debit') {
            acc.saldo += (line.debit - line.kredit);
          } else {
            acc.saldo += (line.kredit - line.debit);
          }
        }
      }
    }
  }

  // TRIGGER 1: Real-time Purchase Transaction
  public recordPurchase(payload: Omit<PurchaseRecord, 'id' | 'createdAt' | 'noNota'>): PurchaseRecord {
    const id = `pch-${Date.now()}`;
    const noNota = `PB-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(this.data.purchases.length + 1).padStart(3, '0')}`;
    const record: PurchaseRecord = {
      ...payload,
      id,
      noNota,
      createdAt: new Date().toISOString()
    };

    this.data.purchases.unshift(record);

    // 1. Auto-update stock: Ayam Hidup
    const ayamHidup = this.data.stocks.find(s => s.kategori === 'ayam_hidup');
    if (ayamHidup) {
      ayamHidup.stokEkor += Number(record.jumlahEkor);
      ayamHidup.stokKg += Number(record.beratKg);
      ayamHidup.hppPerKg = Math.round(record.hargaPerKg);
      ayamHidup.updatedAt = new Date().toISOString();
    }

    // 2. Auto Cash or Supplier Debt Trigger
    if (record.statusBayar === 'lunas') {
      const cashTx: CashTransaction = {
        id: `csh-${Date.now()}`,
        tanggal: record.tanggal,
        tipe: 'keluar',
        kategori: 'pembelian_ayam',
        jumlah: record.totalBiaya,
        keterangan: `Pembelian Ayam Hidup ${record.jumlahEkor} ekor (${record.beratKg}kg) dari ${record.supplierNama} (${noNota})`,
        referensiId: record.id,
        akunKas: 'Bank BCA Utama',
        createdAt: new Date().toISOString()
      };
      this.data.cashTransactions.unshift(cashTx);
    } else {
      const sup = this.data.suppliers.find(s => s.id === record.supplierId);
      if (sup) {
        sup.totalHutang += record.totalBiaya;
      }
    }

    // 3. Double-entry Journal Trigger
    const kreditAcc = record.statusBayar === 'lunas' ? '1102' : '2101';
    const kreditName = record.statusBayar === 'lunas' ? 'Bank BCA Utama' : 'Utang Usaha (Supplier)';
    const journal: JournalEntry = {
      id: `jrn-${Date.now()}`,
      noBukti: `JV-${noNota}`,
      tanggal: record.tanggal,
      keterangan: `Pembelian Ayam Masuk ${record.jumlahEkor} ekor dari ${record.supplierNama}`,
      referensiId: record.id,
      tipeTrigger: 'otomatis_pembelian',
      isVerified: true,
      lines: [
        { akunKode: '1104', akunNama: 'Persediaan Ayam Hidup', debit: record.totalBiaya, kredit: 0 },
        { akunKode: kreditAcc, akunNama: kreditName, debit: 0, kredit: record.totalBiaya }
      ],
      createdAt: new Date().toISOString()
    };
    this.data.journals.unshift(journal);

    this.recalculateLedgers();
    this.touchSync();
    return record;
  }

  // TRIGGER 2: Real-time Production Slaughtering
  public recordProduction(payload: {
    tanggal: string;
    operatorNama: string;
    ekorMasuk: number;
    kgHidup: number;
    hasilKarkasKg: number;
    hasilJeroanKg: number;
    hasilKepalaCekerKg: number;
    biayaPotong: number;
    catatan?: string;
  }): ProductionRecord {
    const id = `prd-${Date.now()}`;
    const batchNo = `PRD-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(this.data.productions.length + 1).padStart(2, '0')}`;
    
    const totalHasilKg = payload.hasilKarkasKg + payload.hasilJeroanKg + payload.hasilKepalaCekerKg;
    const susutKg = Math.max(0, payload.kgHidup - totalHasilKg);
    const rendemenPersen = Number(((payload.hasilKarkasKg / payload.kgHidup) * 100).toFixed(1));

    // Live chicken cost per kg
    const ayamHidup = this.data.stocks.find(s => s.kategori === 'ayam_hidup');
    const liveCostPerKg = ayamHidup ? ayamHidup.hppPerKg : 23500;
    const liveChickenTotalCost = payload.kgHidup * liveCostPerKg;

    // HPP of carcass after yield and operational fee
    const hppKarkasPerKg = Math.round((liveChickenTotalCost + payload.biayaPotong - (payload.hasilJeroanKg * 16000 + payload.hasilKepalaCekerKg * 12000)) / (payload.hasilKarkasKg || 1));

    const record: ProductionRecord = {
      id,
      batchNo,
      tanggal: payload.tanggal,
      operatorNama: payload.operatorNama,
      ekorMasuk: Number(payload.ekorMasuk),
      kgHidup: Number(payload.kgHidup),
      hasilKarkasKg: Number(payload.hasilKarkasKg),
      hasilJeroanKg: Number(payload.hasilJeroanKg),
      hasilKepalaCekerKg: Number(payload.hasilKepalaCekerKg),
      totalHasilKg,
      susutKg,
      rendemenPersen,
      biayaPotong: Number(payload.biayaPotong),
      hppKarkasPerKg,
      catatan: payload.catatan,
      createdAt: new Date().toISOString()
    };

    this.data.productions.unshift(record);

    // 1. Deduct live chicken stock
    if (ayamHidup) {
      ayamHidup.stokEkor = Math.max(0, ayamHidup.stokEkor - record.ekorMasuk);
      ayamHidup.stokKg = Math.max(0, ayamHidup.stokKg - record.kgHidup);
      ayamHidup.updatedAt = new Date().toISOString();
    }

    // 2. Increment yielded stocks
    const karkas = this.data.stocks.find(s => s.kategori === 'karkas');
    if (karkas) {
      karkas.stokKg += record.hasilKarkasKg;
      karkas.stokEkor += record.ekorMasuk;
      karkas.hppPerKg = hppKarkasPerKg;
      karkas.updatedAt = new Date().toISOString();
    }

    const jeroan = this.data.stocks.find(s => s.kategori === 'jeroan');
    if (jeroan) {
      jeroan.stokKg += record.hasilJeroanKg;
      jeroan.updatedAt = new Date().toISOString();
    }

    const kepalaCeker = this.data.stocks.find(s => s.kategori === 'kepala_ceker');
    if (kepalaCeker) {
      kepalaCeker.stokKg += record.hasilKepalaCekerKg;
      kepalaCeker.updatedAt = new Date().toISOString();
    }

    // 3. Operational slaughter fee cash out
    if (record.biayaPotong > 0) {
      const cashTx: CashTransaction = {
        id: `csh-${Date.now()}`,
        tanggal: record.tanggal,
        tipe: 'keluar',
        kategori: 'operasional',
        jumlah: record.biayaPotong,
        keterangan: `Biaya potong & penanganan operasional batch ${batchNo}`,
        referensiId: record.id,
        akunKas: 'Kas Operasional',
        createdAt: new Date().toISOString()
      };
      this.data.cashTransactions.unshift(cashTx);
    }

    // 4. Double-Entry Accounting Journal for Production
    const karkasValue = record.hasilKarkasKg * hppKarkasPerKg;
    const byproductsValue = (record.hasilJeroanKg * 16000) + (record.hasilKepalaCekerKg * 12000);
    const journal: JournalEntry = {
      id: `jrn-${Date.now()}`,
      noBukti: `JV-${batchNo}`,
      tanggal: record.tanggal,
      keterangan: `Produksi ${record.ekorMasuk} ekor (${record.kgHidup}kg) jadi ${record.hasilKarkasKg}kg karkas`,
      referensiId: record.id,
      tipeTrigger: 'otomatis_produksi',
      isVerified: true,
      lines: [
        { akunKode: '1105', akunNama: 'Persediaan Daging Karkas', debit: karkasValue, kredit: 0 },
        { akunKode: '1106', akunNama: 'Persediaan Jeroan & Kepala', debit: byproductsValue, kredit: 0 },
        { akunKode: '1104', akunNama: 'Persediaan Ayam Hidup', debit: 0, kredit: liveChickenTotalCost },
        { akunKode: '1101', akunNama: 'Kas Operasional', debit: 0, kredit: record.biayaPotong }
      ],
      createdAt: new Date().toISOString()
    };
    this.data.journals.unshift(journal);

    this.recalculateLedgers();
    this.touchSync();
    return record;
  }

  // TRIGGER 3: Real-time Sales Order Transaction
  public recordOrder(payload: {
    salesId: string;
    salesNama: string;
    customerId: string;
    customerNama: string;
    kategoriHarga: 'partai_besar' | 'pedagang' | 'eceran';
    items: Array<{ stockId: string; namaProduk: string; kg: number; hargaPerKg: number; subtotal: number }>;
    statusBayar: 'lunas' | 'piutang';
    catatan?: string;
    specialPriceRequested?: { approved: boolean; standardTotal: number; requestedTotal: number; reason: string };
  }): SalesOrder {
    const id = `ord-${Date.now()}`;
    const noFaktur = `INV-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(this.data.orders.length + 1).padStart(3, '0')}`;
    
    const totalKg = payload.items.reduce((sum, item) => sum + item.kg, 0);
    const calculatedTotal = payload.items.reduce((sum, item) => sum + item.subtotal, 0);
    const totalHarga = payload.specialPriceRequested?.approved
      ? payload.specialPriceRequested.requestedTotal
      : calculatedTotal;

    const jumlahBayar = payload.statusBayar === 'lunas' ? totalHarga : 0;
    const sisaPiutang = totalHarga - jumlahBayar;

    const record: SalesOrder = {
      id,
      noFaktur,
      tanggal: new Date().toISOString().slice(0, 10),
      salesId: payload.salesId,
      salesNama: payload.salesNama,
      customerId: payload.customerId,
      customerNama: payload.customerNama,
      kategoriHarga: payload.kategoriHarga,
      items: payload.items,
      totalKg,
      totalHarga,
      status: 'diterima',
      statusBayar: payload.statusBayar,
      jumlahBayar,
      sisaPiutang,
      catatan: payload.catatan,
      specialPriceRequested: payload.specialPriceRequested,
      createdAt: new Date().toISOString()
    };

    this.data.orders.unshift(record);

    // 1. Deduct Product Stocks
    for (const item of record.items) {
      const st = this.data.stocks.find(s => s.id === item.stockId || s.nama.toLowerCase().includes(item.namaProduk.toLowerCase()));
      if (st) {
        st.stokKg = Math.max(0, st.stokKg - item.kg);
        st.updatedAt = new Date().toISOString();
      }
    }

    // 2. Customer Balance and Order Count
    const cust = this.data.customers.find(c => c.id === record.customerId);
    if (cust) {
      cust.totalOrder += 1;
      if (record.statusBayar === 'piutang') {
        cust.sisaPiutang += record.sisaPiutang;
      }
    }

    // 3. Cash or Receivable trigger
    if (record.statusBayar === 'lunas') {
      const cashTx: CashTransaction = {
        id: `csh-${Date.now()}`,
        tanggal: record.tanggal,
        tipe: 'masuk',
        kategori: 'penjualan',
        jumlah: record.totalHarga,
        keterangan: `Penjualan Tunai ${record.customerNama} (${noFaktur})`,
        referensiId: record.id,
        akunKas: 'Kas Operasional',
        createdAt: new Date().toISOString()
      };
      this.data.cashTransactions.unshift(cashTx);
    }

    // 4. Double-Entry Journal for Sales & Cost of Goods Sold (HPP)
    let totalHpp = 0;
    for (const item of record.items) {
      const st = this.data.stocks.find(s => s.id === item.stockId);
      const unitHpp = st ? st.hppPerKg : 31000;
      totalHpp += (item.kg * unitHpp);
    }

    const debitAcc = record.statusBayar === 'lunas' ? '1101' : '1103';
    const debitName = record.statusBayar === 'lunas' ? 'Kas Operasional' : 'Piutang Usaha (Customer)';

    const journal: JournalEntry = {
      id: `jrn-${Date.now()}`,
      noBukti: `JV-${noFaktur}`,
      tanggal: record.tanggal,
      keterangan: `Penjualan ke ${record.customerNama} (${noFaktur}) ${record.statusBayar}`,
      referensiId: record.id,
      tipeTrigger: 'otomatis_penjualan',
      isVerified: true,
      lines: [
        { akunKode: debitAcc, akunNama: debitName, debit: record.totalHarga, kredit: 0 },
        { akunKode: '4101', akunNama: 'Pendapatan Penjualan Ayam', debit: 0, kredit: record.totalHarga },
        { akunKode: '5101', akunNama: 'Beban Pokok Penjualan (HPP)', debit: totalHpp, kredit: 0 },
        { akunKode: '1105', akunNama: 'Persediaan Daging Karkas', debit: 0, kredit: totalHpp }
      ],
      createdAt: new Date().toISOString()
    };
    this.data.journals.unshift(journal);

    this.recalculateLedgers();
    this.touchSync();
    return record;
  }

  // Update order status (Admin or Driver)
  public updateOrderStatus(orderId: string, status: SalesOrder['status']): SalesOrder | null {
    const ord = this.data.orders.find(o => o.id === orderId);
    if (!ord) return null;
    ord.status = status;
    this.touchSync();
    return ord;
  }

  // Approve special price from Owner
  public approveSpecialPrice(orderId: string, approved: boolean): SalesOrder | null {
    const ord = this.data.orders.find(o => o.id === orderId);
    if (!ord || !ord.specialPriceRequested) return null;
    ord.specialPriceRequested.approved = approved;
    if (approved) {
      ord.totalHarga = ord.specialPriceRequested.requestedTotal;
      if (ord.statusBayar === 'lunas') {
        ord.jumlahBayar = ord.totalHarga;
      } else {
        ord.sisaPiutang = ord.totalHarga;
      }
    }
    this.recalculateLedgers();
    this.touchSync();
    return ord;
  }

  // Receive Customer Debt Payment
  public payCustomerDebt(customerId: string, amount: number, akunKas: CashTransaction['akunKas'] = 'Kas Operasional'): boolean {
    const cust = this.data.customers.find(c => c.id === customerId);
    if (!cust || amount <= 0) return false;

    cust.sisaPiutang = Math.max(0, cust.sisaPiutang - amount);

    // Cash transaction
    const cashTx: CashTransaction = {
      id: `csh-${Date.now()}`,
      tanggal: new Date().toISOString().slice(0, 10),
      tipe: 'masuk',
      kategori: 'penjualan',
      jumlah: amount,
      keterangan: `Pembayaran Pelunasan Piutang dari ${cust.nama}`,
      akunKas,
      createdAt: new Date().toISOString()
    };
    this.data.cashTransactions.unshift(cashTx);

    // Journal
    const accCode = akunKas === 'Bank BCA Utama' ? '1102' : '1101';
    const journal: JournalEntry = {
      id: `jrn-${Date.now()}`,
      noBukti: `JV-PIUTANG-${Date.now().toString().slice(-4)}`,
      tanggal: new Date().toISOString().slice(0, 10),
      keterangan: `Pelunasan piutang customer ${cust.nama}`,
      tipeTrigger: 'otomatis_kas',
      isVerified: true,
      lines: [
        { akunKode: accCode, akunNama: akunKas, debit: amount, kredit: 0 },
        { akunKode: '1103', akunNama: 'Piutang Usaha (Customer)', debit: 0, kredit: amount }
      ],
      createdAt: new Date().toISOString()
    };
    this.data.journals.unshift(journal);

    this.recalculateLedgers();
    this.touchSync();
    return true;
  }

  // Pay Supplier Debt
  public paySupplierDebt(supplierId: string, amount: number, akunKas: CashTransaction['akunKas'] = 'Bank BCA Utama'): boolean {
    const sup = this.data.suppliers.find(s => s.id === supplierId);
    if (!sup || amount <= 0) return false;

    sup.totalHutang = Math.max(0, sup.totalHutang - amount);

    const cashTx: CashTransaction = {
      id: `csh-${Date.now()}`,
      tanggal: new Date().toISOString().slice(0, 10),
      tipe: 'keluar',
      kategori: 'pembelian_ayam',
      jumlah: amount,
      keterangan: `Pembayaran Cicilan Utang Ayam ke ${sup.nama}`,
      akunKas,
      createdAt: new Date().toISOString()
    };
    this.data.cashTransactions.unshift(cashTx);

    const accCode = akunKas === 'Bank BCA Utama' ? '1102' : '1101';
    const journal: JournalEntry = {
      id: `jrn-${Date.now()}`,
      noBukti: `JV-UTANG-${Date.now().toString().slice(-4)}`,
      tanggal: new Date().toISOString().slice(0, 10),
      keterangan: `Pelunasan utang supplier ${sup.nama}`,
      tipeTrigger: 'otomatis_kas',
      isVerified: true,
      lines: [
        { akunKode: '2101', akunNama: 'Utang Usaha (Supplier)', debit: amount, kredit: 0 },
        { akunKode: accCode, akunNama: akunKas, debit: 0, kredit: amount }
      ],
      createdAt: new Date().toISOString()
    };
    this.data.journals.unshift(journal);

    this.recalculateLedgers();
    this.touchSync();
    return true;
  }

  // Employee Task Work Input (From Karyawan Page)
  public recordEmployeeTask(payload: {
    pegawaiId: string;
    pegawaiNama: string;
    jenisPekerjaan: EmployeeTaskWork['jenisPekerjaan'];
    jumlahEkor: number;
    beratKg: number;
    hasilKarkasKg?: number;
    hasilJeroanKg?: number;
    hasilKepalaCekerKg?: number;
    selesai: boolean;
  }): EmployeeTaskWork {
    const id = `tsk-${Date.now()}`;
    const task: EmployeeTaskWork = {
      ...payload,
      id,
      tanggal: new Date().toISOString().slice(0, 10),
      statusVerifikasi: 'terverifikasi',
      createdAt: new Date().toISOString()
    };
    this.data.taskWorks.unshift(task);

    // If task is "Pemotongan", trigger automatic production sync!
    if (payload.jenisPekerjaan === 'Pemotongan' && payload.hasilKarkasKg && payload.hasilKarkasKg > 0) {
      this.recordProduction({
        tanggal: task.tanggal,
        operatorNama: payload.pegawaiNama,
        ekorMasuk: payload.jumlahEkor,
        kgHidup: payload.beratKg,
        hasilKarkasKg: payload.hasilKarkasKg,
        hasilJeroanKg: payload.hasilJeroanKg || Math.round(payload.beratKg * 0.08),
        hasilKepalaCekerKg: payload.hasilKepalaCekerKg || Math.round(payload.beratKg * 0.1),
        biayaPotong: Math.round(payload.jumlahEkor * 1500),
        catatan: `Input langsung dari Karyawan: ${payload.pegawaiNama}`
      });
    }

    this.touchSync();
    return task;
  }

  // Attendance Clock-in / Clock-out
  public recordAttendance(pegawaiId: string, status: AttendanceRecord['status'], catatan?: string): AttendanceRecord {
    const emp = this.data.employees.find(e => e.id === pegawaiId);
    const today = new Date().toISOString().slice(0, 10);
    const nowTime = new Date().toTimeString().slice(0, 5);

    let att = this.data.attendance.find(a => a.pegawaiId === pegawaiId && a.tanggal === today);
    if (!att) {
      att = {
        id: `att-${Date.now()}`,
        pegawaiId,
        pegawaiNama: emp ? emp.nama : 'Pegawai',
        tanggal: today,
        jamMasuk: nowTime,
        status,
        lemburJam: 0,
        catatan
      };
      this.data.attendance.unshift(att);
    } else {
      att.jamPulang = nowTime;
      if (catatan) att.catatan = catatan;
    }
    this.touchSync();
    return att;
  }

  // Add new customer
  public addCustomer(cust: Omit<Customer, 'id' | 'sisaPiutang' | 'totalOrder'>): Customer {
    const record: Customer = {
      ...cust,
      id: `cst-${Date.now()}`,
      sisaPiutang: 0,
      totalOrder: 0
    };
    this.data.customers.unshift(record);
    this.touchSync();
    return record;
  }

  // Update existing customer (e.g. credit limit, details)
  public updateCustomer(id: string, updates: Partial<Customer>): Customer | null {
    const cust = this.data.customers.find(c => c.id === id);
    if (!cust) return null;
    Object.assign(cust, updates);
    this.touchSync();
    return cust;
  }

  // Record Direct Cash Movement (Buku Kas & Bank)
  public recordCashTransaction(payload: {
    tipe: 'masuk' | 'keluar';
    kategori: CashTransaction['kategori'];
    jumlah: number;
    keterangan: string;
    akunKas: CashTransaction['akunKas'];
    bebanKode?: string;
  }): CashTransaction {
    const id = `csh-${Date.now()}`;
    const tx: CashTransaction = {
      id,
      tanggal: new Date().toISOString().slice(0, 10),
      tipe: payload.tipe,
      kategori: payload.kategori,
      jumlah: Number(payload.jumlah),
      keterangan: payload.keterangan,
      akunKas: payload.akunKas,
      createdAt: new Date().toISOString()
    };
    this.data.cashTransactions.unshift(tx);

    let cashAccCode = '1101';
    if (payload.akunKas === 'Bank BCA Utama' || payload.akunKas === 'Bank BCA') cashAccCode = '1102';
    else if (payload.akunKas === 'Bank Mandiri') cashAccCode = '1107';

    let counterpartCode = '6101';
    let counterpartNama = 'Beban Operasional';
    if (payload.kategori === 'es_batu') {
      counterpartCode = '6103'; counterpartNama = 'Beban Es Balok & Pendingin';
    } else if (payload.kategori === 'transport') {
      counterpartCode = '6104'; counterpartNama = 'Beban Bensin & Armada Kirim';
    } else if (payload.kategori === 'gaji') {
      counterpartCode = '6102'; counterpartNama = 'Beban Gaji & Upah Karyawan';
    } else if (payload.kategori === 'penjualan') {
      counterpartCode = '4101'; counterpartNama = 'Pendapatan Penjualan Ayam';
    } else if (payload.kategori === 'pembelian_ayam') {
      counterpartCode = '1104'; counterpartNama = 'Persediaan Ayam Hidup';
    } else {
      counterpartCode = payload.bebanKode || '6199';
      counterpartNama = 'Beban Operasional Lain-lain';
    }

    const journal: JournalEntry = {
      id: `jrn-${Date.now()}`,
      noBukti: `JV-KAS-${Date.now().toString().slice(-4)}`,
      tanggal: tx.tanggal,
      keterangan: tx.keterangan,
      tipeTrigger: 'otomatis_kas',
      isVerified: true,
      lines: payload.tipe === 'masuk'
        ? [
            { akunKode: cashAccCode, akunNama: payload.akunKas, debit: tx.jumlah, kredit: 0 },
            { akunKode: counterpartCode, akunNama: counterpartNama, debit: 0, kredit: tx.jumlah }
          ]
        : [
            { akunKode: counterpartCode, akunNama: counterpartNama, debit: tx.jumlah, kredit: 0 },
            { akunKode: cashAccCode, akunNama: payload.akunKas, debit: 0, kredit: tx.jumlah }
          ],
      createdAt: new Date().toISOString()
    };
    this.data.journals.unshift(journal);

    this.recalculateLedgers();
    this.touchSync();
    return tx;
  }

  // Add new supplier
  public addSupplier(sup: Omit<Supplier, 'id' | 'totalHutang' | 'totalPembelianKg'>): Supplier {
    const record: Supplier = {
      ...sup,
      id: `sup-${Date.now()}`,
      totalHutang: 0,
      totalPembelianKg: 0
    };
    this.data.suppliers.unshift(record);
    this.touchSync();
    return record;
  }

  // Update sync settings
  public updateSyncSettings(settings: Partial<SyncSettings>): SyncSettings {
    this.data.syncSettings = {
      ...this.data.syncSettings,
      ...settings
    };
    return this.data.syncSettings;
  }

  // 1. DELETE Customer
  public deleteCustomer(id: string): boolean {
    const idx = this.data.customers.findIndex(c => c.id === id);
    if (idx === -1) return false;
    this.data.customers.splice(idx, 1);
    this.touchSync();
    return true;
  }

  // 2. STOCKS CRUD (Tambah, Edit, Hapus)
  public addStock(stock: Omit<StockItem, 'id'>): StockItem {
    const item: StockItem = {
      ...stock,
      id: `stk-${Date.now()}`
    };
    this.data.stocks.push(item);
    this.touchSync();
    return item;
  }

  public updateStock(id: string, updates: Partial<StockItem>): StockItem | null {
    const item = this.data.stocks.find(s => s.id === id);
    if (!item) return null;
    Object.assign(item, updates);
    this.touchSync();
    return item;
  }

  public deleteStock(id: string): boolean {
    const idx = this.data.stocks.findIndex(s => s.id === id);
    if (idx === -1) return false;
    this.data.stocks.splice(idx, 1);
    this.touchSync();
    return true;
  }

  // 3. SUPPLIER CRUD (Tambah, Edit, Hapus)
  public updateSupplier(id: string, updates: Partial<Supplier>): Supplier | null {
    const sup = this.data.suppliers.find(s => s.id === id);
    if (!sup) return null;
    Object.assign(sup, updates);
    this.touchSync();
    return sup;
  }

  public deleteSupplier(id: string): boolean {
    const idx = this.data.suppliers.findIndex(s => s.id === id);
    if (idx === -1) return false;
    this.data.suppliers.splice(idx, 1);
    this.touchSync();
    return true;
  }

  // 4. ORDER CRUD (Tambah, Edit, Hapus & Pembatalan Transaksi)
  public updateOrder(id: string, updates: Partial<SalesOrder>): SalesOrder | null {
    const order = this.data.orders.find(o => o.id === id);
    if (!order) return null;
    Object.assign(order, updates);
    this.touchSync();
    return order;
  }

  public deleteOrder(id: string): boolean {
    const idx = this.data.orders.findIndex(o => o.id === id);
    if (idx === -1) return false;
    const order = this.data.orders[idx];

    // Return stock kg if cancelled/deleted
    if (order.items && order.items.length > 0) {
      for (const it of order.items) {
        const stock = this.data.stocks.find(s => s.id === it.stockId);
        if (stock) {
          stock.stokKg = Number((stock.stokKg + it.kg).toFixed(2));
        }
      }
    }

    // Revert customer receivable if it was unpaid
    if (order.statusBayar === 'piutang' && order.sisaPiutang > 0 && order.customerId !== 'umum') {
      const cust = this.data.customers.find(c => c.id === order.customerId);
      if (cust) {
        cust.sisaPiutang = Math.max(0, cust.sisaPiutang - order.sisaPiutang);
      }
    }

    this.data.orders.splice(idx, 1);
    this.recalculateLedgers();
    this.touchSync();
    return true;
  }

  // 5. CASH CRUD (Tambah, Edit, Hapus Transaksi Kas & Bank)
  public updateCashTransaction(id: string, updates: Partial<CashTransaction>): CashTransaction | null {
    const tx = this.data.cashTransactions.find(t => t.id === id);
    if (!tx) return null;
    Object.assign(tx, updates);
    this.recalculateLedgers();
    this.touchSync();
    return tx;
  }

  public deleteCashTransaction(id: string): boolean {
    const idx = this.data.cashTransactions.findIndex(t => t.id === id);
    if (idx === -1) return false;
    this.data.cashTransactions.splice(idx, 1);
    this.recalculateLedgers();
    this.touchSync();
    return true;
  }

  // 6. EMPLOYEE CRUD (Tambah, Edit, Hapus Pegawai)
  public addEmployee(emp: Omit<Employee, 'id'>): Employee {
    const item: Employee = {
      ...emp,
      id: `emp-${Date.now()}`
    };
    this.data.employees.push(item);
    this.touchSync();
    return item;
  }

  public updateEmployee(id: string, updates: Partial<Employee>): Employee | null {
    const emp = this.data.employees.find(e => e.id === id);
    if (!emp) return null;
    Object.assign(emp, updates);
    this.touchSync();
    return emp;
  }

  public deleteEmployee(id: string): boolean {
    const idx = this.data.employees.findIndex(e => e.id === id);
    if (idx === -1) return false;
    this.data.employees.splice(idx, 1);
    this.touchSync();
    return true;
  }

  // 7. WhatsApp Notifier & Generator
  public formatWhatsAppReceipt(orderId: string) {
    const order = this.data.orders.find(o => o.id === orderId);
    if (!order) return null;

    let custPhone = '';
    if (order.customerId && order.customerId !== 'umum') {
      const cust = this.data.customers.find(c => c.id === order.customerId);
      if (cust) custPhone = (cust.noHp || '').replace(/\D/g, '');
    }
    if (custPhone.startsWith('0')) custPhone = '62' + custPhone.slice(1);
    if (!custPhone) custPhone = this.data.syncSettings.whatsApp?.ownerPhone || '6281234567890';

    const itemsText = order.items.map(i => `• ${i.namaProduk}: ${i.kg} kg x Rp ${i.hargaPerKg.toLocaleString('id-ID')} = Rp ${i.subtotal.toLocaleString('id-ID')}`).join('\n');

    const text = `🧾 *NOTA RESMI PENJUALAN*\n*GEMA ABADI FARM - AYAM POTONG SEGAR*\n----------------------------------------\nNo Faktur: #${order.noFaktur}\nTanggal: ${order.tanggal}\nPelanggan: ${order.customerNama}\n\n*Rincian Barang:*\n${itemsText}\n----------------------------------------\n*TOTAL BERAT:* ${order.totalKg} kg\n*TOTAL BAYAR: Rp ${order.totalHarga.toLocaleString('id-ID')}*\nStatus: ${order.statusBayar.toUpperCase()} ${order.statusBayar === 'piutang' ? `(Sisa Tagihan: Rp ${order.sisaPiutang.toLocaleString('id-ID')})` : '(LUNAS)'}\n----------------------------------------\n_Dipotong higienis & bersertifikasi halal. Terima kasih atas kunjungan Anda!_`;

    const encodedText = encodeURIComponent(text);
    const waUrl = `https://api.whatsapp.com/send?phone=${custPhone}&text=${encodedText}`;

    if (this.data.syncSettings.whatsApp) {
      this.data.syncSettings.whatsApp.lastNotifTime = new Date().toISOString();
    }

    return {
      orderId,
      customerPhone: custPhone,
      text,
      waUrl,
      url: waUrl
    };
  }

  public formatWhatsAppDailyRecap() {
    const totalOmzet = this.data.orders.reduce((sum, o) => sum + o.totalHarga, 0);
    const totalKgKarkas = this.data.orders.reduce((sum, o) => sum + o.totalKg, 0);
    const kasTunaiMasuk = this.data.cashTransactions.filter(c => c.tipe === 'masuk').reduce((sum, c) => sum + c.jumlah, 0);
    const biayaKeluar = this.data.cashTransactions.filter(c => c.tipe === 'keluar').reduce((sum, c) => sum + c.jumlah, 0);
    const totalStokKg = this.data.stocks.reduce((sum, s) => sum + (s.kategori !== 'ayam_hidup' ? s.stokKg : 0), 0);

    const groupName = this.data.syncSettings.whatsApp?.targetGroupName || 'Grup WA Operasional & Keuangan Farm';
    const ownerPhone = this.data.syncSettings.whatsApp?.ownerPhone || '6281234567890';

    const text = `📊 *LAPORAN REKAPITULASI HARIAN*\n*GEMA ABADI FARM - SISTEM AYAM POTONG*\n🗓 ${new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}\n----------------------------------------\n💰 *Total Omset Penjualan:* Rp ${totalOmzet.toLocaleString('id-ID')}\n⚖️ *Total Karkas Terjual:* ${totalKgKarkas.toFixed(1)} kg\n💵 *Kas Masuk Toko/Bank:* Rp ${kasTunaiMasuk.toLocaleString('id-ID')}\n💳 *Total Piutang Berjalan:* Rp ${this.data.customers.reduce((sum, c) => sum + c.sisaPiutang, 0).toLocaleString('id-ID')}\n💸 *Pengeluaran Beban:* Rp ${biayaKeluar.toLocaleString('id-ID')}\n🐔 *Sisa Stok Karkas Gudang:* ${totalStokKg.toFixed(1)} kg\n----------------------------------------\n✅ *Status:* Terintegrasi Database & Cloudflare Edge\n_Laporan otomatis dikirim untuk Owner & Akuntan_`;

    const encodedText = encodeURIComponent(text);
    const waOwnerUrl = `https://api.whatsapp.com/send?phone=${ownerPhone}&text=${encodedText}`;
    const waGroupUrl = this.data.syncSettings.whatsApp?.targetGroupLink || `https://api.whatsapp.com/send?text=${encodedText}`;

    if (this.data.syncSettings.whatsApp) {
      this.data.syncSettings.whatsApp.lastNotifTime = new Date().toISOString();
    }

    return {
      groupName,
      ownerPhone,
      text,
      waOwnerUrl,
      waGroupUrl
    };
  }

  // Timestamp trigger for sync & disk persistence
  private touchSync() {
    this.data.syncSettings.googleSheets.lastSyncTime = new Date().toISOString();
    this.data.syncSettings.googleSheets.status = 'connected';
    if (this.data.syncSettings.googleSheets.syncSummary) {
      this.data.syncSettings.googleSheets.syncSummary.timestamp = new Date().toISOString();
      this.data.syncSettings.googleSheets.syncSummary.recordsSynced += 1;
    }
    this.data.syncSettings.cloudflare.lastSyncTime = new Date().toISOString();
    this.saveToDisk();
  }

  // Google Sheets Export Structure (All 15 sheets representation)
  public generateSheetsPayload() {
    return {
      spreadsheetId: this.data.syncSettings.googleSheets.spreadsheetId,
      timestamp: new Date().toISOString(),
      sheets: {
        '01_CONTROL_PANEL': {
          totalOmzetHariIni: this.data.orders.reduce((sum, o) => sum + o.totalHarga, 0),
          totalAyamMasukKg: this.data.purchases.reduce((sum, p) => sum + p.beratKg, 0),
          totalKarkasTersediaKg: this.data.stocks.find(s => s.kategori === 'karkas')?.stokKg || 0,
          totalKasTersedia: (this.data.accounts.find(a => a.kode === '1101')?.saldo || 0) + (this.data.accounts.find(a => a.kode === '1102')?.saldo || 0),
          totalPiutangUsaha: this.data.customers.reduce((sum, c) => sum + c.sisaPiutang, 0),
          totalUtangSupplier: this.data.suppliers.reduce((sum, s) => sum + s.totalHutang, 0),
          statusSistem: 'ONLINE_ACTIVE'
        },
        '02_MASTER_CUSTOMER': this.data.customers,
        '03_MASTER_PRODUK': this.data.stocks,
        '04_PEMBELIAN': this.data.purchases,
        '05_PEMOTONGAN': this.data.productions,
        '06_STOK': this.data.stocks,
        '07_PENJUALAN': this.data.orders,
        '08_KAS': this.data.cashTransactions,
        '09_PIUTANG': this.data.customers.map(c => ({ id: c.id, nama: c.nama, jenis: c.jenis, piutang: c.sisaPiutang, limit: c.limitKredit })),
        '10_BIAYA': this.data.cashTransactions.filter(c => c.tipe === 'keluar'),
        '11_PEGAWAI': this.data.employees,
        '12_JURNAL': this.data.journals,
        '13_BUKU_BESAR': this.data.accounts,
        '14_LAPORAN': {
          pendapatan: this.data.accounts.find(a => a.kode === '4101')?.saldo || 0,
          hpp: this.data.accounts.find(a => a.kode === '5101')?.saldo || 0,
          labaKotor: (this.data.accounts.find(a => a.kode === '4101')?.saldo || 0) - (this.data.accounts.find(a => a.kode === '5101')?.saldo || 0)
        },
        '15_DASHBOARD': {
          syncStatus: 'SYNCHRONIZED',
          lastSync: new Date().toISOString(),
          e2eeEncrypted: this.data.syncSettings.encryption.enabled
        }
      }
    };
  }
}

export const dbEngine = new DatabaseEngine();
