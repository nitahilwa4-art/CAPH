<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Schedule the recurring transaction processor to run daily
use Illuminate\Support\Facades\Schedule;
// Note: In Laravel 11, console routes are loaded automatically.
// But calling Schedule::command here might not work if not in a service provider or bootstrap/app.php in newer Laravel.
// However, 'routes/console.php' is loaded by the framework. Let's register it.
Schedule::command('recurring:process')->daily();
