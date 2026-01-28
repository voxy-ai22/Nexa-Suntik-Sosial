"use client";

import React, { useState, useEffect } from 'react';

export default function RefundSupport() {
  const [idUser, setIdUser] = useState('');
  const [views, setViews] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const adminWA = "6285141785366";

  useEffect(() => {
    // Load saved data
    const savedId = localStorage.getItem('nexa_saved_id');
    const savedViews = localStorage.getItem('nexa_saved_views');
    const cdExpiry = localStorage.getItem('nexa_cd_expiry');

    if (savedId) setIdUser(savedId);
    if (savedViews) setViews(savedViews);
    
    if (cdExpiry) {
      const remaining = Math.ceil((parseInt(cdExpiry) - Date.now()) / 1000);
      if (remaining > 0) setCooldown(remaining);
    }
  }, []);

  useEffect(() => {
    // Fix: Use 'any' type for timer to avoid NodeJS namespace error in browser environment
    let timer: any;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown(c => {
          if (c <= 1) {
            localStorage.removeItem('nexa_cd_expiry');
            return 0;
          }
          return c - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  const saveInputs = (id: string, v: string) => {
    localStorage.setItem('nexa_saved_id', id);
    localStorage.setItem('nexa_saved_views', v);
  };

  const handleKirim = () => {
    if (!idUser || !views) {
      alert("Harap lengkapi semua data!");
      return;
    }

    const pesan = `Halo Admin Nexa Sosial,\n\nSaya ingin konfirmasi refund.\n\n*Detail:*\n• ID User: ${idUser}\n• Jumlah View: ${views}\n\n(Bukti foto transaksi saya lampirkan setelah pesan ini)`;
    const url = `https://api.whatsapp.com/send?phone=${adminWA}&text=${encodeURIComponent(pesan)}`;
    
    window.open(url, '_blank');

    // Set cooldown
    const expiryDate = Date.now() + (60 * 1000);
    localStorage.setItem('nexa_cd_expiry', expiryDate.toString());
    setCooldown(60);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex justify-center items-center p-5 font-sans">
      <div className="bg-white w-full max-w-[380px] p-10 rounded-[28px] shadow-[0_15px_35px_rgba(0,0,0,0.05)] border border-[#e2e8f0] animate-fadeIn">
        <style jsx>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(15px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fadeIn { animation: fadeIn 0.6s ease-out; }
        `}</style>
        
        <div className="text-center mb-8">
          <span className="text-[11px] font-bold text-[#64748b] uppercase tracking-[1.5px]">Official Support</span>
          <h1 className="font-extrabold text-[26px] text-[#2563eb] m-0 tracking-[-0.5px]">Nexa Sosial</h1>
        </div>

        <div className="bg-[#eff6ff] p-4 rounded-[16px] mb-6 border-l-4 border-[#2563eb]">
          <p className="m-0 text-[13px] text-[#1e40af] leading-[1.6] font-medium">
            Hallo, silakan lengkapi ID dan jumlah view TikTok untuk pengajuan refund otomatis ke WhatsApp Admin.
          </p>
        </div>

        <div className="mb-5">
          <label className="block text-[13px] font-bold mb-2 text-[#0f172a] pl-1">ID User</label>
          <input 
            type="text" 
            placeholder="Contoh: NEXA-102"
            className="w-full p-[14px_18px] text-[15px] bg-[#f1f5f9] border-2 border-transparent rounded-[14px] focus:outline-none focus:bg-white focus:border-[#2563eb] transition-all"
            value={idUser}
            onChange={(e) => { setIdUser(e.target.value); saveInputs(e.target.value, views); }}
          />
        </div>

        <div className="mb-5">
          <label className="block text-[13px] font-bold mb-2 text-[#0f172a] pl-1">Jumlah View TikTok</label>
          <input 
            type="number" 
            placeholder="Jumlah order"
            className="w-full p-[14px_18px] text-[15px] bg-[#f1f5f9] border-2 border-transparent rounded-[14px] focus:outline-none focus:bg-white focus:border-[#2563eb] transition-all"
            value={views}
            onChange={(e) => { setViews(e.target.value); saveInputs(idUser, e.target.value); }}
          />
        </div>

        <button 
          disabled={cooldown > 0}
          onClick={handleKirim}
          className={`w-full py-4 rounded-[14px] text-[15px] font-bold transition-all shadow-[0_4px_12px_rgba(37,99,235,0.2)] ${cooldown > 0 ? 'bg-[#cbd5e1] text-[#94a3b8] cursor-not-allowed shadow-none' : 'bg-[#2563eb] text-white hover:bg-[#1d4ed8] hover:-translate-y-0.5'}`}
        >
          Lanjut ke WhatsApp
        </button>

        {cooldown > 0 && (
          <div className="text-center text-[12px] text-[#ef4444] mt-3 font-semibold">
            Tunggu <span id="seconds">{cooldown}</span> detik sebelum mengirim lagi
          </div>
        )}

        <div className="text-center mt-6 text-[11px] text-[#64748b] leading-[1.5]">
          <br />
          Lampirkan bukti foto setelah chat WA terbuka.
        </div>
      </div>
    </div>
  );
}