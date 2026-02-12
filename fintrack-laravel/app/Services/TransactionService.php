<?php

namespace App\Services;

use App\Models\Transaction;
use App\Models\Wallet;
use Illuminate\Support\Facades\DB;

class TransactionService
{
    /**
     * Create multiple transactions with wallet balance updates
     */
    public function createTransactions(array $transactions, int $userId, int $walletId): void
    {
        DB::transaction(function () use ($transactions, $userId, $walletId) {
            foreach ($transactions as $data) {
                $transaction = Transaction::create([
                    'user_id' => $userId,
                    'wallet_id' => $data['wallet_id'] ?? $walletId,
                    'to_wallet_id' => $data['to_wallet_id'] ?? null,
                    'date' => $data['date'],
                    'description' => $data['description'],
                    'amount' => $data['amount'],
                    'type' => $data['type'],
                    'category' => $data['category'],
                ]);

                // Update wallet balance
                $this->updateWalletBalance($transaction);
            }
        });
    }

    /**
     * Update transaction and adjust wallet balances
     */
    public function updateTransaction(Transaction $transaction, array $data): void
    {
        DB::transaction(function () use ($transaction, $data) {
            // Revert old transaction balance
            $this->revertWalletBalance($transaction);

            // Update transaction
            $transaction->update($data);

            // Apply new balance
            $this->updateWalletBalance($transaction);
        });
    }

    /**
     * Delete transaction and revert wallet balance
     */
    public function deleteTransaction(Transaction $transaction): void
    {
        DB::transaction(function () use ($transaction) {
            $this->revertWalletBalance($transaction);
            $transaction->delete();
        });
    }

    /**
     * Update wallet balance based on transaction
     */
    protected function updateWalletBalance(Transaction $transaction): void
    {
        $wallet = Wallet::find($transaction->wallet_id);
        
        if (!$wallet) return;

        if ($transaction->type === 'INCOME') {
            $wallet->increment('balance', $transaction->amount);
        } elseif ($transaction->type === 'EXPENSE') {
            $wallet->decrement('balance', $transaction->amount);
        } elseif ($transaction->type === 'TRANSFER' && $transaction->to_wallet_id) {
            // Deduct from source wallet
            $wallet->decrement('balance', $transaction->amount);
            
            // Add to destination wallet
            $toWallet = Wallet::find($transaction->to_wallet_id);
            if ($toWallet) {
                $toWallet->increment('balance', $transaction->amount);
            }
        }
    }

    /**
     * Revert wallet balance changes
     */
    protected function revertWalletBalance(Transaction $transaction): void
    {
        $wallet = Wallet::find($transaction->wallet_id);
        
        if (!$wallet) return;

        if ($transaction->type === 'INCOME') {
            $wallet->decrement('balance', $transaction->amount);
        } elseif ($transaction->type === 'EXPENSE') {
            $wallet->increment('balance', $transaction->amount);
        } elseif ($transaction->type === 'TRANSFER' && $transaction->to_wallet_id) {
            // Revert source wallet
            $wallet->increment('balance', $transaction->amount);
            
            // Revert destination wallet
            $toWallet = Wallet::find($transaction->to_wallet_id);
            if ($toWallet) {
                $toWallet->decrement('balance', $transaction->amount);
            }
        }
    }
}
