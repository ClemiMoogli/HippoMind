'use client';

import { useTranslations } from 'next-intl';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { useRef } from 'react';

export default function Demo() {
  const t = useTranslations('demo');
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true });

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0, 1, 0]);

  return (
    <section ref={containerRef} className="relative py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-900 to-gray-800 overflow-hidden">
      {/* Parallax background */}
      <motion.div
        className="absolute inset-0 opacity-20"
        style={{ y }}
      >
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500 rounded-full filter blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500 rounded-full filter blur-3xl" />
      </motion.div>

      <div className="relative z-10 max-w-7xl mx-auto">
        <motion.div
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

        {/* Demo mockup */}
        <motion.div
          style={{ opacity, y }}
          className="relative max-w-5xl mx-auto"
        >
          <div className="relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl overflow-hidden border border-gray-700">
            {/* Browser chrome */}
            <div className="bg-gray-800 border-b border-gray-700 px-4 py-3 flex items-center gap-2">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
              </div>
              <div className="flex-1 text-center text-sm text-gray-400">
                HippoMind - Mind Mapping
              </div>
            </div>

            {/* App preview - Placeholder */}
            <div className="aspect-video bg-gradient-to-br from-purple-900/20 to-blue-900/20 flex items-center justify-center relative">
              {/* Animated nodes mockup */}
              <svg className="w-full h-full" viewBox="0 0 800 450">
                {/* Central node */}
                <motion.g
                  initial={{ opacity: 0, scale: 0 }}
                  animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <circle cx="400" cy="225" r="50" fill="url(#gradient1)" />
                  <text
                    x="400"
                    y="230"
                    textAnchor="middle"
                    fill="white"
                    fontSize="16"
                    fontWeight="bold"
                  >
                    Main Idea
                  </text>
                </motion.g>

                {/* Connected nodes */}
                {[
                  { x: 250, y: 150, delay: 0.4, text: 'Node 1' },
                  { x: 550, y: 150, delay: 0.5, text: 'Node 2' },
                  { x: 250, y: 300, delay: 0.6, text: 'Node 3' },
                  { x: 550, y: 300, delay: 0.7, text: 'Node 4' },
                ].map((node, i) => (
                  <motion.g
                    key={i}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
                    transition={{ duration: 0.4, delay: node.delay }}
                  >
                    <line
                      x1="400"
                      y1="225"
                      x2={node.x}
                      y2={node.y}
                      stroke="url(#gradient2)"
                      strokeWidth="2"
                      opacity="0.5"
                    />
                    <circle cx={node.x} cy={node.y} r="35" fill="url(#gradient3)" />
                    <text
                      x={node.x}
                      y={node.y + 5}
                      textAnchor="middle"
                      fill="white"
                      fontSize="14"
                    >
                      {node.text}
                    </text>
                  </motion.g>
                ))}

                {/* Gradients */}
                <defs>
                  <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#667eea" />
                    <stop offset="100%" stopColor="#764ba2" />
                  </linearGradient>
                  <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#667eea" />
                    <stop offset="100%" stopColor="#764ba2" />
                  </linearGradient>
                  <linearGradient id="gradient3" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#4facfe" />
                    <stop offset="100%" stopColor="#00f2fe" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>

          {/* Floating elements */}
          <motion.div
            className="absolute -top-4 -right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg font-semibold"
            animate={{
              y: [0, -10, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            60 FPS
          </motion.div>

          <motion.div
            className="absolute -bottom-4 -left-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg font-semibold"
            animate={{
              y: [0, 10, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 1,
            }}
          >
            100% Offline
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
