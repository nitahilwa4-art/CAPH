<?php
// Bootstrap Laravel
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Category;
use App\Models\User;

$user = User::first();
if (!$user)
    exit("No user found.\n");

echo "User ID: " . $user->id . "\n";

// SIMULATE DEBT CONTROLLER LOGIC (New)
$categories = Category::userCategories($user->id)->get();
echo "Total Categories (Fixed Logic): " . $categories->count() . "\n";
echo "Default Categories: " . $categories->where('is_default', true)->count() . "\n";

if ($categories->where('is_default', true)->count() > 0) {
    echo "SUCCESS: Default categories are now included.\n";
}
else {
    echo "FAILURE: Still no default categories.\n";
}
