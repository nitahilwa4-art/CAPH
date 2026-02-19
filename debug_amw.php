<?php

use App\Models\User;
use App\Models\RecurringTransaction;

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

// Find user by name like 'amw'
$user = User::where('name', 'LIKE', '%amw%')->orWhere('email', 'LIKE', '%amw%')->first();

if (!$user) {
    echo "User 'amw' not found.\n";
    exit;
}

echo "Found User: ID {$user->id}, Name: {$user->name}, Email: {$user->email}\n";

$transactions = RecurringTransaction::where('user_id', $user->id)->get();
echo "Total Recurring Transactions: " . $transactions->count() . "\n";

foreach ($transactions as $t) {
    echo "- ID: {$t->id}, Name: {$t->name}, Active: " . ($t->is_active ? 'YES' : 'NO') . ", Next Run: {$t->next_run_date}\n";
    if ($t->next_run_date < now()) {
        echo "  [WARNING] Next run date is in the past.\n";
    }
}

// Check what the dashboard query would return
$dashboardQuery = RecurringTransaction::where('user_id', $user->id)
    ->active()
    ->orderBy('next_run_date', 'asc')
    ->take(5)
    ->get();


echo "Dashboard Query Result Count: " . $dashboardQuery->count() . "\n";
