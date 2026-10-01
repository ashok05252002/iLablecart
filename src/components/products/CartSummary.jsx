import { useState } from 'react';
import { Link } from 'react-router-dom';
import { t } from '../../lib/i18n';
import { formatPrice } from '../../lib/catalog';
import { useStore } from '../../store/StoreContext';
import { ControlGroup, FieldError, Input, Modal } from '../ui';

/** Port of checkout/coupon.blade.php. */
export function Coupon() {
    const { cart, applyCoupon, removeCoupon } = useStore();
    const [isOpen, setIsOpen] = useState(false);
    const [code, setCode] = useState('');
    const [error, setError] = useState('');

    const submit = (event) => {
        event.preventDefault();

        if (!code) {
            setError('The code field is required');

            return;
        }

        setError('');

        if (applyCoupon(code)) {
            setIsOpen(false);
            setCode('');
        }
    };

    return (
        <div className="flex justify-between text-right">
            <p className="text-base max-md:font-normal max-sm:text-sm">
                {cart.coupon ? t('checkout.coupon.applied') : t('checkout.coupon.discount')}
            </p>

            <div className="text-base font-medium max-sm:text-sm">
                {!cart.coupon && (
                    <span className="cursor-pointer text-base text-brand-700 max-sm:text-sm" role="button" tabIndex={0} onClick={() => setIsOpen(true)}>
                        {t('checkout.coupon.apply')}
                    </span>
                )}

                <form onSubmit={submit} noValidate>
                    <Modal
                        isOpen={isOpen}
                        onClose={() => setIsOpen(false)}
                        header={<h2 className="text-2xl font-medium max-md:text-base">{t('checkout.coupon.apply')}</h2>}
                        contentClass="!px-4"
                        content={
                            <ControlGroup className="!mb-0">
                                <Input
                                    className="px-6 py-4 max-md:!mb-0 max-md:!p-3 max-sm:!p-2"
                                    value={code}
                                    error={error}
                                    placeholder={t('checkout.coupon.enter-your-code')}
                                    onChange={(event) => setCode(event.target.value)}
                                />
                                <FieldError message={error} />
                                <p className="mt-2 text-left text-xs text-zinc-500">Demo: use the code SAVE10 for 10% off.</p>
                            </ControlGroup>
                        }
                        footer={
                            <div className="flex flex-wrap items-center gap-4 max-md:justify-between">
                                <div className="flex items-center gap-4 max-md:block">
                                    <p className="text-sm font-medium text-zinc-500 max-md:text-left max-md:text-xs">{t('checkout.coupon.subtotal')}</p>
                                    <p className="text-3xl font-semibold max-md:text-lg">{formatPrice(cart.subTotal)}</p>
                                </div>

                                <button
                                    type="submit"
                                    className="primary-button max-w-none flex-auto rounded-2xl px-11 py-3 max-md:max-w-[153px] max-md:rounded-lg max-md:py-2"
                                >
                                    {t('checkout.coupon.button-title')}
                                </button>
                            </div>
                        }
                    />
                </form>

                {cart.coupon && (
                    <span className="inline-flex items-center gap-2">
                        <span
                            className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-0.5 text-sm font-semibold text-emerald-700 max-sm:text-xs"
                            title={t('checkout.coupon.applied')}
                        >
                            {cart.coupon.code}
                        </span>
                        <span
                            className="icon-cancel cursor-pointer text-xl text-gray-400 transition-colors hover:text-red-500 max-sm:text-base"
                            title={t('checkout.coupon.remove')}
                            onClick={removeCoupon}
                        />
                    </span>
                )}
            </div>
        </div>
    );
}

/** Port of checkout/cart/summary.blade.php. */
export default function CartSummary() {
    const { cart } = useStore();

    return (
        <div className="w-[418px] max-w-full max-md:w-full">
            <p className="text-2xl font-medium max-md:text-base" role="heading" aria-level="1">
                {t('checkout.cart.summary.cart-summary')}
            </p>

            <div className="mt-6 grid gap-4 max-md:mt-2 max-md:gap-2.5">
                <div className="flex justify-between text-right">
                    <p className="text-base max-sm:text-sm">{t('checkout.cart.summary.sub-total')}</p>
                    <p className="text-base font-medium max-sm:text-sm">{formatPrice(cart.subTotal)}</p>
                </div>

                {cart.discount > 0 && (
                    <div className="flex justify-between text-right">
                        <p className="text-base text-red-600 max-sm:text-sm">{t('checkout.cart.summary.discount-amount')}</p>
                        <p className="text-base font-medium text-red-600 max-sm:text-sm">- {formatPrice(cart.discount)}</p>
                    </div>
                )}

                <Coupon />

                <div className="flex justify-between text-right">
                    <p className="text-base max-sm:text-sm">{t('checkout.cart.summary.delivery-charges')}</p>
                    <p className="text-base font-medium max-sm:text-sm">+ {formatPrice(0)}</p>
                </div>

                <div className="flex justify-between text-right">
                    <p className="text-base max-md:font-normal max-sm:text-sm">{t('checkout.cart.summary.tax')}</p>
                    <p className="text-lg font-semibold max-md:text-sm">+ {formatPrice(cart.tax)}</p>
                </div>

                <div className="flex justify-between text-right">
                    <p className="text-lg font-semibold max-md:text-base">{t('checkout.cart.summary.grand-total')}</p>
                    <p className="text-lg font-semibold max-md:text-base">{formatPrice(cart.grandTotal)}</p>
                </div>

                <Link
                    to="/checkout/onepage"
                    className="primary-button mt-4 place-self-end rounded-2xl px-11 py-3 max-md:my-4 max-md:max-w-full max-md:rounded-lg max-md:py-3 max-md:text-sm max-sm:w-full max-sm:py-2"
                >
                    {t('checkout.cart.summary.proceed-to-checkout')}
                </Link>
            </div>
        </div>
    );
}
