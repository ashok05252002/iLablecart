import { useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { t } from '../../lib/i18n';
import { useStore } from '../../store/StoreContext';
import { Breadcrumbs } from '../ui';
import Layout from './Layout';

export const ACCOUNT_MENU = [
    { key: 'profile', url: '/customer/account/profile', icon: 'icon-users', label: 'layouts.profile' },
    { key: 'addresses', url: '/customer/account/addresses', icon: 'icon-location', label: 'layouts.address' },
    { key: 'orders', url: '/customer/account/orders', icon: 'icon-orders', label: 'layouts.orders' },
    { key: 'downloadables', url: '/customer/account/downloadable-products', icon: 'icon-download', label: 'layouts.downloadable-products' },
    { key: 'reviews', url: '/customer/account/reviews', icon: 'icon-star', label: 'layouts.reviews' },
    { key: 'wishlist', url: '/customer/account/wishlist', icon: 'icon-heart', label: 'layouts.wishlist' },
    { key: 'gdpr', url: '/customer/account/gdpr', icon: 'icon-gdpr-safe', label: 'layouts.gdpr-request' },
    { key: 'rma', url: '/customer/account/rma', icon: 'icon-compare-1', label: 'layouts.rma' },
];

/** Port of components/layouts/account/navigation.blade.php. */
export function AccountNavigation() {
    const { customer } = useStore();
    const { pathname } = useLocation();

    return (
        <div className="panel-side journal-scroll grid max-h-[1320px] min-w-[342px] max-w-[380px] grid-cols-[1fr] gap-8 overflow-y-auto overflow-x-hidden max-xl:min-w-[270px] max-md:max-w-full max-md:gap-5">
            <div className="grid grid-cols-[auto_1fr] items-center gap-4 rounded-xl border border-zinc-200 px-5 py-[25px] max-md:py-2.5">
                <div>
                    <img src="/images/user-placeholder.png" className="h-[60px] w-[60px] rounded-full" alt="Profile" />
                </div>

                <div className="flex flex-col justify-between">
                    <p className="font-mediums break-all text-2xl max-md:text-xl">Hello! {customer.first_name}</p>
                    <p className="max-md:text-md: text-zinc-500 no-underline">{customer.email}</p>
                </div>
            </div>

            <div>
                <div className="select-none pb-5 max-md:pb-1.5">
                    <p className="text-xl font-medium max-md:text-lg">{t('layouts.my-account')}</p>
                </div>

                <div className="grid rounded-md border border-b border-l-[1px] border-r border-t-0 border-zinc-200 max-md:border-none">
                    {ACCOUNT_MENU.map((item) => (
                        <Link key={item.key} to={item.url}>
                            <div
                                className={`flex cursor-pointer justify-between border-t border-zinc-200 px-6 py-5 hover:bg-zinc-100 max-md:border-0 max-md:p-4 max-md:px-0 max-md:py-3 ${pathname.startsWith(item.url) ? 'bg-zinc-100' : ''}`}
                            >
                                <p className="flex items-center gap-x-4 text-lg font-medium max-sm:text-base">
                                    <span className={`${item.icon} text-2xl`} />
                                    {t(item.label)}
                                </p>
                                <span className="icon-arrow-right text-2xl rtl:icon-arrow-left" />
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}

/** Port of components/layouts/account/index.blade.php. Guests are sent to the login page. */
export default function AccountLayout({ title, crumbs = [], children, showNavigation = true }) {
    const { customer } = useStore();

    if (!customer) {
        return <Navigate to="/customer/login" replace />;
    }

    return (
        <Layout title={title} hasFeature={false}>
            <div className="container px-[60px] max-lg:px-8 max-md:px-0">
                <div className="mt-8 flex justify-start max-lg:hidden">
                    <div className="flex items-center gap-x-3.5">
                        <Breadcrumbs items={crumbs.length ? crumbs : [{ title }]} />
                    </div>
                </div>

                <div className="mt-8 flex items-start gap-10 max-lg:gap-5 max-md:mt-5 max-md:grid max-md:gap-0">
                    {showNavigation && (
                        <div className="max-md:hidden">
                            <AccountNavigation />
                        </div>
                    )}

                    {children}
                </div>
            </div>
        </Layout>
    );
}

/** Page heading with the mobile back arrow, used by every account page. */
export function AccountHeading({ title, action, className = 'mb-8 max-md:mb-5' }) {
    return (
        <div className={`flex items-center justify-between ${action ? '' : className}`}>
            <div className="flex items-center">
                <Link className="grid md:hidden" to="/customer/account">
                    <span className="icon-arrow-left text-2xl rtl:icon-arrow-right" />
                </Link>
                <h2 className="text-2xl font-medium max-md:text-xl max-sm:text-base ltr:ml-2.5 md:ltr:ml-0 rtl:mr-2.5 md:rtl:mr-0">{title}</h2>
            </div>

            {action}
        </div>
    );
}

/** Simplified port of <x-shop::datagrid>: search, table, pagination. */
export function DataGrid({ columns, records, actions, searchKeys = [] }) {
    const [query, setQuery] = useState('');
    const [page, setPage] = useState(1);
    const perPage = 10;

    const filtered = records.filter((record) =>
        !query || searchKeys.some((key) => String(record[key] ?? '').toLowerCase().includes(query.toLowerCase())),
    );
    const lastPage = Math.max(1, Math.ceil(filtered.length / perPage));
    const current = Math.min(page, lastPage);
    const visible = filtered.slice((current - 1) * perPage, current * perPage);
    const template = { gridTemplateColumns: `repeat(${columns.length + (actions ? 1 : 0)}, minmax(0, 1fr))` };

    return (
        <>
            <div className="mt-7 flex items-center justify-between gap-4 max-md:block">
                <div className="flex w-full items-center gap-x-1">
                    <div className="flex max-w-[445px] items-center max-md:w-full max-md:max-w-[250px]">
                        <div className="relative w-full">
                            <input
                                type="text"
                                className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-base text-gray-600 transition-all hover:border-gray-400 focus:border-gray-400 max-md:max-w-[250px] max-md:py-2 max-sm:py-1.5 ltr:pr-8 rtl:pl-8"
                                placeholder={t('components.datagrid.toolbar.search.title')}
                                value={query}
                                onChange={(event) => {
                                    setQuery(event.target.value);
                                    setPage(1);
                                }}
                            />
                            <div className="icon-search pointer-events-none absolute top-2.5 flex items-center text-xl max-sm:top-2 ltr:right-2.5 rtl:left-2.5" />
                        </div>
                    </div>

                    <div className="max-md:hidden ltr:pl-2.5 rtl:pr-2.5">
                        <p className="text-sm font-light text-gray-800 max-md:w-full">{t('components.datagrid.toolbar.results', { total: filtered.length })}</p>
                    </div>
                </div>
            </div>

            <div className="mt-4 w-full overflow-x-auto rounded-xl border max-md:rounded-none max-md:border-0">
                <div className="table-responsive box-shadow grid w-full overflow-hidden rounded bg-white">
                    <div
                        className="row grid items-center gap-2.5 border-b border-zinc-200 bg-zinc-100 px-6 py-4 text-sm font-medium text-black max-md:p-4"
                        style={template}
                    >
                        {columns.map((column) => (
                            <p key={column.key} className="flex items-center gap-1.5">
                                {column.label}
                            </p>
                        ))}
                        {actions && <p className="place-self-end max-md:place-self-auto">{t('components.datagrid.table.actions')}</p>}
                    </div>

                    {visible.length ? (
                        visible.map((record) => (
                            <div
                                key={record.id}
                                className="row grid items-center gap-2.5 border-b bg-white px-6 py-4 font-medium text-gray-600 transition-all max-md:p-4 max-md:text-xs"
                                style={template}
                            >
                                {columns.map((column) => (
                                    <p key={column.key} className="break-words">
                                        {column.render ? column.render(record) : record[column.key]}
                                    </p>
                                ))}
                                {actions && <p>{actions(record)}</p>}
                            </div>
                        ))
                    ) : (
                        <div className="row grid border-b border-gray-300 px-4 py-4 text-center text-gray-600">
                            <p>{t('components.datagrid.table.no-records-available')}</p>
                        </div>
                    )}

                    {visible.length > 0 && (
                        <div className="flex items-center justify-between p-6 max-md:p-2">
                            <p className="text-xs font-medium">
                                {t('components.datagrid.table.showing', { firstItem: (current - 1) * perPage + 1 })}{' '}
                                {t('components.datagrid.table.to', { lastItem: (current - 1) * perPage + visible.length })}{' '}
                                {t('components.datagrid.table.of', { total: filtered.length })}
                            </p>

                            <div className="flex items-center gap-1">
                                <ul className="inline-flex items-center -space-x-px rounded-lg border border-zinc-200 max-md:px-0">
                                    <li>
                                        <button
                                            className="flex h-10 w-9 items-center justify-center font-medium leading-normal hover:bg-gray-100 max-md:h-8 max-md:w-6 max-md:justify-normal"
                                            onClick={() => setPage(Math.max(1, current - 1))}
                                        >
                                            <span className="icon-arrow-left text-2xl rtl:icon-arrow-right" />
                                        </button>
                                    </li>
                                    <li>
                                        <span className="flex max-w-[42px] items-center border-l border-r px-4 py-2 font-medium leading-normal text-black max-md:max-w-9 max-md:justify-normal max-md:px-0 max-md:py-1 max-md:text-center">
                                            {current}
                                        </span>
                                    </li>
                                    <li>
                                        <button
                                            className="flex h-10 w-9 items-center justify-center font-medium leading-normal hover:bg-gray-100 max-md:h-8 max-md:w-6 max-md:justify-normal"
                                            onClick={() => setPage(Math.min(lastPage, current + 1))}
                                        >
                                            <span className="icon-arrow-right text-2xl rtl:icon-arrow-left" />
                                        </button>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
