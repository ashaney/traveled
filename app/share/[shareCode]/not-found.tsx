import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, ArrowLeft, Home } from 'lucide-react';

export default function NotFound() {
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
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Card className="text-center">
          <CardContent className="p-12">
            <div className="mb-6">
              <MapPin className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Travel Map Not Found
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                The shared travel map you&apos;re looking for doesn&apos;t exist or has been removed.
              </p>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                This could happen if:
              </p>
              <ul className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
                <li>• The share code is incorrect</li>
                <li>• The map has been unshared by its owner</li>
                <li>• The link has expired</li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-8 justify-center">
              <Button variant="outline" onClick={() => window.history.back()}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </Button>
              <Link href="/">
                <Button>
                  <Home className="h-4 w-4 mr-2" />
                  Create Your Own Map
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <footer className="mt-12 pt-8 text-center">
          <div className="flex items-center justify-center gap-2 text-gray-500 dark:text-gray-400">
            <span>Powered by</span>
            <Link href="/" className="flex items-center gap-1 hover:text-blue-600 transition-colors">
              <MapPin className="h-4 w-4" />
              <span className="font-medium">Traveled</span>
            </Link>
          </div>
        </footer>
      </main>
    </div>
  );
}