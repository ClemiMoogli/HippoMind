'use client';

import { useTranslations, useLocale } from 'next-intl';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

export default function Pricing() {
  const t = useTranslations('pricing');
  const locale = useLocale();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  const price = locale === 'fr' ? t('priceEur') : t('price');
  const features = [
    t('features.0'),
    t('features.1'),
    t('features.2'),
    t('features.3'),
    t('features.4'),
    t('features.5'),
  ];

  return (
    <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <div className="max-w-7xl mx-auto">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">
            {t('title')}
          </h2>
          <p className="text-xl text-gray-300">
            {t('subtitle')}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 items-start max-w-5xl mx-auto">
          {/* Pricing Card */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl blur-xl opacity-30" />
            <div className="relative bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 md:p-10">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
                  {t('lifetime')}
                </h3>
                <div className="flex items-baseline justify-center gap-2">
                  <span className="text-6xl font-bold gradient-text">
                    {price}
                  </span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                  {t('priceNote')}
                </p>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  {t('subtitle')}
                </p>
              </div>

              <ul className="space-y-4 mb-8">
                {features.map((feature, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                    transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                    className="flex items-start gap-3"
                  >
                    <svg
                      className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span className="text-gray-700 dark:text-gray-300">
                      {feature}
                    </span>
                  </motion.li>
                ))}
              </ul>

              <a
                href={process.env.NEXT_PUBLIC_GUMROAD_URL || '#downloads'}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full py-4 px-6 text-center bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                {t('cta')}
              </a>
            </div>
          </motion.div>

          {/* Comparison Table */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20"
          >
            <h3 className="text-2xl font-bold mb-6 text-white text-center">
              {t('comparison.title')}
            </h3>

            <div className="space-y-6">
              {/* Price */}
              <div className="flex justify-between items-center pb-4 border-b border-white/10">
                <div>
                  <p className="text-white font-semibold">HippoMind</p>
                  <p className="text-green-400 text-lg font-bold">{price}</p>
                </div>
                <div className="text-right">
                  <p className="text-gray-400 font-semibold">{t('comparison.others')}</p>
                  <p className="text-gray-400">{t('comparison.perMonth')}</p>
                </div>
              </div>

              {/* Features comparison */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">{t('comparison.subscription')}</span>
                  <div className="flex gap-8">
                    <span className="text-red-400 text-xl">✗</span>
                    <span className="text-green-400 text-xl">✓</span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-300">{t('comparison.cloud')}</span>
                  <div className="flex gap-8">
                    <span className="text-red-400 text-xl">✗</span>
                    <span className="text-green-400 text-xl">✓</span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-300">{t('comparison.tracking')}</span>
                  <div className="flex gap-8">
                    <span className="text-red-400 text-xl">✗</span>
                    <span className="text-green-400 text-xl">✓</span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-300">{t('comparison.internet')}</span>
                  <div className="flex gap-8">
                    <span className="text-red-400 text-xl">✗</span>
                    <span className="text-green-400 text-xl">✓</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
