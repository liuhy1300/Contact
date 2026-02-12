
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { User, UserPlus, Trash2, Shield, ShieldAlert, Key } from 'lucide-react';

interface Profile {
    id: string;
    email: string;
    role: 'admin' | 'user';
    created_at: string;
}

const UserManagement: React.FC = () => {
    const [users, setUsers] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // New User Form
    const [newUserEmail, setNewUserEmail] = useState('');
    const [newUserPassword, setNewUserPassword] = useState('');
    const [newUserName, setNewUserName] = useState(''); // Optional display name
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Error fetching users:", error);
        } else {
            setUsers(data as Profile[] || []);
        }
        setLoading(false);
    };

    const handleCreateUser = async () => {
        if (!newUserEmail || !newUserPassword) {
            alert("Email and Password are required.");
            return;
        }
        if (newUserPassword.length < 6) {
            alert("Password must be at least 6 characters.");
            return;
        }

        setCreating(true);
        try {
            // Call the RPC function we added to the schema
            const { data, error } = await supabase.rpc('create_user_by_admin', {
                email: newUserEmail,
                password: newUserPassword,
                user_name: newUserName || newUserEmail.split('@')[0]
            });

            if (error) throw error;

            alert("User created successfully!");
            setIsModalOpen(false);
            setNewUserEmail('');
            setNewUserPassword('');
            setNewUserName('');
            fetchUsers(); // Refresh list

        } catch (err: any) {
            console.error("Failed to create user:", err);
            alert("Failed to create user: " + err.message + "\n\n(Ensure you have run the schema update SQL in Supabase)");
        } finally {
            setCreating(false);
        }
    };

    return (
        <div className="flex-1 flex flex-col h-full bg-slate-50">
            <div className="p-5 bg-white border-b border-slate-200 flex justify-between items-center shadow-sm z-10">
                <div>
                    <h1 className="text-lg font-bold text-slate-800 flex items-center">
                        <User className="w-5 h-5 mr-2 text-blue-600" />
                        用户管理 (User Management)
                    </h1>
                    <p className="text-xs text-slate-500">Manage access and account provisioning</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center transition-colors shadow-sm"
                >
                    <UserPlus className="w-4 h-4 mr-2" /> 新增用户
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
                {loading ? (
                    <div className="text-center text-slate-400 mt-10">Loading users...</div>
                ) : (
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
                                <tr>
                                    <th className="p-4">Email</th>
                                    <th className="p-4">Role</th>
                                    <th className="p-4">Joined</th>
                                    <th className="p-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {users.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="p-8 text-center text-slate-400">
                                            No users found. (Run schema migration if this persists)
                                        </td>
                                    </tr>
                                ) : users.map(user => (
                                    <tr key={user.id} className="hover:bg-slate-50 group transition-colors">
                                        <td className="p-4 font-medium text-slate-700">{user.email}</td>
                                        <td className="p-4">
                                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold ${user.role === 'admin'
                                                    ? 'bg-purple-100 text-purple-700 border border-purple-200'
                                                    : 'bg-slate-100 text-slate-600 border border-slate-200'
                                                }`}>
                                                {user.role === 'admin' ? <Shield className="w-3 h-3 mr-1" /> : <User className="w-3 h-3 mr-1" />}
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="p-4 text-slate-500 text-xs">
                                            {new Date(user.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="p-4 text-right">
                                            <button className="text-slate-300 hover:text-red-500 transition-colors p-1 opacity-0 group-hover:opacity-100" title="Delete User">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Create User Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-bold text-slate-800">Create New Account</h2>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Email Address</label>
                                <input
                                    type="email"
                                    className="w-full border border-slate-300 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="user@filez.com"
                                    value={newUserEmail}
                                    onChange={e => setNewUserEmail(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Display Name (Optional)</label>
                                <input
                                    className="w-full border border-slate-300 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="John Doe"
                                    value={newUserName}
                                    onChange={e => setNewUserName(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Initial Password</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        className="w-full border border-slate-300 p-2.5 rounded-lg text-sm pl-9 font-mono focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="Min 6 chars"
                                        value={newUserPassword}
                                        onChange={e => setNewUserPassword(e.target.value)}
                                    />
                                    <Key className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                                </div>
                                <p className="text-[10px] text-slate-400 mt-1">
                                    <ShieldAlert className="w-3 h-3 inline mr-1" />
                                    Admin set password. User can change later.
                                </p>
                            </div>
                        </div>

                        <div className="flex justify-end space-x-3 mt-8 pt-4 border-t border-slate-100">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreateUser}
                                disabled={creating}
                                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold shadow-sm disabled:opacity-70 flex items-center"
                            >
                                {creating ? 'Creating...' : 'Create Account'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagement;
