'use client';

import { useTranslations } from 'next-intl';
import { motion, useInView } from 'framer-motion';
import { useRef, useState } from 'react';

const questions = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6'];

function FAQItem({ qKey, index }: { qKey: string; index: number }) {
  const t = useTranslations('faq');
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="border-b border-gray-200 dark:border-gray-700 last:border-0"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-6 flex items-center justify-between text-left group"
      >
        <span className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
          {t(`${qKey}.question`)}
        </span>
        <svg
          className={`w-6 h-6 text-gray-500 transform transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      <motion.div
        initial={false}
        animate={{
          height: isOpen ? 'auto' : 0,
          opacity: isOpen ? 1 : 0,
        }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden"
      >
        <p className="pb-6 text-gray-600 dark:text-gray-300">
          {t(`${qKey}.answer`)}
        </p>
      </motion.div>
    </motion.div>
  );
}

export default function FAQ() {
  const t = useTranslations('faq');
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-800">
      <div className="max-w-4xl mx-auto">
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
        </motion.div>

        <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-8">
          {questions.map((qKey, index) => (
            <FAQItem key={qKey} qKey={qKey} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
