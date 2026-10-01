import { useState } from 'react';
import { cx } from '../ui';

const hasColor = (color) => !!color && color !== 'transparent' && color !== 'none';

/** "Customized" badge + colour swatch, as added to cart/index and mini-cart in the Bagisto store. */
export function CustomizedBadge({ item, compact = false }) {
    if (!item.customized) {
        return null;
    }

    return (
        <div className={cx('flex items-center', compact ? 'mt-0.5 gap-1.5' : 'mt-1 gap-2')}>
            <span
                className={cx(
                    'inline-flex items-center rounded-md bg-brand-50 font-semibold text-brand-700 ring-1 ring-inset ring-brand-600/20',
                    compact ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-xs',
                )}
            >
                {compact ? 'Customized' : 'Customized Product'}
            </span>

            {hasColor(item.shirt_color) && (
                <span className="flex items-center gap-1.5 text-xs text-gray-500">
                    <span
                        className={cx('inline-block rounded-full border border-gray-300 shadow-sm', compact ? 'h-3 w-3' : 'h-3.5 w-3.5')}
                        style={{ backgroundColor: item.shirt_color }}
                    />
                    {!compact && <span className="font-mono text-[11px]">{item.shirt_color}</span>}
                </span>
            )}
        </div>
    );
}

/** "Customized Views (All Sides)" block of the customer order view. */
export function CustomizedViews({ item }) {
    const [zoom, setZoom] = useState(null);
    const images = Object.entries(item.customized_images || {}).filter(([, url]) => url);

    if (!item.customized || !images.length) {
        return null;
    }

    return (
        <div className="mt-2.5 rounded-lg border border-brand-100 bg-brand-50/50 p-2.5">
            <div className="mb-1.5 flex items-center gap-2">
                <span className="text-xs font-bold text-brand-700">Customized Product</span>
                {hasColor(item.shirt_color) && (
                    <span className="text-xs font-normal text-gray-500">
                        Color:{' '}
                        <span className="inline-block h-3 w-3 rounded-full border border-gray-400 align-middle" style={{ backgroundColor: item.shirt_color }} />{' '}
                        {item.shirt_color}
                    </span>
                )}
            </div>

            <p className="mb-1 text-[11px] font-semibold text-gray-700">Customized Views (All Sides):</p>

            <div className="flex flex-wrap items-center gap-2">
                {images.map(([name, url]) => (
                    <button
                        key={name}
                        type="button"
                        className="flex flex-col items-center gap-0.5 rounded border border-gray-200 bg-white p-1"
                        title={`View Full ${name}`}
                        onClick={() => setZoom(url)}
                    >
                        <img src={url} className="h-16 w-14 rounded bg-slate-50 object-contain" alt={name} />
                        <span className="text-[9px] font-semibold capitalize text-gray-500">{name}</span>
                    </button>
                ))}
            </div>

            {zoom && (
                <div className="fixed inset-0 z-[1001] flex items-center justify-center bg-black/80" onClick={() => setZoom(null)}>
                    <span className="icon-cancel absolute right-5 top-5 cursor-pointer text-3xl text-white" />
                    <img className="max-h-[90vh] max-w-[90vw] rounded-xl bg-white" src={zoom} alt="" />
                </div>
            )}
        </div>
    );
}
