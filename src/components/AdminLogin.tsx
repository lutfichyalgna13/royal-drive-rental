"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Eye, EyeOff, AlertCircle, Key, RefreshCw, X } from "lucide-react";

interface AdminLoginProps {
  onLoginSuccess: () => void;
  onClose: () => void;
}

export default function AdminLogin({ onLoginSuccess, onClose }: AdminLoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [captchaInput, setCaptchaInput] = useState("");
  const [captchaCode, setCaptchaCode] = useState("");
  
  // Status states
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  const [shake, setShake] = useState(false);

  // Generate a random CAPTCHA code
  const generateCaptcha = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "";
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaCode(code);
  };

  useEffect(() => {
    Promise.resolve().then(() => {
      generateCaptcha();
    });
  }, []);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    // Validate captcha
    if (captchaInput.toUpperCase() !== captchaCode) {
      setErrorMsg("Kode verifikasi keamanan (CAPTCHA) tidak cocok.");
      setShake(true);
      setTimeout(() => setShake(false), 500);
      generateCaptcha();
      setCaptchaInput("");
      return;
    }

    setIsLoading(true);
    setLoadingStep(1);

    try {
      // 1. Call Secure Server Authentication API with Rate-Limiting & HttpOnly Cookie
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: email.trim(),
          password: password.trim(),
        }),
      });

      const data = await res.json();

      if (res.status === 429) {
        // Brute force lockout
        setIsLoading(false);
        setErrorMsg(data.message || "Terlalu banyak percobaan gagal. Akun dikunci sementara demi keamanan.");
        setShake(true);
        setTimeout(() => setShake(false), 500);
        return;
      }

      if (!res.ok || !data.success) {
        setIsLoading(false);
        setErrorMsg(data.message || "Email atau password administrator salah.");
        setShake(true);
        setTimeout(() => setShake(false), 500);
        setPassword("");
        generateCaptcha();
        setCaptchaInput("");
        return;
      }

      // Record active session for local reactive components
      try {
        if (typeof window !== "undefined") {
          localStorage.setItem(
            "royal_drive_admin_session",
            JSON.stringify({ email: data.admin?.email || email.trim(), loginTime: Date.now() })
          );
        }
      } catch (err) {
        console.error(err);
      }

      // Simulated secure handshake steps for premium executive feel
      setTimeout(() => {
        setLoadingStep(2);
        setTimeout(() => {
          setLoadingStep(3);
          setTimeout(() => {
            onLoginSuccess();
          }, 500);
        }, 600);
      }, 600);

    } catch (netErr: any) {
      setIsLoading(false);
      setErrorMsg("Gagal menghubungi server autentikasi. Silakan periksa koneksi internet Anda.");
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      {/* Background Radial Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(220,38,38,0.02),transparent_70%)] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={`w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-2xl p-6 md:p-8 relative ${
          shake ? "animate-shake" : ""
        }`}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 transition-colors focus:outline-none cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* LOGO & TITLE */}
        <div className="text-center mb-8 space-y-2">
          <div className="w-12 h-12 bg-accent/10 border border-accent/30 rounded-full flex items-center justify-center text-accent mx-auto relative">
            <ShieldCheck className="w-6 h-6" />
            <span className="absolute inset-0 rounded-full border border-accent/20 animate-ping" />
          </div>
          <div>
            <span className="font-display font-light text-lg tracking-[0.2em] text-slate-800 block">
              ROYAL<span className="text-accent font-normal">DRIVE</span>
            </span>
            <span className="text-[9px] uppercase tracking-widest text-slate-500 font-medium">
              Admin Gateway Verification
            </span>
          </div>
        </div>

        {/* LOGIN FORM */}
        {!isLoading ? (
          <form onSubmit={handleLoginSubmit} className="space-y-4 text-left font-sans text-xs">
            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Email Address */}
            <div className="space-y-1">
              <label className="text-[9px] uppercase tracking-widest text-slate-700 font-semibold block">
                Email Administrator
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@royaldrive.com"
                className="w-full glass-input px-3.5 py-3 rounded-xl focus:outline-none focus:border-accent text-slate-800 placeholder:text-slate-400 border border-slate-200"
                required
              />
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label className="text-[9px] uppercase tracking-widest text-slate-700 font-semibold block">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
                  className="w-full glass-input pl-3.5 pr-10 py-3 rounded-xl focus:outline-none focus:border-accent text-slate-800 placeholder:text-slate-400 border border-slate-200"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-700 focus:outline-none cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* CAPTCHA ANTI BOTS */}
            <div className="space-y-2">
              <label className="text-[9px] uppercase tracking-widest text-slate-700 font-semibold block">
                Kode Keamanan (Anti-Brute Force)
              </label>
              <div className="flex space-x-3 items-center">
                <div className="bg-slate-50 border border-slate-250/60 px-4 py-2.5 rounded-xl font-display font-black text-sm tracking-[0.4em] text-accent select-none italic flex items-center space-x-2">
                  <span className="line-through">{captchaCode}</span>
                </div>
                <button
                  type="button"
                  onClick={generateCaptcha}
                  className="p-2 border border-slate-200 hover:border-accent bg-slate-50 rounded-lg text-slate-500 hover:text-slate-850 transition-colors focus:outline-none cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                <input
                  type="text"
                  value={captchaInput}
                  onChange={(e) => setCaptchaInput(e.target.value)}
                  placeholder="MASUKKAN KODE..."
                  className="flex-1 glass-input px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-accent text-slate-800 placeholder:text-slate-400 border border-slate-200 uppercase"
                  required
                />
              </div>
            </div>

            {/* Info default */}
            <div className="text-[9px] text-slate-600 leading-normal bg-slate-50 p-2.5 rounded-lg border border-slate-200 font-sans">
              <strong>Info Akses Administrator:</strong> Email <code className="text-accent font-semibold">admin@royaldrive.com</code> | Password: <code className="text-accent font-semibold">RoyalAdmin#2026</code> (atau <code className="text-slate-500">admin</code>).
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full flex items-center justify-center space-x-2 bg-accent hover:bg-accent-hover text-white font-display font-bold text-xs uppercase tracking-widest py-4 rounded-xl transition-all shadow-lg shadow-accent/15 cursor-pointer focus:outline-none mt-2"
            >
              <Key className="w-4 h-4" />
              <span>Verifikasi & Masuk</span>
            </button>
          </form>
        ) : (
          /* LOADING SEQUENCE STAGES */
          <div className="py-12 flex flex-col items-center justify-center space-y-4">
            <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            <div className="text-center font-sans text-xs">
              {loadingStep === 1 && (
                <p className="text-slate-650 animate-pulse">Menghubungkan ke secure server...</p>
              )}
              {loadingStep === 2 && (
                <p className="text-slate-650 animate-pulse">Mengunduh konfigurasi konsol...</p>
              )}
              {loadingStep === 3 && (
                <p className="text-emerald-600 font-bold">Akses Diberikan. Membuka dashboard...</p>
              )}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
