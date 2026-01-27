"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, LogOut, CheckCircle2, XCircle, 
  RefreshCcw, ExternalLink, ImageIcon, Clock, Eye
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/requests');
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
  }, []);

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

  const handleLogout = async () => {
    // Clear cookie hack for demo (ideally via API)
    document.cookie = "admin_auth=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    router.push('/admin/login');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-40 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <LayoutDashboard className="text-primary-500" />
            <h1 className="text-xl font-bold text-slate-800">Nexa Admin Console</h1>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 text-slate-500 hover:text-red-500">
            <LogOut className="w-5 h-5" />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Ringkasan Pesanan</h2>
            <p className="text-slate-400 text-sm">Kelola semua permintaan suntik view dari satu tempat.</p>
          </div>
          <button onClick={fetchOrders} className="btn-primary flex items-center gap-2 px-4 py-2 text-sm">
            <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Muat Ulang
          </button>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50/50 border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-500 font-bold">
                <tr>
                  <th className="px-6 py-4">Order Info</th>
                  <th className="px-6 py-4">TikTok Link</th>
                  <th className="px-6 py-4">Layanan</th>
                  <th className="px-6 py-4">Pembayaran</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {requests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-slate-700">{req.user_id}</div>
                      <div className="text-[10px] text-slate-400">{new Date(req.created_at).toLocaleString('id-ID')}</div>
                    </td>
                    <td className="px-6 py-4">
                      <a href={req.link_tiktok} target="_blank" className="text-primary-500 hover:underline flex items-center gap-1 text-sm font-medium">
                        Buka Link <ExternalLink className="w-3 h-3" />
                      </a>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold">{req.jumlah_view.toLocaleString()} Views</div>
                      <div className={`text-[10px] font-bold uppercase ${req.service_type === 'premium' ? 'text-amber-500' : 'text-slate-400'}`}>
                        {req.service_type}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-slate-800">Rp {req.harga.toLocaleString()}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{req.payment_ref || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase border ${
                        req.status === 'PAID' ? 'bg-green-50 text-green-600 border-green-100' :
                        req.status === 'USER_CONFIRM' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                        req.status === 'REJECTED' ? 'bg-red-50 text-red-600 border-red-100' :
                        'bg-slate-50 text-slate-500 border-slate-200'
                      }`}>
                        {req.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-2">
                        {req.status === 'USER_CONFIRM' && (
                          <>
                            <button 
                              onClick={() => handleUpdateStatus(req.id, 'PAID')}
                              className="p-2 bg-green-500 text-white rounded-xl hover:bg-green-600 shadow-sm"
                              title="Setujui"
                            >
                              <CheckCircle2 className="w-5 h-5" />
                            </button>
                            <button 
                              onClick={() => handleUpdateStatus(req.id, 'REJECTED')}
                              className="p-2 bg-red-500 text-white rounded-xl hover:bg-red-600 shadow-sm"
                              title="Tolak"
                            >
                              <XCircle className="w-5 h-5" />
                            </button>
                          </>
                        )}
                        {req.status === 'PAID' && (
                           <div className="text-green-500 font-bold text-xs">SUCCESS</div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {requests.length === 0 && !loading && (
            <div className="py-20 text-center space-y-3">
               <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                 <Clock className="text-slate-400" />
               </div>
               <p className="text-slate-400 font-medium">Belum ada pesanan masuk.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}