<?php

namespace App\Providers;

use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Resources are consumed by Inertia (not a JSON API), so keep the
        // payload flat and free of the outer "data" wrapper.
        JsonResource::withoutWrapping();
    }
}
