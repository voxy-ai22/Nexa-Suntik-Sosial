"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, LogOut, CheckCircle2, XCircle, 
  RefreshCcw, ExternalLink, Phone, Copy, Trash2, Eye, Clock, Filter
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'FREE' | 'PREMIUM'>('ALL');
  const [viewingProof, setViewingProof] = useState<string | null>(null);
  const router = useRouter();

  const fetchOrders = async () => {
    try {
      const res = await fetch(`/api/admin/requests?type=${filter}`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000); // Polling setiap 5 detik
    return () => clearInterval(interval);
  }, [filter]);

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch('/api/admin/requests', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status })
      });
      if (res.ok) fetchOrders();
    } catch (err) {
      alert('Gagal update status');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus order ini secara permanen?')) return;
    try {
      const res = await fetch('/api/admin/requests', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (res.ok) fetchOrders();
    } catch (err) {
      alert('Gagal hapus');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Link disalin!');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-700 border-green-200';
      case 'failed': return 'bg-red-100 text-red-700 border-red-200';
      case 'waiting_admin': return 'bg-blue-100 text-blue-700 border-blue-200 animate-pulse';
      case 'processing': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'pending_payment': return 'bg-amber-100 text-amber-700 border-amber-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans">
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 px-6 py-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-xl text-white">
            <LayoutDashboard className="w-5 h-5" />
          </div>
          <h1 className="text-xl font-black text-slate-800 tracking-tight uppercase">Nexa Live Control</h1>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => router.push('/')} className="text-sm font-bold text-slate-400 hover:text-blue-600">Home</button>
          <button 
            onClick={() => {
              document.cookie = "admin_auth=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
              router.push('/admin/login');
            }}
            className="flex items-center gap-2 text-slate-400 hover:text-red-600 font-bold text-sm transition-all border border-slate-200 px-4 py-2 rounded-xl"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">Orders Center</h2>
            <p className="text-slate-400 font-medium">Monitoring real-time aktivitas user di Nexa Sosial.</p>
          </div>
          
          <div className="flex p-1.5 bg-white rounded-2xl shadow-sm border border-slate-200">
            {(['ALL', 'FREE', 'PREMIUM'] as const).map((t) => (
              <button 
                key={t} onClick={() => setFilter(t)}
                className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all ${
                  filter === t ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-slate-400 hover:bg-slate-50'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <AnimatePresence mode="popLayout">
            {orders.map((order) => (
              <motion.div 
                layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                key={order.id} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col lg:flex-row gap-6 items-center"
              >
                <div className="flex-1 min-w-0 space-y-3">
                  <div className="flex items-center gap-3">
                    <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase border tracking-widest ${
                      order.service_type === 'PREMIUM' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-slate-50 text-slate-400 border-slate-100'
                    }`}>
                      {order.service_type}
                    </span>
                    <span className="text-[10px] text-slate-300 font-bold flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {new Date(order.created_at).toLocaleString('id-ID')}
                    </span>
                  </div>
                  
                  <div className="space-y-1">
                    <h3 className="font-black text-slate-800 text-lg truncate">Order: #{order.id.substring(0, 8).toUpperCase()}</h3>
                    <div className="flex flex-wrap gap-4">
                      <button onClick={() => copyToClipboard(order.tiktok_link)} className="flex items-center gap-1.5 text-xs font-bold text-blue-500 hover:underline">
                        <Copy className="w-3 h-3" /> Salin Link TikTok
                      </button>
                      {order.phone_number && (
                        <a href={`https://wa.me/${order.phone_number}`} target="_blank" className="flex items-center gap-1.5 text-xs font-bold text-green-500 hover:underline">
                          <Phone className="w-3 h-3" /> {order.phone_number}
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-center lg:text-right px-8 border-x border-slate-50">
                  <div className="text-2xl font-black text-slate-900 leading-none">{order.views.toLocaleString()}</div>
                  <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Target Views</div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase border tracking-widest ${getStatusColor(order.status)}`}>
                    {order.status.replace('_', ' ')}
                  </div>

                  <div className="flex gap-2">
                    {order.payment_proof_url && (
                      <button onClick={() => setViewingProof(order.payment_proof_url)} className="p-3 bg-blue-50 text-blue-600 rounded-2xl hover:bg-blue-100" title="Lihat Bukti">
                        <Eye className="w-5 h-5" />
                      </button>
                    )}
                    <button onClick={() => handleUpdateStatus(order.id, 'success')} className="p-3 bg-green-500 text-white rounded-2xl hover:bg-green-600 shadow-lg shadow-green-100" title="Approve">
                      <CheckCircle2 className="w-5 h-5" />
                    </button>
                    <button onClick={() => handleUpdateStatus(order.id, 'failed')} className="p-3 bg-red-500 text-white rounded-2xl hover:bg-red-600 shadow-lg shadow-red-100" title="Reject">
                      <XCircle className="w-5 h-5" />
                    </button>
                    <button onClick={() => handleDelete(order.id)} className="p-3 bg-slate-100 text-slate-400 rounded-2xl hover:bg-slate-200" title="Hapus">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {orders.length === 0 && !loading && (
            <div className="py-32 text-center bg-white rounded-[48px] border-2 border-dashed border-slate-100">
               <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                 <RefreshCcw className="text-slate-300 w-8 h-8" />
               </div>
               <p className="text-slate-400 font-black uppercase tracking-widest text-sm">
                 Belum ada pesanan masuk.<br/>Sistem menunggu permintaan user secara real-time.
               </p>
            </div>
          )}
        </div>

        <AnimatePresence>
          {viewingProof && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-slate-900/90 backdrop-blur-sm flex items-center justify-center p-6" 
              onClick={() => setViewingProof(null)}
            >
              <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="relative max-w-2xl w-full">
                <img src={viewingProof} alt="Bukti Pembayaran" className="w-full h-auto rounded-[32px] shadow-2xl border-4 border-white/10" />
                <button className="absolute top-4 right-4 bg-white/20 hover:bg-white/40 p-3 rounded-full text-white backdrop-blur-md">
                   <XCircle className="w-6 h-6" />
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}