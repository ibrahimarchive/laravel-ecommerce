<?php

namespace Tests\Feature;

use App\Models\Product;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReviewTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_user_can_submit_a_review(): void
    {
        $user = User::factory()->create();
        $product = Product::factory()->create();

        $this->actingAs($user)
            ->post("/products/{$product->slug}/reviews", [
                'rating' => 5,
                'title' => 'Excellent',
                'body' => 'Really happy with this purchase.',
            ])
            ->assertSessionHasNoErrors();

        $this->assertDatabaseHas('reviews', [
            'product_id' => $product->id,
            'user_id' => $user->id,
            'rating' => 5,
            'author_name' => $user->name,
            'is_approved' => false,
        ]);
    }

    public function test_review_requires_approval_by_default(): void
    {
        $user = User::factory()->create();
        $product = Product::factory()->create();

        $this->actingAs($user)->post("/products/{$product->slug}/reviews", ['rating' => 4]);

        $review = $product->reviews()->first();

        $this->assertFalse($review->is_approved);
        $this->assertNull($review->approved_at);
    }

    public function test_review_is_auto_approved_when_approval_is_disabled(): void
    {
        Setting::set('reviews_require_approval', '0', 'commerce');

        $user = User::factory()->create();
        $product = Product::factory()->create();

        $this->actingAs($user)->post("/products/{$product->slug}/reviews", ['rating' => 4]);

        $review = $product->reviews()->first();

        $this->assertTrue($review->is_approved);
        $this->assertNotNull($review->approved_at);
    }

    public function test_user_cannot_review_the_same_product_twice(): void
    {
        $user = User::factory()->create();
        $product = Product::factory()->create();

        $this->actingAs($user)->post("/products/{$product->slug}/reviews", ['rating' => 5]);
        $this->actingAs($user)
            ->post("/products/{$product->slug}/reviews", ['rating' => 3])
            ->assertSessionHasErrors('rating');

        $this->assertSame(1, $product->reviews()->count());
    }

    public function test_guests_must_supply_a_name_and_email(): void
    {
        $product = Product::factory()->create();

        $this->post("/products/{$product->slug}/reviews", ['rating' => 5])
            ->assertSessionHasErrors(['author_name', 'author_email']);

        $this->post("/products/{$product->slug}/reviews", [
            'rating' => 5,
            'author_name' => 'Guest Reviewer',
            'author_email' => 'guest@example.test',
        ])->assertSessionHasNoErrors();

        $this->assertDatabaseHas('reviews', [
            'product_id' => $product->id,
            'author_name' => 'Guest Reviewer',
            'author_email' => 'guest@example.test',
        ]);
    }

    public function test_rating_must_be_between_one_and_five(): void
    {
        $user = User::factory()->create();
        $product = Product::factory()->create();

        $this->actingAs($user)
            ->post("/products/{$product->slug}/reviews", ['rating' => 6])
            ->assertSessionHasErrors('rating');
    }

    public function test_inactive_products_cannot_be_reviewed(): void
    {
        $user = User::factory()->create();
        $product = Product::factory()->create(['is_active' => false]);

        $this->actingAs($user)
            ->post("/products/{$product->slug}/reviews", ['rating' => 5])
            ->assertNotFound();
    }
}
