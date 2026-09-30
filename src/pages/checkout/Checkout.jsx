import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import AddressForm, { emptyAddress, validateAddress, withLocationNames } from '../../components/AddressForm';
import CheckoutHeader from '../../components/layout/CheckoutHeader';
import Layout from '../../components/layout/Layout';
import { Coupon } from '../../components/products/CartSummary';
import { Accordion, Breadcrumbs, Checkbox, FieldError, Spinner } from '../../components/ui';
import { paymentMethods, shippingMethods } from '../../data/account';
import { baseImage, formatPrice } from '../../lib/catalog';
import { t } from '../../lib/i18n';
import { useStore } from '../../store/StoreContext';

const needsShipping = (cart) => cart.items.some((item) => !['downloadable', 'virtual', 'booking'].includes(item.product.type));

const addressLine = (address) =>
    [address.address?.filter(Boolean).join(', '), address.city, address.state_name || address.state, address.country_name || address.country, address.postcode]
        .filter(Boolean)
        .join(', ');

function AddressCard({ address, name, checked, onSelect, onEdit }) {
    const id = `${name}_address_id_${address.id}`;

    return (
        <div className="relative max-w-[414px] cursor-pointer select-none rounded-xl border border-zinc-200 p-0 max-md:flex-wrap max-md:rounded-lg">
            <div className="absolute top-5 flex gap-2 ltr:right-5 rtl:left-5">
                <div className="!mb-0 flex items-center gap-2.5">
                    <input type="radio" id={id} name={name} className="peer hidden" checked={checked} onChange={onSelect} />
                    <label htmlFor={id} className="icon-radio-unselect peer-checked:icon-radio-select cursor-pointer text-2xl text-navyBlue" />
                </div>

                <span className="icon-edit cursor-pointer text-2xl" onClick={onEdit} />
            </div>

            <label className="block cursor-pointer rounded-xl p-5 max-sm:rounded-lg" htmlFor={id}>
                <span className="icon-checkout-address text-6xl text-navyBlue max-sm:text-5xl" />

                <div className="flex items-center justify-between">
                    <p className="text-base font-medium">
                        {address.first_name} {address.last_name}
                        {address.company_name && ` (${address.company_name})`}
                    </p>
                </div>

                <p className="mt-6 text-sm text-zinc-500 max-md:mt-2 max-sm:mt-0">{addressLine(address)}</p>
            </label>
        </div>
    );
}

function NewAddressCard({ onClick }) {
    return (
        <div
            className="flex max-w-[414px] cursor-pointer items-center justify-center rounded-xl border border-zinc-200 p-5 max-md:flex-wrap max-md:rounded-lg"
            onClick={onClick}
        >
            <div className="flex items-center gap-x-2.5" role="button" tabIndex={0}>
                <span className="icon-plus rounded-full border border-black p-2.5 text-3xl max-sm:p-2" role="presentation" />
                <p className="text-base">{t('checkout.onepage.address.add-new-address')}</p>
            </div>
        </div>
    );
}

function ProceedButton({ loading }) {
    return (
        <div className="mt-4 flex justify-end max-md:my-4">
            <button type="submit" className="primary-button relative rounded-2xl px-11 py-3 max-md:rounded-lg max-sm:w-full max-sm:max-w-full max-sm:py-1.5">
                {loading && <Spinner />}
                <span className={loading ? 'opacity-0' : ''}>{t('checkout.onepage.address.proceed')}</span>
            </button>
        </div>
    );
}

