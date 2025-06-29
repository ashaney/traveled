'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Copy, Check, Eye, Calendar, ArrowRight } from 'lucide-react';
import { copyToClipboard, getShareUrl } from '@/lib/share-utils';

interface SharedMap {
  id: string;
  share_code: string;
  image_url: string;
  title: string;
  description: string | null;
  view_count: number;
  created_at: string;
}

interface PublicShareViewProps {
  share: SharedMap;
}

export function PublicShareView({ share }: PublicShareViewProps) {
  const [copied, setCopied] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  const handleCopyLink = async () => {
    const shareUrl = getShareUrl(share.share_code);
    const success = await copyToClipboard(shareUrl);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200/60 dark:border-gray-700/60 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <MapPin className="h-6 w-6 text-blue-600" />
              <span className="text-xl font-bold text-gray-900 dark:text-gray-100">Traveled</span>
            </Link>
            
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyLink}
                className="hidden sm:flex"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 mr-2 text-green-600" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Link
                  </>
                )}
              </Button>
              
              <Link href="/">
                <Button size="sm">
                  Create Your Map
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Title and Description */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            {share.title}
          </h1>
          
          {share.description && (
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
              {share.description}
            </p>
          )}
          
          {/* Metadata */}
          <div className="flex items-center justify-center gap-6 mt-6 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>Created {formatDate(share.created_at)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              <span>{share.view_count} views</span>
            </div>
          </div>
        </div>

        {/* Map Image */}
        <Card className="mb-8 overflow-hidden shadow-lg">
          <CardContent className="p-0">
            <div className="relative bg-gray-100 dark:bg-gray-800">
              {imageLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              )}
              
              {imageError ? (
                <div className="aspect-[4/3] flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                  <div className="text-center">
                    <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500 dark:text-gray-400">Failed to load map image</p>
                  </div>
                </div>
              ) : (
                <Image
                  src={share.image_url}
                  alt={share.title}
                  width={1200}
                  height={900}
                  className={`w-full h-auto transition-opacity duration-300 ${
                    imageLoading ? 'opacity-0' : 'opacity-100'
                  }`}
                  onLoad={() => setImageLoading(false)}
                  onError={() => {
                    setImageLoading(false);
                    setImageError(true);
                  }}
                  priority
                />
              )}
            </div>
          </CardContent>
        </Card>

        {/* Mobile Copy Button */}
        <div className="sm:hidden mb-8">
          <Button
            variant="outline"
            onClick={handleCopyLink}
            className="w-full"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 mr-2 text-green-600" />
                Link Copied!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-2" />
                Copy Share Link
              </>
            )}
          </Button>
        </div>

        {/* Call to Action */}
        <Card className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 border-blue-200 dark:border-blue-800">
          <CardContent className="p-8 text-center">
            <MapPin className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Create Your Own Travel Map
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
              Track your travels across Japan and share your journey with friends and family.
            </p>
            <Link href="/">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                Get Started Free
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Footer */}
        <footer className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700 text-center">
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