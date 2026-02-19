<?php

use App\Models\Category;
use App\Models\User;

// Get a user
$user = User::first();

echo "Testing with User ID: " . $user->id . "\n";

// Test the scope
\Illuminate\Support\Facades\DB::enableQueryLog();
$categories = Category::userCategories($user->id)->get();
$log = \Illuminate\Support\Facades\DB::getQueryLog();

echo "SQL Query: " . end($log)['query'] . "\n";
echo "Bindings: " . json_encode(end($log)['bindings']) . "\n";

echo "Total Categories: " . $categories->count() . "\n";

$defaultCats = $categories->where('is_default', true);
echo "Default Categories Count: " . $defaultCats->count() . "\n";

$nullUserCats = $categories->whereNull('user_id');
echo "NULL User_ID Categories Count: " . $nullUserCats->count() . "\n";

if ($defaultCats->count() > 0) {
    echo "SUCCESS: Default categories are being retrieved.\n";
    echo "Sample: " . $defaultCats->first()->name . "\n";
}
else {
    echo "FAILURE: Default categories are MISSING.\n";
}
