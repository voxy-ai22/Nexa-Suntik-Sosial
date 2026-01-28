"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { 
  LayoutDashboard, LogOut, Home as HomeIcon,
  Mail, MessageSquare, User, Copy, ShieldCheck, CheckCircle, Loader2
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const [orders, setOrders] = useState<any[]>([]);
  const [supportLogs, setSupportLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ORDERS' | 'SUPPORT'>('ORDERS');
  const [filter, setFilter] = useState<'ALL' | 'FREE' | 'PREMIUM'>('ALL');
  const router = useRouter();

  const fetchData = useCallback(async () => {
    try {
      if (activeTab === 'ORDERS') {
        const res = await fetch(`/api/admin/requests?type=${filter}`);
        if (res.ok) setOrders(await res.json());
      } else {
        const res = await fetch(`/api/admin/support`);
        if (res.ok) setSupportLogs(await res.json());
      }
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [activeTab, filter]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000); 
    return () => clearInterval(interval);
  }, [fetchData]);

  const updateSupportStatus = async (id: string, status: string) => {
    try {
      const res = await fetch('/api/admin/support', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status })
      });
      if (res.ok) fetchData();
    } catch (e) {}
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('ID disalin ke clipboard');
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans text-slate-900">
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 px-6 py-3 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-1.5 rounded-lg">
            <ShieldCheck className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-[10px] font-black tracking-tight uppercase leading-none">NEXA ADMIN</h1>
            <div className="flex items-center gap-1 mt-0.5">
              <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-[7px] font-bold text-slate-400 uppercase">Sesi Aktif</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button onClick={() => setActiveTab('ORDERS')} className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${activeTab === 'ORDERS' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}>Orders</button>
            <button onClick={() => setActiveTab('SUPPORT')} className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${activeTab === 'SUPPORT' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}>Support</button>
          </div>
          <div className="h-6 w-px bg-slate-200"></div>
          <button onClick={() => router.push('/')} className="text-slate-400 hover:text-blue-600 flex items-center gap-1.5 group">
            <HomeIcon className="w-4 h-4" />
            <span className="text-[8px] font-black uppercase hidden md:inline">Web Utama</span>
          </button>
          <button onClick={() => { document.cookie = "admin_auth=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"; window.location.href = '/admin/login'; }} className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-all">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {activeTab === 'ORDERS' ? (
          <div className="space-y-6">
            <div className="flex justify-between items-end">
              <div>
                <h2 className="text-2xl font-black uppercase tracking-tight">Daftar Pesanan</h2>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Kelola View Free & Premium</p>
              </div>
              <div className="flex gap-2 bg-white p-1 rounded-xl border border-slate-200">
                {(['ALL', 'FREE', 'PREMIUM'] as const).map((t) => (
                  <button key={t} onClick={() => setFilter(t)} className={`px-3 py-1.5 rounded-lg text-[8px] font-black uppercase transition-all ${filter === t ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-50'}`}>{t}</button>
                ))}
              </div>
            </div>
            
            {loading ? (
               <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-blue-600 w-8 h-8" /></div>
            ) : (
              <div className="grid gap-3">
                {orders.map((order) => (
                  <div key={order.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between hover:border-blue-200 transition-all group">
                     <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className={`text-[7px] font-black px-2 py-0.5 rounded-full uppercase border ${order.service_type === 'PREMIUM' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>{order.service_type}</span>
                          <span className="text-[9px] font-bold text-slate-300">ID: #{order.id.substring(0,8)}</span>
                        </div>
                        <p className="text-xs font-black text-slate-800 truncate max-w-sm group-hover:text-blue-600 transition-all">{order.tiktok_link}</p>
                        <div className="flex items-center gap-3">
                           <div className="flex items-center gap-1 text-[8px] text-slate-400 font-bold uppercase">
                              <User className="w-2.5 h-2.5" /> {order.device_id.substring(0,10)}... 
                              <button onClick={() => copyToClipboard(order.device_id)} className="text-blue-400 hover:text-blue-600 transition-all"><Copy className="w-2.5 h-2.5" /></button>
                           </div>
                           <div className="text-[8px] text-slate-300 font-bold uppercase">{new Date(order.created_at).toLocaleString()}</div>
                        </div>
                     </div>
                     <div className="flex items-center gap-6">
                        <div className="text-right">
                           <p className="text-xl font-black text-slate-900 leading-none">{order.views.toLocaleString()}</p>
                           <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mt-1">Target Views</p>
                        </div>
                        <div className="h-10 w-px bg-slate-100"></div>
                        <div className="flex flex-col items-end gap-1.5 min-w-[100px]">
                           <div className={`px-2.5 py-1 rounded-full text-[8px] font-black uppercase border ${
                             order.status === 'success' ? 'bg-green-50 text-green-600 border-green-200' : 
                             order.status === 'pending_payment' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                             'bg-blue-50 text-blue-600 border-blue-200'
                           }`}>
                             {order.status.replace('_', ' ')}
                           </div>
                           {order.status === 'waiting_admin' && (
                             <button className="text-[8px] font-black text-blue-600 underline uppercase tracking-tighter">Cek Bukti Transfer</button>
                           )}
                        </div>
                     </div>
                  </div>
                ))}
                {orders.length === 0 && <div className="py-20 text-center text-slate-300 font-black text-[10px] uppercase">Belum ada pesanan masuk.</div>}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-black uppercase tracking-tight">Laporan Support</h2>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Dukungan Pelanggan & Masalah Teknis</p>
            </div>
            
            <div className="grid gap-4">
              {supportLogs.map((log) => (
                <div key={log.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 hover:border-blue-200 transition-all">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-4">
                      <div className={`p-2.5 rounded-xl ${log.direction === 'incoming' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-slate-100 text-slate-400'}`}>
                        {log.direction === 'incoming' ? <Mail className="w-5 h-5" /> : <MessageSquare className="w-5 h-5" />}
                      </div>
                      <div>
                        <p className="text-xs font-black text-slate-900">{log.email_user}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                           <span className="text-[8px] text-slate-400 font-bold uppercase">{new Date(log.created_at).toLocaleString()}</span>
                           {log.order_id && <span className="text-[8px] font-black text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded uppercase">Order: #{log.order_id}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                       <select 
                         value={log.status} 
                         onChange={(e) => updateSupportStatus(log.id, e.target.value)}
                         className={`text-[9px] font-black uppercase border rounded-lg px-3 py-1.5 outline-none cursor-pointer transition-all ${
                            log.status === 'Resolved' ? 'bg-green-50 text-green-600 border-green-200' : 'bg-white text-slate-600 border-slate-200'
                         }`}
                       >
                         <option>Waiting Admin</option>
                         <option>Data Complete</option>
                         <option>Refund Process</option>
                         <option>Resolved</option>
                       </select>
                       {log.status === 'Resolved' && <span className="flex items-center gap-1 text-[8px] font-black text-green-500 uppercase"><CheckCircle className="w-3 h-3" /> Selesai</span>}
                    </div>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl text-[12px] font-medium text-slate-700 whitespace-pre-wrap border border-slate-100 leading-relaxed italic">
                    "{log.body}"
                  </div>
                </div>
              ))}
              {supportLogs.length === 0 && <div className="py-20 text-center text-slate-300 font-black text-[10px] uppercase">Belum ada laporan bantuan.</div>}
            </div>
          </div>
        )}
      </main>

      <footer className="text-center py-10 opacity-20 font-black text-[7px] uppercase tracking-[5px]">
        Internal Control Panel Nexa Sosial Engine v1.0.2
      </footer>
    </div>
  );
}
