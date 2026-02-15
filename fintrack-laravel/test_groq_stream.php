<?php

// Manually read .env to get key without booting Laravel
$envFile = __DIR__ . '/.env';
$lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
$apiKey = '';
foreach ($lines as $line) {
    if (strpos($line, 'GROQ_API_KEY=') === 0) {
        $apiKey = trim(explode('=', $line, 2)[1]);
        // cleanup quotes if any
        $apiKey = trim($apiKey, '"\'');
        break;
    }
}

if (!$apiKey) {
    die("Error: GROQ_API_KEY not found in .env\n");
}

$url = 'https://api.groq.com/openai/v1/chat/completions';

echo "Testing Groq API using stream_context (No cURL / IPv4 forced)...\n";
echo "Key Prefix: " . substr($apiKey, 0, 5) . "...\n";

$data = [
    'model' => 'llama3-70b-8192',
    'messages' => [
        ['role' => 'user', 'content' => 'Say Hello']
    ]
];

$options = [
    'http' => [
        'header'  => "Content-type: application/json\r\nAuthorization: Bearer $apiKey\r\nConnection: close\r\n",
        'method'  => 'POST',
        'content' => json_encode($data),
        'ignore_errors' => true,
        'timeout' => 15
    ],
    'ssl' => [
        'verify_peer' => false,
        'verify_peer_name' => false
    ],
    'socket' => [ 
        'bindto' => '0:0' // Force IPv4
    ]
];

$context  = stream_context_create($options);
$result = @file_get_contents($url, false, $context);

if ($result === FALSE) {
    $error = error_get_last();
    echo "FAILED! Error: " . $error['message'] . "\n";
} else {
    echo "SUCCESS! Response (First 100 chars):\n" . substr($result, 0, 100) . "...\n";
}
