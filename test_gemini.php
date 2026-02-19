<?php

require __DIR__ . '/vendor/autoload.php';

$app = require __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(\Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Gemini\Laravel\Facades\Gemini;

$candidates = [
    'gemini-3-flash-preview',
    'gemini-3-pro-preview',
    'gemini-experimental'
];

echo "API Key: " . substr(env('GEMINI_API_KEY'), 0, 5) . "...\n";

foreach ($candidates as $model) {
    if ($model !== 'gemini-3-flash-preview')
        continue;

    $log = "Testing $model ... ";
    try {
        $result = Gemini::generativeModel($model)->generateContent('Hi');
        $log .= "SUCCESS!\nResult: " . $result->text() . "\n";
    }
    catch (\Exception $e) {
        $log .= "ERROR: " . $e->getMessage() . "\n";
    }
    file_put_contents('gemini_test_output.txt', $log);
    echo $log;
}
