<?php

require __DIR__ . '/vendor/autoload.php';

use Illuminate\Support\Facades\Http;

$app = require __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(\Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$apiKey = env('GROQ_API_KEY');
$url = 'https://api.groq.com/openai/v1/chat/completions';

echo "Testing Groq API connection (IPv4 Force, SSL Bypass)...\n";

try {
    $response = Http::withToken($apiKey)
        ->withoutVerifying()
        ->withOptions([
            'ipresolve' => 1, // CRL_IPRESOLVE_V4 = 1
            // 'debug' => true // Uncomment for verbose output
        ])
        ->post($url, [
            'model' => 'llama3-70b-8192',
            'messages' => [
                ['role' => 'user', 'content' => 'Say Hello']
            ]
        ]);

    if ($response->successful()) {
        echo "SUCCESS! Response:\n" . substr($response->body(), 0, 100) . "...\n";
    } else {
        echo "FAILED! Status: " . $response->status() . "\n";
        echo "Check your API Key or Network.\n";
        echo "Body: " . $response->body() . "\n";
    }
} catch (\Exception $e) {
    echo "EXCEPTION: " . $e->getMessage() . "\n";
}
