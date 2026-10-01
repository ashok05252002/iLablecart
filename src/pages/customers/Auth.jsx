import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import { Checkbox, ControlGroup, FieldError, Input, Label, PasswordInput } from '../../components/ui';
import socialIcons from '../../data/social-icons.json';
import { t } from '../../lib/i18n';
import { useStore } from '../../store/StoreContext';

const fieldClass = 'px-6 py-4 max-md:py-3 max-sm:py-2';
const submitClass =
    'primary-button m-0 mx-auto block w-full max-w-[374px] rounded-2xl px-11 py-4 text-center text-base max-md:max-w-full max-md:rounded-lg max-md:py-3 max-sm:py-1.5 ltr:ml-0 rtl:mr-0';

/** Shared page shell of the customer auth pages (logo, bordered card, footer line). */
function AuthShell({ title, heading, text, footerKey, children, after }) {
    return (
        <Layout title={title} hasHeader={false} hasFeature={false} hasFooter={false}>
            <div className="container mt-20 max-1180:px-5 max-md:mt-12">
                <div className="flex items-center gap-x-14 max-[1180px]:gap-x-9">
                    <Link to="/" className="m-[0_auto_20px_auto]" aria-label="Bagisto">
                        <img src="/images/logo.png" alt="Sainmarks" width="143" height="29" />
                    </Link>
                </div>

                <div className="m-auto w-full max-w-[870px] rounded-xl border border-zinc-200 p-16 px-[90px] max-md:px-8 max-md:py-8 max-sm:border-none max-sm:p-0">
                    <h1 className="font-dmserif text-4xl max-md:text-3xl max-sm:text-xl">{heading}</h1>
                    <p className="mt-4 text-xl text-zinc-500 max-sm:mt-0 max-sm:text-sm">{text}</p>

                    <div className="mt-14 rounded max-sm:mt-8">{children}</div>

                    {after}
                </div>

                <p className="mb-4 mt-8 text-center text-xs text-zinc-500">{t(footerKey, { current_year: new Date().getFullYear() })}</p>
            </div>
        </Layout>
    );
}

/** Port of SocialLogin's social-links.blade.php. */
function SocialLinks() {
    return (
        <div className="mt-6 flex gap-3">
            {socialIcons.map((icon) => (
                <a
                    key={icon.provider}
                    href="#social-login"
                    className="transition-all hover:opacity-[0.8]"
                    aria-label={icon.provider}
                    onClick={(event) => event.preventDefault()}
                    dangerouslySetInnerHTML={{ __html: icon.svg }}
                />
            ))}
        </div>
    );
}

const isEmail = (value) => /^\S+@\S+\.\S+$/.test(value);

/** Port of customers/sign-in.blade.php. */
export function SignIn() {
    const navigate = useNavigate();
    const { signIn, flash } = useStore();
    const [form, setForm] = useState({ email: '', password: '' });
    const [errors, setErrors] = useState({});

    const submit = (event) => {
        event.preventDefault();

        const next = {};

        if (!form.email) next.email = 'The Email field is required';
        else if (!isEmail(form.email)) next.email = 'The Email field must be a valid email';
        if (!form.password) next.password = 'The Password field is required';
        else if (form.password.length < 6) next.password = 'The Password field must be at least 6 characters';

        setErrors(next);

        if (!Object.keys(next).length) {
            signIn(form.email);
            flash('success', 'You have signed in successfully.');
            navigate('/');
        }
    };

    return (
        <AuthShell
            title={t('customers.login-form.page-title')}
            heading={t('customers.login-form.page-title')}
            text={t('customers.login-form.form-login-text')}
            footerKey="customers.login-form.footer"
            after={
                <p className="mt-5 font-medium text-zinc-500 max-sm:text-center max-sm:text-sm">
                    {t('customers.login-form.new-customer')}{' '}
                    <Link className="text-navyBlue" to="/customer/register">
                        {t('customers.login-form.create-your-account')}
                    </Link>
                </p>
            }
        >
            <form onSubmit={submit} noValidate>
                <ControlGroup>
                    <Label required>{t('customers.login-form.email')}</Label>
                    <Input
                        type="email"
                        className={fieldClass}
                        value={form.email}
                        error={errors.email}
                        placeholder="email@example.com"
                        onChange={(event) => setForm({ ...form, email: event.target.value })}
                    />
                    <FieldError message={errors.email} />
                </ControlGroup>

                <ControlGroup>
                    <Label required>{t('customers.login-form.password')}</Label>
                    <PasswordInput
                        className={fieldClass}
                        value={form.password}
                        error={errors.password}
                        placeholder={t('customers.login-form.password')}
                        onChange={(event) => setForm({ ...form, password: event.target.value })}
                    />
                    <FieldError message={errors.password} />
                </ControlGroup>

                <div className="flex justify-end">
                    <div className="block">
                        <Link to="/customer/forgot-password" className="cursor-pointer text-base text-black max-sm:text-sm">
                            <span>{t('customers.login-form.forgot-pass')}</span>
                        </Link>
                    </div>
                </div>

                <div className="mt-8 flex flex-wrap items-center gap-9 max-sm:justify-center max-sm:gap-5 max-sm:text-center">
                    <button className={submitClass} type="submit">
                        {t('customers.login-form.button-title')}
                    </button>
                </div>

                <SocialLinks />
            </form>
        </AuthShell>
    );
}

