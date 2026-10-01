import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { t } from '../../lib/i18n';
import { finalPrice, formatPrice, sortProducts } from '../../lib/catalog';
import { Accordion, Drawer, Dropdown } from '../ui';
import ProductCard from './ProductCard';

const SORTS = [
    { value: 'name-asc', title: 'From A-Z' },
    { value: 'name-desc', title: 'From Z-A' },
    { value: 'created_at-desc', title: 'Newest First' },
    { value: 'created_at-asc', title: 'Oldest First' },
    { value: 'price-asc', title: 'Cheapest First' },
    { value: 'price-desc', title: 'Expensive First' },
];

const LIMITS = [12, 24, 36, 48];

const DEFAULTS = { sort: 'price-desc', limit: 12, mode: 'grid' };

const OPTION_FILTERS = [
    { code: 'color', name: 'Color', options: ['Black', 'White', 'Grey', 'Navy'] },
    { code: 'size', name: 'Size', options: ['S', 'M', 'L', 'XL', 'XXL'] },
];

function productMatches(product, code, values) {
    const attribute = product.super_attributes.find((item) => item.code === code);

    if (attribute) {
        return attribute.options.some((option) => values.includes(option.label));
    }

    // Simple products carry Size as a customizable option
    const option = (product.customizable_options || []).find((item) => item.label.toLowerCase() === code);

    return !!option && option.options.some((item) => values.includes(item.label));
}

/** Port of components/range-slider (two overlaid range inputs). */
function RangeSlider({ min, max, value, onChange }) {
    const [range, setRange] = useState(value);
    const thumb =
        'pointer-events-none absolute h-1 w-full cursor-pointer appearance-none bg-transparent outline-none [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-[18px] [&::-moz-range-thumb]:w-[18px] [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:ring [&::-moz-range-thumb]:ring-navyBlue [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-[18px] [&::-webkit-slider-thumb]:w-[18px] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:ring [&::-webkit-slider-thumb]:ring-navyBlue';

    const span = max - min || 1;
    const left = ((range[0] - min) / span) * 100;
    const right = 100 - ((range[1] - min) / span) * 100;

    return (
        <div>
            <div className="flex items-center gap-4">
                <p className="text-base max-sm:text-sm">{t('components.range-slider.range')}</p>
                <p className="text-base font-semibold max-sm:text-sm">
                    {formatPrice(range[0])} - {formatPrice(range[1])}
                </p>
            </div>

            <div className="relative mx-auto flex h-20 w-full items-center justify-center p-2">
                <div className="relative h-1 w-full rounded-2xl bg-gray-200">
                    <div className="absolute h-full rounded-xl bg-navyBlue" style={{ left: `${left}%`, right: `${right}%` }} />

                    <input
                        type="range"
                        className={thumb}
                        min={min}
                        step={max - Math.floor(max) > 0 ? 0.01 : 1}
                        max={max}
                        value={range[0]}
                        aria-label={t('components.range-slider.min-range')}
                        onChange={(event) => setRange([Math.min(Number(event.target.value), range[1]), range[1]])}
                        onMouseUp={() => onChange(range)}
                        onTouchEnd={() => onChange(range)}
                    />

                    <input
                        type="range"
                        className={thumb}
                        min={min}
                        step={max - Math.floor(max) > 0 ? 0.01 : 1}
                        max={max}
                        value={range[1]}
                        aria-label={t('components.range-slider.max-range')}
                        onChange={(event) => setRange([range[0], Math.max(Number(event.target.value), range[0])])}
                        onMouseUp={() => onChange(range)}
                        onTouchEnd={() => onChange(range)}
                    />
                </div>
            </div>
        </div>
    );
}

