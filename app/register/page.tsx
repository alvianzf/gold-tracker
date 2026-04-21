'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import axios from 'axios';
import { Loader2, Lock, User, UserPlus } from 'lucide-react';
import Link from 'next/link';

function RegisterForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await axios.post('/api/auth/register', { username, password });
      window.location.href = callbackUrl;
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { error?: string } } };
      setError(apiError.response?.data?.error || 'Failed to register account');
      setIsLoading(false);
    }
  };

  return (
    <div className="glass p-1.5 shadow-gold/5 max-w-md w-full animate-in zoom-in-95 duration-700">
      <div className="glass bg-slate-900/60 p-12 border-white/5">
        <div className="text-center mb-12">
          <div className="inline-block bg-gold/10 p-4 rounded-2xl border border-gold/20 mb-6">
            <UserPlus className="w-8 h-8 text-gold" />
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tighter">
            VAULT <span className="text-gold">ACCESS</span>
          </h1>
          <p className="text-slate-500 mt-3 font-bold uppercase tracking-[0.2em] text-[10px]">Initialize New Account</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-8">
          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 px-6 py-4 rounded-xl text-xs font-bold text-center animate-in shake-in-1 duration-500">
              {error}
            </div>
          )}

          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] pl-1">Unique Identifier</label>
            <div className="relative group">
              <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-gold transition-colors" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4.5 pl-14 pr-6 text-white font-bold focus:outline-none focus:border-gold/40 focus:bg-white/10 transition-all placeholder:text-slate-700"
                placeholder="Choose Username"
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] pl-1">Access Key</label>
            <div className="relative group">
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-gold transition-colors" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4.5 pl-14 pr-6 text-white font-bold focus:outline-none focus:border-gold/40 focus:bg-white/10 transition-all placeholder:text-slate-700"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gold hover:bg-gold-strong text-black font-black py-5 rounded-2xl shadow-gold transition-all hover:scale-105 active:scale-95 flex items-center justify-center mt-6 text-xs uppercase tracking-widest"
          >
            {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Register Credentials'}
          </button>
          
          <div className="text-center mt-10 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
            Already registered?{' '}
            <Link href={`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`} className="text-gold hover:underline underline-offset-4">
              Sign In
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-transparent animate-in fade-in duration-1000">
      <Suspense fallback={
        <div className="glass p-1.5 max-w-md w-full">
          <div className="glass bg-slate-900/60 p-12 flex items-center justify-center border-white/5 min-h-[400px]">
            <Loader2 className="w-12 h-12 animate-spin text-gold" />
          </div>
        </div>
      }>
        <RegisterForm />
      </Suspense>
    </div>
  );
}
