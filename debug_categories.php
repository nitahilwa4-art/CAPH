<?php

// Bootstrap Laravel
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Category;
use App\Models\User;

$user = User::first();


if (!$user) {
    echo "No user found.\n";
    exit;
}

echo "User ID: " . $user->id . "\n";

// Test Scope
$categories = Category::userCategories($user->id)->get();

echo "Total Categories via Scope: " . $categories->count() . "\n";
echo "Default (is_default=1): " . $categories->where('is_default', true)->count() . "\n";
echo "System (user_id=NULL): " . $categories->whereNull('user_id')->count() . "\n";
echo "User (user_id=" . $user->id . "): " . $categories->where('user_id', $user->id)->count() . "\n";

// Debug first few default categories to check type
echo "\n--- Sample Default Categories ---\n";
foreach ($categories->where('is_default', true)->take(3) as $cat) {
    echo "ID: {$cat->id}, Name: {$cat->name}, Type: {$cat->type}, UserID: " . json_encode($cat->user_id) . "\n";
}

// Check DebtController logic (simulate bug)
$debtCategories = Category::where('user_id', $user->id)->get();
echo "\nTotal Categories via DebtController Logic (Bug): " . $debtCategories->count() . "\n";
