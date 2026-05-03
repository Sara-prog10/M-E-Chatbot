import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { auth } from '../firebase';

interface AdminPortalProps {
  currentUser: User;
  onClose: () => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({ currentUser, onClose }) => {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newName, setNewName] = useState('');

  const fetchUsers = async () => {
    setIsLoading(true);
    setError('');
    try {
      const token = await currentUser.getIdToken();
      const res = await fetch('/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) {
        throw new Error(await res.text());
      }
      const data = await res.json();
      setUsers(data.users || []);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to fetch users');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [currentUser]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !newPassword) return;
    setIsLoading(true);
    setError('');
    try {
      const token = await currentUser.getIdToken();
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ email: newEmail, password: newPassword, displayName: newName })
      });
      if (!res.ok) {
        throw new Error(await res.text());
      }
      setNewEmail('');
      setNewPassword('');
      setNewName('');
      fetchUsers(); // Refresh the list
    } catch (err: any) {
      setError(err.message || 'Failed to create user');
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async (uid: string) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    setIsLoading(true);
    setError('');
    try {
      const token = await currentUser.getIdToken();
      const res = await fetch(`/api/admin/users/${uid}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) {
        throw new Error(await res.text());
      }
      fetchUsers();
    } catch (err: any) {
      setError(err.message || 'Failed to delete user');
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 bg-gray-50 dark:bg-gray-900 overflow-y-auto p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8 border-b border-gray-200 dark:border-gray-700 pb-4">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Admin Portal</h1>
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Back to App
          </button>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-4 rounded-md mb-6 whitespace-pre-wrap">
            {error}
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Create New User</h2>
          <form onSubmit={handleCreateUser} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               <div>
                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                 <input 
                   type="email" 
                   required
                   value={newEmail}
                   onChange={e => setNewEmail(e.target.value)}
                   className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                 />
               </div>
               <div>
                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
                 <input 
                   type="password" 
                   required
                   value={newPassword}
                   onChange={e => setNewPassword(e.target.value)}
                   className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                 />
               </div>
               <div>
                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Display Name</label>
                 <input 
                   type="text" 
                   value={newName}
                   onChange={e => setNewName(e.target.value)}
                   className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                 />
               </div>
            </div>
            <button 
              type="submit" 
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? 'Processing...' : 'Create User'}
            </button>
          </form>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Manage Users</h2>
            <button onClick={fetchUsers} disabled={isLoading} className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
              Refresh List
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Display Name</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Last Sign In</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {users.map(user => (
                  <tr key={user.uid}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {user.email}
                      {user.uid === currentUser.uid && <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">You</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {user.displayName || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                       {user.metadata?.lastSignInTime ? new Date(user.metadata.lastSignInTime).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        onClick={() => handleDeleteUser(user.uid)}
                        disabled={user.uid === currentUser.uid || isLoading}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && !isLoading && (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};
