<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AssetTypeTest extends TestCase
{
    // Do not use RefreshDatabase if you want to test against the current local DB state
    // But usually for tests it's better to use it. However, since I want to verify the MIGRATION on the actual DB,
    // I might just skip RefreshDatabase and manually cleanup, OR rely on the fact that I ran migration on the main DB.
    // Actually, tests usually run on a separate DB (sqlite mostly).
    // If I want to test if *my migration* works, I should run the test. 
    // If the test uses sqlite in memory, it will run migrations from scratch, so it will verify the migration file is correct.

    use RefreshDatabase;

    public function test_can_create_asset_with_vehicle_type()
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->post('/assets', [
            'name' => 'Test Vehicle',
            'value' => 1000000,
            'type' => 'VEHICLE',
        ]);

        $response->assertSessionHasNoErrors();
        $this->assertDatabaseHas('assets', [
            'type' => 'VEHICLE',
        ]);
    }

    public function test_can_create_asset_with_investment_type()
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->post('/assets', [
            'name' => 'Test Investment',
            'value' => 5000000,
            'type' => 'INVESTMENT',
        ]);

        $response->assertSessionHasNoErrors();
        $this->assertDatabaseHas('assets', [
            'type' => 'INVESTMENT',
        ]);
    }
}
