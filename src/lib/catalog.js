import products from '../data/products.json';
import categories from '../data/categories.json';

export const PLACEHOLDER = '/images/medium-product-placeholder.webp';

export const formatPrice = (value) =>
    '$' + Number(value || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** Final (payable) price of a product. */
export const finalPrice = (product) =>
    product.special_price && product.special_price < product.price ? product.special_price : product.price;

export const isOnSale = (product) => !!product.special_price && product.special_price < product.price;

export const baseImage = (product) => product.images?.[0] || PLACEHOLDER;

/** Mock ratings so cards and reviews have something to show. */
export const ratingsFor = (product) => {
    const total = product.id % 3 === 0 ? 0 : (product.id % 7) + 2;

    return { total, average: total ? 3 + ((product.id % 5) / 2.5) : 0 };
};

export const allProducts = products;

export const findProduct = (slug) => products.find((product) => product.slug === slug);

export const findProductById = (id) => products.find((product) => product.id === Number(id));

/** Category tree (children nested), root children only at the top level. */
export function categoryTree() {
    const byParent = {};

    for (const category of categories) {
        (byParent[category.parent_id] ||= []).push(category);
    }

    const build = (parentId) =>
        (byParent[parentId] || []).map((category) => ({
            ...category,
            url: `/${category.slug}`,
            children: build(category.id),
        }));

    return build(1);
}

export const findCategory = (slug) => categories.find((category) => category.slug === slug);

export const findCategoryById = (id) => categories.find((category) => category.id === Number(id));

/** Ancestors of a category from the top level down, including the category itself. */
export function categoryPath(category) {
    const path = [];

    for (let node = category; node; node = findCategoryById(node.parent_id)) {
        path.unshift(node);
    }

    return path;
}

/** Products in a category or any of its descendants. */
export function productsInCategory(categoryId) {
    const ids = new Set([Number(categoryId)]);

    let grew = true;

    while (grew) {
        grew = false;

        for (const category of categories) {
            if (ids.has(category.parent_id) && !ids.has(category.id)) {
                ids.add(category.id);
                grew = true;
            }
        }
    }

    return products.filter((product) => product.categories.some((id) => ids.has(id)));
}

export function sortProducts(list, sort) {
    const sorted = [...list];

    const comparators = {
        'name-asc': (a, b) => a.name.localeCompare(b.name),
        'name-desc': (a, b) => b.name.localeCompare(a.name),
        'created_at-desc': (a, b) => b.created_at.localeCompare(a.created_at) || a.id - b.id,
        'created_at-asc': (a, b) => a.created_at.localeCompare(b.created_at) || a.id - b.id,
        'price-asc': (a, b) => finalPrice(a) - finalPrice(b),
        'price-desc': (a, b) => finalPrice(b) - finalPrice(a),
    };

    return comparators[sort] ? sorted.sort(comparators[sort]) : sorted;
}

export function searchProducts(query) {
    const needle = (query || '').trim().toLowerCase();

    if (!needle) {
        return [];
    }

    return products.filter(
        (product) => product.name.toLowerCase().includes(needle) || product.sku.toLowerCase().includes(needle),
    );
}

/** Related products: others sharing a category with this one. */
export function relatedProducts(product, limit = 8) {
    return products
        .filter((other) => other.id !== product.id && other.categories.some((id) => product.categories.includes(id)))
        .slice(0, limit);
}
