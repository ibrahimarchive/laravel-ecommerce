<?php

namespace Tests\Feature;

use App\Enums\OrderStatus;
use App\Mail\OrderPlaced;
use App\Mail\OrderStatusUpdated;
use App\Models\Order;
use App\Models\Product;
use App\Models\Role;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class OrderMailTest extends TestCase
{
    use RefreshDatabase;

    private function customer(): User
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        return $user;
    }

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

    private function placeOrder(User $customer): Order
    {
        $product = Product::factory()->create([
            'price' => 50,
            'stock_quantity' => 10,
            'manage_stock' => true,
            'is_active' => true,
            'published_at' => now(),
        ]);

        $this->post('/cart', ['product_id' => $product->id, 'quantity' => 1])
            ->assertSessionHasNoErrors();

        $this->post('/checkout', $this->checkoutPayload())
            ->assertSessionHasNoErrors();

        return Order::query()->latest('id')->firstOrFail();
    }

    public function test_placing_an_order_emails_the_customer_a_receipt(): void
    {
        Mail::fake();

        $customer = $this->customer();
        $order = $this->placeOrder($customer);

        Mail::assertSent(OrderPlaced::class, function (OrderPlaced $mail) use ($order): bool {
            return $mail->order->is($order) && $mail->hasTo($order->customer_email);
        });
    }

    public function test_order_receipt_is_not_sent_when_confirmation_is_disabled(): void
    {
        Mail::fake();

        Setting::set('send_order_confirmation', '0', 'commerce');

        $this->placeOrder($this->customer());

        Mail::assertNothingSent();
    }

    public function test_transitioning_an_order_emails_the_customer_and_marks_the_history_notified(): void
    {
        Mail::fake();

        $customer = $this->customer();
        $order = $this->placeOrder($customer);

        $adminRole = Role::create(['name' => 'Admin', 'slug' => Role::ADMIN_SLUG, 'is_system' => true]);
        $admin = User::factory()->create();
        $admin->roles()->attach($adminRole->id);

        $this->actingAs($admin)
            ->patch("/admin/orders/{$order->number}/status", [
                'status' => OrderStatus::Processing->value,
                'note' => 'Packing your order.',
            ])
            ->assertSessionHasNoErrors();

        Mail::assertSent(OrderStatusUpdated::class, function (OrderStatusUpdated $mail) use ($order): bool {
            return $mail->order->is($order)
                && $mail->newStatus === OrderStatus::Processing
                && $mail->previousStatus === OrderStatus::Pending
                && $mail->hasTo($order->customer_email);
        });

        $this->assertDatabaseHas('order_status_histories', [
            'order_id' => $order->id,
            'to_status' => OrderStatus::Processing->value,
            'is_customer_notified' => true,
        ]);
    }

    public function test_order_emails_render_without_errors(): void
    {
        $order = Order::factory()->create(['customer_name' => 'Casey Customer']);

        $placed = (new OrderPlaced($order))->render();
        $this->assertStringContainsString($order->number, $placed);

        $updated = (new OrderStatusUpdated(
            $order,
            OrderStatus::Pending,
            OrderStatus::Processing,
            'Packing your order.',
        ))->render();
        $this->assertStringContainsString(OrderStatus::Processing->label(), $updated);
        $this->assertStringContainsString('Packing your order.', $updated);
    }
}
