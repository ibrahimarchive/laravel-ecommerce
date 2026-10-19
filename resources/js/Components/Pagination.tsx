import { Link } from '@inertiajs/react';
import type { PaginationLink } from '../types';

interface Props {
    links: PaginationLink[];
}

export default function Pagination({ links }: Props) {
    if (!(links.length > 3)) {
        return null;
    }

    return (
        <nav className="mt-10 flex flex-wrap items-center justify-center gap-2" aria-label="Pagination">
            {links.map((link, index) =>
                !link.url ? (
                    <span
                        key={index}
                        className="flex h-10 min-w-10 items-center justify-center rounded-lg border border-bone-300 px-3 text-sm text-ink-300"
                        dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                ) : (
                    <Link
                        key={index}
                        href={link.url as string}
                        preserveScroll
                        className={
                            'flex h-10 min-w-10 items-center justify-center rounded-lg border px-3 text-sm font-medium transition ' +
                            (link.active
                                ? 'border-ink-950 bg-ink-950 text-bone-100 shadow-soft'
                                : 'border-bone-300 bg-canvas text-ink-700 hover:border-tan-400 hover:bg-bone-100')
                        }
                        dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                ),
            )}
        </nav>
    );
}
