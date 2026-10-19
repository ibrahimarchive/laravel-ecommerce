/**
 * Shared Inertia prop shapes.
 *
 * Page components type their own props by intersecting with
 * `PageProps`, e.g.
 *
 *   const { featuredProducts } = usePage<PageProps & { featuredProducts: Product[] }>().props;
 */
export interface AuthUser {
    id: number;
    name: string;
    email: string;
    is_admin?: boolean;
    is_staff?: boolean;
    [key: string]: unknown;
}

export interface Currency {
    code: string;
    symbol: string;
    position: 'before' | 'after';
    decimals: number;
}

export interface StoreProps {
    name: string;
    tagline?: string | null;
    description?: string | null;
    email?: string | null;
    phone?: string | null;
    address?: string | null;
    country?: string | null;
    currency: Currency;
    social?: Record<string, string | null | undefined>;
    free_shipping_threshold: number;
}

export interface CartSummary {
    items_count: number;
    subtotal: number;
    subtotal_formatted: string;
}

export interface FlashProps {
    success: string | null;
    error: string | null;
    info: string | null;
}

export interface FooterPage {
    title: string;
    slug: string;
    url: string;
}

export interface PageProps {
    auth: { user: AuthUser | null };
    cart: CartSummary;
    store: StoreProps;
    flash: FlashProps;
    footerPages: FooterPage[];
    [key: string]: unknown;
}

export interface CategoryRef {
    id: number;
    name: string;
    slug: string;
    [key: string]: unknown;
}

export interface BrandRef {
    id: number;
    name: string;
    slug: string;
    logo?: string | null;
    url: string;
    [key: string]: unknown;
}

export interface CategoryOption {
    id: number;
    name: string;
    slug: string;
    image?: string | null;
    products_count?: number;
    url: string;
    children?: CategoryOption[];
    [key: string]: unknown;
}

export interface ProductImage {
    id: number;
    url: string;
    alt?: string | null;
    is_primary?: boolean;
}

export interface ProductVariant {
    id: number;
    name?: string;
    label: string;
    sku?: string | null;
    price: number;
    price_formatted: string;
    compare_price?: number | null;
    compare_price_formatted?: string | null;
    in_stock: boolean;
    stock_quantity: number;
    attribute_value_ids?: number[];
    [key: string]: unknown;
}

export interface AttributeValue {
    id: number;
    value: string;
    slug: string;
    color_hex?: string | null;
    attribute_id: number;
    attribute_name: string;
    attribute_slug: string;
    [key: string]: unknown;
}

export interface Product {
    id: number;
    name: string;
    slug: string;
    sku?: string | null;
    short_description?: string | null;
    description?: string | null;
    price: number;
    compare_price?: number | null;
    price_formatted: string;
    compare_price_formatted?: string | null;
    is_on_sale: boolean;
    discount_percentage?: number | null;
    has_variants: boolean;
    stock_quantity: number;
    in_stock: boolean;
    low_stock?: boolean;
    is_featured?: boolean;
    rating?: number | string;
    reviews_count?: number;
    image: string;
    url: string;
    category?: CategoryRef | null;
    brand?: CategoryRef | null;
    images?: ProductImage[];
    variants?: ProductVariant[];
    attribute_values?: AttributeValue[];
    [key: string]: unknown;
}

export interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

export interface Paginated<T> {
    data: T[];
    links?: PaginationLink[];
    meta?: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        links: PaginationLink[];
    };
}
