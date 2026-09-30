import { useState } from 'react';
import { Link } from 'react-router-dom';
import { t } from '../../lib/i18n';
import { useStore } from '../../store/StoreContext';
import { ControlGroup, FieldError, Input, Label, Modal, PasswordInput } from '../ui';

/** Port of checkout/login.blade.php: "Sign In" link that opens a login modal for guests. */
function CheckoutLogin() {
    const { signIn, flash } = useStore();
    const [isOpen, setIsOpen] = useState(false);
    const [form, setForm] = useState({ email: '', password: '' });
    const [errors, setErrors] = useState({});

    const submit = (event) => {
        event.preventDefault();

        const next = {};

        if (!form.email) next.email = 'The Email field is required';
        if (!form.password) next.password = 'The Password field is required';

        setErrors(next);

        if (!Object.keys(next).length) {
            signIn(form.email);
            setIsOpen(false);
            flash('success', 'You have signed in successfully.');
        }
    };

    return (
        <div>
            <div className="flex items-center">
                <span className="cursor-pointer text-base font-medium text-blue-700" role="button" onClick={() => setIsOpen(true)}>
                    {t('checkout.login.title')}
                </span>
            </div>

            <form onSubmit={submit} noValidate>
                <Modal
                    isOpen={isOpen}
                    onClose={() => setIsOpen(false)}
                    header={<h2 className="text-2xl font-medium max-md:text-base">{t('checkout.login.title')}</h2>}
                    content={
                        <div className="grid grid-cols-2 gap-4 max-md:grid-cols-[1fr] max-md:gap-y-0">
                            <ControlGroup>
                                <Label required>{t('checkout.login.email')}</Label>
                                <Input
                                    type="email"
                                    value={form.email}
                                    error={errors.email}
                                    placeholder="email@example.com"
                                    onChange={(event) => setForm({ ...form, email: event.target.value })}
                                />
                                <FieldError message={errors.email} />
                            </ControlGroup>

                            <ControlGroup>
                                <Label required>{t('checkout.login.password')}</Label>
                                <PasswordInput
                                    value={form.password}
                                    error={errors.password}
                                    placeholder={t('checkout.login.password')}
                                    onChange={(event) => setForm({ ...form, password: event.target.value })}
                                />
                                <FieldError message={errors.password} />
                            </ControlGroup>
                        </div>
                    }
                    footer={
                        <div className="flex flex-wrap items-center gap-4">
                            <button type="submit" className="primary-button max-w-none flex-auto rounded-2xl px-11 py-3 max-md:rounded-lg max-md:py-1.5">
                                {t('checkout.login.title')}
                            </button>
                        </div>
                    }
                />
            </form>
        </div>
    );
}

/** Minimal header used by the cart and checkout pages (they hide the main header). */
export default function CheckoutHeader({ ariaLabel }) {
    const { customer } = useStore();

    return (
        <div className="flex flex-wrap">
            <div className="flex w-full justify-between border border-b border-l-0 border-r-0 border-t-0 px-[60px] py-4 max-lg:px-8 max-md:px-4">
                <div className="flex items-center gap-x-14 max-[1180px]:gap-x-9">
                    <Link to="/" className="flex min-h-[30px]" aria-label={ariaLabel}>
                        <img src="/images/logo.svg" alt="Demo store" width="131" height="29" />
                    </Link>
                </div>

                {!customer && <CheckoutLogin />}
            </div>
        </div>
    );
}
