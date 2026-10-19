<?php

namespace Tests\Feature;

use App\Enums\DiscountType;
use App\Models\CartItem;
use App\Models\Coupon;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class CartTest extends TestCase
{
    use RefreshDatabase;

    private function shoppingUser(): User
    {
        $user = User::factory()->create();

        $this->actingAs($user);

        return $user;
    }

    public function test_a_product_can_be_added_to_the_cart(): void
    {
        $this->shoppingUser();
        $product = Product::factory()->create(['stock_quantity' => 10]);

        $this->post('/cart', [
            'product_id' => $product->id,
            'quantity' => 2,
        ])->assertSessionHasNoErrors();

        $this->assertDatabaseHas('cart_items', [
            'product_id' => $product->id,
            'quantity' => 2,
        ]);
    }

    public function test_the_cart_page_lists_added_items(): void
    {
        $this->shoppingUser();
        $product = Product::factory()->create(['stock_quantity' => 10]);

        $this->post('/cart', ['product_id' => $product->id, 'quantity' => 1]);

        $this->get('/cart')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Cart/Index')
                ->has('items', 1)
                ->where('items.0.product_id', $product->id)
                ->has('totals')
                ->has('shippingMethods'));
    }

    public function test_out_of_stock_products_cannot_be_added(): void
    {
        $this->shoppingUser();
        $product = Product::factory()->create([
            'manage_stock' => true,
            'stock_quantity' => 0,
        ]);

        $this->post('/cart', ['product_id' => $product->id, 'quantity' => 1])
            ->assertSessionHasErrors('quantity');

        $this->assertDatabaseCount('cart_items', 0);
    }

    public function test_quantity_cannot_exceed_available_stock(): void
    {
        $this->shoppingUser();
        $product = Product::factory()->create(['stock_quantity' => 2]);

        $this->post('/cart', ['product_id' => $product->id, 'quantity' => 5])
            ->assertSessionHasErrors('quantity');

        $this->assertDatabaseCount('cart_items', 0);
    }

    public function test_a_variant_must_be_chosen_for_products_with_options(): void
    {
        $this->shoppingUser();
        $product = Product::factory()->create();
        ProductVariant::factory()->create(['product_id' => $product->id, 'stock_quantity' => 5]);

        $this->post('/cart', ['product_id' => $product->id, 'quantity' => 1])
            ->assertSessionHasErrors('product_variant_id');
    }

    public function test_a_variant_can_be_added_to_the_cart(): void
    {
        $this->shoppingUser();
        $product = Product::factory()->create();
        $variant = ProductVariant::factory()->create([
            'product_id' => $product->id,
            'stock_quantity' => 5,
            'is_active' => true,
        ]);

        $this->post('/cart', [
            'product_id' => $product->id,
            'product_variant_id' => $variant->id,
            'quantity' => 3,
        ])->assertSessionHasNoErrors();

        $this->assertDatabaseHas('cart_items', [
            'product_variant_id' => $variant->id,
            'quantity' => 3,
        ]);
    }

    public function test_a_cart_item_quantity_can_be_updated_and_removed(): void
    {
        $this->shoppingUser();
        $product = Product::factory()->create(['stock_quantity' => 10]);
        $this->post('/cart', ['product_id' => $product->id, 'quantity' => 1]);

        $item = CartItem::firstOrFail();

        $this->patch("/cart/items/{$item->id}", ['quantity' => 4])
            ->assertSessionHasNoErrors();

        $this->assertSame(4, $item->fresh()->quantity);

        $this->patch("/cart/items/{$item->id}", ['quantity' => 0])
            ->assertSessionHasNoErrors();

        $this->assertDatabaseCount('cart_items', 0);
    }

    public function test_a_cart_item_can_be_removed(): void
    {
        $this->shoppingUser();
        $product = Product::factory()->create(['stock_quantity' => 10]);
        $this->post('/cart', ['product_id' => $product->id, 'quantity' => 1]);

        $item = CartItem::firstOrFail();

        $this->delete("/cart/items/{$item->id}")->assertSessionHasNoErrors();

        $this->assertDatabaseCount('cart_items', 0);
    }

    public function test_the_cart_can_be_cleared(): void
    {
        $this->shoppingUser();
        $product = Product::factory()->create(['stock_quantity' => 10]);
        $this->post('/cart', ['product_id' => $product->id, 'quantity' => 1]);

        $this->delete('/cart')->assertRedirect(route('cart.index'));

        $this->assertDatabaseCount('cart_items', 0);
    }

    public function test_a_valid_coupon_can_be_applied(): void
    {
        $this->shoppingUser();
        $coupon = Coupon::factory()->create([
            'code' => 'SAVE10',
            'type' => DiscountType::Percentage,
            'value' => 10,
            'is_active' => true,
        ]);

        $this->post('/cart/coupon', ['coupon' => 'save10'])
            ->assertSessionHasNoErrors();

        $this->assertDatabaseHas('carts', ['coupon_id' => $coupon->id]);
    }

    public function test_an_invalid_coupon_is_rejected(): void
    {
        $this->shoppingUser();

        $this->post('/cart/coupon', ['coupon' => 'DOES-NOT-EXIST'])
            ->assertSessionHasErrors('coupon');
    }
}
