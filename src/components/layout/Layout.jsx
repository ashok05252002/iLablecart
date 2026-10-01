import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { FlashGroup } from '../ui';
import Footer, { Services } from './Footer';
import Header from './Header';

/**
 * Port of components/layouts/index.blade.php.
 * hasHeader / hasFeature / hasFooter mirror the Blade props of the same name.
 */
export default function Layout({ children, title, hasHeader = true, hasFeature = true, hasFooter = true }) {
    const { pathname } = useLocation();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);

    useEffect(() => {
        document.title = title || 'Sainmarks';
    }, [title]);

    return (
        <div id="app">
            <a href="#main" className="skip-to-main-content-link">
                Skip to main content
            </a>

            <FlashGroup />

            {hasHeader && <Header />}

            <main id="main" className="bg-white">
                {children}
            </main>

            {hasFeature && <Services />}

            {hasFooter && <Footer />}
        </div>
    );
}
