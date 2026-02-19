<?php

use App\Models\User;
use App\Models\RecurringTransaction;

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$user = User::first(); // Assuming testing with the first user
echo "User ID: " . $user->id . "\n";

echo "All Recurring Transactions:\n";
$all = RecurringTransaction::where('user_id', $user->id)->get();
echo $all->count() . " found.\n";
foreach ($all as $t) {
    echo "- ID: {$t->id}, Name: {$t->name}, Active: {$t->is_active}, Next Run: {$t->next_run_date}\n";
}

echo "\nActive Scope Test:\n";
$active = RecurringTransaction::where('user_id', $user->id)->active()->get();
echo $active->count() . " active found.\n";

echo "\nDashboard Query Test:\n";
$dashboard = RecurringTransaction::where('user_id', $user->id)
    ->active()
    ->orderBy('next_run_date', 'asc')
    ->take(5)
    ->get();
echo $dashboard->count() . " returned for dashboard.\n";
