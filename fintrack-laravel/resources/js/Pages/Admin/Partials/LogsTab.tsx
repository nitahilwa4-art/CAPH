import {
    Activity, Shield, ShieldOff, UserMinus, FileText
} from 'lucide-react';

interface LogEntry {
    id: number;
    admin_name: string;
    action: string;
    target: string;
    details: any;
    created_at: string;
}

const actionConfig: Record<string, { label: string; color: string; icon: typeof Activity }> = {
    SUSPEND_USER: { label: 'Suspend User', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', icon: ShieldOff },
    ACTIVATE_USER: { label: 'Aktifkan User', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', icon: Shield },
    DELETE_USER: { label: 'Hapus User', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: UserMinus },
};

export default function LogsTab({ logs }: { logs: { data: LogEntry[] } }) {
    return (
        <div className="space-y-4 animate-fade-in-up">
            {/* Log Entries */}
            {logs.data.length > 0 ? logs.data.map((log, idx) => {
                const config = actionConfig[log.action] || { label: log.action, color: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400', icon: Activity };
                const IconComponent = config.icon;
                return (
                    <div key={log.id} className="glass-card rounded-2xl p-4 flex items-center justify-between hover:shadow-lg transition-all duration-300 animate-fade-in-up" style={{ animationDelay: `${idx * 50}ms` }}>
                        <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${config.color}`}>
                                <IconComponent className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <p className="text-sm font-bold text-slate-800 dark:text-white">{config.label}</p>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${config.color}`}>{log.action}</span>
                                </div>
                                <p className="text-[10px] text-slate-400 mt-0.5">
                                    oleh <span className="font-bold text-slate-500">{log.admin_name}</span> → <span className="font-bold text-slate-500">{log.target}</span>
                                </p>
                            </div>
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full whitespace-nowrap">
                            {log.created_at}
                        </span>
                    </div>
                );
            }) : (
                <div className="glass-card rounded-[2rem] p-16 text-center">
                    <FileText className="w-16 h-16 text-slate-200 dark:text-slate-700 mx-auto mb-4" />
                    <p className="text-lg font-bold text-slate-400">Belum ada log aktivitas</p>
                </div>
            )}
        </div>
    );
}
