"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, LogOut, CheckCircle2, XCircle, 
  RefreshCcw, Phone, Trash2, Clock, Home as HomeIcon,
  Mail, MessageSquare, AlertCircle, Search, User, Copy
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const [orders, setOrders] = useState<any[]>([]);
  const [supportLogs, setSupportLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ORDERS' | 'SUPPORT'>('ORDERS');
  const [filter, setFilter] = useState<'ALL' | 'FREE' | 'PREMIUM'>('ALL');
  const router = useRouter();

  const fetchData = async () => {
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
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000); 
    return () => clearInterval(interval);
  }, [filter, activeTab]);

  const updateSupportStatus = async (id: string, status: string) => {
    try {
      await fetch('/api/admin/support', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status })
      });
      fetchData();
    } catch (e) {}
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans">
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 px-6 py-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-xl text-white">
            <LayoutDashboard className="w-5 h-5" />
          </div>
          <h1 className="text-xl font-black text-slate-800 tracking-tight uppercase">NEXA CONTROL CENTER</h1>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button onClick={() => setActiveTab('ORDERS')} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'ORDERS' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400'}`}>Orders</button>
            <button onClick={() => setActiveTab('SUPPORT')} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'SUPPORT' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400'}`}>Support</button>
          </div>
          <button onClick={() => router.push('/')} className="text-slate-500 hover:text-blue-600 transition-colors"><HomeIcon className="w-5 h-5" /></button>
          <button onClick={() => { document.cookie = "admin_auth=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"; window.location.href = '/admin/login'; }} className="text-red-500"><LogOut className="w-5 h-5" /></button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-10">
        {activeTab === 'ORDERS' ? (
          <>
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Orders Monitor</h2>
              <div className="flex p-1 bg-white rounded-xl border border-slate-200">
                {(['ALL', 'FREE', 'PREMIUM'] as const).map((t) => (
                  <button key={t} onClick={() => setFilter(t)} className={`px-4 py-2 rounded-lg text-[10px] font-black transition-all ${filter === t ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400'}`}>{t}</button>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex items-center justify-between hover:border-blue-200 transition-all">
                   <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-blue-600 uppercase bg-blue-50 px-2 py-0.5 rounded-md">{order.service_type}</span>
                        <span className="text-xs font-bold text-slate-800">#{order.id.substring(0,8).toUpperCase()}</span>
                      </div>
                      <p className="text-sm font-bold text-slate-500 truncate max-w-xs italic">{order.tiktok_link}</p>
                      <div className="flex items-center gap-2 mt-2">
                         <User className="w-3 h-3 text-slate-300" />
                         <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">User ID:</span>
                         <span className="text-[10px] font-bold text-slate-600">{order.device_id}</span>
                         <button onClick={() => copyToClipboard(order.device_id)} className="text-blue-500"><Copy className="w-3 h-3" /></button>
                      </div>
                   </div>
                   <div className="text-center bg-slate-50 px-6 py-3 rounded-2xl border border-slate-100">
                      <p className="text-xl font-black text-slate-900 leading-none">{order.views.toLocaleString()}</p>
                      <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mt-1">Views</p>
                   </div>
                   <div className="flex flex-col items-end gap-2">
                      <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase border tracking-widest ${order.status === 'success' ? 'bg-green-50 text-green-600' : order.status === 'waiting_admin' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-slate-50 text-slate-400'}`}>{order.status.replace('_', ' ')}</div>
                      <p className="text-[9px] text-slate-300 font-bold">{new Date(order.created_at).toLocaleString()}</p>
                   </div>
                </div>
              ))}
              {orders.length === 0 && (
                 <div className="py-20 text-center text-slate-300 uppercase font-black tracking-widest text-xs">No orders found</div>
              )}
            </div>
          </>
        ) : (
          <div className="space-y-8">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Support Inbox</h2>
            <div className="grid grid-cols-1 gap-4">
              {supportLogs.map((log) => (
                <div key={log.id} className={`bg-white p-6 rounded-[32px] border ${log.direction === 'incoming' ? 'border-blue-100 bg-blue-50/20' : 'border-slate-100'} shadow-sm`}>
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl ${log.direction === 'incoming' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                        {log.direction === 'incoming' ? <Mail className="w-4 h-4" /> : <MessageSquare className="w-4 h-4" />}
                      </div>
                      <div>
                        <p className="text-xs font-black text-slate-900">{log.email_user}</p>
                        <p className="text-[10px] text-slate-400 font-bold">{new Date(log.created_at).toLocaleString()}</p>
                      </div>
                    </div>
                    <select 
                      value={log.status} 
                      onChange={(e) => updateSupportStatus(log.id, e.target.value)}
                      className="text-[9px] font-black uppercase bg-white border border-slate-200 rounded-lg px-2 py-1 outline-none shadow-sm cursor-pointer"
                    >
                      <option>Waiting User</option>
                      <option>Data Complete</option>
                      <option>Refund Process</option>
                      <option>Resolved</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                     <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest">Subject:</p>
                     <p className="text-xs font-black text-slate-800 uppercase tracking-tight">{log.subject}</p>
                  </div>
                  {log.order_id && (
                     <div className="mb-2 text-[9px] font-bold text-slate-400 uppercase italic">Linked Order: #{log.order_id.substring(0,8).toUpperCase()}</div>
                  )}
                  <div className="bg-white/50 p-4 rounded-2xl border border-slate-100 text-xs text-slate-600 leading-relaxed whitespace-pre-wrap font-medium">
                    {log.body}
                  </div>
                </div>
              ))}
              {supportLogs.length === 0 && (
                 <div className="py-20 text-center text-slate-300 uppercase font-black tracking-widest text-xs">Inbox is empty</div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}