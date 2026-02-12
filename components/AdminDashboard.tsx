
import React, { useState, useMemo } from 'react';
import { Transaction } from '../types';
import { Users, DollarSign, Activity, Shield, Database, LayoutList, FileText, AlertTriangle, ArrowUpRight, ArrowDownRight, TrendingUp } from 'lucide-react';
import { getUsers } from '../services/authService';
import AdminUsers from './AdminUsers';
import AdminTransactions from './AdminTransactions';
import AdminMasterData from './AdminMasterData';
import AdminLogs from './AdminLogs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface AdminDashboardProps {
  allTransactions: Transaction[];
  onRefresh: () => void;
}

type AdminTab = 'OVERVIEW' | 'USERS' | 'TRANSACTIONS' | 'MASTER' | 'LOGS';

const AdminDashboard: React.FC<AdminDashboardProps> = ({ allTransactions, onRefresh }) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('OVERVIEW');
  const users = getUsers();
  
  // Calculate System Volume (Total money moved)
  const totalSystemVolume = allTransactions.reduce((acc, t) => acc + t.amount, 0);
  
  // Calculate Flagged Transactions (e.g., > 100jt)
  const highValueTransactions = allTransactions.filter(t => t.amount > 100000000).length;
  const suspendedUsers = users.filter(u => u.status === 'SUSPENDED').length;

  // Chart Data: Last 7 Days System Activity
  const chartData = useMemo(() => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayLabel = d.toLocaleDateString('id-ID', { weekday: 'short' });

      const dayTx = allTransactions.filter(t => t.date === dateStr);
      const income = dayTx.filter(t => t.type === 'INCOME').reduce((acc, t) => acc + t.amount, 0);
      const expense = dayTx.filter(t => t.type === 'EXPENSE').reduce((acc, t) => acc + t.amount, 0);

      data.push({
        name: dayLabel,
        Masuk: income,
        Keluar: expense
      });
    }
    return data;
  }, [allTransactions]);

  const TabButton = ({ id, label, icon: Icon }: { id: AdminTab, label: string, icon: any }) => (
    <button 
      onClick={() => setActiveTab(id)}
      className={`flex items-center px-4 py-2.5 text-sm font-bold rounded-xl transition-all duration-300 ${
        activeTab === id 
        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 translate-y-[-1px]' 
        : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400'
      }`}
    >
      <Icon className="w-4 h-4 mr-2" />
      {label}
    </button>
  );

  const formatCompact = (num: number) => new Intl.NumberFormat('id-ID', { notation: 'compact', compactDisplay: 'short' }).format(num);

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center">
            <Shield className="w-6 h-6 mr-2 text-indigo-600 dark:text-indigo-400" />
            System Administrator
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Monitoring & Management Center</p>
        </div>
        
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 bg-white dark:bg-slate-900 p-1.5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 w-full md:w-auto overflow-x-auto scrollbar-hide">
          <TabButton id="OVERVIEW" label="Overview" icon={Activity} />
          <TabButton id="USERS" label="Users" icon={Users} />
          <TabButton id="TRANSACTIONS" label="Monitoring" icon={LayoutList} />
          <TabButton id="MASTER" label="Master Data" icon={Database} />
          <TabButton id="LOGS" label="Logs" icon={FileText} />
        </div>
      </div>
      
      {/* Dynamic Content */}
      <div className="animate-fade-in-up">
        {activeTab === 'OVERVIEW' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Total Users */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-[1.5rem] shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col justify-between group hover:border-indigo-200 dark:hover:border-indigo-800 transition-all">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-2xl">
                    <Users className="w-6 h-6" />
                  </div>
                  <span className="flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-lg">
                    <TrendingUp className="w-3 h-3 mr-1" /> +{users.length}
                  </span>
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-slate-800 dark:text-white mb-1">{users.length}</h3>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total User</p>
                </div>
              </div>

              {/* Transaction Volume */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-[1.5rem] shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col justify-between group hover:border-indigo-200 dark:hover:border-indigo-800 transition-all">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-2xl">
                    <Activity className="w-6 h-6" />
                  </div>
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-slate-800 dark:text-white mb-1">{formatCompact(totalSystemVolume)}</h3>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">System Volume (Rp)</p>
                </div>
              </div>

              {/* Total Transactions */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-[1.5rem] shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col justify-between group hover:border-indigo-200 dark:hover:border-indigo-800 transition-all">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-2xl">
                    <FileText className="w-6 h-6" />
                  </div>
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-slate-800 dark:text-white mb-1">{allTransactions.length}</h3>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Transaksi</p>
                </div>
              </div>

              {/* Alert Box */}
              <div className="bg-gradient-to-br from-red-500 to-orange-600 p-6 rounded-[1.5rem] text-white shadow-lg shadow-red-500/20 flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <AlertTriangle className="w-24 h-24" />
                </div>
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <span className="font-bold text-sm">Perlu Perhatian</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="opacity-90">Transaksi Besar</span>
                      <span className="font-bold bg-white/20 px-2 py-0.5 rounded text-xs">{highValueTransactions}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="opacity-90">User Suspended</span>
                      <span className="font-bold bg-white/20 px-2 py-0.5 rounded text-xs">{suspendedUsers}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
               {/* Main Chart */}
               <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h3 className="text-lg font-bold text-slate-800 dark:text-white">Aktivitas Sistem</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Arus kas masuk vs keluar (7 Hari Terakhir)</p>
                    </div>
                    <div className="flex gap-2">
                      <div className="flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1.5 rounded-lg">
                        <ArrowUpRight className="w-3 h-3 mr-1" /> Masuk
                      </div>
                      <div className="flex items-center text-xs font-bold text-red-600 bg-red-50 dark:bg-red-900/20 px-3 py-1.5 rounded-lg">
                        <ArrowDownRight className="w-3 h-3 mr-1" /> Keluar
                      </div>
                    </div>
                  </div>
                  
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:stroke-slate-800" />
                        <XAxis 
                          dataKey="name" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 600}} 
                          dy={10}
                        />
                        <YAxis 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{fill: '#94a3b8', fontSize: 11}} 
                          tickFormatter={(val) => formatCompact(val)}
                        />
                        <Tooltip 
                          cursor={{fill: '#f8fafc', opacity: 0.5}}
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                          formatter={(val: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(val)}
                        />
                        <Bar dataKey="Masuk" fill="#10b981" radius={[4, 4, 0, 0]} barSize={30} />
                        <Bar dataKey="Keluar" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={30} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
               </div>
               
               {/* Quick Actions / Mini Logs */}
               <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 flex flex-col">
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Admin Quick Logs</h3>
                  <div className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-hide max-h-[350px]">
                     {/* Using mock data for visual representation, typically this comes from AdminLogs logic */}
                     {[
                       { action: 'SYSTEM_LOGIN', time: '2m ago', user: 'Admin', type: 'info' },
                       { action: 'UPDATE_USER', time: '15m ago', user: 'Admin', type: 'warn' },
                       { action: 'NEW_USER_REG', time: '1h ago', user: 'System', type: 'success' },
                       { action: 'DB_BACKUP', time: '3h ago', user: 'System', type: 'info' },
                       { action: 'FLAGGED_TX', time: '5h ago', user: 'System', type: 'error' },
                     ].map((log, i) => (
                       <div key={i} className="flex items-start gap-3 p-3 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                          <div className={`w-2 h-2 mt-1.5 rounded-full ${
                            log.type === 'error' ? 'bg-red-500' : 
                            log.type === 'warn' ? 'bg-amber-500' : 
                            log.type === 'success' ? 'bg-emerald-500' : 'bg-blue-500'
                          }`} />
                          <div>
                             <p className="font-bold text-xs text-slate-700 dark:text-slate-200">{log.action}</p>
                             <p className="text-[10px] text-slate-400">by {log.user} • {log.time}</p>
                          </div>
                       </div>
                     ))}
                  </div>
                  <button 
                    onClick={() => setActiveTab('LOGS')} 
                    className="w-full mt-4 py-2.5 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    View All Logs
                  </button>
               </div>
            </div>
          </div>
        )}

        {activeTab === 'USERS' && <AdminUsers onRefresh={onRefresh} allTransactions={allTransactions} />}
        
        {activeTab === 'TRANSACTIONS' && <AdminTransactions allTransactions={allTransactions} />}
        
        {activeTab === 'MASTER' && <AdminMasterData />}
        
        {activeTab === 'LOGS' && <AdminLogs />}
      </div>
    </div>
  );
};

export default AdminDashboard;
