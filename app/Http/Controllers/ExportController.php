<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Exports\TransactionsExport;
use App\Models\Transaction;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Maatwebsite\Excel\Facades\Excel;

class ExportController extends Controller
{
    /**
     * Preview summary for the export page (AJAX).
     */
    public function preview(Request $request)
    {
        $request->validate([
            'start_date' => 'required|date',
            'end_date'   => 'required|date|after_or_equal:start_date',
            'wallet_id'  => 'nullable|integer|exists:wallets,id',
        ]);

        $user = $request->user();
        $query = Transaction::forUser($user->id)
            ->inDateRange($request->start_date, $request->end_date);

        if ($request->filled('wallet_id')) {
            $query->where('wallet_id', $request->wallet_id);
        }

        $transactions = $query->get();

        $totalIncome  = (float) $transactions->where('type', 'INCOME')->sum('amount');
        $totalExpense = (float) $transactions->where('type', 'EXPENSE')->sum('amount');

        return response()->json([
            'count'   => $transactions->count(),
            'income'  => $totalIncome,
            'expense' => $totalExpense,
            'net'     => $totalIncome - $totalExpense,
        ]);
    }

    /**
     * Download export file (Excel or PDF).
     */
    public function download(Request $request)
    {
        $request->validate([
            'start_date' => 'required|date',
            'end_date'   => 'required|date|after_or_equal:start_date',
            'format'     => 'required|in:excel,pdf',
            'wallet_id'  => 'nullable|integer|exists:wallets,id',
        ]);

        $user = $request->user();
        $startDate = Carbon::parse($request->start_date)->startOfDay();
        $endDate   = Carbon::parse($request->end_date)->endOfDay();

        $baseQuery = Transaction::forUser($user->id)
            ->inDateRange($startDate, $endDate)
            ->with(['wallet', 'tags']);

        if ($request->filled('wallet_id')) {
            $baseQuery->where('wallet_id', $request->wallet_id);
        }

        // Aggregate data for both formats
        $allTransactions = (clone $baseQuery)->orderBy('date', 'desc')->orderBy('created_at', 'desc')->get();

        $totalIncome  = (float) $allTransactions->where('type', 'INCOME')->sum('amount');
        $totalExpense = (float) $allTransactions->where('type', 'EXPENSE')->sum('amount');

        $topCategories = $allTransactions
            ->where('type', 'EXPENSE')
            ->groupBy('category')
            ->map(fn ($group, $cat) => [
                'category' => $cat,
                'total'    => (float) $group->sum('amount'),
            ])
            ->sortByDesc('total')
            ->take(5)
            ->values()
            ->toArray();

        $fileName = "FinTrack_Laporan_{$startDate->format('Ymd')}_{$endDate->format('Ymd')}";

        // ── Excel ────────────────────────────────────────
        if ($request->format === 'excel') {
            return Excel::download(
                new TransactionsExport($allTransactions, $totalIncome, $totalExpense, $topCategories),
                $fileName . '.xlsx'
            );
        }

        // ── PDF ──────────────────────────────────────────
        $netFlow     = $totalIncome - $totalExpense;
        $savingsRate = $totalIncome > 0 ? round($netFlow / $totalIncome * 100, 1) : 0;

        // Group transactions by date
        $groupedByDate = $allTransactions->groupBy(fn ($tx) => $tx->date->format('Y-m-d'));

        // Find the max category total for progress bar scaling
        $maxCategoryTotal = !empty($topCategories) ? $topCategories[0]['total'] : 1;

        $pdf = Pdf::loadView('exports.pdf.report', [
            'user'             => $user,
            'startDate'        => $startDate,
            'endDate'          => $endDate,
            'totalIncome'      => $totalIncome,
            'totalExpense'     => $totalExpense,
            'netFlow'          => $netFlow,
            'savingsRate'      => $savingsRate,
            'topCategories'    => $topCategories,
            'maxCategoryTotal' => $maxCategoryTotal,
            'groupedByDate'    => $groupedByDate,
            'generatedAt'      => now(),
        ]);

        $pdf->setPaper('a4', 'portrait');

        return $pdf->download($fileName . '.pdf');
    }
}
