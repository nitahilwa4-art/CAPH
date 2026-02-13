import AppLayout from '@/Layouts/AppLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { PageProps } from '@/types';
import { useState } from 'react';
import {
    Plus, X, HandCoins, AlertTriangle, Trash2, Edit2, Check, Calendar,
    TrendingUp, TrendingDown, Receipt
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

interface Debt {
    id: number;
    type: 'DEBT' | 'RECEIVABLE' | 'BILL';
    person: string;
    amount: number;
    description?: string;
    due_date?: string;
    is_paid: boolean;
}

interface Summary {
    totalDebt: number;
    totalReceivable: number;
    totalBill: number;
    paidCount: number;
    unpaidCount: number;
}

const formatIDR = (amount: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);

export default function DebtsIndex({ auth, debts, summary, filters }: PageProps<{
    debts: { data: Debt[] };
    summary: Summary;
    filters: any;
}>) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDebt, setEditingDebt] = useState<Debt | null>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const { data, setData, post, put, processing, reset } = useForm({
        type: 'DEBT' as string,
        person: '',
        amount: '',
        description: '',
        due_date: '',
    });

    const handleAmountChange = (val: string) => {
        const rawValue = val.replace(/\D/g, '');
        if (!rawValue) { setData('amount', ''); return; }
        setData('amount', parseInt(rawValue).toLocaleString('id-ID'));
    };
    const parseAmount = (val: string) => parseFloat(val.replace(/\./g, '')) || 0;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const payload = { ...data, amount: parseAmount(data.amount).toString() };
        if (editingDebt) {
            router.put(route('debts.update', editingDebt.id), payload, {
                onSuccess: () => { setIsModalOpen(false); reset(); setEditingDebt(null); toast.success('Diperbarui!'); }
            });
        } else {
            router.post(route('debts.store'), payload, {
                onSuccess: () => { setIsModalOpen(false); reset(); toast.success('Ditambahkan!'); }
            });
        }
    };

    const handleEdit = (d: Debt) => {
        setEditingDebt(d);
        setData({ type: d.type, person: d.person, amount: d.amount.toLocaleString('id-ID'), description: d.description || '', due_date: d.due_date || '' });
        setIsModalOpen(true);
    };

    const handleTogglePaid = (d: Debt) => {
        router.put(route('debts.update', d.id), { ...d, is_paid: !d.is_paid, amount: d.amount.toString() }, {
            onSuccess: () => toast.success(d.is_paid ? 'Ditandai belum lunas' : 'Ditandai lunas!')
        });
    };

    const getTypeConfig = (type: string) => {
        switch (type) {
            case 'DEBT': return { label: 'Hutang', color: 'bg-red-500', badge: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400', icon: TrendingDown };
            case 'RECEIVABLE': return { label: 'Piutang', color: 'bg-emerald-500', badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400', icon: TrendingUp };
            case 'BILL': return { label: 'Tagihan', color: 'bg-amber-500', badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400', icon: Receipt };
            default: return { label: type, color: 'bg-slate-500', badge: 'bg-slate-100 text-slate-700', icon: HandCoins };
        }
    };

    return (
        <AppLayout header={
            <div className="flex flex-col">
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">Hutang & Piutang</h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">Kelola kewajiban dan tagihan Anda</p>
            </div>
        }>
            <Head title="Hutang & Piutang" />
            <Toaster position="top-right" />

            <div className="space-y-6 animate-fade-in-up">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {[
                        { label: 'Total Hutang', value: summary.totalDebt, color: 'from-red-500 to-rose-600', icon: TrendingDown },
                        { label: 'Total Piutang', value: summary.totalReceivable, color: 'from-emerald-500 to-teal-600', icon: TrendingUp },
                        { label: 'Total Tagihan', value: summary.totalBill, color: 'from-amber-500 to-orange-600', icon: Receipt },
                    ].map((item, idx) => (
                        <div key={idx} className="glass-card p-6 rounded-[2rem] hover:shadow-xl transition-all duration-300 group animate-pop-in" style={{ animationDelay: `${idx * 100}ms` }}>
                            <div className="flex items-center justify-between mb-4">
                                <div className={`p-3 bg-gradient-to-br ${item.color} text-white rounded-2xl shadow-lg transition-transform duration-500 group-hover:scale-110`}>
                                    <item.icon className="w-5 h-5" />
                                </div>
                            </div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{item.label}</p>
                            <p className="text-2xl font-bold text-slate-800 dark:text-white">{formatIDR(item.value)}</p>
                        </div>
                    ))}
                </div>

                {/* Actions */}
                <div className="flex justify-end">
                    <button onClick={() => { setEditingDebt(null); reset(); setIsModalOpen(true); }} className="flex items-center px-5 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-2xl text-sm font-bold hover:shadow-lg hover:shadow-indigo-500/30 transition-all hover:scale-105 active:scale-95">
                        <Plus className="w-4 h-4 mr-2" /> Tambah
                    </button>
                </div>

                {/* Debt List */}
                <div className="space-y-3">
                    {debts.data.length > 0 ? debts.data.map((d, idx) => {
                        const config = getTypeConfig(d.type);
                        const isOverdue = d.due_date && new Date(d.due_date) < new Date() && !d.is_paid;
                        return (
                            <div key={d.id} className={`glass-card rounded-2xl p-4 flex items-center justify-between group hover:shadow-lg transition-all duration-300 animate-fade-in-up ${d.is_paid ? 'opacity-60' : ''}`} style={{ animationDelay: `${idx * 50}ms` }}>
                                <div className="flex items-center gap-4 flex-1 min-w-0">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${config.color} text-white shadow-sm shrink-0`}>
                                        <config.icon className="w-4 h-4" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <p className={`text-sm font-bold text-slate-800 dark:text-white ${d.is_paid ? 'line-through' : ''}`}>{d.person}</p>
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${config.badge}`}>{config.label}</span>
                                            {isOverdue && <span className="text-[10px] font-bold text-red-600 bg-red-100 dark:bg-red-900/30 px-2 py-0.5 rounded-full flex items-center gap-0.5"><AlertTriangle className="w-3 h-3" /> Jatuh Tempo</span>}
                                            {d.is_paid && <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 px-2 py-0.5 rounded-full flex items-center gap-0.5"><Check className="w-3 h-3" /> Lunas</span>}
                                        </div>
                                        {d.description && <p className="text-[10px] text-slate-400 truncate mt-0.5">{d.description}</p>}
                                        {d.due_date && <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5"><Calendar className="w-3 h-3" /> {new Date(d.due_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</p>}
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 shrink-0">
                                    <span className="text-base font-bold text-slate-800 dark:text-white">{formatIDR(d.amount)}</span>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => handleTogglePaid(d)} className={`p-2 rounded-lg transition-all hover:scale-110 ${d.is_paid ? 'text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/30' : 'text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/30'}`} title={d.is_paid ? 'Belum lunas' : 'Tandai lunas'}><Check className="w-4 h-4" /></button>
                                        <button onClick={() => handleEdit(d)} className="p-2 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-all hover:scale-110"><Edit2 className="w-4 h-4" /></button>
                                        <button onClick={() => setDeleteId(d.id)} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-all hover:scale-110"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                </div>
                            </div>
                        );
                    }) : (
                        <div className="glass-card rounded-[2rem] p-16 text-center">
                            <HandCoins className="w-16 h-16 text-slate-200 dark:text-slate-700 mx-auto mb-4" />
                            <p className="text-lg font-bold text-slate-400">Belum ada data</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Delete Modal */}
            {deleteId && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 animate-fade-in">
                    <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={() => setDeleteId(null)} />
                    <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-[2rem] p-6 shadow-2xl animate-pop-in border border-slate-100 dark:border-slate-800">
                        <div className="w-14 h-14 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 mb-4 mx-auto"><AlertTriangle className="w-7 h-7" /></div>
                        <h3 className="text-xl font-bold text-center text-slate-900 dark:text-white mb-6">Hapus data ini?</h3>
                        <div className="flex gap-3">
                            <button onClick={() => setDeleteId(null)} className="flex-1 py-3 rounded-xl font-bold text-slate-600 bg-slate-100 dark:bg-slate-800 dark:text-slate-300">Batal</button>
                            <button onClick={() => { router.delete(route('debts.destroy', deleteId), { onSuccess: () => toast.success('Dihapus!') }); setDeleteId(null); }} className="flex-1 py-3 rounded-xl font-bold text-white bg-red-600 shadow-lg shadow-red-500/30">Ya, Hapus</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[999] flex items-end sm:items-center justify-center p-0 sm:p-6 pb-16 lg:pb-0 animate-fade-in">
                    <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
                    <div className="relative w-full max-w-md glass-card rounded-t-[2rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-pop-in">
                        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 z-10" />
                        <div className="p-5 pb-0 shrink-0 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white">{editingDebt ? 'Edit' : 'Tambah Baru'}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="p-5 pt-4 overflow-y-auto scrollbar-hide">
                            <form onSubmit={handleSubmit} className="space-y-3">
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1 ml-1">Tipe</label>
                                    <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
                                        {([{ v: 'DEBT', l: 'Hutang', c: 'bg-red-500 text-white shadow-lg shadow-red-500/30' }, { v: 'RECEIVABLE', l: 'Piutang', c: 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' }, { v: 'BILL', l: 'Tagihan', c: 'bg-amber-500 text-white shadow-lg shadow-amber-500/30' }] as const).map(opt => (
                                            <button key={opt.v} type="button" onClick={() => setData('type', opt.v)}
                                                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${data.type === opt.v ? opt.c : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
                                            >{opt.l}</button>
                                        ))}
                                    </div>
                                </div>
                                <div><label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1 ml-1">Nama</label><input type="text" required value={data.person} onChange={(e) => setData('person', e.target.value)} className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700/50 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-900/50" placeholder="Nama orang/instansi" /></div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div><label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1 ml-1">Jumlah (Rp)</label><input type="text" required value={data.amount} onChange={(e) => handleAmountChange(e.target.value)} className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700/50 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-900/50" placeholder="0" /></div>
                                    <div><label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1 ml-1">Jatuh Tempo</label><input type="date" value={data.due_date} onChange={(e) => setData('due_date', e.target.value)} className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700/50 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-900/50" /></div>
                                </div>
                                <div><label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1 ml-1">Keterangan</label><input type="text" value={data.description} onChange={(e) => setData('description', e.target.value)} className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700/50 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-900/50" placeholder="Opsional" /></div>
                                <div className="flex space-x-3 pt-4">
                                    <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 text-sm font-bold text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl transition-colors active:scale-95">Batal</button>
                                    <button type="submit" disabled={processing} className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-2xl text-sm font-bold shadow-lg shadow-indigo-500/30 hover:scale-105 active:scale-95 transition-transform disabled:opacity-50">{processing ? '...' : 'Simpan'}</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
