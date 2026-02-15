<?php

declare(strict_types=1);

namespace App\Exports;

use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithColumnFormatting;
use PhpOffice\PhpSpreadsheet\Style\NumberFormat;

class TransactionsSheet implements FromCollection, WithTitle, WithHeadings, WithMapping, WithColumnFormatting
{
    public function __construct(
        protected Collection $transactions
    ) {}

    public function collection(): Collection
    {
        return $this->transactions;
    }

    public function title(): string
    {
        return 'Data Transaksi';
    }

    public function headings(): array
    {
        return [
            'Tanggal',
            'Jam',
            'Tipe',
            'Kategori',
            'Deskripsi',
            'Jumlah',
            'Dompet',
            'Tags',
        ];
    }

    /**
     * @param \App\Models\Transaction $tx
     */
    public function map($tx): array
    {
        $typeMap = [
            'INCOME' => 'Pemasukan',
            'EXPENSE' => 'Pengeluaran',
            'TRANSFER' => 'Transfer',
        ];

        return [
            $tx->date->format('Y-m-d'),
            $tx->created_at->format('H:i'),
            $typeMap[$tx->type] ?? $tx->type,
            $tx->category,
            $tx->description,
            (float) $tx->amount,
            $tx->wallet?->name ?? '-',
            $tx->tags->pluck('name')->implode(', ') ?: '-',
        ];
    }

    public function columnFormats(): array
    {
        return [
            'F' => NumberFormat::FORMAT_NUMBER_COMMA_SEPARATED1,
        ];
    }
}
