'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Plus, Trash2, Shield, User, Loader2, Users, Zap } from 'lucide-react';
import ActionMenu from '@/components/ActionMenu';
import { cn } from '@/lib/utils';
import Swal from 'sweetalert2';
import { useState } from 'react';
import { format } from 'date-fns';
import { showSuccessToast, showErrorToast } from '@/lib/toast';
import { useI18n } from '@/context/LanguageContext';

export default function UsersPage() {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const [isAddMode, setIsAddMode] = useState(false);
  const [formData, setFormData] = useState({ username: '', password: '', role: 'USER' });

  const { data: users, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data } = await axios.get('/api/users');
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: (newUser: typeof formData) => axios.post('/api/users', newUser),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setIsAddMode(false);
      setFormData({ username: '', password: '', role: 'USER' });
      showSuccessToast('User account created');
    },
    onError: () => {
      showErrorToast('Failed to create user');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => axios.delete(`/api/users/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      showSuccessToast('User account removed');
    },
    onError: () => {
      showErrorToast('Failed to remove user');
    }
  });

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-24 pt-10 px-6">
      <header className="glass-header p-10 flex flex-col md:flex-row md:items-center justify-between gap-8 group">
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-gold">
            <div className="bg-gold/10 p-2 rounded-xl border border-gold/20 group-hover:bg-gold group-hover:text-black transition-all">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gold/80">{t('users.subtitle')}</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tighter">
            USER <span className="text-gold">AUTHORITY</span>
          </h1>
          <p className="text-slate-400 text-lg font-medium leading-relaxed max-w-lg">
            {t('users.subtitle')}
          </p>
        </div>

        <button
          onClick={() => setIsAddMode(!isAddMode)}
          className="group relative flex items-center gap-4 bg-gold hover:bg-gold-strong text-black font-black px-12 py-6 rounded-2xl shadow-gold transition-all hover:scale-105 active:scale-95 overflow-hidden"
        >
          <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12" />
          <Plus className="w-6 h-6" />
          <span className="uppercase tracking-[0.2em] text-[10px]">{isAddMode ? t('users.cancel') : t('users.provision')}</span>
        </button>
      </header>

      {isAddMode && (
        <section className="glass p-1.5 shadow-gold/5 animate-in slide-in-from-top-4 duration-500">
          <div className="glass bg-slate-900/60 p-10 border-white/5">
            <h3 className="text-xl font-black text-white uppercase tracking-[0.3em] mb-10 pl-1">{t('users.newIdentity')}</h3>
            <form className="grid grid-cols-1 md:grid-cols-4 gap-8" onSubmit={(e) => {
              e.preventDefault();
              createMutation.mutate(formData);
            }}>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">{t('users.identifier')}</label>
                <input
                  type="text" placeholder="Username" required
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold text-sm outline-none focus:border-gold/40 focus:bg-white/10 transition-all"
                  value={formData.username} onChange={e => setFormData(p => ({ ...p, username: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">{t('users.secretKey')}</label>
                <input
                  type="password" placeholder="Password" required
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold text-sm outline-none focus:border-gold/40 focus:bg-white/10 transition-all"
                  value={formData.password} onChange={e => setFormData(p => ({ ...p, password: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">{t('users.accessTier')}</label>
                <select
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold text-sm outline-none focus:border-gold/40 focus:bg-white/10 transition-all appearance-none cursor-pointer"
                  value={formData.role} onChange={e => setFormData(p => ({ ...p, role: e.target.value }))}
                >
                  <option value="USER" className="bg-slate-900 text-white">USER TIER</option>
                  <option value="ADMIN" className="bg-slate-900 text-white">ADMIN TIER</option>
                </select>
              </div>
              <div className="flex items-end">
                <button 
                  type="submit" 
                  disabled={createMutation.isPending} 
                  className="w-full bg-gold hover:bg-gold-strong text-black font-black py-4 rounded-xl shadow-gold transition-all flex items-center justify-center gap-3 disabled:opacity-40"
                >
                   {createMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                    <>
                      <Zap className="w-4 h-4" />
                      <span className="uppercase tracking-[0.2em] text-[10px]">{t('users.execute')}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </section>
      )}

      <section className="glass p-1.5 shadow-gold/5 group">
        <div className="glass bg-slate-900/60 border-white/5 overflow-hidden">
          {isLoading ? (
            <div className="p-32 flex flex-col items-center gap-6 text-gold animate-pulse">
               <Loader2 className="w-12 h-12 animate-spin" />
               <span className="text-[10px] font-black uppercase tracking-[0.4em]">{t('users.decrypting')}</span>
            </div>
          ) : !users?.length ? (
            <div className="p-32 text-center text-slate-500 font-bold uppercase tracking-[0.3em]">{t('users.noIdentities')}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px]">
                <thead>
                  <tr className="bg-white/[0.03] border-b border-white/10">
                    <th className="px-10 py-8 text-left text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">{t('users.accessHandle')}</th>
                    <th className="px-10 py-8 text-left text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">{t('users.securityTier')}</th>
                    <th className="px-10 py-8 text-left text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">{t('users.registrationInception')}</th>
                    <th className="px-10 py-8 text-right text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">{t('users.operations')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {users.map((u: { id: string; username: string; role: string; createdAt: string }) => (
                    <tr key={u.id} className="hover:bg-white/[0.04] transition-all group/row">
                      <td className="px-10 py-10">
                        <div className="flex items-center gap-6">
                          <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-slate-500 group-hover/row:bg-gold group-hover/row:text-black transition-all border border-white/10 group-hover/row:border-gold shadow-lg">
                            <User className="w-6 h-6" />
                          </div>
                          <span className="text-lg font-black text-white group-hover/row:translate-x-1 transition-transform">{u.username}</span>
                        </div>
                      </td>
                      <td className="px-10 py-10">
                        <div className={cn(
                          "inline-flex items-center gap-3 px-6 py-2 rounded-xl text-[10px] font-black tracking-[0.2em] border shadow-inner",
                          u.role === 'ADMIN' ? 'bg-gold/10 text-gold border-gold/20' : 'bg-white/5 text-slate-400 border-white/10'
                        )}>
                          {u.role === 'ADMIN' && <Shield className="w-4 h-4 animate-pulse" />}
                          {u.role}
                        </div>
                      </td>
                      <td className="px-10 py-10">
                         <div className="text-slate-500 text-sm font-bold tracking-tight group-hover/row:text-slate-300 transition-colors">
                            {format(new Date(u.createdAt), 'EEEE, dd MMMM yyyy')}
                         </div>
                      </td>
                      <td className="px-10 py-10 text-right">
                        <div className="flex justify-end">
                          <ActionMenu
                            actions={[
                              {
                                label: t('users.revoke'),
                                icon: Trash2,
                                variant: 'danger',
                                onClick: () => {
                                  Swal.fire({
                                    title: 'REVOKE ACCESS?',
                                    text: `System identity "${u.username}" will be permanently purged from the master ledgers.`,
                                    icon: 'warning',
                                    showCancelButton: true,
                                    confirmButtonText: 'PURGE IDENTITY',
                                    cancelButtonText: 'ABORT',
                                    customClass: {
                                      popup: 'doodle-swal'
                                    }
                                  }).then((result) => {
                                    if (result.isConfirmed) {
                                      deleteMutation.mutate(u.id);
                                    }
                                  });
                                },
                              },
                            ]}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
