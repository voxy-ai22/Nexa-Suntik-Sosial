"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Rocket, CheckCircle2, Loader2, Camera, History, XCircle,
  MessageCircle, Send, FileText, ShieldCheck, Menu, X, Home as HomeIcon,
  ChevronRight, Clock, ShieldAlert, Info, AlertTriangle, RefreshCw, CreditCard
} from 'lucide-react';
import { QRIS_IMAGE_URL } from '@/lib/payment';

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [serviceType, setServiceType] = useState<'FREE' | 'PREMIUM'>('FREE');
  const [linkTikTok, setLinkTikTok] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [jumlahView, setJumlahView] = useState<number>(1000);
  const [loading, setLoading] = useState(false);
  const [orderResult, setOrderResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [timer, setTimer] = useState(120);
  const [deviceId, setDeviceId] = useState('');
  const [userHistory, setUserHistory] = useState<any[]>([]);
  
  const [showSupport, setShowSupport] = useState(false);
  const [showDoc, setShowDoc] = useState(false);
  const [supportEmail, setSupportEmail] = useState('');
  const [supportOrderId, setSupportOrderId] = useState('');
  const [supportMessage, setSupportMessage] = useState('');
  const [supportLoading, setSupportLoading] = useState(false);

  // Updated pricing logic: 398 IDR per 1,000 views. 
  // Max views updated to 200k.
  const price = useMemo(() => {
    if (serviceType === 'FREE') return 0;
    const unitsOf1k = Math.floor(jumlahView / 1000);
    return unitsOf1k * 398;
  }, [jumlahView, serviceType]);

  const fetchHistory = useCallback(async (id: string) => {
    if (!id) return;
    try {
      const res = await fetch(`/api/history?deviceId=${id}`);
      if (res.ok) {
        const data = await res.json();
        setUserHistory(data);
      }
    } catch (e) {
      console.warn("History fetch failed");
    }
  }, []);

  useEffect(() => {
    let id = localStorage.getItem('nexa_device_id');
    if (!id) {
      id = 'NX-' + Math.random().toString(36).substring(2, 10).toUpperCase();
      localStorage.setItem('nexa_device_id', id);
    }
    setDeviceId(id);
    fetchHistory(id);
  }, [fetchHistory]);

  useEffect(() => {
    let interval: any;
    if (orderResult?.service_type === 'PREMIUM' && timer > 0 && orderResult.status === 'pending_payment') {
      interval = setInterval(() => setTimer(t => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [orderResult, timer]);

  const handleSupportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSupportLoading(true);
    try {
      const res = await fetch('/api/support/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: supportEmail, orderId: supportOrderId, message: supportMessage })
      });
      if (res.ok) {
        alert('Laporan terkirim. Cek email Anda untuk konfirmasi bantuan otomatis.');
        setShowSupport(false);
        setSupportMessage('');
      }
    } catch (e) {
      alert('Gagal mengirim bantuan');
    } finally {
      setSupportLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setTimer(120);
    try {
      const response = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          linkTikTok, 
          jumlahView: serviceType === 'FREE' ? 1000 : jumlahView, 
          serviceType, 
          phoneNumber, 
          deviceId 
        })
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.message || 'Terjadi kesalahan');
      } else {
        setOrderResult(data);
        fetchHistory(deviceId);
      }
    } catch (err) {
      setError('Gagal menghubungkan ke server');
    } finally {
      setLoading(false);
    }
  };

  const checkPayment = async () => {
    if (!orderResult?.id) return;
    try {
      const res = await fetch(`/api/payment/check?id=${orderResult.id}`);
      const data = await res.json();
      if (data.status === 'processing' || data.status === 'success') {
        setOrderResult({ ...orderResult, status: data.status });
        fetchHistory(deviceId);
      } else if (data.status === 'waiting_admin') {
         setOrderResult({ ...orderResult, status: 'waiting_admin' });
      }
    } catch (e) {}
  };

  return (
    <div className="min-h-screen bg-primary-50 text-primary-900 font-sans selection:bg-primary-200">
      {/* Navbar */}
      <nav className="bg-white/80 backdrop-blur-lg border-b border-primary-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2 group cursor-pointer" onClick={() => window.scrollTo(0, 0)}>
            <div className="bg-primary-500 p-2 rounded-xl group-hover:rotate-12 transition-transform">
              <Rocket className="text-white w-5 h-5" />
            </div>
            <h1 className="font-black text-xl tracking-tighter italic">NEXA SOSIAL</h1>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <button onClick={() => setShowDoc(true)} className="text-sm font-bold text-primary-400 hover:text-primary-600 transition-colors">DOKUMENTASI</button>
            <button onClick={() => setShowSupport(true)} className="text-sm font-bold text-primary-400 hover:text-primary-600 transition-colors">SUPPORT</button>
            <button className="bg-primary-500 hover:bg-primary-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-primary-100 transition-all active:scale-95">ORDER SEKARANG</button>
          </div>

          <button className="md:hidden p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <header className="text-center mb-16 space-y-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="inline-block bg-primary-100 text-primary-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
            #1 TikTok Booster Service
          </motion.div>
          <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-5xl md:text-6xl font-black italic tracking-tighter">
            BOOST VIEWS <span className="text-primary-500">SEKETIKA.</span>
          </motion.h2>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-primary-400 font-medium max-w-lg mx-auto leading-relaxed">
            Tingkatkan interaksi konten TikTok Anda dengan layanan otomatis. Pilih GRATIS untuk mencoba, atau PREMIUM untuk hasil maksimal.
          </motion.p>
        </header>

        <div className="grid md:grid-cols-12 gap-10 items-start">
          {/* Form Section */}
          <div className="md:col-span-7">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="bg-white p-8 rounded-[32px] shadow-2xl shadow-primary-100/50 border border-primary-100 relative overflow-hidden">
              <div className="flex bg-primary-50 p-1.5 rounded-2xl mb-8 border border-primary-100">
                <button onClick={() => { setServiceType('FREE'); setOrderResult(null); setError(null); }} className={`flex-1 py-3 rounded-xl text-sm font-black transition-all ${serviceType === 'FREE' ? 'bg-white text-primary-600 shadow-md' : 'text-primary-400 hover:text-primary-500'}`}>FREE</button>
                <button onClick={() => { setServiceType('PREMIUM'); setOrderResult(null); setError(null); }} className={`flex-1 py-3 rounded-xl text-sm font-black transition-all ${serviceType === 'PREMIUM' ? 'bg-white text-primary-600 shadow-md' : 'text-primary-400 hover:text-primary-500'}`}>PREMIUM</button>
              </div>

              {!orderResult ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-primary-400 ml-1">Link TikTok Video</label>
                    <div className="relative">
                      <input type="url" placeholder="https://vt.tiktok.com/..." className="input-field pl-12 py-4" value={linkTikTok} onChange={(e) => setLinkTikTok(e.target.value)} required />
                      <Send className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary-300" />
                    </div>
                  </div>

                  {serviceType === 'PREMIUM' && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-primary-400 ml-1">Nomor WhatsApp</label>
                        <input type="tel" placeholder="08..." className="input-field py-4" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} required />
                      </div>
                      <div className="space-y-4 bg-primary-50/50 p-6 rounded-2xl border border-primary-100">
                        <div className="flex justify-between items-end">
                          <label className="text-[10px] font-black uppercase text-primary-400">Jumlah Views</label>
                          <span className="text-xl font-black italic text-primary-600">{jumlahView.toLocaleString()}</span>
                        </div>
                        <input type="range" min="1000" max="200000" step="1000" className="w-full h-2 bg-primary-200 rounded-lg appearance-none cursor-pointer accent-primary-500" value={jumlahView} onChange={(e) => setJumlahView(parseInt(e.target.value))} />
                        <div className="flex justify-between text-[8px] font-black text-primary-300 uppercase">
                          <span>1.000</span>
                          <span>200.000</span>
                        </div>
                        <p className="text-[10px] text-center font-bold text-primary-400 italic">Rp 398 / 1.000 Views</p>
                      </div>
                    </motion.div>
                  )}

                  {serviceType === 'FREE' && (
                    <div className="bg-primary-50 p-4 rounded-2xl border border-primary-100 flex items-start gap-3">
                      <Info className="w-5 h-5 text-primary-400 shrink-0" />
                      <p className="text-[11px] text-primary-500 font-medium leading-relaxed">Layanan FREE memberikan <b>1.000 Views</b> secara cuma-cuma. Dibatasi 1x per hari per perangkat.</p>
                    </div>
                  )}

                  {error && (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-red-50 p-4 rounded-2xl border border-red-100 flex items-center gap-3 text-red-500">
                      <ShieldAlert className="w-5 h-5 shrink-0" />
                      <p className="text-xs font-bold italic">{error}</p>
                    </motion.div>
                  )}

                  <div className="pt-4">
                    <button type="submit" disabled={loading} className="w-full btn-primary py-5 rounded-2xl flex items-center justify-center gap-3 text-lg italic tracking-tight group">
                      {loading ? <Loader2 className="animate-spin" /> : (
                        <>
                          {serviceType === 'FREE' ? 'KLAIM VIEWS GRATIS' : `BAYAR RP ${price.toLocaleString()}`}
                          <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-8 py-4">
                   {orderResult.status === 'pending_payment' ? (
                     <div className="text-center space-y-6">
                        <div className="bg-amber-50 text-amber-600 p-4 rounded-2xl border border-amber-100 flex items-center justify-center gap-2">
                           <Clock className="w-5 h-5 animate-pulse" />
                           <p className="text-sm font-black italic uppercase">Menunggu Pembayaran: {Math.floor(timer/60)}:{(timer%60).toString().padStart(2,'0')}</p>
                        </div>
                        <div className="space-y-4">
                           <p className="text-xs font-black text-primary-300 uppercase">Total Tagihan</p>
                           <h3 className="text-4xl font-black italic text-primary-900">RP {price.toLocaleString()}</h3>
                        </div>
                        <div className="bg-white p-4 rounded-3xl border-4 border-primary-100 shadow-inner inline-block mx-auto">
                           <img src={QRIS_IMAGE_URL} alt="QRIS" className="w-64 h-64 object-contain" />
                        </div>
                        <p className="text-[10px] font-medium text-primary-400">Scan QRIS di atas menggunakan aplikasi bank atau e-wallet (Dana, OVO, dll). Konfirmasi akan otomatis terdeteksi.</p>
                        <div className="flex gap-3">
                           <button onClick={checkPayment} className="flex-1 btn-primary py-4 rounded-xl text-sm italic">SAYA SUDAH BAYAR</button>
                           <button onClick={() => setOrderResult(null)} className="px-6 py-4 border-2 border-primary-100 rounded-xl text-primary-300 hover:text-red-500 hover:border-red-100 transition-all"><X /></button>
                        </div>
                     </div>
                   ) : (
                     <div className="text-center space-y-8">
                        <div className="bg-green-500 w-20 h-20 rounded-full flex items-center justify-center mx-auto shadow-xl shadow-green-100">
                           <CheckCircle2 className="text-white w-10 h-10" />
                        </div>
                        <div>
                           <h3 className="text-2xl font-black italic">PESANAN DIPROSES!</h3>
                           <p className="text-primary-400 text-sm mt-2">Views akan masuk dalam hitungan menit. Terima kasih telah menggunakan Nexa.</p>
                        </div>
                        <div className="bg-primary-50 p-6 rounded-[24px] border border-primary-100 text-left space-y-3">
                           <div className="flex justify-between border-b border-primary-100 pb-2">
                             <span className="text-[10px] font-black text-primary-300 uppercase">ID PESANAN</span>
                             <span className="text-xs font-black italic">#{orderResult.id.substring(0,8).toUpperCase()}</span>
                           </div>
                           <div className="flex justify-between border-b border-primary-100 pb-2">
                             <span className="text-[10px] font-black text-primary-300 uppercase">STATUS</span>
                             <span className="text-xs font-black italic text-green-600 uppercase">{orderResult.status}</span>
                           </div>
                        </div>
                        <button onClick={() => setOrderResult(null)} className="w-full py-4 border-2 border-primary-100 rounded-xl text-primary-400 font-black italic hover:bg-primary-50 transition-all">BUAT PESANAN BARU</button>
                     </div>
                   )}
                </div>
              )}
            </motion.div>
          </div>

          {/* History Section */}
          <div className="md:col-span-5 space-y-6">
            <h3 className="flex items-center gap-2 text-sm font-black uppercase italic tracking-tighter text-primary-400">
              <History className="w-4 h-4" /> RIWAYAT ANDA
            </h3>
            
            <div className="space-y-4">
              {userHistory.length > 0 ? userHistory.map((item) => (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} key={item.id} className="bg-white p-5 rounded-2xl border border-primary-100 shadow-sm flex justify-between items-center group hover:border-primary-300 transition-all">
                  <div className="space-y-1">
                    <p className="text-xs font-black italic">#{item.id.substring(0,8).toUpperCase()}</p>
                    <div className="flex items-center gap-2">
                       <span className={`text-[8px] font-black px-2 py-0.5 rounded-full ${item.service_type === 'PREMIUM' ? 'bg-amber-100 text-amber-600' : 'bg-primary-100 text-primary-600'}`}>{item.service_type}</span>
                       <span className="text-[10px] font-bold text-primary-400">{item.jumlah_view.toLocaleString()} Views</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-[9px] font-black uppercase ${item.status === 'success' ? 'text-green-500' : item.status === 'failed' ? 'text-red-400' : 'text-amber-500'}`}>{item.status.replace('_',' ')}</span>
                    <p className="text-[8px] text-primary-200 mt-1">{new Date(item.created_at).toLocaleDateString()}</p>
                  </div>
                </motion.div>
              )) : (
                <div className="bg-white/50 border-2 border-dashed border-primary-100 rounded-3xl p-12 text-center space-y-3">
                   <div className="bg-white w-12 h-12 rounded-full flex items-center justify-center mx-auto shadow-sm">
                      <History className="text-primary-100 w-6 h-6" />
                   </div>
                   <p className="text-[10px] font-black text-primary-200 uppercase tracking-widest italic">Belum ada riwayat</p>
                </div>
              )}
            </div>

            <div className="bg-primary-900 p-8 rounded-[32px] text-white space-y-4 relative overflow-hidden shadow-2xl shadow-primary-900/20">
               <div className="absolute top-0 right-0 p-4 opacity-10">
                  <ShieldCheck className="w-24 h-24" />
               </div>
               <h4 className="text-lg font-black italic leading-tight">BUTUH BANTUAN<br/>LEBIH LANJUT?</h4>
               <p className="text-primary-300 text-xs leading-relaxed font-medium">Tim kami siap membantu kendala pembayaran atau teknis 24/7 melalui pusat dukungan kami.</p>
               <button onClick={() => setShowSupport(true)} className="flex items-center gap-2 bg-white text-primary-900 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-tight hover:bg-primary-100 transition-all">
                 HUBUNGI SUPPORT <ChevronRight className="w-3 h-3" />
               </button>
            </div>
          </div>
        </div>
      </main>

      <footer className="max-w-6xl mx-auto px-6 py-12 border-t border-primary-100 mt-20">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2 grayscale opacity-50">
            <div className="bg-primary-900 p-1.5 rounded-lg">
              <Rocket className="text-white w-4 h-4" />
            </div>
            <h1 className="font-black text-sm tracking-tighter italic">NEXA SOSIAL</h1>
          </div>
          <div className="flex gap-10 text-[10px] font-black text-primary-300 uppercase tracking-widest">
            <button onClick={() => setShowDoc(true)} className="hover:text-primary-600 transition-colors">TOS</button>
            <button onClick={() => setShowDoc(true)} className="hover:text-primary-600 transition-colors">PRIVACY</button>
            <button onClick={() => setShowSupport(true)} className="hover:text-primary-600 transition-colors">REFUND</button>
          </div>
          <p className="text-[10px] font-medium text-primary-200 uppercase tracking-widest">© 2024 NEXA. ALL RIGHTS RESERVED.</p>
        </div>
      </footer>

      {/* Support Dialog */}
      <AnimatePresence>
        {showSupport && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowSupport(false)} className="absolute inset-0 bg-primary-900/40 backdrop-blur-sm" />
             <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white w-full max-w-md p-8 rounded-[32px] shadow-2xl relative z-10 border border-primary-100">
                <button onClick={() => setShowSupport(false)} className="absolute top-6 right-6 p-2 text-primary-200 hover:text-primary-400 transition-all"><X /></button>
                <div className="text-center space-y-2 mb-8">
                   <div className="bg-primary-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto text-primary-600">
                      <MessageCircle className="w-6 h-6" />
                   </div>
                   <h3 className="text-xl font-black italic">HUBUNGI KAMI</h3>
                   <p className="text-xs text-primary-400">Tim kami akan merespons dalam 1-12 jam kerja.</p>
                </div>
                <form onSubmit={handleSupportSubmit} className="space-y-4">
                   <input type="email" placeholder="Email Anda" className="input-field" value={supportEmail} onChange={(e) => setSupportEmail(e.target.value)} required />
                   <input type="text" placeholder="ID Order (Opsional)" className="input-field" value={supportOrderId} onChange={(e) => setSupportOrderId(e.target.value)} />
                   <textarea placeholder="Ceritakan kendala Anda..." className="input-field min-h-[120px] py-3 resize-none" value={supportMessage} onChange={(e) => setSupportMessage(e.target.value)} required />
                   <button type="submit" disabled={supportLoading} className="w-full btn-primary py-4 rounded-2xl flex items-center justify-center gap-2">
                     {supportLoading ? <Loader2 className="animate-spin w-5 h-5" /> : <>KIRIM LAPORAN <Send className="w-4 h-4" /></>}
                   </button>
                </form>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Doc Dialog */}
      <AnimatePresence>
        {showDoc && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowDoc(false)} className="absolute inset-0 bg-primary-900/40 backdrop-blur-sm" />
             <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} className="bg-white w-full max-w-2xl max-h-[80vh] overflow-y-auto p-10 rounded-[40px] shadow-2xl relative z-10 border border-primary-100">
                <button onClick={() => setShowDoc(false)} className="absolute top-8 right-8 p-2 text-primary-200 hover:text-primary-400 transition-all"><X /></button>
                <div className="prose prose-primary max-w-none space-y-8">
                   <div className="text-center border-b border-primary-50 pb-8">
                      <FileText className="w-10 h-10 text-primary-200 mx-auto mb-4" />
                      <h2 className="text-3xl font-black italic m-0">DOKUMENTASI LAYANAN</h2>
                   </div>
                   
                   <section className="space-y-4">
                      <h4 className="text-sm font-black italic flex items-center gap-2 text-primary-600 uppercase tracking-widest"><div className="w-2 h-2 bg-primary-500 rounded-full"></div> Cara Kerja Sistem</h4>
                      <p className="text-xs text-primary-400 leading-relaxed font-medium">Nexa Sosial menggunakan API otomatis untuk mengirimkan views ke video TikTok Anda. Layanan <b>FREE</b> diproses dengan prioritas rendah, sementara <b>PREMIUM</b> diproses secara instan menggunakan server khusus berkecepatan tinggi.</p>
                   </section>

                   <section className="space-y-4">
                      <h4 className="text-sm font-black italic flex items-center gap-2 text-primary-600 uppercase tracking-widest"><div className="w-2 h-2 bg-primary-500 rounded-full"></div> Kebijakan Pembayaran</h4>
                      <p className="text-xs text-primary-400 leading-relaxed font-medium">Pembayaran menggunakan QRIS (Dana, OVO, ShopeePay, Bank). Pastikan nominal yang dibayar sesuai dengan yang tertera di sistem. Jika dalam 1 jam status tidak berubah, harap hubungi Support dengan melampirkan ID Pesanan.</p>
                   </section>

                   <section className="space-y-4">
                      <h4 className="text-sm font-black italic flex items-center gap-2 text-primary-600 uppercase tracking-widest"><div className="w-2 h-2 bg-primary-500 rounded-full"></div> Ketentuan Penggunaan (TOS)</h4>
                      <ul className="text-xs text-primary-400 space-y-2 font-medium">
                         <li>• Jangan gunakan link video yang diprivat (harus publik).</li>
                         <li>• Jangan mengganti link video saat proses suntik sedang berjalan.</li>
                         <li>• Kesalahan input link oleh pengguna bukan tanggung jawab Nexa.</li>
                         <li>• Limit FREE: 1x klaim per 24 jam per perangkat/IP.</li>
                      </ul>
                   </section>

                   <div className="bg-primary-50 p-6 rounded-3xl border border-primary-100 flex items-center gap-4">
                      <ShieldCheck className="w-12 h-12 text-primary-500" />
                      <div>
                         <p className="text-[10px] font-black italic text-primary-900 uppercase">Jaminan Keamanan</p>
                         <p className="text-[9px] text-primary-400 font-medium">Nexa tidak pernah meminta password TikTok Anda. Kami hanya membutuhkan link video yang valid.</p>
                      </div>
                   </div>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
