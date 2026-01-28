"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { 
  LayoutDashboard, LogOut, Home as HomeIcon,
  Mail, MessageSquare, User, Copy
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
    // Interval dikurangi frekuensinya ke 10 detik untuk hemat RAM/CPU
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
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans text-slate-900">
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 px-6 py-3 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <LayoutDashboard className="w-5 h-5 text-blue-600" />
          <h1 className="text-sm font-black tracking-tight uppercase">NEXA ADMIN</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex bg-slate-100 p-1 rounded-lg">
            <button onClick={() => setActiveTab('ORDERS')} className={`px-3 py-1 rounded-md text-[10px] font-bold ${activeTab === 'ORDERS' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}>Orders</button>
            <button onClick={() => setActiveTab('SUPPORT')} className={`px-3 py-1 rounded-md text-[10px] font-bold ${activeTab === 'SUPPORT' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}>Support</button>
          </div>
          <button onClick={() => router.push('/')} className="text-slate-400 hover:text-blue-600"><HomeIcon className="w-4 h-4" /></button>
          <button onClick={() => { document.cookie = "admin_auth=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"; window.location.href = '/admin/login'; }} className="text-red-500"><LogOut className="w-4 h-4" /></button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {activeTab === 'ORDERS' ? (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-black uppercase">Orders</h2>
              <div className="flex gap-2">
                {(['ALL', 'FREE', 'PREMIUM'] as const).map((t) => (
                  <button key={t} onClick={() => setFilter(t)} className={`px-3 py-1 rounded-md text-[9px] font-black ${filter === t ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-400'}`}>{t}</button>
                ))}
              </div>
            </div>
            
            <div className="grid gap-3">
              {orders.map((order) => (
                <div key={order.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                   <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[8px] font-black text-blue-600 uppercase bg-blue-50 px-1.5 py-0.5 rounded">{order.service_type}</span>
                        <span className="text-[10px] font-bold text-slate-400">#{order.id.substring(0,6)}</span>
                      </div>
                      <p className="text-xs font-bold text-slate-800 truncate max-w-xs">{order.tiktok_link}</p>
                      <div className="flex items-center gap-1 text-[9px] text-slate-300 font-black uppercase">
                         <User className="w-3 h-3" /> {order.device_id} <button onClick={() => copyToClipboard(order.device_id)} className="text-blue-400"><Copy className="w-2 h-2" /></button>
                      </div>
                   </div>
                   <div className="text-right">
                      <p className="text-lg font-black">{order.views.toLocaleString()}</p>
                      <div className={`text-[8px] font-black uppercase ${order.status === 'success' ? 'text-green-500' : 'text-amber-500'}`}>{order.status}</div>
                   </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <h2 className="text-xl font-black uppercase">Support</h2>
            <div className="grid gap-4">
              {supportLogs.map((log) => (
                <div key={log.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${log.direction === 'incoming' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                        {log.direction === 'incoming' ? <Mail className="w-4 h-4" /> : <MessageSquare className="w-4 h-4" />}
                      </div>
                      <div>
                        <p className="text-[10px] font-black">{log.email_user}</p>
                        <p className="text-[8px] text-slate-300 font-bold">{new Date(log.created_at).toLocaleString()}</p>
                      </div>
                    </div>
                    <select 
                      value={log.status} 
                      onChange={(e) => updateSupportStatus(log.id, e.target.value)}
                      className="text-[9px] font-black uppercase border border-slate-200 rounded px-2 py-1"
                    >
                      <option>Waiting User</option>
                      <option>Data Complete</option>
                      <option>Refund Process</option>
                      <option>Resolved</option>
                    </select>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl text-[11px] font-medium text-slate-600 whitespace-pre-wrap">
                    {log.body}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}