/** Port of customers/sign-up.blade.php. */
export function SignUp() {
    const navigate = useNavigate();
    const { signUp, flash } = useStore();
    const [form, setForm] = useState({ first_name: '', last_name: '', email: '', password: '', password_confirmation: '', subscribed: false });
    const [errors, setErrors] = useState({});
    const set = (field) => (event) => setForm({ ...form, [field]: event.target.value });

    const submit = (event) => {
        event.preventDefault();

        const next = {};

        if (!form.first_name) next.first_name = 'The First Name field is required';
        if (!form.last_name) next.last_name = 'The Last Name field is required';
        if (!form.email) next.email = 'The Email field is required';
        else if (!isEmail(form.email)) next.email = 'The Email field must be a valid email';
        if (!form.password) next.password = 'The Password field is required';
        else if (form.password.length < 6) next.password = 'The Password field must be at least 6 characters';
        if (form.password !== form.password_confirmation) next.password_confirmation = 'The Confirm Password field must match Password';

        setErrors(next);

        if (!Object.keys(next).length) {
            signUp({ first_name: form.first_name, last_name: form.last_name, email: form.email, subscribed_to_news_letter: form.subscribed });
            flash('success', t('customers.signup-form.success'));
            navigate('/');
        }
    };

    const text = (field, labelKey, type = 'text', placeholder) => (
        <ControlGroup>
            <Label required>{t(`customers.signup-form.${labelKey}`)}</Label>
            <Input
                type={type}
                className={fieldClass}
                value={form[field]}
                error={errors[field]}
                placeholder={placeholder || t(`customers.signup-form.${labelKey}`)}
                onChange={set(field)}
            />
            <FieldError message={errors[field]} />
        </ControlGroup>
    );

    return (
        <AuthShell
            title={t('customers.signup-form.page-title')}
            heading={t('customers.signup-form.page-title')}
            text={t('customers.signup-form.form-signup-text')}
            footerKey="customers.signup-form.footer"
            after={
                <p className="mt-5 font-medium text-zinc-500 max-sm:text-center max-sm:text-sm">
                    {t('customers.signup-form.account-exists')}{' '}
                    <Link className="text-navyBlue" to="/customer/login">
                        {t('customers.signup-form.sign-in-button')}
                    </Link>
                </p>
            }
        >
            <form onSubmit={submit} noValidate>
                {text('first_name', 'first-name')}
                {text('last_name', 'last-name')}
                {text('email', 'email', 'email', 'email@example.com')}

                <ControlGroup className="mb-6">
                    <Label required>{t('customers.signup-form.password')}</Label>
                    <PasswordInput
                        className={fieldClass}
                        value={form.password}
                        error={errors.password}
                        placeholder={t('customers.signup-form.password')}
                        onChange={set('password')}
                    />
                    <FieldError message={errors.password} />
                </ControlGroup>

                <ControlGroup>
                    <Label>{t('customers.signup-form.confirm-pass')}</Label>
                    <PasswordInput
                        className={fieldClass}
                        value={form.password_confirmation}
                        error={errors.password_confirmation}
                        placeholder={t('customers.signup-form.confirm-pass')}
                        onChange={set('password_confirmation')}
                    />
                    <FieldError message={errors.password_confirmation} />
                </ControlGroup>

                <div className="mb-5">
                    <Checkbox
                        id="is-subscribed"
                        checked={form.subscribed}
                        onChange={(subscribed) => setForm({ ...form, subscribed })}
                        label={t('customers.signup-form.subscribe-to-newsletter')}
                    />
                </div>

                <div className="mt-8 flex flex-wrap items-center gap-9 max-sm:justify-center max-sm:gap-5">
                    <button className={submitClass} type="submit">
                        {t('customers.signup-form.button-title')}
                    </button>

                    <div className="flex flex-wrap gap-4">
                        <SocialLinks />
                    </div>
                </div>
            </form>
        </AuthShell>
    );
}

