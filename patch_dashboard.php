<?php
$file = __DIR__ . '/app/Http/Controllers/DashboardController.php';
$content = file_get_contents($file);

// Check if upcomingRecurring is already in the Inertia render
if (strpos($content, "'upcomingRecurring'") !== false) {
    echo "upcomingRecurring already exists in Inertia render. Skipping.\n";
}
else {
    // Add upcomingRecurring after upcomingBills in the Inertia render
    $search = "'upcomingBills' => \$upcomingBills,";
    $replace = "'upcomingBills' => \$upcomingBills,\n            'upcomingRecurring' => \$upcomingRecurring,";
    $content = str_replace($search, $replace, $content);
    file_put_contents($file, $content);
    echo "Added upcomingRecurring to Inertia render.\n";
}

// Verify
$content = file_get_contents($file);
$count = substr_count($content, 'upcomingRecurring');
echo "Total 'upcomingRecurring' occurrences in file: $count\n";
