import AppLayout from '@/Layouts/AppLayout';
import { Head, router } from '@inertiajs/react';
import { PageProps } from '@/types';
import { Shield, ShieldOff, Trash2, Search } from 'lucide-react';
import { useState } from 'react';

interface User {
    id: number;
    name: string;
    email: string;
    role: 'ADMIN' | 'USER';
    status: 'ACTIVE' | 'SUSPENDED';
    transactions_count: number;
    wallets_count: number;
    created_at: string;
}

export default function AdminUsers({ auth, users, filters }: PageProps<{ users: { data: User[] }, filters: any }>) {
    const [search, setSearch] = useState(filters?.search || '');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(route('admin.users.index'), { search }, { preserveState: true });
    };

    return (
        <AppLayout header={<div className="flex flex-col"><h1 className="text-2xl font-bold text-slate-800 dark:text-white">Manajemen User</h1><p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Kelola pengguna aplikasi</p></div>}>
            <Head title="Admin - Users" />
            <div className="space-y-6">
                {/* Search */}
                <form onSubmit={handleSearch} className="flex gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari user..." className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500" />
                    </div>
                    <button type="submit" className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-medium">Cari</button>
                </form>

                {/* Users Table */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">User</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Role</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Status</th>
                                    <th className="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase">Transaksi</th>
                                    <th className="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase">Dompet</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {users.data.map((user) => (
                                    <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-slate-900 dark:text-white">{user.name}</div>
                                            <div className="text-xs text-slate-500">{user.email}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${user.role === 'ADMIN' ? 'bg-violet-100 dark:bg-violet-900/30 text-violet-700' : 'bg-slate-100 dark:bg-slate-800 text-slate-600'}`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${user.status === 'ACTIVE' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700' : 'bg-red-100 dark:bg-red-900/30 text-red-700'}`}>
                                                {user.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center text-sm text-slate-600 dark:text-slate-400">{user.transactions_count}</td>
                                        <td className="px-6 py-4 text-center text-sm text-slate-600 dark:text-slate-400">{user.wallets_count}</td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                {user.role !== 'ADMIN' && (
                                                    <>
                                                        <button
                                                            onClick={() => { if (confirm(`${user.status === 'ACTIVE' ? 'Suspend' : 'Aktifkan'} user ${user.name}?`)) router.post(route('admin.users.suspend', user.id)); }}
                                                            className={`p-2 rounded-lg transition-colors ${user.status === 'ACTIVE' ? 'text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20' : 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'}`}
                                                            title={user.status === 'ACTIVE' ? 'Suspend' : 'Aktifkan'}
                                                        >
                                                            {user.status === 'ACTIVE' ? <ShieldOff className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                                                        </button>
                                                        <button
                                                            onClick={() => { if (confirm(`Hapus user ${user.name}? Data akan hilang permanen!`)) router.delete(route('admin.users.destroy', user.id)); }}
                                                            className="p-2 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                                            title="Hapus"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
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
                </div>
            </div>
        </AppLayout>
    );
}
