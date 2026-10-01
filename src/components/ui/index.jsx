/* eslint-disable react-refresh/only-export-components */
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { t } from '../../lib/i18n';
import { useStore } from '../../store/StoreContext';

const cx = (...classes) => classes.filter(Boolean).join(' ');

export { cx };

/** Port of <x-shop::dropdown>. */
export function Dropdown({ toggle, children, position = 'bottom-left', closeOnClick = true, contentClass = 'p-5' }) {
    const [isActive, setIsActive] = useState(false);
    const rootRef = useRef(null);
    const toggleRef = useRef(null);
    const contentRef = useRef(null);

    useEffect(() => {
        const handle = (event) => {
            if (
                !rootRef.current?.contains(event.target) ||
                (closeOnClick && contentRef.current?.contains(event.target))
            ) {
                setIsActive(false);
            }
        };

        window.addEventListener('click', handle);

        return () => window.removeEventListener('click', handle);
    }, [closeOnClick]);

    const width = toggleRef.current?.clientWidth || 0;
    const height = toggleRef.current?.clientHeight || 0;
    const [vertical, horizontal] = position.split('-');

    const style = {
        minWidth: width,
        [vertical === 'top' ? 'bottom' : 'top']: height,
        [horizontal === 'right' ? 'right' : 'left']: 0,
    };

    return (
        <div className="relative">
            <div className="select-none" ref={toggleRef} onClick={() => setIsActive((value) => !value)}>
                {typeof toggle === 'function' ? toggle(isActive) : toggle}
            </div>

            <div
                ref={contentRef}
                className={cx(
                    'absolute z-20 w-max rounded-[20px] bg-white shadow-[0px_10px_84px_rgba(0,0,0,0.1)] transition duration-100 ease-out max-md:rounded-lg',
                    isActive ? 'scale-100 opacity-100' : 'pointer-events-none scale-95 opacity-0',
                    contentClass,
                )}
                style={{ ...style, visibility: isActive ? 'visible' : 'hidden' }}
            >
                {children}
            </div>
        </div>
    );
}

