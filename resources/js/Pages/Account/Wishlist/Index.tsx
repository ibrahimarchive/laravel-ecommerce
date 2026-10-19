import { Head, Link, router } from '@inertiajs/react';
import AccountLayout from '../../../Layouts/AccountLayout';

interface WishlistItem {
    id: number;
    slug: string;
    product_id: number;
    name: string;
    url: string;
    image: string;
    price_formatted: string;
    in_stock: boolean;
}

interface Props {
    items?: WishlistItem[];
}

export default function WishlistIndex({ items = [] }: Props) {
    const remove = (item: WishlistItem) => {
        router.delete(`/account/wishlist/${item.slug}`, { preserveScroll: true });
    };

    const addToCart = (item: WishlistItem) => {
        router.post(
            '/cart',
            { product_id: item.product_id, product_variant_id: null, quantity: 1 },
            { preserveScroll: true },
        );
    };

    return (
        <AccountLayout>
            <Head title="My wishlist" />

            <div className="flex items-center justify-between">
                <h1 className="title text-2xl">Wishlist</h1>
                <Link href="/shop" className="text-sm font-semibold text-umber-700 hover:text-umber-600">Continue shopping →</Link>
            </div>

            {items.length ? (
                <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {items.map((item) => (
                        <div key={item.id} className="card-surface p-4">
                            <Link href={item.url} className="block">
                                <img src={item.image} alt={item.name} className="h-48 w-full rounded-lg object-cover" />
                            </Link>
                            <div className="mt-3">
                                <Link href={item.url} className="font-semibold text-ink-950 hover:text-umber-700">{item.name}</Link>
                                <p className="mt-1 font-bold text-ink-950">{item.price_formatted}</p>
                                {!item.in_stock && <p className="mt-1 text-xs font-semibold text-ink-700">Out of stock</p>}
                            </div>
                            <div className="mt-4 flex gap-3">
                                <button
                                    type="button"
                                    disabled={!item.in_stock}
                                    onClick={() => addToCart(item)}
                                    className="flex-1 btn btn-primary btn-sm"
                                >
                                    Add to cart
                                </button>
                                <button type="button" onClick={() => remove(item)} className="rounded-lg border border-bone-400 px-3 py-2 text-sm font-semibold text-ink-600 hover:bg-bone-50">
                                    Remove
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="mt-6 rounded-xl border border-dashed border-bone-400 bg-canvas-deep px-5 py-12 text-center text-sm text-ink-500">
                    Your wishlist is empty. <Link href="/shop" className="font-semibold text-umber-700 hover:underline">Browse products</Link>
                </p>
            )}
        </AccountLayout>
    );
}