/** Address step: saved-address cards for customers, the form for guests. */
function AddressStep({ state, setState, onProceed, showProceed, cart }) {
    const { customer, addresses, setAddresses } = useStore();
    const [editing, setEditing] = useState(customer ? null : { type: 'billing', address: { ...emptyAddress } });
    const [errors, setErrors] = useState({});
    const [saveToBook, setSaveToBook] = useState(true);
    const [loading, setLoading] = useState(false);
    const shipping = needsShipping(cart);

    const proceed = (event) => {
        event.preventDefault();

        const next = {};

        if (!state.billingId && !state.billingAddress) next.billing = t('checkout.onepage.address.check-billing-address');
        if (shipping && !state.useForShipping && !state.shippingId && !state.shippingAddress) next.shipping = t('checkout.onepage.address.check-shipping-address');

        setErrors(next);

        if (!Object.keys(next).length) {
            setLoading(true);
            setTimeout(() => {
                setLoading(false);
                onProceed();
            }, 500);
        }
    };

    const saveForm = (event) => {
        event.preventDefault();

        const formErrors = validateAddress(editing.address);

        setErrors(formErrors);

        if (Object.keys(formErrors).length) {
            return;
        }

        const address = withLocationNames({ ...editing.address, id: editing.address.id || Date.now() });

        if (customer) {
            if (saveToBook) {
                setAddresses((list) => (list.some((item) => item.id === address.id) ? list.map((item) => (item.id === address.id ? address : item)) : [...list, address]));
            }

            setState((current) => ({
                ...current,
                [`${editing.type}Id`]: address.id,
                [`${editing.type}Address`]: address,
            }));
            setEditing(null);

            return;
        }

        // Guests: the form itself is the billing address.
        setState((current) => ({ ...current, billingAddress: address, billingId: null }));
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            onProceed();
        }, 500);
    };

    if (editing) {
        return (
            <form onSubmit={saveForm} noValidate>
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-xl font-medium max-md:text-base max-sm:font-normal">
                        {editing.type === 'billing' ? t('checkout.onepage.address.billing-address') : t('checkout.onepage.address.shipping-address')}
                    </h2>

                    {customer && (
                        <span className="flex cursor-pointer justify-end" onClick={() => setEditing(null)}>
                            <span className="icon-arrow-left text-2xl" />
                            <span>{t('checkout.onepage.address.back')}</span>
                        </span>
                    )}
                </div>

                <AddressForm value={editing.address} onChange={(address) => setEditing({ ...editing, address })} errors={errors} />

                {customer && (
                    <div className="mt-5 flex items-center gap-2.5">
                        <Checkbox id="save_address" checked={saveToBook} onChange={setSaveToBook} label={t('checkout.onepage.address.save-address')} />
                    </div>
                )}

                {!customer && shipping && (
                    <div className="mt-5">
                        <Checkbox
                            id="use_for_shipping"
                            checked={state.useForShipping}
                            onChange={(value) => setState((current) => ({ ...current, useForShipping: value }))}
                            label={t('checkout.onepage.address.same-as-billing')}
                        />
                    </div>
                )}

                {customer ? (
                    <div className="mt-4 flex justify-end">
                        <button type="submit" className="primary-button rounded-2xl px-11 py-3 max-md:rounded-lg max-sm:w-full max-sm:py-1.5">
                            {t('checkout.onepage.address.save')}
                        </button>
                    </div>
                ) : (
                    showProceed && <ProceedButton loading={loading} />
                )}
            </form>
        );
    }

    const list = addresses;

    return (
        <form onSubmit={proceed} noValidate>
            <div className="mb-4 flex items-center justify-between max-md:mb-2">
                <h2 className="text-xl font-medium max-sm:text-base max-sm:font-normal">{t('checkout.onepage.address.billing-address')}</h2>
            </div>

            <div className="mb-2 grid grid-cols-2 gap-5 max-1060:grid-cols-[1fr] max-lg:grid-cols-2 max-md:mt-2 max-md:grid-cols-1">
                {list.map((address) => (
                    <AddressCard
                        key={address.id}
                        address={address}
                        name="billing"
                        checked={state.billingId === address.id}
                        onSelect={() => setState((current) => ({ ...current, billingId: address.id, billingAddress: address }))}
                        onEdit={() => setEditing({ type: 'billing', address })}
                    />
                ))}

                <NewAddressCard onClick={() => setEditing({ type: 'billing', address: { ...emptyAddress } })} />
            </div>

            <FieldError message={errors.billing} />

            {shipping && (
                <>
                    <div className="!mb-0 mt-5 flex items-center gap-2.5">
                        <Checkbox
                            id="use_for_shipping"
                            checked={state.useForShipping}
                            onChange={(value) => setState((current) => ({ ...current, useForShipping: value }))}
                            label={t('checkout.onepage.address.same-as-billing')}
                            labelClass="cursor-pointer select-none text-base text-zinc-500 max-md:text-sm max-sm:text-xs ltr:pl-0 rtl:pr-0"
                        />
                    </div>

                    {!state.useForShipping && (
                        <div className="mt-8">
                            <div className="mb-4 flex items-center justify-between">
                                <h2 className="text-xl font-medium max-md:text-lg max-sm:text-base">{t('checkout.onepage.address.shipping-address')}</h2>
                            </div>

                            <div className="mb-2 grid grid-cols-2 gap-5 max-1060:grid-cols-[1fr] max-lg:grid-cols-2 max-md:mt-4 max-md:grid-cols-1">
                                {list.map((address) => (
                                    <AddressCard
                                        key={address.id}
                                        address={address}
                                        name="shipping"
                                        checked={state.shippingId === address.id}
                                        onSelect={() => setState((current) => ({ ...current, shippingId: address.id, shippingAddress: address }))}
                                        onEdit={() => setEditing({ type: 'shipping', address })}
                                    />
                                ))}

                                <NewAddressCard onClick={() => setEditing({ type: 'shipping', address: { ...emptyAddress } })} />
                            </div>

                            <FieldError message={errors.shipping} />
                        </div>
                    )}
                </>
            )}

            {showProceed && <ProceedButton loading={loading} />}
        </form>
    );
}

