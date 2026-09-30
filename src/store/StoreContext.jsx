import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { finalPrice, findProductById } from '../lib/catalog';
import { t } from '../lib/i18n';
import { mockAddresses, mockCustomer, mockOrders } from '../data/account';

const StoreContext = createContext(null);

function usePersistentState(key, initial) {
    const [value, setValue] = useState(() => {
        try {
            const stored = localStorage.getItem(`bagisto-ui:${key}`);

            return stored ? JSON.parse(stored) : initial;
        } catch {
            return initial;
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem(`bagisto-ui:${key}`, JSON.stringify(value));
        } catch {
            // Storage can be unavailable (private mode); state still works in memory.
        }
    }, [key, value]);

    return [value, setValue];
}

export function StoreProvider({ children }) {
    const [cartItems, setCartItems] = usePersistentState('cart', []);
    const [wishlist, setWishlist] = usePersistentState('wishlist', []);
    const [compare, setCompare] = usePersistentState('compare', []);
    const [customer, setCustomer] = usePersistentState('customer', null);
    const [addresses, setAddresses] = usePersistentState('addresses', mockAddresses);
    const [orders, setOrders] = usePersistentState('orders', mockOrders);
    const [coupon, setCoupon] = usePersistentState('coupon', null);
    const [flashes, setFlashes] = useState([]);

    const dismissFlash = useCallback((id) => setFlashes((current) => current.filter((item) => item.id !== id)), []);

    const flash = useCallback(
        (type, message) => {
            const id = Date.now() + Math.random();

            setFlashes((current) => [...current, { id, type, message }]);
            setTimeout(() => dismissFlash(id), 5000);
        },
        [dismissFlash],
    );

    const addToCart = (product, quantity = 1, options = []) => {
        const key = `${product.id}:${JSON.stringify(options)}`;

        setCartItems((items) => {
            const existing = items.find((item) => item.key === key);

            if (existing) {
                return items.map((item) => (item.key === key ? { ...item, quantity: item.quantity + quantity } : item));
            }

            return [...items, { id: Date.now(), key, productId: product.id, quantity, options }];
        });

        flash('success', t('checkout.cart.item-add-to-cart'));
    };

    const updateCartItem = (id, quantity) =>
        setCartItems((items) => items.map((item) => (item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item)));

    const removeCartItem = (id) => {
        setCartItems((items) => items.filter((item) => item.id !== id));
        flash('success', t('checkout.cart.success-remove'));
    };

    const removeCartItems = (ids) => {
        setCartItems((items) => items.filter((item) => !ids.includes(item.id)));
        flash('success', t('checkout.cart.success-remove'));
    };

    const clearCart = () => setCartItems([]);

    const cart = useMemo(() => {
        const items = cartItems
            .map((item) => {
                const product = findProductById(item.productId);

                if (!product) {
                    return null;
                }

                const price = finalPrice(product);

                return { ...item, product, price, total: price * item.quantity };
            })
            .filter(Boolean);

        const subTotal = items.reduce((sum, item) => sum + item.total, 0);
        const discount = coupon ? Math.round(subTotal * coupon.percent) / 100 : 0;
        const tax = 0;

        return {
            items,
            itemsCount: items.length,
            itemsQty: items.reduce((sum, item) => sum + item.quantity, 0),
            subTotal,
            discount,
            tax,
            grandTotal: subTotal - discount + tax,
            coupon,
        };
    }, [cartItems, coupon]);

    const applyCoupon = (code) => {
        if (code.trim().toUpperCase() === 'SAVE10') {
            setCoupon({ code: 'SAVE10', percent: 10 });
            flash('success', t('checkout.coupon.success-apply'));

            return true;
        }

        flash('error', t('checkout.coupon.invalid'));

        return false;
    };

    const removeCoupon = () => {
        setCoupon(null);
        flash('success', 'Coupon code removed successfully.');
    };

    const toggleWishlist = (product) => {
        if (!customer) {
            flash('warning', t('products.view.login-for-wishlist') !== 'products.view.login-for-wishlist'
                ? t('products.view.login-for-wishlist')
                : 'Please sign in to add items to your wishlist.');

            return;
        }

        const inList = wishlist.includes(product.id);

        setWishlist((ids) => (inList ? ids.filter((id) => id !== product.id) : [...ids, product.id]));
        flash('success', inList ? t('customers.account.wishlist.removed') : 'Item added successfully to wishlist.');
    };

    const addToCompare = (product) => {
        if (compare.includes(product.id)) {
            flash('warning', t('components.products.card.already-in-compare'));

            return;
        }

        setCompare((ids) => [...ids, product.id]);
        flash('success', t('components.products.card.add-to-compare-success'));
    };

    const removeFromCompare = (id) => {
        setCompare((ids) => ids.filter((other) => other !== id));
        flash('success', t('compare.remove-success'));
    };

    const clearCompare = () => {
        setCompare([]);
        flash('success', t('compare.remove-all-success'));
    };

    const signIn = (email) => {
        setCustomer({ ...mockCustomer, email: email || mockCustomer.email });
    };

    const signUp = (data) => {
        setCustomer({ ...mockCustomer, ...data });
    };

    const signOut = () => setCustomer(null);

    const placeOrder = (checkout) => {
        const id = 1000 + orders.length + 1;
        const shipping = checkout.shippingMethod?.price || 0;

        const order = {
            id,
            increment_id: String(id),
            created_at: new Date().toISOString(),
            status: 'pending',
            items: cart.items.map((item) => ({
                name: item.product.name,
                sku: item.product.sku,
                productId: item.product.id,
                price: item.price,
                quantity: item.quantity,
                total: item.total,
                options: item.options,
            })),
            sub_total: cart.subTotal,
            discount: cart.discount,
            shipping,
            tax: 0,
            grand_total: cart.grandTotal + shipping,
            shipping_method: checkout.shippingMethod?.title,
            payment_method: checkout.paymentMethod?.title,
            billing_address: checkout.billingAddress,
            shipping_address: checkout.shippingAddress || checkout.billingAddress,
        };

        setOrders((current) => [order, ...current]);
        clearCart();
        setCoupon(null);

        return order;
    };

    const value = {
        cart, addToCart, updateCartItem, removeCartItem, removeCartItems, clearCart, applyCoupon, removeCoupon,
        wishlist, setWishlist, toggleWishlist,
        compare, addToCompare, removeFromCompare, clearCompare,
        customer, setCustomer, signIn, signUp, signOut,
        addresses, setAddresses,
        orders, placeOrder,
        flashes, flash, dismissFlash,
    };

    return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export const useStore = () => useContext(StoreContext);
