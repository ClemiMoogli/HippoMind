/**
 * Success page after Stripe payment
 * Displays the license key to the user
 */

import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { stripe } from '@/lib/stripe';
import { getLicenseBySession } from '@/lib/db';

async function SuccessContent({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const params = await searchParams;
  const sessionId = params.session_id;

  if (!sessionId) {
    redirect('/');
  }

  try {
    // Retrieve the Stripe session
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== 'paid') {
      redirect('/#pricing');
    }

    // Get the license from database
    const license = await getLicenseBySession(sessionId);

    if (!license) {
      return (
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="max-w-md w-full bg-yellow-50 border border-yellow-200 rounded-lg p-8">
            <h1 className="text-2xl font-bold text-yellow-900 mb-4">
              Processing...
            </h1>
            <p className="text-yellow-700">
              Your payment was successful! Your license key is being generated.
              Please refresh this page in a few seconds or check your email.
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4">
        <div className="max-w-2xl w-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 md:p-12">
          {/* Success Icon */}
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-10 h-10 text-green-600 dark:text-green-400"
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
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold text-center mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Welcome to HippoMind! 🎉
          </h1>

          <p className="text-center text-gray-600 dark:text-gray-400 mb-8">
            Your payment was successful. Here's your license key:
          </p>

          {/* License Key */}
          <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-6 mb-8">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Your License Key
            </label>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-2xl font-mono font-bold text-center py-4 bg-white dark:bg-gray-800 rounded border-2 border-blue-500 text-blue-600 dark:text-blue-400">
                {license.key}
              </code>
              <button
                onClick={() => navigator.clipboard.writeText(license.key)}
                className="px-4 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                title="Copy to clipboard"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              </button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
              Save this key! You'll need it to activate HippoMind.
            </p>
          </div>

          {/* Instructions */}
          <div className="space-y-4 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Next Steps:
            </h2>
            <ol className="space-y-3 text-gray-700 dark:text-gray-300">
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  1
                </span>
                <span>
                  Download HippoMind for your platform (links sent to your email)
                </span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  2
                </span>
                <span>Install and launch the app</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  3
                </span>
                <span>Enter your license key when prompted</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  4
                </span>
                <span>Start creating amazing mind maps!</span>
              </li>
            </ol>
          </div>

          {/* Download Links */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6 mb-8">
            <h3 className="font-semibold mb-4 text-gray-900 dark:text-white">
              Download HippoMind:
            </h3>
            <div className="space-y-2">
              <a
                href={process.env.NEXT_PUBLIC_DOWNLOAD_MAC}
                className="block px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg hover:border-blue-500 transition-colors text-center"
              >
                <span className="font-medium">macOS</span> (Apple Silicon & Intel)
              </a>
              <a
                href={process.env.NEXT_PUBLIC_DOWNLOAD_WINDOWS}
                className="block px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg hover:border-blue-500 transition-colors text-center"
              >
                <span className="font-medium">Windows</span> (64-bit)
              </a>
              <a
                href={process.env.NEXT_PUBLIC_DOWNLOAD_LINUX}
                className="block px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg hover:border-blue-500 transition-colors text-center"
              >
                <span className="font-medium">Linux</span> (AppImage)
              </a>
            </div>
          </div>

          {/* Support */}
          <div className="text-center text-sm text-gray-600 dark:text-gray-400">
            <p>
              Need help?{' '}
              <a
                href="mailto:support@hippomind.org"
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                Contact Support
              </a>
            </p>
            <p className="mt-2">
              Email sent to: <span className="font-medium">{license.email}</span>
            </p>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error retrieving session:', error);
    redirect('/');
  }
}

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SuccessContent searchParams={searchParams} />
    </Suspense>
  );
}