function ShippingStep({ value, onSelect }) {
    return (
        <div className="mb-7 max-md:mb-0">
            <Accordion
                className="overflow-hidden !border-b-0 max-md:rounded-lg max-md:!border-none max-md:!bg-gray-100"
                headerClass="px-0 py-4 max-md:p-3 max-md:text-sm max-md:font-medium max-sm:p-2"
                contentClass="mt-8 !p-0 max-md:mt-0 max-md:rounded-t-none max-md:border max-md:border-t-0 max-md:!p-4"
                header={
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-medium max-md:text-base">{t('checkout.onepage.shipping.shipping-method')}</h2>
                    </div>
                }
            >
                <div className="flex flex-wrap gap-8 max-md:gap-4 max-sm:gap-2.5">
                    {shippingMethods.map((rate) => (
                        <div key={rate.code} className="relative max-w-[218px] select-none max-md:max-w-full max-md:flex-auto">
                            <input
                                type="radio"
                                name="shipping_method"
                                id={rate.code}
                                className="peer hidden"
                                checked={value?.code === rate.code}
                                onChange={() => onSelect(rate)}
                            />
                            <label
                                className="icon-radio-unselect peer-checked:icon-radio-select absolute top-5 cursor-pointer text-2xl text-navyBlue ltr:right-5 rtl:left-5"
                                htmlFor={rate.code}
                            />
                            <label
                                className="block cursor-pointer rounded-xl border border-zinc-200 p-5 max-sm:flex max-sm:gap-4 max-sm:rounded-lg max-sm:px-4 max-sm:py-2.5"
                                htmlFor={rate.code}
                            >
                                <span className="icon-flate-rate text-6xl text-navyBlue max-sm:text-5xl" />
                                <div>
                                    <p className="mt-1.5 text-2xl font-semibold max-md:text-base">{formatPrice(rate.price)}</p>
                                    <p className="mt-2.5 text-xs font-medium max-md:mt-1 max-sm:mt-0 max-sm:font-normal max-sm:text-zinc-500">
                                        <span className="font-medium">{rate.carrier}</span> - {rate.title}
                                    </p>
                                </div>
                            </label>
                        </div>
                    ))}
                </div>
            </Accordion>
        </div>
    );
}

