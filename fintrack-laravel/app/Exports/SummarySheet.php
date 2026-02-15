<?php

declare(strict_types=1);

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class SummarySheet implements FromArray, WithTitle, WithStyles
{
    public function __construct(
        protected float $totalIncome,
        protected float $totalExpense,
        protected array $topCategories
    ) {}

    public function title(): string
    {
        return 'Ringkasan';
    }

    public function array(): array
    {
        $rows = [];

        // Summary header
        $rows[] = ['Ringkasan Keuangan'];
        $rows[] = [];
        $rows[] = ['Total Pemasukan', $this->totalIncome];
        $rows[] = ['Total Pengeluaran', $this->totalExpense];
        $rows[] = ['Arus Bersih (Net Flow)', $this->totalIncome - $this->totalExpense];
        $savingsRate = $this->totalIncome > 0
            ? round(($this->totalIncome - $this->totalExpense) / $this->totalIncome * 100, 1)
            : 0;
        $rows[] = ['Rasio Tabungan (%)', $savingsRate . '%'];
        $rows[] = [];

        // Top 5 categories
        $rows[] = ['Top 5 Kategori Pengeluaran'];
        $rows[] = ['Kategori', 'Total'];
        foreach ($this->topCategories as $cat) {
            $rows[] = [$cat['category'], $cat['total']];
        }

        return $rows;
    }

    public function styles(Worksheet $sheet): array
    {
        return [
            1 => ['font' => ['bold' => true, 'size' => 14]],
            3 => ['font' => ['bold' => true]],
            4 => ['font' => ['bold' => true]],
            5 => ['font' => ['bold' => true]],
            6 => ['font' => ['bold' => true]],
            8 => ['font' => ['bold' => true, 'size' => 12]],
            9 => ['font' => ['bold' => true]],
        ];
    }
}
