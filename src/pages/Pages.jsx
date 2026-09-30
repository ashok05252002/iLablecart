import { useState } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import ProductCard from '../components/products/ProductCard';
import { Breadcrumbs, ControlGroup, FieldError, Input, Label, Textarea, useConfirm } from '../components/ui';
import cmsPages from '../data/cms-pages.json';
import { findProductById, formatPrice } from '../lib/catalog';
import { t } from '../lib/i18n';
import { useStore } from '../store/StoreContext';
import NotFound from './NotFound';

const COMPARE_ROWS = [
    { code: 'name', name: 'Name', value: (product) => product.name },
    { code: 'sku', name: 'SKU', value: (product) => product.sku },
    { code: 'price', name: 'Price', value: (product) => formatPrice(product.special_price || product.price) },
    { code: 'description', name: 'Description', value: (product) => product.short_description },
];

/** Port of compare/index.blade.php. */
export function Compare() {
    const { compare, removeFromCompare, clearCompare } = useStore();
    const [confirm, ask] = useConfirm();
    const items = compare.map(findProductById).filter(Boolean);

    return (
        <Layout title={t('compare.title')}>
            <div className="mt-5 flex justify-center max-lg:hidden">
                <div className="flex items-center gap-x-2.5">
                    <Breadcrumbs items={[{ title: t('compare.product-compare') }]} />
                </div>
            </div>

            <div className="container mt-8 px-[60px] max-lg:px-8 max-md:mt-7 max-md:px-0">
                <div className="flex items-center justify-between max-md:px-4">
                    <h1 className="text-2xl font-medium max-sm:text-base">{t('compare.title')}</h1>

                    {items.length > 0 && (
                        <div
                            className="secondary-button flex items-center gap-x-2.5 whitespace-nowrap border-zinc-200 px-5 py-3 font-normal max-md:rounded-lg max-md:px-3 max-md:text-xs max-sm:py-1.5"
                            onClick={() => ask(clearCompare)}
                        >
                            <span className="icon-bin text-2xl max-md:hidden" />
                            {t('compare.delete-all')}
                        </div>
                    )}
                </div>

                {items.length ? (
                    <div className="journal-scroll mt-16 grid overflow-auto max-md:mt-7">
                        <div className="flex max-w-full items-center border-b border-zinc-200">
                            <div className="min-w-[304px] max-w-full max-md:grid max-md:h-full max-md:min-w-40 max-md:items-center max-md:bg-gray-200 max-sm:min-w-[110px]">
                                <p className="text-sm font-medium max-md:pl-4">Product</p>
                            </div>

                            <div className="flex gap-3 border-zinc-200 max-md:gap-0 max-md:border-0 ltr:border-l-[1px] rtl:border-r-[1px]">
                                {items.map((product) => (
                                    <div key={product.id} className="relative w-[311px] max-w-[311px] px-5 max-md:w-60 max-md:px-2.5 max-sm:w-[190px]">
                                        <span
                                            className="icon-cancel absolute top-5 z-[1] flex h-[30px] w-[30px] cursor-pointer items-center justify-center rounded-md border border-zinc-200 bg-white text-2xl max-md:top-10 max-md:h-6 max-md:w-6 max-md:rounded-full max-md:text-sm ltr:right-10 max-md:ltr:right-4 rtl:left-10 max-md:rtl:left-4"
                                            onClick={() => ask(() => removeFromCompare(product.id))}
                                        />
                                        <ProductCard product={product} className="[&_span.icon-compare]:hidden" />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {COMPARE_ROWS.map((row) => (
                            <div key={row.code} className="flex max-w-full items-center border-b border-zinc-200">
                                <div className="min-w-[304px] max-w-full max-md:grid max-md:h-full max-md:min-w-40 max-md:items-center max-md:bg-gray-200 max-sm:min-w-[110px]">
                                    <p className="text-sm font-medium max-md:pl-4">{row.name}</p>
                                </div>

                                <div className="flex gap-3 border-zinc-200 max-md:gap-0 max-md:border-0 ltr:border-l-[1px] rtl:border-r-[1px]">
                                    {items.map((product) => (
                                        <div key={product.id} className="w-[311px] max-w-[311px] p-5 max-md:w-60 max-md:px-2.5 max-sm:w-[190px]">
                                            <p className="break-all text-sm">{row.value(product) || 'N/A'}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="m-auto grid w-full place-content-center items-center justify-items-center py-32 text-center">
                        <img className="max-sm:h-[100px] max-sm:w-[100px]" src="/images/thank-you.png" alt={t('compare.empty-text')} />
                        <p className="text-xl max-sm:text-sm" role="heading">
                            {t('compare.empty-text')}
                        </p>
                    </div>
                )}
            </div>

            {confirm}
        </Layout>
    );
}

/** Port of home/contact-us.blade.php. */
export function ContactUs() {
    const { flash } = useStore();
    const [form, setForm] = useState({ name: '', email: '', contact: '', message: '' });
    const [errors, setErrors] = useState({});
    const set = (field) => (event) => setForm({ ...form, [field]: event.target.value });
    const fieldClass = 'px-6 py-5 max-md:py-3 max-sm:py-3.5';

    const submit = (event) => {
        event.preventDefault();

        const next = {};

        if (!form.name) next.name = 'The Name field is required';
        if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = form.email ? 'The Email field must be a valid email' : 'The Email field is required';
        if (!form.message) next.message = 'The Message field is required';

        setErrors(next);

        if (!Object.keys(next).length) {
            setForm({ name: '', email: '', contact: '', message: '' });
            flash('success', t('home.thanks-for-contact') !== 'home.thanks-for-contact' ? t('home.thanks-for-contact') : 'Thanks for contacting us with your comments and questions. We will respond to you very soon.');
        }
    };

    return (
        <Layout title={t('home.contact.title')}>
            <div className="container mt-8 max-1180:px-5 max-md:mt-6 max-md:px-4">
                <div className="m-auto w-full max-w-[870px] rounded-xl border border-zinc-200 p-16 px-[90px] max-md:px-8 max-md:py-8 max-sm:border-none max-sm:p-0">
                    <h1 className="font-dmserif text-4xl max-md:text-3xl max-sm:text-xl">{t('home.contact.title')}</h1>
                    <p className="mt-4 text-xl text-zinc-500 max-sm:mt-1 max-sm:text-sm">{t('home.contact.about')}</p>

                    <div className="mt-14 rounded max-sm:mt-8">
                        <form onSubmit={submit} noValidate>
                            <ControlGroup>
                                <Label required>{t('home.contact.name')}</Label>
                                <Input className={fieldClass} value={form.name} error={errors.name} placeholder={t('home.contact.name')} onChange={set('name')} />
                                <FieldError message={errors.name} />
                            </ControlGroup>

                            <ControlGroup>
                                <Label required>{t('home.contact.email')}</Label>
                                <Input type="email" className={fieldClass} value={form.email} error={errors.email} placeholder={t('home.contact.email')} onChange={set('email')} />
                                <FieldError message={errors.email} />
                            </ControlGroup>

                            <ControlGroup>
                                <Label>{t('home.contact.phone-number')}</Label>
                                <Input className={fieldClass} value={form.contact} placeholder={t('home.contact.phone-number')} onChange={set('contact')} />
                            </ControlGroup>

                            <ControlGroup>
                                <Label required>{t('home.contact.desc')}</Label>
                                <Textarea
                                    className={fieldClass}
                                    rows="10"
                                    value={form.message}
                                    error={errors.message}
                                    placeholder={t('home.contact.describe-here')}
                                    onChange={set('message')}
                                />
                                <FieldError message={errors.message} />
                            </ControlGroup>

                            <div className="mt-8 flex flex-wrap items-center gap-9 max-sm:justify-center max-sm:text-center">
                                <button
                                    className="primary-button m-0 mx-auto block w-full max-w-[374px] rounded-2xl px-11 py-4 text-center text-base max-md:max-w-full max-md:rounded-lg max-md:py-3 max-sm:py-1.5 ltr:ml-0 rtl:mr-0"
                                    type="submit"
                                >
                                    {t('home.contact.submit')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </Layout>
    );
}

/** Port of cms/page.blade.php. */
export function CmsPage() {
    const { slug } = useParams();
    const page = cmsPages.find((item) => item.slug === slug);

    if (!page) {
        return <NotFound />;
    }

    return (
        <Layout title={page.title}>
            <div className="container mt-8 px-[60px] max-lg:px-8" dangerouslySetInnerHTML={{ __html: page.html }} />
        </Layout>
    );
}
