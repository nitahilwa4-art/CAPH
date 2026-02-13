<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Transaction;
use App\Models\SystemLog;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;

class AdminDashboardController extends Controller
{
    public function index(Request $request)
    {
        $totalUsers = User::count();
        $activeUsers = User::where('status', 'ACTIVE')->count();
        $suspendedUsers = User::where('status', 'SUSPENDED')->count();
        $totalTransactions = Transaction::count();

        // This month stats
        $start = Carbon::now()->startOfMonth();
        $end = Carbon::now()->endOfMonth();

        $newUsersThisMonth = User::where('created_at', '>=', $start)->count();
        $transactionsThisMonth = Transaction::where('created_at', '>=', $start)->count();

        // Flagged transactions
        $flaggedTransactions = Transaction::where('is_flagged', true)
            ->with('user')
            ->orderBy('created_at', 'desc')
            ->take(10)
            ->get()
            ->map(fn($t) => [
                'id' => $t->id,
                'user_name' => $t->user->name ?? 'Unknown',
                'description' => $t->description,
                'amount' => $t->amount,
                'type' => $t->type,
                'date' => $t->date->format('Y-m-d'),
            ]);

        // Recent logs
        $recentLogs = SystemLog::with('admin')
            ->orderBy('created_at', 'desc')
            ->take(10)
            ->get()
            ->map(fn($log) => [
                'id' => $log->id,
                'admin_name' => $log->admin->name ?? 'System',
                'action' => $log->action,
                'target' => $log->target,
                'details' => $log->details,
                'created_at' => $log->created_at->format('d M Y H:i'),
            ]);

        return Inertia::render('Admin/Dashboard', [
            'tab' => 'overview',
            'stats' => [
                'totalUsers' => $totalUsers,
                'activeUsers' => $activeUsers,
                'suspendedUsers' => $suspendedUsers,
                'totalTransactions' => $totalTransactions,
                'newUsersThisMonth' => $newUsersThisMonth,
                'transactionsThisMonth' => $transactionsThisMonth,
            ],
            'flaggedTransactions' => $flaggedTransactions,
            'recentLogs' => $recentLogs,
        ]);
    }
}
