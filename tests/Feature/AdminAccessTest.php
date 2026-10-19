<?php

namespace Tests\Feature;

use App\Models\Product;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminAccessTest extends TestCase
{
    use RefreshDatabase;

    private function userWithRole(string $slug): User
    {
        $role = Role::create([
            'name' => ucfirst($slug),
            'slug' => $slug,
            'is_system' => true,
        ]);

        $user = User::factory()->create();
        $user->roles()->attach($role->id);

        return $user;
    }

    public function test_guest_is_redirected_to_login(): void
    {
        $this->get('/admin')->assertRedirect(route('login'));
    }

    public function test_customer_is_forbidden(): void
    {
        $user = $this->userWithRole(Role::CUSTOMER_SLUG);

        $this->actingAs($user)->get('/admin')->assertForbidden();
    }

    public function test_admin_can_access_the_dashboard(): void
    {
        $admin = $this->userWithRole(Role::ADMIN_SLUG);

        $this->actingAs($admin)
            ->get('/admin')
            ->assertOk()
            ->assertInertia(fn ($page) => $page->component('Admin/Dashboard'));
    }

    public function test_staff_can_access_the_dashboard(): void
    {
        $staff = $this->userWithRole(Role::STAFF_SLUG);

        $this->actingAs($staff)->get('/admin')->assertOk();
    }

    public function test_admin_can_create_a_product(): void
    {
        $admin = $this->userWithRole(Role::ADMIN_SLUG);

        $response = $this->actingAs($admin)->post('/admin/products', [
            'name' => 'Test Widget',
            'price' => '19.99',
            'stock_quantity' => 25,
            'low_stock_threshold' => 5,
            'manage_stock' => true,
            'is_active' => true,
            'is_featured' => false,
        ]);

        $response->assertSessionHasNoErrors();
        $this->assertDatabaseHas('products', ['name' => 'Test Widget']);
    }

    public function test_admin_can_update_a_product(): void
    {
        $admin = $this->userWithRole(Role::ADMIN_SLUG);
        $product = Product::factory()->create(['name' => 'Old Name']);

        $this->actingAs($admin)->put("/admin/products/{$product->id}", [
            'name' => 'New Name',
            'price' => '29.99',
            'stock_quantity' => 10,
            'low_stock_threshold' => 5,
            'manage_stock' => true,
            'is_active' => true,
            'is_featured' => false,
        ])->assertSessionHasNoErrors();

        $this->assertDatabaseHas('products', ['id' => $product->id, 'name' => 'New Name']);
    }

    public function test_admin_can_soft_delete_and_restore_a_product(): void
    {
        $admin = $this->userWithRole(Role::ADMIN_SLUG);
        $product = Product::factory()->create();

        $this->actingAs($admin)
            ->delete("/admin/products/{$product->id}")
            ->assertRedirect(route('admin.products.index'));

        $this->assertSoftDeleted('products', ['id' => $product->id]);

        $this->actingAs($admin)
            ->patch("/admin/products/{$product->id}/restore")
            ->assertSessionHasNoErrors();

        $this->assertNotSoftDeleted('products', ['id' => $product->id]);
    }

    public function test_admin_pages_render(): void
    {
        $admin = $this->userWithRole(Role::ADMIN_SLUG);

        foreach ([
            '/admin/products',
            '/admin/categories',
            '/admin/brands',
            '/admin/attributes',
            '/admin/orders',
            '/admin/coupons',
            '/admin/reviews',
            '/admin/customers',
            '/admin/pages',
            '/admin/newsletter',
            '/admin/messages',
            '/admin/settings',
        ] as $path) {
            $this->actingAs($admin)->get($path)->assertOk();
        }
    }
}
