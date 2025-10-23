'use client';

import { useTranslations } from 'next-intl';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

const platforms = [
  {
    name: 'mac',
    icon: (
      <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
      </svg>
    ),
  },
  {
    name: 'windows',
    icon: (
      <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
        <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.9-1.801" />
      </svg>
    ),
  },
  {
    name: 'linux',
    icon: (
      <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12.504 0c-.155 0-.315.008-.48.021-4.226.333-3.105 4.807-3.17 6.298-.076 1.092-.3 1.953-1.05 3.02-.885 1.051-2.127 2.75-2.716 4.521-.278.84-.41 1.738-.348 2.665.136 1.877.767 3.415 1.67 4.352.814.821 1.721 1.078 2.485 1.078.254 0 .483-.032.69-.09 1.011-.276 1.638-1.082 1.911-2.456.19-.959.366-2.118.718-3.275.357-1.174.793-2.357 1.42-3.475.626-1.118 1.443-2.17 2.501-3.037 1.038-.853 2.266-1.504 3.694-1.504.17 0 .341.01.513.028 1.643.173 2.989.925 3.884 2.181.895 1.255 1.34 2.907 1.34 4.923 0 2.016-.445 3.668-1.34 4.923-.895 1.256-2.241 2.008-3.884 2.181-.172.018-.343.028-.513.028-1.428 0-2.656-.651-3.694-1.504-1.058-.867-1.875-1.919-2.501-3.037-.627-1.118-1.063-2.301-1.42-3.475-.352-1.157-.528-2.316-.718-3.275-.273-1.374-.9-2.18-1.911-2.456-.207-.058-.436-.09-.69-.09-.764 0-1.671.257-2.485 1.078-.903.937-1.534 2.475-1.67 4.352-.062.927.07 1.825.348 2.665.589 1.771 1.831 3.47 2.716 4.521.75 1.067.974 1.928 1.05 3.02.065 1.491-1.056 5.965-3.17 6.298-.165.013-.325.021-.48.021-1.615 0-3.403-.742-4.848-2.135C1.414 22.397.5 20.256.5 17.502c0-2.754.914-4.895 2.359-6.262 1.445-1.393 3.233-2.135 4.848-2.135.155 0 .315.008.48.021 2.114.333 3.235 4.807 3.17 6.298-.076 1.092-.3 1.953-1.05 3.02-.885 1.051-2.127 2.75-2.716 4.521-.278.84-.41 1.738-.348 2.665.136 1.877.767 3.415 1.67 4.352.814.821 1.721 1.078 2.485 1.078.254 0 .483-.032.69-.09 1.011-.276 1.638-1.082 1.911-2.456.19-.959.366-2.118.718-3.275.357-1.174.793-2.357 1.42-3.475.626-1.118 1.443-2.17 2.501-3.037 1.038-.853 2.266-1.504 3.694-1.504.17 0 .341.01.513.028 1.643.173 2.989.925 3.884 2.181.895 1.255 1.34 2.907 1.34 4.923 0 2.016-.445 3.668-1.34 4.923-.895 1.256-2.241 2.008-3.884 2.181-.172.018-.343.028-.513.028-1.428 0-2.656-.651-3.694-1.504z" />
      </svg>
    ),
  },
];

export default function Downloads() {
  const t = useTranslations('downloads');
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <section id="downloads" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900">
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

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {platforms.map((platform, index) => (
            <motion.a
              key={platform.name}
              href={`#download-${platform.name}`}
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
            >
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 mb-6 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                  {platform.icon}
                </div>

                <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
                  {t(platform.name)}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {t(`${platform.name}Description`)}
                </p>

                <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg group-hover:shadow-lg transition-all">
                  <span>Download</span>
                  <svg
                    className="w-5 h-5 transform group-hover:translate-y-1 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
                    />
                  </svg>
                </div>
              </div>

              {/* Hover gradient effect */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
            </motion.a>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-12 text-center"
        >
          <p className="text-gray-600 dark:text-gray-400">
            Version 1.0.0 • Released October 2025
          </p>
        </motion.div>
      </div>
    </section>
  );
}
