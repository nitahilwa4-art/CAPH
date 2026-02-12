<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Category;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create Admin User
        User::create([
            'name' => 'Super Admin',
            'email' => 'admin@fintrack.com',
            'password' => Hash::make('admin123'),
            'role' => 'ADMIN',
            'status' => 'ACTIVE',
            'preferences' => [
                'theme' => 'dark',
                'currency' => 'IDR',
                'notifications' => true,
            ],
        ]);

        // Create Demo User
        User::create([
            'name' => 'Demo User',
            'email' => 'user@fintrack.com',
            'password' => Hash::make('user123'),
            'role' => 'USER',
            'status' => 'ACTIVE',
            'preferences' => [
                'theme' => 'light',
                'currency' => 'IDR',
                'notifications' => true,
            ],
        ]);

        // Create Default Categories (System Categories)
        $defaultCategories = [
            // Income
            ['name' => 'Gaji', 'type' => 'INCOME', 'is_default' => true],
            ['name' => 'Bonus', 'type' => 'INCOME', 'is_default' => true],
            ['name' => 'Investasi', 'type' => 'INCOME', 'is_default' => true],
            ['name' => 'Lainnya', 'type' => 'INCOME', 'is_default' => true],
            
            // Expense
            ['name' => 'Makanan', 'type' => 'EXPENSE', 'is_default' => true],
            ['name' => 'Transportasi', 'type' => 'EXPENSE', 'is_default' => true],
            ['name' => 'Belanja', 'type' => 'EXPENSE', 'is_default' => true],
            ['name' => 'Tagihan', 'type' => 'EXPENSE', 'is_default' => true],
            ['name' => 'Hiburan', 'type' => 'EXPENSE', 'is_default' => true],
            ['name' => 'Kesehatan', 'type' => 'EXPENSE', 'is_default' => true],
            ['name' => 'Pendidikan', 'type' => 'EXPENSE', 'is_default' => true],
            ['name' => 'Lainnya', 'type' => 'EXPENSE', 'is_default' => true],
            
            // Transfer
            ['name' => 'Transfer Antar Dompet', 'type' => 'TRANSFER', 'is_default' => true],
            ['name' => 'Top Up E-Wallet', 'type' => 'TRANSFER', 'is_default' => true],
            ['name' => 'Tarik Tunai', 'type' => 'TRANSFER', 'is_default' => true],
            ['name' => 'Lainnya', 'type' => 'TRANSFER', 'is_default' => true],
        ];

        foreach ($defaultCategories as $category) {
            Category::create([
                'user_id' => null, // System category
                'name' => $category['name'],
                'type' => $category['type'],
                'is_default' => $category['is_default'],
            ]);
        }
    }
}
