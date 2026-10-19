import { useState } from 'react';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import type { Currency, PageProps, Product } from '../../types';
import StorefrontLayout from '../../Layouts/StorefrontLayout';
import ProductCard from '../../Components/ProductCard';

interface Review {
    id: number;
    author_name?: string | null;
    created_at?: string | null;
    rating: number;
    title?: string | null;
    body?: string | null;
}

interface Props extends PageProps {
    product: Product;
    reviews: Review[];
    ratingBreakdown: Record<string, number | string | null | undefined>;
    relatedProducts: Product[];
    inWishlist: boolean;
    canReview: boolean;
}

const starValues = [1, 2, 3, 4, 5];

export default function ShopShow({
    product,
    reviews,
    ratingBreakdown,
    relatedProducts,
    inWishlist,
    canReview,
}: Props) {
    const page = usePage<PageProps>();
    const { store } = page.props;

    const currency: Currency = store?.currency ?? { code: 'USD', symbol: '$', position: 'before', decimals: 2 };
    const isGuest = !page.props.auth?.user;

    const images = product.images ?? [];
    const gallery: string[] = images.length ? images.map((image) => image.url) : [product.image];

    const [activeImage, setActiveImage] = useState(gallery[0]);
    const [quantity, setQuantity] = useState(1);
    const [variantId, setVariantId] = useState<number | null>(null);
    const [wished, setWished] = useState(inWishlist);

    const variants = product.variants ?? [];
    const selectedVariant = variants.find((variant) => variant.id === variantId) ?? null;

    const maxQuantity = selectedVariant
        ? Math.max(selectedVariant.stock_quantity ?? 1, 1)
        : Math.max(product.stock_quantity ?? 99, 1);

    const unitPrice = selectedVariant?.price_formatted ?? product.price_formatted;
    const savings = product.is_on_sale ? product.compare_price_formatted : null;

    const addForm = useForm({
        product_id: product.id,
        product_variant_id: null as number | null,
        quantity: 1,
    });

    function addToCart() {
        addForm.transform((data) => ({
            ...data,
            product_variant_id: variantId,
            quantity,
        }));
        addForm.post('/cart', { preserveScroll: true });
    }

    function toggleWishlist() {
        if (isGuest) {
            router.visit('/login');

            return;
        }

        setWished((current) => !current);
        router.post(`/account/wishlist/${product.slug}/toggle`, {}, { preserveScroll: true });
    }

    const reviewForm = useForm({
        rating: 5,
        title: '',
        body: '',
        author_name: '',
        author_email: '',
    });

    function submitReview() {
        reviewForm.post(`/products/${product.slug}/reviews`, {
            preserveScroll: true,
            onSuccess: () => reviewForm.reset('title', 'body'),
        });
    }

    function stepQuantity(delta: number) {
        const next = quantity + delta;
        if (next >= 1 && next <= maxQuantity) {
            setQuantity(next);
        }
    }

    const breakdown = (() => {
        const total =
            Object.values(ratingBreakdown ?? {}).reduce<number>(
                (sum, value) => sum + Number(value ?? 0),
                0,
            ) || 1;

        return starValues
            .slice()
            .reverse()
            .map((star) => {
                const count = Number(ratingBreakdown?.[star] ?? 0);

                return { star, count, percent: Math.round((count / total) * 100) };
            });
    })();

    return (
        <StorefrontLayout>
            <Head title={product.name} />

            <div className="container-page py-10 lg:py-14">
                {/* Breadcrumbs */}
                <nav className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-ink-400">
                    <Link href="/" className="transition hover:text-umber-700">Home</Link>
                    <span className="text-bone-400">/</span>
                    <Link href="/shop" className="transition hover:text-umber-700">Shop</Link>
                    {product.category && (
                        <>
                            <span className="text-bone-400">/</span>
                            <Link href={`/category/${product.category.slug}`} className="transition hover:text-umber-700">{product.category.name}</Link>
                        </>
                    )}
                </nav>

                <div className="mt-8 grid gap-12 lg:grid-cols-2">
                    {/* Gallery */}
                    <div>
                        <div className="overflow-hidden rounded-2xl border border-bone-300 bg-bone-100 shadow-soft">
                            <img src={activeImage} alt={product.name} className="aspect-square w-full object-cover" />
                        </div>

                        {gallery.length > 1 && (
                            <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
                                {gallery.map((image, index) => (
                                    <button
                                        key={index}
                                        type="button"
                                        className={`h-20 w-20 shrink-0 overflow-hidden rounded-lg border transition ${activeImage === image ? 'border-tan-500 ring-2 ring-tan-400/40' : 'border-bone-300 hover:border-tan-400'}`}
                                        onClick={() => setActiveImage(image)}
                                    >
                                        <img src={image} alt={`${product.name} view ${index + 1}`} className="h-full w-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Details */}
                    <div>
                        <div className="flex items-center gap-3">
                            {product.brand && (
                                <Link href={`/brand/${product.brand.slug}`} className="eyebrow transition hover:text-umber-700">
                                    {product.brand.name}
                                </Link>
                            )}
                            {product.is_on_sale && (
                                <span className="badge badge-tan">Save {product.discount_percentage}%</span>
                            )}
                        </div>

                        <h1 className="title mt-3 text-3xl sm:text-4xl">{product.name}</h1>

                        {product.reviews_count ? (
                            <div className="mt-4 flex items-center gap-2 text-sm text-ink-500">
                                <span className="flex gap-0.5 text-tan-600">
                                    {starValues.map((star) => (
                                        <svg key={star} viewBox="0 0 20 20" className={`h-4 w-4 ${star <= Math.round(Number(product.rating ?? 0)) ? 'fill-current' : 'fill-bone-400'}`}>
                                            <path d="M10 1.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L10 14.9l-5.2 2.7 1-5.8L1.5 7.7l5.9-.9L10 1.5z" />
                                        </svg>
                                    ))}
                                </span>
                                <span>{product.rating} · {product.reviews_count} reviews</span>
                            </div>
                        ) : null}

                        <div className="mt-6 flex flex-wrap items-baseline gap-3 border-y border-bone-300 py-5">
                            <span className="font-display text-3xl text-ink-950">{unitPrice}</span>
                            {savings && (
                                <span className="text-lg text-ink-400 line-through">{savings}</span>
                            )}
                            <span className={`ml-auto badge ${product.in_stock ? 'badge-tan' : 'badge-ink'}`}>
                                {product.in_stock ? 'In stock' : 'Sold out'}
                            </span>
                        </div>

                        {product.short_description && (
                            <p className="mt-6 text-sm leading-relaxed text-ink-600">{product.short_description}</p>
                        )}

                        {/* Options */}
                        {variants.length > 0 && (
                            <div className="mt-8">
                                <label className="label" htmlFor="variant">Choose an option</label>
                                <select
                                    id="variant"
                                    value={variantId === null ? '' : String(variantId)}
                                    onChange={(event) => setVariantId(event.target.value === '' ? null : Number(event.target.value))}
                                    className="select"
                                >
                                    <option value="" disabled>Select an option</option>
                                    {variants.map((variant) => (
                                        <option key={variant.id} value={variant.id} disabled={!variant.in_stock}>
                                            {variant.label}{variant.in_stock ? '' : ' — sold out'}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Purchase */}
                        <div className="mt-8 flex flex-wrap items-center gap-4">
                            <div className="flex h-11 items-center rounded-lg border border-bone-400 bg-bone-50">
                                <button type="button" className="h-full w-11 text-lg text-ink-600 transition hover:text-ink-950" onClick={() => stepQuantity(-1)}>−</button>
                                <input
                                    value={quantity}
                                    onChange={(event) => setQuantity(Number(event.target.value))}
                                    type="number"
                                    min="1"
                                    max={maxQuantity}
                                    className="h-full w-12 border-0 bg-transparent text-center text-sm font-semibold text-ink-900 focus:outline-none"
                                />
                                <button type="button" className="h-full w-11 text-lg text-ink-600 transition hover:text-ink-950" onClick={() => stepQuantity(1)}>+</button>
                            </div>

                            <button
                                type="button"
                                className="btn btn-primary flex-1 sm:flex-none"
                                disabled={!product.in_stock || (variants.length > 0 && !variantId) || addForm.processing}
                                onClick={addToCart}
                            >
                                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current"><path d="M7 4h-2l-1 2v2h2V6h14v2h2V6l-1-2h-2V2H7v2Zm-3 6v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10H4Zm4 3h8v2H8v-2Z" /></svg>
                                {addForm.processing ? 'Adding...' : product.in_stock ? 'Add to cart' : 'Sold out'}
                            </button>

                            <button
                                type="button"
                                className="btn btn-outline h-11 w-11 !p-0 justify-center"
                                aria-label={wished ? 'Remove from wishlist' : 'Add to wishlist'}
                                onClick={toggleWishlist}
                            >
                                <svg viewBox="0 0 24 24" className={`h-5 w-5 ${wished ? 'fill-tan-500' : 'fill-none stroke-current'}`} strokeWidth="1.6">
                                    <path d="M12 20s-7-4.35-7-9.5A4.5 4.5 0 0 1 12 7a4.5 4.5 0 0 1 7 3.5C19 15.65 12 20 12 20Z" />
                                </svg>
                            </button>
                        </div>

                        {addForm.errors.product_variant_id && (
                            <p className="mt-3 text-sm text-ink-800">{addForm.errors.product_variant_id}</p>
                        )}
                        {addForm.errors.quantity && (
                            <p className="mt-3 text-sm text-ink-800">{addForm.errors.quantity}</p>
                        )}

                        {/* Meta */}
                        <dl className="mt-10 space-y-3 border-t border-bone-300 pt-6 text-sm">
                            {product.sku && (
                                <div className="flex gap-3">
                                    <dt className="w-32 shrink-0 text-ink-400">SKU</dt>
                                    <dd className="text-ink-800">{product.sku}</dd>
                                </div>
                            )}
                            {product.category && (
                                <div className="flex gap-3">
                                    <dt className="w-32 shrink-0 text-ink-400">Category</dt>
                                    <dd>
                                        <Link href={`/category/${product.category.slug}`} className="text-ink-800 underline decoration-bone-400 underline-offset-4 hover:text-umber-700">
                                            {product.category.name}
                                        </Link>
                                    </dd>
                                </div>
                            )}
                            {product.attribute_values?.length ? (
                                <div className="flex gap-3">
                                    <dt className="w-32 shrink-0 text-ink-400">Details</dt>
                                    <dd className="flex flex-wrap gap-2">
                                        {product.attribute_values.map((value) => (
                                            <span key={value.id} className="badge badge-muted">
                                                {value.attribute_name}: {value.value}
                                            </span>
                                        ))}
                                    </dd>
                                </div>
                            ) : null}
                        </dl>
                    </div>
                </div>

                {/* Description + reviews */}
                <div className="mt-16 grid gap-12 lg:grid-cols-[1fr_360px]">
                    <div>
                        {product.description && (
                            <div className="card-surface p-8">
                                <h2 className="title text-xl">Product details</h2>
                                <div className="prose-content mt-5" dangerouslySetInnerHTML={{ __html: product.description }} />
                            </div>
                        )}

                        <div className="mt-10">
                            <h2 className="title text-2xl">Customer reviews</h2>

                            {reviews.length > 0 ? (
                                <div className="mt-6 space-y-6">
                                    {reviews.map((review) => (
                                        <article key={review.id} className="border-b border-bone-300 pb-6 last:border-0">
                                            <div className="flex items-center gap-3">
                                                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-charcoal-900 text-sm font-semibold text-bone-100">
                                                    {(review.author_name || 'A').charAt(0).toUpperCase()}
                                                </span>
                                                <div>
                                                    <p className="text-sm font-semibold text-ink-950">{review.author_name}</p>
                                                    <p className="text-xs text-ink-400">{review.created_at}</p>
                                                </div>
                                                <span className="ml-auto flex gap-0.5 text-tan-600">
                                                    {starValues.map((star) => (
                                                        <svg key={star} viewBox="0 0 20 20" className={`h-3.5 w-3.5 ${star <= review.rating ? 'fill-current' : 'fill-bone-400'}`}>
                                                            <path d="M10 1.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L10 14.9l-5.2 2.7 1-5.8L1.5 7.7l5.9-.9L10 1.5z" />
                                                        </svg>
                                                    ))}
                                                </span>
                                            </div>
                                            {review.title && (
                                                <h3 className="mt-3 text-sm font-semibold text-ink-900">{review.title}</h3>
                                            )}
                                            {review.body && (
                                                <p className="mt-1 text-sm leading-relaxed text-ink-600">{review.body}</p>
                                            )}
                                        </article>
                                    ))}
                                </div>
                            ) : (
                                <p className="mt-6 rounded-2xl border border-dashed border-bone-400 bg-canvas-deep px-6 py-10 text-center text-sm text-ink-500">
                                    No reviews yet. Be the first to share your thoughts.
                                </p>
                            )}

                            {/* Review form */}
                            {canReview && (
                                <div className="card-surface mt-10 p-8">
                                    <h3 className="title text-lg">Write a review</h3>
                                    <form
                                        className="mt-5 space-y-4"
                                        onSubmit={(event) => {
                                            event.preventDefault();
                                            submitReview();
                                        }}
                                    >
                                        <div>
                                            <span className="label">Your rating</span>
                                            <div className="flex gap-1">
                                                {starValues.map((star) => (
                                                    <button
                                                        key={star}
                                                        type="button"
                                                        className={`text-2xl transition ${star <= reviewForm.data.rating ? 'text-tan-600' : 'text-bone-400 hover:text-tan-400'}`}
                                                        onClick={() => reviewForm.setData('rating', star)}
                                                    >
                                                        ★
                                                    </button>
                                                ))}
                                            </div>
                                            {reviewForm.errors.rating && (
                                                <p className="mt-1 text-sm text-ink-800">{reviewForm.errors.rating}</p>
                                            )}
                                        </div>

                                        {isGuest && (
                                            <div className="grid gap-4 sm:grid-cols-2">
                                                <div>
                                                    <label className="label" htmlFor="author_name">Name</label>
                                                    <input id="author_name" value={reviewForm.data.author_name} onChange={(event) => reviewForm.setData('author_name', event.target.value)} className="input" />
                                                    {reviewForm.errors.author_name && (
                                                        <p className="mt-1 text-sm text-ink-800">{reviewForm.errors.author_name}</p>
                                                    )}
                                                </div>
                                                <div>
                                                    <label className="label" htmlFor="author_email">Email</label>
                                                    <input id="author_email" value={reviewForm.data.author_email} onChange={(event) => reviewForm.setData('author_email', event.target.value)} type="email" className="input" />
                                                    {reviewForm.errors.author_email && (
                                                        <p className="mt-1 text-sm text-ink-800">{reviewForm.errors.author_email}</p>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        <div>
                                            <label className="label" htmlFor="review_title">Title</label>
                                            <input id="review_title" value={reviewForm.data.title} onChange={(event) => reviewForm.setData('title', event.target.value)} className="input" placeholder="Summarise your experience" />
                                        </div>

                                        <div>
                                            <label className="label" htmlFor="review_body">Review</label>
                                            <textarea id="review_body" value={reviewForm.data.body} onChange={(event) => reviewForm.setData('body', event.target.value)} rows={4} className="textarea" placeholder="What did you think?"></textarea>
                                        </div>

                                        <button type="submit" className="btn btn-primary" disabled={reviewForm.processing}>
                                            {reviewForm.processing ? 'Submitting...' : 'Submit review'}
                                        </button>
                                    </form>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Summary rail */}
                    <aside className="space-y-6">
                        <div className="card-surface p-6">
                            <p className="eyebrow">Overall rating</p>
                            <div className="mt-3 flex items-end gap-3">
                                <span className="font-display text-5xl text-ink-950">{product.rating ?? '0.0'}</span>
                                <span className="pb-2 text-sm text-ink-400">out of 5</span>
                            </div>
                            <div className="mt-5 space-y-2">
                                {breakdown.map((row) => (
                                    <div key={row.star} className="flex items-center gap-3 text-xs">
                                        <span className="w-8 text-ink-500">{row.star}★</span>
                                        <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-bone-200">
                                            <span className="block h-full rounded-full bg-tan-400" style={{ width: `${row.percent}%` }}></span>
                                        </span>
                                        <span className="w-8 text-right text-ink-400">{row.count}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="panel-warm rounded-2xl border border-bone-300 p-6">
                            <p className="eyebrow">Need a hand?</p>
                            <p className="mt-3 text-sm leading-relaxed text-ink-700">
                                Questions about sizing, delivery or returns? Our team replies within one business day.
                            </p>
                            <Link href="/contact" className="btn btn-outline btn-sm mt-5">Contact support</Link>
                        </div>
                    </aside>
                </div>

                {/* Related */}
                {relatedProducts.length > 0 && (
                    <section className="mt-20">
                        <div className="flex items-end justify-between gap-4">
                            <div>
                                <p className="eyebrow">You may also like</p>
                                <h2 className="title mt-2 text-2xl">Related <b>products</b></h2>
                            </div>
                            <Link href="/shop" className="btn btn-ghost btn-sm">Browse shop</Link>
                        </div>

                        <div className="mt-8 grid grid-cols-2 gap-5 lg:grid-cols-4">
                            {relatedProducts.slice(0, 4).map((item) => (
                                <ProductCard key={item.id} product={item} currency={currency} />
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </StorefrontLayout>
    );
}
