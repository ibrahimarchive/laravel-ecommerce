<?php

namespace Tests\Feature;

use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class WishlistTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_is_redirected_to_login(): void
    {
        $this->post('/account/wishlist/some-product')->assertRedirect(route('login'));
    }

    public function test_user_can_add_a_product_to_the_wishlist(): void
    {
        $user = User::factory()->create();
        $product = Product::factory()->create();

        $this->actingAs($user)
            ->post("/account/wishlist/{$product->slug}")
            ->assertSessionHasNoErrors();

        $this->assertDatabaseHas('wishlist_items', [
            'user_id' => $user->id,
            'product_id' => $product->id,
        ]);
    }

    public function test_wishlist_page_lists_saved_products(): void
    {
        $user = User::factory()->create();
        $product = Product::factory()->create();

        $this->actingAs($user)->post("/account/wishlist/{$product->slug}");

        $this->actingAs($user)
            ->get('/account/wishlist')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Account/Wishlist/Index')
                ->has('items', 1)
                ->where('items.0.product_id', $product->id));
    }

    public function test_toggle_adds_then_removes_the_product(): void
    {
        $user = User::factory()->create();
        $product = Product::factory()->create();

        $this->actingAs($user)->post("/account/wishlist/{$product->slug}/toggle");
        $this->assertDatabaseHas('wishlist_items', [
            'user_id' => $user->id,
            'product_id' => $product->id,
        ]);

        $this->actingAs($user)->post("/account/wishlist/{$product->slug}/toggle");
        $this->assertDatabaseMissing('wishlist_items', [
            'user_id' => $user->id,
            'product_id' => $product->id,
        ]);
    }

    public function test_user_can_remove_a_product_from_the_wishlist(): void
    {
        $user = User::factory()->create();
        $product = Product::factory()->create();

        $this->actingAs($user)->post("/account/wishlist/{$product->slug}");

        $this->actingAs($user)
            ->delete("/account/wishlist/{$product->slug}")
            ->assertSessionHasNoErrors();

        $this->assertDatabaseMissing('wishlist_items', [
            'user_id' => $user->id,
            'product_id' => $product->id,
        ]);
    }
}
