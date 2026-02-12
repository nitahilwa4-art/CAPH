<?php

namespace App\Services;

use App\Models\Transaction;
use App\Models\Wallet;
use App\Models\Budget;
use App\Models\Debt;
use App\Models\User;
use Illuminate\Support\Collection;
use Illuminate\Support\Carbon;

class DashboardService
{
    /**
     * Get dashboard stats for a user in a given date range
     */
    public function getStats(User $user, string $startDate, string $endDate): array
    {
        $transactions = Transaction::forUser($user->id)
            ->inDateRange($startDate, $endDate)
            ->get();

        $totalIncome = $transactions->where('type', 'INCOME')->sum('amount');
        $totalExpense = $transactions->where('type', 'EXPENSE')->sum('amount');
        $balance = Wallet::where('user_id', $user->id)->sum('balance');

        // Expense by category
        $expenseByCategory = $transactions
            ->where('type', 'EXPENSE')
            ->groupBy('category')
            ->map(fn($group) => $group->sum('amount'))
            ->sortDesc()
            ->toArray();

        // Daily spending trend
        $dailyTrend = $transactions
            ->groupBy(fn($t) => $t->date->format('Y-m-d'))
            ->map(function ($dayTransactions) {
                return [
                    'income' => $dayTransactions->where('type', 'INCOME')->sum('amount'),
                    'expense' => $dayTransactions->where('type', 'EXPENSE')->sum('amount'),
                ];
            })
            ->toArray();

        return [
            'totalIncome' => $totalIncome,
            'totalExpense' => $totalExpense,
            'balance' => $balance,
            'netFlow' => $totalIncome - $totalExpense,
            'expenseByCategory' => $expenseByCategory,
            'dailyTrend' => $dailyTrend,
            'transactionCount' => $transactions->count(),
        ];
    }

    /**
     * Get budget progress for current period
     */
    public function getBudgetProgress(User $user, string $period): array
    {
        $budgets = Budget::where('user_id', $user->id)->get();

        // Determine date range for period
        $now = Carbon::now();
        if ($period === 'MONTHLY') {
            $start = $now->copy()->startOfMonth()->format('Y-m-d');
            $end = $now->copy()->endOfMonth()->format('Y-m-d');
        } elseif ($period === 'WEEKLY') {
            $start = $now->copy()->startOfWeek()->format('Y-m-d');
            $end = $now->copy()->endOfWeek()->format('Y-m-d');
        } else {
            $start = $now->copy()->startOfYear()->format('Y-m-d');
            $end = $now->copy()->endOfYear()->format('Y-m-d');
        }

        // Get expenses grouped by category
        $expenses = Transaction::forUser($user->id)
            ->byType('EXPENSE')
            ->inDateRange($start, $end)
            ->get()
            ->groupBy('category')
            ->map(fn($group) => $group->sum('amount'));

        return $budgets->map(function ($budget) use ($expenses) {
            $spent = $expenses->get($budget->category, 0);
            $percentage = $budget->limit > 0 ? round(($spent / $budget->limit) * 100) : 0;

            return [
                'id' => $budget->id,
                'category' => $budget->category,
                'limit' => $budget->limit,
                'spent' => $spent,
                'remaining' => max(0, $budget->limit - $spent),
                'percentage' => min(100, $percentage),
                'isOverBudget' => $spent > $budget->limit,
            ];
        })->toArray();
    }

    /**
     * Get upcoming bills/debts
     */
    public function getUpcomingBills(User $user, int $limit = 5): Collection
    {
        return Debt::where('user_id', $user->id)
            ->upcoming()
            ->take($limit)
            ->get();
    }
}
