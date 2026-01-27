"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Rocket, CheckCircle2, AlertCircle, ShieldCheck, 
  Zap, TrendingUp, CreditCard, Loader2, Camera
} from 'lucide-react';
import { QRIS_IMAGE_URL } from '@/lib/payment';

export default function Home() {
  const [serviceType, setServiceType] = useState<'free' | 'premium'>('free');
  const [linkTikTok, setLinkTikTok] = useState('');
  const [jumlahView, setJumlahView] = useState<number>(1000);
  const [loading, setLoading] = useState(false);
  const [orderResult, setOrderResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [canConfirm, setCanConfirm] = useState(false);

  const calculatePrice = (views: number) => {
    if (serviceType === 'free') return 0;
    return Math.max(100, Math.floor((views / 1000) * 100));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ linkTikTok, jumlahView, serviceType }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Gagal memproses');

      setOrderResult(data);
      if (serviceType === 'premium') {
        // Aktifkan tombol konfirmasi setelah 10 detik agar user sempat scan
        setTimeout(() => setCanConfirm(true), 10000);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleManualConfirm = async () => {
    setConfirming(true);
    try {
      const res = await fetch('/api/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: orderResult.id })
      });
      if (res.ok) {
        setOrderResult((prev: any) => ({ ...prev, status: 'USER_CONFIRM' }));
      }
    } catch (err) {
      alert('Gagal mengirim konfirmasi');
    } finally {
      setConfirming(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f0f9ff] text-slate-900 pb-20 font-sans">
      <nav className="bg-white/90 backdrop-blur-md sticky top-0 z-50 border-b border-blue-100 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-blue-500 p-2 rounded-xl shadow-lg shadow-blue-200">
              <Rocket className="text-white w-6 h-6" />
            </div>
            <h1 className="text-xl font-black text-blue-900 tracking-tighter uppercase">Nexa Suntik</h1>
          </div>
          <div className="hidden md:flex gap-6 text-sm font-bold text-blue-900/60 uppercase tracking-widest">
            <a href="#" className="hover:text-blue-500 transition-colors">Home</a>
            <a href="#" className="hover:text-blue-500 transition-colors">Pricing</a>
            <a href="/admin/login" className="hover:text-blue-500 transition-colors">Admin</a>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 mt-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          <div className="lg:col-span-7 space-y-8">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <h2 className="text-5xl font-black text-blue-950 leading-none mb-6">
                LEVEL UP YOUR <br/><span className="text-blue-500">TIKTOK PRESENCE</span>
              </h2>
              <p className="text-lg text-blue-800/70 font-medium max-w-md">
                Layanan suntik view tercepat dan teraman di Indonesia. Support pembayaran QRIS otomatis.
              </p>
            </motion.div>

            <motion.div 
              className="bg-white p-8 rounded-[40px] shadow-2xl shadow-blue-200 border border-white"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            >
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex p-1.5 bg-blue-50 rounded-3xl">
                  {(['free', 'premium'] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setServiceType(type)}
                      className={`flex-1 py-4 rounded-[24px] text-sm font-black transition-all uppercase tracking-widest ${
                        serviceType === type ? 'bg-white text-blue-600 shadow-md' : 'text-blue-400'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-blue-900/40 uppercase tracking-widest ml-2">Video Link</label>
                  <input
                    type="url" required placeholder="https://vt.tiktok.com/..."
                    className="w-full bg-blue-50 border-2 border-transparent focus:border-blue-400 focus:bg-white p-5 rounded-3xl outline-none transition-all font-bold text-blue-900"
                    value={linkTikTok} onChange={(e) => setLinkTikTok(e.target.value)}
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center px-2">
                    <label className="text-xs font-black text-blue-900/40 uppercase tracking-widest">Views Target</label>
                    <span className="text-blue-600 font-black">{jumlahView.toLocaleString()}</span>
                  </div>
                  <input
                    type="range" min="1000" max={serviceType === 'free' ? 2992 : 100000} step="100"
                    className="w-full h-3 bg-blue-100 rounded-full appearance-none cursor-pointer accent-blue-500"
                    value={jumlahView} onChange={(e) => setJumlahView(parseInt(e.target.value))}
                  />
                </div>

                <div className="flex items-center justify-between bg-blue-600 p-6 rounded-[30px] text-white">
                  <span className="font-bold opacity-80">Estimasi Biaya</span>
                  <span className="text-2xl font-black">
                    {serviceType === 'free' ? 'GRATIS' : `Rp ${calculatePrice(jumlahView).toLocaleString()}`}
                  </span>
                </div>

                {error && <div className="p-4 bg-red-50 text-red-500 rounded-2xl text-sm font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" /> {error}
                </div>}

                <button
                  type="submit" disabled={loading}
                  className="w-full bg-blue-950 text-white py-6 rounded-[30px] font-black text-lg hover:bg-blue-900 transition-all shadow-xl shadow-blue-100 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="animate-spin mx-auto" /> : 'MULAI SEKARANG'}
                </button>
              </form>
            </motion.div>
          </div>

          <div className="lg:col-span-5">
            <AnimatePresence mode="wait">
              {!orderResult ? (
                <motion.div key="benefit" className="space-y-6">
                  {[
                    { icon: Zap, title: "Instan", desc: "Proses masuk dalam hitungan menit." },
                    { icon: ShieldCheck, title: "Aman", desc: "Tidak memerlukan password akun." },
                    { icon: TrendingUp, title: "Kualitas", desc: "View dari akun real dan aktif." }
                  ].map((item, i) => (
                    <div key={i} className="flex gap-4 items-center bg-white p-6 rounded-[32px] border border-blue-50">
                      <div className="bg-blue-100 p-3 rounded-2xl text-blue-600"><item.icon /></div>
                      <div>
                        <h4 className="font-black text-blue-950 text-sm uppercase">{item.title}</h4>
                        <p className="text-blue-800/60 text-xs font-medium">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </motion.div>
              ) : (
                <motion.div 
                  key="result" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                  className="bg-white p-10 rounded-[40px] shadow-2xl border-4 border-blue-50 text-center"
                >
                  {orderResult.status === 'USER_CONFIRM' ? (
                    <div className="space-y-6">
                      <div className="bg-blue-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto">
                        <CheckCircle2 className="text-blue-500 w-12 h-12" />
                      </div>
                      <h3 className="text-2xl font-black text-blue-950">PESANAN DITERIMA</h3>
                      <p className="text-blue-800/70 text-sm font-medium">
                        Admin kami akan memvalidasi pembayaran Anda. Estimasi waktu pengecekan adalah 15-30 menit.
                      </p>
                      <button onClick={() => setOrderResult(null)} className="text-blue-500 font-bold text-sm">Kembali</button>
                    </div>
                  ) : orderResult.service_type === 'free' ? (
                    <div className="space-y-6">
                       <CheckCircle2 className="text-green-500 w-20 h-20 mx-auto" />
                       <h3 className="text-2xl font-black text-blue-950">ANTRIAN FREE</h3>
                       <p className="text-sm text-slate-500">Order Anda sudah masuk antrian sistem gratis. Silakan cek berkala.</p>
                       <button onClick={() => setOrderResult(null)} className="btn-primary w-full">Selesai</button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                       <h3 className="text-xl font-black text-blue-950">PEMBAYARAN QRIS</h3>
                       <div className="bg-white p-4 rounded-3xl border-2 border-blue-100">
                          <img src={QRIS_IMAGE_URL} alt="QRIS" className="w-full rounded-2xl" />
                       </div>
                       <div className="text-left bg-blue-50 p-6 rounded-3xl space-y-2">
                          <div className="flex justify-between text-xs font-bold text-blue-900/40 uppercase"><span>Nominal</span> <span>Rp {orderResult.harga}</span></div>
                          <div className="flex justify-between text-xs font-bold text-blue-900/40 uppercase"><span>Ref</span> <span className="font-mono">{orderResult.payment_ref}</span></div>
                       </div>
                       
                       {canConfirm ? (
                         <button 
                           onClick={handleManualConfirm} disabled={confirming}
                           className="w-full bg-blue-600 text-white py-5 rounded-[24px] font-black text-sm uppercase tracking-widest shadow-lg shadow-blue-200"
                         >
                           {confirming ? 'Mengirim...' : 'Saya Sudah Bayar'}
                         </button>
                       ) : (
                         <p className="text-[10px] text-blue-400 font-bold uppercase animate-pulse italic">
                           Mohon selesaikan pembayaran sebelum mengonfirmasi...
                         </p>
                       )}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <footer className="text-center mt-20 text-blue-900/30 font-black text-[10px] uppercase tracking-[4px]">
        © 2026 NEXA COMMUNITY SUNTIK SOSIAL
      </footer>
    </main>
  );
}