// Mock customer-account data. Everything here is fake and only for the UI preview.

export const mockCustomer = {
    id: 1,
    first_name: 'John',
    last_name: 'Doe',
    email: 'john.doe@example.com',
    phone: '9876543210',
    gender: 'Male',
    date_of_birth: '1995-06-15',
    subscribed_to_news_letter: true,
    image: null,
};

const address = (overrides) => ({
    company_name: '',
    first_name: 'John',
    last_name: 'Doe',
    email: 'john.doe@example.com',
    vat_id: '',
    country: 'US',
    country_name: 'United States',
    state: 'CA',
    state_name: 'California',
    city: 'Los Angeles',
    postcode: '90001',
    phone: '9876543210',
    default_address: false,
    ...overrides,
});

export const mockAddresses = [
    address({ id: 1, address: ['221B Sunset Boulevard', 'Apartment 4'], default_address: true }),
    address({
        id: 2,
        company_name: 'Acme Corp',
        address: ['500 Market Street'],
        city: 'San Francisco',
        postcode: '94105',
    }),
];

const item = (productId, name, sku, price, quantity, options = []) => ({
    productId, name, sku, price, quantity, total: price * quantity, options,
});

export const mockOrders = [
    {
        id: 1003,
        increment_id: '1003',
        created_at: '2026-09-24T10:12:00Z',
        status: 'processing',
        items: [
            item(212, 'Executive PU Leather Diary A5', 'custom-executive-diary', 9.99, 10, [
                { attribute_name: 'Inside Pages', option_label: 'Ruled' },
            ]),
        ],
        sub_total: 99.9, discount: 0, shipping: 10, tax: 0, grand_total: 109.9,
        shipping_method: 'Flat Rate - Flat Rate', payment_method: 'Cash On Delivery',
        billing_address: mockAddresses[0], shipping_address: mockAddresses[0],
    },
    {
        id: 1002,
        increment_id: '1002',
        created_at: '2026-09-12T15:40:00Z',
        status: 'completed',
        items: [item(208, 'Metal Ball Pen with Laser Engraving', 'custom-metal-pen', 3.49, 50, [{ attribute_name: 'Ink Colour', option_label: 'Blue' }])],
        sub_total: 174.5, discount: 0, shipping: 0, tax: 0, grand_total: 174.5,
        shipping_method: 'Free Shipping - Free Shipping', payment_method: 'Money Transfer',
        billing_address: mockAddresses[0], shipping_address: mockAddresses[1],
    },
    {
        id: 1001,
        increment_id: '1001',
        created_at: '2026-08-30T09:05:00Z',
        status: 'canceled',
        items: [item(206, 'Fleece Pullover Hoodie', 'fleece-hoodie', 29.99, 1, [
            { attribute_name: 'Color', option_label: 'Grey' },
            { attribute_name: 'Size', option_label: 'L' },
        ])],
        sub_total: 29.99, discount: 0, shipping: 10, tax: 0, grand_total: 39.99,
        shipping_method: 'Flat Rate - Flat Rate', payment_method: 'Money Transfer',
        billing_address: mockAddresses[0], shipping_address: mockAddresses[0],
    },
];

export const mockReviews = [
    { id: 1, productId: 147, title: 'Print came out sharp', comment: 'Ordered 40 tees for our team. Print quality and fabric are great.', rating: 5, created_at: '2026-09-20' },
    { id: 2, productId: 212, title: 'Good value', comment: 'Logo on the cover looks premium. Delivery took a few extra days.', rating: 4, created_at: '2026-09-15' },
];

export const mockDownloads = [
];

export const countries = [
    { code: 'US', name: 'United States', states: [['CA', 'California'], ['NY', 'New York'], ['TX', 'Texas'], ['FL', 'Florida']] },
    { code: 'IN', name: 'India', states: [['TN', 'Tamil Nadu'], ['KA', 'Karnataka'], ['MH', 'Maharashtra'], ['DL', 'Delhi']] },
    { code: 'GB', name: 'United Kingdom', states: [] },
    { code: 'AE', name: 'United Arab Emirates', states: [] },
];

export const shippingMethods = [
    { code: 'flatrate_flatrate', carrier: 'Flat Rate', title: 'Flat Rate', price: 10 },
    { code: 'free_free', carrier: 'Free Shipping', title: 'Free Shipping', price: 0 },
];

export const paymentMethods = [
    { code: 'cashondelivery', title: 'Cash On Delivery', description: 'Cash On Delivery', image: '/images/cash-on-delivery.png' },
    { code: 'moneytransfer', title: 'Money Transfer', description: 'Money Transfer', image: '/images/money-transfer.png' },
];
