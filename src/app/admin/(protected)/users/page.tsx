'use client';

import { useState, useEffect, useCallback } from 'react';
import { Users, Plus, RefreshCw, Shield, ShieldOff, Trash2, Key, Pencil, X, Check, UserPlus } from 'lucide-react';

interface AdminUser {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
  isActive: boolean;
  totpEnabled: boolean;
  createdAt: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [resetPasswordId, setResetPasswordId] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Add form state
  const [addEmail, setAddEmail] = useState('');
  const [addName, setAddName] = useState('');
  const [addPassword, setAddPassword] = useState('');
  const [addError, setAddError] = useState<string | null>(null);

  // Edit form state
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users);
      }
    } catch (err) { console.error('Failed to fetch users:', err); }
    setLoading(false);
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError(null);
    setActionLoading('add');
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: addEmail, name: addName, password: addPassword, role: 'admin' }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAddError(data.error || 'Failed to create user');
        return;
      }
      setShowAddForm(false);
      setAddEmail('');
      setAddName('');
      setAddPassword('');
      await fetchUsers();
    } catch { setAddError('An error occurred'); }
    setActionLoading(null);
  };

  const handleToggleActive = async (user: AdminUser) => {
    setActionLoading(user.id);
    await fetch(`/api/admin/users/${user.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !user.isActive }),
    });
    await fetchUsers();
    setActionLoading(null);
  };

  const handleDelete = async (user: AdminUser) => {
    if (!confirm(`Delete user ${user.email}? This cannot be undone.`)) return;
    setActionLoading(user.id);
    const res = await fetch(`/api/admin/users/${user.id}`, { method: 'DELETE' });
    if (!res.ok) {
      const data = await res.json();
      alert(data.error || 'Failed to delete user');
    }
    await fetchUsers();
    setActionLoading(null);
  };

  const startEdit = (user: AdminUser) => {
    setEditingId(user.id);
    setEditName(user.name || '');
    setEditEmail(user.email || '');
  };

  const handleSaveEdit = async (userId: string) => {
    setActionLoading(userId);
    await fetch(`/api/admin/users/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: editName, email: editEmail }),
    });
    setEditingId(null);
    await fetchUsers();
    setActionLoading(null);
  };

  const handleResetPassword = async (userId: string) => {
    if (newPassword.length < 12) {
      alert('Password must be at least 12 characters');
      return;
    }
    setActionLoading(userId);
    await fetch(`/api/admin/users/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newPassword }),
    });
    setResetPasswordId(null);
    setNewPassword('');
    await fetchUsers();
    setActionLoading(null);
  };

  if (loading) return <div className="flex items-center justify-center py-20"><RefreshCw className="h-8 w-8 text-gray-400 animate-spin" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Users className="h-6 w-6 text-[#2E2865]" />
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
        </div>
        <button onClick={() => setShowAddForm(true)} className="flex items-center gap-2 px-4 py-2 bg-[#2E2865] text-white text-sm font-medium rounded-lg hover:bg-[#231f50] transition-colors">
          <UserPlus className="h-4 w-4" /> Add User
        </button>
      </div>

      {/* Add User Form */}
      {showAddForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Add New User</h2>
          {addError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">{addError}</div>
          )}
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input type="text" value={addName} onChange={(e) => setAddName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#2E2865] focus:border-transparent" placeholder="John Doe" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
                <input type="email" value={addEmail} onChange={(e) => setAddEmail(e.target.value)} required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#2E2865] focus:border-transparent" placeholder="user@example.com" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Temporary Password <span className="text-red-500">*</span></label>
              <input type="text" value={addPassword} onChange={(e) => setAddPassword(e.target.value)} required minLength={12}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-[#2E2865] focus:border-transparent" placeholder="Min 12 characters" />
              <p className="text-xs text-gray-400 mt-1">The user should change this password and enable 2FA after first login.</p>
            </div>
            <div className="flex gap-2">
              <button type="submit" disabled={actionLoading === 'add'}
                className="px-4 py-2 bg-[#2E2865] text-white text-sm font-medium rounded-lg hover:bg-[#231f50] disabled:opacity-50 flex items-center gap-2">
                {actionLoading === 'add' ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Create User
              </button>
              <button type="button" onClick={() => { setShowAddForm(false); setAddError(null); setAddEmail(''); setAddName(''); setAddPassword(''); }}
                className="px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 font-medium text-gray-500">User</th>
                <th className="text-left px-6 py-3 font-medium text-gray-500">Status</th>
                <th className="text-left px-6 py-3 font-medium text-gray-500">2FA</th>
                <th className="text-left px-6 py-3 font-medium text-gray-500">Created</th>
                <th className="text-right px-6 py-3 font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    {editingId === user.id ? (
                      <div className="space-y-2">
                        <input value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Name"
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-[#2E2865] focus:border-transparent" />
                        <input value={editEmail} onChange={(e) => setEditEmail(e.target.value)} placeholder="Email"
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-[#2E2865] focus:border-transparent" />
                      </div>
                    ) : (
                      <div>
                        <div className="font-medium text-gray-900">{user.name || '—'}</div>
                        <div className="text-gray-500">{user.email}</div>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${user.isActive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {user.totpEnabled ? (
                      <span className="inline-flex items-center gap-1 text-green-600"><Shield className="h-3.5 w-3.5" /> Enabled</span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-gray-400"><ShieldOff className="h-3.5 w-3.5" /> Disabled</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-1">
                      {editingId === user.id ? (
                        <>
                          <button onClick={() => handleSaveEdit(user.id)} disabled={actionLoading === user.id}
                            className="p-1.5 text-green-600 hover:bg-green-50 rounded" title="Save">
                            {actionLoading === user.id ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                          </button>
                          <button onClick={() => setEditingId(null)} className="p-1.5 text-gray-400 hover:bg-gray-100 rounded" title="Cancel">
                            <X className="h-4 w-4" />
                          </button>
                        </>
                      ) : resetPasswordId === user.id ? (
                        <div className="flex items-center gap-2">
                          <input type="text" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="New password (min 12)"
                            className="w-40 px-2 py-1 border border-gray-300 rounded text-sm font-mono focus:ring-2 focus:ring-[#2E2865] focus:border-transparent" />
                          <button onClick={() => handleResetPassword(user.id)} disabled={actionLoading === user.id}
                            className="p-1.5 text-green-600 hover:bg-green-50 rounded" title="Save password">
                            {actionLoading === user.id ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                          </button>
                          <button onClick={() => { setResetPasswordId(null); setNewPassword(''); }} className="p-1.5 text-gray-400 hover:bg-gray-100 rounded" title="Cancel">
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <button onClick={() => startEdit(user)} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded" title="Edit">
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button onClick={() => setResetPasswordId(user.id)} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded" title="Reset password">
                            <Key className="h-4 w-4" />
                          </button>
                          <button onClick={() => handleToggleActive(user)} disabled={actionLoading === user.id}
                            className={`p-1.5 rounded ${user.isActive ? 'text-orange-400 hover:text-orange-600 hover:bg-orange-50' : 'text-green-400 hover:text-green-600 hover:bg-green-50'}`}
                            title={user.isActive ? 'Deactivate' : 'Activate'}>
                            {user.isActive ? <ShieldOff className="h-4 w-4" /> : <Shield className="h-4 w-4" />}
                          </button>
                          <button onClick={() => handleDelete(user)} disabled={actionLoading === user.id}
                            className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded" title="Delete">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {users.length === 0 && (
          <div className="text-center py-12 text-gray-400">No users found</div>
        )}
      </div>
    </div>
  );
}
