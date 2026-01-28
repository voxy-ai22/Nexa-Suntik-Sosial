"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  LayoutDashboard, LogOut, Home as HomeIcon,
  Mail, User, Copy, ShieldCheck, Loader2, RefreshCw, BellRing,
  Trash2, Check, X, Clock, ExternalLink, Menu, Eye, Download
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminDashboard() {
  const [orders, setOrders] = useState<any[]>([]);
  const [supportLogs, setSupportLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasNewData, setHasNewData] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'ORDERS' | 'SUPPORT'>('ORDERS');
  const [filter, setFilter] = useState<'ALL' | 'FREE' | 'PREMIUM'>('ALL');
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  
  const router = useRouter();
  const refreshInterval = useRef<any>(null);
  const prevDataCount = useRef<number>(0);

  const fetchData = useCallback(async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    else setIsRefreshing(true);

    try {
      if (activeTab === 'ORDERS') {
        const res = await fetch(`/api/admin/requests?type=${filter}`, { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (isBackground && data.length > prevDataCount.current) {
            setHasNewData(true);
            setTimeout(() => setHasNewData(false), 5000);
          }
          prevDataCount.current = data.length;
          setOrders(data);
        }
      } else {
        const res = await fetch(`/api/admin/support`, { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          setSupportLogs(data);
        }
      }
      setLastUpdated(new Date().toLocaleTimeString('id-ID'));
    } catch (err) {
      console.error('Sync error:', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [activeTab, filter]);

  useEffect(() => {
    fetchData();
    refreshInterval.current = setInterval(() => fetchData(true), 8000);
    return () => clearInterval(refreshInterval.current);
  }, [fetchData]);

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
      window.location.href = '/admin/login';
    } catch (e) {
      console.error("Logout failed", e);
    }
  };

  const updateOrderStatus = async (id: string, status: string) => {
    try {
      const res = await fetch('/api/admin/requests', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status })
      });
      if (res.ok) fetchData(true);
    } catch (e) { alert("Gagal update status"); }
  };

  // Fix: Added missing updateSupportStatus function to handle support ticket updates in the dashboard
  const updateSupportStatus = async (id: string, status: string) => {
    try {
      const res = await fetch('/api/admin/support', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status })
      });
      if (res.ok) fetchData(true);
    } catch (e) { alert("Gagal update status support"); }
  };

  const deleteOrder = async (id: string) => {
    if (!confirm("Hapus pesanan ini secara permanen?")) return;
    try {
      const res = await fetch('/api/admin/requests', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (res.ok) fetchData(true);
    } catch (e) { alert("Gagal menghapus"); }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const downloadImage = (base64: string, filename: string) => {
    const link = document.createElement('a');
    link.href = base64;
    link.download = filename;
    link.click();
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-blue-100 overflow-x-hidden">
      {/* Top Navbar */}
      <nav className="bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-[60] px-6 py-3 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl shadow-lg transition-all ${hasNewData ? 'bg-green-500 scale-110' : 'bg-blue-600'}`}>
            {hasNewData ? <BellRing className="w-5 h-5 text-white animate-bounce" /> : <ShieldCheck className="w-5 h-5 text-white" />}
          </div>
          <div>
            <h1 className="text-[11px] font-black tracking-tighter uppercase leading-none">NEXA COMMAND</h1>
            <span className="text-[8px] font-black uppercase text-slate-400 tracking-widest mt-1 block">Live Monitoring • {lastUpdated}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden lg:flex bg-slate-100 p-1 rounded-2xl border border-slate-200/50">
            <button onClick={() => setActiveTab('ORDERS')} className={`px-5 py-2 rounded-xl text-[9px] font-black uppercase transition-all ${activeTab === 'ORDERS' ? 'bg-white text-blue-600 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}>Orders</button>
            <button onClick={() => setActiveTab('SUPPORT')} className={`px-5 py-2 rounded-xl text-[9px] font-black uppercase transition-all ${activeTab === 'SUPPORT' ? 'bg-white text-blue-600 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}>Support</button>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => router.push('/')} className="p-2.5 bg-slate-50 hover:bg-blue-50 text-slate-400 hover:text-blue-600 rounded-xl transition-all border border-slate-200"><HomeIcon className="w-4 h-4" /></button>
            <button onClick={handleLogout} className="p-2.5 bg-red-50 hover:bg-red-100 text-red-500 rounded-xl transition-all border border-red-100"><LogOut className="w-4 h-4" /></button>
            <button onClick={() => setIsMobileNavOpen(!isMobileNavOpen)} className="lg:hidden p-2.5 bg-slate-100 text-slate-600 rounded-xl"><Menu className="w-4 h-4" /></button>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {isMobileNavOpen && (
          <motion.div initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -50, opacity: 0 }} className="fixed top-16 left-0 w-full bg-white z-[55] p-6 border-b border-slate-200 shadow-xl lg:hidden">
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => { setActiveTab('ORDERS'); setIsMobileNavOpen(false); }} className={`p-4 rounded-2xl font-black uppercase text-xs border-2 ${activeTab === 'ORDERS' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-400 border-slate-100'}`}>Orders</button>
              <button onClick={() => { setActiveTab('SUPPORT'); setIsMobileNavOpen(false); }} className={`p-4 rounded-2xl font-black uppercase text-xs border-2 ${activeTab === 'SUPPORT' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-400 border-slate-100'}`}>Support</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="max-w-6xl mx-auto px-6 py-10">
        {activeTab === 'ORDERS' ? (
          <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-end gap-4">
              <h2 className="text-3xl font-black uppercase italic tracking-tight">Orders Queue</h2>
              <div className="flex gap-2 bg-white p-1 rounded-2xl border border-slate-200 shadow-sm">
                {(['ALL', 'FREE', 'PREMIUM'] as const).map((t) => (
                  <button key={t} onClick={() => setFilter(t)} className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase transition-all ${filter === t ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}>{t}</button>
                ))}
              </div>
            </div>
            
            <div className="grid gap-4">
              {orders.map((order) => (
                <div key={order.id} className="bg-white p-6 rounded-[24px] border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between hover:shadow-xl hover:border-blue-300 transition-all duration-300 relative overflow-hidden group">
                   {order.service_type === 'PREMIUM' && <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-400"></div>}
                   <div className="space-y-3 flex-1">
                      <div className="flex items-center gap-3">
                        <span className={`text-[8px] font-black px-3 py-1 rounded-full uppercase border ${order.service_type === 'PREMIUM' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>{order.service_type}</span>
                        <span className="text-[10px] font-black text-slate-300">#{order.id.substring(0,8).toUpperCase()}</span>
                      </div>
                      <a href={order.tiktok_link} target="_blank" className="text-sm font-black text-slate-800 truncate block max-w-lg hover:text-blue-600 transition-colors flex items-center gap-2">{order.tiktok_link} <ExternalLink className="w-3 h-3" /></a>
                      <div className="flex flex-wrap items-center gap-4">
                         <div className="text-[9px] text-slate-400 font-bold uppercase bg-slate-50 px-2 py-1 rounded-lg flex items-center gap-1">
                           <User className="w-3 h-3" /> {order.device_id.substring(0,10)}... 
                           <Copy className="w-3 h-3 cursor-pointer hover:text-blue-500" onClick={() => copyToClipboard(order.device_id)} />
                         </div>
                         {order.payment_proof_url && (
                           <button onClick={() => setPreviewImage(order.payment_proof_url)} className="text-[9px] font-black text-amber-600 bg-amber-50 border border-amber-100 px-3 py-1 rounded-lg uppercase flex items-center gap-1 animate-pulse">
                             <Eye className="w-3 h-3" /> Bukti Bayar
                           </button>
                         )}
                      </div>
                   </div>
                   <div className="flex items-center gap-8 mt-6 md:mt-0">
                      <div className="text-right">
                         <p className="text-2xl font-black text-slate-900 leading-none italic">{order.views.toLocaleString()}</p>
                         <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">Target Views</p>
                      </div>
                      <div className="flex flex-col items-end gap-2 min-w-[140px]">
                         <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase border shadow-sm ${
                           order.status === 'success' ? 'bg-green-50 text-green-600 border-green-200' : 
                           order.status === 'pending_payment' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                           order.status === 'waiting_admin' ? 'bg-blue-600 text-white border-blue-500 animate-pulse' : 'bg-slate-50 text-slate-400'
                         }`}>{order.status.replace('_', ' ')}</div>
                         <div className="flex items-center gap-1.5 mt-2">
                           <button onClick={() => updateOrderStatus(order.id, 'success')} className="p-2 bg-green-50 text-green-600 rounded-lg border border-green-200 hover:bg-green-100 transition-all"><Check className="w-3.5 h-3.5" /></button>
                           <button onClick={() => updateOrderStatus(order.id, 'failed')} className="p-2 bg-red-50 text-red-600 rounded-lg border border-red-200 hover:bg-red-100 transition-all"><X className="w-3.5 h-3.5" /></button>
                           <button onClick={() => deleteOrder(order.id)} className="p-2 bg-slate-900 text-white rounded-lg hover:bg-red-600 transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                         </div>
                      </div>
                   </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            <h2 className="text-3xl font-black uppercase italic tracking-tight">Support Inbox</h2>
            <div className="grid gap-6">
              {supportLogs.map((log) => (
                <div key={log.id} className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm space-y-4 hover:border-blue-400 transition-all">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-2xl ${log.direction === 'incoming' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}><Mail className="w-5 h-5" /></div>
                      <div>
                        <p className="text-sm font-black text-slate-900">{log.email_user}</p>
                        <p className="text-[9px] font-black text-slate-400 uppercase mt-1">{new Date(log.created_at).toLocaleString('id-ID')}</p>
                      </div>
                    </div>
                    <select value={log.status} onChange={(e) => updateSupportStatus(log.id, e.target.value)} className="text-[10px] font-black uppercase border rounded-xl px-4 py-2 outline-none">
                      <option>Waiting Admin</option><option>Resolved</option><option>Refunded</option>
                    </select>
                  </div>
                  <div className="bg-slate-50 p-6 rounded-2xl text-[14px] font-medium text-slate-700 italic">"{log.body}"</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Image Preview Modal */}
      <AnimatePresence>
        {previewImage && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/90 backdrop-blur-md" onClick={() => setPreviewImage(null)} />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-white p-4 rounded-[40px] max-w-lg w-full shadow-2xl overflow-hidden">
               <div className="flex justify-between items-center mb-4 px-2">
                  <h3 className="text-sm font-black uppercase italic text-slate-400">Bukti Pembayaran</h3>
                  <div className="flex gap-2">
                    <button onClick={() => downloadImage(previewImage!, 'bukti-transfer.png')} className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100"><Download className="w-5 h-5" /></button>
                    <button onClick={() => setPreviewImage(null)} className="p-2 bg-slate-100 text-slate-400 rounded-xl hover:bg-red-50 hover:text-red-500 transition-all"><X className="w-5 h-5" /></button>
                  </div>
               </div>
               <div className="rounded-[32px] overflow-hidden border-4 border-slate-50 bg-slate-100">
                  <img src={previewImage} alt="Payment Proof" className="w-full h-auto object-contain max-h-[70vh]" />
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