/** Port of <x-shop::drawer>; header/content/footer wrappers keep the Blade classes. */
export function Drawer({
    isOpen,
    onClose,
    position = 'right',
    width = '500px',
    header,
    headerClass = '',
    content,
    contentClass = '',
    footer,
    footerClass = '',
}) {
    useEffect(() => {
        document.body.style.overflow = isOpen ? 'hidden' : '';

        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    const hidden = {
        top: '-translate-y-full',
        bottom: 'translate-y-full',
        left: 'ltr:-translate-x-full rtl:translate-x-full',
        right: 'ltr:translate-x-full rtl:-translate-x-full',
    }[position];

    const placement = {
        top: 'inset-x-0 top-0',
        bottom: 'inset-x-0 bottom-0 max-sm:max-h-full',
        right: 'inset-y-0 ltr:right-0 rtl:left-0',
        left: 'inset-y-0 ltr:left-0 rtl:right-0',
    }[position];

    return (
        <>
            <div
                className={cx(
                    'fixed inset-0 z-20 bg-gray-500 bg-opacity-50 transition-opacity duration-300',
                    isOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
                )}
                onClick={onClose}
            />

            <div
                className={cx(
                    'fixed z-[1000] transform overflow-hidden bg-white transition duration-200 ease-in-out max-md:!w-full',
                    placement,
                    isOpen ? 'visible translate-x-0 translate-y-0' : `invisible ${hidden}`,
                )}
                style={{ width }}
                aria-hidden={!isOpen}
            >
                <div className="pointer-events-auto h-full w-full overflow-auto bg-white">
                    <div className="flex h-full w-full flex-col">
                        <div className="min-h-0 min-w-0 flex-1 overflow-auto">
                            <div className="flex h-full flex-col">
                                {header && (
                                    <div
                                        className={cx(
                                            'grid gap-y-2.5 p-6 pb-5 max-md:gap-y-1 max-md:border-b max-md:border-zinc-200 max-md:p-4 max-md:font-semibold',
                                            headerClass,
                                        )}
                                    >
                                        {header}

                                        <div className="absolute top-5 max-sm:top-4 ltr:right-5 rtl:left-5">
                                            <span className="icon-cancel cursor-pointer text-3xl max-md:text-2xl" onClick={onClose} />
                                        </div>
                                    </div>
                                )}

                                {content && <div className={cx('flex-1 overflow-auto px-6 max-md:px-4', contentClass)}>{content}</div>}

                                {footer && <div className={cx('pb-8 max-md:pb-2', footerClass)}>{footer}</div>}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

/** Port of <x-shop::modal>. */
export function Modal({ isOpen, onClose, header, content, footer, panelClass = 'max-w-[595px]', contentClass = '' }) {
    if (!isOpen) {
        return null;
    }

    return (
        <>
            <div className="fixed inset-0 z-10 bg-gray-500 bg-opacity-50 transition-opacity" onClick={onClose} />

            <div className="fixed inset-0 z-10 transform overflow-y-auto transition">
                <div className="flex min-h-full items-end justify-center p-4 sm:items-center sm:p-0" onClick={onClose}>
                    <div
                        className={cx(
                            'absolute left-1/2 top-1/2 z-[999] w-full -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-lg bg-zinc-100 max-md:w-[90%]',
                            panelClass,
                        )}
                        onClick={(event) => event.stopPropagation()}
                    >
                        {header && (
                            <div className="flex items-center justify-between gap-5 border-b border-zinc-200 bg-white p-8 max-sm:px-4 max-sm:py-3">
                                {header}
                                <span className="icon-cancel cursor-pointer text-3xl max-sm:text-2xl" onClick={onClose} />
                            </div>
                        )}

                        {content && <div className={cx('bg-white p-8 max-sm:p-5', contentClass)}>{content}</div>}

                        {footer && <div className="mt-5 bg-white p-8 max-sm:mt-0.5 max-sm:px-4 max-sm:py-4">{footer}</div>}
                    </div>
                </div>
            </div>
        </>
    );
}

/** Port of <x-shop::modal.confirm>, driven by a promise-less callback. */
export function ConfirmModal({ isOpen, title, message, onAgree, onDisagree }) {
    if (!isOpen) {
        return null;
    }

    return (
        <>
            <div className="fixed inset-0 z-20 bg-gray-500 bg-opacity-50 transition-opacity" />

            <div className="fixed inset-0 z-20 transform overflow-y-auto transition">
                <div className="flex min-h-full items-end justify-center p-4 sm:items-center sm:p-0">
                    <div className="absolute left-1/2 top-1/2 z-[999] w-full max-w-[475px] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-xl bg-white p-5 max-md:w-[90%] max-sm:p-4">
                        <div className="flex gap-2.5">
                            <div>
                                <span className="flex rounded-full border border-gray-300 p-2.5">
                                    <span className="icon-error text-3xl text-zinc-600" />
                                </span>
                            </div>

                            <div>
                                <div className="flex items-center justify-between gap-2.5 text-xl max-md:text-lg">
                                    {title || t('components.modal.confirm.title')}
                                </div>

                                <div className="pb-5 pt-1.5 text-left text-sm text-zinc-500 max-sm:text-xs">
                                    {message || t('components.modal.confirm.message')}
                                </div>

                                <div className="flex flex-wrap items-center justify-end gap-2.5">
                                    <button
                                        type="button"
                                        className="secondary-button min-w-[100px] rounded-xl py-2.5 text-sm max-md:rounded-lg max-md:py-2"
                                        onClick={onDisagree}
                                    >
                                        {t('components.modal.confirm.disagree-btn')}
                                    </button>

                                    <button
                                        type="button"
                                        className="primary-button min-w-[100px] rounded-xl py-2.5 text-sm max-md:rounded-lg max-md:py-2"
                                        onClick={onAgree}
                                    >
                                        {t('components.modal.confirm.agree-btn')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

/** Hook that returns [confirmElement, askConfirm(callback)]. */
export function useConfirm() {
    const [pending, setPending] = useState(null);

    const element = (
        <ConfirmModal
            isOpen={!!pending}
            onAgree={() => {
                pending?.();
                setPending(null);
            }}
            onDisagree={() => setPending(null)}
        />
    );

    return [element, (callback) => setPending(() => callback)];
}

/** Port of <x-shop::accordion>. */
export function Accordion({ header, children, defaultOpen = true, className = '', headerClass = '', contentClass = '' }) {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className={cx('border-b border-zinc-200', className)}>
            <div
                className={cx('flex cursor-pointer select-none items-center justify-between p-4', headerClass)}
                role="button"
                tabIndex={0}
                onClick={() => setIsOpen((value) => !value)}
            >
                {header}
                <span className={isOpen ? 'icon-arrow-up text-2xl' : 'icon-arrow-down text-2xl'} />
            </div>

            {isOpen && <div className={cx('z-10 rounded-lg bg-white p-1.5', contentClass)}>{children}</div>}
        </div>
    );
}

const flashStyles = {
    success: { background: '#D4EDDA', color: '#155721', icon: 'icon-toast-done' },
    error: { background: '#F8D7DA', color: '#721C24', icon: 'icon-toast-error' },
    warning: { background: '#FFF3CD', color: '#856404', icon: 'icon-toast-exclamation-mark' },
    info: { background: '#E2E3E5', color: '#383D41', icon: 'icon-toast-info' },
};

function FlashItem({ flash, onRemove }) {
    const style = flashStyles[flash.type] || flashStyles.info;

    return (
        <div
            className="flex w-max max-w-[408px] justify-between gap-12 rounded-lg px-5 py-3 max-sm:max-w-80 max-sm:items-center max-sm:gap-2 max-sm:p-3"
            style={{ background: style.background }}
        >
            <p className="flex items-center break-words text-sm" style={{ color: style.color }}>
                <span className={cx('text-2xl ltr:mr-2.5 rtl:ml-2.5', style.icon)} style={{ color: style.color }} />
                {flash.message}
            </p>

            <span className="icon-cancel max-h-4 max-w-4 cursor-pointer" style={{ color: style.color }} onClick={onRemove} />
        </div>
    );
}

/** Port of <x-shop::flash-group>. */
export function FlashGroup() {
    const { flashes, dismissFlash } = useStore();

    return (
        <>
            <div className="fixed top-5 z-[1001] grid justify-items-end gap-2.5 max-sm:hidden ltr:right-5 rtl:left-5">
                {flashes.map((flash) => (
                    <FlashItem key={flash.id} flash={flash} onRemove={() => dismissFlash(flash.id)} />
                ))}
            </div>

            <div className="fixed bottom-10 left-1/2 z-[1001] grid -translate-x-1/2 -translate-y-1/2 transform justify-items-center gap-2.5 sm:hidden">
                {flashes.map((flash) => (
                    <FlashItem key={flash.id} flash={flash} onRemove={() => dismissFlash(flash.id)} />
                ))}
            </div>
        </>
    );
}

/** Port of <x-shop::quantity-changer>. */
export function QuantityChanger({ value, onChange, onRemove, minValue = 1, removable = false, className = '' }) {
    const atMin = value <= minValue;

    return (
        <div className={cx('flex items-center border border-navyBlue', className)}>
            {removable && atMin ? (
                <span
                    className="icon-bin cursor-pointer text-2xl"
                    role="button"
                    tabIndex={0}
                    aria-label={t('components.quantity-changer.remove-item')}
                    onClick={onRemove}
                />
            ) : (
                <span
                    className={cx('icon-minus text-2xl', atMin ? 'cursor-not-allowed opacity-40' : 'cursor-pointer')}
                    role="button"
                    tabIndex={0}
                    aria-label={t('components.quantity-changer.decrease-quantity')}
                    onClick={() => !atMin && onChange(value - 1)}
                />
            )}

            <p className="w-2.5 select-none text-center max-sm:text-sm">{value}</p>

            <span
                className="icon-plus cursor-pointer text-2xl"
                role="button"
                tabIndex={0}
                aria-label={t('components.quantity-changer.increase-quantity')}
                onClick={() => onChange(value + 1)}
            />
        </div>
    );
}

/** Port of <x-shop::products.ratings>. */
export function Ratings({ average, total, showTitle = true, className = '' }) {
    return (
        <div className={cx('flex w-max items-center rounded-md border border-zinc-200 px-4 py-2', className)}>
            <span className="text-sm font-medium text-black max-sm:text-xs">{Number(average).toFixed(1)}</span>
            <span className="icon-star-fill -mt-1 text-xl text-amber-500 max-sm:-mt-1 max-sm:text-lg" role="presentation" />
            <span className="border-l border-zinc-300 text-sm font-medium text-black max-sm:border-zinc-300 max-sm:text-xs ltr:pl-1 rtl:pr-1">
                {total} {showTitle && <span>{t('components.products.ratings.title')}</span>}
            </span>
        </div>
    );
}

/** Row of 5 stars (filled up to `rating`). */
export function Stars({ rating, className = 'text-2xl', onRate }) {
    return (
        <div className="flex items-center">
            {[1, 2, 3, 4, 5].map((star) => (
                <span
                    key={star}
                    className={cx(
                        className,
                        'icon-star-fill',
                        star <= Math.round(rating) ? 'text-amber-500' : 'text-zinc-500',
                        onRate && 'cursor-pointer',
                    )}
                    onClick={onRate ? () => onRate(star) : undefined}
                />
            ))}
        </div>
    );
}

/** Port of <x-shop::breadcrumbs>: items are {title, url}. */
export function Breadcrumbs({ items }) {
    const all = [{ title: t('partials.breadcrumbs.home') !== 'partials.breadcrumbs.home' ? t('partials.breadcrumbs.home') : 'Home', url: '/' }, ...items];

    return (
        <div className="mt-[34px] flex justify-start max-lg:hidden">
            <div className="flex items-center gap-x-3.5">
                <nav>
                    <ol className="flex">
                        {all.map((crumb, index) =>
                            crumb.url && index < all.length - 1 ? (
                                <li key={index} className="flex items-center gap-x-2.5 text-base font-medium">
                                    <Link to={crumb.url}>{crumb.title}</Link>
                                    <span className="icon-arrow-right text-2xl rtl:icon-arrow-left" />
                                </li>
                            ) : (
                                <li
                                    key={index}
                                    className="flex items-center gap-x-2.5 break-all text-base text-zinc-500 after:content-['/'] after:last:hidden ltr:ml-2.5 rtl:mr-0"
                                    aria-current="page"
                                >
                                    {crumb.title}
                                </li>
                            ),
                        )}
                    </ol>
                </nav>
            </div>
        </div>
    );
}

/** Spinner used by <x-shop::button> while loading. */
export function Spinner({ className = 'text-navyBlue absolute h-5 w-5 animate-spin' }) {
    return (
        <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" aria-hidden="true" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
        </svg>
    );
}

/* ---------- Form controls (ports of <x-shop::form.control-group.*>) ---------- */

export const inputClass =
    'mb-1.5 w-full rounded-lg border px-5 py-3 text-base font-normal text-gray-600 transition-all hover:border-gray-400 focus:border-gray-400 max-sm:px-4 max-md:py-2 max-sm:text-sm';

export const selectClass =
    'custom-select mb-1.5 w-full rounded-lg border border-zinc-200 bg-white px-5 py-3 text-base text-gray-600 transition-all hover:border-gray-400 focus-visible:outline-none max-md:py-2 max-sm:px-4 max-sm:text-sm';

export function ControlGroup({ children, className = 'mb-4' }) {
    return <div className={className}>{children}</div>;
}

export function Label({ children, required, htmlFor, className = '' }) {
    return (
        <label htmlFor={htmlFor} className={cx('mb-2 block text-base max-sm:mb-1 max-sm:text-sm', required && 'required', className)}>
            {children}
        </label>
    );
}

export function FieldError({ message }) {
    return message ? <p className="text-xs italic text-red-500">{message}</p> : null;
}

export function Input({ error, className = '', ...props }) {
    return <input className={cx(inputClass, error && 'border !border-red-500 hover:border-red-500', className)} {...props} />;
}

export function Textarea({ error, className = '', ...props }) {
    return (
        <textarea
            className={cx(
                'mb-1.5 w-full rounded-lg border px-5 py-3 text-base font-normal text-gray-600 transition-all hover:border-gray-400 focus:border-gray-400',
                error && 'border !border-red-500 hover:border-red-500',
                className,
            )}
            {...props}
        />
    );
}

export function Select({ error, className = '', children, ...props }) {
    return (
        <select className={cx(selectClass, error && 'border !border-red-500', className)} {...props}>
            {children}
        </select>
    );
}

export function PasswordInput({ error, className = '', ...props }) {
    const [isVisible, setIsVisible] = useState(false);

    return (
        <div className="relative">
            <input
                type={isVisible ? 'text' : 'password'}
                className={cx(inputClass, 'ltr:!pr-12 rtl:!pl-12 [&::-ms-reveal]:hidden', error && 'border !border-red-500 hover:border-red-500', className)}
                {...props}
            />

            <button
                type="button"
                className="absolute bottom-1.5 top-0 flex items-center px-4 text-zinc-500 transition-colors hover:text-zinc-700 ltr:right-0 rtl:left-0"
                aria-label={t('components.form.control-group.control.show-password')}
                aria-pressed={isVisible}
                onClick={() => setIsVisible((value) => !value)}
            >
                {isVisible ? (
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"
                        />
                    </svg>
                ) : (
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                        />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    </svg>
                )}
            </button>
        </div>
    );
}

/** Checkbox styled with the icon font, like Bagisto's control type="checkbox". */
export function Checkbox({ id, checked, onChange, label, labelClass = 'cursor-pointer select-none text-base text-zinc-500 max-sm:text-sm ltr:pl-0 rtl:pr-0' }) {
    return (
        <div className="flex select-none items-center gap-1.5">
            <input type="checkbox" id={id} className="peer hidden" checked={!!checked} onChange={(event) => onChange?.(event.target.checked)} />
            <label htmlFor={id} className="icon-uncheck peer-checked:icon-check-box cursor-pointer text-2xl text-navyBlue" />
            {label && (
                <label htmlFor={id} className={labelClass}>
                    {label}
                </label>
            )}
        </div>
    );
}

/** Radio styled with the icon font. */
export function Radio({ id, name, checked, onChange, children, labelClass = '' }) {
    return (
        <div className="flex items-center gap-x-1.5">
            <input type="radio" id={id} name={name} className="peer hidden" checked={!!checked} onChange={onChange} />
            <label htmlFor={id} className="icon-radio-unselect peer-checked:icon-radio-select cursor-pointer text-2xl text-navyBlue" />
            {children && (
                <label htmlFor={id} className={cx('cursor-pointer', labelClass)}>
                    {children}
                </label>
            )}
        </div>
    );
}
