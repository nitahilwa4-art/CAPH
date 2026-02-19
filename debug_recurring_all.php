<?php

use App\Models\User;
use App\Models\RecurringTransaction;

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "Checking Users:\n";
$users = User::all();
foreach ($users as $u) {
    echo "- ID: {$u->id}, Name: {$u->name}, Email: {$u->email}\n";
}

echo "\nTotal Recurring Transactions in DB: " . RecurringTransaction::count() . "\n";
if (RecurringTransaction::count() > 0) {
    echo "Sample Transactions:\n";
    foreach (RecurringTransaction::all() as $t) {
        echo "- ID: {$t->id}, UserID: {$t->user_id}, Name: {$t->name}\n";
    }
}
else {
    echo "No recurring transactions found in the entire database.\n";
}
