import { Navigate, Route, Routes } from 'react-router-dom';
import { ProductOrCategory, Search } from './pages/Catalog';
import Cart from './pages/checkout/Cart';
import Checkout from './pages/checkout/Checkout';
import Success from './pages/checkout/Success';
import {
    AccountIndex, AddressEdit, Addresses, Downloads, Gdpr, OrderView, Orders, Profile, ProfileEdit, Reviews, Rma, Wishlist,
} from './pages/customers/Account';
import { ForgotPassword, ResetPassword, SignIn, SignUp } from './pages/customers/Auth';
import Home from './pages/Home';
import NotFound from './pages/NotFound';
import { CmsPage, Compare, ContactUs } from './pages/Pages';

/** Routes mirror the Bagisto storefront URLs so links can be shared 1:1 with the real store. */
export default function App() {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<Search />} />
            <Route path="/compare" element={<Compare />} />
            <Route path="/contact-us" element={<ContactUs />} />
            <Route path="/page/:slug" element={<CmsPage />} />

            <Route path="/checkout/cart" element={<Cart />} />
            <Route path="/checkout/onepage" element={<Checkout />} />
            <Route path="/checkout/onepage/success" element={<Success />} />

            <Route path="/customer/login" element={<SignIn />} />
            <Route path="/customer/register" element={<SignUp />} />
            <Route path="/customer/forgot-password" element={<ForgotPassword />} />
            <Route path="/customer/reset-password" element={<ResetPassword />} />

            <Route path="/customer/account" element={<AccountIndex />} />
            <Route path="/customer/account/profile" element={<Profile />} />
            <Route path="/customer/account/profile/edit" element={<ProfileEdit />} />
            <Route path="/customer/account/addresses" element={<Addresses />} />
            <Route path="/customer/account/addresses/create" element={<AddressEdit />} />
            <Route path="/customer/account/addresses/edit/:id" element={<AddressEdit />} />
            <Route path="/customer/account/orders" element={<Orders />} />
            <Route path="/customer/account/orders/view/:id" element={<OrderView />} />
            <Route path="/customer/account/downloadable-products" element={<Downloads />} />
            <Route path="/customer/account/reviews" element={<Reviews />} />
            <Route path="/customer/account/wishlist" element={<Wishlist />} />
            <Route path="/customer/account/gdpr" element={<Gdpr />} />
            <Route path="/customer/account/rma" element={<Rma />} />
            <Route path="/customer/account/*" element={<Navigate to="/customer/account" replace />} />

            <Route path="/:slug" element={<ProductOrCategory />} />
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
}
