'use client';

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import { motion } from 'framer-motion';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const locale = useLocale();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg shadow-lg'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold gradient-text">
              HippoMind
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <a
              href="#features"
              className={`transition-colors ${
                scrolled
                  ? 'text-gray-700 hover:text-purple-600 dark:text-gray-300 dark:hover:text-purple-400'
                  : 'text-white hover:text-purple-200'
              }`}
            >
              Features
            </a>
            <a
              href="#pricing"
              className={`transition-colors ${
                scrolled
                  ? 'text-gray-700 hover:text-purple-600 dark:text-gray-300 dark:hover:text-purple-400'
                  : 'text-white hover:text-purple-200'
              }`}
            >
              Pricing
            </a>
            <a
              href="#downloads"
              className={`transition-colors ${
                scrolled
                  ? 'text-gray-700 hover:text-purple-600 dark:text-gray-300 dark:hover:text-purple-400'
                  : 'text-white hover:text-purple-200'
              }`}
            >
              Download
            </a>

            {/* Language Switcher */}
            <div className="flex gap-1 bg-gray-200 dark:bg-gray-700 rounded-lg p-1">
              <Link
                href="/"
                locale="en"
                className={`px-3 py-1 rounded transition-colors ${
                  locale === 'en'
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                EN
              </Link>
              <Link
                href="/"
                locale="fr"
                className={`px-3 py-1 rounded transition-colors ${
                  locale === 'fr'
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                FR
              </Link>
            </div>

            {/* CTA Button */}
            <a
              href="#downloads"
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              Get Started
            </a>
          </div>

          {/* Mobile menu button */}
          <button
            className={`md:hidden p-2 rounded-lg ${
              scrolled ? 'text-gray-700 dark:text-gray-300' : 'text-white'
            }`}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </div>
    </motion.nav>
  );
}
