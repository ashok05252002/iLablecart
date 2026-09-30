import lang from '../data/lang.json';

/**
 * Translate a Bagisto shop key, e.g. t('components.products.card.sale').
 * The "shop::app." prefix is optional. Params replace ":name" placeholders.
 */
export function t(key, params = {}) {
    const path = key.replace(/^shop::app\./, '').split('.');

    let value = path.reduce((node, part) => (node && typeof node === 'object' ? node[part] : undefined), lang);

    if (typeof value !== 'string') {
        return key;
    }

    for (const [name, replacement] of Object.entries(params)) {
        value = value.replaceAll(`:${name}`, replacement);
    }

    return value;
}
