"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Rocket, CheckCircle2, Loader2, Camera, History, XCircle,
  MessageCircle, Send, FileText, ShieldCheck, Menu, X, Home as HomeIcon,
  ChevronRight, Clock, ShieldAlert, Info, AlertTriangle, RefreshCw
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
  const [timer, setTimer] = useState(60);
  const [deviceId, setDeviceId] = useState('');
  const [userHistory, setUserHistory] = useState<any[]>([]);
  
  const [showSupport, setShowSupport] = useState(false);
  const [showDoc, setShowDoc] = useState(false);
  const [supportEmail, setSupportEmail] = useState('');
  const [supportOrderId, setSupportOrderId] = useState('');
  const [supportMessage, setSupportMessage] = useState('');
  const [supportLoading, setSupportLoading] = useState(false);

  const price = useMemo(() => Math.max(100, Math.floor((jumlahView / 1000) * 100)), [jumlahView]);

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
        body: JSON.stringify({ linkTikTok, jumlahView: serviceType === 'FREE' ? 1000 : jumlahView, serviceType, phoneNumber, deviceId }),
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
    if (file.size > 2 * 1024 * 1024) return alert("File terlalu besar (Maks 2MB)");
    
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
        if (res.ok) setOrderResult((prev: any) => ({ ...prev, status: 'waiting_admin' }));
        fetchHistory(deviceId);
      } catch (err: any) { alert(err.message); } finally { setLoading(false); }
    };
  };

  return (
    <main className="min-h-screen bg-[#f8fafc] text-slate-900 pb-10 font-sans selection:bg-blue-100 overflow-x-hidden">
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsMenuOpen(false)} className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60]"/>
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="fixed top-0 right-0 w-72 h-full bg-white z-[70] shadow-2xl border-l border-slate-200 flex flex-col p-6">
              <div className="flex justify-between items-center mb-10">
                <div className="flex items-center gap-2">
                  <Rocket className="text-blue-600 w-5 h-5" />
                  <span className="font-black italic uppercase tracking-tighter text-sm">Nexa Menu</span>
                </div>
                <button onClick={() => setIsMenuOpen(false)} className="p-2 bg-slate-100 rounded-full text-slate-500"><X className="w-4 h-4" /></button>
              </div>
              <nav className="flex-1 space-y-2">
                <button onClick={() => { setIsMenuOpen(false); window.scrollTo({top:0, behavior:'smooth'}); }} className="w-full flex items-center justify-between p-4 rounded-2xl bg-slate-50 text-blue-600 font-black uppercase text-[10px] tracking-widest">
                  <div className="flex items-center gap-3"><HomeIcon className="w-4 h-4"/> Home</div>
                  <ChevronRight className="w-3 h-3"/>
                </button>
                <button onClick={() => { setIsMenuOpen(false); setShowDoc(true); }} className="w-full flex items-center justify-between p-4 rounded-2xl text-slate-500 hover:bg-slate-50 font-black uppercase text-[10px] tracking-widest">
                  <div className="flex items-center gap-3"><FileText className="w-4 h-4"/> Documentation</div>
                  <ChevronRight className="w-3 h-3 opacity-30"/>
                </button>
                <button onClick={() => { setIsMenuOpen(false); setShowSupport(true); }} className="w-full flex items-center justify-between p-4 rounded-2xl text-slate-500 hover:bg-slate-50 font-black uppercase text-[10px] tracking-widest">
                  <div className="flex items-center gap-3"><MessageCircle className="w-4 h-4"/> Support Desk</div>
                  <ChevronRight className="w-3 h-3 opacity-30"/>
                </button>
                <div className="h-px bg-slate-100 my-4"></div>
                <button onClick={() => window.location.href='/admin/dashboard'} className="w-full flex items-center justify-between p-4 rounded-2xl text-red-500 hover:bg-red-50 font-black uppercase text-[10px] tracking-widest">
                  <div className="flex items-center gap-3"><ShieldCheck className="w-4 h-4"/> Admin Dashboard</div>
                  <ChevronRight className="w-3 h-3 opacity-30"/>
                </button>
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Rocket className="text-blue-600 w-5 h-5" />
            <h1 className="text-base font-black tracking-tighter uppercase italic">Nexa Sosial</h1>
          </div>
          <button onClick={() => setIsMenuOpen(true)} className="p-2 hover:bg-slate-100 rounded-xl transition-all text-slate-600"><Menu className="w-6 h-6" /></button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-4xl font-black text-slate-900 leading-none tracking-tight">FAST VIEWS<br/><span className="text-blue-600">TIKTOK BOOST</span></h2>
              <p className="text-slate-400 font-bold text-xs uppercase italic tracking-wider">Layanan Terpercaya, Hasil Nyata.</p>
            </div>

            <div className="bg-white p-6 rounded-[24px] border border-slate-200 shadow-sm">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="flex p-1 bg-slate-100 rounded-xl">
                  {(['FREE', 'PREMIUM'] as const).map((type) => (
                    <button key={type} type="button" onClick={() => { setServiceType(type); if(type === 'FREE') setJumlahView(1000); }}
                      className={`flex-1 py-2.5 rounded-lg text-[10px] font-black transition-all uppercase ${serviceType === type ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}>
                      {type}
                    </button>
                  ))}
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase ml-1">TikTok Video URL</label>
                    <input type="url" required placeholder="https://www.tiktok.com/@..." className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 p-3.5 rounded-xl outline-none font-bold text-sm" value={linkTikTok} onChange={(e) => setLinkTikTok(e.target.value)} />
                  </div>
                  
                  {serviceType === 'PREMIUM' && (
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase ml-1">WhatsApp (Kebutuhan Refund)</label>
                      <input type="tel" required placeholder="08..." className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 p-3.5 rounded-xl outline-none font-bold text-sm" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
                    </div>
                  )}

                  <div className="space-y-3">
                    <div className="flex justify-between items-center px-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase">Target Views</label>
                      <span className="text-blue-600 font-black text-lg italic">{serviceType === 'FREE' ? '1,000' : jumlahView.toLocaleString()}</span>
                    </div>
                    {serviceType === 'PREMIUM' ? (
                      <input type="range" min="1000" max="200000" step="1000" className="w-full h-1.5 bg-slate-100 rounded-full appearance-none cursor-pointer accent-blue-600" value={jumlahView} onChange={(e) => setJumlahView(parseInt(e.target.value))} />
                    ) : (
                      <div className="bg-slate-50 p-2 rounded-lg text-center text-[10px] font-black text-slate-400 uppercase border border-slate-100 italic">Layanan Free dikunci pada 1,000 Views</div>
                    )}
                  </div>
                </div>

                {serviceType === 'PREMIUM' && (
                   <div className="bg-blue-50 p-3 rounded-xl border border-blue-100 flex justify-between items-center">
                      <span className="text-[9px] font-black text-blue-600 uppercase">Total:</span>
                      <span className="text-base font-black text-slate-900">Rp {price.toLocaleString()}</span>
                   </div>
                )}

                {error && <p className="text-red-500 text-[10px] font-bold uppercase text-center bg-red-50 p-3 rounded-lg border border-red-100">{error}</p>}

                <button type="submit" disabled={loading} className="w-full bg-slate-900 text-white py-4 rounded-xl font-black text-sm hover:bg-blue-600 transition-all disabled:opacity-50 uppercase tracking-widest italic shadow-lg shadow-slate-100">
                  {loading ? <Loader2 className="animate-spin mx-auto w-5 h-5" /> : (serviceType === 'FREE' ? 'Klaim 1,000 Views' : 'Pesan Sekarang')}
                </button>
              </form>
            </div>
          </div>

          <div className="space-y-4">
            <AnimatePresence mode="wait">
              {!orderResult ? (
                <div className="bg-white p-6 rounded-[24px] border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                    <div className="flex items-center gap-2">
                      <History className="text-blue-600 w-4 h-4" />
                      <h3 className="text-xs font-black uppercase tracking-tight">Histori Pesanan</h3>
                    </div>
                  </div>
                  <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1">
                    {userHistory.map((h) => (
                      <div key={h.id} className="bg-slate-50 p-3 rounded-xl flex justify-between items-center border border-slate-100">
                        <div>
                          <div className="text-[7px] font-black text-blue-600 uppercase">{h.service_type}</div>
                          <div className="text-xs font-bold text-slate-800">{h.jumlah_view.toLocaleString()} Views</div>
                        </div>
                        <div className={`px-2 py-1 rounded-lg text-[7px] font-black uppercase border ${
                          h.status === 'success' ? 'bg-green-50 text-green-600 border-green-100' : 
                          h.status === 'failed' ? 'bg-red-50 text-red-600 border-red-100' :
                          'bg-white text-slate-400 border-slate-200'
                        }`}>{h.status.replace('_', ' ')}</div>
                      </div>
                    ))}
                    {userHistory.length === 0 && <p className="text-slate-300 font-bold text-[9px] text-center py-10 uppercase italic">Belum ada riwayat</p>}
                  </div>
                </div>
              ) : (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white p-6 rounded-[24px] shadow-lg border border-slate-200 text-center space-y-5">
                  <div className="text-[9px] font-black text-slate-300 uppercase">ID: {orderResult.id.substring(0,8)}</div>
                  {orderResult.status === 'waiting_admin' ? (
                    <div className="py-6 space-y-4">
                      <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto relative">
                        <Loader2 className="text-blue-600 w-8 h-8 animate-spin" />
                        <ShieldCheck className="text-blue-600 w-4 h-4 absolute bottom-0 right-0" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-sm font-black uppercase text-blue-600">Verifikasi Pembayaran</h3>
                        <p className="text-[9px] font-bold text-slate-400 uppercase leading-relaxed px-6">
                          Kami sedang mengecek mutasi bank. Harap tunggu 5-15 menit.
                        </p>
                      </div>
                      <button onClick={() => setOrderResult(null)} className="text-blue-600 font-black text-[10px] uppercase hover:underline flex items-center justify-center gap-2 mx-auto mt-4 bg-blue-50 px-6 py-2 rounded-full">
                        <HomeIcon className="w-3 h-3" /> Dashboard
                      </button>
                    </div>
                  ) : orderResult.service_type === 'FREE' ? (
                    <div className="py-6 space-y-4">
                      <CheckCircle2 className="text-green-500 w-12 h-12 mx-auto" />
                      <h3 className="text-sm font-black uppercase">Masuk Antrean</h3>
                      <p className="text-[9px] font-bold text-slate-400 uppercase">FREE views akan diproses setelah antrean premium selesai.</p>
                      <button onClick={() => setOrderResult(null)} className="w-full bg-slate-900 text-white py-3 rounded-lg font-black uppercase text-[10px]">Lanjut</button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                       <div className="bg-amber-50 text-amber-600 p-2 rounded-lg font-black text-[9px] flex justify-between items-center">
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> LIMIT UPLOAD:</span>
                          <span>{timer}s</span>
                       </div>
                       <img src={QRIS_IMAGE_URL} alt="QRIS" className="w-full max-h-64 object-contain rounded-xl border border-slate-100" />
                       <div className="text-center">
                          <p className="text-[9px] font-black text-slate-400 uppercase">Total Bayar:</p>
                          <p className="text-xl font-black text-blue-600">Rp {price.toLocaleString()}</p>
                       </div>
                       <label className="w-full bg-blue-600 text-white py-4 rounded-xl font-black text-[10px] uppercase cursor-pointer flex items-center justify-center gap-2 hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all">
                          {loading ? <Loader2 className="animate-spin w-4 h-4" /> : <><Camera className="w-4 h-4" /> Upload Bukti TF</>}
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
      
      {showSupport && (
        <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white w-full max-w-sm rounded-[32px] p-8 relative shadow-2xl">
            <button onClick={() => setShowSupport(false)} className="absolute top-6 right-6 text-slate-300 hover:text-red-500"><XCircle className="w-6 h-6" /></button>
            <h3 className="text-xl font-black uppercase mb-6">Support Desk</h3>
            <form onSubmit={handleSupportSubmit} className="space-y-4">
               <input type="email" required placeholder="Email Anda" className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl text-xs font-bold" value={supportEmail} onChange={(e) => setSupportEmail(e.target.value)} />
               <input type="text" placeholder="ID Order (Jika ada)" className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl text-xs font-bold" value={supportOrderId} onChange={(e) => setSupportOrderId(e.target.value)} />
               <textarea required rows={4} placeholder="Jelaskan kendala Anda..." className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl text-xs font-bold resize-none" value={supportMessage} onChange={(e) => setSupportMessage(e.target.value)}></textarea>
               <button type="submit" disabled={supportLoading} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black uppercase text-[10px] flex items-center justify-center gap-2">
                 {supportLoading ? <Loader2 className="animate-spin w-4 h-4" /> : <Send className="w-4 h-4" />} Kirim Laporan
               </button>
            </form>
          </motion.div>
        </div>
      )}

      {showDoc && (
        <div className="fixed inset-0 z-[101] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-white w-full max-w-2xl rounded-[40px] p-8 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            <div className="flex justify-between items-center mb-6 px-4">
              <div className="flex items-center gap-3">
                <FileText className="text-blue-600 w-6 h-6" />
                <h2 className="text-xl font-black uppercase italic tracking-tighter">Prosedur Layanan & Dukungan</h2>
              </div>
              <button onClick={() => setShowDoc(false)}><XCircle className="w-7 h-7 text-slate-200 hover:text-red-500" /></button>
            </div>
            
            <div className="overflow-y-auto px-6 space-y-8 pb-10 text-[13px] text-slate-600 leading-relaxed font-medium">
              <section className="space-y-3">
                <div className="flex items-center gap-2 text-blue-600 font-black uppercase text-[11px] tracking-wider">
                  <Info className="w-4 h-4" /> 1. Email Resmi Nexa
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <p>Semua komunikasi dilakukan melalui sistem internal. Pengguna tidak menghubungi admin secara langsung, namun wajib menggunakan form support.</p>
                  <p className="mt-2 text-amber-600 text-[11px] font-bold italic">⚠️ Alamat email tidak ditampilkan ke publik dan hanya digunakan sistem internal.</p>
                </div>
              </section>

              <section className="space-y-3">
                <h3 className="font-black text-slate-900 uppercase text-[11px] tracking-wider">2. Alur Kontak Pengguna</h3>
                <p>Pengguna wajib menggunakan Form Hubungi Admin di website. Sistem otomatis mengirim email balasan, admin tidak perlu membalas manual di tahap awal.</p>
              </section>

              <section className="space-y-3">
                <h3 className="font-black text-slate-900 uppercase text-[11px] tracking-wider">3. Balasan Otomatis (Auto-Reply)</h3>
                <p>Sistem mengirim balasan otomatis. User wajib membalas email tersebut dengan:</p>
                <ul className="list-disc list-inside bg-slate-50 p-4 rounded-xl space-y-1 font-bold">
                  <li>Bukti pembayaran (Screenshot QRIS)</li>
                  <li>Nomor WhatsApp aktif</li>
                  <li>ID Pesanan</li>
                  <li>Link TikTok yang dipesan</li>
                </ul>
              </section>

              <section className="space-y-3">
                <h3 className="font-black text-slate-900 uppercase text-[11px] tracking-wider">4. Estimasi Waktu Layanan</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                    <p className="font-black text-blue-600 uppercase text-[10px]">Free Tier</p>
                    <p className="font-bold">1–2 Jam</p>
                  </div>
                  <div className="bg-amber-50 p-4 rounded-xl border border-amber-100">
                    <p className="font-black text-amber-600 uppercase text-[10px]">Premium Tier</p>
                    <p className="font-bold">Maks. 1.5 Jam</p>
                  </div>
                </div>
              </section>

              <section className="space-y-3">
                <h3 className="font-black text-red-600 uppercase text-[11px] tracking-wider">5. Batas Waktu & Refund</h3>
                <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                  <p className="text-red-700">Jika pesanan PREMIUM belum berjalan dalam 1.5 jam setelah data lengkap dikirim, admin akan melakukan pengembalian dana (refund) penuh.</p>
                </div>
              </section>

              <section className="space-y-3">
                <h3 className="font-black text-slate-900 uppercase text-[11px] tracking-wider">6. Ketentuan Nomor Aktif</h3>
                <p>Pengguna wajib menyertakan nomor aktif untuk kendala sistem atau konfirmasi refund. Ketidaksediaan nomor dapat menunda proses penanganan.</p>
              </section>

              <section className="space-y-3">
                <h3 className="font-black text-slate-900 uppercase text-[11px] tracking-wider">7. Pencatatan Riwayat</h3>
                <p>Semua aktivitas pesan, auto-reply, dan balasan user dicatat otomatis dalam database dan tetap tersimpan meski admin logout.</p>
              </section>

              <section className="space-y-3">
                <h3 className="font-black text-slate-900 uppercase text-[11px] tracking-wider">8. Pencegahan Penyalahgunaan</h3>
                <p>Auto-reply hanya dikirim satu kali per ID pesanan. Sistem tidak merespon email berulang tanpa data valid.</p>
              </section>

              <section className="space-y-3">
                <h3 className="font-black text-slate-900 uppercase text-[11px] tracking-wider">9. Persetujuan Pengguna</h3>
                <p>Dengan mengirim form support, pengguna dianggap setuju dengan seluruh prosedur dan estimasi waktu yang berlaku.</p>
              </section>

              <section className="space-y-4 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2 text-slate-900 font-black uppercase text-[11px] tracking-wider">
                  <RefreshCw className="w-4 h-4 text-blue-600" /> 10. Ketentuan Refill (Update 15/02/2026)
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="bg-slate-100 p-4 rounded-xl text-center border border-slate-200">
                    <p className="text-[10px] uppercase font-black opacity-40">Views</p>
                    <p className="text-[11px] font-black">❌ NO REFILL</p>
                  </div>
                  <div className="bg-slate-100 p-4 rounded-xl text-center border border-slate-200">
                    <p className="text-[10px] uppercase font-black opacity-40">Followers</p>
                    <p className="text-[11px] font-black">❌ NO REFILL</p>
                  </div>
                  <div className="bg-slate-100 p-4 rounded-xl text-center border border-slate-200">
                    <p className="text-[10px] uppercase font-black opacity-40">Likes</p>
                    <p className="text-[11px] font-black">❌ NO REFILL</p>
                  </div>
                </div>
                <div className="bg-blue-50/50 p-4 rounded-xl text-[10px] font-bold text-blue-700 italic border border-blue-100">
                  Update Terakhir:<br/>
                  • TikTok View Refill 30h: 05/02/2026<br/>
                  • TikTok Follower No Refill: 10/02/2026<br/>
                  • TikTok Like No Refill: 15/02/2026
                </div>
              </section>
            </div>

            <div className="p-6 bg-white border-t border-slate-100">
              <button onClick={() => setShowDoc(false)} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black uppercase text-[11px] tracking-widest hover:bg-blue-600 shadow-xl shadow-slate-100 transition-all italic">
                Selesai Membaca & Mengerti
              </button>
            </div>
          </motion.div>
        </div>
      )}
      <footer className="text-center mt-20 text-slate-300 font-black text-[7px] uppercase tracking-[5px] pb-10 italic">NEXA SOSIAL ENGINE // v.3.1.0</footer>
    </main>
  );
}