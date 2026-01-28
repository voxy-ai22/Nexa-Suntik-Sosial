"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Rocket, CheckCircle2, Loader2, History, MessageCircle, Send, 
  FileText, ShieldCheck, Menu, X, ChevronRight, Clock, 
  ImageIcon, AlertCircle, HelpCircle, ShieldAlert, RefreshCw, Info
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

  const [proofFile, setProofFile] = useState<string | null>(null);
  const [uploadingProof, setUploadingProof] = useState(false);

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
        alert('Laporan terkirim! Sistem otomatis kami telah mengirimkan email instruksi. Silakan cek Inbox/Spam email Anda dan balas dengan data yang diminta.');
        setShowSupport(false);
        setSupportMessage('');
        setSupportOrderId('');
      } else {
        const data = await res.json();
        alert(data.message || 'Gagal mengirim laporan');
      }
    } catch (e) {
      alert('Gagal mengirim laporan');
    } finally {
      setSupportLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setTimer(120);
    setProofFile(null);
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProofFile(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadProof = async () => {
    if (!proofFile || !orderResult?.id) {
      alert("Silakan pilih file bukti transfer.");
      return;
    }
    setUploadingProof(true);
    try {
      const res = await fetch('/api/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: orderResult.id, proofImage: proofFile })
      });
      if (res.ok) {
        setOrderResult({ ...orderResult, status: 'waiting_admin' });
        fetchHistory(deviceId);
      } else {
        const d = await res.json();
        alert(d.message || "Gagal upload.");
      }
    } catch (e) {
      alert("Gagal menghubungi server.");
    } finally {
      setUploadingProof(false);
    }
  };

  return (
    <div className="min-h-screen bg-primary-50 text-primary-900 font-sans selection:bg-primary-200">
      <nav className="bg-white/80 backdrop-blur-lg border-b border-primary-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2 group cursor-pointer" onClick={() => window.scrollTo({top:0, behavior:'smooth'})}>
            <div className="bg-primary-500 p-2 rounded-xl group-hover:rotate-12 transition-transform">
              <Rocket className="text-white w-5 h-5" />
            </div>
            <h1 className="font-black text-xl tracking-tighter italic">NEXA SOSIAL</h1>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <button onClick={() => setShowDoc(true)} className="text-sm font-black text-primary-400 hover:text-primary-600 transition-colors uppercase tracking-widest">Dokumentasi</button>
            <button onClick={() => setShowSupport(true)} className="text-sm font-black text-primary-400 hover:text-primary-600 transition-colors uppercase tracking-widest">Support</button>
            <button onClick={() => window.scrollTo({top: 400, behavior:'smooth'})} className="bg-primary-500 hover:bg-primary-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-primary-100 transition-all active:scale-95">ORDER SEKARANG</button>
          </div>

          <button className="md:hidden p-2 text-primary-600" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsMenuOpen(false)} className="fixed inset-0 bg-primary-900/20 backdrop-blur-sm z-[55] md:hidden" />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="fixed top-0 right-0 h-full w-[80%] max-w-sm bg-white z-[60] shadow-2xl flex flex-col p-8 md:hidden">
              <div className="flex justify-between items-center mb-12">
                <div className="flex items-center gap-2">
                  <div className="bg-primary-500 p-2 rounded-xl"><Rocket className="text-white w-5 h-5" /></div>
                  <h1 className="font-black text-xl tracking-tighter italic">NEXA</h1>
                </div>
                <button onClick={() => setIsMenuOpen(false)} className="p-2 text-primary-600"><X size={24} /></button>
              </div>
              <div className="flex flex-col gap-8">
                <button onClick={() => { setIsMenuOpen(false); setShowDoc(true); }} className="text-left text-2xl font-black italic hover:text-primary-500 flex items-center justify-between uppercase">DOKUMENTASI <ChevronRight size={20} /></button>
                <button onClick={() => { setIsMenuOpen(false); setShowSupport(true); }} className="text-left text-2xl font-black italic hover:text-primary-500 flex items-center justify-between uppercase">SUPPORT <ChevronRight size={20} /></button>
                <button onClick={() => { setIsMenuOpen(false); window.scrollTo({top: 400, behavior: 'smooth'}); }} className="text-left text-2xl font-black italic text-primary-600 hover:text-primary-700 flex items-center justify-between uppercase">ORDER SEKARANG <ChevronRight size={20} /></button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <header className="text-center mb-16 space-y-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="inline-block bg-primary-100 text-primary-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">#1 TikTok Booster Service</motion.div>
          <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-5xl md:text-6xl font-black italic tracking-tighter leading-tight">BOOST VIEWS <span className="text-primary-500">SEKETIKA.</span></motion.h2>
          <p className="text-primary-400 font-medium max-w-lg mx-auto leading-relaxed">Pilih GRATIS untuk mencoba, atau PREMIUM untuk hasil maksimal hingga 200k views.</p>
        </header>

        <div className="grid md:grid-cols-12 gap-10">
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
                        <label className="text-[10px] font-black uppercase text-primary-400 ml-1">Nomor WhatsApp Aktif</label>
                        <input type="tel" placeholder="08..." className="input-field py-4" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} required />
                      </div>
                      <div className="space-y-4 bg-primary-50/50 p-6 rounded-2xl border border-primary-100">
                        <div className="flex justify-between items-end">
                          <label className="text-[10px] font-black uppercase text-primary-400">Jumlah Views</label>
                          <span className="text-xl font-black italic text-primary-600">{jumlahView.toLocaleString()}</span>
                        </div>
                        <input type="range" min="1000" max="200000" step="1000" className="w-full h-2 bg-primary-200 rounded-lg appearance-none cursor-pointer accent-primary-500" value={jumlahView} onChange={(e) => setJumlahView(parseInt(e.target.value))} />
                        <div className="flex justify-between text-[8px] font-black text-primary-300 uppercase"><span>1.000</span><span>200.000</span></div>
                        <p className="text-[10px] text-center font-bold text-primary-400 italic">Rp 398 / 1.000 Views</p>
                      </div>
                    </motion.div>
                  )}

                  {error && <div className="bg-red-50 p-4 rounded-2xl text-red-500 text-xs font-bold italic">{error}</div>}

                  <button type="submit" disabled={loading} className="w-full btn-primary py-5 rounded-2xl flex items-center justify-center gap-3 text-lg italic tracking-tight group">
                    {loading ? <Loader2 className="animate-spin" /> : (
                      <>{serviceType === 'FREE' ? 'KLAIM VIEWS GRATIS' : `BAYAR RP ${price.toLocaleString()}`} <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></>
                    )}
                  </button>
                </form>
              ) : (
                <div className="space-y-8 py-4">
                   {orderResult.status === 'pending_payment' ? (
                     <div className="text-center space-y-6">
                        <div className="bg-amber-50 text-amber-600 p-3 rounded-2xl border border-amber-100 flex items-center justify-center gap-2">
                           <Clock className="w-4 h-4 animate-pulse" />
                           <p className="text-[10px] font-black italic uppercase">Menunggu Pembayaran: {Math.floor(timer/60)}:{(timer%60).toString().padStart(2,'0')}</p>
                        </div>
                        <h3 className="text-4xl font-black italic text-primary-900">RP {price.toLocaleString()}</h3>
                        <div className="bg-white p-4 rounded-3xl border-4 border-primary-100 shadow-inner inline-block mx-auto"><img src={QRIS_IMAGE_URL} alt="QRIS" className="w-64 h-64 object-contain" /></div>
                        
                        <div className="space-y-4 pt-4 border-t border-primary-100">
                           <label className="text-[10px] font-black uppercase text-primary-400 block">Upload Bukti Transfer</label>
                           <div className="relative flex flex-col items-center gap-3 p-6 border-2 border-dashed border-primary-200 rounded-3xl bg-primary-50/30 hover:bg-primary-50 hover:border-primary-400 transition-all cursor-pointer overflow-hidden">
                              {proofFile ? (
                                <div className="flex flex-col items-center gap-2">
                                  <img src={proofFile} alt="Proof" className="w-24 h-24 object-cover rounded-lg border-2 border-primary-200 shadow-sm" />
                                  <p className="text-[10px] font-black text-green-600 uppercase italic">Siap Kirim!</p>
                                </div>
                              ) : (
                                <><ImageIcon className="w-10 h-10 text-primary-200" /><p className="text-[10px] font-black text-primary-400 uppercase italic">Upload Screenshot</p></>
                              )}
                              <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                           </div>
                        </div>

                        <div className="flex gap-3">
                           <button onClick={handleUploadProof} disabled={uploadingProof || !proofFile} className="flex-1 btn-primary py-4 rounded-xl text-sm italic flex items-center justify-center gap-2">
                             {uploadingProof ? <Loader2 className="animate-spin" /> : <>KIRIM BUKTI <Send className="w-4 h-4" /></>}
                           </button>
                           <button onClick={() => setOrderResult(null)} className="px-6 py-4 border-2 border-primary-100 rounded-xl text-primary-300 hover:text-red-500 transition-all"><X /></button>
                        </div>
                     </div>
                   ) : (
                     <div className="text-center space-y-8">
                        <div className="bg-green-500 w-20 h-20 rounded-full flex items-center justify-center mx-auto shadow-xl"><CheckCircle2 className="text-white w-10 h-10" /></div>
                        <h3 className="text-2xl font-black italic uppercase">PESANAN DIPROSES!</h3>
                        <p className="text-primary-400 text-sm">Terima kasih. Views akan masuk dalam estimasi 1x24 jam. Cek status di Riwayat Pesanan.</p>
                        <button onClick={() => setOrderResult(null)} className="w-full py-4 border-2 border-primary-100 rounded-xl text-primary-400 font-black italic hover:bg-primary-50 transition-all uppercase">Buat Pesanan Baru</button>
                     </div>
                   )}
                </div>
              )}
            </motion.div>
          </div>

          <div className="md:col-span-5 space-y-6">
            <h3 className="flex items-center gap-2 text-sm font-black uppercase italic tracking-tighter text-primary-400"><History className="w-4 h-4" /> RIWAYAT ANDA</h3>
            <div className="space-y-4">
              {userHistory.length > 0 ? userHistory.map((item) => (
                <div key={item.id} className="bg-white p-5 rounded-2xl border border-primary-100 shadow-sm flex justify-between items-center group transition-all">
                  <div className="space-y-1">
                    <p className="text-xs font-black italic">#{item.id.substring(0,8).toUpperCase()}</p>
                    <div className="flex items-center gap-2">
                       <span className={`text-[8px] font-black px-2 py-0.5 rounded-full ${item.service_type === 'PREMIUM' ? 'bg-amber-100 text-amber-600' : 'bg-primary-100 text-primary-600'}`}>{item.service_type}</span>
                       <span className="text-[10px] font-bold text-primary-400">{item.jumlah_view.toLocaleString()} Views</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-[9px] font-black uppercase ${item.status === 'success' ? 'text-green-500' : item.status === 'failed' ? 'text-red-400' : 'text-amber-500'}`}>{item.status.replace('_',' ')}</span>
                  </div>
                </div>
              )) : (
                <div className="bg-white/50 border-2 border-dashed border-primary-100 rounded-3xl p-12 text-center text-[10px] font-black text-primary-200 uppercase tracking-widest italic">Belum ada riwayat</div>
              )}
            </div>

            <div className="bg-primary-900 p-8 rounded-[32px] text-white space-y-4 relative overflow-hidden shadow-2xl">
               <ShieldCheck className="absolute top-0 right-0 p-4 opacity-10 w-24 h-24" />
               <h4 className="text-lg font-black italic leading-tight uppercase">BUTUH BANTUAN?</h4>
               <p className="text-primary-300 text-xs leading-relaxed font-medium">Batas proses 1x24 jam. Gunakan form support jika pesanan melebihi batas waktu.</p>
               <button onClick={() => setShowSupport(true)} className="flex items-center gap-2 bg-white text-primary-900 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-tight hover:bg-primary-100 transition-all">HUBUNGI SUPPORT <ChevronRight className="w-3 h-3" /></button>
            </div>
          </div>
        </div>
      </main>

      <footer className="max-w-6xl mx-auto px-6 py-12 border-t border-primary-100 mt-20">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 text-center md:text-left">
          <div className="flex items-center gap-2 grayscale opacity-50 justify-center md:justify-start">
            <div className="bg-primary-900 p-1.5 rounded-lg"><Rocket className="text-white w-4 h-4" /></div>
            <h1 className="font-black text-sm tracking-tighter italic">NEXA SOSIAL</h1>
          </div>
          <div className="flex gap-10 text-[10px] font-black text-primary-300 uppercase tracking-widest justify-center">
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
                   <div className="bg-primary-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto text-primary-600"><MessageCircle className="w-6 h-6" /></div>
                   <h3 className="text-xl font-black italic">HUBUNGI KAMI</h3>
                   <p className="text-[10px] text-primary-400 leading-relaxed font-bold italic uppercase">Pesan akan diproses sistem internal Nexa (Admin tidak melihat chat langsung).</p>
                </div>
                <form onSubmit={handleSupportSubmit} className="space-y-4">
                   <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase text-primary-400 ml-1">Email Anda</label>
                      <input type="email" placeholder="email@anda.com" className="input-field" value={supportEmail} onChange={(e) => setSupportEmail(e.target.value)} required />
                   </div>
                   <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase text-primary-400 ml-1">ID Order (Opsional)</label>
                      <input type="text" placeholder="NEXA-XXXX" className="input-field" value={supportOrderId} onChange={(e) => setSupportOrderId(e.target.value)} />
                   </div>
                   <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase text-primary-400 ml-1">Pesan Keluhan</label>
                      <textarea placeholder="Ceritakan kendala Anda..." className="input-field min-h-[120px] py-3 resize-none" value={supportMessage} onChange={(e) => setSupportMessage(e.target.value)} required />
                   </div>
                   <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mb-4">
                      <p className="text-[9px] text-blue-600 font-bold leading-relaxed italic">
                        *Sistem akan mengirim email konfirmasi. Balas email tersebut dengan bukti transfer, nomor WA, ID Pesanan, dan Link TikTok agar diproses segera.
                      </p>
                   </div>
                   <button type="submit" disabled={supportLoading} className="w-full btn-primary py-4 rounded-2xl flex items-center justify-center gap-2 uppercase tracking-widest text-xs font-black">
                     {supportLoading ? <Loader2 className="animate-spin w-5 h-5" /> : <>KIRIM LAPORAN <Send className="w-4 h-4" /></>}
                   </button>
                </form>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Doc Dialog (Updated with full Procedures) */}
      <AnimatePresence>
        {showDoc && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowDoc(false)} className="absolute inset-0 bg-primary-900/40 backdrop-blur-sm" />
             <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} className="bg-white w-full max-w-2xl max-h-[85vh] overflow-y-auto p-10 rounded-[40px] shadow-2xl relative z-10 border border-primary-100 custom-scrollbar">
                <button onClick={() => setShowDoc(false)} className="absolute top-8 right-8 p-2 text-primary-200 hover:text-primary-400 transition-all"><X /></button>
                <div className="prose prose-primary max-w-none space-y-10">
                   <div className="text-center border-b border-primary-50 pb-8">
                      <FileText className="w-12 h-12 text-primary-200 mx-auto mb-4" />
                      <h2 className="text-3xl font-black italic m-0 tracking-tighter uppercase">PROSEDUR & DUKUNGAN</h2>
                   </div>
                   
                   <section className="space-y-6">
                      <div className="flex items-center gap-3 text-primary-600">
                         <Clock className="w-5 h-5" />
                         <h4 className="text-sm font-black italic uppercase tracking-widest m-0">Estimasi Waktu Layanan (SLA)</h4>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                         <div className="bg-primary-50 p-4 rounded-2xl border border-primary-100">
                            <p className="text-[10px] font-black text-primary-400 uppercase mb-1">FREE SERVICE</p>
                            <p className="text-xs font-bold text-primary-700">Maksimal 1 x 24 Jam</p>
                         </div>
                         <div className="bg-primary-50 p-4 rounded-2xl border border-primary-100">
                            <p className="text-[10px] font-black text-primary-400 uppercase mb-1">PREMIUM SERVICE</p>
                            <p className="text-xs font-bold text-primary-700">Maksimal 1 x 24 Jam</p>
                         </div>
                      </div>
                      <p className="text-[11px] text-primary-400 leading-relaxed font-medium italic">*Selama masih dalam batas waktu 24 jam, pengguna tidak perlu menghubungi admin.</p>
                   </section>

                   <section className="space-y-6">
                      <div className="flex items-center gap-3 text-primary-600">
                         <ShieldAlert className="w-5 h-5" />
                         <h4 className="text-sm font-black italic uppercase tracking-widest m-0">Kebijakan Pengembalian Dana (Refund)</h4>
                      </div>
                      <div className="bg-red-50 p-6 rounded-3xl border border-red-100 space-y-3">
                         <p className="text-xs font-bold text-red-600 flex items-center gap-2"><div className="w-1.5 h-1.5 bg-red-600 rounded-full" /> Refund HANYA berlaku untuk layanan PREMIUM.</p>
                         <p className="text-xs font-bold text-red-600 flex items-center gap-2"><div className="w-1.5 h-1.5 bg-red-600 rounded-full" /> Syarat: Melebihi 24 jam sejak pembayaran dikonfirmasi.</p>
                         <p className="text-xs font-bold text-red-600 flex items-center gap-2"><div className="w-1.5 h-1.5 bg-red-600 rounded-full" /> Syarat: Mengirimkan data lengkap ke sistem support Nexa.</p>
                         <p className="text-xs font-bold text-red-400 italic mt-4">*Layanan FREE tidak memiliki ketentuan refund dalam kondisi apa pun.</p>
                      </div>
                   </section>

                   <section className="space-y-6">
                      <div className="flex items-center gap-3 text-primary-600">
                         <RefreshCw className="w-5 h-5" />
                         <h4 className="text-sm font-black italic uppercase tracking-widest m-0">Ketentuan Refill</h4>
                      </div>
                      <ul className="grid grid-cols-1 md:grid-cols-3 gap-3 m-0 p-0 list-none">
                         {['View TikTok: No Refill', 'Followers: No Refill', 'Likes: No Refill'].map(t => (
                            <li key={t} className="bg-slate-50 border border-slate-100 p-3 rounded-xl text-[10px] font-black text-slate-400 text-center uppercase">{t}</li>
                         ))}
                      </ul>
                      <div className="bg-primary-50 p-4 rounded-2xl">
                         <p className="text-[10px] font-black text-primary-400 uppercase mb-2">Update Terakhir Layanan:</p>
                         <div className="space-y-1">
                            <p className="text-[10px] font-bold text-primary-600 flex justify-between"><span>TikTok View Refill 30h:</span> <span>05/02/2026</span></p>
                            <p className="text-[10px] font-bold text-primary-600 flex justify-between"><span>TikTok Follower:</span> <span>10/02/2026</span></p>
                            <p className="text-[10px] font-bold text-primary-600 flex justify-between"><span>TikTok Like:</span> <span>15/02/2026</span></p>
                         </div>
                      </div>
                   </section>

                   <section className="space-y-6">
                      <div className="flex items-center gap-3 text-primary-600">
                         <Info className="w-5 h-5" />
                         <h4 className="text-sm font-black italic uppercase tracking-widest m-0">Pencegahan Penyalahgunaan</h4>
                      </div>
                      <p className="text-[11px] text-primary-400 leading-relaxed font-medium">Sistem support otomatis (Auto-reply) hanya dikirim 1 kali per ID pesanan. Nexa tidak merespons email tanpa data lengkap sesuai instruksi sistem.</p>
                   </section>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}