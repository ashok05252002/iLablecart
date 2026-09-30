import { useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import AddressForm, { emptyAddress, validateAddress, withLocationNames } from '../../components/AddressForm';
import AccountLayout, { AccountHeading, AccountNavigation, DataGrid } from '../../components/layout/AccountLayout';
import Layout from '../../components/layout/Layout';
import {
    Checkbox, ControlGroup, Dropdown, FieldError, Input, Label, Modal, PasswordInput, QuantityChanger, Select, Stars, Textarea, useConfirm,
} from '../../components/ui';
import { mockDownloads, mockReviews } from '../../data/account';
import { baseImage, findProductById, finalPrice, formatPrice } from '../../lib/catalog';
import { t } from '../../lib/i18n';
import { useStore } from '../../store/StoreContext';

const formatDate = (value) =>
    new Date(value).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

const STATUS_LABEL = {
    pending: 'label-pending',
    processing: 'label-processing',
    completed: 'label-completed',
    canceled: 'label-canceled',
    closed: 'label-closed',
};

function StatusLabel({ status }) {
    return <p className={STATUS_LABEL[status] || 'label-info'}>{t(`customers.account.orders.status.options.${status}`)}</p>;
}

const secondaryAction = 'secondary-button border-zinc-200 px-5 py-3 font-normal max-md:rounded-lg max-md:py-2 max-sm:py-1.5 max-sm:text-sm';

/* ---------------- Account index (mobile menu) ---------------- */

export function AccountIndex() {
    const { customer, signOut } = useStore();
    const navigate = useNavigate();

    if (!customer) {
        return <Navigate to="/customer/login" replace />;
    }

    return (
        <Layout title={t('customers.account.orders.title')} hasFeature={false}>
            <div className="container px-[60px] max-lg:px-8 max-md:px-0">
                <div className="mt-8 flex items-start gap-10 max-lg:gap-5 max-md:mt-5 max-md:grid max-md:gap-0">
                    <div className="mx-4">
                        <AccountNavigation />
                    </div>

                    <span className="mb-5 mt-2 w-full border-t border-zinc-300 md:hidden" />

                    <div className="mx-4">
                        <div className="mx-auto w-[400px] rounded-lg border border-navyBlue py-2.5 text-center max-sm:w-full max-sm:py-1.5">
                            <a
                                className="flex items-center justify-center gap-1.5 text-base hover:bg-gray-100"
                                href="/"
                                onClick={(event) => {
                                    event.preventDefault();
                                    signOut();
                                    navigate('/');
                                }}
                            >
                                {t('components.layouts.header.desktop.bottom.logout')}
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}

/* ---------------- Profile ---------------- */

export function Profile() {
    const { customer, signOut, flash } = useStore();
    const navigate = useNavigate();
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    if (!customer) {
        return <Navigate to="/customer/login" replace />;
    }

    const rows = [
        ['first-name', customer.first_name],
        ['last-name', customer.last_name],
        ['gender', customer.gender || '-'],
        ['dob', customer.date_of_birth || '-'],
        ['email', customer.email],
    ];

    const deleteProfile = (event) => {
        event.preventDefault();

        if (!password) {
            setError('The password field is required');

            return;
        }

        signOut();
        flash('success', t('customers.account.profile.index.delete-success'));
        navigate('/');
    };

    return (
        <AccountLayout title={t('customers.account.profile.index.title')}>
            <div className="mx-4 flex-auto max-md:mx-6 max-sm:mx-4">
                <AccountHeading
                    title={t('customers.account.profile.index.title')}
                    action={
                        <Link to="/customer/account/profile/edit" className={secondaryAction}>
                            {t('customers.account.profile.index.edit')}
                        </Link>
                    }
                />

                <div className="mt-8 grid grid-cols-1 gap-y-6 max-md:mt-5 max-sm:gap-y-4">
                    {rows.map(([key, value]) => (
                        <div key={key} className="grid w-full grid-cols-[2fr_3fr] border-b border-zinc-200 px-8 py-3 max-md:px-0">
                            <p className="text-sm font-medium">{t(`customers.account.profile.index.${key}`)}</p>
                            <p className="text-sm font-medium text-zinc-500">{value}</p>
                        </div>
                    ))}

                    <div className="w-max max-md:w-full" onClick={() => setDeleteOpen(true)}>
                        <div className="primary-button rounded-2xl px-11 py-3 max-md:hidden max-md:rounded-lg">
                            {t('customers.account.profile.index.delete-profile')}
                        </div>
                        <div className="rounded-2xl py-3 text-center font-medium text-red-500 max-md:w-full max-md:max-w-full max-md:py-1.5 md:hidden">
                            {t('customers.account.profile.index.delete-profile')}
                        </div>
                    </div>

                    <form onSubmit={deleteProfile} noValidate>
                        <Modal
                            isOpen={deleteOpen}
                            onClose={() => setDeleteOpen(false)}
                            header={<h2 className="text-2xl font-medium max-md:text-base">{t('customers.account.profile.index.enter-password')}</h2>}
                            content={
                                <ControlGroup className="!mb-0">
                                    <PasswordInput
                                        className="px-6 py-4"
                                        value={password}
                                        error={error}
                                        placeholder="Enter your password"
                                        onChange={(event) => setPassword(event.target.value)}
                                    />
                                    <FieldError message={error} />
                                </ControlGroup>
                            }
                            footer={
                                <button type="submit" className="primary-button flex rounded-2xl px-11 py-3 max-md:rounded-lg max-md:px-6 max-md:text-sm">
                                    {t('customers.account.profile.index.delete')}
                                </button>
                            }
                        />
                    </form>
                </div>
            </div>
        </AccountLayout>
    );
}

export function ProfileEdit() {
    const { customer, setCustomer, flash } = useStore();
    const navigate = useNavigate();
    const [form, setForm] = useState(() => ({ ...customer, current_password: '', new_password: '', new_password_confirmation: '' }));
    const [errors, setErrors] = useState({});

    if (!customer) {
        return <Navigate to="/customer/login" replace />;
    }

    const set = (field) => (event) => setForm({ ...form, [field]: event.target.value });
    const label = (key) => t(`customers.account.profile.edit.${key}`);

    const submit = (event) => {
        event.preventDefault();

        const next = {};

        for (const [field, name] of [['first_name', 'First Name'], ['last_name', 'Last Name'], ['email', 'Email'], ['phone', 'Phone'], ['gender', 'Gender']]) {
            if (!String(form[field] || '').trim()) {
                next[field] = `The ${name} field is required`;
            }
        }

        if (form.new_password && form.new_password !== form.new_password_confirmation) {
            next.new_password_confirmation = 'The Confirm Password field must match New Password';
        }

        setErrors(next);

        if (!Object.keys(next).length) {
            const { first_name, last_name, email, phone, gender, date_of_birth, subscribed_to_news_letter } = form;

            setCustomer({ ...customer, first_name, last_name, email, phone, gender, date_of_birth, subscribed_to_news_letter });
            flash('success', t('customers.account.profile.index.edit-success'));
            navigate('/customer/account/profile');
        }
    };

    const field = (name, key, type = 'text', required = true) => (
        <ControlGroup>
            <Label required={required}>{label(key)}</Label>
            <Input type={type} value={form[name] || ''} error={errors[name]} placeholder={label(key)} onChange={set(name)} />
            <FieldError message={errors[name]} />
        </ControlGroup>
    );

    const password = (name, key) => (
        <ControlGroup>
            <Label>{label(key)}</Label>
            <PasswordInput value={form[name]} error={errors[name]} placeholder={label(key)} onChange={set(name)} />
            <FieldError message={errors[name]} />
        </ControlGroup>
    );

    return (
        <AccountLayout title={label('edit-profile')}>
            <div className="mx-4 flex-auto max-md:mx-6 max-sm:mx-4">
                <AccountHeading title={label('edit-profile')} />

                <form onSubmit={submit} noValidate>
                    <ControlGroup className="mt-4">
                        <label className="grid h-[120px] w-[120px] cursor-pointer place-content-center rounded-xl border border-dashed border-zinc-300 text-center text-sm text-zinc-500 hover:border-gray-400">
                            <span className="icon-camera text-3xl" />
                            Add Image
                            <input type="file" className="hidden" accept="image/*" />
                        </label>
                    </ControlGroup>

                    {field('first_name', 'first-name')}
                    {field('last_name', 'last-name')}
                    {field('email', 'email', 'email')}
                    {field('phone', 'phone')}

                    <ControlGroup>
                        <Label required>{label('gender')}</Label>
                        <Select className="mb-3" value={form.gender || ''} error={errors.gender} onChange={set('gender')}>
                            <option value="Other">{label('other')}</option>
                            <option value="Male">{label('male')}</option>
                            <option value="Female">{label('female')}</option>
                        </Select>
                        <FieldError message={errors.gender} />
                    </ControlGroup>

                    {field('date_of_birth', 'dob', 'date', false)}
                    {password('current_password', 'current-password')}
                    {password('new_password', 'new-password')}
                    {password('new_password_confirmation', 'confirm-password')}

                    <div className="mb-4">
                        <Checkbox
                            id="is-subscribed"
                            checked={form.subscribed_to_news_letter}
                            onChange={(value) => setForm({ ...form, subscribed_to_news_letter: value })}
                            label={label('subscribe-to-newsletter')}
                            labelClass="cursor-pointer select-none text-base text-zinc-500 max-md:text-sm ltr:pl-0 rtl:pr-0"
                        />
                    </div>

                    <button
                        type="submit"
                        className="primary-button m-0 block rounded-2xl px-11 py-3 text-center text-base max-md:w-full max-md:max-w-full max-md:rounded-lg max-md:py-1.5"
                    >
                        {label('save')}
                    </button>
                </form>
            </div>
        </AccountLayout>
    );
}

/* ---------------- Addresses ---------------- */

export function Addresses() {
    const { addresses, setAddresses, flash } = useStore();
    const [confirm, ask] = useConfirm();

    const setDefault = (id) => {
        setAddresses((list) => list.map((address) => ({ ...address, default_address: address.id === id })));
        flash('success', t('customers.account.addresses.index.update-success'));
    };

    const remove = (id) =>
        ask(() => {
            setAddresses((list) => list.filter((address) => address.id !== id));
            flash('success', t('customers.account.addresses.index.delete-success'));
        });

    return (
        <AccountLayout title={t('customers.account.addresses.index.title')}>
            <div className="mx-4 flex-auto">
                <AccountHeading
                    title={t('customers.account.addresses.index.title')}
                    action={
                        <Link to="/customer/account/addresses/create" className={secondaryAction}>
                            {t('customers.account.addresses.index.add-address')}
                        </Link>
                    }
                />

                {addresses.length ? (
                    <div className="mt-[60px] grid grid-cols-2 gap-5 max-1060:grid-cols-[1fr] max-md:mt-5">
                        {addresses.map((address) => (
                            <div key={address.id} className="rounded-xl border border-zinc-200 p-5 max-md:flex-wrap">
                                <div className="flex justify-between">
                                    <p className="text-base font-medium">
                                        {address.first_name} {address.last_name}
                                        {address.company_name && ` (${address.company_name})`}
                                    </p>

                                    <div className="flex gap-4 max-sm:gap-2.5">
                                        {address.default_address && (
                                            <div className="label-pending block h-fit w-max px-2.5 py-1 max-md:px-1.5">
                                                {t('customers.account.addresses.index.default-address')}
                                            </div>
                                        )}

                                        <Dropdown
                                            position="bottom-right"
                                            contentClass=""
                                            toggle={
                                                <button className="icon-more cursor-pointer rounded-md px-1.5 py-1 text-2xl text-zinc-500 transition-all hover:bg-gray-100 hover:text-black focus:bg-gray-100 focus:text-black max-md:p-0" />
                                            }
                                        >
                                            <ul className="!py-1 max-sm:!py-0">
                                                <li className="cursor-pointer px-5 py-2 text-base hover:bg-gray-100 max-sm:text-sm">
                                                    <Link to={`/customer/account/addresses/edit/${address.id}`}>
                                                        <p className="w-full">{t('customers.account.addresses.index.edit')}</p>
                                                    </Link>
                                                </li>
                                                <li className="cursor-pointer px-5 py-2 text-base hover:bg-gray-100 max-sm:text-sm" onClick={() => remove(address.id)}>
                                                    <p className="w-full">{t('customers.account.addresses.index.delete')}</p>
                                                </li>
                                                {!address.default_address && (
                                                    <li className="cursor-pointer px-5 py-2 text-base hover:bg-gray-100 max-sm:text-sm" onClick={() => setDefault(address.id)}>
                                                        <button className="w-full ltr:text-left rtl:text-right">
                                                            {t('customers.account.addresses.index.set-as-default')}
                                                        </button>
                                                    </li>
                                                )}
                                            </ul>
                                        </Dropdown>
                                    </div>
                                </div>

                                <p className="mt-6 text-zinc-500 max-md:mt-5 max-md:text-sm">
                                    {[address.address.filter(Boolean).join(', '), address.city, address.state_name, address.country_name, address.postcode].join(', ')}
                                </p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="m-auto grid w-full place-content-center items-center justify-items-center py-32 text-center">
                        <img className="max-md:h-[100px] max-md:w-[100px]" src="/images/no-address.png" alt="" />
                        <p className="text-xl max-md:text-sm" role="heading">
                            {t('customers.account.addresses.index.empty-address')}
                        </p>
                    </div>
                )}
            </div>

            {confirm}
        </AccountLayout>
    );
}

export function AddressEdit() {
    const { id } = useParams();
    const { addresses, setAddresses, flash } = useStore();
    const navigate = useNavigate();
    const existing = id ? addresses.find((address) => String(address.id) === id) : null;
    const [form, setForm] = useState(() => existing || { ...emptyAddress });
    const [isDefault, setIsDefault] = useState(existing?.default_address || false);
    const [errors, setErrors] = useState({});
    const scope = existing ? 'customers.account.addresses.edit' : 'customers.account.addresses.create';
    const title = existing ? t('customers.account.addresses.edit.edit') + ' ' + t('customers.account.addresses.edit.title') : t('customers.account.addresses.create.add-address');

    const submit = (event) => {
        event.preventDefault();

        const next = validateAddress(form, { requireEmail: false });

        setErrors(next);

        if (Object.keys(next).length) {
            return;
        }

        const address = withLocationNames({ ...form, id: existing?.id || Date.now(), default_address: isDefault });

        setAddresses((list) => {
            const others = isDefault ? list.map((item) => ({ ...item, default_address: false })) : list;

            return existing ? others.map((item) => (item.id === address.id ? address : item)) : [...others, address];
        });
        flash('success', t(existing ? 'customers.account.addresses.index.edit-success' : 'customers.account.addresses.index.create-success'));
        navigate('/customer/account/addresses');
    };

    return (
        <AccountLayout title={title}>
            <div className="mx-4 flex-auto max-md:mx-6 max-sm:mx-4">
                <AccountHeading title={title} />

                <form onSubmit={submit} noValidate>
                    <AddressForm value={form} onChange={setForm} errors={errors} scope={scope} />

                    {!existing && (
                        <div className="mb-4">
                            <Checkbox id="set_as_default" checked={isDefault} onChange={setIsDefault} label={t('customers.account.addresses.create.set-as-default')} />
                        </div>
                    )}

                    <button
                        type="submit"
                        className="primary-button m-0 block rounded-2xl px-11 py-3 text-center text-base max-md:w-full max-md:max-w-full max-md:rounded-lg max-md:py-1.5"
                    >
                        {existing ? t('customers.account.addresses.edit.update-btn') : t('customers.account.addresses.create.save')}
                    </button>
                </form>
            </div>
        </AccountLayout>
    );
}

/* ---------------- Orders ---------------- */

export function Orders() {
    const { orders } = useStore();
    const navigate = useNavigate();
    const label = (key) => t(`customers.account.orders.${key}`);

    const records = orders.map((order) => ({ ...order, date: formatDate(order.created_at), total: formatPrice(order.grand_total) }));

    return (
        <AccountLayout title={label('title')}>
            <div className="mx-4 flex-auto max-md:mx-6 max-sm:mx-4">
                <AccountHeading title={label('title')} className="mb-8 max-sm:mb-5" />

                <DataGrid
                    searchKeys={['increment_id', 'status']}
                    records={records}
                    columns={[
                        { key: 'increment_id', label: label('order-id') },
                        { key: 'date', label: label('order-date') },
                        { key: 'total', label: label('total') },
                        { key: 'status', label: label('status.title'), render: (record) => <StatusLabel status={record.status} /> },
                    ]}
                    actions={(record) => (
                        <span
                            className="icon-eye float-right cursor-pointer rounded-md p-1.5 text-2xl transition-all hover:bg-gray-200"
                            title={label('action-view')}
                            onClick={() => navigate(`/customer/account/orders/view/${record.increment_id}`)}
                        />
                    )}
                />
            </div>
        </AccountLayout>
    );
}

function OrderAddress({ address }) {
    return (
        <div className="flex flex-col">
            {address.company_name && <p className="font-semibold leading-6 text-gray-800">{address.company_name}</p>}
            <p className="font-semibold leading-6 text-gray-800">
                {address.first_name} {address.last_name}
            </p>
            <p className="!leading-6 text-gray-600">
                {address.address?.filter(Boolean).join(', ')}
                <br />
                {address.city}
                <br />
                {address.state_name || address.state}
                <br />
                {address.country_name || address.country} {address.postcode && `(${address.postcode})`}
                <br />
                {t('customers.account.orders.view.contact')} : {address.phone}
            </p>
        </div>
    );
}

export function OrderView() {
    const { id } = useParams();
    const { orders, addToCart, flash } = useStore();
    const navigate = useNavigate();
    const [confirm, ask] = useConfirm();
    const order = orders.find((item) => item.increment_id === id);
    const info = (key, params) => t(`customers.account.orders.view.information.${key}`, params);
    const view = (key, params) => t(`customers.account.orders.view.${key}`, params);

    if (!order) {
        return <Navigate to="/customer/account/orders" replace />;
    }

    const reorder = () => {
        for (const item of order.items) {
            const product = findProductById(item.productId);

            if (product) {
                addToCart(product, item.quantity, item.options);
            }
        }

        navigate('/checkout/cart');
    };

    const totals = [
        [info('subtotal'), formatPrice(order.sub_total)],
        [info('shipping-handling'), formatPrice(order.shipping)],
        [info('tax'), formatPrice(order.tax)],
        ...(order.discount ? [[info('discount'), formatPrice(order.discount)]] : []),
    ];

    return (
        <AccountLayout title={view('page-title', { order_id: order.increment_id })}>
            <div className="mx-4 flex-auto max-md:mx-6 max-sm:mx-4">
                <AccountHeading
                    title={view('page-title', { order_id: order.increment_id })}
                    action={
                        <div className="flex gap-1.5">
                            <button className="secondary-button border-zinc-200 px-5 py-3 font-normal max-md:hidden" onClick={reorder}>
                                {view('reorder-btn-title')}
                            </button>

                            {['pending', 'processing'].includes(order.status) && (
                                <button
                                    className="secondary-button border-zinc-200 px-5 py-3 font-normal max-md:hidden"
                                    onClick={() => ask(() => flash('success', 'Order canceled successfully.'))}
                                >
                                    {view('cancel-btn-title')}
                                </button>
                            )}
                        </div>
                    }
                />

                <div className="mt-8 max-md:mt-5 max-md:grid max-md:gap-4">
                    <div className="flex flex-row justify-center gap-8 bg-zinc-100 max-sm:gap-1.5">
                        <div className="cursor-pointer border-b-2 border-navyBlue px-8 py-5 text-xl font-medium !text-black text-zinc-600 transition max-md:px-4 max-md:py-3 max-md:text-sm max-sm:px-2.5 max-sm:py-2.5">
                            {info('info')}
                        </div>
                    </div>

                    <div className="!px-0 max-md:pb-0 max-md:pt-2">
                        <div className="mt-8 text-base font-medium">
                            {info('placed-on')} {formatDate(order.created_at)}
                        </div>

                        <div className="relative mt-8 overflow-x-auto rounded-xl border">
                            <table className="w-full text-left">
                                <thead className="border-b border-zinc-200 bg-zinc-100 text-sm text-black">
                                    <tr className="[&>*]:px-6 [&>*]:py-4 [&>*]:font-medium">
                                        <th scope="col">{info('sku')}</th>
                                        <th scope="col">{info('product-name')}</th>
                                        <th scope="col">{info('price')}</th>
                                        <th scope="col">{info('item-status')}</th>
                                        <th scope="col">{info('subtotal')}</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {order.items.map((item) => (
                                        <tr key={item.sku} className="border-b bg-white align-top font-medium [&>*]:px-6 [&>*]:py-4">
                                            <td>{item.sku}</td>
                                            <td>
                                                {item.name}
                                                {item.options?.map((option) => (
                                                    <p key={option.attribute_name} className="text-sm font-normal text-zinc-500">
                                                        {option.attribute_name}: {option.option_label}
                                                    </p>
                                                ))}
                                            </td>
                                            <td>{formatPrice(item.price)}</td>
                                            <td>
                                                <p>{info('ordered-item', { qty_ordered: item.quantity })}</p>
                                                {order.status === 'completed' && <p>{info('item-shipped', { qty_shipped: item.quantity })}</p>}
                                                {order.status === 'canceled' && <p>{info('item-canceled', { qty_canceled: item.quantity })}</p>}
                                            </td>
                                            <td>{formatPrice(item.total)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="mt-8 flex items-start gap-10 max-lg:gap-5">
                            <div className="flex-auto">
                                <div className="flex justify-end">
                                    <div className="grid max-w-max gap-2 text-sm">
                                        {totals.map(([name, value]) => (
                                            <div key={name} className="flex w-full justify-between gap-x-5">
                                                {name}
                                                <p>{value}</p>
                                            </div>
                                        ))}
                                        <div className="flex w-full justify-between gap-x-5 font-semibold">
                                            {info('grand-total')}
                                            <p>{formatPrice(order.grand_total)}</p>
                                        </div>
                                        <div className="flex w-full justify-between gap-x-5">
                                            {info('total-paid')}
                                            <p>{formatPrice(order.status === 'completed' ? order.grand_total : 0)}</p>
                                        </div>
                                        <div className="flex w-full justify-between gap-x-5">
                                            {info('total-refunded')}
                                            <p>{formatPrice(0)}</p>
                                        </div>
                                        <div className="flex w-full justify-between gap-x-5">
                                            {info('total-due')}
                                            <p>{formatPrice(order.status === 'completed' ? 0 : order.grand_total)}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-11 flex flex-wrap justify-between gap-x-11 gap-y-8 border-t border-zinc-200 pt-7">
                    {order.billing_address && (
                        <div className="grid max-w-[200px] gap-4 max-868:w-full max-868:max-w-full max-md:max-w-full max-md:gap-2">
                            <p className="text-base text-zinc-500 max-md:text-lg max-md:text-black">{view('billing-address')}</p>
                            <div className="grid gap-2.5 text-sm max-md:gap-0">
                                <OrderAddress address={order.billing_address} />
                            </div>
                        </div>
                    )}

                    {order.shipping_address && (
                        <>
                            <div className="grid max-w-[200px] gap-4 max-868:w-full max-868:max-w-full max-md:max-w-full max-md:gap-2">
                                <p className="text-base text-zinc-500 max-md:text-lg max-md:text-black">{view('shipping-address')}</p>
                                <div className="grid gap-2.5 text-sm max-md:gap-0">
                                    <OrderAddress address={order.shipping_address} />
                                </div>
                            </div>

                            <div className="grid max-w-[200px] place-content-baseline gap-4 max-868:w-full max-868:max-w-full max-md:max-w-full max-md:gap-2">
                                <p className="text-base text-zinc-500 max-md:text-lg max-md:text-black">{view('shipping-method')}</p>
                                <p className="text-sm">{order.shipping_method}</p>
                            </div>
                        </>
                    )}

                    <div className="grid max-w-[200px] place-content-baseline gap-4 max-868:w-full max-868:max-w-full max-md:max-w-full max-md:gap-2">
                        <p className="text-base text-zinc-500 max-md:text-lg max-md:text-black">{view('payment-method')}</p>
                        <p className="text-sm">{order.payment_method}</p>
                    </div>
                </div>
            </div>

            {confirm}
        </AccountLayout>
    );
}

/* ---------------- Downloadable products ---------------- */

export function Downloads() {
    const label = (key) => t(`customers.account.downloadable-products.${key}`);

    return (
        <AccountLayout title={label('name')}>
            <div className="mx-4 flex-auto max-md:mx-6 max-sm:mx-4">
                <AccountHeading title={label('name')} />

                <DataGrid
                    searchKeys={['title', 'order_id']}
                    records={mockDownloads.map((download) => ({ ...download, date: formatDate(download.created_at) }))}
                    columns={[
                        { key: 'order_id', label: label('orderId') },
                        {
                            key: 'title',
                            label: label('title'),
                            render: (record) => (
                                <a href="#download" className="text-blue-600" onClick={(event) => event.preventDefault()}>
                                    {record.title}
                                </a>
                            ),
                        },
                        { key: 'date', label: label('date') },
                        { key: 'status', label: label('status'), render: (record) => <p className="label-active">{label(record.status)}</p> },
                        { key: 'remaining', label: label('remaining-downloads') },
                    ]}
                />
            </div>
        </AccountLayout>
    );
}

/* ---------------- Reviews ---------------- */

export function Reviews() {
    return (
        <AccountLayout title={t('customers.account.reviews.title')}>
            <div className="mx-4 flex-auto max-md:mx-6 max-sm:mx-4">
                <AccountHeading title={t('customers.account.reviews.title')} />

                {mockReviews.length ? (
                    <div className="mt-14 grid gap-5 max-1060:grid-cols-[1fr] max-md:mt-5">
                        {mockReviews.map((review) => {
                            const product = findProductById(review.productId);

                            return (
                                <Link key={review.id} to={`/${product.slug}`}>
                                    <div className="flex gap-5 rounded-xl border border-zinc-200 p-6 max-md:grid max-md:gap-2.5 max-md:p-4">
                                        <img
                                            className="h-[146px] max-h-[146px] w-32 min-w-32 max-w-32 rounded-xl max-md:h-20 max-md:w-20 max-md:min-w-20 max-md:rounded-lg"
                                            src={baseImage(product)}
                                            alt={product.name}
                                        />

                                        <div className="w-full">
                                            <div className="flex justify-between">
                                                <p className="text-xl font-medium max-md:text-base">{product.name}</p>
                                                <div className="flex items-center gap-0.5">
                                                    <Stars rating={review.rating} className="text-3xl" />
                                                </div>
                                            </div>

                                            <p className="mt-2.5 text-sm font-medium">{formatDate(review.created_at)}</p>
                                            <p className="mt-5 text-base text-zinc-500 max-md:mt-2">{review.comment}</p>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                ) : (
                    <div className="m-auto grid w-full place-content-center items-center justify-items-center py-32 text-center">
                        <img className="max-md:h-[100px] max-md:w-[100px]" src="/images/review.png" alt="" />
                        <p className="text-xl max-md:text-sm">{t('customers.account.reviews.empty-review')}</p>
                    </div>
                )}
            </div>
        </AccountLayout>
    );
}

/* ---------------- Wishlist ---------------- */

function WishlistItem({ product, onRemove, onMoveToCart }) {
    const [quantity, setQuantity] = useState(1);

    return (
        <div className="grid gap-y-6 max-md:gap-y-0">
            <div className="flex justify-between gap-x-2.5 border-b border-zinc-200 pb-5">
                <div className="flex gap-x-5 max-md:w-full max-md:gap-x-5">
                    <div>
                        <Link to={`/${product.slug}`}>
                            <img
                                className="h-28 max-h-28 w-28 max-w-28 rounded-xl max-md:h-20 max-md:max-h-20 max-md:w-20 max-md:max-w-20"
                                src={baseImage(product)}
                                alt={product.name}
                            />
                        </Link>
                    </div>

                    <div className="grid gap-y-2.5 max-md:w-full max-md:gap-y-0">
                        <div className="flex justify-between">
                            <p className="text-base font-medium max-md:text-sm">{product.name}</p>
                            <span className="icon-bin hidden text-2xl max-md:block" onClick={onRemove} />
                        </div>

                        <div className="max-md:block md:hidden">
                            <p className="text-lg font-semibold max-md:text-sm">{formatPrice(finalPrice(product))}</p>
                        </div>

                        <div className="flex gap-5 max-md:mt-2.5">
                            <QuantityChanger
                                className="flex max-h-10 items-center gap-x-2.5 rounded-[54px] border border-navyBlue px-3.5 py-1.5 max-md:gap-x-1 max-md:px-1.5 max-md:py-1"
                                value={quantity}
                                onChange={setQuantity}
                            />

                            <button
                                type="button"
                                className="primary-button max-h-10 w-max rounded-2xl px-6 py-1.5 text-center text-base max-md:px-4 max-md:py-1.5 max-md:text-sm"
                                onClick={() => onMoveToCart(quantity)}
                            >
                                {t('customers.account.wishlist.move-to-cart')}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="max-md:hidden">
                    <p className="text-lg font-semibold">{formatPrice(finalPrice(product))}</p>
                    <div className="flex cursor-pointer justify-end text-base text-blue-700" onClick={onRemove}>
                        {t('customers.account.wishlist.remove')}
                    </div>
                </div>
            </div>
        </div>
    );
}

export function Wishlist() {
    const { wishlist, setWishlist, addToCart, flash } = useStore();
    const navigate = useNavigate();
    const [confirm, ask] = useConfirm();
    const products = wishlist.map(findProductById).filter(Boolean);

    const remove = (id) =>
        ask(() => {
            setWishlist((ids) => ids.filter((other) => other !== id));
            flash('success', t('customers.account.wishlist.removed'));
        });

    const moveToCart = (product, quantity) => {
        if (['configurable', 'bundle', 'booking', 'downloadable'].includes(product.type)) {
            flash('warning', t('checkout.cart.missing-options'));
            navigate(`/${product.slug}`);

            return;
        }

        addToCart(product, quantity);
        setWishlist((ids) => ids.filter((other) => other !== product.id));
    };

    return (
        <AccountLayout title={t('customers.account.wishlist.page-title')}>
            <div className="mx-4 flex-auto max-md:mx-6 max-sm:mx-4">
                <AccountHeading
                    title={t('customers.account.wishlist.page-title')}
                    action={
                        products.length > 0 && (
                            <div
                                className={`${secondaryAction} cursor-pointer`}
                                onClick={() =>
                                    ask(() => {
                                        setWishlist([]);
                                        flash('success', t('customers.account.wishlist.remove-all-success'));
                                    })
                                }
                            >
                                {t('customers.account.wishlist.delete-all')}
                            </div>
                        )
                    }
                />

                {products.length ? (
                    <div className="mt-8 flex flex-wrap gap-20 max-1060:flex-col max-md:my-5 max-md:last:mb-0">
                        <div className="grid flex-1 gap-8 max-md:flex-none">
                            {products.map((product) => (
                                <WishlistItem
                                    key={product.id}
                                    product={product}
                                    onRemove={() => remove(product.id)}
                                    onMoveToCart={(quantity) => moveToCart(product, quantity)}
                                />
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="m-auto grid w-full place-content-center items-center justify-items-center py-32 text-center">
                        <img className="max-md:h-[100px] max-md:w-[100px]" src="/images/wishlist.png" alt="" />
                        <p className="text-xl max-md:text-sm" role="heading">
                            {t('customers.account.wishlist.empty')}
                        </p>
                    </div>
                )}
            </div>

            {confirm}
        </AccountLayout>
    );
}

/* ---------------- GDPR ---------------- */

export function Gdpr() {
    const { flash } = useStore();
    const [isOpen, setIsOpen] = useState(false);
    const [requests, setRequests] = useState([{ id: 1, type: 'update', message: 'Please update my phone number.', status: 'completed', created_at: '2026-09-10' }]);
    const [form, setForm] = useState({ type: '', message: '' });
    const [errors, setErrors] = useState({});
    const label = (key) => t(`customers.account.gdpr.index.${key}`);

    const submit = (event) => {
        event.preventDefault();

        const next = {};

        if (!form.type) next.type = 'The Type field is required';
        if (!form.message) next.message = 'The Message field is required';

        setErrors(next);

        if (!Object.keys(next).length) {
            setRequests((list) => [{ id: list.length + 1, ...form, status: 'pending', created_at: new Date().toISOString() }, ...list]);
            setForm({ type: '', message: '' });
            setIsOpen(false);
            flash('success', t('customers.account.gdpr.create-success'));
        }
    };

    return (
        <AccountLayout title={label('title')}>
            <div className="mx-4 flex-auto">
                <AccountHeading
                    title={label('title')}
                    action={
                        <div className="flex gap-4">
                            <button className={secondaryAction}>{label('pdf')}</button>
                            <button className={secondaryAction}>{label('html')}</button>
                            <button
                                className="primary-button border-zinc-200 px-5 py-3 font-normal max-md:rounded-lg max-md:py-2 max-sm:py-1.5 max-sm:text-sm"
                                onClick={() => setIsOpen(true)}
                            >
                                {label('create-btn')}
                            </button>
                        </div>
                    }
                />

                <DataGrid
                    searchKeys={['message', 'type', 'status']}
                    records={requests.map((request) => ({ ...request, date: formatDate(request.created_at) }))}
                    columns={[
                        { key: 'id', label: label('datagrid.id') },
                        { key: 'status', label: label('datagrid.status'), render: (record) => <p className={STATUS_LABEL[record.status] || 'label-info'}>{label(`datagrid.${record.status}`)}</p> },
                        { key: 'type', label: label('datagrid.type'), render: (record) => label(`datagrid.${record.type}`) },
                        { key: 'message', label: label('datagrid.message') },
                        { key: 'date', label: label('datagrid.date') },
                    ]}
                />

                <form onSubmit={submit} noValidate>
                    <Modal
                        isOpen={isOpen}
                        onClose={() => setIsOpen(false)}
                        header={<h2 className="text-2xl font-medium max-md:text-base">{label('modal.title')}</h2>}
                        content={
                            <>
                                <ControlGroup>
                                    <Label required>{label('modal.type.title')}</Label>
                                    <Select value={form.type} error={errors.type} onChange={(event) => setForm({ ...form, type: event.target.value })}>
                                        <option value="">{label('modal.type.choose')}</option>
                                        <option value="update">{label('modal.type.update')}</option>
                                        <option value="delete">{label('modal.type.delete')}</option>
                                    </Select>
                                    <FieldError message={errors.type} />
                                </ControlGroup>

                                <ControlGroup>
                                    <Label required>{label('modal.message')}</Label>
                                    <Textarea rows="4" value={form.message} error={errors.message} onChange={(event) => setForm({ ...form, message: event.target.value })} />
                                    <FieldError message={errors.message} />
                                </ControlGroup>
                            </>
                        }
                        footer={
                            <button type="submit" className="primary-button flex rounded-2xl px-11 py-3 max-md:rounded-lg max-md:px-6 max-md:text-sm">
                                {label('modal.save')}
                            </button>
                        }
                    />
                </form>
            </div>
        </AccountLayout>
    );
}

/* ---------------- RMA ---------------- */

export function Rma() {
    const { orders, flash } = useStore();
    const [isCreating, setIsCreating] = useState(false);
    const [requests, setRequests] = useState([{ id: 1, order: '1002', status: 'pending', reason: 'Wrong size delivered', created_at: '2026-09-18' }]);
    const [form, setForm] = useState({ order: '', reason: '', information: '' });
    const [errors, setErrors] = useState({});
    const create = (key) => t(`rma.customer.create.${key}`);
    const grid = (key) => t(`customers.account.rma.index.datagrid.${key}`);

    const submit = (event) => {
        event.preventDefault();

        const next = {};

        if (!form.order) next.order = 'The Orders field is required';
        if (!form.reason) next.reason = 'The Reason field is required';

        setErrors(next);

        if (!Object.keys(next).length) {
            setRequests((list) => [{ id: list.length + 1, ...form, status: 'pending', created_at: new Date().toISOString() }, ...list]);
            setIsCreating(false);
            setForm({ order: '', reason: '', information: '' });
            flash('success', 'RMA request created successfully.');
        }
    };

    return (
        <AccountLayout title={t('rma.customer-rma-index.heading')}>
            <div className="mx-4 flex-auto max-md:mx-6 max-sm:mx-4">
                <AccountHeading
                    title={isCreating ? create('heading') : t('rma.customer-rma-index.heading')}
                    action={
                        !isCreating && (
                            <button className="secondary-button flex items-center gap-x-2 border-[#E9E9E9] px-5 py-3 font-normal" onClick={() => setIsCreating(true)}>
                                {create('heading')}
                            </button>
                        )
                    }
                />

                {isCreating ? (
                    <form className="mt-8" onSubmit={submit} noValidate>
                        <ControlGroup>
                            <Label required>{create('orders')}</Label>
                            <Select value={form.order} error={errors.order} onChange={(event) => setForm({ ...form, order: event.target.value })}>
                                <option value="">{create('search-order')}</option>
                                {orders
                                    .filter((order) => order.status !== 'pending')
                                    .map((order) => (
                                        <option key={order.increment_id} value={order.increment_id}>
                                            #{order.increment_id} - {formatDate(order.created_at)}
                                        </option>
                                    ))}
                            </Select>
                            <FieldError message={errors.order} />
                        </ControlGroup>

                        <ControlGroup>
                            <Label required>{create('reason')}</Label>
                            <Select value={form.reason} error={errors.reason} onChange={(event) => setForm({ ...form, reason: event.target.value })}>
                                <option value="">{create('reason')}</option>
                                <option>Wrong size delivered</option>
                                <option>Damaged product</option>
                                <option>Not as described</option>
                            </Select>
                            <FieldError message={errors.reason} />
                        </ControlGroup>

                        <ControlGroup>
                            <Label>{create('information')}</Label>
                            <Textarea rows="4" value={form.information} onChange={(event) => setForm({ ...form, information: event.target.value })} />
                        </ControlGroup>

                        <div className="flex gap-4">
                            <button type="submit" className="primary-button rounded-2xl px-11 py-3 max-md:rounded-lg max-md:py-1.5">
                                {create('save')}
                            </button>
                            <button type="button" className="secondary-button rounded-2xl px-11 py-3 max-md:rounded-lg max-md:py-1.5" onClick={() => setIsCreating(false)}>
                                {create('cancel')}
                            </button>
                        </div>
                    </form>
                ) : (
                    <DataGrid
                        searchKeys={['order', 'reason', 'status']}
                        records={requests.map((request) => ({ ...request, date: formatDate(request.created_at) }))}
                        columns={[
                            { key: 'id', label: grid('id') },
                            { key: 'order', label: grid('order-ref'), render: (record) => `#${record.order}` },
                            { key: 'reason', label: create('reason') },
                            { key: 'status', label: grid('rma-status'), render: (record) => <p className="label-pending">{record.status}</p> },
                            { key: 'date', label: grid('create') },
                        ]}
                    />
                )}
            </div>
        </AccountLayout>
    );
}