function PaymentStep({ value, onSelect }) {
    return (
        <div className="mb-7 max-md:last:!mb-0">
            <Accordion
                className="overflow-hidden !border-b-0 max-md:rounded-lg max-md:!border-none max-md:!bg-gray-100"
                headerClass="px-0 py-4 max-md:p-3 max-md:text-sm max-md:font-medium max-sm:p-2"
                contentClass="mt-8 !p-0 max-md:mt-0 max-md:rounded-t-none max-md:border max-md:border-t-0 max-md:!p-4"
                header={
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-medium max-md:text-base">{t('checkout.onepage.payment.payment-method')}</h2>
                    </div>
                }
            >
                <div className="flex flex-wrap gap-7 max-md:gap-4 max-sm:gap-2.5">
                    {paymentMethods.map((payment) => (
                        <div key={payment.code} className="relative cursor-pointer max-md:max-w-full max-md:flex-auto">
                            <input
                                type="radio"
                                name="payment_method"
                                id={payment.code}
                                className="peer hidden"
                                checked={value?.code === payment.code}
                                onChange={() => onSelect(payment)}
                            />
                            <label
                                htmlFor={payment.code}
                                className="icon-radio-unselect peer-checked:icon-radio-select absolute top-5 cursor-pointer text-2xl text-navyBlue ltr:right-5 rtl:left-5"
                            />
                            <label
                                htmlFor={payment.code}
                                className="block w-[190px] cursor-pointer rounded-xl border border-zinc-200 p-5 max-md:flex max-md:w-full max-md:gap-5 max-md:rounded-lg max-md:ltr:pr-12 max-md:rtl:pl-12 max-sm:gap-4 max-sm:px-4 max-sm:py-2.5 max-sm:ltr:pr-12 max-sm:rtl:pl-12"
                            >
                                <img className="max-h-11 max-w-14" src={payment.image} width="55" height="55" alt={payment.title} title={payment.title} />
                                <div>
                                    <p className="mt-1.5 text-sm font-semibold max-md:mt-1 max-sm:mt-0">{payment.title}</p>
                                    <p className="mt-2.5 text-xs font-medium text-zinc-500 max-md:mt-1 max-sm:mt-0">{payment.description}</p>
                                </div>
                            </label>
                        </div>
                    ))}
                </div>
            </Accordion>
        </div>
    );
}

