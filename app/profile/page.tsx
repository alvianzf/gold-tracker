'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Shield, Lock, User, Loader2, Sparkles, KeyRound } from 'lucide-react';
import Swal from 'sweetalert2';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
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

  // Populate username when user data loads
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
        text: 'Your credentials have been successfully synchronized.',
        icon: 'success',
        background: '#0f172a',
        color: '#f8fafc',
        confirmButtonColor: '#3b82f6'
      });
    },
    onError: (error: any) => {
      const errorMsg = error.response?.data?.error || 'Failed to update profile constraints.';
      Swal.fire({
        title: 'Update Rejected',
        text: errorMsg,
        icon: 'error',
        background: '#0f172a',
        color: '#f8fafc',
        confirmButtonColor: '#ef4444'
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if user is trying to change password but hasn't filled all requirements
    const isChangingPassword = formData.oldPassword || formData.newPassword || formData.confirmNewPassword;
    
    if (isChangingPassword) {
      if (!formData.oldPassword) {
        Swal.fire('Validation Error', 'Current password is required to set a new password.', 'error');
        return;
      }
      if (!formData.newPassword) {
        Swal.fire('Validation Error', 'New password is required.', 'error');
        return;
      }
      if (formData.newPassword !== formData.confirmNewPassword) {
        Swal.fire('Validation Error', 'New passwords do not match.', 'error');
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
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-text-muted font-medium text-sm animate-pulse">Decrypting user profile...</p>
      </div>
    );
  }

  if (!user) {
    // Should be handled by middleware or useEffect, but just in case
    router.push('/login');
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-20 fade-in pt-8">
      <header className="flex flex-col gap-3">
        <div className="flex items-center gap-2 text-primary">
          <Shield className="w-4 h-4" />
          <span className="text-xs font-semibold uppercase tracking-widest">Identity Core</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground">
          Profile <span className="font-light text-text-muted">Settings</span>
        </h1>
        <p className="text-base text-text-muted max-w-xl">
          Manage your account credentials and security authentication matrices.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* General Settings Section */}
        <section className="premium-card bg-bg-card p-6 border border-border-subtle relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-[40px] -translate-y-1/2 translate-x-1/2 pointer-events-none transition-colors group-hover:bg-primary/10" />
          
          <div className="flex items-center gap-4 mb-6 relative z-10 border-b border-border-subtle pb-4">
            <div className="p-2.5 bg-primary/10 border border-primary/20 rounded-xl">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground tracking-tight">Public Identity</h2>
              <p className="text-xs text-text-muted font-semibold uppercase tracking-wider mt-0.5">Primary Ledger Alias</p>
            </div>
          </div>

          <div className="relative z-10 max-w-md space-y-4">
             <div className="space-y-2">
                <label className="text-xs font-semibold text-text-muted uppercase tracking-wider ml-1">Username</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={formData.username}
                    onChange={(e) => setFormData(p => ({ ...p, username: e.target.value }))}
                    className="premium-input pl-11"
                    placeholder="Enter username"
                  />
                </div>
              </div>
              <div className="pt-2">
                 <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded border border-border-subtle bg-background text-[10px] font-bold uppercase tracking-widest text-text-muted">
                    <Sparkles className="w-3 h-3" />
                    Access Level Classification: <span className={user.role === 'ADMIN' ? 'text-blue-400' : 'text-foreground'}>{user.role}</span>
                 </div>
              </div>
          </div>
        </section>

        {/* Security Section */}
        <section className="premium-card bg-bg-card p-6 border border-border-subtle relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-danger/5 rounded-full blur-[40px] -translate-y-1/2 translate-x-1/2 pointer-events-none transition-colors group-hover:bg-danger/10" />
          
          <div className="flex items-center gap-4 mb-6 relative z-10 border-b border-border-subtle pb-4">
            <div className="p-2.5 bg-danger/10 border border-danger/20 rounded-xl">
              <KeyRound className="w-5 h-5 text-danger" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground tracking-tight">Authentication Factors</h2>
              <p className="text-xs text-text-muted font-semibold uppercase tracking-wider mt-0.5">Password Modification</p>
            </div>
          </div>

          <div className="relative z-10 max-w-md space-y-5">
             <p className="text-xs text-text-muted mb-2">Leave these fields blank if you do not wish to change your password.</p>
             
             <div className="space-y-2">
                <label className="text-xs font-semibold text-text-muted uppercase tracking-wider ml-1">Current Password</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    value={formData.oldPassword}
                    onChange={(e) => setFormData(p => ({ ...p, oldPassword: e.target.value }))}
                    className="premium-input pl-11"
                    placeholder="Enter current password"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-text-muted uppercase tracking-wider ml-1">New Password</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    value={formData.newPassword}
                    onChange={(e) => setFormData(p => ({ ...p, newPassword: e.target.value }))}
                    className="premium-input pl-11 focus-visible:ring-danger/50 focus-visible:border-danger/50"
                    placeholder="Enter new password"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-text-muted uppercase tracking-wider ml-1">Confirm New Password</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    value={formData.confirmNewPassword}
                    onChange={(e) => setFormData(p => ({ ...p, confirmNewPassword: e.target.value }))}
                    className="premium-input pl-11 focus-visible:ring-danger/50 focus-visible:border-danger/50"
                    placeholder="Confirm new password"
                  />
                </div>
              </div>
          </div>
        </section>

        {/* Submit Action */}
        <div className="flex justify-end pt-4">
           <button
             type="submit"
             disabled={updateMutation.isPending}
             className="premium-btn premium-btn-primary px-10 shadow-lg shadow-primary/20"
           >
             {updateMutation.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2 inline-block" />
                  Updating Matrix...
                </>
             ) : (
                'Save Infrastructure Updates'
             )}
           </button>
        </div>
      </form>
    </div>
  );
}
