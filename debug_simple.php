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

$categories = Category::userCategories($user->id)->get();
$defaultCount = $categories->where('is_default', true)->count();
$systemCount = $categories->whereNull('user_id')->count();

echo "User ID: " . $user->id . "\n";
echo "Total Categories: " . $categories->count() . "\n";
echo "Default Categories: " . $defaultCount . "\n";
echo "System Categories: " . $systemCount . "\n";

if ($defaultCount > 0 || $systemCount > 0) {
    echo "SUCCESS: Default categories found.\n";
}
else {
    echo "FAILURE: Default categories NOT found.\n";
}
