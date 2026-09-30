import Layout from '../components/layout/Layout';
import { CategoriesCarousel, ImageCarousel, ProductsCarousel, StaticContent } from '../components/home/Carousels';
import sections from '../data/sections.json';
import { findCategoryById, productsInCategory, sortProducts } from '../lib/catalog';

/** Port of home/index.blade.php: renders the theme sections in order. */
export default function Home() {
    return (
        <Layout title="Demo store">
            {sections.map((section) => {
                const options = section.options;

                switch (section.type) {
                    case 'image_carousel':
                        return <ImageCarousel key={section.id} images={options.images} />;

                    case 'static_content':
                        return <StaticContent key={section.id} html={options.html} css={options.css} />;

                    case 'category_carousel':
                        return <CategoriesCarousel key={section.id} />;

                    case 'product_carousel': {
                        const { category_id: categoryId, sort, limit } = options.filters;
                        const category = findCategoryById(categoryId);
                        const products = sortProducts(productsInCategory(categoryId), sort).slice(0, limit);

                        return (
                            <ProductsCarousel
                                key={section.id}
                                title={options.title}
                                products={products}
                                navigationLink={category ? `/${category.slug}` : '/search'}
                            />
                        );
                    }

                    default:
                        return null;
                }
            })}
        </Layout>
    );
}
