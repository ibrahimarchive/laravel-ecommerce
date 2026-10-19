<?php

use App\Http\Controllers\Account\AddressController;
use App\Http\Controllers\Account\DashboardController as AccountDashboardController;
use App\Http\Controllers\Account\OrderController as AccountOrderController;
use App\Http\Controllers\Account\ProfileController;
use App\Http\Controllers\Account\WishlistController;
use App\Http\Controllers\Admin\AttributeController as AdminAttributeController;
use App\Http\Controllers\Admin\BrandController as AdminBrandController;
use App\Http\Controllers\Admin\CategoryController as AdminCategoryController;
use App\Http\Controllers\Admin\CouponController as AdminCouponController;
use App\Http\Controllers\Admin\CustomerController as AdminCustomerController;
use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\MessageController as AdminMessageController;
use App\Http\Controllers\Admin\NewsletterController as AdminNewsletterController;
use App\Http\Controllers\Admin\OrderController as AdminOrderController;
use App\Http\Controllers\Admin\PageController as AdminPageController;
use App\Http\Controllers\Admin\ProductController as AdminProductController;
use App\Http\Controllers\Admin\ReviewController as AdminReviewController;
use App\Http\Controllers\Admin\SettingController as AdminSettingController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\NewPasswordController;
use App\Http\Controllers\Auth\PasswordResetLinkController;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\CheckoutController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\NewsletterController;
use App\Http\Controllers\PageController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\ShopController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Storefront
|--------------------------------------------------------------------------
*/

Route::get('/', HomeController::class)->name('home');

Route::get('/shop', [ShopController::class, 'index'])->name('shop.index');
Route::get('/shop/{product:slug}', [ProductController::class, 'show'])->name('shop.show');
Route::get('/category/{category:slug}', [ShopController::class, 'category'])->name('category.show');
Route::get('/brand/{brand:slug}', [ShopController::class, 'brand'])->name('brand.show');
Route::get('/page/{page:slug}', [PageController::class, 'show'])->name('page.show');

Route::get('/contact', [ContactController::class, 'show'])->name('contact.show');
Route::post('/contact', [ContactController::class, 'store'])->name('contact.store');

Route::post('/newsletter', [NewsletterController::class, 'store'])->name('newsletter.store');
Route::delete('/newsletter', [NewsletterController::class, 'destroy'])->name('newsletter.destroy');

Route::post('/products/{product:slug}/reviews', [ReviewController::class, 'store'])->name('reviews.store');

/*
|--------------------------------------------------------------------------
| Cart
|--------------------------------------------------------------------------
*/

Route::prefix('cart')->name('cart.')->group(function (): void {
    Route::get('/', [CartController::class, 'index'])->name('index');
    Route::post('/', [CartController::class, 'store'])->name('store');
    Route::patch('/items/{item}', [CartController::class, 'update'])->name('update');
    Route::delete('/items/{item}', [CartController::class, 'destroy'])->name('destroy');
    Route::post('/coupon', [CartController::class, 'applyCoupon'])->name('coupon.store');
    Route::delete('/coupon', [CartController::class, 'removeCoupon'])->name('coupon.destroy');
    Route::patch('/shipping', [CartController::class, 'shipping'])->name('shipping');
    Route::delete('/', [CartController::class, 'clear'])->name('clear');
});

/*
|--------------------------------------------------------------------------
| Checkout
|--------------------------------------------------------------------------
*/

Route::prefix('checkout')->name('checkout.')->group(function (): void {
    Route::get('/', [CheckoutController::class, 'index'])->name('index');
    Route::post('/', [CheckoutController::class, 'store'])->name('store');
    Route::get('/{order:number}/success', [CheckoutController::class, 'success'])->name('success');
    Route::get('/{order:number}/cancel', [CheckoutController::class, 'cancel'])->name('cancel');
});

/*
|--------------------------------------------------------------------------
| Authentication
|--------------------------------------------------------------------------
*/

Route::middleware('guest')->group(function (): void {
    Route::get('/login', [AuthenticatedSessionController::class, 'create'])->name('login');
    Route::post('/login', [AuthenticatedSessionController::class, 'store'])->name('login.store');

    Route::get('/register', [RegisteredUserController::class, 'create'])->name('register');
    Route::post('/register', [RegisteredUserController::class, 'store'])->name('register.store');

    Route::get('/forgot-password', [PasswordResetLinkController::class, 'create'])->name('password.request');
    Route::post('/forgot-password', [PasswordResetLinkController::class, 'store'])->name('password.email');

    Route::get('/reset-password/{token}', [NewPasswordController::class, 'create'])->name('password.reset');
    Route::post('/reset-password', [NewPasswordController::class, 'store'])->name('password.store');
});

