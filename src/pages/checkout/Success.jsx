import { Link, useLocation } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import { t } from '../../lib/i18n';
import { useStore } from '../../store/StoreContext';

/** Port of checkout/success.blade.php. */
export default function Success() {
    const { state } = useLocation();
    const { customer, orders } = useStore();
    const orderId = state?.orderId || orders[0]?.increment_id || '1001';
    const [before, after] = t('checkout.success.order-id-info', { order_id: '__ID__' }).split('__ID__');

    return (
        <Layout title={t('checkout.success.thanks')} hasFeature={false}>
            <div className="container mt-8 px-[60px] max-lg:px-8">
                <div className="grid place-items-center gap-y-5 max-md:gap-y-2.5">
                    <img className="max-md:h-[100px] max-md:w-[100px]" src="/images/thank-you.png" alt={t('checkout.success.thanks')} title={t('checkout.success.thanks')} />

                    <p className="text-xl max-md:text-sm">
                        {before}
                        {customer ? (
                            <Link className="text-blue-700" to={`/customer/account/orders/view/${orderId}`}>
                                {orderId}
                            </Link>
                        ) : (
                            orderId
                        )}
                        {after}
                    </p>

                    <p className="font-medium md:text-2xl">{t('checkout.success.thanks')}</p>

                    <p className="text-xl text-zinc-500 max-md:text-center max-md:text-xs">{t('checkout.success.info')}</p>

                    <Link to="/">
                        <div className="w-max cursor-pointer rounded-2xl bg-navyBlue px-11 py-3 text-center text-base font-medium text-white max-md:rounded-lg max-md:px-6 max-md:py-1.5">
                            {t('checkout.cart.index.continue-shopping')}
                        </div>
                    </Link>
                </div>
            </div>
        </Layout>
    );
}
