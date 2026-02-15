<?php

declare(strict_types=1);

namespace App\Exports;

use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\WithMultipleSheets;
use Maatwebsite\Excel\Concerns\Exportable;

class TransactionsExport implements WithMultipleSheets
{
    use Exportable;

    public function __construct(
        protected Collection $transactions,
        protected float $totalIncome,
        protected float $totalExpense,
        protected array $topCategories
    ) {}

    public function sheets(): array
    {
        return [
            new TransactionsSheet($this->transactions),
            new SummarySheet($this->totalIncome, $this->totalExpense, $this->topCategories),
        ];
    }
}