/** Port of checkout/onepage/summary.blade.php. */
function Summary({ shippingPrice }) {
    const { cart } = useStore();

    return (
        <>
            <h1 className="text-2xl font-medium max-md:py-4 max-md:text-base">{t('checkout.onepage.summary.cart-summary')}</h1>

            <div className="mt-10 grid border-b border-zinc-200 max-md:mt-3 max-sm:mt-0">
                {cart.items.map((item) => (
                    <div key={item.id} className="flex gap-x-4 pb-5 max-md:gap-x-3 max-md:pb-4">
                        <img
                            className="h-[90px] max-h-[90px] w-[90px] max-w-[90px] rounded-xl max-md:h-20 max-md:max-h-20 max-md:max-w-20 max-md:rounded-lg"
                            src={baseImage(item.product)}
                            alt={item.product.name}
                            width="110"
                            height="110"
                        />
                        <div>
                            <p className="text-base text-navyBlue max-md:text-sm max-md:font-medium">{item.product.name}</p>
                            <p className="mt-2.5 flex flex-col text-lg font-medium max-md:mt-1 max-md:text-base max-md:font-normal max-sm:text-sm">
                                {t('checkout.onepage.summary.price_and_qty', { price: formatPrice(item.price), qty: item.quantity })}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mb-8 mt-6 grid gap-4 max-md:mb-0 max-sm:mt-4 max-sm:gap-2.5">
                <div className="flex justify-between text-right">
                    <p className="text-base max-sm:text-sm">{t('checkout.onepage.summary.sub-total')}</p>
                    <p className="text-base font-medium max-sm:text-sm">{formatPrice(cart.subTotal)}</p>
                </div>

                {cart.discount > 0 && (
                    <div className="flex justify-between text-right">
                        <p className="text-base text-red-600 max-sm:text-sm">{t('checkout.onepage.summary.discount-amount')}</p>
                        <p className="text-base font-medium text-red-600 max-sm:text-sm">- {formatPrice(cart.discount)}</p>
                    </div>
                )}

                <Coupon />

                <div className="flex justify-between text-right">
                    <p className="text-base max-sm:text-sm">{t('checkout.onepage.summary.delivery-charges')}</p>
                    <p className="text-base font-medium max-sm:text-sm">+ {formatPrice(shippingPrice)}</p>
                </div>

                <div className="flex justify-between text-right">
                    <p className="text-base max-md:font-normal max-sm:text-sm">{t('checkout.onepage.summary.tax')}</p>
                    <p className="text-lg font-semibold max-md:text-sm">+ {formatPrice(cart.tax)}</p>
                </div>

                <div className="flex justify-between text-right">
                    <p className="text-lg font-semibold max-md:text-base">{t('checkout.onepage.summary.grand-total')}</p>
                    <p className="text-lg font-semibold max-md:text-base">{formatPrice(cart.grandTotal + shippingPrice)}</p>
                </div>
            </div>
        </>
    );
}

/** Port of checkout/onepage/index.blade.php: address → shipping → payment → place order. */
export default function Checkout() {
    const navigate = useNavigate();
    const { cart, placeOrder, flash } = useStore();
    const [step, setStep] = useState('address');
    const [placing, setPlacing] = useState(false);
    const [state, setState] = useState({ useForShipping: true, billingId: null, billingAddress: null, shippingId: null, shippingAddress: null });
    const [shippingMethod, setShippingMethod] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState(null);

    if (!cart.items.length) {
        return <Navigate to="/checkout/cart" replace />;
    }

    const shipping = needsShipping(cart);
    const steps = ['address', 'shipping', 'payment', 'review'];
    const reached = (name) => steps.indexOf(step) >= steps.indexOf(name);

    const order = () => {
        setPlacing(true);

        setTimeout(() => {
            const placed = placeOrder({
                shippingMethod,
                paymentMethod,
                billingAddress: state.billingAddress,
                shippingAddress: state.useForShipping ? state.billingAddress : state.shippingAddress,
            });

            flash('success', t('checkout.success.title'));
            navigate('/checkout/onepage/success', { state: { orderId: placed.increment_id } });
        }, 700);
    };

    return (
        <Layout title={t('checkout.onepage.index.checkout')} hasHeader={false} hasFeature={false} hasFooter={false}>
            <CheckoutHeader ariaLabel="Bagisto" />

            <div className="container px-[60px] max-lg:px-8 max-sm:px-4">
                <Breadcrumbs items={[{ title: t('checkout.cart.index.cart'), url: '/checkout/cart' }, { title: t('checkout.onepage.index.checkout') }]} />

                <div className="grid grid-cols-[1fr_auto] gap-8 max-lg:grid-cols-[1fr] max-md:gap-5">
                    <div className="hidden max-md:block">
                        <Summary shippingPrice={shippingMethod?.price || 0} />
                    </div>

                    <div className="overflow-y-auto max-md:grid max-md:gap-4" id="steps-container">
                        <Accordion
                            className="mb-7 mt-8 overflow-hidden rounded-xl !border-b-0 max-md:mb-0 max-md:mt-0 max-md:rounded-lg max-md:!border-none max-md:!bg-gray-100"
                            headerClass="!p-0 max-md:!mb-0 max-md:rounded-t-md max-md:!p-3 max-md:text-sm max-md:font-medium max-sm:!p-2"
                            contentClass="mt-8 !p-0 max-md:mt-0 max-md:rounded-t-none max-md:border max-md:border-t-0 max-md:!p-4"
                            header={
                                <div className="flex items-center justify-between">
                                    <h2 className="text-2xl font-medium max-md:text-base">{t('checkout.onepage.address.title')}</h2>
                                </div>
                            }
                        >
                            <AddressStep
                                state={state}
                                setState={setState}
                                cart={cart}
                                showProceed={step === 'address'}
                                onProceed={() => setStep(shipping ? 'shipping' : 'payment')}
                            />
                        </Accordion>

                        {shipping && reached('shipping') && (
                            <ShippingStep
                                value={shippingMethod}
                                onSelect={(rate) => {
                                    setShippingMethod(rate);
                                    setStep('payment');
                                }}
                            />
                        )}

                        {reached('payment') && (
                            <PaymentStep
                                value={paymentMethod}
                                onSelect={(payment) => {
                                    setPaymentMethod(payment);
                                    setStep('review');
                                }}
                            />
                        )}
                    </div>

                    <div className="sticky top-8 block h-max w-[442px] max-w-full max-lg:w-auto max-lg:max-w-[442px] ltr:pl-8 max-lg:ltr:pl-0 rtl:pr-8 max-lg:rtl:pr-0">
                        <div className="block max-md:hidden">
                            <Summary shippingPrice={shippingMethod?.price || 0} />
                        </div>

                        {step === 'review' && (
                            <div className="flex justify-end">
                                <button
                                    type="button"
                                    className="primary-button relative w-max rounded-2xl bg-navyBlue px-11 py-3 max-md:mb-4 max-md:w-full max-md:max-w-full max-md:rounded-lg max-sm:py-1.5"
                                    disabled={placing}
                                    onClick={order}
                                >
                                    {placing && <Spinner />}
                                    <span className={placing ? 'opacity-0' : ''}>{t('checkout.onepage.summary.place-order')}</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
}
