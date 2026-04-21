'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Shield, Lock, User, Loader2, KeyRound, UserCircle, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import Swal from 'sweetalert2';
import { useRouter } from 'next/navigation';
import { useI18n } from '@/context/LanguageContext';

export default function ProfilePage() {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const router = useRouter();

  const [formData, setFormData] = useState({
    username: '',
    oldPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });

  const { data: user, isLoading: isUserLoading } = useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const { data } = await axios.get('/api/auth/me');
      return data;
    },
    retry: false,
  });

  useEffect(() => {
    if (user?.username) {
      setFormData(prev => ({ ...prev, username: user.username }));
    }
  }, [user]);

  const updateMutation = useMutation({
    mutationFn: async (payload: { username: string; oldPassword?: string; newPassword?: string }) => {
      const { data } = await axios.put('/api/auth/me', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me'] });
      setFormData(prev => ({ ...prev, oldPassword: '', newPassword: '', confirmNewPassword: '' }));
      Swal.fire({
        title: 'Profile Updated',
        text: 'Your changes have been saved successfully.',
        icon: 'success',
        confirmButtonColor: '#f59e0b'
      });
    },
    onError: (error: any) => {
      const errorMsg = error.response?.data?.error || 'Failed to update profile.';
      Swal.fire({
        title: 'Update Failed',
        text: errorMsg,
        icon: 'error',
        confirmButtonColor: '#f59e0b'
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const isChangingPassword = formData.oldPassword || formData.newPassword || formData.confirmNewPassword;
    
    if (isChangingPassword) {
      if (!formData.oldPassword) {
        Swal.fire('Validation Error', 'Current password is required to set a new password.', 'warning');
        return;
      }
      if (!formData.newPassword) {
        Swal.fire('Validation Error', 'New password is required.', 'warning');
        return;
      }
      if (formData.newPassword !== formData.confirmNewPassword) {
        Swal.fire('Validation Error', 'New passwords do not match.', 'warning');
        return;
      }
    }

    const payload: any = { username: formData.username };
    if (isChangingPassword) {
      payload.oldPassword = formData.oldPassword;
      payload.newPassword = formData.newPassword;
    }

    updateMutation.mutate(payload);
  };

  if (isUserLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-8 h-8 text-gold animate-spin" />
        <p className="text-slate-500 text-sm">{t('profile.loading')}</p>
      </div>
    );
  }

  if (!user) {
    router.push('/login');
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-24 pt-10 px-6">
      {/* Page Header */}
      <header className="glass-header p-10 flex flex-col md:flex-row md:items-center justify-between gap-8 group">
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-gold">
            <div className="bg-gold/10 p-2 rounded-xl border border-gold/20 group-hover:bg-amber-500 group-hover:text-black transition-all">
              <Shield className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gold/80">{t('profile.identityCore')}</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tighter">
            PRO<span className="text-gold">FILE</span> <span className="text-slate-500 font-light">SYSTEM</span>
          </h1>
          <p className="text-slate-400 text-lg font-medium leading-relaxed max-w-lg">
            {t('profile.subtitle')}
          </p>
        </div>
        <div className="bg-white/5 border border-white/10 px-8 py-4 rounded-3xl backdrop-blur-xl">
          <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{t('profile.accessLevel')}</div>
          <div className={cn("text-lg font-black tracking-widest", user.role === 'ADMIN' ? "text-gold animate-pulse" : "text-white")}>
            {user.role}
          </div>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="space-y-12">
        {/* Public Identity Card */}
        <div className="glass p-1.5 shadow-amber-500/5 group">
          <div className="glass bg-slate-900/60 p-10 border-white/5">
            <div className="flex items-center gap-6 mb-12">
              <div className="bg-gold/10 p-4 rounded-2xl border border-gold/20 shadow-lg text-gold group-hover:scale-110 transition-transform">
                <UserCircle className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-xl font-black text-white tracking-tight">{t('profile.publicIdentity')}</h2>
                <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-slate-500 mt-1">{t('profile.handle')}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] pl-1">{t('profile.identification')}</label>
                <div className="relative group/input">
                  <User className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 group-focus-within/input:text-gold transition-colors" />
                  <input
                    type="text"
                    required
                    value={formData.username}
                    onChange={(e) => setFormData(p => ({ ...p, username: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-8 py-5 pl-16 text-white font-bold text-sm focus:outline-none focus:border-amber-500/40 focus:bg-white/10 transition-all placeholder:text-slate-500"
                    placeholder="Identification Handle"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Authentication Factors Card */}
        <div className="glass p-1.5 shadow-amber-500/5 group">
          <div className="glass bg-slate-900/60 p-10 border-white/5">
            <div className="flex items-center gap-6 mb-12">
              <div className="bg-rose-500/10 p-4 rounded-2xl border border-rose-500/20 shadow-lg text-rose-400 group-hover:scale-110 transition-transform">
                <KeyRound className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-xl font-black text-white tracking-tight">{t('profile.authFactors')}</h2>
                <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-slate-500 mt-1">Key Management</p>
              </div>
            </div>

            <div className="space-y-8">
              <div className="bg-rose-500/5 border border-rose-500/10 p-6 rounded-2xl text-[10px] text-rose-400 uppercase tracking-[0.2em] font-bold text-center">
                Attention: Leave fields void to preserve existing authentication keys.
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] pl-1">{t('profile.currentSecret')}</label>
                  <div className="relative group/input">
                    <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within/input:text-rose-400 transition-colors" />
                    <input
                      type="password"
                      value={formData.oldPassword}
                      onChange={(e) => setFormData(p => ({ ...p, oldPassword: e.target.value }))}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 pl-14 text-white text-sm focus:outline-none focus:border-rose-400/40 focus:bg-white/10 transition-all"
                      placeholder="Current Secret"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] pl-1">{t('profile.newSecret')}</label>
                  <div className="relative group/input">
                    <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within/input:text-emerald-400 transition-colors" />
                    <input
                      type="password"
                      value={formData.newPassword}
                      onChange={(e) => setFormData(p => ({ ...p, newPassword: e.target.value }))}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 pl-14 text-white text-sm focus:outline-none focus:border-emerald-400/40 focus:bg-white/10 transition-all"
                      placeholder="Target Secret"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] pl-1">{t('profile.verifySecret')}</label>
                  <div className="relative group/input">
                    <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within/input:text-emerald-400 transition-colors" />
                    <input
                      type="password"
                      value={formData.confirmNewPassword}
                      onChange={(e) => setFormData(p => ({ ...p, confirmNewPassword: e.target.value }))}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 pl-14 text-white text-sm focus:outline-none focus:border-emerald-400/40 focus:bg-white/10 transition-all"
                      placeholder="Match Secret"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-6">
          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="flex items-center gap-4 bg-gold hover:bg-gold-strong text-black font-black px-12 py-6 rounded-2xl shadow-lg transition-all hover:scale-105 active:scale-95 group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12" />
            {updateMutation.isPending ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                <span className="uppercase tracking-[0.2em] text-[10px]">{t('profile.processing')}</span>
              </>
            ) : (
              <>
                <Zap className="w-5 h-5" />
                <span className="uppercase tracking-[0.2em] text-[10px]">{t('profile.verifyIdentity')}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
