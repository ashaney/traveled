import Link from 'next/link';
import { MapPin } from 'lucide-react';

export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200/60 dark:border-gray-700/60">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <MapPin className="h-6 w-6 text-blue-600" />
              <span className="text-xl font-bold text-gray-900 dark:text-gray-100">Traveled</span>
            </Link>
            
            <div className="flex items-center gap-3">
              <div className="hidden sm:block w-24 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              <div className="w-32 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Title and Description Skeleton */}
        <div className="text-center mb-8">
          <div className="w-80 h-10 bg-gray-200 dark:bg-gray-700 rounded mx-auto mb-4 animate-pulse"></div>
          <div className="w-96 h-6 bg-gray-200 dark:bg-gray-700 rounded mx-auto mb-2 animate-pulse"></div>
          <div className="w-64 h-6 bg-gray-200 dark:bg-gray-700 rounded mx-auto animate-pulse"></div>
          
          {/* Metadata Skeleton */}
          <div className="flex items-center justify-center gap-6 mt-6">
            <div className="w-32 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            <div className="w-20 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          </div>
        </div>

        {/* Map Image Skeleton */}
        <div className="mb-8 overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg">
          <div className="aspect-[4/3] bg-gray-200 dark:bg-gray-700 animate-pulse flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>

        {/* Mobile Button Skeleton */}
        <div className="sm:hidden mb-8">
          <div className="w-full h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        </div>

        {/* CTA Skeleton */}
        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="p-8 text-center">
            <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded mx-auto mb-4 animate-pulse"></div>
            <div className="w-64 h-8 bg-gray-200 dark:bg-gray-700 rounded mx-auto mb-2 animate-pulse"></div>
            <div className="w-80 h-6 bg-gray-200 dark:bg-gray-700 rounded mx-auto mb-6 animate-pulse"></div>
            <div className="w-40 h-10 bg-gray-200 dark:bg-gray-700 rounded mx-auto animate-pulse"></div>
          </div>
        </div>

        {/* Footer Skeleton */}
        <footer className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700 text-center">
          <div className="w-32 h-4 bg-gray-200 dark:bg-gray-700 rounded mx-auto animate-pulse"></div>
        </footer>
      </main>
    </div>
  );
}