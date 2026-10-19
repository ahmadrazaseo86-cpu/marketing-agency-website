'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Sparkles, ShieldCheck } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

export default function LoginPage() {
  const router = useRouter();
  const toast = useToast();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'The username or password you entered is incorrect.');
        setLoading(false);
        return;
      }

      toast.success('Login successful! Welcome to NexaRank.');
      router.push('/wp-admin');
      router.refresh();
    } catch (err: any) {
      setError('An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
      {/* NexaRank Brand Header */}
      <div className="mb-6 flex flex-col items-center">
        <a href="/" className="inline-block transition-transform hover:scale-105">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#2563eb] to-[#38bdf8] flex items-center justify-center text-white shadow-xl shadow-blue-500/20 font-black text-2xl tracking-tight">
            N
          </div>
        </a>
        <h1 className="text-xl font-bold text-white mt-3 tracking-wide">
          NexaRank <span className="text-[#38bdf8] font-normal">CMS</span>
        </h1>
        <p className="text-xs text-[#94a3b8] mt-0.5">Control Panel &amp; Element Editor</p>
      </div>

      <div className="w-full max-w-[340px]">
        {/* Error Notice */}
        {error && (
          <div className="mb-4 bg-red-950/80 border-l-4 border-[#ef4444] p-3 text-xs text-red-200 shadow-sm rounded-r">
            <strong>ERROR</strong>: {error}
          </div>
        )}

        {/* Demo Credentials Info Box */}
        <div className="mb-4 bg-[#1e293b] border-l-4 border-[#2563eb] p-3 text-xs text-[#94a3b8] shadow-sm rounded-r">
          <div className="flex items-center gap-1.5 text-white font-semibold mb-1">
            <ShieldCheck className="w-4 h-4 text-[#38bdf8]" /> Default Login Credentials:
          </div>
          <div className="mt-1 flex justify-between text-gray-300 font-mono text-[11px]">
            <span>User: <strong className="text-white">admin</strong></span>
            <span>Pass: <strong className="text-white">admin123</strong></span>
          </div>
        </div>

        {/* Login Box */}
        <div className="bg-[#1e293b] p-6 shadow-2xl border border-[#334155] rounded-xl text-gray-200">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">
                Username or Email Address
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full text-sm px-3 py-2 bg-[#0f172a] border border-[#334155] rounded-lg text-white focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb] focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full text-sm px-3 py-2 pr-9 bg-[#0f172a] border border-[#334155] rounded-lg text-white focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb] focus:outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-gray-400">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-[#2563eb] border-gray-600 rounded bg-[#0f172a] focus:ring-[#2563eb]"
                />
                Remember Me
              </label>

              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-lg text-xs font-semibold shadow-md shadow-blue-600/30 transition-all disabled:opacity-50"
              >
                {loading ? 'Logging in...' : 'Log In'}
              </button>
            </div>
          </form>
        </div>

        {/* Footer Links */}
        <div className="mt-6 flex flex-col items-center gap-2 text-xs text-[#64748b]">
          <a href="/" className="hover:text-[#38bdf8] transition-colors">
            ← Go to NexaRank Website
          </a>
        </div>
      </div>
    </div>
  );
}