function FilterItem({ filter, applied, onApply }) {
    const [query, setQuery] = useState('');
    const options = filter.options.filter((option) => option.toLowerCase().includes(query.toLowerCase()));

    const toggle = (option) => {
        const next = applied.includes(option) ? applied.filter((value) => value !== option) : [...applied, option];

        onApply(next);
    };

    return (
        <Accordion
            className="last:border-b-0"
            headerClass="px-0 py-2.5 max-sm:!pb-1.5"
            contentClass="!p-0"
            header={
                <div className="flex items-center justify-between">
                    <p className="text-lg font-semibold max-sm:text-base max-sm:font-medium">{filter.name}</p>
                </div>
            }
        >
            <div className="flex flex-col gap-1">
                <div className="relative">
                    <div className="icon-search pointer-events-none absolute top-3 flex items-center text-2xl max-md:text-xl max-sm:top-2.5 ltr:left-3 rtl:right-3" />
                    <input
                        type="text"
                        className="block w-full rounded-xl border border-zinc-200 px-11 py-3.5 text-sm font-medium text-gray-900 max-md:rounded-lg max-md:px-10 max-md:py-3 max-md:font-normal max-sm:text-xs"
                        placeholder={t('categories.filters.search.title')}
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                    />
                </div>

                <p className="mt-1 flex flex-row-reverse text-xs text-gray-600">
                    {t('categories.filters.search.results-info', { currentCount: options.length, totalCount: filter.options.length })}
                </p>
            </div>

            <ul className="pb-3 text-base text-gray-700">
                {options.length ? (
                    options.map((option) => {
                        const id = `filter_${filter.code}_option_${option}`;

                        return (
                            <li key={option}>
                                <div className="flex select-none items-center gap-x-4 rounded hover:bg-gray-100 max-sm:gap-x-1 max-sm:!p-0 ltr:pl-2 rtl:pr-2">
                                    <input
                                        type="checkbox"
                                        id={id}
                                        className="peer hidden"
                                        checked={applied.includes(option)}
                                        onChange={() => toggle(option)}
                                    />
                                    <label
                                        className="icon-uncheck peer-checked:icon-check-box cursor-pointer text-2xl text-navyBlue peer-checked:text-navyBlue max-sm:text-xl"
                                        role="checkbox"
                                        aria-label={option}
                                        tabIndex={0}
                                        htmlFor={id}
                                    />
                                    <label
                                        className="w-full cursor-pointer p-2 text-base text-gray-900 max-sm:p-1 max-sm:text-sm ltr:pl-0 rtl:pr-0"
                                        htmlFor={id}
                                    >
                                        {option}
                                    </label>
                                </div>
                            </li>
                        );
                    })
                ) : (
                    <li className="flex flex-col items-center justify-center gap-2 py-2">
                        {t('categories.filters.search.no-options-available')}
                    </li>
                )}
            </ul>
        </Accordion>
    );
}

function Filters({ maxPrice, applied, setApplied, onClear }) {
    return (
        <div className="panel-side journal-scroll grid max-h-[1320px] min-w-[342px] grid-cols-[1fr] overflow-y-auto overflow-x-hidden max-xl:min-w-[270px] md:max-w-[342px] md:ltr:pr-7 md:rtl:pl-7">
            <div className="flex h-[50px] items-center justify-between border-b border-zinc-200 pb-2.5 max-md:hidden">
                <p className="text-lg font-semibold max-sm:font-medium">{t('categories.filters.filters')}</p>
                <p className="cursor-pointer text-xs font-medium" tabIndex={0} onClick={onClear}>
                    {t('categories.filters.clear-all')}
                </p>
            </div>

            <Accordion
                className="last:border-b-0"
                headerClass="px-0 py-2.5 max-sm:!pb-1.5"
                contentClass="!p-0"
                header={
                    <div className="flex items-center justify-between">
                        <p className="text-lg font-semibold max-sm:text-base max-sm:font-medium">Price</p>
                    </div>
                }
            >
                <ul>
                    <li>
                        <RangeSlider
                            key={applied.price ? applied.price.join('-') : 'all'}
                            min={0}
                            max={maxPrice}
                            value={applied.price || [0, maxPrice]}
                            onChange={(range) => setApplied({ ...applied, price: range })}
                        />
                    </li>
                </ul>
            </Accordion>

            {OPTION_FILTERS.map((filter) => (
                <FilterItem
                    key={filter.code}
                    filter={filter}
                    applied={applied[filter.code] || []}
                    onApply={(values) => {
                        const next = { ...applied, [filter.code]: values };

                        if (!values.length) {
                            delete next[filter.code];
                        }

                        setApplied(next);
                    }}
                />
            ))}
        </div>
    );
}

