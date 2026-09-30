import { Link, useNavigate } from 'react-router-dom';
import { t } from '../../lib/i18n';
import { baseImage, formatPrice, isOnSale, ratingsFor } from '../../lib/catalog';
import { useStore } from '../../store/StoreContext';
import { Ratings, cx } from '../ui';

/** Port of products/prices/*.blade.php: the price block shown on cards and the product page. */
export function Price({ product }) {
    const onSale = isOnSale(product);

    if (product.type === 'configurable') {
        return (
            <>
                <p className="price-label text-sm text-zinc-500 max-sm:text-xs max-sm:leading-4">{t('products.prices.configurable.as-low-as')}</p>
                <p className="final-price font-semibold max-sm:leading-4">{formatPrice(product.price)}</p>
            </>
        );
    }

    if (product.type === 'booking') {
        return (
            <>
                {onSale ? (
                    <>
                        <p className="regular-price font-medium text-zinc-500 line-through max-sm:text-sm max-sm:leading-4">{formatPrice(product.price)}</p>
                        <p className="final-price font-semibold max-sm:leading-4">{formatPrice(product.special_price)}</p>
                    </>
                ) : (
                    <p className="final-price font-semibold max-sm:leading-4">{formatPrice(product.price)}</p>
                )}
            </>
        );
    }

    return onSale ? (
        <>
            <p className="final-price font-medium text-zinc-500 line-through max-sm:leading-4">{formatPrice(product.price)}</p>
            <p className="font-semibold max-sm:leading-4">{formatPrice(product.special_price)}</p>
        </>
    ) : (
        <p className="final-price font-semibold max-sm:leading-4">{formatPrice(product.price)}</p>
    );
}

/** Products needing options go to the product page instead of straight into the cart. */
const needsOptions = (product) => ['configurable', 'bundle', 'booking', 'grouped', 'downloadable'].includes(product.type);

function useCardActions(product) {
    const { addToCart, toggleWishlist, addToCompare, wishlist, flash } = useStore();

    return {
        isWishlist: wishlist.includes(product.id),
        addToWishlist: () => toggleWishlist(product),
        addToCompare: () => addToCompare(product),
        addToCart: (navigate) => {
            if (needsOptions(product)) {
                flash('warning', t('checkout.cart.missing-options') !== 'checkout.cart.missing-options'
                    ? t('checkout.cart.missing-options')
                    : 'Options are missing for this product.');
                navigate?.();

                return;
            }

            addToCart(product);
        },
    };
}

