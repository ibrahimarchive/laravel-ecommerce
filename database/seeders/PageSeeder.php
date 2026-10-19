<?php

namespace Database\Seeders;

use App\Models\Page;
use Illuminate\Database\Seeder;

class PageSeeder extends Seeder
{
    /**
     * Seed the store's content pages.
     */
    public function run(): void
    {
        foreach ($this->pages() as $index => $page) {
            Page::factory()->create([
                'title' => $page['title'],
                'slug' => Page::generateSlug($page['title']),
                'excerpt' => $page['excerpt'],
                'content' => $page['content'],
                'meta_title' => $page['title'],
                'meta_description' => $page['excerpt'],
                'is_published' => $page['published'] ?? true,
                'show_in_footer' => $page['footer'] ?? true,
                'published_at' => now(),
                'sort_order' => $index,
            ]);
        }
    }

    /**
     * The demo content pages.
     *
     * @return array<int, array<string, mixed>>
     */
    protected function pages(): array
    {
        return [
            [
                'title' => 'About Us',
                'excerpt' => 'Discover the story behind ShopFront and the people who make it happen.',
                'content' => <<<'HTML'
                    <h2>Our story</h2>
                    <p>ShopFront began in 2015 with a simple idea: make quality products accessible to everyone, backed by genuinely helpful customer service.</p>
                    <p>Today we ship thousands of orders every month from our warehouse, carefully packed and dispatched within one business day.</p>
                    <h2>Our promise</h2>
                    <p>We stand behind everything we sell. If a product is not right for you, our returns team will make it right.</p>
                    HTML,
            ],
            [
                'title' => 'Contact Us',
                'excerpt' => 'Get in touch with the ShopFront customer support team.',
                'content' => <<<'HTML'
                    <h2>We would love to hear from you</h2>
                    <p>Our support team is available Monday to Friday, 9am to 5pm. We aim to reply to every enquiry within one business day.</p>
                    <ul>
                        <li><strong>Email:</strong> support@shopfront.test</li>
                        <li><strong>Phone:</strong> +1 (555) 123-4567</li>
                        <li><strong>Address:</strong> 123 Commerce Street, Suite 100, San Francisco, CA 94103</li>
                    </ul>
                    <p>You can also send us a message using the contact form and we will get back to you shortly.</p>
                    HTML,
            ],
            [
                'title' => 'Shipping & Returns',
                'excerpt' => 'Everything you need to know about delivery times, shipping costs, and returns.',
                'content' => <<<'HTML'
                    <h2>Shipping</h2>
                    <p>We offer standard and express shipping. Orders over $75 qualify for free standard shipping.</p>
                    <p>Standard delivery typically arrives within 3–5 business days. Express orders placed before 12pm are dispatched the same day.</p>
                    <h2>Returns</h2>
                    <p>If you are not completely satisfied, you may return most items within 30 days of delivery for a full refund. Items must be unused and in their original packaging.</p>
                    HTML,
            ],
            [
                'title' => 'Terms & Conditions',
                'excerpt' => 'The terms governing your use of the ShopFront website and services.',
                'content' => <<<'HTML'
                    <h2>Terms of service</h2>
                    <p>By accessing and using this website you agree to be bound by these terms and all applicable laws and regulations.</p>
                    <p>Prices and availability are subject to change without notice. We reserve the right to refuse or cancel any order.</p>
                    <h2>Limitation of liability</h2>
                    <p>To the fullest extent permitted by law, ShopFront shall not be liable for any indirect or consequential damages arising from the use of this site.</p>
                    HTML,
            ],
            [
                'title' => 'Privacy Policy',
                'excerpt' => 'How we collect, use, and protect your personal information.',
                'content' => <<<'HTML'
                    <h2>Your privacy matters</h2>
                    <p>We collect only the information required to process your order and improve your shopping experience.</p>
                    <p>We never sell your personal data to third parties. Payment information is processed securely by our payment providers and is never stored on our servers.</p>
                    <h2>Cookies</h2>
                    <p>We use cookies to keep your cart and session working correctly. You can disable cookies in your browser, though some features may stop working.</p>
                    HTML,
            ],
            [
                'title' => 'Frequently Asked Questions',
                'excerpt' => 'Answers to the questions we are asked most often.',
                'content' => <<<'HTML'
                    <h2>Orders</h2>
                    <p><strong>Can I change my order?</strong> Please contact us as soon as possible. We can amend orders that have not yet been dispatched.</p>
                    <p><strong>Do you ship internationally?</strong> Yes, we ship to a growing list of countries. Shipping costs are calculated at checkout.</p>
                    <h2>Returns</h2>
                    <p><strong>How long do refunds take?</strong> Refunds are processed within 5 business days of us receiving your return.</p>
                    HTML,
            ],
        ];
    }
}