function Toolbar({ toolbar, setToolbar, mobile = false }) {
    const sortLabel = SORTS.find((sort) => sort.value === toolbar.sort)?.title;
    const buttonClass =
        'flex w-full max-w-[200px] cursor-pointer items-center justify-between gap-4 rounded-lg border border-zinc-200 bg-white p-3.5 text-base transition-all hover:border-gray-400 focus:border-gray-400 max-md:w-[110px] max-md:border-0 max-md:pl-2.5 max-md:pr-2.5';
    const itemClass = 'cursor-pointer px-5 py-2 text-base hover:bg-gray-100 max-sm:text-sm';

    if (mobile) {
        return (
            <ul>
                {SORTS.map((sort) => (
                    <li
                        key={sort.value}
                        className={`px-4 py-2.5 ${sort.value === toolbar.sort ? 'bg-gray-100' : ''}`}
                        onClick={() => setToolbar({ ...toolbar, sort: sort.value })}
                    >
                        {sort.title}
                    </li>
                ))}
            </ul>
        );
    }

    return (
        <div className="flex justify-between max-md:hidden">
            <div className="z-[1]">
                <Dropdown
                    position="bottom-left"
                    contentClass=""
                    toggle={
                        <button className={buttonClass}>
                            {sortLabel || t('products.sort-by.title')}
                            <span className="icon-arrow-down text-2xl" role="presentation" />
                        </button>
                    }
                >
                    <ul className="py-4">
                        {SORTS.map((sort) => (
                            <li
                                key={sort.value}
                                className={`${itemClass} ${sort.value === toolbar.sort ? 'bg-gray-100' : ''}`}
                                onClick={() => setToolbar({ ...toolbar, sort: sort.value })}
                            >
                                {sort.title}
                            </li>
                        ))}
                    </ul>
                </Dropdown>
            </div>

            <div className="flex items-center gap-10">
                <Dropdown
                    position="bottom-right"
                    contentClass=""
                    toggle={
                        <button className={buttonClass}>
                            {toolbar.limit || t('categories.toolbar.show')}
                            <span className="icon-arrow-down text-2xl" role="presentation" />
                        </button>
                    }
                >
                    <ul className="py-4">
                        {LIMITS.map((limit) => (
                            <li
                                key={limit}
                                className={`${itemClass} ${limit === toolbar.limit ? 'bg-gray-100' : ''}`}
                                onClick={() => setToolbar({ ...toolbar, limit })}
                            >
                                {limit}
                            </li>
                        ))}
                    </ul>
                </Dropdown>

                <div className="flex items-center gap-5">
                    <span
                        className={`cursor-pointer text-2xl ${toolbar.mode === 'list' ? 'icon-listing-fill' : 'icon-listing'}`}
                        role="button"
                        aria-label={t('categories.toolbar.list')}
                        tabIndex={0}
                        onClick={() => setToolbar({ ...toolbar, mode: 'list' })}
                    />
                    <span
                        className={`cursor-pointer text-2xl ${toolbar.mode === 'grid' ? 'icon-grid-view-fill' : 'icon-grid-view'}`}
                        role="button"
                        aria-label={t('categories.toolbar.grid')}
                        tabIndex={0}
                        onClick={() => setToolbar({ ...toolbar, mode: 'grid' })}
                    />
                </div>
            </div>
        </div>
    );
}

function useIsMobile() {
    const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);

    useEffect(() => {
        const onResize = () => setIsMobile(window.innerWidth < 768);

        window.addEventListener('resize', onResize);

        return () => window.removeEventListener('resize', onResize);
    }, []);

    return isMobile;
}

function Empty() {
    return (
        <div className="m-auto grid w-full place-content-center items-center justify-items-center py-32 text-center">
            <img className="max-md:h-[100px] max-md:w-[100px]" src="/images/thank-you.png" alt={t('categories.view.empty')} loading="lazy" />
            <p className="text-xl max-md:text-sm" role="heading">
                {t('categories.view.empty')}
            </p>
        </div>
    );
}

