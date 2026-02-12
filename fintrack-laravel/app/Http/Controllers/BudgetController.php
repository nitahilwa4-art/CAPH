<?php

namespace App\Http\Controllers;

use App\Models\Budget;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;

class BudgetController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $budgets = Budget::where('user_id', $user->id)->get();

        // Calculate spent for each budget
        $now = Carbon::now();
        $start = $now->copy()->startOfMonth()->format('Y-m-d');
        $end = $now->copy()->endOfMonth()->format('Y-m-d');

        $expenses = Transaction::forUser($user->id)
            ->byType('EXPENSE')
            ->inDateRange($start, $end)
            ->get()
            ->groupBy('category')
            ->map(fn($group) => $group->sum('amount'));

        $budgetsWithProgress = $budgets->map(function ($budget) use ($expenses) {
            $spent = $expenses->get($budget->category, 0);
            return [
                'id' => $budget->id,
                'category' => $budget->category,
                'limit' => $budget->limit,
                'period' => $budget->period,
                'frequency' => $budget->frequency,
                'spent' => $spent,
                'remaining' => max(0, $budget->limit - $spent),
                'percentage' => $budget->limit > 0 ? min(100, round(($spent / $budget->limit) * 100)) : 0,
            ];
        });

        return Inertia::render('Budgets/Index', [
            'budgets' => $budgetsWithProgress,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'category' => 'required|string|max:255',
            'limit' => 'required|numeric|min:0',
            'period' => 'required|string',
            'frequency' => 'required|in:WEEKLY,MONTHLY,YEARLY',
        ]);

        Budget::create([
            'user_id' => $request->user()->id,
            ...$validated,
        ]);

        return redirect()->back()->with('success', 'Anggaran berhasil ditambahkan');
    }

    public function update(Request $request, Budget $budget)
    {
        if ($budget->user_id !== $request->user()->id) {
            abort(403);
        }

        $validated = $request->validate([
            'category' => 'required|string|max:255',
            'limit' => 'required|numeric|min:0',
            'period' => 'required|string',
            'frequency' => 'required|in:WEEKLY,MONTHLY,YEARLY',
        ]);

        $budget->update($validated);

        return redirect()->back()->with('success', 'Anggaran berhasil diupdate');
    }

    public function destroy(Request $request, Budget $budget)
    {
        if ($budget->user_id !== $request->user()->id) {
            abort(403);
        }

        $budget->delete();

        return redirect()->back()->with('success', 'Anggaran berhasil dihapus');
    }
}
