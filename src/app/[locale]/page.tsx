'use client';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function Home() {
  const t = useTranslations();
  const params = useParams();
  const locale = params.locale as string;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mb-4">
            <div className="w-24 h-24 bg-utBlue rounded-full mx-auto flex items-center justify-center text-white text-2xl font-bold">
              UT
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {t('title')}
          </h1>
          <p className="text-lg text-utBlue mb-2">
            {t('subtitle')}
          </p>
          <p className="text-gray-600">
            {t('institution')}
          </p>
        </div>

        {/* Language Switcher */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg p-1 shadow-md">
            <Link 
              href="/fa" 
              className={`px-4 py-2 rounded-md transition-colors $\{locale === 'fa' ? 'bg-utBlue text-white' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              فارسی
            </Link>
            <Link 
              href="/en"
              className={`px-4 py-2 rounded-md transition-colors $\{locale === 'en' ? 'bg-utBlue text-white' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              English
            </Link>
          </div>
        </div>

        {/* Description */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <div className="prose max-w-none text-justify leading-relaxed">
              <p className="text-gray-700 mb-6">
                {t('description')}
              </p>
              <div className="bg-blue-50 p-6 rounded-lg mb-6">
                <h3 className="text-lg font-semibold text-utBlue mb-3">
                  {t('scale.title')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <strong>1:</strong> {t('scale.values.1')}<br/>
                    <strong>3:</strong> {t('scale.values.3')}<br/>
                    <strong>5:</strong> {t('scale.values.5')}
                  </div>
                  <div>
                    <strong>7:</strong> {t('scale.values.7')}<br/>
                    <strong>9:</strong> {t('scale.values.9')}
                  </div>
                  <div className="text-gray-600">
                    <strong>2, 4, 6, 8:</strong> مقادیر میانی<br/>
                    <strong>1/2, 1/3, ...</strong> برای حالت پست‌تر
                  </div>
                </div>
              </div>
              <p className="text-gray-700">
                {t('instructions')}
              </p>
            </div>
          </div>

          {/* Start Button */}
          <div className="text-center">
            <Link 
              href={`/${locale}/survey`}
              className="inline-flex items-center px-8 py-4 bg-utBlue text-white text-lg font-semibold rounded-lg hover:opacity-90 transition-opacity shadow-lg"
            >
              {t('start')}
              <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 text-center text-gray-500 text-sm">
          <p>© 2025 موسسه ژئوفیزیک دانشگاه تهران - Institute of Geophysics, University of Tehran</p>
        </div>
      </div>
    </div>
  );
}