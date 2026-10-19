import { Link, useForm } from '@inertiajs/react';
import type { Currency, Product } from '../types';

interface Props {
    product: Product;
    currency?: Currency;
}

export default function ProductCard({ product }: Props) {
    const form = useForm({
        product_id: product.id,
        product_variant_id: null,
        quantity: 1,
    });

    const discountLabel = product.discount_percentage ? `−${product.discount_percentage}%` : null;
    const ratingLabel = Number(product.rating ?? 0);

    const addToCart = () => {
        form.post('/cart', { preserveScroll: true });
    };

    return (
        <article className="card-surface card-surface-hover group flex h-full flex-col overflow-hidden">
            <div className="relative">
                <Link href={product.url} className="block aspect-square overflow-hidden bg-bone-200">
                    <img
                        src={product.image}
                        alt={product.name}
                        loading="lazy"
                        className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-[1.04]"
                    />
                </Link>

                <div className="pointer-events-none absolute left-4 top-4 flex flex-col items-start gap-2">
                    {!product.in_stock ? (
                        <span className="badge badge-ink">Sold out</span>
                    ) : discountLabel ? (
                        <span className="badge badge-tan">{discountLabel}</span>
                    ) : null}
                    {product.is_featured ? (
                        <span className="badge badge-muted">Featured</span>
                    ) : product.low_stock ? (
                        <span className="badge badge-muted">Low stock</span>
                    ) : null}
                </div>
            </div>

            <div className="flex flex-1 flex-col p-5">
                <p className="eyebrow">{product.brand?.name ?? 'ShopFront Edit'}</p>

                <h3 className="mt-2 text-[15px] font-medium leading-snug text-ink-950">
                    <Link href={product.url} className="transition hover:text-umber-700">{product.name}</Link>
                </h3>

                {product.reviews_count ? (
                    <div className="mt-2 flex items-center gap-1.5">
                        <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <svg
                                    key={star}
                                    viewBox="0 0 20 20"
                                    className={
                                        'h-3.5 w-3.5 ' + (star <= Math.round(ratingLabel) ? 'fill-tan-500' : 'fill-bone-400')
                                    }
                                >
                                    <path d="M10 1.5l2.6 5.3 5.9.85-4.25 4.14 1 5.87L10 14.9l-5.25 2.76 1-5.87L1.5 7.65l5.9-.85L10 1.5z" />
                                </svg>
                            ))}
                        </div>
                        <span className="text-xs text-ink-400">({product.reviews_count})</span>
                    </div>
                ) : null}

                <div className="mt-4 flex items-end justify-between gap-3 pt-1">
                    <div className="flex items-baseline gap-2">
                        <span className="font-display text-xl text-ink-950">{product.price_formatted}</span>
                        {product.is_on_sale ? (
                            <span className="text-xs text-ink-400 line-through">
                                {product.compare_price_formatted}
                            </span>
                        ) : null}
                    </div>
                </div>

                <div className="mt-5 pt-1">
                    {product.has_variants ? (
                        <Link
                            href={product.url}
                            className="btn btn-outline btn-sm w-full justify-center"
                        >
                            Choose options
                        </Link>
                    ) : (
                        <button
                            type="button"
                            className="btn btn-primary btn-sm w-full justify-center"
                            disabled={!product.in_stock || form.processing}
                            onClick={addToCart}
                        >
                            {form.processing ? (
                                <span>Adding...</span>
                            ) : product.in_stock ? (
                                <span>Add to cart</span>
                            ) : (
                                <span>Sold out</span>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </article>
    );
}
