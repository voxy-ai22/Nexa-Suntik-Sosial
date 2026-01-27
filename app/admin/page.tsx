
"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  ExternalLink, 
  Copy, 
  LogOut, 
  CheckCircle, 
  Clock, 
  ShieldAlert,
  Loader2,
  RefreshCcw,
  Search,
  CheckCircle2
} from 'lucide-react';

export default function AdminPage() {
  const [adminKey, setAdminKey] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchRequests = async (key: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/requests', {
        headers: { 'Authorization': key }
      });
      if (res.ok) {
        const data = await res.json();
        setRequests(data);
        setIsLoggedIn(true);
      } else {
        setError('Key Admin Salah!');
      }
    } catch (err) {
      setError('Gagal menghubungkan ke server');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    fetchRequests(adminKey);
  };

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      const res = await fetch('/api/admin/requests', {
        method: 'PATCH',
        headers: { 
          'Authorization': adminKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id, status: newStatus })
      });
      if (res.ok) {
        setRequests(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
      }
    } catch (err) {
      alert('Gagal update status');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Tautan disalin!');
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-primary-50 flex items-center justify-center px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-3xl shadow-2xl max-w-md w-full border border-primary-100"
        >
          <div className="flex justify-center mb-6">
            <div className="bg-primary-500 p-4 rounded-full">
              <ShieldAlert className="text-white w-8 h-8" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-center text-primary-900 mb-2">Admin Panel</h2>
          <p className="text-center text-primary-400 text-sm mb-8">Masukkan kunci akses admin Anda</p>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              className="input-field"
              placeholder="Admin Key"
              value={adminKey}
              onChange={(e) => setAdminKey(e.target.value)}
            />
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            <button type="submit" className="w-full btn-primary py-3" disabled={loading}>
              {loading ? <Loader2 className="animate-spin mx-auto" /> : 'Login Dashboard'}
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-40 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <LayoutDashboard className="text-primary-500" />
            <h1 className="text-xl font-bold text-slate-800">Admin Nexa</h1>
          </div>
          <button 
            onClick={() => { setIsLoggedIn(false); setAdminKey(''); }}
            className="flex items-center gap-2 text-slate-500 hover:text-red-500 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-slate-800">Daftar Permintaan</h2>
          <button 
            onClick={() => fetchRequests(adminKey)}
            className="flex items-center gap-2 bg-white text-slate-600 px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 transition-all text-sm font-medium"
          >
            <RefreshCcw className="w-4 h-4" />
            Refresh Data
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">User ID</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">TikTok Link</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Views</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Layanan</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Harga</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {requests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-sm font-mono text-slate-600">{req.user_id}</div>
                      <div className="text-[10px] text-slate-400">{new Date(req.created_at).toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 group">
                        <span className="text-sm text-slate-600 truncate max-w-[150px]">{req.link_tiktok}</span>
                        <button onClick={() => copyToClipboard(req.link_tiktok)} className="text-slate-300 hover:text-primary-500">
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-slate-700">{req.jumlah_view.toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4">
                      {req.service_type === 'premium' ? (
                        <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full border border-amber-200 uppercase">Premium</span>
                      ) : (
                        <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-full border border-slate-200 uppercase">Free</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-slate-700">Rp {req.harga.toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`flex items-center gap-1 text-xs font-bold uppercase ${
                        req.status === 'paid' ? 'text-green-600' :
                        req.status === 'pending' ? 'text-blue-600' :
                        req.status === 'waiting_payment' ? 'text-amber-500' : 'text-slate-400'
                      }`}>
                        {req.status === 'paid' ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                        {req.status.replace('_', ' ')}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {req.status !== 'paid' && (
                           <button 
                            onClick={() => handleStatusChange(req.id, 'paid')}
                            className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-all"
                            title="Tandai Sudah Bayar"
                          >
                            <CheckCircle2 className="w-5 h-5" />
                          </button>
                        )}
                        <button 
                          onClick={() => handleStatusChange(req.id, 'processing')}
                          className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-all"
                          title="Proses"
                        >
                          <RefreshCcw className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {requests.length === 0 && (
            <div className="text-center py-20 text-slate-400">
              Belum ada data permintaan.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
