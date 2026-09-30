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
            item(24, "EverFresh Men's Wrinkle-Free Half Sleeve 100% Cotton Tee", 'mt-everfresh-tee-m-blue', 42.99, 2, [
                { attribute_name: 'Color', option_label: 'Blue' },
                { attribute_name: 'Size', option_label: 'M' },
            ]),
        ],
        sub_total: 85.98, discount: 0, shipping: 10, tax: 0, grand_total: 95.98,
        shipping_method: 'Flat Rate - Flat Rate', payment_method: 'Cash On Delivery',
        billing_address: mockAddresses[0], shipping_address: mockAddresses[0],
    },
    {
        id: 1002,
        increment_id: '1002',
        created_at: '2026-09-12T15:40:00Z',
        status: 'completed',
        items: [item(129, 'Smart Fitness Watch with Heart Rate Monitor & Activity Tracking', 'smart-fitness-watch', 25, 1)],
        sub_total: 25, discount: 0, shipping: 0, tax: 0, grand_total: 25,
        shipping_method: 'Free Shipping - Free Shipping', payment_method: 'Money Transfer',
        billing_address: mockAddresses[0], shipping_address: mockAddresses[1],
    },
    {
        id: 1001,
        increment_id: '1001',
        created_at: '2026-08-30T09:05:00Z',
        status: 'canceled',
        items: [item(45, 'Beginner Yoga Tutorial- 300+ HD digital video tutorials', 'yoga-tutorial', 45.99, 1)],
        sub_total: 45.99, discount: 0, shipping: 0, tax: 0, grand_total: 45.99,
        shipping_method: null, payment_method: 'Money Transfer',
        billing_address: mockAddresses[0], shipping_address: null,
    },
];

export const mockReviews = [
    { id: 1, productId: 24, title: 'Great fit', comment: 'Soft fabric and true to size. Would buy again.', rating: 5, created_at: '2026-09-20' },
    { id: 2, productId: 129, title: 'Good value', comment: 'Battery lasts about a week. The strap could be better.', rating: 4, created_at: '2026-09-15' },
];

export const mockDownloads = [
    { id: 1, order_id: 1001, title: 'Beginner Yoga Tutorial', status: 'available', created_at: '2026-08-30', remaining: 'Unlimited' },
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