/** Port of customers/forgot-password.blade.php. */
export function ForgotPassword() {
    const { flash } = useStore();
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');

    const submit = (event) => {
        event.preventDefault();

        if (!isEmail(email)) {
            setError(email ? 'The Email field must be a valid email' : 'The Email field is required');

            return;
        }

        setError('');
        flash('success', t('customers.forgot-password.reset-link-sent') !== 'customers.forgot-password.reset-link-sent'
            ? t('customers.forgot-password.reset-link-sent')
            : 'We have e-mailed your reset password link.');
    };

    return (
        <AuthShell
            title={t('customers.forgot-password.title')}
            heading={t('customers.forgot-password.title')}
            text={t('customers.forgot-password.forgot-password-text')}
            footerKey="customers.forgot-password.footer"
        >
            <form onSubmit={submit} noValidate>
                <ControlGroup className="mb-4 max-sm:mb-1.5">
                    <Label required>{t('customers.login-form.email')}</Label>
                    <Input
                        type="email"
                        className="px-6 py-4 max-sm:py-1.5"
                        value={email}
                        error={error}
                        placeholder="email@example.com"
                        onChange={(event) => setEmail(event.target.value)}
                    />
                    <FieldError message={error} />
                </ControlGroup>

                <div className="mt-8 flex flex-wrap items-center gap-9 max-sm:mt-0 max-sm:justify-center max-sm:text-center">
                    <button className={`${submitClass} max-sm:text-sm`} type="submit">
                        {t('customers.forgot-password.submit')}
                    </button>
                </div>

                <p className="mt-5 font-medium text-zinc-500 max-sm:text-center max-sm:text-sm">
                    {t('customers.forgot-password.back')}{' '}
                    <Link className="text-navyBlue" to="/customer/login">
                        {t('customers.forgot-password.sign-in-button')}
                    </Link>
                </p>
            </form>
        </AuthShell>
    );
}

/** Port of customers/reset-password.blade.php. */
export function ResetPassword() {
    const navigate = useNavigate();
    const { flash } = useStore();
    const [form, setForm] = useState({ email: '', password: '', password_confirmation: '' });
    const [errors, setErrors] = useState({});

    const submit = (event) => {
        event.preventDefault();

        const next = {};

        if (!isEmail(form.email)) next.email = form.email ? 'The Email field must be a valid email' : 'The Email field is required';
        if (form.password.length < 6) next.password = 'The Password field must be at least 6 characters';
        if (form.password !== form.password_confirmation) next.password_confirmation = 'The Confirm Password field must match Password';

        setErrors(next);

        if (!Object.keys(next).length) {
            flash('success', 'Your password has been reset.');
            navigate('/customer/login');
        }
    };

    return (
        <AuthShell
            title={t('customers.reset-password.title')}
            heading={t('customers.reset-password.title')}
            text={t('customers.forgot-password.forgot-password-text')}
            footerKey="customers.reset-password.footer"
        >
            <form onSubmit={submit} noValidate>
                <ControlGroup>
                    <Label required>{t('customers.reset-password.email')}</Label>
                    <Input
                        type="email"
                        className={fieldClass}
                        value={form.email}
                        error={errors.email}
                        placeholder="email@example.com"
                        onChange={(event) => setForm({ ...form, email: event.target.value })}
                    />
                    <FieldError message={errors.email} />
                </ControlGroup>

                <ControlGroup>
                    <Label required>{t('customers.reset-password.password')}</Label>
                    <PasswordInput
                        className={fieldClass}
                        value={form.password}
                        error={errors.password}
                        placeholder={t('customers.reset-password.password')}
                        onChange={(event) => setForm({ ...form, password: event.target.value })}
                    />
                    <FieldError message={errors.password} />
                </ControlGroup>

                <ControlGroup>
                    <Label required>{t('customers.reset-password.confirm-password')}</Label>
                    <PasswordInput
                        className={fieldClass}
                        value={form.password_confirmation}
                        error={errors.password_confirmation}
                        placeholder={t('customers.reset-password.confirm-password')}
                        onChange={(event) => setForm({ ...form, password_confirmation: event.target.value })}
                    />
                    <FieldError message={errors.password_confirmation} />
                </ControlGroup>

                <div className="mt-8 flex flex-wrap items-center gap-9 max-sm:justify-center max-sm:text-center">
                    <button className={submitClass} type="submit">
                        {t('customers.reset-password.submit-btn-title')}
                    </button>
                </div>
            </form>
        </AuthShell>
    );
}
