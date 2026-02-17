
try {
    $user = App\Models\User::first();
    if (!$user) {
        $user = App\Models\User::factory()->create();
    }

    echo "Using User ID: " . $user->id . PHP_EOL;

    $vehicle = App\Models\Asset::create([
        'user_id' => $user->id,
        'name' => 'Test Vehicle',
        'value' => 50000000,
        'type' => 'VEHICLE'
    ]);
    echo "SUCCESS: Created asset with type VEHICLE. ID: " . $vehicle->id . PHP_EOL;
    $vehicle->delete();

    $investment = App\Models\Asset::create([
        'user_id' => $user->id,
        'name' => 'Test Investment',
        'value' => 1000000,
        'type' => 'INVESTMENT'
    ]);
    echo "SUCCESS: Created asset with type INVESTMENT. ID: " . $investment->id . PHP_EOL;
    $investment->delete();

}
catch (\Exception $e) {
    echo "ERROR: " . $e->getMessage() . PHP_EOL;
}
