import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { Wallet, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const [showPassword, setShowPassword] = useState(false);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <>
            <Head title="Daftar - CAPH.io" />
            <div className="min-h-screen flex bg-slate-950 relative overflow-hidden">
                {/* Background */}
                <div className="absolute inset-0">
                    <div className="absolute top-1/3 -left-32 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl animate-pulse" />
                    <div className="absolute bottom-1/3 -right-32 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
                </div>

                {/* Left Panel */}
                <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center p-12">
                    <div className="relative z-10 max-w-md">
                        <div className="flex items-center space-x-3 mb-8">
                            <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-indigo-500/40">
                                <Wallet className="w-8 h-8" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-white leading-none">CAPH.io</h1>
                                <span className="text-xs font-bold text-indigo-400 tracking-widest uppercase">AI Powered</span>
                            </div>
                        </div>
                        <h2 className="text-4xl font-bold text-white mb-4 leading-tight">
                            Mulai Perjalanan <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">Finansial</span> Anda
                        </h2>
                        <p className="text-lg text-slate-400 mb-8">
                            Daftar gratis dan nikmati fitur pencatatan keuangan cerdas berbasis AI.
                        </p>
                        <div className="space-y-4">
                            {[
                                { emoji: '✨', text: 'Gratis selamanya — tanpa biaya tersembunyi' },
                                { emoji: '🔒', text: 'Data Anda aman dan terenkripsi' },
                                { emoji: '⚡', text: 'Setup dalam 30 detik, langsung pakai' },
                            ].map((f, i) => (
                                <div key={i} className="flex items-center gap-3 text-slate-300">
                                    <span className="text-xl">{f.emoji}</span>
                                    <span className="text-sm">{f.text}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Panel */}
                <div className="w-full lg:w-1/2 flex items-center justify-center p-6 relative z-10">
                    <div className="w-full max-w-md">
                        {/* Mobile Logo */}
                        <div className="lg:hidden flex items-center justify-center space-x-3 mb-8">
                            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl flex items-center justify-center text-white shadow-xl">
                                <Wallet className="w-7 h-7" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-white leading-none">CAPH.io</h1>
                                <span className="text-[10px] font-bold text-indigo-400 tracking-widest uppercase">AI Powered</span>
                            </div>
                        </div>

                        <div className="bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-slate-800 shadow-2xl p-8">
                            <div className="mb-8">
                                <h2 className="text-2xl font-bold text-white">Buat Akun Baru 🚀</h2>
                                <p className="text-slate-400 text-sm mt-1">Isi data di bawah untuk memulai</p>
                            </div>

                            <form onSubmit={submit} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Nama Lengkap</label>
                                    <input
                                        type="text"
                                        value={data.name}
                                        autoComplete="name"
                                        autoFocus
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="John Doe"
                                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                    />
                                    {errors.name && <p className="mt-1.5 text-sm text-red-400">{errors.name}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
                                    <input
                                        type="email"
                                        value={data.email}
                                        autoComplete="username"
                                        onChange={(e) => setData('email', e.target.value)}
                                        placeholder="nama@email.com"
                                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                    />
                                    {errors.email && <p className="mt-1.5 text-sm text-red-400">{errors.email}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={data.password}
                                            autoComplete="new-password"
                                            onChange={(e) => setData('password', e.target.value)}
                                            placeholder="Min. 8 karakter"
                                            className="w-full px-4 py-3 pr-12 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                        />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300">
                                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                    {errors.password && <p className="mt-1.5 text-sm text-red-400">{errors.password}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Konfirmasi Password</label>
                                    <input
                                        type="password"
                                        value={data.password_confirmation}
                                        autoComplete="new-password"
                                        onChange={(e) => setData('password_confirmation', e.target.value)}
                                        placeholder="Ulangi password"
                                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                    />
                                    {errors.password_confirmation && <p className="mt-1.5 text-sm text-red-400">{errors.password_confirmation}</p>}
                                </div>

                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl font-bold hover:from-indigo-700 hover:to-violet-700 transition-all shadow-xl shadow-indigo-500/30 disabled:opacity-50 active:scale-[0.98]"
                                >
                                    {processing ? 'Mendaftar...' : 'Daftar Sekarang'}
                                </button>
                            </form>

                            <div className="mt-6 text-center">
                                <p className="text-sm text-slate-400">
                                    Sudah punya akun?{' '}
                                    <Link href={route('login')} className="font-bold text-indigo-400 hover:text-indigo-300 transition-colors">
                                        Masuk
                                    </Link>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
