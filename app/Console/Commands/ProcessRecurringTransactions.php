<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\RecurringTransaction;
use App\Services\TransactionService;
use Illuminate\Support\Carbon;

class ProcessRecurringTransactions extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'recurring:process';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Process recurring transactions that are due today (auto-cut only)';

    /**
     * Execute the console command.
     */
    public function handle(TransactionService $transactionService)
    {
        $this->info('Starting recurring transaction processing...');

        $dueTransactions = RecurringTransaction::where('next_run_date', '<=', now())
            ->where('is_active', true)
            ->where('auto_cut', true)
            ->get();

        $count = $dueTransactions->count();
        $this->info("Found {$count} transactions due for processing.");

        foreach ($dueTransactions as $recurring) {
            try {
                $this->info("Processing: {$recurring->name} ({$recurring->amount})");

                // Create Transaction
                $transactionService->createTransactions(
                [[
                        'wallet_id' => $recurring->wallet_id,
                        'amount' => $recurring->amount,
                        'type' => $recurring->type,
                        'category' => $recurring->category,
                        'description' => $recurring->name . ' (Auto Recurring)',
                        'date' => now()->format('Y-m-d'),
                    ]],
                    $recurring->user_id,
                    $recurring->wallet_id
                );

                // Update Next Run Date
                $recurring->next_run_date = $recurring->calculateNextRunDate();
                $recurring->save();

                $this->info("Success: {$recurring->name} processed.");
            }
            catch (\Exception $e) {
                $this->error("Failed to process {$recurring->name}: " . $e->getMessage());
            }
        }

        $this->info('Recurring transaction processing completed.');
    }
}
