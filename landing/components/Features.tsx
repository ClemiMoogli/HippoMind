'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';

const features = [
  {
    key: 'offline',
    icon: '🔒',
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    key: 'performance',
    icon: '⚡',
    gradient: 'from-yellow-500 to-orange-500',
  },
  {
    key: 'privacy',
    icon: '🛡️',
    gradient: 'from-purple-500 to-pink-500',
  },
  {
    key: 'themes',
    icon: '🎨',
    gradient: 'from-green-500 to-teal-500',
  },
  {
    key: 'autosave',
    icon: '💾',
    gradient: 'from-indigo-500 to-blue-500',
  },
  {
    key: 'shortcuts',
    icon: '⌨️',
    gradient: 'from-red-500 to-pink-500',
  },
  {
    key: 'multilingual',
    icon: '🌍',
    gradient: 'from-blue-500 to-purple-500',
  },
  {
    key: 'unlimited',
    icon: '↩️',
    gradient: 'from-pink-500 to-rose-500',
  },
  {
    key: 'dragdrop',
    icon: '✋',
    gradient: 'from-cyan-500 to-blue-500',
  },
];

function FeatureCard({ feature, index }: { feature: typeof features[0]; index: number }) {
  const t = useTranslations('features');
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="relative group"
    >
      <div className="h-full p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
        <div
          className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${feature.gradient} mb-4 text-3xl`}
        >
          {feature.icon}
        </div>
        <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
          {t(`${feature.key}.title`)}
        </h3>
        <p className="text-gray-600 dark:text-gray-300">
          {t(`${feature.key}.description`)}
        </p>

        {/* Hover gradient effect */}
        <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
      </div>
    </motion.div>
  );
}

export default function Features() {
  const t = useTranslations('features');
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
            {t('title')}
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            {t('subtitle')}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard key={feature.key} feature={feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
