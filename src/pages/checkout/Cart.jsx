import { useState } from 'react';
import { Link } from 'react-router-dom';
import CheckoutHeader from '../../components/layout/CheckoutHeader';
import Layout from '../../components/layout/Layout';
import CartSummary from '../../components/products/CartSummary';
import { ProductsCarousel } from '../../components/home/Carousels';
import { Breadcrumbs, QuantityChanger, useConfirm } from '../../components/ui';
import { allProducts, baseImage, formatPrice } from '../../lib/catalog';
import { t } from '../../lib/i18n';
import { useStore } from '../../store/StoreContext';

function CartItem({ item, selected, onSelect, quantity, onQuantity, onRemove }) {
    const [showOptions, setShowOptions] = useState(false);
    const url = `/${item.product.slug}`;
    const total = formatPrice(item.price * quantity);

    return (
        <div className="grid gap-y-6">
            <div className="flex justify-between gap-x-2.5 border-b border-zinc-200 pb-5">
                <div className="flex gap-x-5">
                    <div className="mt-11 select-none max-md:mt-9 max-sm:mt-7">
                        <input type="checkbox" id={`item_${item.id}`} className="peer hidden" checked={selected} onChange={onSelect} />
                        <label
                            className="icon-uncheck peer-checked:icon-check-box cursor-pointer text-2xl text-navyBlue peer-checked:text-navyBlue"
                            htmlFor={`item_${item.id}`}
                            tabIndex={0}
                            aria-label={t('checkout.cart.index.select-cart-item')}
                        />
                    </div>

                    <Link to={url}>
                        <img
                            className="h-[110px] max-w-[110px] rounded-xl max-md:h-20 max-md:max-w-20"
                            src={baseImage(item.product)}
                            alt={item.product.name}
                            width="110"
                            height="110"
                        />
                    </Link>

                    <div className="grid place-content-start gap-y-2.5 max-md:gap-y-0">
                        <Link to={url}>
                            <p className="text-base font-medium max-sm:text-sm">{item.product.name}</p>
                        </Link>

                        {item.options.length > 0 && (
                            <div className="grid select-none gap-x-2.5 gap-y-1.5">
                                <div>
                                    <p
                                        className="flex cursor-pointer items-center gap-x-4 text-base max-md:gap-x-1.5 max-sm:text-xs"
                                        onClick={() => setShowOptions((value) => !value)}
                                    >
                                        {t('checkout.cart.index.see-details')}
                                        <span className={`text-2xl max-md:text-lg ${showOptions ? 'icon-arrow-up' : 'icon-arrow-down'}`} />
                                    </p>
                                </div>

                                {showOptions && (
                                    <div className="grid gap-2">
                                        {item.options.map((option) => (
                                            <div key={option.attribute_name} className="max-md:grid max-md:gap-0.5">
                                                <p className="text-sm font-medium text-zinc-500 max-md:font-normal max-sm:text-xs">{option.attribute_name}:</p>
                                                <p className="text-sm max-sm:text-xs">{option.option_label}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="md:hidden">
                            <p className="text-lg font-semibold max-md:text-sm">{total}</p>
                        </div>

                        <div className="flex items-center gap-2.5 max-md:mt-2.5">
                            <QuantityChanger
                                className="flex max-w-max items-center gap-x-2.5 rounded-[54px] border border-navyBlue px-3.5 py-1.5 max-md:gap-x-1.5 max-md:px-1 max-md:py-0.5"
                                value={quantity}
                                removable
                                onChange={onQuantity}
                                onRemove={onRemove}
                            />

                            <span className="hidden cursor-pointer text-sm text-blue-700 max-md:block" role="button" tabIndex={0} onClick={onRemove}>
                                {t('checkout.cart.index.remove')}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="text-right max-md:hidden">
                    <p className="text-lg font-semibold">{total}</p>

                    <span className="cursor-pointer text-base text-blue-700" role="button" tabIndex={0} onClick={onRemove}>
                        {t('checkout.cart.index.remove')}
                    </span>
                </div>
            </div>
        </div>
    );
}

/** Port of checkout/cart/index.blade.php. */
export default function Cart() {
    const { cart, customer, updateCartItem, removeCartItem, removeCartItems, setWishlist, flash } = useStore();
    const [selected, setSelected] = useState([]);
    const [quantities, setQuantities] = useState({});
    const [confirm, ask] = useConfirm();

    const allSelected = cart.items.length > 0 && selected.length === cart.items.length;

    const update = () => {
        for (const [id, quantity] of Object.entries(quantities)) {
            updateCartItem(Number(id), quantity);
        }

        setQuantities({});
        flash('success', t('checkout.cart.index.update-cart-success') !== 'checkout.cart.index.update-cart-success' ? t('checkout.cart.index.update-cart-success') : 'Cart updated successfully.');
    };

    const removeSelected = () =>
        ask(() => {
            removeCartItems(selected);
            setSelected([]);
        });

    const moveSelectedToWishlist = () =>
        ask(() => {
            const productIds = cart.items.filter((item) => selected.includes(item.id)).map((item) => item.product.id);

            setWishlist((ids) => [...new Set([...ids, ...productIds])]);
            removeCartItems(selected);
            setSelected([]);
        });

    return (
        <Layout title={t('checkout.cart.index.cart')} hasHeader={false} hasFeature={false} hasFooter={false}>
            <CheckoutHeader ariaLabel={t('checkout.cart.index.bagisto')} />

            <div className="flex-auto">
                <div className="container px-[60px] max-lg:px-8 max-md:px-4">
                    <Breadcrumbs items={[{ title: t('checkout.cart.index.cart') }]} />

                    {cart.items.length ? (
                        <div className="mt-8 flex flex-wrap gap-20 pb-8 max-1060:flex-col max-md:mt-0 max-md:gap-[30px] max-md:pb-0">
                            <div className="flex flex-1 flex-col gap-6 max-md:gap-5">
                                <div className="flex items-center justify-between border-b border-zinc-200 pb-2.5 max-md:py-2.5">
                                    <div className="flex select-none items-center">
                                        <input
                                            type="checkbox"
                                            id="select-all"
                                            className="peer hidden"
                                            checked={allSelected}
                                            onChange={() => setSelected(allSelected ? [] : cart.items.map((item) => item.id))}
                                        />
                                        <label
                                            className="icon-uncheck peer-checked:icon-check-box cursor-pointer text-2xl text-navyBlue peer-checked:text-navyBlue"
                                            htmlFor="select-all"
                                            tabIndex={0}
                                            aria-label={t('checkout.cart.index.select-all')}
                                        />
                                        <span className="text-xl max-sm:text-sm ltr:ml-2.5 rtl:mr-2.5" role="heading" aria-level="2">
                                            {t('checkout.cart.index.items-selected', { count: selected.length })}
                                        </span>
                                    </div>

                                    {selected.length > 0 && (
                                        <div>
                                            <span className="cursor-pointer text-base text-blue-700 max-sm:text-xs" role="button" tabIndex={0} onClick={removeSelected}>
                                                {t('checkout.cart.index.remove')}
                                            </span>

                                            {customer && (
                                                <>
                                                    <span className="mx-2.5 border-r-2 border-zinc-200" />
                                                    <span
                                                        className="cursor-pointer text-base text-blue-700 max-sm:text-xs"
                                                        role="button"
                                                        tabIndex={0}
                                                        onClick={moveSelectedToWishlist}
                                                    >
                                                        {t('checkout.cart.index.move-to-wishlist')}
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {cart.items.map((item) => (
                                    <CartItem
                                        key={item.id}
                                        item={item}
                                        selected={selected.includes(item.id)}
                                        onSelect={() =>
                                            setSelected((ids) => (ids.includes(item.id) ? ids.filter((id) => id !== item.id) : [...ids, item.id]))
                                        }
                                        quantity={quantities[item.id] ?? item.quantity}
                                        onQuantity={(quantity) => setQuantities({ ...quantities, [item.id]: quantity })}
                                        onRemove={() => ask(() => removeCartItem(item.id))}
                                    />
                                ))}

                                <div className="flex flex-wrap justify-end gap-8 max-md:justify-between max-md:gap-5">
                                    <Link
                                        className="secondary-button max-h-14 rounded-2xl max-md:rounded-lg max-md:px-6 max-md:py-3 max-md:text-sm max-sm:py-2"
                                        to="/"
                                    >
                                        {t('checkout.cart.index.continue-shopping')}
                                    </Link>

                                    <button
                                        className="secondary-button max-h-14 rounded-2xl max-md:rounded-lg max-md:px-6 max-md:py-3 max-md:text-sm max-sm:py-2"
                                        onClick={update}
                                    >
                                        {t('checkout.cart.index.update-cart')}
                                    </button>
                                </div>
                            </div>

                            <CartSummary />
                        </div>
                    ) : (
                        <div className="m-auto grid w-full place-content-center items-center justify-items-center py-32 text-center">
                            <img className="max-md:h-[100px] max-md:w-[100px]" src="/images/thank-you.png" alt={t('checkout.cart.index.empty-product')} />
                            <p className="text-xl max-md:text-sm" role="heading">
                                {t('checkout.cart.index.empty-product')}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {cart.items.length > 0 && (
                <ProductsCarousel
                    title={t('checkout.cart.index.cross-sell.title')}
                    products={allProducts.filter((product) => !cart.items.some((item) => item.product.id === product.id)).slice(0, 8)}
                />
            )}

            {confirm}
        </Layout>
    );
}