Route::post('/logout', [AuthenticatedSessionController::class, 'destroy'])
    ->middleware('auth')
    ->name('logout');

/*
|--------------------------------------------------------------------------
| Customer Account
|--------------------------------------------------------------------------
*/

Route::middleware('auth')->prefix('account')->name('account.')->group(function (): void {
    Route::get('/', AccountDashboardController::class)->name('dashboard');

    Route::get('/orders', [AccountOrderController::class, 'index'])->name('orders.index');
    Route::get('/orders/{order:number}', [AccountOrderController::class, 'show'])->name('orders.show');

    Route::get('/addresses', [AddressController::class, 'index'])->name('addresses.index');
    Route::post('/addresses', [AddressController::class, 'store'])->name('addresses.store');
    Route::put('/addresses/{address}', [AddressController::class, 'update'])->name('addresses.update');
    Route::delete('/addresses/{address}', [AddressController::class, 'destroy'])->name('addresses.destroy');
    Route::patch('/addresses/{address}/default', [AddressController::class, 'makeDefault'])->name('addresses.default');

    Route::get('/wishlist', [WishlistController::class, 'index'])->name('wishlist.index');
    Route::post('/wishlist/{product:slug}', [WishlistController::class, 'store'])->name('wishlist.store');
    Route::delete('/wishlist/{product:slug}', [WishlistController::class, 'destroy'])->name('wishlist.destroy');
    Route::post('/wishlist/{product:slug}/toggle', [WishlistController::class, 'toggle'])->name('wishlist.toggle');

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::put('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::put('/password', [ProfileController::class, 'updatePassword'])->name('password.update');
});

/*
|--------------------------------------------------------------------------
| Admin
|--------------------------------------------------------------------------
*/

Route::middleware(['auth', 'admin'])->prefix('admin')->name('admin.')->group(function (): void {
    Route::get('/', AdminDashboardController::class)->name('dashboard');

    Route::resource('products', AdminProductController::class)->except('show');
    Route::patch('/products/{product}/restore', [AdminProductController::class, 'restore'])
        ->withTrashed()
        ->name('products.restore');

    Route::resource('categories', AdminCategoryController::class)->except('show');
    Route::resource('brands', AdminBrandController::class)->except('show');
    Route::resource('attributes', AdminAttributeController::class)->except('show');
    Route::resource('coupons', AdminCouponController::class)->except('show');
    Route::resource('pages', AdminPageController::class)->except('show');

    Route::get('/orders', [AdminOrderController::class, 'index'])->name('orders.index');
    Route::get('/orders/{order:number}', [AdminOrderController::class, 'show'])->name('orders.show');
    Route::patch('/orders/{order:number}/status', [AdminOrderController::class, 'updateStatus'])->name('orders.update-status');
    Route::patch('/orders/{order:number}/payment', [AdminOrderController::class, 'updatePayment'])->name('orders.update-payment');

    Route::get('/reviews', [AdminReviewController::class, 'index'])->name('reviews.index');
    Route::patch('/reviews/{review}/approve', [AdminReviewController::class, 'approve'])->name('reviews.approve');
    Route::patch('/reviews/{review}/reject', [AdminReviewController::class, 'reject'])->name('reviews.reject');
    Route::delete('/reviews/{review}', [AdminReviewController::class, 'destroy'])->name('reviews.destroy');

    Route::get('/customers', [AdminCustomerController::class, 'index'])->name('customers.index');
    Route::get('/customers/{customer}', [AdminCustomerController::class, 'show'])->name('customers.show');
    Route::patch('/customers/{customer}/toggle', [AdminCustomerController::class, 'toggleActive'])->name('customers.toggle');

    Route::get('/settings', [AdminSettingController::class, 'edit'])->name('settings.edit');
    Route::put('/settings', [AdminSettingController::class, 'update'])->name('settings.update');

    Route::get('/newsletter', [AdminNewsletterController::class, 'index'])->name('newsletter.index');
    Route::delete('/newsletter/{subscriber}', [AdminNewsletterController::class, 'destroy'])->name('newsletter.destroy');

    Route::get('/messages', [AdminMessageController::class, 'index'])->name('messages.index');
    Route::get('/messages/{message}', [AdminMessageController::class, 'show'])->name('messages.show');
    Route::patch('/messages/{message}/replied', [AdminMessageController::class, 'markReplied'])->name('messages.replied');
    Route::delete('/messages/{message}', [AdminMessageController::class, 'destroy'])->name('messages.destroy');
});
