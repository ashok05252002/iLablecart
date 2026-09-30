import { useParams, useSearchParams } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import ProductListing from '../components/products/ProductListing';
import { findCategory, findProduct, productsInCategory, searchProducts } from '../lib/catalog';
import { t } from '../lib/i18n';
import NotFound from './NotFound';
import Product from './Product';

/** Port of categories/view.blade.php. */
export function Category({ category }) {
    return (
        <Layout title={category.name}>
            {category.description && (
                <div className="container mt-[34px] px-[60px] max-lg:px-8 max-md:mt-4 max-md:px-4 max-md:text-sm max-sm:text-xs">
                    {category.description}
                </div>
            )}

            <ProductListing key={category.id} products={productsInCategory(category.id)} />
        </Layout>
    );
}

/** Port of search/index.blade.php. */
export function Search() {
    const [params] = useSearchParams();
    const query = params.get('query') || '';
    const title = query ? t('search.title', { query }) : t('search.results');

    return (
        <Layout title={title} hasFeature={false}>
            <div className="container px-[60px] max-lg:px-8 max-sm:px-4">
                <div className="mt-8 flex items-center justify-between max-md:mt-5">
                    <h2 className="break-all text-2xl font-medium max-sm:text-base">
                        <span>{title}</span>
                    </h2>
                </div>
            </div>

            <ProductListing key={query} products={searchProducts(query)} />
        </Layout>
    );
}

/** Bagisto resolves "/{slug}" to a product or a category (shop.product_or_category.index). */
export function ProductOrCategory() {
    const { slug } = useParams();
    const product = findProduct(slug);

    if (product) {
        return <Product key={product.id} product={product} />;
    }

    const category = findCategory(slug);

    if (category) {
        return <Category category={category} />;
    }

    return <NotFound />;
}
