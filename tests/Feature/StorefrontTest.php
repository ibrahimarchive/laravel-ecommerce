<?php

namespace Tests\Feature;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Page;
use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class StorefrontTest extends TestCase
{
    use RefreshDatabase;

    public function test_home_page_renders_the_storefront(): void
    {
        Product::factory()->create(['is_featured' => true, 'is_active' => true]);
        Category::factory()->create(['is_active' => true]);
        Brand::factory()->create(['is_active' => true]);

        $this->get('/')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Home')
                ->has('featuredProducts')
                ->has('newArrivals')
                ->has('onSaleProducts')
                ->has('categories')
                ->has('brands'));
    }

    public function test_shop_page_lists_paginated_products(): void
    {
        Product::factory()->count(3)->create(['is_active' => true]);

        $this->get('/shop')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Shop/Index')
                ->has('products.data', 3)
                ->has('filters')
                ->has('options.categories')
                ->has('options.brands'));
    }

    public function test_shop_search_filters_products(): void
    {
        Product::factory()->create(['name' => 'Findable Widget', 'is_active' => true]);
        Product::factory()->create(['name' => 'Something Else', 'is_active' => true]);

        $this->get('/shop?q=Findable')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Shop/Index')
                ->has('products.data', 1));
    }

    public function test_product_detail_page_renders_for_active_product(): void
    {
        $product = Product::factory()->create(['is_active' => true]);

        $this->get('/shop/'.$product->slug)
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Shop/Show')
                ->where('product.slug', $product->slug)
                ->has('reviews')
                ->has('ratingBreakdown')
                ->has('relatedProducts'));
    }

    public function test_product_detail_page_returns_not_found_for_inactive_product(): void
    {
        $product = Product::factory()->create(['is_active' => false]);

        $this->get('/shop/'.$product->slug)->assertNotFound();
    }

    public function test_category_page_renders(): void
    {
        $category = Category::factory()->create(['is_active' => true]);
        Product::factory()->create(['category_id' => $category->id, 'is_active' => true]);

        $this->get('/category/'.$category->slug)
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Shop/Index')
                ->where('category.slug', $category->slug));
    }

    public function test_cms_page_renders_when_published(): void
    {
        $page = Page::factory()->create(['is_published' => true]);

        $this->get('/page/'.$page->slug)
            ->assertOk()
            ->assertInertia(fn (Assert $page2) => $page2
                ->component('Page/Show')
                ->where('page.slug', $page->slug));
    }

    public function test_cms_page_returns_not_found_when_draft(): void
    {
        $page = Page::factory()->draft()->create();

        $this->get('/page/'.$page->slug)->assertNotFound();
    }

    public function test_contact_page_renders(): void
    {
        $this->get('/contact')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->component('Contact'));
    }
}