/** Port of components/products/card.blade.php (grid and list modes). */
export default function ProductCard({ product, mode = 'grid', className = '' }) {
    const { isWishlist, addToWishlist, addToCompare, addToCart } = useCardActions(product);
    const url = `/${product.slug}`;
    const ratings = ratingsFor(product);
    const onSale = isOnSale(product);
    const navigate = useNavigate();
    const goToProduct = () => navigate(url);

    if (mode === 'list') {
        return (
            <div className={cx('relative flex max-w-max grid-cols-2 gap-4 overflow-hidden rounded max-sm:flex-wrap', className)}>
                <div className="group relative max-h-[258px] max-w-[250px] overflow-hidden">
                    <Link to={url}>
                        <img
                            className="relative min-w-[250px] bg-zinc-100 transition-all duration-300 group-hover:scale-105"
                            src={baseImage(product)}
                            width="291"
                            height="300"
                            alt={product.name}
                            loading="lazy"
                        />
                    </Link>

                    <div className="action-items bg-black">
                        {onSale ? (
                            <p className="absolute top-5 inline-block rounded-[44px] bg-red-500 px-2.5 text-sm text-white max-sm:ltr:left-2 ltr:left-5 rtl:right-5">
                                {t('components.products.card.sale')}
                            </p>
                        ) : (
                            product.is_new && (
                                <p className="absolute top-5 inline-block rounded-[44px] bg-navyBlue px-2.5 text-sm text-white max-sm:ltr:left-2 ltr:left-5 rtl:right-5">
                                    {t('components.products.card.new')}
                                </p>
                            )
                        )}

                        <div className="opacity-0 transition-all duration-300 group-hover:bottom-0 group-hover:opacity-100 max-sm:opacity-100">
                            <span
                                className={cx(
                                    'absolute top-5 flex h-[30px] w-[30px] cursor-pointer items-center justify-center rounded-md bg-white text-2xl ltr:right-5 rtl:left-5',
                                    isWishlist ? 'icon-heart-fill text-red-600' : 'icon-heart',
                                )}
                                role="button"
                                aria-label={t('components.products.card.add-to-wishlist')}
                                tabIndex={0}
                                onClick={addToWishlist}
                            />

                            <span
                                className="icon-compare absolute top-16 flex h-[30px] w-[30px] cursor-pointer items-center justify-center rounded-md bg-white text-2xl ltr:right-5 rtl:left-5"
                                role="button"
                                aria-label={t('components.products.card.add-to-compare')}
                                tabIndex={0}
                                onClick={addToCompare}
                            />
                        </div>
                    </div>
                </div>

                <div className="grid content-start gap-4">
                    <p className="text-base">{product.name}</p>

                    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-lg font-semibold">
                        <Price product={product} />
                    </div>

                    {ratings.total ? (
                        <Ratings average={ratings.average} total={ratings.total} showTitle={false} />
                    ) : (
                        <p className="text-sm text-zinc-500">{t('components.products.card.review-description')}</p>
                    )}

                    <button className="primary-button whitespace-nowrap px-8 py-2.5" onClick={() => addToCart(goToProduct)}>
                        {t('components.products.card.add-to-cart')}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div
            className={cx(
                '1180:transtion-all group w-full rounded-md 1180:relative 1180:grid 1180:content-start 1180:overflow-hidden 1180:duration-300 1180:hover:shadow-[0_5px_10px_rgba(0,0,0,0.1)]',
                className,
            )}
        >
            <div className="relative max-h-[300px] max-w-[291px] overflow-hidden max-md:max-h-60 max-md:max-w-full max-md:rounded-lg max-sm:max-h-[200px] max-sm:max-w-full">
                <Link to={url} aria-label={product.name}>
                    <div className="relative bg-zinc-100 transition-all duration-300 after:block after:pb-[calc(100%+9px)] after:content-['_'] group-hover:scale-105">
                        <img
                            className="absolute inset-0 h-full w-full object-cover"
                            src={baseImage(product)}
                            width="291"
                            height="300"
                            alt={product.name}
                            loading="lazy"
                        />
                    </div>
                </Link>

                {ratings.total > 0 && (
                    <Ratings
                        className="absolute bottom-1.5 items-center !border-white bg-white/80 !px-2 !py-1 text-xs max-sm:!px-1.5 max-sm:!py-0.5 ltr:left-1.5 rtl:right-1.5"
                        average={ratings.average}
                        total={ratings.total}
                        showTitle={false}
                    />
                )}

                <div className="action-items bg-black">
                    {onSale ? (
                        <p className="absolute top-1.5 inline-block rounded-[44px] bg-red-600 px-2.5 text-sm text-white max-sm:rounded-l-none max-sm:rounded-r-xl max-sm:px-2 max-sm:py-0.5 max-sm:text-xs ltr:left-1.5 max-sm:ltr:left-0 rtl:right-5 max-sm:rtl:right-0">
                            {t('components.products.card.sale')}
                        </p>
                    ) : (
                        product.is_new && (
                            <p className="absolute top-1.5 inline-block rounded-[44px] bg-navyBlue px-2.5 text-sm text-white max-sm:rounded-l-none max-sm:rounded-r-xl max-sm:px-2 max-sm:py-0.5 max-sm:text-xs ltr:left-1.5 max-sm:ltr:left-0 rtl:right-1.5 max-sm:rtl:right-0">
                                {t('components.products.card.new')}
                            </p>
                        )
                    )}

                    <div className="opacity-0 transition-all duration-300 group-hover:bottom-0 group-hover:opacity-100 max-lg:opacity-100 max-sm:opacity-100">
                        <span
                            className={cx(
                                'absolute top-2.5 flex h-6 w-6 items-center justify-center rounded-full border border-zinc-200 bg-white text-lg md:hidden ltr:right-1.5 rtl:left-1.5',
                                isWishlist ? 'icon-heart-fill text-red-500' : 'icon-heart',
                            )}
                            role="button"
                            aria-label={t('components.products.card.add-to-wishlist')}
                            tabIndex={0}
                            onClick={addToWishlist}
                        />

                        <span
                            className="icon-compare absolute top-10 flex h-6 w-6 items-center justify-center rounded-full border border-zinc-200 bg-white text-lg sm:hidden ltr:right-1.5 rtl:left-1.5"
                            role="button"
                            aria-label={t('components.products.card.add-to-compare')}
                            tabIndex={0}
                            onClick={addToCompare}
                        />
                    </div>
                </div>
            </div>

            <div className="-mt-9 grid max-w-[291px] translate-y-9 content-start gap-2.5 bg-white p-2.5 transition-transform duration-300 ease-out group-hover:-translate-y-0 group-hover:rounded-t-lg max-md:relative max-md:mt-0 max-md:translate-y-0 max-md:gap-0 max-md:px-0 max-md:py-1.5 max-sm:min-w-[170px] max-sm:max-w-[192px]">
                <p className="break-words text-base font-medium max-md:mb-1.5 max-md:max-w-56 max-md:whitespace-break-spaces max-md:leading-6 max-sm:max-w-[192px] max-sm:text-sm max-sm:leading-4">
                    {product.name}
                </p>

                <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-lg font-semibold max-sm:text-sm max-sm:leading-6">
                    <Price product={product} />
                </div>

                <div className="action-items flex items-center justify-between opacity-0 transition-all duration-300 ease-in-out group-hover:opacity-100 max-md:hidden">
                    <button
                        className="secondary-button w-full max-w-full p-2.5 text-sm font-medium max-sm:rounded-xl max-sm:p-2"
                        onClick={() => addToCart(goToProduct)}
                    >
                        {t('components.products.card.add-to-cart')}
                    </button>

                    <span
                        className={cx('cursor-pointer p-2.5 text-2xl max-sm:hidden', isWishlist ? 'icon-heart-fill text-red-600' : 'icon-heart')}
                        role="button"
                        aria-label={t('components.products.card.add-to-wishlist')}
                        tabIndex={0}
                        onClick={addToWishlist}
                    />

                    <span
                        className="icon-compare cursor-pointer p-2.5 text-2xl max-sm:hidden"
                        role="button"
                        aria-label={t('components.products.card.add-to-compare')}
                        tabIndex={0}
                        onClick={addToCompare}
                    />
                </div>
            </div>
        </div>
    );
}
