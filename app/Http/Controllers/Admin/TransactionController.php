<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TransactionController extends Controller
{
    public function index(Request $request)
    {
        $query = Transaction::with(['user', 'wallet', 'toWallet'])
            ->orderBy('date', 'desc');

        // Search by User or Description
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('description', 'like', "%{$search}%")
                  ->orWhereHas('user', function($q) use ($search) {
                      $q->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                  });
            });
        }

        // Filter by Type
        if ($request->filled('type') && in_array($request->type, ['INCOME', 'EXPENSE', 'TRANSFER'])) {
             $query->where('type', $request->type);
        }

        // Filter by Flagged
        if ($request->boolean('flagged')) {
            $query->where('is_flagged', true);
        }

        // Filter by High Value (> 10 Juta)
        if ($request->boolean('high_value')) {
             $query->where('amount', '>=', 10000000);
        }

        $transactions = $query->paginate(20)->withQueryString();

        return Inertia::render('Admin/Dashboard', [
            'tab' => 'transactions',
            'transactions' => $transactions,
            'filters' => $request->only(['search', 'type', 'flagged', 'high_value']),
        ]);
    }
}
