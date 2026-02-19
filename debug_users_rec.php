<?php

use App\Models\User;
use App\Models\RecurringTransaction;

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$users = User::all();
foreach ($users as $u) {
    $count = RecurringTransaction::where('user_id', $u->id)->count();
    $activeCount = RecurringTransaction::where('user_id', $u->id)->active()->count();
    echo "User ID: {$u->id}, Name: {$u->name}, Email: {$u->email}, Total: {$count}, Active: {$activeCount}\n";
}
