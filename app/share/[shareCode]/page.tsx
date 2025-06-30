import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/types/database';
import { validateShareCode, getShareUrl } from '@/lib/share-utils';
import { PublicShareView } from '@/components/public-share-view';

interface PageProps {
  params: Promise<{
    shareCode: string;
  }>;
}

async function getSharedMap(shareCode: string) {
  const supabase = createServerComponentClient<Database>({ cookies });

  const { data: share, error } = await supabase
    .from('shared_maps')
    .select('*')
    .eq('share_code', shareCode)
    .eq('is_active', true)
    .single();

  if (error || !share) {
    return null;
  }

  // Increment view count
  await supabase.rpc('increment_share_view_count', { 
    share_code_param: shareCode 
  });

  return share;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { shareCode } = await params;

  if (!validateShareCode(shareCode)) {
    return {
      title: 'Invalid Share Code - Traveled',
      description: 'The shared travel map you\'re looking for could not be found.',
    };
  }

  const share = await getSharedMap(shareCode);

  if (!share) {
    return {
      title: 'Travel Map Not Found - Traveled',
      description: 'The shared travel map you\'re looking for could not be found.',
    };
  }

  const shareUrl = getShareUrl(shareCode);
  const title = `${share.title} - Shared Travel Map`;
  const description = share.description || 
    `Check out this travel map showing visited regions in Japan. Created with Traveled.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: shareUrl,
      siteName: 'Traveled',
      images: [
        {
          url: share.image_url,
          width: 1200,
          height: 630,
          alt: share.title,
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [share.image_url],
    },
    robots: {
      index: true,
      follow: true,
    },
    alternates: {
      canonical: shareUrl,
    },
  };
}

export default async function SharePage({ params }: PageProps) {
  const { shareCode } = await params;

  // Validate share code format
  if (!validateShareCode(shareCode)) {
    notFound();
  }

  // Get shared map data
  const share = await getSharedMap(shareCode);

  if (!share) {
    notFound();
  }

  return <PublicShareView share={share} />;
}

export const revalidate = 3600; // Revalidate every hour