import { countries } from '../data/account';
import { t } from '../lib/i18n';
import { ControlGroup, FieldError, Input, Label, Select } from './ui';

export const emptyAddress = {
    company_name: '',
    first_name: '',
    last_name: '',
    email: '',
    vat_id: '',
    address: [''],
    country: '',
    state: '',
    city: '',
    postcode: '',
    phone: '',
};

/** Returns an errors object keyed by field (empty when valid). */
export function validateAddress(address, { requireEmail = true } = {}) {
    const errors = {};
    const required = { first_name: 'First Name', last_name: 'Last Name', city: 'City', postcode: 'Zip/Postcode', phone: 'Telephone', country: 'Country', state: 'State' };

    if (requireEmail) {
        required.email = 'Email';
    }

    for (const [field, label] of Object.entries(required)) {
        if (!String(address[field] || '').trim()) {
            errors[field] = `The ${label} field is required`;
        }
    }

    if (!String(address.address?.[0] || '').trim()) {
        errors.address = 'The Street Address field is required';
    }

    if (address.email && !/^\S+@\S+\.\S+$/.test(address.email)) {
        errors.email = 'The Email field must be a valid email';
    }

    return errors;
}

/** Fills in the display names for the selected country / state. */
export function withLocationNames(address) {
    const country = countries.find((item) => item.code === address.country);
    const state = country?.states.find(([code]) => code === address.state);

    return { ...address, country_name: country?.name || address.country, state_name: state?.[1] || address.state };
}

/**
 * Port of checkout/onepage/address/form.blade.php. `scope` selects the translation
 * group ("checkout.onepage.address" or "customers.account.addresses.create").
 */
export default function AddressForm({ value, onChange, errors = {}, scope = 'checkout.onepage.address', showEmail = true }) {
    const set = (field) => (event) => onChange({ ...value, [field]: event.target.value });
    const country = countries.find((item) => item.code === value.country);
    const aliases = { postcode: 'post-code', telephone: 'phone' };

    const label = (key) => {
        for (const candidate of [`${scope}.${key}`, `${scope}.${aliases[key]}`]) {
            if (t(candidate) !== candidate) {
                return t(candidate);
            }
        }

        return t(`checkout.onepage.address.${key}`);
    };

    return (
        <div className="mt-2 max-md:mt-3">
            <ControlGroup>
                <Label className="!mt-0">{label('company-name')}</Label>
                <Input value={value.company_name} placeholder={label('company-name')} onChange={set('company_name')} />
            </ControlGroup>

            <div className="grid grid-cols-2 gap-x-5 max-md:grid-cols-1">
                <ControlGroup>
                    <Label required className="!mt-0">
                        {label('first-name')}
                    </Label>
                    <Input value={value.first_name} error={errors.first_name} placeholder={label('first-name')} onChange={set('first_name')} />
                    <FieldError message={errors.first_name} />
                </ControlGroup>

                <ControlGroup>
                    <Label required className="!mt-0">
                        {label('last-name')}
                    </Label>
                    <Input value={value.last_name} error={errors.last_name} placeholder={label('last-name')} onChange={set('last_name')} />
                    <FieldError message={errors.last_name} />
                </ControlGroup>
            </div>

            {showEmail && (
                <ControlGroup>
                    <Label required className="!mt-0">
                        {label('email')}
                    </Label>
                    <Input type="email" value={value.email} error={errors.email} placeholder="email@example.com" onChange={set('email')} />
                    <FieldError message={errors.email} />
                </ControlGroup>
            )}

            <ControlGroup>
                <Label className="!mt-0">{label('vat-id')}</Label>
                <Input value={value.vat_id} placeholder={label('vat-id')} onChange={set('vat_id')} />
            </ControlGroup>

            <ControlGroup>
                <Label required className="!mt-0">
                    {label('street-address')}
                </Label>
                <Input
                    className="mb-2"
                    value={value.address?.[0] || ''}
                    error={errors.address}
                    placeholder={label('street-address')}
                    onChange={(event) => onChange({ ...value, address: [event.target.value, ...(value.address || []).slice(1)] })}
                />
                <FieldError message={errors.address} />
                <Input
                    className="mb-2"
                    value={value.address?.[1] || ''}
                    placeholder={label('street-address')}
                    onChange={(event) => onChange({ ...value, address: [value.address?.[0] || '', event.target.value] })}
                />
            </ControlGroup>

            <div className="grid grid-cols-2 gap-x-5 max-md:grid-cols-1">
                <ControlGroup className="!mb-4">
                    <Label required className="!mt-0">
                        {label('country')}
                    </Label>
                    <Select
                        value={value.country}
                        error={errors.country}
                        onChange={(event) => onChange({ ...value, country: event.target.value, state: '' })}
                    >
                        <option value="">{label('select-country')}</option>
                        {countries.map((item) => (
                            <option key={item.code} value={item.code}>
                                {item.name}
                            </option>
                        ))}
                    </Select>
                    <FieldError message={errors.country} />
                </ControlGroup>

                <ControlGroup>
                    <Label required className="!mt-0">
                        {label('state')}
                    </Label>
                    {country?.states.length ? (
                        <Select value={value.state} error={errors.state} onChange={set('state')}>
                            <option value="">{label('select-state')}</option>
                            {country.states.map(([code, name]) => (
                                <option key={code} value={code}>
                                    {name}
                                </option>
                            ))}
                        </Select>
                    ) : (
                        <Input value={value.state} error={errors.state} placeholder={label('state')} onChange={set('state')} />
                    )}
                    <FieldError message={errors.state} />
                </ControlGroup>
            </div>

            <div className="grid grid-cols-2 gap-x-5 max-md:grid-cols-1">
                <ControlGroup>
                    <Label required className="!mt-0">
                        {label('city')}
                    </Label>
                    <Input value={value.city} error={errors.city} placeholder={label('city')} onChange={set('city')} />
                    <FieldError message={errors.city} />
                </ControlGroup>

                <ControlGroup>
                    <Label required className="!mt-0">
                        {label('postcode')}
                    </Label>
                    <Input value={value.postcode} error={errors.postcode} placeholder={label('postcode')} onChange={set('postcode')} />
                    <FieldError message={errors.postcode} />
                </ControlGroup>
            </div>

            <ControlGroup>
                <Label required className="!mt-0">
                    {label('telephone')}
                </Label>
                <Input value={value.phone} error={errors.phone} placeholder={label('telephone')} onChange={set('phone')} />
                <FieldError message={errors.phone} />
            </ControlGroup>
        </div>
    );
}
