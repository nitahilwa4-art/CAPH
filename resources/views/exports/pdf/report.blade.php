<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>Laporan Keuangan - CAPH.io</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'DejaVu Sans', Arial, Helvetica, sans-serif; font-size: 10px; color: #1e293b; line-height: 1.5; }

        /* Header */
        .header { padding: 24px 32px; border-bottom: 3px solid #6366f1; margin-bottom: 24px; }
        .header-brand { font-size: 22px; font-weight: 700; color: #6366f1; letter-spacing: -0.5px; }
        .header-brand span { color: #a855f7; }
        .header-meta { font-size: 9px; color: #64748b; margin-top: 4px; }
        .header-right { text-align: right; }
        .header-right .user-name { font-size: 12px; font-weight: 700; color: #1e293b; }
        .header-right .period { font-size: 10px; color: #6366f1; font-weight: 600; margin-top: 2px; }
        .header-table { width: 100%; }
        .header-table td { vertical-align: top; }

        /* Summary Cards */
        .cards { width: 100%; margin-bottom: 24px; border-collapse: collapse; }
        .cards td { width: 25%; padding: 4px; }
        .card { padding: 14px 16px; border-radius: 8px; text-align: center; }
        .card-label { font-size: 8px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px; }
        .card-value { font-size: 16px; font-weight: 700; }
        .card-income { background: #ecfdf5; border: 1px solid #a7f3d0; }
        .card-income .card-label { color: #059669; }
        .card-income .card-value { color: #047857; }
        .card-expense { background: #fef2f2; border: 1px solid #fecaca; }
        .card-expense .card-label { color: #dc2626; }
        .card-expense .card-value { color: #b91c1c; }
        .card-net { background: #eff6ff; border: 1px solid #bfdbfe; }
        .card-net .card-label { color: #2563eb; }
        .card-net .card-value { color: #1d4ed8; }
        .card-savings { background: #faf5ff; border: 1px solid #e9d5ff; }
        .card-savings .card-label { color: #7c3aed; }
        .card-savings .card-value { color: #6d28d9; }

        /* Sections */
        .section { margin-bottom: 24px; }
        .section-title { font-size: 12px; font-weight: 700; color: #1e293b; padding-bottom: 6px; border-bottom: 2px solid #e2e8f0; margin-bottom: 12px; }

        /* Top Spending Table */
        .spending-table { width: 100%; border-collapse: collapse; }
        .spending-table th { text-align: left; font-size: 8px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; padding: 6px 8px; border-bottom: 1px solid #e2e8f0; }
        .spending-table td { padding: 8px; border-bottom: 1px solid #f1f5f9; font-size: 10px; }
        .spending-table .rank { font-weight: 700; color: #6366f1; width: 24px; }
        .bar-container { background: #f1f5f9; border-radius: 4px; height: 8px; width: 100%; }
        .bar-fill { background: linear-gradient(90deg, #6366f1, #a855f7); border-radius: 4px; height: 8px; min-width: 4px; }
        .amount-right { text-align: right; font-weight: 600; font-size: 10px; color: #1e293b; }

        /* Transaction List */
        .date-group { margin-bottom: 16px; }
        .date-header { font-size: 10px; font-weight: 700; color: #6366f1; background: #f8fafc; padding: 6px 10px; border-radius: 4px; margin-bottom: 6px; border-left: 3px solid #6366f1; }
        .tx-table { width: 100%; border-collapse: collapse; }
        .tx-table td { padding: 4px 8px; font-size: 9px; border-bottom: 1px solid #f8fafc; vertical-align: top; }
        .tx-time { color: #94a3b8; width: 36px; font-weight: 600; }
        .tx-cat { font-weight: 600; color: #334155; width: 90px; }
        .tx-desc { color: #64748b; }
        .tx-amount { text-align: right; font-weight: 700; white-space: nowrap; }
        .tx-income { color: #059669; }
        .tx-expense { color: #dc2626; }
        .tx-transfer { color: #2563eb; }

        /* Footer */
        .footer { margin-top: 32px; padding-top: 12px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 8px; color: #94a3b8; }

        /* Page break */
        .page-break { page-break-before: always; }
    </style>
</head>
<body>
    {{-- ── Header ── --}}
    <div class="header">
        <table class="header-table">
            <tr>
                <td style="width: 60%;">
                    <div class="header-brand">CAPH<span>.io</span></div>
                    <div class="header-meta">Laporan Keuangan Personal</div>
                </td>
                <td class="header-right">
                    <div class="user-name">{{ $user->name }}</div>
                    <div class="period">{{ $startDate->format('d M Y') }} — {{ $endDate->format('d M Y') }}</div>
                    <div class="header-meta">Dibuat: {{ $generatedAt->format('d M Y H:i') }}</div>
                </td>
            </tr>
        </table>
    </div>

    {{-- ── Summary Cards ── --}}
    <table class="cards">
        <tr>
            <td>
                <div class="card card-income">
                    <div class="card-label">Pemasukan</div>
                    <div class="card-value">Rp {{ number_format($totalIncome, 0, ',', '.') }}</div>
                </div>
            </td>
            <td>
                <div class="card card-expense">
                    <div class="card-label">Pengeluaran</div>
                    <div class="card-value">Rp {{ number_format($totalExpense, 0, ',', '.') }}</div>
                </div>
            </td>
            <td>
                <div class="card card-net">
                    <div class="card-label">Arus Bersih</div>
                    <div class="card-value">Rp {{ number_format($netFlow, 0, ',', '.') }}</div>
                </div>
            </td>
            <td>
                <div class="card card-savings">
                    <div class="card-label">Rasio Tabungan</div>
                    <div class="card-value">{{ $savingsRate }}%</div>
                </div>
            </td>
        </tr>
    </table>

    {{-- ── Top Spending ── --}}
    @if(count($topCategories) > 0)
    <div class="section">
        <div class="section-title">🏷️ Top 5 Kategori Pengeluaran</div>
        <table class="spending-table">
            <thead>
                <tr>
                    <th>#</th>
                    <th>Kategori</th>
                    <th style="width: 40%;">Proporsi</th>
                    <th style="text-align: right;">Jumlah</th>
                </tr>
            </thead>
            <tbody>
                @foreach($topCategories as $i => $cat)
                <tr>
                    <td class="rank">{{ $i + 1 }}</td>
                    <td>{{ $cat['category'] }}</td>
                    <td>
                        <div class="bar-container">
                            <div class="bar-fill" style="width: {{ round($cat['total'] / $maxCategoryTotal * 100) }}%;"></div>
                        </div>
                    </td>
                    <td class="amount-right">Rp {{ number_format($cat['total'], 0, ',', '.') }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>
    </div>
    @endif

    {{-- ── Transaction List ── --}}
    <div class="section">
        <div class="section-title">📋 Rincian Transaksi</div>
        @foreach($groupedByDate as $date => $transactions)
        <div class="date-group">
            <div class="date-header">
                {{ \Carbon\Carbon::parse($date)->translatedFormat('l, d F Y') }}
                <span style="color: #94a3b8; font-weight: 400; margin-left: 8px;">({{ $transactions->count() }} transaksi)</span>
            </div>
            <table class="tx-table">
                @foreach($transactions as $tx)
                <tr>
                    <td class="tx-time">{{ $tx->created_at->format('H:i') }}</td>
                    <td class="tx-cat">{{ $tx->category }}</td>
                    <td class="tx-desc">{{ $tx->description }}</td>
                    <td class="tx-amount {{ $tx->type === 'INCOME' ? 'tx-income' : ($tx->type === 'EXPENSE' ? 'tx-expense' : 'tx-transfer') }}">
                        {{ $tx->type === 'INCOME' ? '+' : ($tx->type === 'EXPENSE' ? '-' : '↔') }}
                        Rp {{ number_format($tx->amount, 0, ',', '.') }}
                    </td>
                </tr>
                @endforeach
            </table>
        </div>
        @endforeach
    </div>

    {{-- ── Footer ── --}}
    <div class="footer">
        Generated by CAPH.io &bull; {{ $generatedAt->format('d M Y H:i') }} &bull; Confidential
    </div>
</body>
</html>
