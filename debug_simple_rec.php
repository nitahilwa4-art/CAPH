<?php

use App\Models\User;
use App\Models\RecurringTransaction;

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$t = RecurringTransaction::first();
if ($t) {
    echo "Found ID: " . $t->id . "\n";
    echo "User ID: " . $t->user_id . "\n";
    echo "Active: " . ($t->is_active ? 'YES' : 'NO') . "\n";
    echo "Next Run: " . $t->next_run_date . "\n";
}
else {
    echo "No transactions found.\n";
}
