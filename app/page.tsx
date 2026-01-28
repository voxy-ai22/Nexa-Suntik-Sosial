"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Rocket, CheckCircle2, Loader2, Camera, History, XCircle,
  MessageCircle, Send, FileText, ShieldCheck, ChevronRight
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
        alert('Laporan terkirim. Cek email Anda untuk konfirmasi.');
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
    <main className="min-h-screen bg-[#f8fafc] text-slate-900 pb-10 font-sans selection:bg-blue-100">
      <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Rocket className="text-blue-600 w-5 h-5" />
            <h1 className="text-base font-black tracking-tighter uppercase italic">Nexa Sosial</h1>
          </div>
          <div className="flex gap-4 items-center">
             <button onClick={() => setShowDoc(true)} className="hidden md:flex text-[10px] font-black text-slate-400 hover:text-blue-600 uppercase items-center gap-1">
               <FileText className="w-3.5 h-3.5" /> Guide
             </button>
             <button onClick={() => window.location.href='/admin/dashboard'} className="text-[10px] font-black text-slate-400 hover:text-red-600 uppercase flex items-center gap-1">
               <ShieldCheck className="w-3.5 h-3.5" /> Admin
             </button>
             <button onClick={() => setShowSupport(true)} className="text-[10px] font-black text-blue-600 uppercase flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-xl">
               <MessageCircle className="w-3.5 h-3.5" /> Support
             </button>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-4xl font-black text-slate-900 leading-none tracking-tight">FAST VIEWS<br/><span className="text-blue-600">TIKTOK BOOST</span></h2>
              <p className="text-slate-400 font-bold text-xs uppercase italic tracking-wider">Aman, Cepat, Bergaransi Refund.</p>
            </div>

            <div className="bg-white p-6 rounded-[24px] border border-slate-200 shadow-sm">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="flex p-1 bg-slate-100 rounded-xl">
                  {(['FREE', 'PREMIUM'] as const).map((type) => (
                    <button key={type} type="button" onClick={() => { setServiceType(type); setJumlahView(1000); }}
                      className={`flex-1 py-2.5 rounded-lg text-[10px] font-black transition-all uppercase ${serviceType === type ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}>
                      {type}
                    </button>
                  ))}
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase ml-1">TikTok Link</label>
                    <input type="url" required placeholder="https://www.tiktok.com/@user/video/..." className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 p-3.5 rounded-xl outline-none font-bold text-sm" value={linkTikTok} onChange={(e) => setLinkTikTok(e.target.value)} />
                  </div>
                  
                  {serviceType === 'PREMIUM' && (
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase ml-1">WhatsApp (For Refund)</label>
                      <input type="tel" required placeholder="08..." className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 p-3.5 rounded-xl outline-none font-bold text-sm" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
                    </div>
                  )}

                  <div className="space-y-3">
                    <div className="flex justify-between items-center px-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase">Target Views</label>
                      <span className="text-blue-600 font-black text-lg italic">{jumlahView.toLocaleString()}</span>
                    </div>
                    <input type="range" min="1000" max={serviceType === 'FREE' ? 3000 : 200000} step={serviceType === 'FREE' ? 100 : 1000} className="w-full h-1.5 bg-slate-100 rounded-full appearance-none cursor-pointer accent-blue-600" value={jumlahView} onChange={(e) => setJumlahView(parseInt(e.target.value))} />
                  </div>
                </div>

                {serviceType === 'PREMIUM' && (
                   <div className="bg-blue-50 p-3 rounded-xl border border-blue-100 flex justify-between items-center">
                      <span className="text-[9px] font-black text-blue-600 uppercase">Price:</span>
                      <span className="text-base font-black text-slate-900">Rp {price.toLocaleString()}</span>
                   </div>
                )}

                {error && <p className="text-red-500 text-[10px] font-bold uppercase text-center bg-red-50 p-2 rounded-lg">{error}</p>}

                <button type="submit" disabled={loading} className="w-full bg-slate-900 text-white py-4 rounded-xl font-black text-sm hover:bg-blue-600 transition-all disabled:opacity-50 uppercase tracking-widest italic">
                  {loading ? <Loader2 className="animate-spin mx-auto w-5 h-5" /> : (serviceType === 'FREE' ? 'Claim Free Views' : 'Order Premium')}
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
                      <h3 className="text-xs font-black uppercase tracking-tight">Recent Orders</h3>
                    </div>
                    <div className="text-[8px] font-bold text-slate-300 uppercase">#{deviceId}</div>
                  </div>
                  
                  <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1">
                    {userHistory.map((h) => (
                      <div key={h.id} className="bg-slate-50 p-3 rounded-xl flex justify-between items-center border border-slate-100">
                        <div>
                          <div className="text-[7px] font-black text-blue-600 uppercase tracking-tighter">{h.service_type}</div>
                          <div className="text-xs font-bold text-slate-800">{h.jumlah_view.toLocaleString()} Views</div>
                        </div>
                        <div className={`px-2 py-1 rounded-lg text-[7px] font-black uppercase border ${h.status === 'success' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-white text-slate-400 border-slate-200'}`}>{h.status.replace('_', ' ')}</div>
                      </div>
                    ))}
                    {userHistory.length === 0 && <p className="text-slate-300 font-bold text-[9px] text-center py-10 uppercase italic">No history yet</p>}
                  </div>
                </div>
              ) : (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white p-6 rounded-[24px] shadow-lg border border-slate-200 text-center space-y-5">
                  <div className="text-[9px] font-black text-slate-300 uppercase">ORDER ID: {orderResult.id.substring(0,8)}</div>

                  {orderResult.status === 'waiting_admin' ? (
                    <div className="py-6 space-y-3">
                      <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mx-auto">
                        <Loader2 className="text-blue-600 w-6 h-6 animate-spin" />
                      </div>
                      <h3 className="text-sm font-black uppercase">Verifying Payment...</h3>
                      <button onClick={() => setOrderResult(null)} className="text-blue-600 font-black text-[9px] uppercase hover:underline">Return to Home</button>
                    </div>
                  ) : orderResult.service_type === 'FREE' ? (
                    <div className="py-6 space-y-3">
                      <CheckCircle2 className="text-green-500 w-12 h-12 mx-auto" />
                      <h3 className="text-sm font-black uppercase">Added to Queue</h3>
                      <button onClick={() => setOrderResult(null)} className="w-full bg-slate-900 text-white py-3 rounded-lg font-black uppercase text-[10px]">Got it</button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                       <div className="bg-amber-50 text-amber-600 p-2 rounded-lg font-black text-[9px] flex justify-between items-center">
                          <span>UPLOADING LIMIT:</span>
                          <span>{timer}s</span>
                       </div>
                       <div className="bg-slate-100 p-2 rounded-xl"><img src={QRIS_IMAGE_URL} alt="QRIS" className="w-full rounded-lg max-h-64 object-contain mx-auto" /></div>
                       <div className="text-center">
                          <p className="text-[9px] font-black text-slate-400 uppercase">Transfer amount:</p>
                          <p className="text-xl font-black text-blue-600">Rp {price.toLocaleString()}</p>
                       </div>
                       <label className="w-full bg-blue-600 text-white py-3 rounded-xl font-black text-[10px] uppercase cursor-pointer flex items-center justify-center gap-2 hover:bg-blue-700">
                          {loading ? <Loader2 className="animate-spin w-4 h-4" /> : <><Camera className="w-4 h-4" /> Upload Receipt</>}
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
      
      {/* Support Modal - Optimized */}
      {showSupport && (
        <div className="fixed inset-0 z-[100] bg-slate-900/40 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-[24px] p-6 relative">
            <button onClick={() => setShowSupport(false)} className="absolute top-4 right-4 text-slate-300"><XCircle className="w-5 h-5" /></button>
            <h3 className="text-lg font-black uppercase tracking-tight mb-4">Support Team</h3>
            <form onSubmit={handleSupportSubmit} className="space-y-3">
               <input type="email" required placeholder="Your Active Email" className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs font-bold" value={supportEmail} onChange={(e) => setSupportEmail(e.target.value)} />
               <input type="text" placeholder="Order ID (Optional)" className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs font-bold" value={supportOrderId} onChange={(e) => setSupportOrderId(e.target.value)} />
               <textarea required rows={3} placeholder="Tell us your problem..." className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs font-bold resize-none" value={supportMessage} onChange={(e) => setSupportMessage(e.target.value)}></textarea>
               <button type="submit" disabled={supportLoading} className="w-full bg-blue-600 text-white py-3 rounded-xl font-black uppercase text-[10px] flex items-center justify-center gap-2">
                 {supportLoading ? <Loader2 className="animate-spin w-4 h-4" /> : <Send className="w-4 h-4" />} Send Request
               </button>
            </form>
          </div>
        </div>
      )}

      {/* Doc Modal - Updated Content */}
      {showDoc && (
        <div className="fixed inset-0 z-[101] bg-slate-900/50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg max-h-[85vh] rounded-[24px] overflow-y-auto p-8 relative">
            <button onClick={() => setShowDoc(false)} className="absolute top-6 right-6 text-slate-300"><XCircle className="w-6 h-6" /></button>
            <h2 className="text-2xl font-black uppercase mb-6 flex items-center gap-2">
              <FileText className="text-blue-600" /> Dokumen Sistem
            </h2>
            
            <div className="space-y-8 text-[11px] font-bold text-slate-600 uppercase tracking-wide leading-relaxed">
               <section className="space-y-3">
                  <h3 className="text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                    Layanan Free (Gratis)
                  </h3>
                  <div className="bg-blue-50/50 p-4 rounded-xl space-y-2">
                    <p>• Kuota: Maksimal 3.000 Views per order.</p>
                    <p>• Limit: 1 order per 25 jam per perangkat.</p>
                    <p>• Kecepatan: Estimasi proses 1-12 jam tergantung antrean.</p>
                  </div>
               </section>

               <section className="space-y-3">
                  <h3 className="text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                    Layanan Premium (Berbayar)
                  </h3>
                  <div className="bg-green-50/50 p-4 rounded-xl space-y-2 text-green-800">
                    <p>• Kuota: Hingga 200.000 Views per order.</p>
                    <p>• Kecepatan: Prioritas utama (5-30 menit).</p>
                    <p>• Garansi: Refund 100% saldo jika views tidak masuk dalam 24 jam.</p>
                    <p>• WA: Wajib mencantumkan nomor WA untuk koordinasi refund.</p>
                  </div>
               </section>

               <section className="space-y-3">
                  <h3 className="text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                    Panduan Admin
                  </h3>
                  <div className="bg-slate-100 p-4 rounded-xl space-y-2 text-slate-500">
                    <p>• Akses: Klik menu "Admin" di Navbar atau buka /admin/dashboard.</p>
                    <p>• Monitoring: Admin wajib mengecek tab "Orders" setiap 15 menit.</p>
                    <p>• Validasi: Cek bukti transfer yang diunggah user pada status "Waiting Admin".</p>
                    <p>• Support: Tanggapi laporan di tab "Support" dan balas via email yang tertera.</p>
                  </div>
               </section>
            </div>
            
            <button onClick={() => setShowDoc(false)} className="w-full mt-8 bg-slate-900 text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest">
              Tutup Dokumen
            </button>
          </div>
        </div>
      )}

      <footer className="text-center mt-12 text-slate-300 font-black text-[7px] uppercase tracking-[3px]">© 2026 NEXA SOSIAL ENGINE</footer>
    </main>
  );
}