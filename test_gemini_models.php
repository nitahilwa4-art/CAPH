<?php

require __DIR__ . '/vendor/autoload.php';

$apiKey = 'AIzaSyDOq73KTNmrborHbnJLpHBImZKbAp_U788';
$url = "https://generativelanguage.googleapis.com/v1beta/models?key={$apiKey}";

$options = [
    'http' => [
        'method' => 'GET',
        'ignore_errors' => true,
    ],
    'ssl' => [
        'verify_peer' => false,
        'verify_peer_name' => false,
    ],
];

$context = stream_context_create($options);
$response = file_get_contents($url, false, $context);
$data = json_decode($response, true);

if (isset($data['models'])) {
    $output = "";
    foreach ($data['models'] as $model) {
        $output .= $model['name'] . "\n";
    }
    file_put_contents('models_list.txt', $output);
    echo "Models saved to models_list.txt";
}
else {
    echo "Error: " . json_encode($data, JSON_PRETTY_PRINT);
}