/** Port of the v-category / v-search listing: filters, toolbar, grid/list and "Load More". */
export default function ProductListing({ products }) {
    const [params, setParams] = useSearchParams();
    const isMobile = useIsMobile();
    const [drawer, setDrawer] = useState({ filter: false, toolbar: false });
    const [pages, setPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const loadTimer = useRef(null);

    const maxPrice = useMemo(() => Math.max(0, ...products.map(finalPrice)), [products]);

    const toolbar = {
        sort: params.get('sort') || DEFAULTS.sort,
        limit: Number(params.get('limit')) || DEFAULTS.limit,
        mode: params.get('mode') || DEFAULTS.mode,
    };

    const applied = {};

    for (const code of ['color', 'size']) {
        if (params.get(code)) {
            applied[code] = params.get(code).split(',');
        }
    }

    if (params.get('price')) {
        applied.price = params.get('price').split(',').map(Number);
    }

    const updateParams = (nextToolbar, nextApplied) => {
        const next = new URLSearchParams();

        for (const [key, value] of Object.entries(nextToolbar)) {
            if (value !== DEFAULTS[key]) {
                next.set(key, value);
            }
        }

        for (const [key, value] of Object.entries(nextApplied)) {
            if (value?.length) {
                next.set(key, value.join(','));
            }
        }

        for (const key of ['query']) {
            if (params.get(key)) {
                next.set(key, params.get(key));
            }
        }

        setPages(1);
        setParams(next, { replace: true });
    };

    const setToolbar = (next) => {
        updateParams(next, applied);
        setDrawer({ filter: false, toolbar: false });
    };

    const setApplied = (next) => updateParams(toolbar, next);

    const clear = () => updateParams(toolbar, {});

    const filtered = useMemo(() => {
        let list = products;

        for (const [code, values] of Object.entries(applied)) {
            if (code === 'price') {
                list = list.filter((product) => finalPrice(product) >= values[0] && finalPrice(product) <= values[1]);
            } else {
                list = list.filter((product) => productMatches(product, code, values));
            }
        }

        return sortProducts(list, toolbar.sort);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [products, params]);

    const visible = filtered.slice(0, toolbar.limit * pages);
    const hasMore = visible.length < filtered.length;

    const loadMore = () => {
        setLoading(true);
        clearTimeout(loadTimer.current);
        loadTimer.current = setTimeout(() => {
            setPages((value) => value + 1);
            setLoading(false);
        }, 400);
    };

    const filters = <Filters maxPrice={maxPrice || 1} applied={applied} setApplied={setApplied} onClear={clear} />;

    return (
        <div className="container px-[60px] max-lg:px-8 max-md:px-4">
            <div className="flex items-start gap-10 max-lg:gap-5 md:mt-10">
                {!isMobile && <div>{filters}</div>}

                {isMobile && (
                    <div className="fixed bottom-0 z-10 grid w-full max-w-full grid-cols-[1fr_auto_1fr] items-center justify-items-center border-t border-zinc-200 bg-white px-5 ltr:left-0 rtl:right-0">
                        <div
                            className="flex cursor-pointer items-center gap-x-2.5 px-2.5 py-3.5 text-base font-medium uppercase max-md:py-3"
                            onClick={() => setDrawer({ filter: true, toolbar: false })}
                        >
                            <span className="icon-filter-1 text-2xl" />
                            {t('categories.filters.filter')}
                        </div>

                        <span className="h-5 w-0.5 bg-zinc-200" />

                        <div
                            className="flex cursor-pointer items-center gap-x-2.5 px-2.5 py-3.5 text-base font-medium uppercase max-md:py-3"
                            onClick={() => setDrawer({ filter: false, toolbar: true })}
                        >
                            <span className="icon-sort-1 text-2xl" />
                            {t('categories.filters.sort')}
                        </div>

                        <Drawer
                            isOpen={drawer.filter}
                            onClose={() => setDrawer({ filter: false, toolbar: false })}
                            position="left"
                            width="100%"
                            header={
                                <div className="flex items-center justify-between">
                                    <p className="text-lg font-semibold">{t('categories.filters.filters')}</p>
                                    <p className="cursor-pointer text-sm font-medium ltr:mr-[50px] rtl:ml-[50px]" onClick={clear}>
                                        {t('categories.filters.clear-all')}
                                    </p>
                                </div>
                            }
                            content={filters}
                        />

                        <Drawer
                            isOpen={drawer.toolbar}
                            onClose={() => setDrawer({ filter: false, toolbar: false })}
                            position="bottom"
                            width="100%"
                            header={
                                <div className="flex items-center justify-between">
                                    <p className="text-lg font-semibold">{t('categories.filters.sort')}</p>
                                </div>
                            }
                            contentClass="!px-0"
                            content={<Toolbar toolbar={toolbar} setToolbar={setToolbar} mobile />}
                        />
                    </div>
                )}

                <div className="flex-1">
                    <div className="max-md:hidden">
                        <Toolbar toolbar={toolbar} setToolbar={setToolbar} />
                    </div>

                    {toolbar.mode === 'list' ? (
                        <div className="mt-8 grid grid-cols-1 gap-6">
                            {visible.length ? visible.map((product) => <ProductCard key={product.id} product={product} mode="list" />) : <Empty />}
                        </div>
                    ) : (
                        <div className="mt-8 max-md:mt-5">
                            {visible.length ? (
                                <div className="grid grid-cols-3 gap-8 max-1060:grid-cols-2 max-md:justify-items-center max-md:gap-x-4">
                                    {visible.map((product) => (
                                        <ProductCard key={product.id} product={product} />
                                    ))}
                                </div>
                            ) : (
                                <Empty />
                            )}
                        </div>
                    )}

                    {hasMore && !loading && (
                        <button
                            className="secondary-button mx-auto mt-14 block w-max rounded-2xl px-11 py-3 text-center text-base max-md:rounded-lg max-sm:mt-6 max-sm:px-6 max-sm:py-1.5 max-sm:text-sm"
                            onClick={loadMore}
                        >
                            {t('categories.view.load-more')}
                        </button>
                    )}

                    {hasMore && loading && (
                        <button className="secondary-button mx-auto mt-14 block w-max rounded-2xl px-[74.5px] py-3.5 text-center text-base max-md:rounded-lg max-md:py-3 max-sm:mt-6 max-sm:px-[50.8px] max-sm:py-1.5">
                            <img className="h-5 w-5 animate-spin text-navyBlue" src="/images/spinner.svg" alt="Loading" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
