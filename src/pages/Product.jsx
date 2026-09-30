import { useMemo, useRef, useState } from 'react';
import Layout from '../components/layout/Layout';
import { ProductsCarousel } from '../components/home/Carousels';
import { Price } from '../components/products/ProductCard';
import {
    Accordion, Breadcrumbs, ControlGroup, FieldError, Input, Label, QuantityChanger, Ratings, Stars, Textarea, cx,
} from '../components/ui';
import extras from '../data/extras.json';
import { PLACEHOLDER, allProducts, formatPrice, ratingsFor, relatedProducts } from '../lib/catalog';
import { t } from '../lib/i18n';
import { useStore } from '../store/StoreContext';

const REVIEWERS = ['Emma Wilson', 'Liam Carter', 'Sophia Patel', 'Noah Brooks', 'Ava Martins', 'Ethan Kim', 'Mia Johnson', 'Lucas Rivera', 'Olivia Chen'];
const COMMENTS = [
    ['Loved it', 'Great quality and exactly as described. Delivery was quick too.'],
    ['Good value', 'Works well for the price. Packaging could be better.'],
    ['Very comfortable', 'Fits perfectly and feels premium. Would recommend.'],
    ['Nice product', 'Looks just like the pictures. Happy with the purchase.'],
    ['Decent', 'Does the job, nothing extraordinary.'],
];

/** Deterministic mock reviews, matching the average shown on cards. */
function mockReviews(product) {
    const { total } = ratingsFor(product);

    return Array.from({ length: total }, (_, index) => {
        const [title, comment] = COMMENTS[(product.id + index) % COMMENTS.length];

        return {
            id: index,
            name: REVIEWERS[(product.id + index) % REVIEWERS.length],
            rating: 5 - ((product.id + index) % 3 === 0 ? 1 : 0) - (index % 4 === 3 ? 1 : 0),
            title,
            comment,
            created_at: `2026-09-${String(28 - index * 2).padStart(2, '0')}`,
        };
    });
}

/* ---------------- Gallery ---------------- */

function ImageZoomer({ images, index, onClose, onChange }) {
    if (index === null) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-[1001] flex items-center justify-center bg-black/90" onClick={onClose}>
            <span className="icon-cancel absolute right-5 top-5 cursor-pointer text-3xl text-white" onClick={onClose} />

            {images.length > 1 && (
                <span
                    className="icon-arrow-left absolute left-5 top-1/2 cursor-pointer rounded-full bg-white/20 p-3 text-3xl text-white"
                    onClick={(event) => {
                        event.stopPropagation();
                        onChange((index - 1 + images.length) % images.length);
                    }}
                />
            )}

            <img className="max-h-[90vh] max-w-[90vw] rounded-xl" src={images[index]} alt="" onClick={(event) => event.stopPropagation()} />

            {images.length > 1 && (
                <span
                    className="icon-arrow-right absolute right-5 top-1/2 cursor-pointer rounded-full bg-white/20 p-3 text-3xl text-white"
                    onClick={(event) => {
                        event.stopPropagation();
                        onChange((index + 1) % images.length);
                    }}
                />
            )}
        </div>
    );
}

