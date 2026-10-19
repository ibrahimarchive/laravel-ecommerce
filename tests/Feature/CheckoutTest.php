<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use App\Support\Store;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class CheckoutTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Session ids are not carried between test requests, so a cart only
     * survives across requests when it is keyed by an authenticated user.
     */
    private function shoppingUser(): User
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        return $user;
    }

    /**
     * @param  array<string, mixed>  $overrides
     * @return array<string, mixed>
     */
    private function checkoutPayload(array $overrides = []): array
    {
        return array_merge([
            'customer_name' => 'Casey Customer',
            'customer_email' => 'casey@example.test',
            'customer_phone' => '555-0100',
            'shipping_method' => 'standard',
            'payment_method' => 'cod',
            'first_name' => 'Casey',
            'last_name' => 'Customer',
            'address_line_1' => '1 Main Street',
            'city' => 'Springfield',
            'state' => 'IL',
            'postal_code' => '62701',
            'country' => 'US',
        ], $overrides);
    }

    private function addToCart(Product $product, int $quantity = 1): void
    {
        $this->post('/cart', [
            'product_id' => $product->id,
            'quantity' => $quantity,
        ])->assertSessionHasNoErrors();
    }

    public function test_checkout_page_redirects_to_cart_when_empty(): void
    {
        $this->shoppingUser();

        $this->get('/checkout')->assertRedirect(route('cart.index'));
    }

    public function test_checkout_page_renders_with_cart_items(): void
    {
        $this->shoppingUser();
        $product = Product::factory()->create(['price' => 25.00, 'stock_quantity' => 10]);
        $this->addToCart($product, 2);

        $this->get('/checkout')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Checkout/Index')
                ->has('items', 1)
                ->has('totals')
                ->has('shippingMethods')
                ->has('paymentMethods')
                ->has('allowGuestCheckout'));
    }

    public function test_placing_a_cod_order_creates_order_decrements_stock_and_clears_cart(): void
    {
        $user = $this->shoppingUser();
        $product = Product::factory()->create([
            'price' => 100.00,
            'manage_stock' => true,
            'stock_quantity' => 10,
        ]);
        $this->addToCart($product, 2);

        $response = $this->post('/checkout', $this->checkoutPayload());

        $order = Order::query()->firstOrFail();

        $response->assertRedirect(route('checkout.success', $order->number))
            ->assertSessionHasNoErrors();

        $this->assertDatabaseHas('orders', [
            'id' => $order->id,
            'user_id' => $user->id,
            'status' => 'pending',
            'payment_status' => 'pending',
            'payment_method' => 'cod',
        ]);

        $this->assertDatabaseCount('order_items', 1);
        $this->assertDatabaseCount('cart_items', 0);

        $this->assertEquals(8, $product->fresh()->stock_quantity);
        $this->assertEquals(200.0, (float) $order->subtotal);
        $this->assertEquals(216.5, (float) $order->grand_total);
    }

    public function test_confirmation_page_renders_for_the_customer(): void
    {
        $this->shoppingUser();
        $product = Product::factory()->create(['price' => 40.00, 'stock_quantity' => 5]);
        $this->addToCart($product);

        $this->post('/checkout', $this->checkoutPayload());

        $order = Order::query()->firstOrFail();

        $this->get(route('checkout.success', $order->number))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Checkout/Success')
                ->where('order.number', $order->number));
    }

    public function test_stripe_checkout_is_rejected_when_not_configured(): void
    {
        $this->shoppingUser();
        $product = Product::factory()->create(['price' => 30.00, 'stock_quantity' => 5]);
        $this->addToCart($product);

        $this->post('/checkout', $this->checkoutPayload(['payment_method' => 'stripe']))
            ->assertSessionHasErrors('payment_method');

        $this->assertDatabaseCount('orders', 0);
    }

    public function test_another_customer_cannot_view_someone_elses_confirmation(): void
    {
        $owner = User::factory()->create();
        $order = Order::factory()->forUser($owner)->create();

        $this->actingAs(User::factory()->create());

        $this->get(route('checkout.success', $order->number))->assertNotFound();
    }

    public function test_guest_checkout_is_allowed_by_default(): void
    {
        $this->assertTrue(Store::allowGuestCheckout());
    }
}
