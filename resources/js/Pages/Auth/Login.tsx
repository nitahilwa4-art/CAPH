import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { Wallet, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

export default function Login({
    status,
    canResetPassword,
}: {
    status?: string;
    canResetPassword: boolean;
}) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false as boolean,
    });

    const [showPassword, setShowPassword] = useState(false);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <>
            <Head title="Login - CAPH.io" />
            <div className="min-h-screen flex bg-slate-950 relative overflow-hidden">
                {/* Background Elements */}
                <div className="absolute inset-0">
                    <div className="absolute top-1/4 -left-32 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl animate-pulse" />
                    <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-3xl" />
                </div>

                {/* Left Panel - Branding */}
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
                            {/* Kelola Keuangan Anda dengan <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">AI</span> */}
                        </h2>
                        <p className="text-lg text-slate-400 mb-8">

                        </p>

                        <div className="space-y-4">

                        </div>
                    </div>
                </div>

                {/* Right Panel - Login Form */}
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
                                <h2 className="text-2xl font-bold text-white">Selamat Datang! 👋</h2>
                                <p className="text-slate-400 text-sm mt-1">Masuk ke akun CAPH.io Anda</p>
                            </div>

                            {status && (
                                <div className="mb-4 p-3 rounded-xl bg-emerald-900/30 border border-emerald-800/50 text-emerald-400 text-sm">
                                    {status}
                                </div>
                            )}

                            <form onSubmit={submit} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
                                    <input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        autoComplete="username"
                                        autoFocus
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
                                            id="password"
                                            type={showPassword ? 'text' : 'password'}
                                            value={data.password}
                                            autoComplete="current-password"
                                            onChange={(e) => setData('password', e.target.value)}
                                            placeholder="••••••••"
                                            className="w-full px-4 py-3 pr-12 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                        />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors">
                                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                    {errors.password && <p className="mt-1.5 text-sm text-red-400">{errors.password}</p>}
                                </div>

                                <div className="flex items-center justify-between">
                                    <label className="flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={data.remember}
                                            onChange={(e) => setData('remember', e.target.checked)}
                                            className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-0"
                                        />
                                        <span className="ml-2 text-sm text-slate-400">Ingat saya</span>
                                    </label>
                                    {canResetPassword && (
                                        <Link href={route('password.request')} className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors">
                                            Lupa Password?
                                        </Link>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl font-bold hover:from-indigo-700 hover:to-violet-700 transition-all shadow-xl shadow-indigo-500/30 disabled:opacity-50 active:scale-[0.98]"
                                >
                                    {processing ? 'Masuk...' : 'Masuk'}
                                </button>
                            </form>

                            <div className="mt-6 text-center">
                                <p className="text-sm text-slate-400">
                                    Belum punya akun?{' '}
                                    <Link href={route('register')} className="font-bold text-indigo-400 hover:text-indigo-300 transition-colors">
                                        Daftar Gratis
                                    </Link>
                                </p>
                            </div>

                            {/* Demo Credentials */}
                            <div className="mt-6 p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                                <p className="text-xs font-bold text-slate-400 mb-2">🔑 Demo Login:</p>
                                <div className="space-y-1 text-xs text-slate-500">
                                    <p><span className="text-violet-400">Admin</span>: admin@fintrack.com / admin123</p>
                                    <p><span className="text-emerald-400">User</span>: user@fintrack.com / user123</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
