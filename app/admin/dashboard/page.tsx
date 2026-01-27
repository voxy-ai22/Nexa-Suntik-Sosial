"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, LogOut, CheckCircle2, XCircle, 
  RefreshCcw, ExternalLink, Phone, Copy, Trash2, Filter, Eye
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'free' | 'premium'>('all');
  const [viewingProof, setViewingProof] = useState<string | null>(null);
  const router = useRouter();

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/requests?type=${filter}`);
      if (res.ok) {
        const data = await res.json();
        setRequests(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [filter]);

  const handleUpdateStatus = async (id: number, status: string) => {
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

  const handleDelete = async (id: number) => {
    if (!confirm('Yakin ingin menghapus order ini secara permanen?')) return;
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

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Teks disalin!');
  };

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <LayoutDashboard className="text-blue-600" />
            <h1 className="text-xl font-black text-slate-800 tracking-tight">NEXA ADMIN PANEL</h1>
          </div>
          <button onClick={() => {
            document.cookie = "admin_auth=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            router.push('/admin/login');
          }} className="flex items-center gap-2 text-slate-400 hover:text-red-500 font-bold text-sm transition-all">
            <LogOut className="w-4 h-4" /> Keluar
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div>
            <h2 className="text-3xl font-black text-slate-900">Riwayat Pesanan</h2>
            <p className="text-slate-400 font-medium">Monitoring sistem suntik view secara real-time.</p>
          </div>
          
          <div className="flex items-center gap-3 bg-white p-2 rounded-2xl shadow-sm border border-slate-200">
            {(['all', 'free', 'premium'] as const).map((t) => (
              <button 
                key={t} onClick={() => setFilter(t)}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                  filter === t ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {requests.map((req) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              key={req.id} className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row gap-6 items-center"
            >
              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${
                    req.service_type === 'premium' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-slate-50 text-slate-400 border-slate-100'
                  }`}>
                    {req.service_type}
                  </span>
                  <span className="text-[10px] text-slate-300 font-bold">{new Date(req.created_at).toLocaleString('id-ID')}</span>
                </div>
                <h3 className="font-black text-slate-800 text-lg truncate">{req.user_id}</h3>
                <div className="flex flex-wrap gap-4">
                  <button onClick={() => copyText(req.link_tiktok)} className="flex items-center gap-1.5 text-xs font-bold text-blue-500 hover:text-blue-700">
                    <Copy className="w-3 h-3" /> Salin Link TikTok
                  </button>
                  {req.phone_number && (
                    <a href={`https://wa.me/${req.phone_number}`} target="_blank" className="flex items-center gap-1.5 text-xs font-bold text-green-500 hover:text-green-700">
                      <Phone className="w-3 h-3" /> {req.phone_number}
                    </a>
                  )}
                </div>
              </div>

              <div className="text-center md:text-right space-y-1">
                <div className="text-xl font-black text-slate-900">{req.jumlah_view.toLocaleString()} <span className="text-xs text-slate-400 font-bold uppercase">Views</span></div>
                <div className="text-sm font-bold text-blue-600">Rp {req.harga.toLocaleString()}</div>
              </div>

              <div className="flex items-center gap-3">
                {req.proof_image && (
                   <button 
                    onClick={() => setViewingProof(req.proof_image)}
                    className="p-3 bg-blue-50 text-blue-600 rounded-2xl hover:bg-blue-100" title="Lihat Bukti"
                   >
                     <Eye className="w-5 h-5" />
                   </button>
                )}
                
                <div className={`px-4 py-2 rounded-2xl text-[10px] font-black uppercase border ${
                  req.status === 'PAID' ? 'bg-green-50 text-green-600 border-green-100' :
                  req.status === 'USER_CONFIRM' ? 'bg-blue-50 text-blue-600 border-blue-100 animate-pulse' :
                  req.status === 'REJECTED' ? 'bg-red-50 text-red-600 border-red-100' :
                  'bg-slate-50 text-slate-400 border-slate-200'
                }`}>
                  {req.status.replace('_', ' ')}
                </div>

                <div className="flex gap-2">
                  <button onClick={() => handleUpdateStatus(req.id, 'PAID')} className="p-2 bg-green-500 text-white rounded-xl hover:bg-green-600"><CheckCircle2 className="w-5 h-5" /></button>
                  <button onClick={() => handleUpdateStatus(req.id, 'REJECTED')} className="p-2 bg-slate-400 text-white rounded-xl hover:bg-slate-500"><XCircle className="w-5 h-5" /></button>
                  <button onClick={() => handleDelete(req.id)} className="p-2 bg-red-500 text-white rounded-xl hover:bg-red-600"><Trash2 className="w-5 h-5" /></button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {viewingProof && (
          <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-6" onClick={() => setViewingProof(null)}>
            <img src={viewingProof} alt="Bukti Transfer" className="max-w-full max-h-full rounded-2xl shadow-2xl" />
          </div>
        )}
      </main>
    </div>
  );
}