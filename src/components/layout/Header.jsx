import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { t } from '../../lib/i18n';
import { categoryTree } from '../../lib/catalog';
import { useStore } from '../../store/StoreContext';
import { Drawer, Dropdown } from '../ui';
import MiniCart from './MiniCart';

const categories = categoryTree();

function Logo({ className }) {
    return <img className={className} src="/images/logo.png" width="143" height="29" alt="Sainmarks" />;
}

function useSearchSubmit() {
    const navigate = useNavigate();

    return (event) => {
        event.preventDefault();

        const query = new FormData(event.currentTarget).get('query');

        if (query) {
            navigate(`/search?query=${encodeURIComponent(query)}`);
        }
    };
}

function ImageSearchIcon({ className }) {
    return <label className={className} aria-label={t('search.images.index.search')} />;
}

/** Guest / customer profile dropdown content, shared by desktop and tablet. */
function ProfileMenu({ mobile = false }) {
    const { customer, signOut } = useStore();
    const scope = mobile ? 'mobile' : 'desktop.bottom';
    const itemClass = mobile ? 'cursor-pointer px-5 py-2 text-base' : 'cursor-pointer px-5 py-2 text-base hover:bg-gray-100';

    if (!customer) {
        return (
            <>
                <div className="grid gap-2.5">
                    <p className="font-dmserif text-xl">{t(`components.layouts.header.${scope}.welcome-guest`)}</p>
                    <p className="text-sm">{t(`components.layouts.header.${scope}.dropdown-text`)}</p>
                </div>

                <p className="mt-3 w-full border border-zinc-200" />

                <div className="mt-6 flex gap-4">
                    <Link
                        to="/customer/login"
                        className="primary-button m-0 mx-auto block w-max rounded-2xl px-7 text-center text-base max-md:rounded-lg ltr:ml-0 rtl:mr-0"
                    >
                        {t(`components.layouts.header.${scope}.sign-in`)}
                    </Link>

                    <Link
                        to="/customer/register"
                        className="secondary-button m-0 mx-auto block w-max rounded-2xl border-2 px-7 text-center text-base max-md:rounded-lg max-md:py-3 ltr:ml-0 rtl:mr-0"
                    >
                        {t(`components.layouts.header.${scope}.sign-up`)}
                    </Link>
                </div>
            </>
        );
    }

    return (
        <>
            <div className="grid gap-2.5 p-5 pb-0">
                <p className="font-dmserif text-xl">
                    {t(`components.layouts.header.${scope}.welcome`)}’ {customer.first_name}
                </p>
                <p className="text-sm">{t(`components.layouts.header.${scope}.dropdown-text`)}</p>
            </div>

            <p className="mt-3 w-full border border-zinc-200" />

            <div className="mt-2.5 grid gap-1 pb-2.5">
                <Link className={itemClass} to="/customer/account/profile">
                    {t(`components.layouts.header.${scope}.profile`)}
                </Link>
                <Link className={itemClass} to="/customer/account/orders">
                    {t(`components.layouts.header.${scope}.orders`)}
                </Link>
                <Link className={itemClass} to="/customer/account/wishlist">
                    {t(`components.layouts.header.${scope}.wishlist`)}
                </Link>
                <a
                    className={itemClass}
                    href="/"
                    onClick={(event) => {
                        event.preventDefault();
                        signOut();
                    }}
                >
                    {t(`components.layouts.header.${scope}.logout`)}
                </a>
            </div>
        </>
    );
}

/** Two-per-column grouping used by the mega menu (pairCategoryChildren). */
const pairs = (children) =>
    children.reduce((result, value, index, array) => {
        if (index % 2 === 0) {
            result.push(array.slice(index, index + 2));
        }

        return result;
    }, []);

