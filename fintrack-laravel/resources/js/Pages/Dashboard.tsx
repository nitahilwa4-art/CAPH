import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { PageProps } from '@/types';
import { useState } from 'react';
import {
    Plus, Sparkles, TrendingUp, TrendingDown, Wallet as WalletIcon,
    ArrowUpRight, ArrowDownRight, BarChart3, Target,
    CalendarClock, AlertTriangle, ChevronDown, X, ArrowRightLeft
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';
import toast, { Toaster } from 'react-hot-toast';

interface Stats {
    totalIncome: number;
    totalExpense: number;
    balance: number;
    netFlow: number;
    transactionCount: number;
}

interface Transaction {
    id: number;
    date: string;
    description: string;
    amount: number;
    type: 'INCOME' | 'EXPENSE' | 'TRANSFER';
    category: string;
    wallet?: { id: number; name: string };
}

interface WalletData {
    id: number;
    name: string;
    type: string;
    balance: number;
}

interface BudgetProgress {
    id: number;
    category: string;
    limit: number;
    spent: number;
    percentage: number;
}

interface Debt {
    id: number;
    type: string;
    person: string;
    amount: number;
    due_date: string;
    description?: string;
}

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', '#eab308', '#22c55e', '#06b6d4'];

const formatIDR = (amount: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);

const formatShortIDR = (amount: number) => {
    if (amount >= 1_000_000_000) return `Rp${(amount / 1_000_000_000).toFixed(1)}M`;
    if (amount >= 1_000_000) return `Rp${(amount / 1_000_000).toFixed(1)}Jt`;
    if (amount >= 1_000) return `Rp${(amount / 1_000).toFixed(0)}K`;
    return formatIDR(amount);
};

export default function Dashboard({
    auth, stats, expenseByCategory, budgetProgress, recentTransactions, wallets, upcomingBills
}: PageProps<{
    stats: Stats;
    expenseByCategory: Record<string, number>;
    budgetProgress: BudgetProgress[];
    recentTransactions: Transaction[];
    wallets: WalletData[];
    upcomingBills: Debt[];
}>) {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [inputType, setInputType] = useState<'EXPENSE' | 'INCOME' | 'TRANSFER'>('EXPENSE');

    const { data, setData, post, processing, reset } = useForm({
        wallet_id: '',
        to_wallet_id: '',
        date: new Date().toISOString().split('T')[0],
        description: '',
        amount: '',
        type: 'EXPENSE' as 'INCOME' | 'EXPENSE' | 'TRANSFER',
        category: '',
    });

    const handleAmountChange = (val: string) => {
        const rawValue = val.replace(/\D/g, '');
        if (!rawValue) { setData('amount', ''); return; }
        setData('amount', parseInt(rawValue).toLocaleString('id-ID'));
    };

    const parseAmount = (val: string) => parseFloat(val.replace(/\./g, '')) || 0;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const payload = { ...data, type: inputType, amount: parseAmount(data.amount).toString() };
        router.post(route('transactions.store'), payload, {
            onSuccess: () => {
                setIsAddModalOpen(false);
                reset();
                toast.success('Transaksi berhasil ditambahkan!');
            }
        });
    };

    // Chart Data 
    const pieData = Object.entries(expenseByCategory).map(([name, value]) => ({ name, value }));
    const totalCategoryExpense = pieData.reduce((a, b) => a + b.value, 0);

    // Budget colors
    const getBudgetColor = (pct: number) => {
        if (pct >= 90) return 'bg-red-500';
        if (pct >= 70) return 'bg-amber-500';
        return 'bg-emerald-500';
    };

    return (
        <AppLayout
            header={
                <div className="flex flex-col">
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">Dashboard Ringkasan</h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                        Selamat datang kembali, {auth.user.name.split(' ')[0]}!
                    </p>
                </div>
            }
        >
            <Head title="Dashboard" />
            <Toaster position="top-right" />

            <div className="space-y-8">
                {/* Quick Action Bar */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fade-in-up" style={{ animationDelay: '0ms' }}>
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight">Financial Overview</h2>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 font-medium">
                            Pantau kondisi keuangan Anda secara real-time.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link
                            href={route('smart-entry.index')}
                            className="flex items-center px-5 py-3 bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 rounded-2xl text-sm font-bold hover:bg-indigo-50 dark:hover:bg-slate-700 transition-all border border-indigo-100 dark:border-slate-700 shadow-sm hover:shadow-md hover:scale-105 active:scale-95"
                        >
                            <Sparkles className="w-4 h-4 mr-2 text-indigo-500 dark:text-indigo-400" />
                            AI Input
                        </Link>
                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="flex items-center px-5 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-2xl text-sm font-bold hover:shadow-lg hover:shadow-indigo-500/30 transition-all hover:scale-105 active:scale-95"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Transaksi Baru
                        </button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Balance */}
                    <div className="glass-card p-6 rounded-[2rem] hover:shadow-xl transition-all duration-500 group relative overflow-hidden animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-violet-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-2xl transition-transform duration-500 group-hover:scale-110">
                                    <WalletIcon className="w-6 h-6" />
                                </div>
                                <span className={`flex items-center text-xs font-bold px-2 py-1 rounded-full ${stats.netFlow >= 0 ? 'text-emerald-700 bg-emerald-100 dark:bg-emerald-900/40 dark:text-emerald-400' : 'text-red-700 bg-red-100 dark:bg-red-900/40 dark:text-red-400'}`}>
                                    {stats.netFlow >= 0 ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
                                    {stats.transactionCount} txn
                                </span>
                            </div>
                            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Total Saldo</p>
                            <p className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight">{formatShortIDR(stats.balance)}</p>
                        </div>
                    </div>

                    {/* Income */}
                    <div className="glass-card p-6 rounded-[2rem] hover:shadow-xl transition-all duration-500 group relative overflow-hidden animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-2xl transition-transform duration-500 group-hover:scale-110">
                                    <TrendingUp className="w-6 h-6" />
                                </div>
                                <span className="flex items-center text-xs font-bold px-2 py-1 rounded-full text-emerald-700 bg-emerald-100 dark:bg-emerald-900/40 dark:text-emerald-400">
                                    <ArrowUpRight className="w-3 h-3 mr-1" /> Masuk
                                </span>
                            </div>
                            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Pemasukan Bulan Ini</p>
                            <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 tracking-tight">{formatShortIDR(stats.totalIncome)}</p>
                        </div>
                    </div>

                    {/* Expense */}
                    <div className="glass-card p-6 rounded-[2rem] hover:shadow-xl transition-all duration-500 group relative overflow-hidden animate-fade-in-up" style={{ animationDelay: '300ms' }}>
                        <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-rose-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 rounded-2xl transition-transform duration-500 group-hover:scale-110">
                                    <TrendingDown className="w-6 h-6" />
                                </div>
                                <span className="flex items-center text-xs font-bold px-2 py-1 rounded-full text-red-700 bg-red-100 dark:bg-red-900/40 dark:text-red-400">
                                    <ArrowDownRight className="w-3 h-3 mr-1" /> Keluar
                                </span>
                            </div>
                            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Pengeluaran Bulan Ini</p>
                            <p className="text-3xl font-bold text-red-600 dark:text-red-400 tracking-tight">{formatShortIDR(stats.totalExpense)}</p>
                        </div>
                    </div>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-auto lg:h-[500px]">
                    {/* Trend Bar Chart */}
                    <div className="lg:col-span-2 glass-card p-6 lg:p-8 rounded-[2rem] flex flex-col transition-all hover:shadow-lg duration-500 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-lg font-bold text-slate-800 dark:text-white">Tren Keuangan</h3>
                                <p className="text-xs text-slate-400">Pemasukan vs Pengeluaran bulan ini</p>
                            </div>
                            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-xl">
                                <BarChart3 className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="flex-1 min-h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={[
                                    { name: 'Pemasukan', value: stats.totalIncome },
                                    { name: 'Pengeluaran', value: stats.totalExpense },
                                ]} margin={{ top: 5, right: 0, left: 0, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v: number) => formatShortIDR(v)} width={80} />
                                    <Tooltip
                                        formatter={(value: number | undefined) => formatIDR(value ?? 0)}
                                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 40px -10px rgba(0,0,0,0.15)', padding: '12px 16px', fontSize: '13px' }}
                                    />
                                    <Bar dataKey="value" radius={[12, 12, 0, 0]} barSize={60}>
                                        <Cell fill="#22c55e" />
                                        <Cell fill="#ef4444" />
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Category Pie Chart */}
                    <div className="glass-card p-6 lg:p-8 rounded-[2rem] flex flex-col transition-all hover:shadow-lg duration-500 animate-fade-in-up" style={{ animationDelay: '500ms' }}>
                        <div className="mb-4">
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Distribusi Kategori</h3>
                            <p className="text-xs text-slate-400">Pengeluaran per kategori</p>
                        </div>
                        {pieData.length > 0 ? (
                            <>
                                <div className="flex-1 min-h-[200px] flex items-center justify-center">
                                    <ResponsiveContainer width="100%" height={200}>
                                        <PieChart>
                                            <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="value">
                                                {pieData.map((_, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                                                ))}
                                            </Pie>
                                            <Tooltip formatter={(value: number | undefined) => formatIDR(value ?? 0)} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: '12px' }} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="space-y-2 mt-4 max-h-[120px] overflow-y-auto scrollbar-hide">
                                    {pieData.slice(0, 5).map((item, idx) => (
                                        <div key={item.name} className="flex items-center justify-between text-xs">
                                            <div className="flex items-center">
                                                <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                                                <span className="text-slate-600 dark:text-slate-300 truncate max-w-[120px]">{item.name}</span>
                                            </div>
                                            <span className="font-bold text-slate-700 dark:text-slate-200">
                                                {totalCategoryExpense > 0 ? ((item.value / totalCategoryExpense) * 100).toFixed(0) : 0}%
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
                                Belum ada data pengeluaran
                            </div>
                        )}
                    </div>
                </div>

                {/* Widgets Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Budget Watch */}
                    <div className="glass-card p-6 rounded-[2rem] flex flex-col transition-all hover:shadow-lg duration-500 animate-fade-in-up" style={{ animationDelay: '600ms' }}>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center">
                                <Target className="w-5 h-5 mr-2 text-indigo-500" /> Budget Watch
                            </h3>
                            <Link href={route('budgets.index')} className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline">Lihat</Link>
                        </div>
                        <div className="space-y-4 flex-1 overflow-y-auto scrollbar-hide">
                            {budgetProgress.length > 0 ? (
                                budgetProgress.map((b) => (
                                    <div key={b.id}>
                                        <div className="flex justify-between items-center mb-1.5">
                                            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate">{b.category}</span>
                                            <span className="text-xs font-bold text-slate-500">{b.percentage}%</span>
                                        </div>
                                        <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                            <div className={`h-full ${getBudgetColor(b.percentage)} rounded-full transition-all duration-1000`} style={{ width: `${b.percentage}%` }} />
                                        </div>
                                        <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                                            <span>{formatShortIDR(b.spent)}</span>
                                            <span>/ {formatShortIDR(b.limit)}</span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="flex items-center justify-center flex-1 text-slate-400 text-sm py-8">
                                    Belum ada anggaran
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Upcoming Bills */}
                    <div className="glass-card p-6 rounded-[2rem] flex flex-col transition-all hover:shadow-lg duration-500 animate-fade-in-up" style={{ animationDelay: '700ms' }}>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center">
                                <CalendarClock className="w-5 h-5 mr-2 text-amber-500" /> Tagihan Mendatang
                            </h3>
                            <Link href={route('debts.index')} className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline">Lihat</Link>
                        </div>
                        <div className="space-y-3 flex-1 overflow-y-auto scrollbar-hide">
                            {upcomingBills.length > 0 ? (
                                upcomingBills.map((bill) => {
                                    const dueDate = new Date(bill.due_date);
                                    const isOverdue = dueDate < new Date();
                                    return (
                                        <div key={bill.id} className={`flex items-center justify-between p-3 rounded-xl border ${isOverdue ? 'border-red-200 dark:border-red-900/50 bg-red-50/80 dark:bg-red-900/10' : 'border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50'} transition-colors`}>
                                            <div className="flex items-center gap-3">
                                                <div className={`w-2 h-2 rounded-full ${isOverdue ? 'bg-red-500 animate-pulse' : 'bg-amber-500'}`} />
                                                <div>
                                                    <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{bill.person}</p>
                                                    <p className="text-[10px] text-slate-400">{dueDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</p>
                                                </div>
                                            </div>
                                            <span className="text-sm font-bold text-red-600 dark:text-red-400">{formatShortIDR(bill.amount)}</span>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="flex items-center justify-center flex-1 text-slate-400 text-sm py-8">
                                    Tidak ada tagihan
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Recent Transactions */}
                    <div className="glass-card p-6 rounded-[2rem] flex flex-col transition-all hover:shadow-lg duration-500 animate-fade-in-up" style={{ animationDelay: '800ms' }}>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Transaksi Terbaru</h3>
                            <Link href={route('transactions.index')} className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline">Lihat</Link>
                        </div>
                        <div className="space-y-3 flex-1 overflow-y-auto scrollbar-hide">
                            {recentTransactions.length > 0 ? (
                                recentTransactions.slice(0, 5).map((t) => (
                                    <div key={t.id} className="flex items-center justify-between py-2 border-b border-slate-50 dark:border-slate-800 last:border-0 transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/30 rounded-lg px-2 -mx-2 animate-pop-in">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm ${t.type === 'INCOME' ? 'bg-emerald-500' : t.type === 'TRANSFER' ? 'bg-blue-500' : 'bg-red-500'}`}>
                                                {t.type === 'INCOME' ? <TrendingUp className="w-4 h-4" /> : t.type === 'TRANSFER' ? <ArrowRightLeft className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 line-clamp-1">{t.description}</p>
                                                <p className="text-[10px] text-slate-400">{t.category} · {new Date(t.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</p>
                                            </div>
                                        </div>
                                        <span className={`text-sm font-bold ${t.type === 'INCOME' ? 'text-emerald-600 dark:text-emerald-400' : t.type === 'TRANSFER' ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400'}`}>
                                            {t.type === 'INCOME' ? '+' : '-'}{formatShortIDR(t.amount)}
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <div className="flex items-center justify-center flex-1 text-slate-400 text-sm py-8">
                                    Belum ada transaksi
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modern Add Transaction Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-[999] flex items-end sm:items-center justify-center p-0 sm:p-6 animate-fade-in">
                    <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity" onClick={() => setIsAddModalOpen(false)} />
                    <div className="relative w-full max-w-md glass-card rounded-t-[2rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-pop-in">
                        {/* Gradient top bar */}
                        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 z-10" />

                        {/* Header */}
                        <div className="p-5 pb-0 shrink-0">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-bold text-slate-800 dark:text-white">Transaksi Baru</h3>
                                <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Type Toggle */}
                            <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl mb-2">
                                {(['EXPENSE', 'INCOME', 'TRANSFER'] as const).map(type => (
                                    <button
                                        key={type}
                                        type="button"
                                        onClick={() => { setInputType(type); setData('type', type); }}
                                        className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 ${inputType === type
                                            ? type === 'INCOME' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                                                : type === 'EXPENSE' ? 'bg-red-500 text-white shadow-lg shadow-red-500/30'
                                                    : 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                                            : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                                            }`}
                                    >
                                        {type === 'EXPENSE' ? <><TrendingDown className="w-3 h-3" /> KELUAR</> :
                                            type === 'INCOME' ? <><TrendingUp className="w-3 h-3" /> MASUK</> :
                                                <><ArrowRightLeft className="w-3 h-3" /> TRANSFER</>}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Form */}
                        <div className="p-5 pt-4 overflow-y-auto scrollbar-hide">
                            <form onSubmit={handleSubmit} className="space-y-3">
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1 ml-1">Dompet</label>
                                    <select value={data.wallet_id} onChange={(e) => setData('wallet_id', e.target.value)} className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700/50 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-900/50" required>
                                        <option value="">Pilih Dompet</option>
                                        {wallets.map(w => (
                                            <option key={w.id} value={w.id}>{w.name}</option>
                                        ))}
                                    </select>
                                </div>

                                {inputType === 'TRANSFER' && (
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1 ml-1">Ke Dompet</label>
                                        <select value={data.to_wallet_id} onChange={(e) => setData('to_wallet_id', e.target.value)} className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700/50 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-900/50" required>
                                            <option value="">Pilih Dompet Tujuan</option>
                                            {wallets.filter(w => w.id.toString() !== data.wallet_id).map(w => (
                                                <option key={w.id} value={w.id}>{w.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1 ml-1">Jumlah (Rp)</label>
                                    <input type="text" value={data.amount} onChange={(e) => handleAmountChange(e.target.value)} className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700/50 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-2xl text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-900/50 text-center" placeholder="0" required />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1 ml-1">Kategori</label>
                                        <input type="text" value={data.category} onChange={(e) => setData('category', e.target.value)} className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700/50 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-900/50" placeholder="Makanan" required />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1 ml-1">Tanggal</label>
                                        <input type="date" value={data.date} onChange={(e) => setData('date', e.target.value)} className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700/50 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-900/50" required />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1 ml-1">Deskripsi</label>
                                    <input type="text" value={data.description} onChange={(e) => setData('description', e.target.value)} className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700/50 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-900/50" placeholder="Makan siang" required />
                                </div>

                                <div className="flex space-x-3 pt-4">
                                    <button type="button" onClick={() => setIsAddModalOpen(false)} className="flex-1 py-3 text-sm font-bold text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl transition-colors active:scale-95">Batal</button>
                                    <button type="submit" disabled={processing} className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-2xl text-sm font-bold shadow-lg shadow-indigo-500/30 hover:scale-105 active:scale-95 transition-transform disabled:opacity-50">
                                        {processing ? 'Menyimpan...' : 'Simpan'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
