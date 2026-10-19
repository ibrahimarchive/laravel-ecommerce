import { useRef, useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import Pagination from '../../../Components/Pagination';
import type { PageProps, Paginated } from '../../../types';

interface ReviewProduct {
    name: string;
    slug: string;
}

interface Review {
    id: number;
    rating: number;
    is_approved: boolean;
    title?: string | null;
    user?: string | null;
    author_name: string;
    author_email?: string | null;
    body?: string | null;
    product?: ReviewProduct | null;
}

interface Props extends PageProps {
    reviews: Paginated<Review>;
    filters: { q?: string; status?: string; rating?: string | number };
}

export default function ReviewsIndex({ reviews, filters = {} }: Props) {
    const [q, setQ] = useState(filters.q ?? '');
    const [status, setStatus] = useState(filters.status ?? 'pending');
    const [rating, setRating] = useState(String(filters.rating ?? ''));
    const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

    const applyFilters = (next: { q: string; status: string; rating: string }) => {
        router.get('/admin/reviews', { ...next }, { preserveState: true, preserveScroll: true, replace: true });
    };

    const onSearchChange = (value: string) => {
        setQ(value);
        clearTimeout(timer.current);
        timer.current = setTimeout(() => applyFilters({ q: value, status, rating }), 350);
    };

    const onStatusChange = (value: string) => {
        setStatus(value);
        applyFilters({ q, status: value, rating });
    };

    const onRatingChange = (value: string) => {
        setRating(value);
        applyFilters({ q, status, rating: value });
    };

    function approve(review: Review) {
        router.patch(`/admin/reviews/${review.id}/approve`, {}, { preserveScroll: true });
    }

    function reject(review: Review) {
        router.patch(`/admin/reviews/${review.id}/reject`, {}, { preserveScroll: true });
    }

    function destroy(review: Review) {
        if (!confirm('Delete this review permanently?')) return;
        router.delete(`/admin/reviews/${review.id}`, { preserveScroll: true });
    }

    return (
        <AdminLayout>
            <Head title="Reviews" />

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="title text-2xl">Reviews</h1>
                    <p className="mt-1 text-sm text-ink-500">{reviews.meta?.total ?? reviews.data.length} reviews</p>
                </div>
            </div>

            <div className="mt-6 flex flex-wrap items-end gap-3 card-surface p-4">
                <div className="flex-1 min-w-[200px]">
                    <label className="mb-1 block text-xs font-medium text-ink-500">Search</label>
                    <input
                        value={q}
                        onChange={(e) => onSearchChange(e.target.value)}
                        type="text"
                        placeholder="Author, title, or product..."
                        className="w-full rounded-lg border border-bone-400 px-3 py-2 text-sm focus:border-umber-600 focus:ring-1 focus:ring-umber-600"
                    />
                </div>
                <div>
                    <label className="mb-1 block text-xs font-medium text-ink-500">Status</label>
                    <select
                        value={status}
                        onChange={(e) => onStatusChange(e.target.value)}
                        className="rounded-lg border border-bone-400 px-3 py-2 text-sm focus:border-umber-600 focus:ring-1 focus:ring-umber-600"
                    >
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="all">All</option>
                    </select>
                </div>
                <div>
                    <label className="mb-1 block text-xs font-medium text-ink-500">Rating</label>
                    <select
                        value={rating}
                        onChange={(e) => onRatingChange(e.target.value)}
                        className="rounded-lg border border-bone-400 px-3 py-2 text-sm focus:border-umber-600 focus:ring-1 focus:ring-umber-600"
                    >
                        <option value="">All</option>
                        {[1, 2, 3, 4, 5].map((n) => (
                            <option key={n} value={n}>{n} stars</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="mt-6 space-y-4">
                {reviews.data.map((review) => (
                    <div key={review.id} className="card-surface p-5">
                        <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="text-tan-600">
                                        {'★'.repeat(review.rating)}<span className="text-bone-400">{'★'.repeat(5 - review.rating)}</span>
                                    </span>
                                    {review.is_approved ? (
                                        <span className="rounded-full bg-bone-100 px-2.5 py-1 text-xs font-semibold text-umber-800">Approved</span>
                                    ) : (
                                        <span className="rounded-full bg-bone-100 px-2.5 py-1 text-xs font-semibold text-tan-800">Pending</span>
                                    )}
                                </div>
                                {review.title ? <p className="mt-1 font-semibold text-ink-950">{review.title}</p> : null}
                                <p className="text-xs text-ink-500">
                                    by {review.user || review.author_name}
                                    {review.author_email ? <span> &lt;{review.author_email}&gt;</span> : null}
                                    {' on '}
                                    {review.product ? (
                                        <Link href={`/shop/${review.product.slug}`} className="text-umber-700 hover:underline">{review.product.name}</Link>
                                    ) : (
                                        <span>a deleted product</span>
                                    )}
                                </p>
                                {review.body ? <p className="mt-2 text-sm text-ink-600">{review.body}</p> : null}
                            </div>
                            <div className="flex flex-none items-center gap-3">
                                {!review.is_approved ? (
                                    <button type="button" className="text-sm font-semibold text-umber-600 hover:text-umber-500" onClick={() => approve(review)}>Approve</button>
                                ) : (
                                    <button type="button" className="text-sm font-semibold text-tan-700 hover:text-tan-600" onClick={() => reject(review)}>Unapprove</button>
                                )}
                                <button type="button" className="text-sm font-semibold text-ink-700 hover:text-ink-600" onClick={() => destroy(review)}>Delete</button>
                            </div>
                        </div>
                    </div>
                ))}

                {!reviews.data.length && (
                    <p className="rounded-xl border border-dashed border-bone-400 bg-canvas-deep px-5 py-10 text-center text-sm text-ink-500">
                        No reviews found.
                    </p>
                )}
            </div>

            <div className="mt-6">
                <Pagination links={reviews.meta?.links ?? []} />
            </div>
        </AdminLayout>
    );
}
