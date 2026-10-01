import { useState } from 'react';
import { Link } from 'react-router-dom';
import sections from '../../data/sections.json';
import { t } from '../../lib/i18n';
import { useStore } from '../../store/StoreContext';
import { Accordion, FieldError } from '../ui';

const footerLinks = sections.find((section) => section.type === 'footer_links')?.options || {};
const columns = Object.keys(footerLinks)
    .sort()
    .map((key) => footerLinks[key].filter((link) => link.title));

const services = sections.find((section) => section.type === 'services_content')?.options.services || [];

/** Port of components/layouts/services.blade.php. */
export function Services() {
    return (
        <div className="container mt-20 max-lg:px-8 max-md:mt-10 max-md:px-4">
            <div className="max-md:max-y-6 flex justify-center gap-6 max-lg:flex-wrap max-md:grid max-md:grid-cols-2 max-md:gap-x-2.5 max-md:text-center">
                {services.map((service) => (
                    <div key={service.title} className="flex items-center gap-5 bg-white max-md:grid max-md:gap-2.5 max-sm:gap-1 max-sm:px-2">
                        <span
                            className={`${service.service_icon} flex h-[60px] w-[60px] items-center justify-center rounded-full border border-black bg-white p-2.5 text-4xl text-navyBlue max-md:m-auto max-md:h-16 max-md:w-16 max-sm:h-10 max-sm:w-10 max-sm:text-2xl`}
                            role="presentation"
                        />

                        <div className="max-lg:grid max-lg:justify-center">
                            <p className="font-dmserif text-base font-medium max-md:text-xl max-sm:text-sm">{service.title}</p>
                            <p className="mt-2.5 max-w-[217px] text-sm font-medium text-zinc-500 max-md:mt-0 max-md:text-base max-sm:text-xs">
                                {service.description}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

/** Port of components/layouts/footer/index.blade.php. */
export default function Footer() {
    const { flash } = useStore();
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');

    const subscribe = (event) => {
        event.preventDefault();

        if (!/^\S+@\S+\.\S+$/.test(email)) {
            setError('The Email field must be a valid email');

            return;
        }

        setError('');
        setEmail('');
        flash('success', t('subscription.subscribe-success') !== 'subscription.subscribe-success'
            ? t('subscription.subscribe-success')
            : 'You have successfully subscribed to our newsletter.');
    };

    return (
        <footer className="mt-9 bg-lightOrange max-sm:mt-10">
            <div className="flex justify-between gap-x-6 gap-y-8 p-[60px] max-1060:flex-col-reverse max-md:gap-5 max-md:p-8 max-sm:px-4 max-sm:py-5">
                <div className="grid min-w-0 flex-1 grid-cols-[repeat(auto-fill,minmax(160px,1fr))] items-start gap-x-6 gap-y-10 max-1060:hidden">
                    {columns.map((links, index) => (
                        <ul key={index} className="grid gap-5 break-words text-sm">
                            {links.map((link) => (
                                <li key={link.title}>
                                    <Link to={link.url}>{link.title}</Link>
                                </li>
                            ))}
                        </ul>
                    ))}
                </div>

                <Accordion
                    defaultOpen={false}
                    className="hidden !w-full rounded-xl !border-2 !border-[#D9DCD9] max-1060:block max-sm:rounded-lg"
                    headerClass="rounded-t-lg bg-[#E7E9E7] font-medium max-md:p-2.5 max-sm:px-3 max-sm:py-2 max-sm:text-sm"
                    contentClass="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] items-start gap-x-6 gap-y-8 !bg-transparent !p-4"
                    header={t('components.layouts.footer.footer-content')}
                >
                    {columns.map((links, index) => (
                        <ul key={index} className="grid gap-5 break-words text-sm">
                            {links.map((link) => (
                                <li key={link.title}>
                                    <Link to={link.url} className="text-sm font-medium max-sm:text-xs">
                                        {link.title}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    ))}
                </Accordion>

                <div className="grid content-start gap-2.5">
                    <p className="max-w-[288px] text-3xl italic leading-[45px] text-navyBlue max-md:text-2xl max-sm:text-lg" role="heading" aria-level="2">
                        {t('components.layouts.footer.newsletter-text')}
                    </p>

                    <p className="text-xs">{t('components.layouts.footer.subscribe-stay-touch')}</p>

                    <div>
                        <form onSubmit={subscribe} className="mt-2.5 rounded max-sm:mt-0" noValidate>
                            <div className="relative w-full">
                                <input
                                    type="email"
                                    name="email"
                                    value={email}
                                    onChange={(event) => setEmail(event.target.value)}
                                    className="mb-1.5 w-full rounded-lg border px-5 py-3 text-base font-normal text-gray-600 transition-all hover:border-gray-400 focus:border-gray-400 max-sm:px-4 max-md:py-2 max-sm:text-sm block w-[420px] max-w-full rounded-xl border-2 border-[#D9DCD9] bg-[#E7E9E7] px-5 py-4 text-base max-1060:w-full max-md:p-3.5 max-sm:mb-0 max-sm:rounded-lg max-sm:border-2 max-sm:p-2 max-sm:text-sm"
                                    aria-label={t('components.layouts.footer.email')}
                                    placeholder="email@example.com"
                                />

                                <FieldError message={error} />

                                <button
                                    type="submit"
                                    className="absolute top-1.5 flex w-max items-center rounded-xl bg-white px-7 py-2.5 font-medium hover:bg-zinc-100 max-md:top-1 max-md:px-5 max-md:text-xs max-sm:mt-0 max-sm:rounded-lg max-sm:px-4 max-sm:py-2 ltr:right-2 rtl:left-2"
                                >
                                    {t('components.layouts.footer.subscribe')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            <div className="flex justify-between border-t-2 border-gold bg-navyBlue px-[60px] py-3.5 max-md:justify-center max-sm:px-5">
                <p className="text-sm text-white max-md:text-center">
                    {t('components.layouts.footer.footer-text', { current_year: new Date().getFullYear() })}
                </p>
            </div>
        </footer>
    );
}
