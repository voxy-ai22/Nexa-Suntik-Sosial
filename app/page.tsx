"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Rocket, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  ExternalLink, 
  ChevronRight,
  ShieldCheck,
  Zap,
  TrendingUp,
  CreditCard
} from 'lucide-react';
import { QRIS_IMAGE_URL } from '@/lib/payment';

export default function Home() {
  const [serviceType, setServiceType] = useState<'free' | 'premium'>('free');
  const [linkTikTok, setLinkTikTok] = useState('');
  const [jumlahView, setJumlahView] = useState<number>(1000);
  const [loading, setLoading] = useState(false);
  const [orderResult, setOrderResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [pollingActive, setPollingActive] = useState(false);

  const calculatePrice = (views: number) => {
    if (serviceType === 'free') return 0;
    // Rp 100 per 1000 views
    return Math.max(100, Math.floor((views / 1000) * 100));
  };

  const currentPrice = calculatePrice(jumlahView);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          linkTikTok,
          jumlahView,
          serviceType,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Gagal memproses pesanan');
      }

      setOrderResult(data);
      if (serviceType === 'premium') {
        setPollingActive(true);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Payment Polling
  useEffect(() => {
    // Changed NodeJS.Timeout to any to fix missing namespace error in browser
    let interval: any;
    if (pollingActive && orderResult?.id) {
      interval = setInterval(async () => {
        try {
          const res = await fetch(`/api/payment/check?id=${orderResult.id}`);
          const data = await res.json();
          if (data.status === 'paid') {
            setOrderResult((prev: any) => ({ ...prev, status: 'paid' }));
            setPollingActive(false);
          }
        } catch (err) {
          console.error('Polling error:', err);
        }
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [pollingActive, orderResult]);

  return (
    <main className="min-h-screen pb-20">
      {/* Header */}
      <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-primary-100 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <div className="bg-primary-500 p-2 rounded-xl">
              <Rocket className="text-white w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold text-primary-900 tracking-tight">Nexa Suntik Sosial</h1>
          </motion.div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 mt-12">
        {/* Hero Section */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-extrabold text-primary-950 mb-4">
            Booster TikTok Views <span className="text-primary-500">Otomatis</span>
          </h2>
          <p className="text-primary-700 text-lg">
            Tingkatkan interaksi konten TikTok Anda dengan cepat, aman, dan terpercaya.
          </p>
        </motion.section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Form Section */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="lg:col-span-7 bg-white p-8 rounded-3xl shadow-xl shadow-primary-100 border border-primary-50"
          >
            <div className="flex items-center gap-3 mb-8">
              <Zap className="text-primary-500 w-6 h-6" />
              <h3 className="text-xl font-bold text-primary-900">Form Pemesanan</h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Service Toggle */}
              <div>
                <label className="block text-sm font-semibold text-primary-900 mb-3">Pilih Layanan</label>
                <div className="flex p-1 bg-primary-50 rounded-2xl">
                  <button
                    type="button"
                    onClick={() => {
                      setServiceType('free');
                      if (jumlahView > 2992) setJumlahView(2992);
                    }}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all ${
                      serviceType === 'free' 
                      ? 'bg-white text-primary-600 shadow-sm font-bold' 
                      : 'text-primary-400'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4" />
                    FREE
                  </button>
                  <button
                    type="button"
                    onClick={() => setServiceType('premium')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all ${
                      serviceType === 'premium' 
                      ? 'bg-primary-500 text-white shadow-lg shadow-primary-200 font-bold' 
                      : 'text-primary-400'
                    }`}
                  >
                    <CreditCard className="w-4 h-4" />
                    PREMIUM
                  </button>
                </div>
              </div>

              {/* TikTok Link */}
              <div>
                <label className="block text-sm font-semibold text-primary-900 mb-2">Link Video TikTok</label>
                <input
                  type="url"
                  required
                  placeholder="https://vt.tiktok.com/..."
                  className="input-field"
                  value={linkTikTok}
                  onChange={(e) => setLinkTikTok(e.target.value)}
                />
              </div>

              {/* Views Count */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-semibold text-primary-900">Jumlah View</label>
                  <span className="text-xs text-primary-500 font-bold">{jumlahView.toLocaleString()} Views</span>
                </div>
                <input
                  type="range"
                  min="1000"
                  max={serviceType === 'free' ? 2992 : 100000}
                  step="100"
                  className="w-full h-2 bg-primary-100 rounded-lg appearance-none cursor-pointer accent-primary-500"
                  value={jumlahView}
                  onChange={(e) => setJumlahView(parseInt(e.target.value))}
                />
                <div className="flex justify-between text-[10px] text-primary-400 mt-1">
                  <span>1.000</span>
                  <span>{serviceType === 'free' ? '2.992 (Max)' : '100.000+'}</span>
                </div>
              </div>

              {/* Price Display */}
              <div className="bg-primary-50 p-4 rounded-2xl flex justify-between items-center">
                <span className="text-primary-700 font-medium">Total Harga:</span>
                <span className="text-xl font-bold text-primary-600">
                  {serviceType === 'free' ? 'Rp 0' : `Rp ${currentPrice.toLocaleString()}`}
                </span>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-500 bg-red-50 p-4 rounded-xl text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-4 text-lg shadow-lg shadow-primary-200"
              >
                {loading ? 'Memproses...' : (serviceType === 'free' ? 'Klaim Sekarang' : 'Beli Sekarang')}
              </button>
            </form>
          </motion.div>

          {/* Side Info / Result Section */}
          <div className="lg:col-span-5 space-y-6">
            <AnimatePresence mode="wait">
              {!orderResult ? (
                <motion.div
                  key="info"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-primary-600 p-8 rounded-3xl text-white space-y-6"
                >
                  <h4 className="text-xl font-bold">Kenapa Memilih Nexa?</h4>
                  <ul className="space-y-4">
                    <li className="flex gap-3">
                      <div className="bg-white/20 p-1.5 rounded-lg h-fit"><TrendingUp className="w-4 h-4" /></div>
                      <div>
                        <p className="font-bold">Kecepatan Tinggi</p>
                        <p className="text-primary-100 text-sm">Proses pengiriman views sangat instan dan stabil.</p>
                      </div>
                    </li>
                    <li className="flex gap-3">
                      <div className="bg-white/20 p-1.5 rounded-lg h-fit"><ShieldCheck className="w-4 h-4" /></div>
                      <div>
                        <p className="font-bold">Keamanan Terjamin</p>
                        <p className="text-primary-100 text-sm">Tanpa password, hanya butuh link video TikTok saja.</p>
                      </div>
                    </li>
                  </ul>
                </motion.div>
              ) : (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white p-8 rounded-3xl shadow-xl shadow-primary-100 border border-primary-50 space-y-6"
                >
                  {serviceType === 'free' ? (
                    <div className="text-center">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle2 className="text-green-500 w-10 h-10" />
                      </div>
                      <h4 className="text-xl font-bold text-primary-900 mb-2">Permintaan Anda sedang diproses</h4>
                      <div className="text-left bg-primary-50 p-4 rounded-xl space-y-2 mb-4">
                        <p className="text-sm text-primary-700 flex justify-between">
                          <span>ID User:</span>
                          <span className="font-mono font-bold">{orderResult.user_id}</span>
                        </p>
                        <p className="text-sm text-primary-700 flex justify-between">
                          <span>Status:</span>
                          <span className="text-primary-500 font-bold">Pending</span>
                        </p>
                      </div>
                      <p className="text-sm text-primary-400">
                        Estimasi tinggi dalam waktu 1/2 jam. Jika masih belum masuk, coba hubungi admin.
                      </p>
                    </div>
                  ) : (
                    <div className="text-center">
                      {orderResult.status === 'paid' ? (
                        <div className="py-10">
                          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                            <CheckCircle2 className="text-green-500 w-12 h-12" />
                          </div>
                          <h4 className="text-2xl font-bold text-green-600 mb-2">Pembayaran Berhasil!</h4>
                          <p className="text-primary-600">Pesanan Anda sedang dalam proses pengerjaan otomatis.</p>
                        </div>
                      ) : (
                        <>
                          <h4 className="text-xl font-bold text-primary-900 mb-4">Silakan Selesaikan Pembayaran</h4>
                          <div className="relative group overflow-hidden rounded-2xl border-4 border-primary-100 mb-4">
                             <img src={QRIS_IMAGE_URL} alt="QRIS" className="w-full" />
                             <div className="absolute inset-0 bg-primary-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <span className="text-white text-sm font-bold">Scan with Any Bank / E-Wallet</span>
                             </div>
                          </div>
                          <div className="text-left space-y-3">
                            <div className="flex justify-between items-center bg-primary-50 p-3 rounded-lg">
                              <span className="text-sm text-primary-700">Nominal:</span>
                              <span className="font-bold text-primary-900">Rp {orderResult.harga.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center bg-primary-50 p-3 rounded-lg">
                              <span className="text-sm text-primary-700">Ref:</span>
                              <span className="font-mono font-bold text-xs text-primary-900">{orderResult.payment_ref}</span>
                            </div>
                          </div>
                          <div className="mt-6 flex items-center justify-center gap-2 text-primary-500 text-sm animate-pulse">
                            <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                            Menunggu pembayaran...
                          </div>
                        </>
                      )}
                    </div>
                  )}
                  
                  <button 
                    onClick={() => setOrderResult(null)}
                    className="w-full text-primary-400 hover:text-primary-600 text-sm font-medium pt-2"
                  >
                    Kembali ke Halaman Utama
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <footer className="max-w-7xl mx-auto px-6 mt-20 pt-8 border-t border-primary-100 text-center text-primary-400 text-sm">
        <p>© Nexa Community 2026</p>
      </footer>
    </main>
  );
}