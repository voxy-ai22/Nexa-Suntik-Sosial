"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Rocket, CheckCircle2, AlertCircle, ShieldCheck, 
  Zap, TrendingUp, Loader2, Camera, Phone, History, Clock, XCircle
} from 'lucide-react';
import { QRIS_IMAGE_URL } from '@/lib/payment';

export default function Home() {
  const [serviceType, setServiceType] = useState<'FREE' | 'PREMIUM'>('FREE');
  const [linkTikTok, setLinkTikTok] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [jumlahView, setJumlahView] = useState<number>(1000);
  const [loading, setLoading] = useState(false);
  const [orderResult, setOrderResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [timer, setTimer] = useState(60);
  const [deviceId, setDeviceId] = useState('');
  const [userHistory, setUserHistory] = useState<any[]>([]);

  // Harga: 100 per 1000 views
  const calculatePrice = (views: number) => Math.max(100, Math.floor((views / 1000) * 100));

  useEffect(() => {
    let id = localStorage.getItem('nexa_device_id');
    if (!id) {
      id = 'NX-' + Math.random().toString(36).substring(2, 10).toUpperCase();
      localStorage.setItem('nexa_device_id', id);
    }
    setDeviceId(id);
    fetchHistory(id);
  }, []);

  const fetchHistory = async (id: string) => {
    try {
      const res = await fetch(`/api/history?deviceId=${id}`);
      if (res.ok) {
        const data = await res.json();
        setUserHistory(data);
      }
    } catch (e) {}
  };

  useEffect(() => {
    let interval: any;
    if (orderResult && orderResult.status === 'pending_payment' && timer > 0) {
      interval = setInterval(() => setTimer(prev => prev - 1), 1000);
    } else if (timer === 0 && orderResult?.status === 'pending_payment') {
      setOrderResult((prev: any) => ({ ...prev, status: 'failed' }));
    }
    return () => clearInterval(interval);
  }, [orderResult, timer]);

  // Real-time sync: Cek status pesanan aktif setiap 5 detik
  useEffect(() => {
    let checkInterval: any;
    if (orderResult && (orderResult.status === 'waiting_admin' || orderResult.status === 'processing' || orderResult.status === 'pending_payment')) {
      checkInterval = setInterval(async () => {
        try {
          const res = await fetch(`/api/history?deviceId=${deviceId}`);
          if (res.ok) {
            const history = await res.json();
            const currentOrder = history.find((h: any) => h.id === orderResult.id);
            if (currentOrder && currentOrder.status !== orderResult.status) {
              setOrderResult(currentOrder);
            }
            setUserHistory(history);
          }
        } catch (e) {}
      }, 5000);
    }
    return () => clearInterval(checkInterval);
  }, [orderResult, deviceId]);

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
    if (file.size > 2 * 1024 * 1024) return alert('File terlalu besar (Maks 2MB)');
    
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/confirm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId: orderResult.id, proofImage: reader.result })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        
        setOrderResult((prev: any) => ({ ...prev, status: 'waiting_admin' }));
        fetchHistory(deviceId);
      } catch (err: any) {
        alert(err.message);
      } finally { setLoading(false); }
    };
  };

  return (
    <main className="min-h-screen bg-[#fcfdfe] text-slate-900 pb-20 selection:bg-blue-100 font-sans">
      <nav className="bg-white/80 backdrop-blur-2xl sticky top-0 z-50 border-b border-slate-100 px-6 py-5">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2.5 rounded-2xl shadow-xl shadow-blue-100">
              <Rocket className="text-white w-6 h-6" />
            </div>
            <h1 className="text-xl font-black text-slate-900 tracking-tighter uppercase italic">Nexa Sosial</h1>
          </div>
          <div className="flex items-center gap-4">
             <a href="/admin/dashboard" className="text-[10px] font-black text-slate-400 uppercase hover:text-blue-600 transition-all tracking-[2px] border-b-2 border-transparent hover:border-blue-600">Admin Panel</a>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 mt-12 lg:mt-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          
          <div className="lg:col-span-7 space-y-12">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="inline-flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-full text-blue-600 text-[10px] font-black uppercase tracking-widest mb-8">
                <Zap className="w-3 h-3" /> Instan & Terpercaya
              </div>
              <h2 className="text-6xl md:text-7xl font-black text-slate-900 leading-[0.85] tracking-tighter mb-8">
                BOOST YOUR <br/><span className="text-blue-600">SOCIAL REACH</span>
              </h2>
              <p className="text-lg text-slate-400 font-bold max-w-lg leading-relaxed italic">
                Layanan Suntik Sosial, Terjamin dan jika terjadi kegagalan admin akan mengembalikan dana via nomor aktif Anda.
              </p>
            </motion.div>

            <div className="bg-white p-8 md:p-12 rounded-[48px] border border-slate-100 shadow-2xl shadow-slate-200/40">
              <form onSubmit={handleSubmit} className="space-y-10">
                <div className="flex p-2 bg-slate-50 rounded-[32px] border border-slate-100">
                  {(['FREE', 'PREMIUM'] as const).map((type) => (
                    <button
                      key={type} type="button" onClick={() => {
                        setServiceType(type);
                        setJumlahView(1000);
                      }}
                      className={`flex-1 py-4 rounded-[24px] text-xs font-black transition-all uppercase tracking-widest ${
                        serviceType === type ? 'bg-white text-blue-600 shadow-xl shadow-blue-50 border border-slate-50' : 'text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>

                <div className="space-y-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest ml-4">TikTok Video Link</label>
                    <input
                      type="url" required placeholder="https://vt.tiktok.com/..."
                      className="w-full bg-slate-50 border border-slate-100 focus:bg-white focus:border-blue-500 p-6 rounded-[28px] outline-none transition-all font-bold text-slate-800"
                      value={linkTikTok} onChange={(e) => setLinkTikTok(e.target.value)}
                    />
                  </div>
                  
                  {serviceType === 'PREMIUM' && (
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest ml-4">Nomor WhatsApp Aktif (Untuk Refund)</label>
                      <input
                        type="tel" required placeholder="08..."
                        className="w-full bg-slate-50 border border-slate-100 focus:bg-white focus:border-blue-500 p-6 rounded-[28px] outline-none transition-all font-bold text-slate-800"
                        value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)}
                      />
                    </div>
                  )}

                  <div className="space-y-6">
                    <div className="flex justify-between items-center px-4">
                      <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Views Target</label>
                      <span className="text-blue-600 font-black text-2xl tracking-tighter italic">{jumlahView.toLocaleString()} Views</span>
                    </div>
                    <input
                      type="range" min="1000" max={serviceType === 'FREE' ? 2900 : 50000} step="100"
                      className="w-full h-2 bg-slate-100 rounded-full appearance-none cursor-pointer accent-blue-600"
                      value={jumlahView} onChange={(e) => setJumlahView(parseInt(e.target.value))}
                    />
                    <div className="flex justify-between px-2">
                       <span className="text-[9px] font-bold text-slate-300">1K</span>
                       <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Maksimal {serviceType === 'FREE' ? '3K' : '50K'}</span>
                    </div>
                  </div>
                </div>

                {serviceType === 'PREMIUM' && (
                   <div className="bg-blue-50 p-6 rounded-[28px] border border-blue-100 flex justify-between items-center">
                      <span className="text-xs font-black text-blue-600 uppercase tracking-widest">Total Bayar:</span>
                      <span className="text-2xl font-black text-slate-900 tracking-tighter">Rp {calculatePrice(jumlahView).toLocaleString()}</span>
                   </div>
                )}

                {error && <div className="p-4 bg-red-50 text-red-500 rounded-2xl text-[10px] font-black uppercase flex items-center gap-2 border border-red-100">
                  <AlertCircle className="w-4 h-4" /> {error}
                </div>}

                <button
                  type="submit" disabled={loading}
                  className="w-full bg-slate-900 text-white py-6 rounded-[32px] font-black text-lg hover:bg-blue-600 transition-all shadow-2xl shadow-slate-200 disabled:opacity-50 uppercase tracking-widest italic"
                >
                  {loading ? <Loader2 className="animate-spin mx-auto" /> : (serviceType === 'FREE' ? 'Dapatkan Views Gratis' : 'Pesan Views Premium')}
                </button>
              </form>
            </div>
          </div>

          <div className="lg:col-span-5 sticky top-32">
            <AnimatePresence mode="wait">
              {!orderResult ? (
                <motion.div key="history" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <History className="text-blue-600" />
                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">My History</h3>
                  </div>
                  {userHistory.length === 0 ? (
                    <div className="bg-white p-12 rounded-[48px] border border-dashed border-slate-100 text-center">
                      <p className="text-slate-300 font-bold text-xs uppercase tracking-widest">No orders yet from this device.</p>
                    </div>
                  ) : (
                    <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                      {userHistory.map((h) => (
                        <div key={h.id} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex justify-between items-center group hover:shadow-md transition-all">
                          <div className="min-w-0">
                            <div className="text-[9px] font-black text-blue-600 uppercase mb-1 tracking-widest">{h.service_type}</div>
                            <div className="text-sm font-black text-slate-800 truncate">{h.jumlah_view.toLocaleString()} Views</div>
                            <div className="text-[10px] text-slate-300 font-bold mt-1">{new Date(h.created_at).toLocaleDateString()}</div>
                          </div>
                          <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase border tracking-widest ${
                            h.status === 'success' ? 'bg-green-50 text-green-600 border-green-100' : 
                            h.status === 'failed' ? 'bg-red-50 text-red-600 border-red-100' :
                            h.status === 'waiting_admin' ? 'bg-blue-50 text-blue-600 border-blue-100 animate-pulse' :
                            'bg-slate-50 text-slate-400 border-slate-100'
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
                  className="bg-white p-12 rounded-[48px] shadow-2xl border border-slate-100 text-center space-y-10"
                >
                  {orderResult.status === 'failed' ? (
                     <div className="space-y-8">
                        <XCircle className="w-20 h-20 text-red-500 mx-auto" />
                        <h3 className="text-3xl font-black tracking-tight">EXPIRED</h3>
                        <p className="text-slate-400 font-bold text-sm leading-relaxed uppercase tracking-widest">Sesi pembayaran telah berakhir.<br/>Mohon ulangi pesanan Anda.</p>
                        <button onClick={() => setOrderResult(null)} className="w-full bg-slate-900 text-white py-5 rounded-[24px] font-black uppercase tracking-widest">Ulangi</button>
                     </div>
                  ) : orderResult.status === 'success' ? (
                    <div className="space-y-8">
                      <div className="bg-green-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto shadow-inner">
                        <CheckCircle2 className="text-green-500 w-12 h-12" />
                      </div>
                      <h3 className="text-3xl font-black tracking-tight uppercase">SUCCESS</h3>
                      <p className="text-slate-400 font-medium text-sm italic">Admin telah menyetujui pembayaran Anda. Views akan segera masuk secara bertahap!</p>
                      <button onClick={() => setOrderResult(null)} className="w-full bg-slate-900 text-white py-5 rounded-[24px] font-black uppercase">Selesai</button>
                    </div>
                  ) : orderResult.status === 'waiting_admin' ? (
                    <div className="space-y-8">
                      <div className="bg-blue-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto shadow-inner">
                        <Loader2 className="text-blue-600 w-12 h-12 animate-spin" />
                      </div>
                      <h3 className="text-3xl font-black tracking-tight uppercase">VERIFYING...</h3>
                      <p className="text-slate-400 font-medium text-sm italic uppercase tracking-widest">Bukti telah terkirim ke Admin.<br/>Mohon tunggu validasi manual (5-10 mnt).</p>
                      <button onClick={() => setOrderResult(null)} className="text-blue-600 font-black uppercase text-xs border-b-2 border-blue-600 pb-1">Tutup Sesi Ini</button>
                    </div>
                  ) : orderResult.service_type === 'FREE' ? (
                    <div className="space-y-8">
                       <CheckCircle2 className="text-green-500 w-20 h-20 mx-auto" />
                       <h3 className="text-3xl font-black uppercase tracking-tight">QUEUED</h3>
                       <p className="text-slate-400 font-medium text-sm italic">Pesanan Gratis Anda sudah masuk antrian processing.</p>
                       <button onClick={() => setOrderResult(null)} className="w-full bg-slate-900 text-white py-5 rounded-[24px] font-black uppercase">Selesai</button>
                    </div>
                  ) : (
                    <div className="space-y-8">
                       <div className="flex justify-between items-center bg-red-50 text-red-600 px-6 py-4 rounded-[24px]">
                          <span className="text-[10px] font-black uppercase tracking-widest">Sisa Waktu Scan</span>
                          <span className="font-mono font-black text-2xl flex items-center gap-2"><Clock className="w-5 h-5"/> {timer}s</span>
                       </div>
                       <div className="space-y-2">
                         <h3 className="text-xl font-black text-slate-900 uppercase tracking-widest">Scan QRIS</h3>
                         <div className="bg-slate-50 p-4 rounded-[32px] border border-slate-100 shadow-inner">
                            <img src={QRIS_IMAGE_URL} alt="QRIS" className="w-full rounded-[16px] border border-white" />
                         </div>
                       </div>
                       
                       <div className="bg-slate-50 p-6 rounded-[28px] border border-slate-100 space-y-3">
                          <div className="flex justify-between text-[10px] font-black text-slate-300 uppercase"><span>Nominal Transfer</span> <span className="text-blue-600 font-black text-lg tracking-tighter italic">Rp {calculatePrice(orderResult.views).toLocaleString()}</span></div>
                          <div className="flex justify-between text-[10px] font-black text-slate-300 uppercase"><span>Order Ref</span> <span className="text-slate-800 font-mono">#{orderResult.id.substring(0,6).toUpperCase()}</span></div>
                       </div>
                       
                       <label className="flex flex-col items-center justify-center w-full bg-blue-600 text-white py-6 rounded-[28px] font-black text-sm uppercase tracking-widest shadow-2xl shadow-blue-100 cursor-pointer hover:bg-blue-700 transition-all italic">
                          {loading ? <Loader2 className="animate-spin" /> : <><Camera className="w-6 h-6 mb-2" /> Upload Bukti Pembayaran</>}
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
      
      <footer className="text-center mt-24 text-slate-200 font-black text-[9px] uppercase tracking-[6px] italic pb-10">
        © 2026 NEXA SOSIAL COMMUNITY • FASTEST CLOUD BOOST
      </footer>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `}</style>
    </main>
  );
}