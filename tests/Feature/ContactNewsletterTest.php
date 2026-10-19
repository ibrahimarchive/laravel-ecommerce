<?php

namespace Tests\Feature;

use App\Models\ContactMessage;
use App\Models\NewsletterSubscriber;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class ContactNewsletterTest extends TestCase
{
    use RefreshDatabase;

    public function test_contact_page_renders(): void
    {
        $this->get('/contact')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->component('Contact'));
    }

    public function test_contact_form_creates_a_message(): void
    {
        $this->post('/contact', [
            'name' => 'Jane Doe',
            'email' => 'jane@example.test',
            'phone' => '555-0101',
            'subject' => 'Question about an order',
            'message' => 'Could you tell me when my order ships?',
        ])->assertSessionHasNoErrors();

        $this->assertDatabaseHas('contact_messages', [
            'name' => 'Jane Doe',
            'email' => 'jane@example.test',
            'subject' => 'Question about an order',
            'is_read' => false,
        ]);
    }

    public function test_contact_form_requires_name_email_subject_and_message(): void
    {
        $this->post('/contact', [])
            ->assertSessionHasErrors(['name', 'email', 'subject', 'message']);

        $this->assertSame(0, ContactMessage::query()->count());
    }

    public function test_newsletter_subscribe_creates_a_subscriber(): void
    {
        $this->post('/newsletter', [
            'email' => 'subscriber@example.test',
            'name' => 'Sam Subscriber',
        ])->assertSessionHasNoErrors();

        $subscriber = NewsletterSubscriber::query()->firstWhere('email', 'subscriber@example.test');

        $this->assertNotNull($subscriber);
        $this->assertSame('Sam Subscriber', $subscriber->name);
        $this->assertTrue($subscriber->is_active);
        $this->assertNotNull($subscriber->subscribed_at);
        $this->assertSame(64, strlen($subscriber->token));
    }

    public function test_subscribing_twice_updates_the_existing_subscriber(): void
    {
        $this->post('/newsletter', ['email' => 'once@example.test']);
        $this->post('/newsletter', ['email' => 'once@example.test', 'name' => 'Updated Name']);

        $this->assertSame(1, NewsletterSubscriber::query()->count());
        $this->assertSame('Updated Name', NewsletterSubscriber::query()->first()->name);
    }

    public function test_newsletter_unsubscribe_using_a_token(): void
    {
        $this->post('/newsletter', ['email' => 'leaving@example.test']);

        $subscriber = NewsletterSubscriber::query()->firstWhere('email', 'leaving@example.test');

        $this->delete('/newsletter', ['token' => $subscriber->token])
            ->assertRedirect(route('home'));

        $subscriber->refresh();

        $this->assertFalse($subscriber->is_active);
        $this->assertNotNull($subscriber->unsubscribed_at);
    }

    public function test_unsubscribe_with_an_invalid_token_returns_not_found(): void
    {
        $this->delete('/newsletter', ['token' => 'not-a-real-token'])->assertNotFound();
    }
}