function MegaMenu({ category }) {
    if (!category.children.length) {
        return null;
    }

    return (
        <div className="pointer-events-none absolute top-[78px] z-[1] flex max-h-[580px] w-max max-w-[1260px] translate-y-1 justify-between gap-x-[70px] overflow-auto overflow-x-auto border border-b-0 border-l-0 border-r-0 border-t border-[#F3F3F3] bg-white p-9 opacity-0 shadow-[0_6px_6px_1px_rgba(0,0,0,.3)] transition duration-300 ease-out group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100 group-hover:duration-200 group-hover:ease-in ltr:-left-9 rtl:-right-9">
            {pairs(category.children).map((pair, index) => (
                <div key={index} className="grid w-full min-w-max max-w-[150px] flex-auto grid-cols-[1fr] content-start gap-5">
                    {pair.map((second) => (
                        <div key={second.id} className="contents">
                            <p className="font-medium text-navyBlue">
                                <Link to={second.url}>{second.name}</Link>
                            </p>

                            {second.children.length > 0 && (
                                <ul className="grid grid-cols-[1fr] gap-3">
                                    {second.children.map((third) => (
                                        <li key={third.id} className="text-sm font-medium text-zinc-500">
                                            <Link to={third.url}>{third.name}</Link>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
}

/** Sliding category list used by the desktop "All" drawer and the mobile drawer. */
function CategoryPanel({ desktop = false, onNavigate }) {
    const [third, setThird] = useState(null);

    const rowClass = desktop
        ? 'flex cursor-pointer items-center justify-between px-6 py-2 transition-colors duration-200 hover:bg-gray-100'
        : 'flex cursor-pointer items-center justify-between py-2 transition-colors duration-200';

    return (
        <div className="relative h-full overflow-hidden">
            <div
                className={`flex h-full transition-transform duration-300 ${third ? 'ltr:-translate-x-full rtl:translate-x-full' : 'ltr:translate-x-0 rtl:translate-x-0'}`}
            >
                <div className={desktop ? 'h-[calc(100vh-74px)] w-full flex-shrink-0 overflow-auto' : 'h-full w-full flex-shrink-0 overflow-auto px-6'}>
                    <div className="py-4">
                        {categories.map((category) => (
                            <div key={category.id} className={category.children.length ? 'mb-2' : ''}>
                                <div className={rowClass}>
                                    <Link to={category.url} onClick={onNavigate} className="text-base font-medium text-black">
                                        {category.name}
                                    </Link>
                                </div>

                                {category.children.map((second) => (
                                    <div
                                        key={second.id}
                                        className={rowClass}
                                        onClick={(event) => {
                                            if (second.children.length) {
                                                event.preventDefault();
                                                setThird(second);
                                            }
                                        }}
                                    >
                                        <Link
                                            to={second.url}
                                            className="text-sm font-normal"
                                            onClick={(event) => (second.children.length ? event.preventDefault() : onNavigate?.())}
                                        >
                                            {second.name}
                                        </Link>

                                        {second.children.length > 0 && <span className="icon-arrow-right rtl:icon-arrow-left" />}
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>

                {third && (
                    <div className="h-full w-full flex-shrink-0">
                        <div className="border-b border-gray-200 px-6 py-4">
                            <button
                                onClick={() => setThird(null)}
                                className="flex items-center justify-center gap-2 focus:outline-none"
                                aria-label="Go back"
                            >
                                <span className="icon-arrow-left text-lg rtl:icon-arrow-right" />
                                <p className="text-base font-medium text-black">{t('components.layouts.header.desktop.bottom.back-button')}</p>
                            </button>
                        </div>

                        <div className="py-4">
                            {third.children.map((category) => (
                                <div key={category.id} className="mb-2">
                                    <Link
                                        to={category.url}
                                        onClick={onNavigate}
                                        className="block px-6 py-2 text-sm transition-colors duration-200 hover:bg-gray-100"
                                    >
                                        {category.name}
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function DesktopHeader() {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [params] = useSearchParams();
    const onSearch = useSearchSubmit();

    return (
        <div className="flex flex-wrap max-lg:hidden">
            <div className="flex min-h-[78px] w-full justify-between border border-b border-l-0 border-r-0 border-t-0 px-[60px] max-1180:px-8">
                <div className="flex items-center gap-x-10 max-[1180px]:gap-x-5">
                    <Link to="/" aria-label={t('components.layouts.header.desktop.bottom.bagisto')}>
                        <Logo />
                    </Link>

                    <div className="flex items-center">
                        <div
                            className="flex h-[77px] cursor-pointer items-center border-b-4 border-transparent hover:border-b-4 hover:border-navyBlue"
                            onClick={() => setDrawerOpen(true)}
                        >
                            <span className="flex items-center gap-1 px-5 uppercase">
                                <span className="icon-hamburger text-xl" />
                                {t('components.layouts.header.desktop.bottom.all')}
                            </span>
                        </div>

                        {categories.slice(0, 4).map((category) => (
                            <div
                                key={category.id}
                                className="group relative flex h-[77px] items-center border-b-4 border-transparent hover:border-b-4 hover:border-navyBlue"
                            >
                                <span>
                                    <Link to={category.url} className="inline-block px-5 uppercase">
                                        {category.name}
                                    </Link>
                                </span>

                                <MegaMenu category={category} />
                            </div>
                        ))}
                    </div>

                    <Drawer
                        isOpen={drawerOpen}
                        onClose={() => setDrawerOpen(false)}
                        position="left"
                        width="400px"
                        headerClass="border-b border-gray-200"
                        header={
                            <div className="flex w-full items-center justify-between">
                                <p className="text-xl font-medium">{t('components.layouts.header.desktop.bottom.categories')}</p>
                            </div>
                        }
                        contentClass="!px-0"
                        content={<CategoryPanel desktop onNavigate={() => setDrawerOpen(false)} />}
                    />
                </div>

                <div className="flex items-center gap-x-9 max-[1100px]:gap-x-6 max-lg:gap-x-8">
                    <div className="relative w-full">
                        <form onSubmit={onSearch} className="flex max-w-[445px] items-center" role="search">
                            <label htmlFor="organic-search" className="sr-only">
                                {t('components.layouts.header.desktop.bottom.search')}
                            </label>

                            <div className="icon-search pointer-events-none absolute top-2.5 flex items-center text-xl ltr:left-3 rtl:right-3" />

                            <input
                                type="text"
                                name="query"
                                key={params.get('query') || ''}
                                defaultValue={params.get('query') || ''}
                                className="block w-full rounded-lg border border-transparent bg-zinc-100 px-11 py-3 text-xs font-medium text-gray-900 transition-all hover:border-gray-400 focus:border-gray-400"
                                placeholder={t('components.layouts.header.desktop.bottom.search-text')}
                                aria-label={t('components.layouts.header.desktop.bottom.search-text')}
                                required
                            />

                            <button type="submit" className="hidden" aria-label={t('components.layouts.header.desktop.bottom.submit')} />

                            <ImageSearchIcon className="icon-camera absolute top-3 flex items-center text-xl max-md:ltr:right-1.5 max-sm:top-2.5 ltr:right-3 ltr:pr-3 rtl:left-3 rtl:pl-3 max-md:rtl:left-1.5" />
                        </form>
                    </div>

                    <div className="mt-1.5 flex gap-x-8 max-[1100px]:gap-x-6 max-lg:gap-x-8">
                        <Link to="/compare" aria-label={t('components.layouts.header.desktop.bottom.compare')}>
                            <span className="icon-compare inline-block cursor-pointer text-2xl" role="presentation" />
                        </Link>

                        <MiniCart />

                        <ProfileDropdown />
                    </div>
                </div>
            </div>
        </div>
    );
}

function ProfileDropdown({ mobile = false }) {
    const { customer } = useStore();

    return (
        <Dropdown
            position="bottom-right"
            contentClass={customer ? '!p-0' : 'p-5'}
            toggle={
                <span
                    className="icon-users inline-block cursor-pointer text-2xl"
                    role="button"
                    aria-label={t('components.layouts.header.desktop.bottom.profile')}
                    tabIndex={0}
                />
            }
        >
            <ProfileMenu mobile={mobile} />
        </Dropdown>
    );
}

function MobileHeader() {
    const { customer } = useStore();
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [params] = useSearchParams();
    const onSearch = useSearchSubmit();
    const close = () => setDrawerOpen(false);

    return (
        <div className="flex flex-wrap gap-4 px-4 pb-4 pt-6 shadow-sm lg:hidden">
            <div className="flex w-full items-center justify-between">
                <div className="flex items-center gap-x-1.5">
                    <span className="icon-hamburger cursor-pointer text-2xl" onClick={() => setDrawerOpen(true)} />

                    <Drawer
                        isOpen={drawerOpen}
                        onClose={close}
                        position="left"
                        width="100%"
                        header={
                            <div className="flex items-center justify-between">
                                <Link to="/" onClick={close}>
                                    <Logo />
                                </Link>
                            </div>
                        }
                        contentClass="!p-0"
                        content={
                            <>
                                <div className="border-b border-zinc-200 p-4">
                                    <div className="grid grid-cols-[auto_1fr] items-center gap-4 rounded-xl border border-zinc-200 p-2.5">
                                        <div>
                                            <img src="/images/user-placeholder.png" className="h-[60px] w-[60px] rounded-full max-md:rounded-full" alt="" />
                                        </div>

                                        {customer ? (
                                            <div className="flex flex-col justify-between gap-2.5 max-md:gap-0">
                                                <p className="font-mediums break-all text-2xl max-md:text-xl">Hello! {customer.first_name}</p>
                                                <p className="text-zinc-500 no-underline max-md:text-sm">{customer.email}</p>
                                            </div>
                                        ) : (
                                            <Link to="/customer/login" onClick={close} className="flex text-base font-medium">
                                                {t('components.layouts.header.mobile.login')}
                                                <i className="icon-double-arrow text-2xl ltr:ml-2.5 rtl:mr-2.5" />
                                            </Link>
                                        )}
                                    </div>
                                </div>

                                <CategoryPanel onNavigate={close} />
                            </>
                        }
                    />

                    <Link to="/" className="flex max-h-[30px] items-center" aria-label={t('components.layouts.header.mobile.bagisto')}>
                        <Logo className="block" />
                    </Link>
                </div>

                <div>
                    <div className="flex items-center gap-x-5 max-md:gap-x-4">
                        <Link to="/compare" aria-label={t('components.layouts.header.mobile.compare')}>
                            <span className="icon-compare cursor-pointer text-2xl" />
                        </Link>

                        <MiniCart />

                        <div className="max-md:hidden">
                            <ProfileDropdown mobile />
                        </div>

                        <div className="md:hidden">
                            <Link to={customer ? '/customer/account' : '/customer/login'} aria-label={t('components.layouts.header.mobile.account')}>
                                <span className="icon-users cursor-pointer text-2xl" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <form onSubmit={onSearch} className="flex w-full items-center">
                <label htmlFor="organic-search" className="sr-only">
                    {t('components.layouts.header.mobile.search')}
                </label>

                <div className="relative w-full">
                    <div className="icon-search pointer-events-none absolute top-3 flex items-center text-2xl max-md:text-xl max-sm:top-2.5 ltr:left-3 rtl:right-3" />

                    <input
                        type="text"
                        className="block w-full rounded-xl border border-['#E3E3E3'] px-11 py-3.5 text-sm font-medium text-gray-900 max-md:rounded-lg max-md:px-10 max-md:py-3 max-md:font-normal max-sm:text-xs"
                        name="query"
                        key={params.get('query') || ''}
                        defaultValue={params.get('query') || ''}
                        placeholder={t('components.layouts.header.mobile.search-text')}
                        required
                    />

                    <ImageSearchIcon className="icon-camera absolute top-3 flex items-center text-xl max-md:ltr:right-1.5 max-sm:top-2.5 ltr:right-3 ltr:pr-3 rtl:left-3 rtl:pl-3 max-md:rtl:left-1.5" />
                </div>
            </form>
        </div>
    );
}

export default function Header() {
    return (
        <header className="shadow-gray sticky top-0 z-10 bg-white shadow-sm max-lg:shadow-none">
            <DesktopHeader />
            <MobileHeader />
        </header>
    );
}
