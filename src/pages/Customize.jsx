import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { getCustomizer } from '../designer/constants/surfaceConfig';
import { ProductDesigner } from '../designer/ProductDesigner';
import { findProductById } from '../lib/catalog';
import { useStore } from '../store/StoreContext';
import NotFound from './NotFound';

/**
 * Port of the Bagisto designer page (custom-shirt/index.blade.php, route shop.custom_shirt.index):
 * header without footer, designer, then "Save design & Proceed" adds the design to the cart.
 */
export default function Customize() {
    const { id } = useParams();
    const { state } = useLocation();
    const navigate = useNavigate();
    const { addToCart, flash } = useStore();
    const product = findProductById(id);

    if (!product || !product.is_customizable) {
        return <NotFound />;
    }

    const customizer = getCustomizer(product.customizer);

    const onSaved = (design) => {
        const names = Object.fromEntries(customizer.surfaces.map((surface) => [surface.id, surface.name]));

        addToCart(
            product,
            state?.quantity || 1,
            state?.options || [],
            {
                customized: true,
                customized_preview: design.preview,
                customized_images: Object.fromEntries(Object.entries(design.images).map(([key, url]) => [names[key] || key, url])),
                shirt_color: design.color !== 'transparent' ? design.color : null,
            },
            `Customized ${customizer.label} successfully added to your cart!`,
        );

        navigate('/checkout/cart');
    };

    return (
        <Layout title={`${product.name} — ${customizer.label} Designer`} hasFeature={false} hasFooter={false}>
            <ProductDesigner
                key={product.id}
                title={product.name}
                backUrl={`/${product.slug}`}
                persistKey={String(product.id)}
                customizer={customizer}
                onSaved={onSaved}
                onError={(message) => flash('error', message)}
            />
        </Layout>
    );
}
