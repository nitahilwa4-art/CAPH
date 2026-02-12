<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SystemLog;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SystemLogController extends Controller
{
    public function index(Request $request)
    {
        $query = SystemLog::with('admin')->orderBy('created_at', 'desc');

        if ($request->filled('action')) {
            $query->where('action', $request->action);
        }

        if ($request->filled('admin_id')) {
            $query->where('admin_id', $request->admin_id);
        }

        if ($request->filled('date_from')) {
            $query->where('created_at', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->where('created_at', '<=', $request->date_to . ' 23:59:59');
        }

        $logs = $query->paginate(30);

        // Transform admin relationship
        $logs->getCollection()->transform(function ($log) {
            return [
                'id' => $log->id,
                'admin_name' => $log->admin->name ?? 'System',
                'action' => $log->action,
                'target' => $log->target,
                'details' => $log->details,
                'created_at' => $log->created_at->format('d M Y H:i:s'),
            ];
        });

        return Inertia::render('Admin/Logs/Index', [
            'logs' => $logs,
            'filters' => $request->only(['action', 'admin_id', 'date_from', 'date_to']),
        ]);
    }
}
