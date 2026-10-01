import { useState } from 'react';
import { Link } from 'react-router-dom';
import { t } from '../../lib/i18n';
import { formatPrice, itemImage } from '../../lib/catalog';
import { useStore } from '../../store/StoreContext';
import { CustomizedBadge } from '../products/Customized';
import { Drawer, QuantityChanger } from '../ui';

const OFFER_INFO = 'Get FLAT 15% OFF on your 1st custom order';

function MiniCartItem({ item }) {
    const { updateCartItem, removeCartItem } = useStore();
    const [showOptions, setShowOptions] = useState(false);
    const url = `/${item.product.slug}`;

    return (
        <div className="flex gap-x-5 max-md:gap-x-4">
            <div>
                <Link to={url}>
                    <img
                        src={itemImage(item)}
                        alt={item.product.name}
                        className="max-h-28 max-w-28 rounded-xl max-md:max-h-20 max-md:max-w-[76px]"
                    />
                </Link>
            </div>

            <div className="grid flex-1 place-content-start justify-stretch gap-y-2.5">
                <div className="flex justify-between gap-2 max-md:gap-0 max-sm:flex-wrap">
                    <div className="max-w-4/5 max-md:w-full">
                        <Link to={url}>
                            <p className="text-base font-medium max-md:font-normal max-sm:text-sm">{item.product.name}</p>
                        </Link>

                        <CustomizedBadge item={item} compact />
                    </div>

                    <p className="text-lg max-md:font-semibold max-sm:text-sm">{formatPrice(item.price)}</p>
                </div>

                {item.options.length > 0 && (
                    <div className="grid select-none gap-x-2.5 gap-y-1.5 max-sm:gap-y-0.5">
                        <div>
                            <p
                                className="flex cursor-pointer items-center gap-x-4 text-base max-md:gap-x-1.5 max-md:text-sm max-sm:text-xs"
                                onClick={() => setShowOptions((value) => !value)}
                            >
                                {t('checkout.cart.mini-cart.see-details')}
                                <span className={`text-2xl max-md:text-xl max-sm:text-lg ${showOptions ? 'icon-arrow-up' : 'icon-arrow-down'}`} />
                            </p>
                        </div>

                        {showOptions && (
                            <div className="grid gap-2">
                                {item.options.map((option) => (
                                    <div key={option.attribute_name} className="max-md:grid max-md:gap-0.5">
                                        <p className="text-sm font-medium text-zinc-500 max-md:font-normal max-sm:text-xs">
                                            {option.attribute_name}:
                                        </p>
                                        <p className="text-sm max-sm:text-xs">{option.option_label}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                <div className="flex flex-wrap items-center gap-5 max-md:gap-2.5">
                    <QuantityChanger
                        className="max-h-9 max-w-[150px] gap-x-2.5 rounded-[54px] px-3.5 py-1.5 max-md:gap-x-2 max-md:px-1 max-md:py-0.5"
                        value={item.quantity}
                        removable
                        onChange={(quantity) => updateCartItem(item.id, quantity)}
                        onRemove={() => removeCartItem(item.id)}
                    />

                    <button type="button" className="text-brand-700 max-md:text-sm" onClick={() => removeCartItem(item.id)}>
                        {t('checkout.cart.mini-cart.remove')}
                    </button>
                </div>
            </div>
        </div>
    );
}

/** Port of checkout/cart/mini-cart.blade.php (drawer variant). */
export default function MiniCart() {
    const { cart } = useStore();
    const [isOpen, setIsOpen] = useState(false);
    const close = () => setIsOpen(false);

    return (
        <div>
            <span className="relative" onClick={() => setIsOpen(true)}>
                <span
                    className="icon-cart cursor-pointer text-2xl"
                    role="button"
                    aria-label={t('checkout.cart.mini-cart.shopping-cart')}
                    tabIndex={0}
                />

                {cart.itemsCount > 0 && (
                    <span className="absolute -top-4 rounded-[44px] bg-navyBlue px-2 py-1.5 text-xs font-semibold leading-[9px] text-white max-md:px-2 max-md:py-1.5 ltr:left-5 max-md:ltr:left-4 rtl:right-5 max-md:rtl:right-4">
                        {cart.itemsCount}
                    </span>
                )}
            </span>

            <Drawer
                isOpen={isOpen}
                onClose={close}
                header={
                    <>
                        <div className="flex items-center justify-between">
                            <p className="text-2xl font-medium max-md:text-xl max-sm:text-xl">{t('checkout.cart.mini-cart.shopping-cart')}</p>
                        </div>

                        <p className="text-base max-md:text-zinc-500 max-sm:text-xs">{OFFER_INFO}</p>
                    </>
                }
                content={
                    cart.items.length ? (
                        <div className="mt-9 grid gap-12 max-md:mt-2.5 max-md:gap-5">
                            {cart.items.map((item) => (
                                <MiniCartItem key={item.id} item={item} />
                            ))}
                        </div>
                    ) : (
                        <div className="mt-32 pb-8 max-md:mt-32">
                            <div className="b-0 grid place-items-center gap-y-5 max-md:gap-y-0">
                                <img className="max-md:h-[100px] max-md:w-[100px]" src="/images/thank-you.png" alt="" />
                                <p className="text-xl max-md:text-sm" role="heading">
                                    {t('checkout.cart.mini-cart.empty-cart')}
                                </p>
                            </div>
                        </div>
                    )
                }
                footer={
                    cart.items.length > 0 && (
                        <div className="grid-col-1 grid gap-5 max-md:gap-2.5">
                            <div className="my-8 flex items-center justify-between border-b border-zinc-200 px-6 pb-2 max-md:my-0 max-md:border-t max-md:px-5 max-md:py-2">
                                <p className="text-sm font-medium text-zinc-500">{t('checkout.cart.mini-cart.subtotal')}</p>
                                <p className="text-3xl font-semibold max-md:text-base">{formatPrice(cart.subTotal)}</p>
                            </div>

                            <div className="grid gap-2.5 px-6 max-md:px-4 max-sm:gap-1.5">
                                <Link
                                    to="/checkout/onepage"
                                    onClick={close}
                                    className="mx-auto block w-full cursor-pointer rounded-2xl bg-navyBlue px-11 py-4 text-center text-base font-medium text-white max-md:rounded-lg max-md:px-5 max-md:py-2"
                                >
                                    {t('checkout.cart.mini-cart.continue-to-checkout')}
                                </Link>

                                <div className="block cursor-pointer text-center text-base font-medium max-md:py-1.5">
                                    <Link to="/checkout/cart" onClick={close}>
                                        {t('checkout.cart.mini-cart.view-cart')}
                                    </Link>
                                </div>
                            </div>
                        </div>
                    )
                }
            />
        </div>
    );
}
