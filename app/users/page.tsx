'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Plus, Trash2, Shield, User, Loader2 } from 'lucide-react';
import ActionMenu from '@/components/ActionMenu';
import { useState } from 'react';
import { format } from 'date-fns';

export default function UsersPage() {
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
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => axios.delete(`/api/users/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  return (
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            User <span className="bg-gradient-to-r from-indigo-300 to-indigo-500 bg-clip-text text-transparent">Management</span>
          </h1>
          <p className="mt-3 text-lg text-slate-400 max-w-xl">
            Control access and roles across the platform.
          </p>
        </div>
        
        <button 
          onClick={() => setIsAddMode(true)}
          className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-5 py-3 rounded-2xl transition-all shadow-[0_0_20px_rgba(99,102,241,0.2)]"
        >
          <Plus className="w-5 h-5" />
          <span className="font-bold">New User</span>
        </button>
      </header>

      {isAddMode && (
        <section className="bg-slate-900/50 border border-white/10 p-6 rounded-3xl animate-in fade-in slide-in-from-top-4">
          <h3 className="text-xl font-bold text-white mb-4">Create New User</h3>
          <form className="grid grid-cols-1 md:grid-cols-4 gap-4" onSubmit={(e) => {
            e.preventDefault();
            createMutation.mutate(formData);
          }}>
            <input 
              type="text" placeholder="Username" required
              className="bg-slate-950 border border-white/5 rounded-xl px-4 py-2 text-white outline-none focus:border-indigo-500"
              value={formData.username} onChange={e => setFormData(p => ({ ...p, username: e.target.value }))}
            />
            <input 
              type="password" placeholder="Password" required
              className="bg-slate-950 border border-white/5 rounded-xl px-4 py-2 text-white outline-none focus:border-indigo-500"
              value={formData.password} onChange={e => setFormData(p => ({ ...p, password: e.target.value }))}
            />
            <select 
              className="bg-slate-950 border border-white/5 rounded-xl px-4 py-2 text-white outline-none focus:border-indigo-500"
              value={formData.role} onChange={e => setFormData(p => ({ ...p, role: e.target.value }))}
            >
              <option value="USER">USER</option>
              <option value="ADMIN">ADMIN</option>
            </select>
            <div className="flex gap-2">
              <button type="submit" disabled={createMutation.isPending} className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-bold transition-colors disabled:opacity-50 flex items-center justify-center">
                {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create'}
              </button>
              <button type="button" onClick={() => setIsAddMode(false)} className="px-4 text-slate-400 hover:text-white transition-colors">
                Cancel
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="bg-slate-900/30 border border-white/5 rounded-3xl overflow-hidden backdrop-blur-xl">
        {isLoading ? (
          <div className="p-20 text-center animate-pulse text-slate-500">Loading users...</div>
        ) : !users?.length ? (
           <div className="p-20 text-center text-slate-500">No users found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/5 text-slate-400 uppercase text-[10px] tracking-widest font-semibold">
                <tr>
                  <th className="px-8 py-5">User</th>
                  <th className="px-8 py-5">Role</th>
                  <th className="px-8 py-5">Created At</th>
                  <th className="px-8 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {users.map((u: { id: string; username: string; role: string; createdAt: string }) => (
                  <tr key={u.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                          <User className="w-4 h-4" />
                        </div>
                        <span className="font-bold text-slate-200">{u.username}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest ${u.role === 'ADMIN' ? 'bg-amber-500/10 text-amber-500' : 'bg-slate-500/10 text-slate-400'}`}>
                        {u.role === 'ADMIN' && <Shield className="w-3 h-3" />}
                        {u.role}
                      </div>
                    </td>
                    <td className="px-8 py-5 text-slate-400">
                      {format(new Date(u.createdAt), 'MMM dd, yyyy')}
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex justify-end">
                        <ActionMenu
                          actions={[
                            {
                              label: 'Delete User',
                              icon: Trash2,
                              variant: 'danger',
                              onClick: () => {
                                if (confirm(`Are you sure you want to delete user ${u.username}?`)) {
                                  deleteMutation.mutate(u.id);
                                }
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
      </section>
    </div>
  );
}
