import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { t } from '../../lib/i18n';
import { categoryTree } from '../../lib/catalog';
import ProductCard from '../products/ProductCard';

/** Port of components/carousel/index.blade.php (autoplay every 5s). */
export function ImageCarousel({ images }) {
    const [current, setCurrent] = useState(0);
    const navigate = useNavigate();
    const count = images.length;

    useEffect(() => {
        if (count < 2) {
            return undefined;
        }

        const timer = setInterval(() => setCurrent((index) => (index + 1) % count), 5000);

        return () => clearInterval(timer);
    }, [count, current]);

    return (
        <div className="relative m-auto flex w-full overflow-hidden">
            <div
                className="inline-flex cursor-pointer transition-transform duration-700 ease-out will-change-transform"
                style={{ transform: `translateX(-${current * 100}vw)` }}
            >
                {images.map((image, index) => (
                    <div key={index} className="max-h-screen w-screen bg-cover bg-no-repeat" onClick={() => image.link && navigate(image.link)}>
                        <img
                            className="aspect-[2.743/1] max-h-full w-full max-w-full select-none transition-transform duration-300 ease-in-out will-change-transform"
                            src={image.image}
                            alt={image.title || `Carousel Image ${index + 1}`}
                            loading={index === 0 ? 'eager' : 'lazy'}
                            tabIndex={0}
                        />
                    </div>
                ))}
            </div>

            {count >= 2 && (
                <>
                    <span
                        className={`icon-arrow-left absolute left-2.5 top-1/2 -mt-[22px] hidden w-auto rounded-full bg-black/80 p-3 text-2xl font-bold text-white opacity-30 transition-all md:inline-block ${current === 0 ? 'cursor-not-allowed' : 'cursor-pointer hover:opacity-100'}`}
                        role="button"
                        aria-label="Previous"
                        tabIndex={0}
                        onClick={() => current > 0 && setCurrent(current - 1)}
                    />

                    <span
                        className="icon-arrow-right absolute right-2.5 top-1/2 -mt-[22px] hidden w-auto cursor-pointer rounded-full bg-black/80 p-3 text-2xl font-bold text-white opacity-30 transition-all hover:opacity-100 md:inline-block"
                        role="button"
                        aria-label="Next"
                        tabIndex={0}
                        onClick={() => setCurrent((current + 1) % count)}
                    />
                </>
            )}

            <div className="absolute bottom-5 left-0 flex w-full justify-center max-md:bottom-3.5 max-sm:bottom-2.5">
                {images.map((image, index) => (
                    <div
                        key={index}
                        className={`mx-1 h-3 w-3 cursor-pointer rounded-full p-2 focus:outline-none max-md:h-2 max-md:w-2 max-sm:h-1.5 max-sm:w-1.5 sm:p-2.5 ${index === current ? 'bg-navyBlue' : 'bg-gray-500 opacity-30'}`}
                        role="button"
                        tabIndex={0}
                        aria-label={`Go to slide ${index + 1}`}
                        onClick={() => setCurrent(index)}
                    />
                ))}
            </div>
        </div>
    );
}

function useSwiper(offset = 323, loop = false) {
    const ref = useRef(null);

    return {
        ref,
        left: () => {
            if (ref.current) {
                ref.current.scrollLeft -= offset;
            }
        },
        right: () => {
            const container = ref.current;

            if (!container) {
                return;
            }

            if (loop && container.scrollLeft + container.clientWidth >= container.scrollWidth) {
                container.scrollLeft = 0;
            } else {
                container.scrollLeft += offset;
            }
        },
    };
}

