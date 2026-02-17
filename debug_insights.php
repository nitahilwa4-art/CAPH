<?php

require __DIR__ . '/vendor/autoload.php';

$app = require __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(\Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Services\GeminiService;
use App\Models\User;
use App\Models\Transaction;

echo "Debugging Insights Generation...\n";

// Assume User ID 1 (or find first user)
$user = User::first();
if (!$user) die("No user found.\n");

echo "User: " . $user->name . " (ID: $user->id)\n";

$transactions = Transaction::forUser($user->id)
    ->orderBy('date', 'desc')
    ->take(100)
    ->get();

echo "Transactions count: " . $transactions->count() . "\n";

if ($transactions->isEmpty()) {
    die("No transactions to analyze.\n");
}

try {
    $service = new GeminiService();
    $advice = $service->getFinancialAdvice($user, $transactions);
    
    echo "Advice Length: " . strlen($advice) . "\n";
    echo "Advice Preview:\n" . substr($advice, 0, 200) . "...\n";
    
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
