import Link from 'next/link';
import { ArrowRight, FileText, Shield, Users } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="flex-1 space-y-6">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
                AI-Enhanced Contract Lifecycle Management
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl">
                Streamline your contract management with our AI-powered platform. Upload, track, and analyze contracts with ease.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link
                  href="/login"
                  className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  Login
                  <ArrowRight size={18} />
                </Link>
                <Link
                  href="/register"
                  className="px-6 py-3 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 dark:hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                >
                  Register
                  <ArrowRight size={18} />
                </Link>
              </div>
            </div>
            <div className="flex-1 flex justify-center">
              <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 border border-gray-200 dark:border-gray-700">
                <div className="space-y-4">
                  <div className="h-2 w-24 bg-blue-600 rounded"></div>
                  <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-2 w-3/4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-2 w-1/2 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="flex justify-between items-center pt-4">
                    <div className="h-8 w-24 bg-blue-100 dark:bg-blue-900 rounded flex items-center justify-center">
                      <span className="text-xs text-blue-600 dark:text-blue-300">Draft</span>
                    </div>
                    <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">
            Key Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4">
                <FileText className="text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Smart Contract Management</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Upload and manage contracts with AI-powered analysis, extraction, and versioning.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4">
                <Shield className="text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Risk Detection</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Automatically identify and highlight risky clauses and terms in your contracts.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4">
                <Users className="text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Collaboration</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Share, comment, and collaborate on contracts with team members and stakeholders.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600 dark:bg-blue-800">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to streamline your contract management?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of companies using our AI-powered platform to manage their contracts more efficiently.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="px-6 py-3 bg-white text-blue-600 rounded-md hover:bg-blue-50 transition-colors"
            >
              Get Started
            </Link>
            <Link
              href="/login"
              className="px-6 py-3 border border-white text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Login
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-100 dark:bg-gray-900 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-gray-600 dark:text-gray-300">
                &copy; {new Date().getFullYear()} AI-Enhanced CLM Platform. All rights reserved.
              </p>
            </div>
            <div className="flex space-x-6">
              <Link href="/terms" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
                Terms
              </Link>
              <Link href="/privacy" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
                Privacy
              </Link>
              <Link href="/contact" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
