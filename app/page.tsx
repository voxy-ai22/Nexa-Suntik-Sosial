"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Rocket, CheckCircle2, AlertCircle, ShieldCheck, 
  Zap, TrendingUp, Loader2, Camera, Phone, History, Clock
} from 'lucide-react';
import { QRIS_IMAGE_URL } from '@/lib/payment';

export default function Home() {
  const [serviceType, setServiceType] = useState<'free' | 'premium'>('free');
  const [linkTikTok, setLinkTikTok] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [jumlahView, setJumlahView] = useState<number>(1000);
  const [loading, setLoading] = useState(false);
  const [orderResult, setOrderResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [timer, setTimer] = useState(60);
  const [deviceId, setDeviceId] = useState('');
  const [userHistory, setUserHistory] = useState<any[]>([]);

  useEffect(() => {
    let id = localStorage.getItem('nexa_device_id');
    if (!id) {
      id = 'NEXA-DEV-' + Math.random().toString(36).substring(2, 12).toUpperCase();
      localStorage.setItem('nexa_device_id', id);
    }
    setDeviceId(id);
    fetchHistory(id);
  }, []);

  const fetchHistory = async (id: string) => {
    try {
      const res = await fetch(`/api/history?deviceId=${id}`);
      if (res.ok) setUserHistory(await res.json());
    } catch (e) {}
  };

  useEffect(() => {
    let interval: any;
    if (orderResult && orderResult.status === 'WAITING_PAYMENT' && timer > 0) {
      interval = setInterval(() => setTimer(prev => prev - 1), 1000);
    } else if (timer === 0 && orderResult?.status === 'WAITING_PAYMENT') {
      setOrderResult((prev: any) => ({ ...prev, status: 'EXPIRED' }));
    }
    return () => clearInterval(interval);
  }, [orderResult, timer]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setTimer(60);

    try {
      const response = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ linkTikTok, jumlahView, serviceType, phoneNumber, deviceId }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Gagal memproses');

      setOrderResult(data);
      fetchHistory(deviceId);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      setLoading(true);
      try {
        await fetch('/api/confirm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId: orderResult.id, proofImage: reader.result })
        });
        setOrderResult((prev: any) => ({ ...prev, status: 'USER_CONFIRM' }));
        fetchHistory(deviceId);
      } catch (e) {} finally { setLoading(false); }
    };
  };

  return (
    <main className="min-h-screen bg-white text-slate-900 pb-20 selection:bg-blue-100 selection:text-blue-600">
      <nav className="bg-white/80 backdrop-blur-xl sticky top-0 z-50 border-b border-slate-100 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2.5 rounded-2xl shadow-xl shadow-blue-200">
              <Rocket className="text-white w-6 h-6" />
            </div>
            <h1 className="text-xl font-black text-slate-900 tracking-tighter uppercase">Nexa Sosial</h1>
          </div>
          <a href="/admin/login" className="text-xs font-black text-slate-400 uppercase hover:text-blue-600 transition-all tracking-[2px]">Admin Access</a>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 mt-16 lg:mt-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          
          <div className="lg:col-span-7 space-y-12">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="inline-flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-full text-blue-600 text-xs font-black uppercase tracking-widest mb-6">
                <Zap className="w-3 h-3" /> Terjamin & Aman
              </div>
              <h2 className="text-6xl font-black text-slate-900 leading-[0.9] tracking-tighter mb-8">
                LEVEL UP YOUR <br/><span className="text-blue-600">SOCIAL PRESENCE</span>
              </h2>
              <p className="text-lg text-slate-400 font-bold max-w-lg leading-relaxed">
                Layanan Suntik Sosial, Terjamin dan kalau Riwayat failed admin akan mengembalikan dana, 
                jadi usahakan pakai nomor aktif biar bisa pengembalian dana.
              </p>
            </motion.div>

            <div className="bg-[#f8fafc] p-8 md:p-12 rounded-[48px] border border-slate-100 shadow-2xl shadow-slate-200/50">
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="flex p-2 bg-white rounded-[32px] border border-slate-200 shadow-sm">
                  {(['free', 'premium'] as const).map((type) => (
                    <button
                      key={type} type="button" onClick={() => setServiceType(type)}
                      className={`flex-1 py-4 rounded-[24px] text-sm font-black transition-all uppercase tracking-widest ${
                        serviceType === type ? 'bg-blue-600 text-white shadow-xl shadow-blue-200' : 'text-slate-400'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Video Link</label>
                    <input
                      type="url" required placeholder="https://vt.tiktok.com/..."
                      className="w-full bg-white border border-slate-200 focus:border-blue-500 p-5 rounded-3xl outline-none transition-all font-bold text-slate-800"
                      value={linkTikTok} onChange={(e) => setLinkTikTok(e.target.value)}
                    />
                  </div>
                  {serviceType === 'premium' && (
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Nomor WhatsApp Aktif</label>
                      <input
                        type="tel" required placeholder="0812..."
                        className="w-full bg-white border border-slate-200 focus:border-blue-500 p-5 rounded-3xl outline-none transition-all font-bold text-slate-800"
                        value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)}
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  <div className="flex justify-between items-center px-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Views Target</label>
                    <span className="text-blue-600 font-black text-xl">{jumlahView.toLocaleString()}</span>
                  </div>
                  <input
                    type="range" min="1000" max={serviceType === 'free' ? 2992 : 100000} step="100"
                    className="w-full h-2 bg-slate-200 rounded-full appearance-none cursor-pointer accent-blue-600"
                    value={jumlahView} onChange={(e) => setJumlahView(parseInt(e.target.value))}
                  />
                </div>

                <button
                  type="submit" disabled={loading}
                  className="w-full bg-slate-900 text-white py-6 rounded-[32px] font-black text-lg hover:bg-blue-600 transition-all shadow-2xl shadow-slate-200 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="animate-spin mx-auto" /> : 'PROSES SEKARANG'}
                </button>
              </form>
            </div>
          </div>

          <div className="lg:col-span-5 sticky top-32">
            <AnimatePresence mode="wait">
              {!orderResult ? (
                <motion.div key="history" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                  <div className="flex items-center gap-3 mb-4">
                    <History className="text-blue-600" />
                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Riwayat Saya</h3>
                  </div>
                  {userHistory.length === 0 ? (
                    <div className="bg-slate-50 p-8 rounded-[40px] border border-slate-100 text-center">
                      <p className="text-slate-400 font-bold text-sm italic">Belum ada pesanan dari perangkat ini.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {userHistory.map((h) => (
                        <div key={h.id} className="bg-white p-5 rounded-[28px] border border-slate-100 shadow-sm flex justify-between items-center">
                          <div className="min-w-0">
                            <div className="text-[10px] font-black text-blue-600 uppercase mb-1">{h.service_type}</div>
                            <div className="text-sm font-black text-slate-800 truncate">{h.jumlah_view.toLocaleString()} Views</div>
                          </div>
                          <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase border ${
                            h.status === 'PAID' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-slate-50 text-slate-400 border-slate-200'
                          }`}>
                            {h.status.replace('_', ' ')}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div 
                  key="result" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                  className="bg-white p-10 rounded-[48px] shadow-2xl border border-slate-100 text-center space-y-8"
                >
                  {orderResult.status === 'EXPIRED' ? (
                     <div className="space-y-6 py-10">
                        <XCircle className="w-20 h-20 text-red-500 mx-auto" />
                        <h3 className="text-2xl font-black">WAKTU HABIS</h3>
                        <p className="text-slate-400 font-medium">Sesi pembayaran telah berakhir. Silakan ulangi pesanan.</p>
                        <button onClick={() => setOrderResult(null)} className="btn-primary w-full">ULANGI</button>
                     </div>
                  ) : orderResult.status === 'USER_CONFIRM' ? (
                    <div className="space-y-6 py-10">
                      <CheckCircle2 className="text-blue-600 w-20 h-20 mx-auto" />
                      <h3 className="text-2xl font-black">MENUNGGU VALIDASI</h3>
                      <p className="text-slate-400 font-medium">Admin akan mengecek bukti pembayaran Anda. Status akan update di riwayat.</p>
                      <button onClick={() => setOrderResult(null)} className="text-blue-600 font-black uppercase text-sm">Tutup</button>
                    </div>
                  ) : orderResult.service_type === 'free' ? (
                    <div className="space-y-6 py-10">
                       <CheckCircle2 className="text-green-500 w-20 h-20 mx-auto" />
                       <h3 className="text-2xl font-black">SUKSES (FREE)</h3>
                       <p className="text-slate-400 font-medium text-sm">View sedang diproses masuk secara bertahap.</p>
                       <button onClick={() => setOrderResult(null)} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black">SELESAI</button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                       <div className="flex justify-between items-center bg-red-50 text-red-600 px-6 py-4 rounded-3xl">
                          <span className="text-xs font-black uppercase tracking-widest">Sisa Waktu</span>
                          <span className="font-mono font-black text-xl flex items-center gap-2"><Clock className="w-5 h-5"/> {timer}s</span>
                       </div>
                       <h3 className="text-xl font-black text-slate-900">PEMBAYARAN QRIS</h3>
                       <div className="bg-white p-4 rounded-3xl border-2 border-slate-100 shadow-inner">
                          <img src={QRIS_IMAGE_URL} alt="QRIS" className="w-full rounded-2xl" />
                       </div>
                       <div className="text-left bg-blue-50 p-6 rounded-3xl space-y-2">
                          <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-widest"><span>Nominal</span> <span className="text-blue-600 font-black">Rp {orderResult.harga}</span></div>
                          <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-widest"><span>Ref</span> <span className="font-mono text-slate-600">{orderResult.payment_ref}</span></div>
                       </div>
                       
                       <label className="flex flex-col items-center justify-center w-full bg-blue-600 text-white py-5 rounded-[24px] font-black text-sm uppercase tracking-widest shadow-xl shadow-blue-200 cursor-pointer hover:bg-blue-700 transition-all">
                          <Camera className="w-5 h-5 mb-1" /> {loading ? 'Mengirim...' : 'Upload Bukti Bayar'}
                          <input type="file" className="hidden" accept="image/*" onChange={handleConfirm} disabled={loading} />
                       </label>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </main>
  );
}

function XCircle(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>
  );
}