function Gallery({ product }) {
    const images = product.images.length ? product.images : [PLACEHOLDER];
    const [active, setActive] = useState(0);
    const [zoom, setZoom] = useState(null);
    const swiper = useRef(null);

    return (
        <div>
            {/* Desktop (> 1180px) */}
            <div className="sticky top-20 flex h-max gap-8 max-1180:hidden">
                <div className="flex-24 h-509 flex min-w-[100px] max-w-[100px] flex-wrap place-content-start justify-center gap-2.5 overflow-y-auto overflow-x-hidden">
                    <span
                        className="icon-arrow-up cursor-pointer text-2xl"
                        role="button"
                        tabIndex={0}
                        onClick={() => swiper.current && (swiper.current.scrollTop -= 100)}
                    />

                    <div ref={swiper} className="scrollbar-hide flex max-h-[540px] flex-col gap-2.5 overflow-auto scroll-smooth [&>*]:flex-[0]">
                        {images.map((image, index) => (
                            <img
                                key={image}
                                className={`transparent max-h-[100px] min-w-[100px] cursor-pointer rounded-xl border ${index === active ? 'pointer-events-none border border-navyBlue' : 'border-white'}`}
                                src={image}
                                alt={product.name}
                                width="100"
                                height="100"
                                tabIndex={0}
                                onClick={() => setActive(index)}
                            />
                        ))}
                    </div>

                    <span
                        className="icon-arrow-down cursor-pointer text-2xl"
                        role="button"
                        tabIndex={0}
                        onClick={() => swiper.current && (swiper.current.scrollTop += 100)}
                    />
                </div>

                <div className="max-h-[610px] max-w-[560px]">
                    <img
                        className="min-w-[450px] cursor-pointer rounded-xl"
                        src={images[active]}
                        alt={product.name}
                        width="560"
                        height="610"
                        tabIndex={0}
                        onClick={() => setZoom(active)}
                    />
                </div>
            </div>

            {/* Mobile */}
            <div className="scrollbar-hide flex w-screen gap-8 overflow-auto max-sm:gap-5 1180:hidden">
                <div className="relative m-auto flex w-full overflow-hidden">
                    <div
                        className="inline-flex cursor-pointer transition-transform duration-700 ease-out will-change-transform"
                        style={{ transform: `translateX(-${active * 100}vw)` }}
                    >
                        {images.map((image, index) => (
                            <div key={image} className="grid max-h-screen w-screen content-center bg-cover bg-no-repeat" onClick={() => setZoom(index)}>
                                <img
                                    className="aspect-square max-h-full w-full max-w-full select-none transition-transform duration-300 ease-in-out"
                                    src={image}
                                    alt={product.name}
                                />
                            </div>
                        ))}
                    </div>

                    {images.length > 1 && (
                        <div className="absolute bottom-3 left-0 flex w-full justify-center max-sm:bottom-2.5">
                            {images.map((image, index) => (
                                <div
                                    key={image}
                                    className={`mx-1 h-1.5 w-1.5 cursor-pointer rounded-full ${index === active ? 'bg-navyBlue' : 'bg-gray-500 opacity-30'}`}
                                    role="button"
                                    onClick={() => setActive(index)}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <ImageZoomer images={images} index={zoom} onClose={() => setZoom(null)} onChange={setZoom} />
        </div>
    );
}

/* ---------------- Type specific option blocks ---------------- */

const COLOR_SWATCHES = {
    Red: '#E53935', Green: '#43A047', Yellow: '#FDD835', Black: '#000000', White: '#FFFFFF', Orange: '#FB8C00',
    Blue: '#1E88E5', Pink: '#EC407A', Purple: '#8E24AA', Grey: '#9E9E9E', Brown: '#795548', 'Dual Tone': 'linear-gradient(90deg,#000 50%,#fff 50%)',
};

function ConfigurableOptions({ product, selected, setSelected, errors }) {
    return (
        <div className="w-[455px] max-w-full max-sm:w-full">
            {product.super_attributes.map((attribute) => {
                const value = selected[attribute.code];
                const isColor = attribute.code === 'color';
                const swatch = isColor ? 'color' : attribute.swatch_type || 'dropdown';

                return (
                    <div key={attribute.code} className="mt-5">
                        {swatch === 'dropdown' ? (
                            <>
                                <h2 className="mb-4 text-xl max-sm:mb-1.5 max-sm:text-base max-sm:font-medium">{attribute.label}</h2>
                                <select
                                    className={cx(
                                        'custom-select mb-3 block w-full cursor-pointer rounded-lg border border-zinc-200 bg-white px-5 py-3 text-base text-zinc-500 focus:border-blue-500 focus:ring-blue-500',
                                        errors[attribute.code] && 'border border-red-500',
                                    )}
                                    value={value || ''}
                                    aria-label={attribute.label}
                                    onChange={(event) => setSelected({ ...selected, [attribute.code]: event.target.value })}
                                >
                                    <option value="">{t('products.view.type.configurable.select-options')}</option>
                                    {attribute.options.map((option) => (
                                        <option key={option.id} value={option.label}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </>
                        ) : (
                            <>
                                <h2 className="mb-4 text-xl max-sm:mb-2 max-sm:text-base">{attribute.label}</h2>

                                <div className="flex items-center gap-3">
                                    {attribute.options.map((option) =>
                                        swatch === 'color' ? (
                                            <label
                                                key={option.id}
                                                className={cx(
                                                    'relative -m-0.5 flex cursor-pointer items-center justify-center rounded-full p-0.5 focus:outline-none',
                                                    value === option.label && 'ring-2 ring-gray-900',
                                                )}
                                                title={option.label}
                                                onClick={() => setSelected({ ...selected, [attribute.code]: option.label })}
                                            >
                                                <span
                                                    className="h-8 w-8 rounded-full border border-gray-200 max-sm:h-[25px] max-sm:w-[25px]"
                                                    tabIndex={0}
                                                    style={{ background: option.swatch || COLOR_SWATCHES[option.label] || '#ccc' }}
                                                />
                                            </label>
                                        ) : (
                                            <label
                                                key={option.id}
                                                className={cx(
                                                    'group relative flex h-fit min-w-fit cursor-pointer items-center justify-center rounded-full border border-gray-300 bg-white px-5 py-3 font-medium uppercase text-gray-900 hover:bg-gray-50 max-sm:h-fit max-sm:w-fit max-sm:px-3.5 max-sm:py-2',
                                                    value === option.label && 'border-transparent !bg-navyBlue text-white',
                                                )}
                                                title={option.label}
                                                onClick={() => setSelected({ ...selected, [attribute.code]: option.label })}
                                            >
                                                <span className="text-lg max-sm:text-sm">{option.label}</span>
                                            </label>
                                        ),
                                    )}
                                </div>
                            </>
                        )}

                        <FieldError message={errors[attribute.code] && `The ${attribute.label} field is required`} />
                    </div>
                );
            })}
        </div>
    );
}

function DownloadableLinks({ product, links, setLinks, error }) {
    const items = extras.downloadable[product.id] || [];

    if (!items.length) {
        return null;
    }

    return (
        <>
            <label className="mb-4 mt-8 flex font-medium max-sm:mb-1.5 max-sm:mt-3">{t('products.view.type.downloadable.links')}</label>

            <div className="grid gap-4 max-sm:gap-1">
                {items.map((link) => (
                    <div key={link.id} className="flex select-none items-center gap-x-4">
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id={`link_${link.id}`}
                                className="peer hidden"
                                checked={links.includes(link.id)}
                                onChange={() => setLinks(links.includes(link.id) ? links.filter((id) => id !== link.id) : [...links, link.id])}
                            />
                            <label
                                className="icon-uncheck peer-checked:icon-check-box cursor-pointer text-2xl text-navyBlue peer-checked:text-navyBlue"
                                htmlFor={`link_${link.id}`}
                            />
                            <label htmlFor={`link_${link.id}`} className="cursor-pointer max-sm:text-sm ltr:ml-1 rtl:mr-1">
                                {`${link.title} + ${formatPrice(link.price)}`}
                            </label>
                        </div>

                        {link.has_sample && (
                            <a href="#sample" className="text-blue-700 max-sm:text-sm" onClick={(event) => event.preventDefault()}>
                                {t('products.view.type.downloadable.sample')}
                            </a>
                        )}
                    </div>
                ))}

                <FieldError message={error && 'The Links field is required'} />
            </div>
        </>
    );
}

function BundleOptions({ product, bundle, setBundle }) {
    const options = extras.bundle[product.id] || [];

    if (!options.length) {
        return null;
    }

    const total = options.reduce((sum, option) => {
        const item = option.products.find((candidate) => candidate.id === bundle[option.id]);

        return sum + (item ? item.price * item.qty : 0);
    }, 0);

    return (
        <div className="mt-8 max-sm:mt-0">
            {options.map((option) => (
                <div key={option.id} className="mt-8 border-b border-zinc-200 pb-4 max-sm:mt-4 max-sm:pb-0">
                    <Label className={cx('!mt-0 max-sm:!mb-2.5', option.is_required && 'required')}>{option.label}</Label>

                    <div className="grid gap-2 max-sm:gap-1">
                        {option.products.map((item) => (
                            <div key={item.id} className="flex select-none items-center gap-x-4 max-sm:gap-x-1.5">
                                <input
                                    type="radio"
                                    id={`bundle_${option.id}_${item.id}`}
                                    name={`bundle_${option.id}`}
                                    className="peer hidden"
                                    checked={bundle[option.id] === item.id}
                                    onChange={() => setBundle({ ...bundle, [option.id]: item.id })}
                                />
                                <label
                                    className="icon-radio-unselect peer-checked:icon-radio-select cursor-pointer text-2xl text-navyBlue"
                                    htmlFor={`bundle_${option.id}_${item.id}`}
                                />
                                <label className="flex cursor-pointer gap-2 text-zinc-500 max-sm:text-sm" htmlFor={`bundle_${option.id}_${item.id}`}>
                                    {item.name}
                                    <span className="text-black">{`+ ${formatPrice(item.price)}`}</span>
                                </label>
                            </div>
                        ))}
                    </div>
                </div>
            ))}

            <div className="mb-2.5 mt-5 flex items-center justify-between">
                <p className="text-sm">{t('products.view.type.bundle.total-amount')}</p>
                <p className="text-lg font-medium max-sm:text-sm">{formatPrice(total)}</p>
            </div>

            <ul className="grid gap-2.5 text-base max-sm:text-sm">
                {options.map((option) => {
                    const item = option.products.find((candidate) => candidate.id === bundle[option.id]);

                    return (
                        <li key={option.id}>
                            <span className="mb-1.5 inline-block max-sm:mb-0">{option.label}</span>
                            {item && <p className="text-zinc-500">{`${item.qty} x ${item.name}`}</p>}
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}

const SLOTS = ['10:00 AM - 11:00 AM', '11:00 AM - 12:00 PM', '02:00 PM - 03:00 PM', '04:00 PM - 05:00 PM'];

function BookingInformation({ product, booking, setBooking, error }) {
    const info = extras.booking[product.id];

    if (!info) {
        return null;
    }

    const heading = {
        default: t('products.view.type.booking.slots.book-an-appointment'),
        appointment: t('products.view.type.booking.slots.book-an-appointment'),
        event: t('products.view.type.booking.event.book-your-ticket'),
        rental: t('products.view.type.booking.rental.rent-an-item'),
        table: t('products.view.type.booking.table.book-a-table'),
    }[info.type];

    return (
        <div className="mt-6 grid w-full max-w-[470px] grid-cols-1 gap-6">
            <div className="flex gap-4">
                <span className="icon-location text-2xl" />
                <div className="grid grid-cols-1 gap-1.5 text-sm font-medium">
                    <p>{t('products.view.type.booking.location')}</p>
                    <div className="grid grid-cols-1 gap-3">
                        <p className="text-[#6E6E6E]">{info.location}</p>
                        <a
                            href={`https://maps.google.com/maps?q=${encodeURIComponent(info.location)}`}
                            target="_blank"
                            rel="noreferrer"
                            className="w-fit text-blue-600 hover:text-blue-800"
                        >
                            {t('products.view.type.booking.view-on-map')}
                        </a>
                    </div>
                </div>
            </div>

            <div className="w-full max-w-[470px]">
                <p className="mb-4 text-xl font-medium max-sm:text-base">{heading}</p>

                <div className="grid grid-cols-2 gap-2.5">
                    <ControlGroup className="mb-0">
                        <Label required>{t('products.view.type.booking.slots.date')}</Label>
                        <Input type="date" value={booking.date || ''} error={error && !booking.date} onChange={(event) => setBooking({ ...booking, date: event.target.value })} />
                    </ControlGroup>

                    <ControlGroup className="mb-0">
                        <Label required>{t('products.view.type.booking.slots.title')}</Label>
                        <select
                            className={cx(
                                'custom-select mb-1.5 w-full rounded-lg border border-zinc-200 bg-white px-5 py-3 text-base text-gray-600 transition-all hover:border-gray-400 max-md:py-2 max-sm:px-4 max-sm:text-sm',
                                error && !booking.slot && 'border !border-red-500',
                            )}
                            value={booking.slot || ''}
                            onChange={(event) => setBooking({ ...booking, slot: event.target.value })}
                        >
                            <option value="">{t('products.view.type.booking.slots.select-slot')}</option>
                            {SLOTS.map((slot) => (
                                <option key={slot}>{slot}</option>
                            ))}
                        </select>
                    </ControlGroup>
                </div>
            </div>

            <div className="flex items-start gap-3 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
                <span className="icon-error mt-0.5 text-lg" />
                <div>
                    <p className="font-semibold">{t('products.view.type.booking.cancellation-not-allowed.title')}</p>
                    <p className="text-xs">{t('products.view.type.booking.cancellation-not-allowed.description')}</p>
                </div>
            </div>
        </div>
    );
}

/* ---------------- Tabs / info sections ---------------- */

function additionalInfo(product) {
    const rows = [['SKU', product.sku]];

    for (const attribute of product.super_attributes) {
        rows.push([attribute.label, attribute.options.map((option) => option.label).join(', ')]);
    }

    rows.push(['Brand', ['Adidas', 'Nike', 'Elegance'][product.id % 3]]);

    return rows;
}

function ReviewForm({ onCancel, onSubmit }) {
    const [rating, setRating] = useState(0);
    const [form, setForm] = useState({ title: '', comment: '' });
    const [errors, setErrors] = useState({});

    const submit = (event) => {
        event.preventDefault();

        const next = {};

        if (!rating) next.rating = 'The Rating field is required';
        if (!form.title) next.title = 'The Title field is required';
        if (!form.comment) next.comment = 'The Comment field is required';

        setErrors(next);

        if (!Object.keys(next).length) {
            onSubmit({ ...form, rating });
        }
    };

    return (
        <div className="w-full">
            <form className="grid grid-cols-[auto_1fr] justify-center gap-10 max-md:grid-cols-[1fr] max-md:gap-0" onSubmit={submit}>
                <div className="max-w-[286px]">
                    <ControlGroup>
                        <label className="grid h-[120px] w-[120px] cursor-pointer place-content-center rounded-xl border border-dashed border-zinc-300 text-center text-sm text-zinc-500 hover:border-gray-400">
                            <span className="icon-camera text-3xl" />
                            {t('products.view.reviews.attachments')}
                            <input type="file" className="hidden" multiple accept="image/*" />
                        </label>
                    </ControlGroup>
                </div>

                <div>
                    <ControlGroup>
                        <Label required className="mt-0">
                            {t('products.view.reviews.rating')}
                        </Label>
                        <Stars rating={rating} onRate={setRating} />
                        <FieldError message={errors.rating} />
                    </ControlGroup>

                    <ControlGroup>
                        <Label required>{t('products.view.reviews.title')}</Label>
                        <Input
                            value={form.title}
                            error={errors.title}
                            placeholder={t('products.view.reviews.title')}
                            onChange={(event) => setForm({ ...form, title: event.target.value })}
                        />
                        <FieldError message={errors.title} />
                    </ControlGroup>

                    <ControlGroup>
                        <Label required>{t('products.view.reviews.comment')}</Label>
                        <Textarea
                            rows="12"
                            value={form.comment}
                            error={errors.comment}
                            placeholder={t('products.view.reviews.comment')}
                            onChange={(event) => setForm({ ...form, comment: event.target.value })}
                        />
                        <FieldError message={errors.comment} />
                    </ControlGroup>

                    <div className="mt-4 flex justify-start gap-4 max-xl:mb-5 max-sm:mb-5 max-sm:flex-wrap max-sm:justify-normal max-sm:gap-x-0">
                        <button
                            className="primary-button w-full max-w-[374px] rounded-2xl px-11 py-4 text-center max-md:max-w-full max-md:rounded-lg max-md:py-3 max-sm:py-1.5"
                            type="submit"
                        >
                            {t('products.view.reviews.submit-review')}
                        </button>

                        <button
                            type="button"
                            className="secondary-button items-center rounded-2xl px-8 py-2.5 max-md:w-full max-md:max-w-full max-md:rounded-lg max-md:py-1.5"
                            onClick={onCancel}
                        >
                            {t('products.view.reviews.cancel')}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}

function ReviewItem({ review }) {
    const initials = review.name.split(' ').map((name) => name.charAt(0).toUpperCase()).join('');

    return (
        <>
            <div className="rounded-xl border border-zinc-200 p-6 max-md:hidden">
                <div className="flex gap-5">
                    <div className="flex max-h-[100px] min-h-[100px] min-w-[100px] max-w-[100px] items-center justify-center rounded-xl bg-zinc-100" title={review.name}>
                        <span className="text-2xl font-semibold text-zinc-500">{initials}</span>
                    </div>

                    <div className="flex flex-col">
                        <p className="font x-md:text-lg text-xl">{review.name}</p>
                        <p className="mb-2 text-sm font-medium text-neutral-500">{review.created_at}</p>
                        <div className="flex items-center gap-0.5">
                            <Stars rating={review.rating} className="text-3xl" />
                        </div>
                    </div>
                </div>

                <div className="mt-3 flex flex-col gap-4">
                    <p className="text-base max-sm:text-xs">{review.title}</p>
                    <p className="text-base leading-relaxed text-neutral-500 max-sm:text-xs">{review.comment}</p>
                </div>
            </div>

            <div className="md:hidden">
                <div className="grid gap-1.5 rounded-xl border border-zinc-200 p-4 max-md:mb-0">
                    <div className="flex items-center gap-2.5">
                        <div className="flex max-h-10 min-h-10 min-w-10 max-w-10 items-center justify-center rounded-full bg-zinc-100" title={review.name}>
                            <span className="text-sm font-semibold text-zinc-500">{initials}</span>
                        </div>

                        <div className="flex flex-col">
                            <p className="font-medium">{review.name}</p>
                            <p className="text-xs text-neutral-500">{review.created_at}</p>
                        </div>
                    </div>

                    <Stars rating={review.rating} className="text-lg" />
                    <p className="text-sm font-medium">{review.title}</p>
                    <p className="text-sm text-neutral-500">{review.comment}</p>
                </div>
            </div>
        </>
    );
}

function Reviews({ product }) {
    const { flash } = useStore();
    const [canReview, setCanReview] = useState(false);
    const reviews = useMemo(() => mockReviews(product), [product]);
    const average = reviews.length ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1) : 0;

    const percentage = (star) => (reviews.length ? (reviews.filter((review) => review.rating === star).length / reviews.length) * 100 : 0);

    return (
        <div className="container max-1180:mt-3.5 max-1180:px-5 max-md:px-4 max-sm:px-3.5">
            {canReview ? (
                <ReviewForm
                    onCancel={() => setCanReview(false)}
                    onSubmit={() => {
                        setCanReview(false);
                        flash('success', t('products.view.reviews.success'));
                    }}
                />
            ) : reviews.length ? (
                <>
                    <h3 className="mb-8 font-dmserif text-3xl max-md:mb-2.5 max-md:text-2xl max-sm:text-xl">
                        {t('products.view.reviews.customer-review')} ({reviews.length})
                    </h3>

                    <div className="flex gap-16 max-lg:flex-wrap max-sm:gap-5 max-sm:gap-x-0">
                        <div className="sticky top-24 flex h-max flex-col gap-6 max-lg:relative max-lg:top-auto max-md:w-full">
                            <div className="flex flex-col items-center gap-2 max-md:mt-3 max-md:gap-0 max-md:border-b max-md:border-zinc-200 max-md:pb-3">
                                <p className="text-5xl max-md:text-3xl">{average}</p>
                                <div className="flex items-center gap-0.5">
                                    <Stars rating={Math.floor(average)} className="text-3xl" />
                                </div>
                                <p className="text-base text-zinc-500 max-sm:text-sm">
                                    {reviews.length} {t('products.view.reviews.ratings')}
                                </p>
                            </div>

                            <div className="grid max-w-[365px] flex-wrap gap-y-3 max-md:max-w-full">
                                {[5, 4, 3, 2, 1].map((star) => (
                                    <div key={star} className="row grid grid-cols-[1fr_2fr] items-center gap-4 max-md:grid-cols-[0.5fr_2fr] max-sm:flex-wrap max-sm:gap-0">
                                        <div className="whitespace-nowrap text-base font-medium max-sm:text-sm">{star} Stars</div>
                                        <div className="h-4 w-[275px] max-w-full rounded-sm bg-neutral-200 max-sm:h-3.5 max-sm:w-full">
                                            <div className="h-4 rounded-sm bg-amber-500 max-sm:h-3.5" style={{ width: `${percentage(star)}%` }} />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div
                                className="flex cursor-pointer items-center justify-center gap-x-4 rounded-xl border border-navyBlue px-4 py-3 max-sm:rounded-lg max-sm:py-1.5"
                                onClick={() => setCanReview(true)}
                            >
                                <span className="icon-pen text-2xl" />
                                {t('products.view.reviews.write-a-review')}
                            </div>
                        </div>

                        <div className="flex w-full flex-col gap-5">
                            {reviews.map((review) => (
                                <ReviewItem key={review.id} review={review} />
                            ))}
                        </div>
                    </div>
                </>
            ) : (
                <div className="m-auto grid h-[476px] w-full place-content-center items-center justify-items-center text-center max-md:h-60">
                    <img className="max-md:h-32 max-md:w-32 max-sm:h-[100px] max-sm:w-[100px]" src="/images/review.png" alt="" />
                    <p className="text-xl max-md:text-sm max-sm:text-xs">{t('products.view.reviews.empty-review')}</p>
                    <div
                        className="mt-8 flex cursor-pointer items-center gap-x-4 rounded-xl border border-navyBlue px-4 py-2.5 max-sm:mt-5 max-sm:gap-x-1.5 max-sm:rounded-lg max-sm:py-1.5 max-sm:text-sm"
                        onClick={() => setCanReview(true)}
                    >
                        <span className="icon-pen text-2xl max-sm:text-lg" />
                        {t('products.view.reviews.write-a-review')}
                    </div>
                </div>
            )}
        </div>
    );
}

function InfoGrid({ product, className }) {
    return (
        <div className={className}>
            {additionalInfo(product).map(([label, value]) => (
                <div key={label} className="contents">
                    <div className="grid">
                        <p className="text-base text-black">{label}</p>
                    </div>
                    <div className="grid">
                        <p className="text-base text-zinc-500">{value}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}

function InformationSection({ product, activeTab, setActiveTab, reviewsRef }) {
    const tabs = [
        ['description', t('products.view.description')],
        ['information', t('products.view.additional-information')],
        ['review', t('products.view.review')],
    ];

    return (
        <>
            <div className="1180:mt-20" ref={reviewsRef}>
                <div className="max-1180:hidden">
                    <div className="flex flex-row justify-center gap-8 bg-zinc-100 max-sm:gap-1.5">
                        {tabs.map(([key, title]) => (
                            <div
                                key={key}
                                role="button"
                                tabIndex={0}
                                className={cx(
                                    'cursor-pointer px-8 py-5 text-xl font-medium text-zinc-600 max-md:px-4 max-md:py-3 max-md:text-sm max-sm:px-2.5 max-sm:py-2.5',
                                    activeTab === key && 'border-b-2 border-navyBlue !text-black transition',
                                )}
                                onClick={() => setActiveTab(key)}
                            >
                                {title}
                            </div>
                        ))}
                    </div>

                    <div className="container mt-[60px] animate-[on-fade_0.5s_ease-in-out] !p-0">
                        {activeTab === 'description' && (
                            <div className="container mt-[60px] max-1180:px-5">
                                <div className="text-lg text-zinc-500 max-1180:text-sm" dangerouslySetInnerHTML={{ __html: product.description }} />
                            </div>
                        )}

                        {activeTab === 'information' && (
                            <div className="container mt-[60px] max-1180:px-5">
                                <InfoGrid product={product} className="mt-8 grid max-w-max grid-cols-[auto_1fr] gap-4" />
                            </div>
                        )}

                        {activeTab === 'review' && <Reviews product={product} />}
                    </div>
                </div>
            </div>

            <div className="container mt-6 grid gap-3 !p-0 max-1180:px-5 1180:hidden">
                <Accordion
                    className="max-md:border-none"
                    headerClass="bg-gray-100 max-md:!py-3 max-sm:!py-2"
                    contentClass="max-sm:px-0"
                    header={<p className="text-base font-medium 1180:hidden">{t('products.view.description')}</p>}
                >
                    <div
                        className="mb-5 text-lg text-zinc-500 max-1180:text-sm max-md:mb-1 max-md:px-4"
                        dangerouslySetInnerHTML={{ __html: product.description }}
                    />
                </Accordion>

                <Accordion
                    defaultOpen={false}
                    className="max-md:border-none"
                    headerClass="bg-gray-100 max-md:!py-3 max-sm:!py-2"
                    contentClass="max-sm:px-0"
                    header={<p className="text-base font-medium 1180:hidden">{t('products.view.additional-information')}</p>}
                >
                    <div className="container max-1180:px-5">
                        <InfoGrid product={product} className="grid max-w-max grid-cols-[auto_1fr] gap-4 text-lg text-zinc-500 max-1180:text-sm" />
                    </div>
                </Accordion>

                <Accordion
                    defaultOpen={false}
                    className="max-md:border-none"
                    headerClass="bg-gray-100 max-md:!py-3 max-sm:!py-2"
                    header={<p className="text-base font-medium">{t('products.view.review')}</p>}
                >
                    <Reviews product={product} />
                </Accordion>
            </div>
        </>
    );
}

/* ---------------- Page ---------------- */

export default function Product({ product }) {
    const { addToCart, toggleWishlist, addToCompare, wishlist, flash } = useStore();
    const [quantity, setQuantity] = useState(1);
    const [selected, setSelected] = useState({});
    const [links, setLinks] = useState([]);
    const [booking, setBooking] = useState({});
    const [bundle, setBundle] = useState(() =>
        Object.fromEntries((extras.bundle[product.id] || []).map((option) => [option.id, option.products.find((item) => item.is_default)?.id])),
    );
    const [errors, setErrors] = useState({});
    const [activeTab, setActiveTab] = useState('description');
    const reviewsRef = useRef(null);

    const ratings = ratingsFor(product);
    const isWishlist = wishlist.includes(product.id);
    const showQuantity = !['downloadable', 'virtual', 'booking'].includes(product.type) || product.type === 'virtual';

    const crumbs = [{ title: product.name }];

    const validate = () => {
        const next = {};

        if (product.type === 'configurable') {
            for (const attribute of product.super_attributes) {
                if (!selected[attribute.code]) {
                    next[attribute.code] = true;
                }
            }
        }

        if (product.type === 'downloadable' && extras.downloadable[product.id] && !links.length) {
            next.links = true;
        }

        if (product.type === 'booking' && (!booking.date || !booking.slot)) {
            next.booking = true;
        }

        setErrors(next);

        return !Object.keys(next).length;
    };

    const options = () => {
        if (product.type === 'configurable') {
            return product.super_attributes.map((attribute) => ({ attribute_name: attribute.label, option_label: selected[attribute.code] }));
        }

        if (product.type === 'downloadable') {
            return (extras.downloadable[product.id] || [])
                .filter((link) => links.includes(link.id))
                .map((link) => ({ attribute_name: t('products.view.type.downloadable.links'), option_label: link.title }));
        }

        if (product.type === 'booking') {
            return [
                { attribute_name: 'Date', option_label: booking.date },
                { attribute_name: 'Slot', option_label: booking.slot },
            ];
        }

        if (product.type === 'bundle') {
            return (extras.bundle[product.id] || []).map((option) => ({
                attribute_name: option.label,
                option_label: option.products.find((item) => item.id === bundle[option.id])?.name || t('products.view.type.bundle.none'),
            }));
        }

        return [];
    };

    const submit = () => {
        if (!validate()) {
            flash('error', t('checkout.cart.missing-options'));

            return;
        }

        addToCart(product, quantity, options());
    };

    const scrollToReview = () => {
        setActiveTab('review');
        reviewsRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <Layout title={product.name}>
            <div className="flex justify-center px-7 max-lg:hidden">
                <Breadcrumbs items={crumbs} />
            </div>

            <div>
                <div className="container px-[60px] max-1180:px-0">
                    <div className="mt-12 flex gap-9 max-1180:flex-wrap max-lg:mt-0 max-sm:gap-y-4">
                        <Gallery product={product} />

                        <div className="relative max-w-[590px] max-1180:w-full max-1180:max-w-full max-1180:px-5 max-sm:px-4">
                            <div className="flex justify-between gap-4">
                                <h1 className="break-words text-3xl font-medium max-sm:text-xl">{product.name}</h1>

                                <div
                                    className={cx(
                                        'flex max-h-[46px] min-h-[46px] min-w-[46px] cursor-pointer items-center justify-center rounded-full border bg-white text-2xl transition-all hover:opacity-[0.8] max-sm:max-h-7 max-sm:min-h-7 max-sm:min-w-7 max-sm:text-base',
                                        isWishlist ? 'icon-heart-fill text-red-600' : 'icon-heart',
                                    )}
                                    role="button"
                                    aria-label={t('products.view.add-to-wishlist')}
                                    tabIndex={0}
                                    onClick={() => toggleWishlist(product)}
                                />
                            </div>

                            {ratings.total > 0 && (
                                <div className="mt-1 w-max cursor-pointer max-sm:mt-1.5" role="button" tabIndex={0} onClick={scrollToReview}>
                                    <Ratings className="transition-all hover:border-gray-400 max-sm:px-3 max-sm:py-1" average={ratings.average} total={ratings.total} />
                                </div>
                            )}

                            <div className="mt-[22px] flex items-center gap-2.5 text-2xl !font-medium max-sm:mt-2 max-sm:gap-x-2.5 max-sm:gap-y-0 max-sm:text-lg">
                                <Price product={product} />
                            </div>

                            <p className="mt-6 text-lg text-zinc-500 max-sm:mt-1.5 max-sm:text-sm">{product.short_description}</p>

                            {product.type === 'configurable' && (
                                <ConfigurableOptions product={product} selected={selected} setSelected={setSelected} errors={errors} />
                            )}

                            {product.type === 'bundle' && <BundleOptions product={product} bundle={bundle} setBundle={setBundle} />}

                            {product.type === 'downloadable' && <DownloadableLinks product={product} links={links} setLinks={setLinks} error={errors.links} />}

                            {product.type === 'booking' && <BookingInformation product={product} booking={booking} setBooking={setBooking} error={errors.booking} />}

                            <div className="mt-8 flex max-w-[470px] gap-4 max-sm:mt-4 max-sm:flex-wrap">
                                {showQuantity && (
                                    <QuantityChanger
                                        className="gap-x-4 rounded-xl px-7 py-4 max-md:py-3 max-sm:gap-x-5 max-sm:rounded-lg max-sm:px-4 max-sm:py-1.5"
                                        value={quantity}
                                        onChange={setQuantity}
                                    />
                                )}

                                <button
                                    type="button"
                                    className="secondary-button w-full max-w-full max-md:py-3 max-sm:!w-auto max-sm:!max-w-none max-sm:rounded-lg max-sm:py-1.5"
                                    onClick={submit}
                                >
                                    {t('products.view.add-to-cart')}
                                </button>
                            </div>


                            <div className="mt-10 flex gap-9 max-md:mt-4 max-md:flex-wrap max-sm:justify-center max-sm:gap-3">
                                <div
                                    className="flex cursor-pointer items-center justify-center gap-2.5 max-sm:gap-1.5 max-sm:text-base"
                                    role="button"
                                    tabIndex={0}
                                    onClick={() => addToCompare(product)}
                                >
                                    <span className="icon-compare text-2xl" role="presentation" />
                                    {t('products.view.compare')}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <InformationSection product={product} activeTab={activeTab} setActiveTab={setActiveTab} reviewsRef={reviewsRef} />

            <ProductsCarousel title={t('products.view.related-product-title')} products={relatedProducts(product)} />
            <ProductsCarousel
                title={t('products.view.up-sell-title')}
                products={allProducts.filter((other) => other.is_featured && other.id !== product.id).slice(0, 8)}
            />

        </Layout>
    );
}
