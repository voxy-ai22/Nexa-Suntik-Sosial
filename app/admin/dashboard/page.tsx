"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  LayoutDashboard, LogOut, Home as HomeIcon,
  Mail, MessageSquare, User, Copy, ShieldCheck, CheckCircle, Loader2, RefreshCw, BellRing,
  Trash2, Check, X, Clock, ExternalLink
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const [orders, setOrders] = useState<any[]>([]);
  const [supportLogs, setSupportLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasNewData, setHasNewData] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'ORDERS' | 'SUPPORT'>('ORDERS');
  const [filter, setFilter] = useState<'ALL' | 'FREE' | 'PREMIUM'>('ALL');
  
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
    refreshInterval.current = setInterval(() => {
      fetchData(true);
    }, 5000);
    return () => {
      if (refreshInterval.current) clearInterval(refreshInterval.current);
    };
  }, [fetchData]);

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
      // Forced window redirect to clear any residual routing cache
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
      else alert("Gagal update status");
    } catch (e) {
      alert("Terjadi kesalahan sistem");
    }
  };

  const deleteOrder = async (id: string) => {
    if (!confirm("Hapus pesanan ini secara permanen dari database?")) return;
    try {
      const res = await fetch('/api/admin/requests', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (res.ok) fetchData(true);
      else alert("Gagal menghapus");
    } catch (e) {
      alert("Terjadi kesalahan sistem");
    }
  };

  const updateSupportStatus = async (id: string, status: string) => {
    try {
      const res = await fetch('/api/admin/support', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status })
      });
      if (res.ok) fetchData(true);
    } catch (e) {}
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans text-slate-900 selection:bg-blue-100">
      <nav className="bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 px-6 py-3 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl shadow-lg transition-all duration-500 ${hasNewData ? 'bg-green-500 shadow-green-200 scale-110' : 'bg-blue-600 shadow-blue-100'}`}>
            {hasNewData ? <BellRing className="w-5 h-5 text-white animate-bounce" /> : <ShieldCheck className="w-5 h-5 text-white" />}
          </div>
          <div>
            <h1 className="text-[11px] font-black tracking-tighter uppercase leading-none">NEXA COMMAND CENTER</h1>
            <div className="flex items-center gap-2 mt-1">
              <div className="relative flex h-2 w-2">
                <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${hasNewData ? 'animate-ping bg-green-400' : 'bg-blue-400'}`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${hasNewData ? 'bg-green-500' : 'bg-blue-500'}`}></span>
              </div>
              <span className={`text-[8px] font-black uppercase tracking-widest transition-colors duration-500 ${hasNewData ? 'text-green-600' : 'text-slate-400'}`}>
                {hasNewData ? 'Aktivitas Baru' : `Live Monitoring • ${lastUpdated}`}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200/50">
            <button onClick={() => setActiveTab('ORDERS')} className={`px-5 py-2 rounded-xl text-[9px] font-black uppercase transition-all duration-300 ${activeTab === 'ORDERS' ? 'bg-white text-blue-600 shadow-md ring-1 ring-slate-200' : 'text-slate-400 hover:text-slate-600'}`}>Orders</button>
            <button onClick={() => setActiveTab('SUPPORT')} className={`px-5 py-2 rounded-xl text-[9px] font-black uppercase transition-all duration-300 ${activeTab === 'SUPPORT' ? 'bg-white text-blue-600 shadow-md ring-1 ring-slate-200' : 'text-slate-400 hover:text-slate-600'}`}>Support</button>
          </div>
          
          <div className="h-8 w-px bg-slate-200 mx-2"></div>
          
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/')} className="p-2.5 bg-slate-50 hover:bg-blue-50 text-slate-400 hover:text-blue-600 rounded-xl transition-all border border-slate-200 group">
              <HomeIcon className="w-4 h-4" />
            </button>
            <button onClick={handleLogout} className="p-2.5 bg-red-50 hover:bg-red-100 text-red-500 rounded-xl transition-all border border-red-100">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-10">
        {activeTab === 'ORDERS' ? (
          <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h2 className="text-3xl font-black uppercase tracking-tight italic">Operations Queue</h2>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Global Order Management</p>
                  {isRefreshing && <RefreshCw className="w-3 h-3 text-blue-500 animate-spin" />}
                </div>
              </div>
              <div className="flex gap-2 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm">
                {(['ALL', 'FREE', 'PREMIUM'] as const).map((t) => (
                  <button key={t} onClick={() => setFilter(t)} className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase transition-all ${filter === t ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'text-slate-400 hover:bg-slate-50'}`}>{t}</button>
                ))}
              </div>
            </div>
            
            {loading ? (
               <div className="py-32 flex flex-col items-center justify-center gap-4">
                 <div className="relative flex items-center justify-center">
                   <div className="w-16 h-16 border-4 border-blue-100 rounded-full animate-pulse"></div>
                   <Loader2 className="absolute animate-spin text-blue-600 w-8 h-8" />
                 </div>
                 <p className="text-[10px] font-black text-slate-300 uppercase tracking-[4px]">Synchronizing...</p>
               </div>
            ) : (
              <div className="grid gap-4">
                {orders.map((order) => (
                  <div key={order.id} className="bg-white p-6 rounded-[24px] border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between hover:border-blue-400 hover:shadow-xl hover:shadow-blue-50/50 transition-all duration-300 group relative overflow-hidden">
                     {order.service_type === 'PREMIUM' && (
                       <div className="absolute top-0 left-0 w-1 h-full bg-amber-400"></div>
                     )}
                     <div className="space-y-3 flex-1">
                        <div className="flex items-center gap-3">
                          <span className={`text-[8px] font-black px-3 py-1 rounded-full uppercase border-2 ${order.service_type === 'PREMIUM' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>{order.service_type}</span>
                          <span className="text-[10px] font-black text-slate-300 tracking-wider">#{order.id.substring(0,8).toUpperCase()}</span>
                        </div>
                        <a href={order.tiktok_link} target="_blank" rel="noopener noreferrer" className="text-sm font-black text-slate-800 truncate block max-w-lg group-hover:text-blue-600 transition-colors flex items-center gap-2">
                          {order.tiktok_link} <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100" />
                        </a>
                        <div className="flex flex-wrap items-center gap-4">
                           <div className="flex items-center gap-1.5 text-[9px] text-slate-400 font-bold uppercase bg-slate-50 px-2 py-1 rounded-lg">
                              <User className="w-3 h-3" /> {order.device_id.substring(0,12)}... 
                              <button onClick={() => copyToClipboard(order.device_id)} className="text-blue-400 hover:text-blue-600 transition-all ml-1"><Copy className="w-3 h-3" /></button>
                           </div>
                           <div className="text-[9px] text-slate-300 font-bold uppercase tracking-tight">{new Date(order.created_at).toLocaleString('id-ID')}</div>
                           {order.payment_proof_url && (
                             <a href={order.payment_proof_url} target="_blank" className="text-[9px] font-black text-amber-600 underline uppercase italic">Cek Bukti Transfer</a>
                           )}
                        </div>
                     </div>
                     <div className="flex items-center gap-8 mt-6 md:mt-0">
                        <div className="text-right min-w-[100px]">
                           <p className="text-2xl font-black text-slate-900 leading-none italic">{order.views.toLocaleString()}</p>
                           <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1.5">Views Target</p>
                        </div>
                        <div className="h-12 w-px bg-slate-100 hidden md:block"></div>
                        <div className="flex flex-col items-end gap-2 min-w-[160px]">
                           <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase border-2 shadow-sm ${
                             order.status === 'success' ? 'bg-green-50 text-green-600 border-green-200' : 
                             order.status === 'pending_payment' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                             order.status === 'waiting_admin' ? 'bg-blue-600 text-white border-blue-500 animate-pulse' :
                             order.status === 'failed' ? 'bg-red-50 text-red-600 border-red-200' :
                             'bg-slate-50 text-slate-400 border-slate-200'
                           }`}>
                             {order.status.replace('_', ' ')}
                           </div>
                           
                           {/* Quick Action Buttons */}
                           <div className="flex items-center gap-1.5 mt-2">
                             <button onClick={() => updateOrderStatus(order.id, 'success')} title="Sukses" className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-all border border-green-200">
                               <Check className="w-3.5 h-3.5" />
                             </button>
                             <button onClick={() => updateOrderStatus(order.id, 'waiting_admin')} title="Pending" className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-all border border-blue-200">
                               <Clock className="w-3.5 h-3.5" />
                             </button>
                             <button onClick={() => updateOrderStatus(order.id, 'failed')} title="Gagal" className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-all border border-red-200">
                               <X className="w-3.5 h-3.5" />
                             </button>
                             <div className="w-px h-4 bg-slate-200 mx-1"></div>
                             <button onClick={() => deleteOrder(order.id)} title="Hapus Permanen" className="p-2 bg-slate-900 text-white rounded-lg hover:bg-red-600 transition-all">
                               <Trash2 className="w-3.5 h-3.5" />
                             </button>
                           </div>
                        </div>
                     </div>
                  </div>
                ))}
                {orders.length === 0 && (
                  <div className="py-32 bg-white rounded-[32px] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-4">
                    <div className="p-4 bg-slate-50 rounded-full"><LayoutDashboard className="w-8 h-8 text-slate-200" /></div>
                    <p className="text-slate-300 font-black text-xs uppercase tracking-[5px] italic">No active requests</p>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h2 className="text-3xl font-black uppercase tracking-tight italic">Support Tickets</h2>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Customer Support Logs</p>
                  {isRefreshing && <RefreshCw className="w-3 h-3 text-blue-500 animate-spin" />}
                </div>
              </div>
            </div>
            
            <div className="grid gap-6">
              {supportLogs.map((log) => (
                <div key={log.id} className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm space-y-6 hover:border-blue-300 hover:shadow-2xl hover:shadow-blue-50/30 transition-all duration-500 relative">
                  <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                    <div className="flex items-center gap-5">
                      <div className={`p-4 rounded-2xl shadow-xl ${log.direction === 'incoming' ? 'bg-blue-600 text-white shadow-blue-200' : 'bg-slate-100 text-slate-400'}`}>
                        {log.direction === 'incoming' ? <Mail className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900 tracking-tight">{log.email_user}</p>
                        <div className="flex items-center gap-3 mt-1.5">
                           <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest">{new Date(log.created_at).toLocaleString('id-ID')}</span>
                           {log.order_id && <span className="text-[9px] font-black text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg uppercase border border-blue-100">Order: #{log.order_id.toUpperCase()}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-3 w-full md:w-auto">
                       <select 
                         value={log.status} 
                         onChange={(e) => updateSupportStatus(log.id, e.target.value)}
                         className={`text-[10px] font-black uppercase border-2 rounded-xl px-4 py-2 outline-none cursor-pointer transition-all w-full md:w-48 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22currentColor%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_12px_center] bg-[length:14px] ${
                            log.status === 'Resolved' ? 'bg-green-50 text-green-600 border-green-200' : 'bg-white text-slate-600 border-slate-200 hover:border-blue-400'
                         }`}
                       >
                         <option>Waiting Admin</option>
                         <option>Data Complete</option>
                         <option>Refund Process</option>
                         <option>Resolved</option>
                       </select>
                       {log.status === 'Resolved' && <span className="flex items-center gap-2 text-[10px] font-black text-green-500 uppercase italic"><CheckCircle className="w-4 h-4" /> Case Closed</span>}
                    </div>
                  </div>
                  <div className="bg-slate-50/50 p-6 rounded-2xl text-[14px] font-medium text-slate-700 whitespace-pre-wrap border border-slate-100 leading-relaxed italic relative">
                    <span className="absolute -top-3 left-6 bg-white px-2 text-[10px] font-black text-slate-300 uppercase italic">Isi Laporan</span>
                    "{log.body}"
                  </div>
                </div>
              ))}
              {supportLogs.length === 0 && (
                <div className="py-32 text-center text-slate-300 font-black text-[10px] uppercase tracking-[8px] italic">Empty Inbox</div>
              )}
            </div>
          </div>
        )}
      </main>

      <footer className="text-center py-16 opacity-30 font-black text-[8px] uppercase tracking-[10px] italic">
        Internal Control Platform // Protocol v.4.0.0-PRO
      </footer>
    </div>
  );
}