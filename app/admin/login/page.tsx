"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
  const [key, setKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key })
      });

      if (res.ok) {
        router.push('/admin/dashboard');
        router.refresh();
      } else {
        setError('Kunci Admin tidak valid!');
      }
    } catch (err) {
      setError('Terjadi kesalahan koneksi.');
    } finally {
      setLoading(false);
    }
  };

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
        <h2 className="text-2xl font-bold text-center text-primary-900 mb-2">Admin Access</h2>
        <p className="text-center text-primary-400 text-sm mb-8">Nexa Suntik Sosial Control Panel</p>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="password"
            className="input-field"
            placeholder="Masukkan Admin Key"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            required
          />
          {error && <p className="text-red-500 text-sm text-center font-medium">{error}</p>}
          <button type="submit" className="w-full btn-primary py-3" disabled={loading}>
            {loading ? <Loader2 className="animate-spin mx-auto" /> : 'Buka Dashboard'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}