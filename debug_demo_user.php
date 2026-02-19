<?php
try {
    // Find Demo User
    $user = App\Models\User::where('email', 'user@fintrack.com')->first();

    if (!$user) {
        echo "Demo User not found. Falling back to first user.\n";
        $user = App\Models\User::first();
    }

    echo "Testing for User: " . $user->name . " (ID: " . $user->id . ")\n";

    // Check Categories
    $categories = App\Models\Category::userCategories($user->id)->get();
    echo "Total Categories Found: " . $categories->count() . "\n";

    // Check Default Categories specifically
    $defaultCounts = App\Models\Category::where('is_default', true)->count();
    echo "Total Default Categories in DB: " . $defaultCounts . "\n";

    // Check if user sees default categories
    $userDefaults = $categories->where('is_default', true)->count();
    echo "User sees Default Categories: " . $userDefaults . "\n";

    // Check types present
    $types = $categories->pluck('type')->unique();
    echo "Types found: " . $types->implode(', ') . "\n";

}
catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
