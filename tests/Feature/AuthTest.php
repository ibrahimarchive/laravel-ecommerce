<?php

namespace Tests\Feature;

use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_can_view_the_login_page(): void
    {
        $this->get('/login')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->component('Auth/Login'));
    }

    public function test_users_can_authenticate_with_valid_credentials(): void
    {
        $user = User::factory()->create();

        $response = $this->post('/login', [
            'email' => $user->email,
            'password' => 'password',
        ]);

        $this->assertAuthenticatedAs($user);
        $response->assertRedirect(route('home'));
    }

    public function test_administrators_are_redirected_to_the_admin_dashboard(): void
    {
        $role = Role::create(['name' => 'Administrator', 'slug' => Role::ADMIN_SLUG, 'is_system' => true]);
        $user = User::factory()->create();
        $user->roles()->attach($role->id);

        $response = $this->post('/login', [
            'email' => $user->email,
            'password' => 'password',
        ]);

        $this->assertAuthenticatedAs($user);
        $response->assertRedirect(route('admin.dashboard'));
    }

    public function test_users_cannot_authenticate_with_an_invalid_password(): void
    {
        $user = User::factory()->create();

        $this->post('/login', [
            'email' => $user->email,
            'password' => 'not-the-password',
        ])->assertSessionHasErrors('email');

        $this->assertGuest();
    }

    public function test_new_users_can_register_and_receive_the_customer_role(): void
    {
        Role::create(['name' => 'Customer', 'slug' => Role::CUSTOMER_SLUG, 'is_system' => true]);

        $response = $this->post('/register', [
            'name' => 'New Shopper',
            'email' => 'new-shopper@example.com',
            'phone' => '555-0100',
            'password' => 'password',
            'password_confirmation' => 'password',
        ]);

        $response->assertRedirect(route('home'));

        $user = User::where('email', 'new-shopper@example.com')->firstOrFail();

        $this->assertAuthenticatedAs($user);
        $this->assertTrue($user->hasRole(Role::CUSTOMER_SLUG));
    }

    public function test_users_can_log_out(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->post('/logout')
            ->assertRedirect(route('home'));

        $this->assertGuest();
    }

    public function test_guests_are_redirected_from_the_account_area(): void
    {
        $this->get('/account')->assertRedirect(route('login'));
    }
}
