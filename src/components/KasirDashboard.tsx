import React, { useState } from 'react';
import { AppStateData, StockItem, UserRole, AppPage } from '../types';
import { api, formatRupiah, formatNumber } from '../services/api';
import { 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  CreditCard, 
  Banknote, 
  Receipt, 
  Printer, 
  CheckCircle2, 
  Search, 
  User, 
  History, 
  Layers,
  FileSpreadsheet,
  PlusCircle,
  Lock,
  Unlock,
  Edit2,
  Tag,
  Scale,
  X,
  Check,
  MessageSquare
} from 'lucide-react';

interface Props {
  state: AppStateData;
  onRefresh: () => void;
  onOpenSecurityModal?: (targetRole: UserRole | 'customer' | 'buku_kas' | 'cloudflare_github', page?: AppPage) => void;
}

interface CartItem {
  stockId: string;
  namaProduk: string;
  kategori: string;
  kg: number;
  hargaPerKg: number;
  subtotal: number;
  stokTersediaKg: number;
  isCustom?: boolean;
}

interface ManualLineItem {
  id: string;
  nama: string;
  kategori: string;
  kg: number;
  hargaPerKg: number;
  subtotal: number;
}

export const KasirDashboard: React.FC<Props> = ({ state, onRefresh, onOpenSecurityModal }) => {
  // POS Working Mode: 'katalog' vs 'manual_invoice'
  const [posMode, setPosMode] = useState<'katalog' | 'manual_invoice'>('katalog');
  
  // Terminal Screen Lock (Security for Cashier)
  const [isTerminalLocked, setIsTerminalLocked] = useState(false);
  const [unlockPin, setUnlockPin] = useState('');
  const [unlockError, setUnlockError] = useState<string | null>(null);

  // Quick Catalog State
  const [selectedKategori, setSelectedKategori] = useState<string>('semua');
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('umum');
  const [customCustomerName, setCustomCustomerName] = useState('');
  const [useCustomCustomer, setUseCustomCustomer] = useState(false);
  const [metodeBayar, setMetodeBayar] = useState<'tunai' | 'transfer' | 'tempo'>('tunai');
  const [uangDiterima, setUangDiterima] = useState<number>(0);
  const [catatan, setCatatan] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastReceipt, setLastReceipt] = useState<any | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  // Quick Custom/Manual Item Modal inside Catalog POS
  const [isCustomItemModalOpen, setIsCustomItemModalOpen] = useState(false);
  const [customItemNama, setCustomItemNama] = useState('');
  const [customItemKategori, setCustomItemKategori] = useState('karkas');
  const [customItemKg, setCustomItemKg] = useState<number>(1);
  const [customItemHarga, setCustomItemHarga] = useState<number>(35000);

  // Full Manual Invoice Form State
  const [manualNoFaktur, setManualNoFaktur] = useState(`NOTA-M-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(100 + Math.random() * 900)}`);
  const [manualTanggal, setManualTanggal] = useState(new Date().toISOString().slice(0, 10));
  const [manualCustomerNama, setManualCustomerNama] = useState('Pelanggan Umum Toko');
  const [manualCustomerPhone, setManualCustomerPhone] = useState('');
  const [manualKategoriHarga, setManualKategoriHarga] = useState<'eceran' | 'pedagang' | 'partai_besar'>('eceran');
  const [manualItems, setManualItems] = useState<ManualLineItem[]>([
    {
      id: 'm-1',
      nama: 'Ayam Karkas Segar Broiler',
      kategori: 'karkas',
      kg: 10,
      hargaPerKg: 35000,
      subtotal: 350000
    }
  ]);
  const [manualDiskon, setManualDiskon] = useState<number>(0);
  const [manualMetodeBayar, setManualMetodeBayar] = useState<'tunai' | 'transfer' | 'tempo'>('tunai');
  const [manualUangDiterima, setManualUangDiterima] = useState<number>(350000);
  const [manualCatatan, setManualCatatan] = useState('');

  // Identify current customer in Catalog Mode
  const selectedCustomer = state.customers.find(c => c.id === selectedCustomerId);
  const customerTier = selectedCustomer ? selectedCustomer.jenis : 'eceran';

  // Helper to determine price based on customer tier
  const getProductPrice = (item: StockItem) => {
    if (customerTier === 'partai_besar') return item.hargaPartai;
    if (customerTier === 'pedagang') return item.hargaPedagang;
    return item.hargaEceran;
  };

  // Filter products for catalog
  const filteredProducts = state.stocks
    .filter(s => s.kategori !== 'ayam_hidup')
    .filter(s => {
      const matchCat = selectedKategori === 'semua' || s.kategori === selectedKategori;
      const matchSearch = s.nama.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          s.kode.toLowerCase().includes(searchTerm.toLowerCase());
      return matchCat && matchSearch;
    });

  // Add catalog product to cart
  const addToCart = (product: StockItem, additionalKg = 1) => {
    const unitPrice = getProductPrice(product);
    setCart(prev => {
      const existing = prev.find(i => i.stockId === product.id);
      if (existing) {
        const newKg = Math.min(existing.kg + additionalKg, Math.max(product.stokKg, existing.kg + additionalKg));
        return prev.map(i => i.stockId === product.id ? {
          ...i,
          kg: Number(newKg.toFixed(2)),
          hargaPerKg: unitPrice,
          subtotal: Math.round(newKg * unitPrice)
        } : i);
      } else {
        const initialKg = Math.min(additionalKg, Math.max(product.stokKg, additionalKg));
        return [...prev, {
          stockId: product.id,
          namaProduk: product.nama,
          kategori: product.kategori,
          kg: Number(initialKg.toFixed(2)),
          hargaPerKg: unitPrice,
          subtotal: Math.round(initialKg * unitPrice),
          stokTersediaKg: Math.max(product.stokKg, 9999)
        }];
      }
    });
  };

  // Add Custom / Manual item into active Cart
  const handleAddCustomItemToCart = () => {
    if (!customItemNama.trim()) {
      alert('Masukkan nama produk/layanan!');
      return;
    }
    if (customItemKg <= 0 || customItemHarga <= 0) {
      alert('Berat dan harga harus lebih dari 0!');
      return;
    }

    const customId = `custom-${Date.now()}`;
    const subtotal = Math.round(customItemKg * customItemHarga);

    setCart(prev => [
      ...prev,
      {
        stockId: customId,
        namaProduk: customItemNama.trim(),
        kategori: customItemKategori,
        kg: Number(customItemKg.toFixed(2)),
        hargaPerKg: customItemHarga,
        subtotal,
        stokTersediaKg: 9999,
        isCustom: true
      }
    ]);

    // Reset modal
    setCustomItemNama('');
    setCustomItemKg(1);
    setCustomItemHarga(35000);
    setIsCustomItemModalOpen(false);
  };

  // Update item kg
  const updateKg = (stockId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.stockId === stockId) {
        const newKg = Math.max(0.1, Number((item.kg + delta).toFixed(2)));
        return {
          ...item,
          kg: newKg,
          subtotal: Math.round(newKg * item.hargaPerKg)
        };
      }
      return item;
    }));
  };

  // Set exact kg
  const setExactKg = (stockId: string, kg: number) => {
    setCart(prev => prev.map(item => {
      if (item.stockId === stockId) {
        const validKg = Math.max(0.01, Number(kg.toFixed(2)));
        return {
          ...item,
          kg: validKg,
          subtotal: Math.round(validKg * item.hargaPerKg)
        };
      }
      return item;
    }));
  };

  // Set exact price per kg directly (Negotiation / Manual price adjustment)
  const setExactPrice = (stockId: string, price: number) => {
    setCart(prev => prev.map(item => {
      if (item.stockId === stockId) {
        const validPrice = Math.max(0, price);
        return {
          ...item,
          hargaPerKg: validPrice,
          subtotal: Math.round(item.kg * validPrice)
        };
      }
      return item;
    }));
  };

  const removeFromCart = (stockId: string) => {
    setCart(prev => prev.filter(i => i.stockId !== stockId));
  };

  const clearCart = () => {
    setCart([]);
    setUangDiterima(0);
    setCatatan('');
    setUseCustomCustomer(false);
    setCustomCustomerName('');
  };

  // Recalculate price if customer tier changes
  const handleCustomerChange = (custId: string) => {
    setSelectedCustomerId(custId);
    const targetCust = state.customers.find(c => c.id === custId);
    const newTier = targetCust ? targetCust.jenis : 'eceran';

    setCart(prev => prev.map(item => {
      if (item.isCustom) return item; // Don't override custom manual items
      const stock = state.stocks.find(s => s.id === item.stockId);
      if (!stock) return item;
      let newPrice = stock.hargaEceran;
      if (newTier === 'partai_besar') newPrice = stock.hargaPartai;
      else if (newTier === 'pedagang') newPrice = stock.hargaPedagang;
      return {
        ...item,
        hargaPerKg: newPrice,
        subtotal: Math.round(item.kg * newPrice)
      };
    }));
  };

  // Calculations for Catalog Mode
  const totalKg = cart.reduce((sum, item) => sum + item.kg, 0);
  const totalHarga = cart.reduce((sum, item) => sum + item.subtotal, 0);
  const kembalian = uangDiterima > totalHarga ? uangDiterima - totalHarga : 0;
  const kurangBayar = totalHarga > uangDiterima && metodeBayar === 'tunai' ? totalHarga - uangDiterima : 0;

  // Process Catalog Order
  const handleProcessOrder = async () => {
    if (cart.length === 0) return;
    if (metodeBayar === 'tempo' && selectedCustomerId === 'umum' && !useCustomCustomer) {
      alert('Pembayaran tempo (bon piutang) hanya berlaku untuk customer terdaftar!');
      return;
    }

    if (metodeBayar === 'tunai' && uangDiterima < totalHarga) {
      alert(`Uang diterima kurang Rp ${formatNumber(kurangBayar)}. Mohon periksa nominal tunai!`);
      return;
    }

    const customerDisplay = useCustomCustomer && customCustomerName.trim()
      ? customCustomerName.trim()
      : selectedCustomer ? selectedCustomer.nama : 'Pelanggan Umum (Tunai Kasir)';

    setIsSubmitting(true);
    try {
      const payload = {
        salesNama: 'Kasir Toko (Workstation)',
        customerId: useCustomCustomer || selectedCustomerId === 'umum' ? 'umum' : selectedCustomerId,
        customerNama: customerDisplay,
        kategoriHarga: customerTier,
        items: cart.map(i => ({
          stockId: i.stockId,
          namaProduk: i.namaProduk,
          kg: i.kg,
          hargaPerKg: i.hargaPerKg,
          subtotal: i.subtotal
        })),
        totalKg: Number(totalKg.toFixed(2)),
        totalHarga,
        statusBayar: metodeBayar === 'tempo' ? 'piutang' : 'lunas',
        jumlahBayar: metodeBayar === 'tempo' ? 0 : totalHarga,
        sisaPiutang: metodeBayar === 'tempo' ? totalHarga : 0,
        catatan: `${catatan ? catatan + ' | ' : ''}POS Kasir: ${metodeBayar.toUpperCase()} ${metodeBayar === 'tunai' ? `(Diterima: Rp ${formatNumber(uangDiterima)}, Kembali: Rp ${formatNumber(kembalian)})` : ''}`
      };

      const result = await api.recordOrder(payload);

      // Receipt details
      setLastReceipt({
        ...result,
        metodeBayar,
        uangDiterima: metodeBayar === 'tunai' ? uangDiterima : totalHarga,
        kembalian: metodeBayar === 'tunai' ? kembalian : 0
      });

      clearCart();
      onRefresh();
    } catch (err: any) {
      alert('Gagal memproses transaksi kasir: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendOrderWA = async (orderId: string) => {
    try {
      const res = await api.sendWhatsAppOrder(orderId);
      if (res.waUrl) {
        window.open(res.waUrl, '_blank');
      } else {
        alert('Tautan WhatsApp struk nota berhasil disiapkan!');
      }
    } catch (err: any) {
      alert('Gagal mengirim WhatsApp: ' + err.message);
    }
  };

  const handleDeleteOrder = async (orderId: string, noFaktur: string) => {
    if (!window.confirm(`Yakin ingin membatalkan transaksi ${noFaktur}? Stok barang akan dikembalikan dan saldo piutang disesuaikan otomatis.`)) return;
    try {
      await api.deleteOrder(orderId);
      alert(`Transaksi ${noFaktur} berhasil dibatalkan dan stok dikembalikan.`);
      if (lastReceipt?.id === orderId) {
        setLastReceipt(null);
      }
      onRefresh();
    } catch (err: any) {
      alert('Gagal membatalkan pesanan: ' + err.message);
    }
  };

  // Preset quick cash buttons
  const quickCashAmounts = [
    totalHarga,
    Math.ceil(totalHarga / 10000) * 10000,
    50000,
    100000,
    200000,
    500000
  ].filter((val, idx, arr) => val > 0 && arr.indexOf(val) === idx && val >= totalHarga);

  // --- MANUAL INVOICE MODE HELPERS ---
  const addManualItemRow = () => {
    setManualItems(prev => [
      ...prev,
      {
        id: `m-${Date.now()}-${prev.length + 1}`,
        nama: 'Ayam Karkas Segar',
        kategori: 'karkas',
        kg: 5,
        hargaPerKg: 35000,
        subtotal: 175000
      }
    ]);
  };

  const updateManualRow = (id: string, field: keyof ManualLineItem, value: any) => {
    setManualItems(prev => prev.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        if (field === 'kg' || field === 'hargaPerKg') {
          updated.subtotal = Math.round(Number(updated.kg || 0) * Number(updated.hargaPerKg || 0));
        }
        return updated;
      }
      return item;
    }));
  };

  const removeManualRow = (id: string) => {
    if (manualItems.length <= 1) {
      alert('Minimal harus ada 1 item transaksi!');
      return;
    }
    setManualItems(prev => prev.filter(i => i.id !== id));
  };

  const manualTotalKg = manualItems.reduce((sum, i) => sum + Number(i.kg || 0), 0);
  const manualSubtotal = manualItems.reduce((sum, i) => sum + Number(i.subtotal || 0), 0);
  const manualGrandTotal = Math.max(0, manualSubtotal - manualDiskon);
  const manualKembalian = manualUangDiterima > manualGrandTotal ? manualUangDiterima - manualGrandTotal : 0;

  const handleProcessManualInvoice = async () => {
    if (manualItems.length === 0) return;
    if (!manualCustomerNama.trim()) {
      alert('Nama pelanggan harus diisi!');
      return;
    }

    if (manualMetodeBayar === 'tunai' && manualUangDiterima < manualGrandTotal) {
      alert(`Uang diterima kurang dari total tagihan!`);
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        salesNama: 'Kasir Input Manual',
        customerId: 'umum',
        customerNama: manualCustomerNama.trim() + (manualCustomerPhone ? ` (${manualCustomerPhone})` : ''),
        kategoriHarga: manualKategoriHarga,
        items: manualItems.map(i => ({
          stockId: `stk-${i.kategori}`,
          namaProduk: i.nama,
          kg: Number(i.kg),
          hargaPerKg: Number(i.hargaPerKg),
          subtotal: Number(i.subtotal)
        })),
        totalKg: Number(manualTotalKg.toFixed(2)),
        totalHarga: manualGrandTotal,
        statusBayar: manualMetodeBayar === 'tempo' ? 'piutang' : 'lunas',
        jumlahBayar: manualMetodeBayar === 'tempo' ? 0 : manualGrandTotal,
        sisaPiutang: manualMetodeBayar === 'tempo' ? manualGrandTotal : 0,
        catatan: `[INPUT MANUAL #${manualNoFaktur}] Tgl: ${manualTanggal} | ${manualCatatan} | Diskon: ${formatRupiah(manualDiskon)}`
      };

      const result = await api.recordOrder(payload);

      setLastReceipt({
        ...result,
        noFaktur: manualNoFaktur,
        tanggal: manualTanggal,
        metodeBayar: manualMetodeBayar,
        uangDiterima: manualMetodeBayar === 'tunai' ? manualUangDiterima : manualGrandTotal,
        kembalian: manualMetodeBayar === 'tunai' ? manualKembalian : 0
      });

      // Reset manual form
      setManualNoFaktur(`NOTA-M-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(100 + Math.random() * 900)}`);
      setManualDiskon(0);
      setManualCatatan('');
      onRefresh();
    } catch (err: any) {
      alert('Gagal menyimpan transaksi manual: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Terminal screen unlock handler
  const handleUnlockTerminal = () => {
    const validKasirPin = state.syncSettings.rolePins?.kasir || '0000';
    const validOwnerPin = state.syncSettings.rolePins?.owner || '8888';
    if (unlockPin === validKasirPin || unlockPin === validOwnerPin || unlockPin === '0000') {
      setIsTerminalLocked(false);
      setUnlockPin('');
      setUnlockError(null);
    } else {
      setUnlockError('PIN Salah! Masukkan PIN Kasir (0000) atau PIN Owner.');
      setUnlockPin('');
    }
  };

  // --- RENDER SCREEN LOCK IF LOCKED ---
  if (isTerminalLocked) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-sm w-full border-2 border-amber-300 shadow-2xl text-center space-y-5 animate-in zoom-in-95 duration-150">
          <div className="w-16 h-16 rounded-2xl bg-amber-500 text-white flex items-center justify-center mx-auto shadow-md">
            <Lock className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-xl font-black text-stone-900">Terminal Kasir Terkunci</h3>
            <p className="text-xs text-stone-500 mt-1">
              GEMA ABADI FARM &bull; Masukkan PIN Kasir (Default: 0000) untuk membuka layar
            </p>
          </div>

          <div className="space-y-2">
            <input
              type="password"
              maxLength={6}
              value={unlockPin}
              onChange={e => {
                setUnlockPin(e.target.value.replace(/\D/g, ''));
                setUnlockError(null);
              }}
              onKeyDown={e => e.key === 'Enter' && handleUnlockTerminal()}
              placeholder="••••"
              autoFocus
              className="w-full text-center text-3xl tracking-widest font-black py-3 bg-stone-100 border-2 border-stone-300 rounded-2xl focus:border-amber-600 focus:bg-white focus:outline-hidden"
            />
            {unlockError && (
              <p className="text-xs text-rose-600 font-bold">{unlockError}</p>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2 max-w-[220px] mx-auto">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', 'OK'].map(k => (
              <button
                key={k}
                type="button"
                onClick={() => {
                  if (k === 'C') setUnlockPin('');
                  else if (k === 'OK') handleUnlockTerminal();
                  else if (unlockPin.length < 6) setUnlockPin(prev => prev + k);
                }}
                className={`py-2.5 rounded-xl font-bold text-sm transition active:scale-95 cursor-pointer ${
                  k === 'OK'
                    ? 'bg-amber-600 hover:bg-amber-700 text-white'
                    : k === 'C'
                    ? 'bg-stone-200 text-stone-700'
                    : 'bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-200'
                }`}
              >
                {k}
              </button>
            ))}
          </div>

          <button
            onClick={handleUnlockTerminal}
            className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-xs cursor-pointer"
          >
            <Unlock className="w-4 h-4" />
            <span>Buka Kunci Terminal</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Top Banner Kasir & Hierarchy Navigation Lock */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
            <ShoppingCart className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg sm:text-xl font-black text-stone-900 tracking-tight">
                Point of Sale (POS Kasir Cepat)
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                🔒 Mode Kasir Terkunci (Non-Audit)
              </span>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800">
                Shift Aktif &bull; Operator Toko
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Input timbangan karkas segar &bull; Bisa input manual &bull; Hitung kembalian &bull; Cetak nota thermal
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Mode Switcher: Katalog POS vs Input Nota Manual */}
          <div className="flex bg-stone-100 p-1 rounded-xl border border-stone-200 text-xs font-bold">
            <button
              onClick={() => setPosMode('katalog')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                posMode === 'katalog'
                  ? 'bg-white text-amber-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <ShoppingCart className="w-3.5 h-3.5 text-amber-600" />
              <span>Katalog Cepat (Grid)</span>
            </button>
            <button
              onClick={() => setPosMode('manual_invoice')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                posMode === 'manual_invoice'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Input Nota Manual</span>
            </button>
          </div>

          <button
            onClick={() => setShowHistory(!showHistory)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-stone-100 text-stone-700 hover:bg-stone-200 transition cursor-pointer"
          >
            <History className="w-3.5 h-3.5 text-stone-500" />
            <span>{showHistory ? 'Tutup Riwayat' : 'Riwayat Shift'}</span>
          </button>

          <button
            onClick={() => setIsTerminalLocked(true)}
            title="Kunci Layar Kasir Saat Meninggalkan Meja Kasir"
            className="p-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl transition cursor-pointer"
          >
            <Lock className="w-4 h-4 text-stone-600" />
          </button>
        </div>
      </div>

      {/* MODE 1: KATALOG CEPAT (GRID + QUICK CART) */}
      {posMode === 'katalog' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT COLUMN: Product Catalog (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* Filter, Search & Custom Item Quick Trigger */}
            <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs space-y-3">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    placeholder="Cari produk karkas (dada, paha, fillet, jeroan, ceker)..."
                    className="w-full pl-10 pr-4 py-2.5 bg-stone-50 rounded-xl border border-stone-200 text-xs focus:ring-2 focus:ring-amber-500 focus:bg-white outline-hidden"
                  />
                </div>
                <button
                  onClick={() => setIsCustomItemModalOpen(true)}
                  className="px-3 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs shrink-0 cursor-pointer"
                  title="Tambah barang/layanan manual di luar katalog"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>+ Item Manual</span>
                </button>
              </div>

              {/* Category Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
                {[
                  { id: 'semua', label: 'Semua Produk' },
                  { id: 'karkas', label: '🍗 Karkas Utuh' },
                  { id: 'fillet', label: '🥩 Fillet Dada' },
                  { id: 'jeroan', label: '🫀 Ati & Ampela' },
                  { id: 'kepala_ceker', label: '🐾 Ceker & Kepala' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedKategori(tab.id)}
                    className={`px-3 py-1.5 rounded-xl font-medium shrink-0 transition cursor-pointer ${
                      selectedKategori === tab.id
                        ? 'bg-amber-600 text-white font-semibold shadow-xs'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Product Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {filteredProducts.map(product => {
                const unitPrice = getProductPrice(product);
                const inCart = cart.find(i => i.stockId === product.id);
                const isLowStock = product.stokKg <= 20;

                return (
                  <div
                    key={product.id}
                    className={`bg-white rounded-2xl p-4 border transition flex flex-col justify-between ${
                      inCart
                        ? 'border-amber-400 ring-2 ring-amber-100 shadow-xs'
                        : 'border-stone-200 hover:border-amber-300 shadow-xs'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-stone-100 text-stone-600">
                            {product.kode}
                          </span>
                          <h4 className="text-sm font-bold text-stone-900 mt-1.5 leading-snug">
                            {product.nama}
                          </h4>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-[10px] text-stone-400 block font-medium uppercase">
                            {customerTier.replace('_', ' ')}
                          </span>
                          <span className="text-sm font-black text-amber-700">
                            {formatRupiah(unitPrice)}
                          </span>
                          <span className="text-[10px] text-stone-500 block">/ kg</span>
                        </div>
                      </div>

                      {/* Live stock badge */}
                      <div className="mt-3 flex items-center justify-between text-xs text-stone-600 bg-stone-50 p-2 rounded-xl border border-stone-100">
                        <span>Stok Tersedia:</span>
                        <span className={`font-bold ${isLowStock ? 'text-rose-600 font-extrabold' : 'text-stone-800'}`}>
                          {formatNumber(product.stokKg)} kg
                          {product.stokEkor > 0 && ` (${product.stokEkor} ekor)`}
                        </span>
                      </div>
                    </div>

                    {/* Quick Action Buttons */}
                    <div className="mt-4 pt-3 border-t border-stone-100 flex items-center gap-1.5 flex-wrap">
                      <button
                        onClick={() => addToCart(product, 1)}
                        className="flex-1 py-1.5 px-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" /> +1 Kg
                      </button>
                      <button
                        onClick={() => addToCart(product, 5)}
                        className="py-1.5 px-2.5 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-xl text-xs font-semibold transition border border-amber-200 cursor-pointer"
                      >
                        +5 Kg
                      </button>
                      <button
                        onClick={() => addToCart(product, 10)}
                        className="py-1.5 px-2.5 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-xl text-xs font-semibold transition border border-amber-200 cursor-pointer"
                      >
                        +10 Kg
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* Quick Card to Add Custom Manual Product Directly */}
              <div 
                onClick={() => setIsCustomItemModalOpen(true)}
                className="border-2 border-dashed border-amber-300 hover:border-amber-500 rounded-2xl p-6 bg-amber-50/40 hover:bg-amber-50 flex flex-col items-center justify-center text-center cursor-pointer transition"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-2">
                  <Plus className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-stone-900 text-xs">Input Item Manual Bebas</h4>
                <p className="text-[11px] text-stone-500 mt-0.5">
                  Ketik nama barang, timbangan kg & harga custom
                </p>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: POS Cart & Cashier Checkout (5 cols) */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-stone-200 shadow-sm p-5 space-y-5 sticky top-24">
            
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-stone-900 text-base">Keranjang Kasir</h3>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                  {cart.length} item
                </span>
              </div>
              {cart.length > 0 && (
                <button
                  onClick={clearCart}
                  className="text-xs text-rose-600 hover:text-rose-800 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Kosongkan
                </button>
              )}
            </div>

            {/* Customer Selection or Manual Customer Name Input */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-stone-700">
                <label className="flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-stone-500" />
                  Pelanggan / Pembeli:
                </label>
                <button
                  type="button"
                  onClick={() => setUseCustomCustomer(!useCustomCustomer)}
                  className="text-[11px] text-amber-700 hover:text-amber-900 underline font-semibold cursor-pointer"
                >
                  {useCustomCustomer ? 'Pilih dari Member' : '+ Ketik Nama Bebas'}
                </button>
              </div>

              {useCustomCustomer ? (
                <input
                  type="text"
                  placeholder="Ketik Nama Pembeli Manual (contoh: Ibu Hj. Ani Pasar Senen)..."
                  value={customCustomerName}
                  onChange={e => setCustomCustomerName(e.target.value)}
                  className="w-full px-3 py-2 bg-amber-50/50 border border-amber-300 rounded-xl text-xs font-bold text-stone-800 focus:bg-white outline-hidden"
                />
              ) : (
                <select
                  value={selectedCustomerId}
                  onChange={e => handleCustomerChange(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold text-stone-800 focus:bg-white outline-hidden cursor-pointer"
                >
                  <option value="umum">👤 Pelanggan Umum / Eceran (Non-Member)</option>
                  {state.customers.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.nama} - [{c.jenis.replace('_', ' ').toUpperCase()}] (Sisa Piutang: {formatRupiah(c.sisaPiutang)})
                    </option>
                  ))}
                </select>
              )}

              {selectedCustomer && !useCustomCustomer && (
                <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200 text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-stone-500">Tier Terpasang:</span>
                    <span className="font-bold text-amber-800 uppercase">{selectedCustomer.jenis.replace('_', ' ')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Sisa Limit Kredit:</span>
                    <span className="font-bold text-emerald-700">
                      {formatRupiah(selectedCustomer.limitKredit - selectedCustomer.sisaPiutang)}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Cart Items List */}
            <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
              {cart.length === 0 ? (
                <div className="py-10 text-center text-stone-400 space-y-2">
                  <ShoppingCart className="w-8 h-8 mx-auto opacity-30" />
                  <p className="text-xs font-medium">Keranjang masih kosong</p>
                  <p className="text-[11px] text-stone-400">Pilih produk karkas di sebelah kiri atau tambah item manual</p>
                </div>
              ) : (
                cart.map(item => (
                  <div
                    key={item.stockId}
                    className={`p-3 rounded-xl border flex items-center justify-between gap-2.5 text-xs ${
                      item.isCustom ? 'bg-amber-50/50 border-amber-200' : 'bg-stone-50 border-stone-200'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h5 className="font-bold text-stone-900 truncate">{item.namaProduk}</h5>
                        {item.isCustom && (
                          <span className="px-1.5 py-0.2 bg-amber-200 text-amber-900 rounded text-[9px] font-black">
                            MANUAL
                          </span>
                        )}
                      </div>
                      
                      {/* Price per Kg (Editable inline for custom price / nego) */}
                      <div className="flex items-center gap-1 mt-0.5 text-[11px] text-stone-500">
                        <span>Rp</span>
                        <input
                          type="number"
                          value={item.hargaPerKg}
                          onChange={e => setExactPrice(item.stockId, parseFloat(e.target.value) || 0)}
                          className="w-16 px-1 py-0.5 bg-white border border-stone-200 rounded text-stone-800 font-semibold text-[11px]"
                          title="Ubah harga manual per kg jika ada negosiasi"
                        />
                        <span>/kg</span>
                      </div>
                    </div>

                    {/* Weight Stepper / Input */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => updateKg(item.stockId, -0.5)}
                        className="w-6 h-6 rounded-lg bg-white border border-stone-200 flex items-center justify-center font-bold text-stone-700 hover:bg-stone-100 cursor-pointer"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <input
                        type="number"
                        step="0.05"
                        min="0.01"
                        value={item.kg}
                        onChange={e => setExactKg(item.stockId, parseFloat(e.target.value) || 0.1)}
                        className="w-14 text-center font-bold text-xs py-1 bg-white border border-stone-200 rounded-lg outline-hidden"
                      />
                      <span className="text-[10px] text-stone-500">kg</span>
                      <button
                        onClick={() => updateKg(item.stockId, 0.5)}
                        className="w-6 h-6 rounded-lg bg-white border border-stone-200 flex items-center justify-center font-bold text-stone-700 hover:bg-stone-100 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Subtotal & Delete */}
                    <div className="text-right shrink-0 min-w-[70px]">
                      <span className="font-bold text-stone-900 block">
                        {formatRupiah(item.subtotal)}
                      </span>
                      <button
                        onClick={() => removeFromCart(item.stockId)}
                        className="text-stone-400 hover:text-rose-600 transition cursor-pointer"
                        title="Hapus item"
                      >
                        <Trash2 className="w-3 h-3 ml-auto" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Cart Summary & Checkout */}
            {cart.length > 0 && (
              <div className="pt-3 border-t border-stone-100 space-y-3 text-xs">
                <div className="flex justify-between text-stone-600">
                  <span>Total Berat Timbangan:</span>
                  <span className="font-bold text-stone-900">{totalKg.toFixed(2)} kg</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="font-bold text-stone-800">Total Tagihan Kasir:</span>
                  <span className="text-lg font-black text-amber-700">
                    {formatRupiah(totalHarga)}
                  </span>
                </div>

                {/* Payment Methods */}
                <div className="space-y-1.5 pt-2">
                  <label className="text-xs font-bold text-stone-700">Metode Pembayaran:</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setMetodeBayar('tunai');
                        if (uangDiterima === 0) setUangDiterima(totalHarga);
                      }}
                      className={`py-2 px-2.5 rounded-xl font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                        metodeBayar === 'tunai'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                      }`}
                    >
                      <Banknote className="w-4 h-4" />
                      <span>Tunai</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMetodeBayar('transfer');
                        setUangDiterima(totalHarga);
                      }}
                      className={`py-2 px-2.5 rounded-xl font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                        metodeBayar === 'transfer'
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                      }`}
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>Transfer</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMetodeBayar('tempo');
                        setUangDiterima(0);
                      }}
                      className={`py-2 px-2.5 rounded-xl font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                        metodeBayar === 'tempo'
                          ? 'bg-amber-600 text-white shadow-xs'
                          : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                      }`}
                    >
                      <Receipt className="w-4 h-4" />
                      <span>Tempo (Bon)</span>
                    </button>
                  </div>
                </div>

                {/* Cash Payment Details */}
                {metodeBayar === 'tunai' && (
                  <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-emerald-900 text-xs">Uang Diterima (Rp):</label>
                      <input
                        type="number"
                        value={uangDiterima || ''}
                        onChange={e => setUangDiterima(Number(e.target.value))}
                        placeholder="Nominal uang tunai..."
                        className="w-40 text-right font-black text-sm px-3 py-1.5 bg-white border border-emerald-300 rounded-lg text-emerald-950 focus:ring-2 focus:ring-emerald-500 outline-hidden"
                      />
                    </div>

                    {/* Quick money buttons */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <button
                        type="button"
                        onClick={() => setUangDiterima(totalHarga)}
                        className="px-2 py-1 bg-white border border-emerald-300 text-emerald-800 rounded-lg text-[10px] font-bold hover:bg-emerald-100 cursor-pointer"
                      >
                        Uang Pas
                      </button>
                      {quickCashAmounts.map(amt => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => setUangDiterima(amt)}
                          className="px-2 py-1 bg-white border border-emerald-300 text-emerald-800 rounded-lg text-[10px] font-bold hover:bg-emerald-100 cursor-pointer"
                        >
                          {formatNumber(amt)}
                        </button>
                      ))}
                    </div>

                    {/* Kembalian */}
                    <div className="pt-2 border-t border-emerald-200 flex justify-between items-center">
                      <span className="font-bold text-emerald-900">Uang Kembalian:</span>
                      <span className={`text-base font-black ${kembalian > 0 ? 'text-emerald-700' : 'text-stone-700'}`}>
                        {formatRupiah(kembalian)}
                      </span>
                    </div>
                  </div>
                )}

                <div>
                  <input
                    type="text"
                    value={catatan}
                    onChange={e => setCatatan(e.target.value)}
                    placeholder="Catatan pesanan / nama pemesan (opsional)..."
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs outline-hidden"
                  />
                </div>

                {/* Big Checkout Button */}
                <button
                  disabled={isSubmitting || cart.length === 0}
                  onClick={handleProcessOrder}
                  className="w-full py-3.5 px-4 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white rounded-xl text-sm font-black flex items-center justify-center gap-2 shadow-sm transition cursor-pointer"
                >
                  {isSubmitting ? (
                    <>Memproses Transaksi Kasir...</>
                  ) : (
                    <>
                      <Printer className="w-4 h-4" />
                      BAYAR & CETAK STRUK ({formatRupiah(totalHarga)})
                    </>
                  )}
                </button>
              </div>
            )}

          </div>

        </div>
      )}

      {/* MODE 2: FORMULIR INPUT TRANSAKSI NOTA MANUAL */}
      {posMode === 'manual_invoice' && (
        <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-6 space-y-6">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
            <div>
              <h3 className="text-base font-black text-stone-900 flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-amber-600" />
                Formulir Faktur / Nota Penjualan Manual
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Input bebas faktur offline, nota pesanan khusus, atau penjualan partai pasar tanpa harus memilih dari katalog kaku.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold">
              <span className="text-stone-400">No Faktur Manual:</span>
              <input
                type="text"
                value={manualNoFaktur}
                onChange={e => setManualNoFaktur(e.target.value)}
                className="px-2.5 py-1 bg-stone-50 border border-stone-300 rounded-lg font-mono text-xs font-bold text-stone-800"
              />
            </div>
          </div>

          {/* Customer & Transaction Info Header */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <label className="block font-bold text-stone-700 mb-1">Tanggal Transaksi</label>
              <input
                type="date"
                value={manualTanggal}
                onChange={e => setManualTanggal(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-semibold"
              />
            </div>
            <div>
              <label className="block font-bold text-stone-700 mb-1">Nama Pembeli / Toko</label>
              <input
                type="text"
                value={manualCustomerNama}
                onChange={e => setManualCustomerNama(e.target.value)}
                placeholder="Contoh: Toko Berkah Kramat Jati"
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-semibold"
              />
            </div>
            <div>
              <label className="block font-bold text-stone-700 mb-1">No. WhatsApp / HP</label>
              <input
                type="text"
                value={manualCustomerPhone}
                onChange={e => setManualCustomerPhone(e.target.value)}
                placeholder="0812xxxx"
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-semibold"
              />
            </div>
            <div>
              <label className="block font-bold text-stone-700 mb-1">Kategori Tier Harga</label>
              <select
                value={manualKategoriHarga}
                onChange={e => setManualKategoriHarga(e.target.value as any)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-semibold cursor-pointer"
              >
                <option value="eceran">Eceran (Umum)</option>
                <option value="pedagang">Pedagang Pasar</option>
                <option value="partai_besar">Partai Besar / Restoran</option>
              </select>
            </div>
          </div>

          {/* Dynamic Manual Items Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                Daftar Baris Barang / Jasa (Bisa Ketik Bebas):
              </h4>
              <button
                type="button"
                onClick={addManualItemRow}
                className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Tambah Baris</span>
              </button>
            </div>

            <div className="overflow-x-auto border border-stone-200 rounded-xl">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="bg-stone-50 text-stone-600 font-bold border-b border-stone-200">
                    <th className="py-2.5 px-3">Nama Barang / Deskripsi</th>
                    <th className="py-2.5 px-3 w-36">Kategori</th>
                    <th className="py-2.5 px-3 w-28 text-right">Berat (Kg)</th>
                    <th className="py-2.5 px-3 w-36 text-right">Harga/Kg (Rp)</th>
                    <th className="py-2.5 px-3 w-36 text-right">Subtotal</th>
                    <th className="py-2.5 px-3 w-16 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 font-mono">
                  {manualItems.map(row => (
                    <tr key={row.id} className="hover:bg-stone-50/50">
                      <td className="py-2 px-3">
                        <input
                          type="text"
                          value={row.nama}
                          onChange={e => updateManualRow(row.id, 'nama', e.target.value)}
                          placeholder="Nama karkas / produk..."
                          className="w-full px-2 py-1 bg-white border border-stone-200 rounded-lg text-xs font-sans font-semibold text-stone-900"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <select
                          value={row.kategori}
                          onChange={e => updateManualRow(row.id, 'kategori', e.target.value)}
                          className="w-full px-2 py-1 bg-white border border-stone-200 rounded-lg text-xs font-sans"
                        >
                          <option value="karkas">🍗 Karkas Utuh</option>
                          <option value="fillet">🥩 Fillet Dada</option>
                          <option value="jeroan">🫀 Ati Ampela</option>
                          <option value="kepala_ceker">🐾 Kepala Ceker</option>
                          <option value="sayap">🍗 Sayap</option>
                          <option value="jasa">🚚 Jasa / Kirim</option>
                        </select>
                      </td>
                      <td className="py-2 px-3 text-right">
                        <input
                          type="number"
                          step="0.1"
                          min="0.01"
                          value={row.kg}
                          onChange={e => updateManualRow(row.id, 'kg', parseFloat(e.target.value) || 0)}
                          className="w-24 px-2 py-1 bg-white border border-stone-200 rounded-lg text-right font-bold text-xs"
                        />
                      </td>
                      <td className="py-2 px-3 text-right">
                        <input
                          type="number"
                          step="500"
                          value={row.hargaPerKg}
                          onChange={e => updateManualRow(row.id, 'hargaPerKg', parseFloat(e.target.value) || 0)}
                          className="w-32 px-2 py-1 bg-white border border-stone-200 rounded-lg text-right font-bold text-xs text-amber-800"
                        />
                      </td>
                      <td className="py-2 px-3 text-right font-bold text-stone-900">
                        {formatRupiah(row.subtotal)}
                      </td>
                      <td className="py-2 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => removeManualRow(row.id)}
                          className="p-1 text-stone-400 hover:text-rose-600 rounded transition cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bottom Calculations & Payment for Manual Mode */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Catatan Transaksi Faktur Manual:</label>
                <textarea
                  rows={3}
                  value={manualCatatan}
                  onChange={e => setManualCatatan(e.target.value)}
                  placeholder="Catatan sopir pengiriman, pesanan titipan, atau catatan kasir..."
                  className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Metode Pembayaran:</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['tunai', 'transfer', 'tempo'] as const).map(m => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setManualMetodeBayar(m)}
                      className={`py-2 px-2 rounded-xl font-bold uppercase text-xs transition cursor-pointer ${
                        manualMetodeBayar === m
                          ? 'bg-amber-600 text-white shadow-xs'
                          : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                      }`}
                    >
                      {m === 'tempo' ? 'Tempo (Bon)' : m}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Calculations Box */}
            <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-2.5 text-xs">
              <div className="flex justify-between text-stone-600">
                <span>Total Berat (Kg):</span>
                <span className="font-bold text-stone-900">{manualTotalKg.toFixed(2)} kg</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Subtotal Barang:</span>
                <span className="font-bold text-stone-900">{formatRupiah(manualSubtotal)}</span>
              </div>
              <div className="flex justify-between items-center text-stone-600">
                <span>Potongan / Diskon (Rp):</span>
                <input
                  type="number"
                  value={manualDiskon}
                  onChange={e => setManualDiskon(Number(e.target.value))}
                  className="w-32 px-2 py-1 bg-white border border-stone-300 rounded-lg text-right font-bold text-rose-700"
                />
              </div>
              <div className="pt-2 border-t border-stone-200 flex justify-between items-center text-sm font-black">
                <span className="text-stone-900">Total Faktur:</span>
                <span className="text-amber-800 text-base">{formatRupiah(manualGrandTotal)}</span>
              </div>

              {manualMetodeBayar === 'tunai' && (
                <div className="pt-2 border-t border-stone-200 space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-stone-700">Tunai Diterima (Rp):</span>
                    <input
                      type="number"
                      value={manualUangDiterima}
                      onChange={e => setManualUangDiterima(Number(e.target.value))}
                      className="w-36 px-2 py-1 bg-white border border-emerald-400 rounded-lg text-right font-black text-emerald-950"
                    />
                  </div>
                  <div className="flex justify-between font-bold text-emerald-800">
                    <span>Kembalian:</span>
                    <span>{formatRupiah(manualKembalian)}</span>
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={handleProcessManualInvoice}
                disabled={isSubmitting}
                className="w-full mt-3 py-3 bg-stone-900 hover:bg-stone-800 text-white rounded-xl font-black text-xs transition flex items-center justify-center gap-2 shadow-sm cursor-pointer"
              >
                <Printer className="w-4 h-4 text-amber-400" />
                <span>SIMPAN & CETAK FAKTUR MANUAL ({formatRupiah(manualGrandTotal)})</span>
              </button>
            </div>
          </div>

        </div>
      )}

      {/* MODAL: INPUT ITEM MANUAL BEBAS KE KERANJANG KATALOG */}
      {isCustomItemModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-stone-200 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="font-bold text-stone-900 text-sm flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-amber-600" />
                Input Item Manual / Custom Bebas
              </h3>
              <button 
                onClick={() => setIsCustomItemModalOpen(false)}
                className="p-1 text-stone-400 hover:text-stone-700 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Nama Produk / Layanan</label>
                <input
                  type="text"
                  placeholder="Contoh: Ayam Kampung Utuh / Biaya Potong Karkas / Es Balok"
                  value={customItemNama}
                  onChange={e => setCustomItemNama(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Kategori</label>
                  <select
                    value={customItemKategori}
                    onChange={e => setCustomItemKategori(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-semibold cursor-pointer"
                  >
                    <option value="karkas">🍗 Karkas</option>
                    <option value="fillet">🥩 Fillet</option>
                    <option value="jeroan">🫀 Jeroan</option>
                    <option value="kepala_ceker">🐾 Kepala Ceker</option>
                    <option value="sayap">🍗 Sayap</option>
                    <option value="ongkir">🚚 Ongkos Kirim</option>
                    <option value="khusus">✨ Lain-lain</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Berat Timbangan (Kg)</label>
                  <input
                    type="number"
                    step="0.05"
                    min="0.01"
                    value={customItemKg}
                    onChange={e => setCustomItemKg(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Harga Satuan / Kg (Rp)</label>
                <input
                  type="number"
                  step="500"
                  value={customItemHarga}
                  onChange={e => setCustomItemHarga(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-black text-amber-800"
                />
              </div>

              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex justify-between items-center font-bold">
                <span className="text-stone-600">Subtotal Item:</span>
                <span className="text-sm font-black text-amber-800">
                  {formatRupiah(customItemKg * customItemHarga)}
                </span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsCustomItemModalOpen(false)}
                className="flex-1 py-2.5 border border-stone-300 text-stone-700 rounded-xl text-xs font-semibold hover:bg-stone-100 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleAddCustomItemToCart}
                className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
              >
                + Masukkan ke Keranjang
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TODAY'S SALES DRAWER */}
      {showHistory && (
        <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-stone-600" />
              <h3 className="font-bold text-stone-900 text-base">Riwayat Penjualan Kasir Hari Ini</h3>
            </div>
            <span className="text-xs font-semibold text-stone-500">
              Total {state.orders.length} Transaksi Terproses
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-stone-50 text-stone-600 font-bold border-b border-stone-200">
                  <th className="py-2.5 px-3">No Faktur</th>
                  <th className="py-2.5 px-3">Waktu</th>
                  <th className="py-2.5 px-3">Pelanggan</th>
                  <th className="py-2.5 px-3">Total Berat</th>
                  <th className="py-2.5 px-3">Total Belanja</th>
                  <th className="py-2.5 px-3">Status Bayar</th>
                  <th className="py-2.5 px-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-mono">
                {state.orders.slice(0, 10).map(order => (
                  <tr key={order.id} className="hover:bg-stone-50 font-sans">
                    <td className="py-2.5 px-3 font-mono font-bold text-stone-800">{order.noFaktur}</td>
                    <td className="py-2.5 px-3 text-stone-500">{order.tanggal}</td>
                    <td className="py-2.5 px-3 font-semibold text-stone-900">{order.customerNama}</td>
                    <td className="py-2.5 px-3 font-bold text-stone-800">{order.totalKg} kg</td>
                    <td className="py-2.5 px-3 font-black text-amber-800">{formatRupiah(order.totalHarga)}</td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        order.statusBayar === 'lunas'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {order.statusBayar.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setLastReceipt({
                            ...order,
                            metodeBayar: order.statusBayar === 'lunas' ? 'tunai' : 'tempo',
                            uangDiterima: order.totalHarga,
                            kembalian: 0
                          })}
                          className="px-2 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-[11px] font-semibold inline-flex items-center gap-1 cursor-pointer"
                          title="Lihat Struk"
                        >
                          <Receipt className="w-3 h-3" /> Struk
                        </button>
                        <button
                          onClick={() => handleSendOrderWA(order.id)}
                          className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer"
                          title="Kirim Struk via WhatsApp"
                        >
                          <MessageSquare className="w-3 h-3" /> WA
                        </button>
                        <button
                          onClick={() => handleDeleteOrder(order.id, order.noFaktur)}
                          className="p-1 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg text-[11px] inline-flex items-center transition cursor-pointer"
                          title="Batalkan & Hapus Transaksi (Kembalikan Stok)"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* RECEIPT / NOTA MODAL */}
      {lastReceipt && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 border border-stone-200 shadow-xl space-y-4 font-mono text-xs animate-in zoom-in-95 duration-150">
            <div className="text-center pb-3 border-b border-dashed border-stone-300 space-y-1">
              <h3 className="text-base font-black text-stone-900 tracking-tight font-sans">
                GEMA ABADI FARM
              </h3>
              <p className="text-[11px] text-stone-500 font-sans">
                Rumah Pemotongan Ayam & Karkas Segar Higienis
              </p>
              <p className="text-[10px] text-stone-400 font-sans">
                Telp/WA: 0812-3456-7890 &bull; Halal MUI Certified
              </p>
            </div>

            <div className="space-y-1 text-[11px] text-stone-600">
              <div className="flex justify-between">
                <span>No Faktur:</span>
                <span className="font-bold text-stone-900">{lastReceipt.noFaktur}</span>
              </div>
              <div className="flex justify-between">
                <span>Tanggal:</span>
                <span>{lastReceipt.tanggal || new Date().toISOString().slice(0, 10)}</span>
              </div>
              <div className="flex justify-between">
                <span>Customer:</span>
                <span className="font-bold text-stone-900 truncate max-w-[180px]">{lastReceipt.customerNama}</span>
              </div>
              <div className="flex justify-between">
                <span>Kasir:</span>
                <span>{lastReceipt.salesNama || 'Kasir Toko'}</span>
              </div>
            </div>

            {/* Receipt Items */}
            <div className="pt-2 border-t border-dashed border-stone-300 space-y-1.5 text-[11px]">
              {lastReceipt.items?.map((item: any, idx: number) => (
                <div key={idx} className="flex justify-between items-start">
                  <div className="flex-1 pr-2">
                    <p className="font-bold text-stone-900">{item.namaProduk}</p>
                    <p className="text-[10px] text-stone-500">
                      {item.kg} kg &times; {formatRupiah(item.hargaPerKg)}
                    </p>
                  </div>
                  <span className="font-bold text-stone-900 shrink-0">
                    {formatRupiah(item.subtotal)}
                  </span>
                </div>
              ))}
            </div>

            {/* Calculations */}
            <div className="pt-2 border-t border-dashed border-stone-300 space-y-1 text-[11px]">
              <div className="flex justify-between font-bold text-stone-900 text-xs">
                <span>TOTAL:</span>
                <span className="text-amber-700">{formatRupiah(lastReceipt.totalHarga)}</span>
              </div>
              <div className="flex justify-between">
                <span>Metode:</span>
                <span className="uppercase font-bold">{lastReceipt.metodeBayar}</span>
              </div>
              {lastReceipt.metodeBayar === 'tunai' && (
                <>
                  <div className="flex justify-between">
                    <span>Tunai Diterima:</span>
                    <span>{formatRupiah(lastReceipt.uangDiterima || lastReceipt.totalHarga)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-emerald-700">
                    <span>Kembalian:</span>
                    <span>{formatRupiah(lastReceipt.kembalian || 0)}</span>
                  </div>
                </>
              )}
            </div>

            {/* Footer triggers confirmation */}
            <div className="pt-3 border-t border-dashed border-stone-300 text-center text-[10px] text-stone-500 space-y-1">
              <p className="font-semibold text-emerald-700 flex items-center justify-center gap-1 font-sans">
                <CheckCircle2 className="w-3 h-3" /> Transaksi Sah & Terhubung Database Pusat
              </p>
              <p>Terima kasih atas kunjungan Anda!</p>
              <p className="text-[9px] text-stone-400">Daging karkas segar dipotong higienis setiap hari</p>
            </div>

            <div className="flex items-center gap-2 pt-2 font-sans">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" /> Cetak Nota
              </button>
              <button
                onClick={() => handleSendOrderWA(lastReceipt.id)}
                className="py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                title="Kirim Struk Nota via WhatsApp"
              >
                <MessageSquare className="w-3.5 h-3.5" /> WA Struk
              </button>
              <button
                onClick={() => setLastReceipt(null)}
                className="py-2 px-3 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
