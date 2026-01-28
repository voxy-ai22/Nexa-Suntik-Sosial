"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Rocket, CheckCircle2, AlertCircle, ShieldCheck, 
  Zap, TrendingUp, Loader2, Camera, Phone, History, Clock, XCircle,
  MessageCircle, Mail, Send, FileText, ChevronRight, Info
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
  
  // Support & Doc State
  const [showSupport, setShowSupport] = useState(false);
  const [showDoc, setShowDoc] = useState(false);
  const [supportEmail, setSupportEmail] = useState('');
  const [supportOrderId, setSupportOrderId] = useState('');
  const [supportMessage, setSupportMessage] = useState('');
  const [supportLoading, setSupportLoading] = useState(false);

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
      if (res.ok) setUserHistory(await res.json());
    } catch (e) {}
  };

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
        alert('Laporan terkirim! Silakan cek email Anda untuk instruksi selanjutnya.');
        setShowSupport(false);
        setSupportMessage('');
      }
    } catch (e) {
      alert('Gagal mengirim support');
    } finally {
      setSupportLoading(false);
    }
  };

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
    const reader = new FileReader();
    reader.readAsDataURL(e.target.files[0]);
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
    <main className="min-h-screen bg-[#fcfdfe] text-slate-900 pb-20 selection:bg-blue-100 font-sans">
      <nav className="bg-white/80 backdrop-blur-2xl sticky top-0 z-50 border-b border-slate-100 px-6 py-5">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2.5 rounded-2xl shadow-xl shadow-blue-100"><Rocket className="text-white w-6 h-6" /></div>
            <h1 className="text-xl font-black text-slate-900 tracking-tighter uppercase italic">Nexa Sosial</h1>
          </div>
          <div className="flex items-center gap-4 lg:gap-6">
             <button onClick={() => setShowDoc(true)} className="hidden md:flex text-[10px] font-black text-slate-400 hover:text-blue-600 uppercase items-center gap-2 transition-all">
               <FileText className="w-4 h-4" /> Document
             </button>
             <button onClick={() => setShowSupport(true)} className="text-[10px] font-black text-blue-600 uppercase flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-xl border border-blue-100/50">
               <MessageCircle className="w-4 h-4" /> Support
             </button>
             <a href="/admin/dashboard" className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b-2 border-transparent hover:border-blue-600 hidden md:block">Admin Panel</a>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 mt-12 lg:mt-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          <div className="lg:col-span-7 space-y-12">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="inline-flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-full text-blue-600 text-[10px] font-black uppercase tracking-widest mb-8"><Zap className="w-3 h-3" /> Instan & Terpercaya</div>
              <h2 className="text-6xl md:text-7xl font-black text-slate-900 leading-[0.85] tracking-tighter mb-8">BOOST YOUR <br/><span className="text-blue-600">SOCIAL REACH</span></h2>
              <p className="text-lg text-slate-400 font-bold max-w-lg italic leading-relaxed">Layanan Suntik Sosial, Terjamin dan jika terjadi kegagalan admin akan mengembalikan dana via nomor aktif Anda.</p>
            </motion.div>

            <div className="bg-white p-8 md:p-12 rounded-[48px] border border-slate-100 shadow-2xl shadow-slate-200/40">
              <form onSubmit={handleSubmit} className="space-y-10">
                <div className="flex p-2 bg-slate-50 rounded-[32px] border border-slate-100">
                  {(['FREE', 'PREMIUM'] as const).map((type) => (
                    <button key={type} type="button" onClick={() => { setServiceType(type); setJumlahView(1000); }}
                      className={`flex-1 py-4 rounded-[24px] text-xs font-black transition-all uppercase tracking-widest ${serviceType === type ? 'bg-white text-blue-600 shadow-xl border border-slate-50' : 'text-slate-400 hover:text-slate-600'}`}>
                      {type}
                    </button>
                  ))}
                </div>
                <div className="space-y-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest ml-4">TikTok Video Link</label>
                    <input type="url" required placeholder="https://vt.tiktok.com/..." className="w-full bg-slate-50 border border-slate-100 focus:bg-white focus:border-blue-500 p-6 rounded-[28px] outline-none font-bold" value={linkTikTok} onChange={(e) => setLinkTikTok(e.target.value)} />
                  </div>
                  {serviceType === 'PREMIUM' && (
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest ml-4">Nomor WhatsApp Aktif (Untuk Refund)</label>
                      <input type="tel" required placeholder="08..." className="w-full bg-slate-50 border border-slate-100 focus:bg-white focus:border-blue-500 p-6 rounded-[28px] outline-none font-bold" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
                    </div>
                  )}
                  <div className="space-y-6">
                    <div className="flex justify-between items-center px-4">
                      <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Views Target</label>
                      <span className="text-blue-600 font-black text-2xl italic">{jumlahView.toLocaleString()} Views</span>
                    </div>
                    <input type="range" min="1000" max={serviceType === 'FREE' ? 3000 : 200000} step={serviceType === 'FREE' ? 100 : 1000} className="w-full h-2 bg-slate-100 rounded-full appearance-none cursor-pointer accent-blue-600" value={jumlahView} onChange={(e) => setJumlahView(parseInt(e.target.value))} />
                    <div className="flex justify-between px-2"><span className="text-[9px] font-bold text-slate-300">1.000</span><span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Maksimal {serviceType === 'FREE' ? '3K' : '200K'}</span></div>
                  </div>
                </div>
                {serviceType === 'PREMIUM' && (
                   <div className="bg-blue-50 p-6 rounded-[28px] border border-blue-100 flex justify-between items-center">
                      <span className="text-xs font-black text-blue-600 uppercase tracking-widest">Total Bayar:</span>
                      <span className="text-2xl font-black text-slate-900 tracking-tighter">Rp {calculatePrice(jumlahView).toLocaleString()}</span>
                   </div>
                )}
                <button type="submit" disabled={loading} className="w-full bg-slate-900 text-white py-6 rounded-[32px] font-black text-lg hover:bg-blue-600 transition-all shadow-2xl disabled:opacity-50 uppercase tracking-widest italic">{loading ? <Loader2 className="animate-spin mx-auto" /> : (serviceType === 'FREE' ? 'Dapatkan Views Gratis' : 'Pesan Views Premium')}</button>
              </form>
            </div>
          </div>

          <div className="lg:col-span-5 sticky top-32">
            <AnimatePresence mode="wait">
              {!orderResult ? (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6"><History className="text-blue-600" /><h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">My History</h3></div>
                  <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                    {userHistory.map((h) => (
                      <div key={h.id} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex justify-between items-center hover:shadow-md transition-all">
                        <div className="min-w-0"><div className="text-[9px] font-black text-blue-600 uppercase mb-1 tracking-widest">{h.service_type}</div><div className="text-sm font-black text-slate-800 truncate">{h.jumlah_view.toLocaleString()} Views</div><div className="text-[10px] text-slate-300 font-bold mt-1">{new Date(h.created_at).toLocaleDateString()}</div></div>
                        <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase border tracking-widest ${h.status === 'success' ? 'bg-green-50 text-green-600' : 'bg-slate-50 text-slate-400'}`}>{h.status.replace('_', ' ')}</div>
                      </div>
                    ))}
                    {userHistory.length === 0 && <p className="text-slate-300 font-bold text-xs uppercase text-center py-10">No orders yet.</p>}
                  </div>
                </div>
              ) : (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white p-12 rounded-[48px] shadow-2xl border border-slate-100 text-center space-y-10">
                  {orderResult.status === 'failed' ? (
                     <div className="space-y-8"><XCircle className="w-20 h-20 text-red-500 mx-auto" /><h3 className="text-3xl font-black uppercase">EXPIRED</h3><button onClick={() => setOrderResult(null)} className="w-full bg-slate-900 text-white py-5 rounded-[24px] font-black uppercase">Ulangi</button></div>
                  ) : orderResult.status === 'waiting_admin' ? (
                    <div className="space-y-8"><div className="bg-blue-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto"><Loader2 className="text-blue-600 w-12 h-12 animate-spin" /></div><h3 className="text-3xl font-black uppercase">VERIFYING...</h3><button onClick={() => setOrderResult(null)} className="text-blue-600 font-black uppercase text-xs">Tutup Sesi Ini</button></div>
                  ) : orderResult.service_type === 'FREE' ? (
                    <div className="space-y-8"><CheckCircle2 className="text-green-500 w-20 h-20 mx-auto" /><h3 className="text-3xl font-black uppercase">QUEUED</h3><button onClick={() => setOrderResult(null)} className="w-full bg-slate-900 text-white py-5 rounded-[24px] font-black uppercase">Selesai</button></div>
                  ) : (
                    <div className="space-y-8">
                       <div className="flex justify-between items-center bg-red-50 text-red-600 px-6 py-4 rounded-[24px] font-black uppercase text-[10px]"><span>Sisa Waktu Scan</span><span className="text-xl flex items-center gap-2"><Clock className="w-4 h-4"/> {timer}s</span></div>
                       <div className="bg-slate-50 p-4 rounded-[32px] border border-slate-100"><img src={QRIS_IMAGE_URL} alt="QRIS" className="w-full rounded-[16px]" /></div>
                       <div className="bg-slate-50 p-6 rounded-[28px] border border-slate-100 space-y-3">
                          <div className="flex justify-between text-[10px] font-black text-slate-300 uppercase"><span>Nominal Transfer</span> <span className="text-blue-600 text-lg">Rp {calculatePrice(orderResult.views).toLocaleString()}</span></div>
                       </div>
                       <label className="flex flex-col items-center justify-center w-full bg-blue-600 text-white py-6 rounded-[28px] font-black text-sm uppercase cursor-pointer hover:bg-blue-700 transition-all italic">
                          {loading ? <Loader2 className="animate-spin" /> : <><Camera className="w-6 h-6 mb-2" /> Upload Bukti</>}
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
      
      {/* Support Modal */}
      <AnimatePresence>
        {showSupport && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-6">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-white w-full max-w-lg rounded-[40px] p-10 relative shadow-2xl">
              <button onClick={() => setShowSupport(false)} className="absolute top-8 right-8 text-slate-300 hover:text-red-500"><XCircle className="w-6 h-6" /></button>
              <div className="mb-8">
                <div className="bg-blue-600 w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-6 shadow-xl shadow-blue-100"><Mail className="w-7 h-7" /></div>
                <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Nexa Support</h3>
                <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">Layanan Bantuan & Refund Otomatis</p>
              </div>
              <form onSubmit={handleSupportSubmit} className="space-y-6">
                 <input type="email" required placeholder="Email Anda (Gunakan yang aktif)" className="w-full bg-slate-50 border border-slate-100 p-5 rounded-2xl outline-none text-xs font-bold" value={supportEmail} onChange={(e) => setSupportEmail(e.target.value)} />
                 <input type="text" placeholder="Order ID (Jika ada)" className="w-full bg-slate-50 border border-slate-100 p-5 rounded-2xl outline-none text-xs font-bold" value={supportOrderId} onChange={(e) => setSupportOrderId(setSupportOrderId(e.target.value))} />
                 <textarea required rows={4} placeholder="Jelaskan kendala Anda..." className="w-full bg-slate-50 border border-slate-100 p-5 rounded-2xl outline-none text-xs font-bold resize-none" value={supportMessage} onChange={(e) => setSupportMessage(e.target.value)}></textarea>
                 <button type="submit" disabled={supportLoading} className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black uppercase text-sm flex items-center justify-center gap-2 hover:bg-blue-700 transition-all">
                   {supportLoading ? <Loader2 className="animate-spin" /> : <><Send className="w-5 h-5" /> Kirim Bantuan</>}
                 </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Documentation Modal */}
      <AnimatePresence>
        {showDoc && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[101] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 md:p-10">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white w-full max-w-4xl max-h-[90vh] rounded-[48px] overflow-hidden shadow-2xl flex flex-col relative">
              <button onClick={() => setShowDoc(false)} className="absolute top-10 right-10 text-slate-300 hover:text-red-500 z-10"><XCircle className="w-8 h-8" /></button>
              
              <div className="p-10 md:p-16 overflow-y-auto custom-scrollbar">
                <div className="inline-flex items-center gap-3 bg-blue-50 px-4 py-2 rounded-full text-blue-600 text-[10px] font-black uppercase tracking-widest mb-6">
                  <FileText className="w-4 h-4" /> Official Guidelines
                </div>
                <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase mb-2">Prosedur Layanan & Dukungan</h2>
                <p className="text-slate-400 font-bold text-sm uppercase tracking-widest italic mb-12">Panduan Komunikasi & Refund Nexa Sosial</p>
                
                <div className="space-y-12 pb-10">
                  <section className="space-y-4">
                    <h3 className="flex items-center gap-3 text-lg font-black text-slate-800 uppercase italic border-b border-slate-100 pb-2"><span className="text-blue-600">01</span> Email Resmi Nexa</h3>
                    <div className="bg-slate-50 p-6 rounded-[32px] border border-slate-100 space-y-4">
                      <p className="text-sm font-bold text-slate-500 leading-relaxed">Semua komunikasi dukungan hanya dilakukan melalui email resmi berikut:</p>
                      <div className="inline-flex items-center gap-3 bg-white px-6 py-4 rounded-2xl border border-blue-100 font-black text-blue-600 text-lg shadow-sm">
                        <Mail className="w-5 h-5" /> nexastore34@gmail.com
                      </div>
                      <div className="space-y-2 pt-2">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email ini digunakan untuk:</p>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                           <li className="flex items-center gap-2 text-xs font-bold text-slate-600"><ChevronRight className="w-3 h-3 text-blue-600" /> Keluhan layanan Premium</li>
                           <li className="flex items-center gap-2 text-xs font-bold text-slate-600"><ChevronRight className="w-3 h-3 text-blue-600" /> Verifikasi pembayaran QRIS</li>
                           <li className="flex items-center gap-2 text-xs font-bold text-slate-600"><ChevronRight className="w-3 h-3 text-blue-600" /> Pengajuan refund (pengembalian dana)</li>
                        </ul>
                      </div>
                    </div>
                  </section>

                  <section className="space-y-4">
                    <h3 className="flex items-center gap-3 text-lg font-black text-slate-800 uppercase italic border-b border-slate-100 pb-2"><span className="text-blue-600">02</span> Alur Kontak Pengguna</h3>
                    <p className="text-sm font-bold text-slate-500 leading-relaxed">
                      Pengguna tidak menghubungi admin secara langsung. Pengguna wajib menggunakan form <span className="text-blue-600">Hubungi Admin</span> di website Nexa. 
                      Setelah form dikirim, sistem akan otomatis mengirim email balasan. Admin tidak perlu membalas manual pada tahap awal.
                    </p>
                  </section>

                  <section className="space-y-4">
                    <h3 className="flex items-center gap-3 text-lg font-black text-slate-800 uppercase italic border-b border-slate-100 pb-2"><span className="text-blue-600">03</span> Balasan Otomatis (Auto-Reply)</h3>
                    <div className="bg-slate-50 p-6 rounded-[32px] border border-slate-100">
                      <p className="text-sm font-bold text-slate-500 mb-6">Pengguna <span className="text-red-500 underline">WAJIB</span> membalas email otomatis sistem dengan melampirkan data berikut:</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                          { id: '1', title: 'Bukti Pembayaran', desc: 'Screenshot / Foto QRIS asli' },
                          { id: '2', title: 'Nomor WhatsApp', desc: 'Nomor aktif untuk refund' },
                          { id: '3', title: 'ID Pesanan', desc: 'Sesuai riwayat pesanan' },
                          { id: '4', title: 'Link TikTok', desc: 'Video yang dipesan' }
                        ].map((item) => (
                          <div key={item.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-3">
                            <div className="bg-blue-600 text-white w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black shrink-0">{item.id}</div>
                            <div>
                               <p className="text-xs font-black text-slate-800 uppercase tracking-tight">{item.title}</p>
                               <p className="text-[11px] font-bold text-slate-400 italic">{item.desc}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </section>

                  <section className="space-y-4">
                    <h3 className="flex items-center gap-3 text-lg font-black text-slate-800 uppercase italic border-b border-slate-100 pb-2"><span className="text-blue-600">04</span> Batas Waktu Penanganan</h3>
                    <div className="p-6 bg-blue-50/50 rounded-[32px] border border-blue-100 border-dashed">
                      <p className="text-sm font-bold text-slate-600 leading-relaxed italic">
                        Untuk layanan <span className="text-blue-600">Premium</span>: Jika pesanan belum berjalan dalam waktu maksimal <span className="underline">30 menit</span> setelah pembayaran berhasil DAN pengguna telah mengirim data lengkap, maka admin akan melakukan pengembalian dana (refund).
                      </p>
                    </div>
                  </section>

                  <section className="space-y-4">
                    <h3 className="flex items-center gap-3 text-lg font-black text-slate-800 uppercase italic border-b border-slate-100 pb-2"><span className="text-blue-600">05</span> Ketentuan Nomor Aktif</h3>
                    <p className="text-sm font-bold text-slate-500 leading-relaxed">
                      Pengguna wajib mengisi nomor aktif yang dapat dihubungi. Nomor digunakan jika terjadi kendala sistem atau proses refund memerlukan konfirmasi. Jika nomor tidak aktif, proses penanganan dapat tertunda.
                    </p>
                  </section>

                  <section className="space-y-4">
                    <h3 className="flex items-center gap-3 text-lg font-black text-slate-800 uppercase italic border-b border-slate-100 pb-2"><span className="text-blue-600">06</span> Pencatatan Riwayat</h3>
                    <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                       <ShieldCheck className="text-green-500 w-8 h-8 shrink-0" />
                       <p className="text-xs font-bold text-slate-500 italic">Semua aktivitas (pesan awal, auto-reply, balasan pengguna) dicatat otomatis di database dan tetap tersedia meskipun admin logout.</p>
                    </div>
                  </section>

                  <section className="space-y-4">
                    <h3 className="flex items-center gap-3 text-lg font-black text-slate-800 uppercase italic border-b border-slate-100 pb-2"><span className="text-blue-600">07</span> Pencegahan Penyalahgunaan</h3>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3 text-xs font-bold text-slate-500"><Info className="w-4 h-4 text-blue-600 shrink-0" /> Auto-reply hanya dikirim satu kali per ID pesanan.</li>
                      <li className="flex items-start gap-3 text-xs font-bold text-slate-500"><Info className="w-4 h-4 text-blue-600 shrink-0" /> Sistem tidak merespon email berulang tanpa data lengkap yang valid.</li>
                      <li className="flex items-start gap-3 text-xs font-bold text-slate-500"><Info className="w-4 h-4 text-blue-600 shrink-0" /> Setiap klaim diverifikasi ketat dengan data di database Nexa.</li>
                    </ul>
                  </section>

                  <section className="space-y-4">
                    <h3 className="flex items-center gap-3 text-lg font-black text-slate-800 uppercase italic border-b border-slate-100 pb-2"><span className="text-blue-600">08</span> Persetujuan Pengguna</h3>
                    <div className="bg-slate-900 p-8 rounded-[40px] text-white text-center space-y-4 shadow-xl">
                       <CheckCircle2 className="w-10 h-10 text-blue-400 mx-auto" />
                       <p className="text-xs font-black uppercase tracking-widest leading-relaxed">Dengan menghubungi Nexa melalui form support, pengguna dianggap setuju dengan prosedur ini, bersedia mengirim data yang diminta, dan memahami batas waktu penanganan.</p>
                    </div>
                  </section>

                  <div className="pt-10 text-center">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-[4px]">Nexa Community Policy • Document v1.2 • 2026</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="text-center mt-24 text-slate-200 font-black text-[9px] uppercase tracking-[6px] italic pb-10">© 2026 NEXA SOSIAL COMMUNITY • FASTEST CLOUD BOOST</footer>
      <style jsx>{`.custom-scrollbar::-webkit-scrollbar { width: 4px; } .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }`}</style>
    </main>
  );
}