/** Port of components/categories/carousel.blade.php, showing top-level categories. */
export function CategoriesCarousel() {
    const categories = [...categoryTree()].sort((a, b) => a.id - b.id);
    const swiper = useSwiper();

    return (
        <div className="container mt-14 max-lg:px-8 max-md:mt-7 max-md:!px-0 max-sm:mt-5">
            <div className="relative">
                <div ref={swiper.ref} className="scrollbar-hide flex gap-10 overflow-auto scroll-smooth max-lg:gap-4">
                    {categories.map((category) => (
                        <div
                            key={category.id}
                            className="grid min-w-[120px] max-w-[120px] grid-cols-1 justify-items-center gap-4 font-medium max-md:min-w-20 max-md:max-w-20 max-md:gap-2.5 max-md:first:ml-4 max-sm:min-w-[60px] max-sm:max-w-[60px] max-sm:gap-1.5"
                        >
                            <Link
                                to={category.url}
                                className="h-[110px] w-[110px] rounded-full bg-zinc-100 max-md:h-20 max-md:w-20 max-sm:h-[60px] max-sm:w-[60px]"
                                aria-label={category.name}
                            >
                                <img
                                    src={category.image || '/images/small-product-placeholder.webp'}
                                    width="110"
                                    height="110"
                                    className="w-full rounded-full max-sm:h-[60px] max-sm:w-[60px]"
                                    alt={category.name}
                                    loading="lazy"
                                />
                            </Link>

                            <Link to={category.url}>
                                <p className="text-center text-lg text-black max-md:text-base max-md:font-normal max-sm:text-sm">{category.name}</p>
                            </Link>
                        </div>
                    ))}
                </div>

                <span
                    className="icon-arrow-left-stylish absolute -left-10 top-9 flex h-[50px] w-[50px] cursor-pointer items-center justify-center rounded-full border border-black bg-white text-2xl transition hover:bg-black hover:text-white max-lg:-left-7 max-md:hidden"
                    role="button"
                    aria-label="Previous"
                    tabIndex={0}
                    onClick={swiper.left}
                />

                <span
                    className="icon-arrow-right-stylish absolute -right-6 top-9 flex h-[50px] w-[50px] cursor-pointer items-center justify-center rounded-full border border-black bg-white text-2xl transition hover:bg-black hover:text-white max-lg:-right-7 max-md:hidden"
                    role="button"
                    aria-label="Next"
                    tabIndex={0}
                    onClick={swiper.right}
                />
            </div>
        </div>
    );
}

/** Port of components/products/carousel.blade.php. */
export function ProductsCarousel({ title, products, navigationLink }) {
    const swiper = useSwiper(323, true);

    if (!products.length) {
        return null;
    }

    return (
        <div className="container mt-20 max-lg:px-8 max-md:mt-8 max-sm:mt-7 max-sm:!px-4">
            <div className="flex justify-between">
                <h2 className="font-dmserif text-3xl max-md:text-2xl max-sm:text-xl">{title}</h2>

                <div className="flex items-center justify-between gap-8">
                    {navigationLink && (
                        <Link to={navigationLink} className="hidden max-lg:flex">
                            <p className="items-center text-xl max-md:text-base max-sm:text-sm">
                                {t('components.products.carousel.view-all')}
                                <span className="icon-arrow-right text-2xl max-md:text-lg max-sm:text-sm" />
                            </p>
                        </Link>
                    )}

                    {products.length > 3 && (
                        <>
                            <span
                                className="icon-arrow-left-stylish inline-block cursor-pointer text-2xl max-lg:hidden rtl:icon-arrow-right-stylish"
                                role="button"
                                aria-label={t('components.products.carousel.previous')}
                                tabIndex={0}
                                onClick={swiper.left}
                            />
                            <span
                                className="icon-arrow-right-stylish inline-block cursor-pointer text-2xl max-lg:hidden rtl:icon-arrow-left-stylish"
                                role="button"
                                aria-label={t('components.products.carousel.next')}
                                tabIndex={0}
                                onClick={swiper.right}
                            />
                        </>
                    )}
                </div>
            </div>

            <div
                ref={swiper.ref}
                className="scrollbar-hide mt-10 flex gap-8 overflow-auto scroll-smooth pb-2.5 max-md:mt-5 max-md:gap-7 max-md:whitespace-nowrap max-md:pb-0 max-sm:gap-4 [&>*]:flex-[0]"
            >
                {products.map((product) => (
                    <ProductCard key={product.id} product={product} className="min-w-[291px] max-md:h-fit max-md:min-w-56 max-sm:min-w-[192px]" />
                ))}
            </div>

            {navigationLink && (
                <Link
                    to={navigationLink}
                    className="secondary-button mx-auto mt-5 block w-max rounded-2xl px-11 py-3 text-center text-base max-lg:mt-0 max-lg:hidden max-lg:py-3.5 max-md:rounded-lg"
                    aria-label={title}
                >
                    {t('components.products.carousel.view-all')}
                </Link>
            )}
        </div>
    );
}

/**
 * Static content section: the store's own HTML + CSS from the theme editor.
 * Internal links are routed through React Router.
 */
export function StaticContent({ html, css }) {
    const navigate = useNavigate();

    const onClick = (event) => {
        const anchor = event.target.closest('a');
        const href = anchor?.getAttribute('href');

        if (href && href.startsWith('/')) {
            event.preventDefault();
            navigate(href);
        }
    };

    return (
        <>
            {css && <style>{css}</style>}
            <div onClick={onClick} dangerouslySetInnerHTML={{ __html: html }} />
        </>
    );
}
