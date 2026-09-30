import { Link } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { t } from '../lib/i18n';

/** Port of errors/index.blade.php for the 404 case. */
export default function NotFound({ code = 404 }) {
    return (
        <Layout title={t(`errors.${code}.title`)} hasHeader={false} hasFeature={false} hasFooter={false}>
            <div className="container absolute left-1/2 top-0 -translate-x-1/2 px-[60px] max-lg:px-8 max-sm:px-4">
                <div className="grid h-[100vh] w-full">
                    <div className="wrapper-404 max-868:!text-[294px] max-md:!text-[140px]">
                        <div className="glow-404">{code}</div>
                        <div className="glow-shadow-404">{code}</div>
                    </div>

                    <div className="absolute left-1/2 top-[74%] mt-10 -translate-x-1/2 -translate-y-1/2 text-center max-868:w-full max-md:top-[60%]">
                        <h1 className="text-3xl font-semibold max-md:text-xl">{t(`errors.${code}.title`)}</h1>
                        <p className="mt-4 text-lg text-zinc-500 max-md:text-sm">{t(`errors.${code}.description`)}</p>
                        <Link
                            to="/"
                            className="m-auto mt-8 block w-max cursor-pointer rounded-[45px] bg-navyBlue px-10 py-4 text-center text-base font-medium text-white max-sm:mb-10 max-sm:px-6 max-sm:text-sm"
                        >
                            {t('errors.go-to-home')}
                        </Link>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
