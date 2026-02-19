<?php

use App\Models\User;
use App\Models\RecurringTransaction;
use App\Models\Wallet;

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$user = User::first(); // User ID 1
$wallet = Wallet::where('user_id', $user->id)->first();

if (!$wallet) {
    echo "Creating wallet for User {$user->id}...\n";
    $wallet = Wallet::create([
        'user_id' => $user->id,
        'name' => 'Cash',
        'balance' => 1000000,
        'color' => '#10B981', // Emerald 500
    ]);
    echo "Created Wallet ID: {$wallet->id}\n";
}
else {
    echo "Wallet exists: ID {$wallet->id}\n";
}

$t = RecurringTransaction::create([
    'user_id' => $user->id,
    'name' => 'Netflix Premium',
    'amount' => 186000,
    'wallet_id' => $wallet->id,
    'type' => 'EXPENSE',
    'category' => 'Entertainment',
    'frequency' => 'MONTHLY',
    'start_date' => now(),
    'next_run_date' => now()->addDays(5),
    'auto_cut' => false,
    'is_active' => true,
    'description' => 'Test Transaction',
]);

echo "Created Recurring Transaction ID: {$t->id} for User {$user->id}\n";
