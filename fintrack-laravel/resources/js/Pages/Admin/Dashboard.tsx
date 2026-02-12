import AppLayout from '@/Layouts/AppLayout';
import { Head } from '@inertiajs/react';
import { PageProps } from '@/types';
import { Users, BarChart3, AlertTriangle, Shield, Activity } from 'lucide-react';

interface Stats {
    totalUsers: number;
    activeUsers: number;
    suspendedUsers: number;
    totalTransactions: number;
    newUsersThisMonth: number;
    transactionsThisMonth: number;
}

interface FlaggedTxn {
    id: number;
    user_name: string;
    description: string;
    amount: number;
    type: string;
    date: string;
}

interface LogEntry {
    id: number;
    admin_name: string;
    action: string;
    target: string;
    created_at: string;
}

export default function AdminDashboard({ auth, stats, flaggedTransactions, recentLogs }: PageProps<{ stats: Stats, flaggedTransactions: FlaggedTxn[], recentLogs: LogEntry[] }>) {
    const fmt = (n: number) => new Intl.NumberFormat('id-ID').format(n);

    const statCards = [
        { label: 'Total User', value: stats.totalUsers, icon: Users, gradient: 'from-blue-500 to-indigo-600' },
        { label: 'User Aktif', value: stats.activeUsers, icon: Activity, gradient: 'from-emerald-500 to-teal-600' },
        { label: 'User Suspended', value: stats.suspendedUsers, icon: Shield, gradient: 'from-red-500 to-rose-600' },
        { label: 'Total Transaksi', value: stats.totalTransactions, icon: BarChart3, gradient: 'from-purple-500 to-violet-600' },
    ];

    return (
        <AppLayout header={<div className="flex flex-col"><h1 className="text-2xl font-bold text-slate-800 dark:text-white">Admin Panel</h1><p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Monitoring dan manajemen sistem</p></div>}>
            <Head title="Admin Dashboard" />
            <div className="space-y-6">
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {statCards.map((card, i) => (
                        <div key={i} className={`bg-gradient-to-br ${card.gradient} rounded-2xl p-5 text-white shadow-xl`}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-xs opacity-90 mb-1">{card.label}</div>
                                    <div className="text-3xl font-bold">{fmt(card.value)}</div>
                                </div>
                                <card.icon className="w-10 h-10 opacity-30" />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Bottom Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Flagged Transactions */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-6">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                            <AlertTriangle className="w-5 h-5 text-amber-500" />Transaksi Flagged
                        </h3>
                        <div className="space-y-3">
                            {flaggedTransactions.length === 0 && <p className="text-sm text-slate-500 py-4 text-center">Tidak ada transaksi flagged</p>}
                            {flaggedTransactions.map((txn) => (
                                <div key={txn.id} className="flex justify-between items-center p-3 bg-amber-50 dark:bg-amber-900/10 rounded-xl border border-amber-200 dark:border-amber-800/30">
                                    <div>
                                        <div className="font-semibold text-sm text-slate-900 dark:text-white">{txn.description}</div>
                                        <div className="text-xs text-slate-500">{txn.user_name} • {txn.date}</div>
                                    </div>
                                    <span className={`font-bold text-sm ${txn.type === 'INCOME' ? 'text-emerald-600' : 'text-red-600'}`}>
                                        Rp {fmt(txn.amount)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Recent Logs */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-6">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                            <Activity className="w-5 h-5 text-indigo-500" />Log Aktivitas
                        </h3>
                        <div className="space-y-3">
                            {recentLogs.length === 0 && <p className="text-sm text-slate-500 py-4 text-center">Belum ada log</p>}
                            {recentLogs.map((log) => (
                                <div key={log.id} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                                    <div>
                                        <div className="font-semibold text-sm text-slate-900 dark:text-white">{log.action}</div>
                                        <div className="text-xs text-slate-500">{log.admin_name} → {log.target}</div>
                                    </div>
                                    <span className="text-xs text-slate-400">{log.created_at}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
