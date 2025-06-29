# Map Sharing Feature Documentation

## Overview

The map sharing feature allows users to create shareable links to their travel maps. Each user can have one active shared map at a time, which can be viewed publicly via a unique URL.

## Features

### ✅ Implemented Features

- **One Share Per User**: Simplified model where each user can have only one active shared map
- **PNG Export & Upload**: Maps are exported as PNG images and stored in Supabase Storage
- **Unique Share Codes**: 8-character alphanumeric codes for easy sharing
- **Public View Pages**: Clean, responsive pages for viewing shared maps
- **Social Media Optimization**: Open Graph and Twitter Card meta tags
- **Copy to Clipboard**: One-click link copying with visual feedback
- **Share Management**: Settings interface for managing existing shares
- **Rate Limiting**: Abuse prevention with configurable limits
- **Image Compression**: Automatic compression for large images
- **Error Handling**: Comprehensive error states and user feedback
- **Mobile Responsive**: Optimized for all screen sizes

## Architecture

### Database Schema

```sql
-- Main table for shared maps
CREATE TABLE shared_maps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  share_code VARCHAR(8) UNIQUE NOT NULL,
  image_url TEXT NOT NULL,
  title TEXT DEFAULT 'My Travel Map',
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Unique constraint ensures one active share per user
ALTER TABLE shared_maps 
ADD CONSTRAINT unique_active_share_per_user 
UNIQUE (user_id) WHERE (is_active = true);
```

### Storage Structure

```
shared-maps/
├── {user_id}/
│   └── {share_code}.png
```

### API Endpoints

- `POST /api/shares` - Create new shared map
- `GET /api/shares` - Get user's active shared map
- `DELETE /api/shares` - Delete user's active shared map
- `GET /share/[shareCode]` - Public view page

## Usage

### Creating a Share

1. User clicks the share button (floating button in bottom-right)
2. Share modal opens with title/description fields
3. User fills in details and clicks "Create Share Link"
4. System exports map as PNG, compresses if needed, uploads to storage
5. Database record created with unique share code
6. User receives shareable link

### Managing Shares

1. User clicks their email in the header
2. Settings modal opens with "Sharing" tab
3. Shows existing share details (title, creation date, view count)
4. Options to copy link, open in new tab, or remove share

### Viewing Shared Maps

1. Anyone can visit `/share/[shareCode]` URL
2. Page displays map image with metadata
3. View count automatically incremented
4. Social media preview cards generated
5. Call-to-action to create own map

## Security Features

### Rate Limiting

- **Share Creation**: 10 shares per user per day
- **API Requests**: 100 requests per 15 minutes
- **Share Views**: 60 views per minute

### Input Validation

- Share codes: 8-character alphanumeric format
- Titles: Max 100 characters
- Descriptions: Max 500 characters
- Images: PNG format only, max 50MB

### Row Level Security (RLS)

- Users can only access their own shares
- Public can view active shares only
- Automatic cleanup of inactive shares

## Performance Optimizations

### Image Compression

- Automatic compression for images >2MB
- Maintains quality while reducing file size
- Fallback to original if compression fails

### Caching

- Public pages cached for 1 hour
- Storage URLs cached by Supabase CDN
- Optimized image loading with Next.js

### Database Optimization

- Indexed share codes for fast lookups
- Efficient RLS policies
- Atomic view count increments

## Error Handling

### User-Facing Errors

- Clear error messages for all failure cases
- Toast notifications for success/error feedback
- Graceful degradation for network issues
- Retry mechanisms for transient failures

### Developer Tools

- Comprehensive error logging
- Error boundaries for React components
- Development-only error details
- Rate limit headers for debugging

## File Structure

```
├── app/
│   ├── api/shares/
│   │   ├── route.ts                 # Main API endpoints
│   │   └── [shareCode]/route.ts     # Individual share operations
│   └── share/[shareCode]/
│       ├── page.tsx                 # Public view page
│       ├── loading.tsx              # Loading skeleton
│       └── not-found.tsx            # 404 page
├── components/
│   ├── share-modal.tsx              # Share creation modal
│   ├── settings-modal.tsx           # Share management
│   ├── public-share-view.tsx        # Public view component
│   ├── error-boundary.tsx           # Error handling
│   └── toast-provider.tsx           # Toast notifications
├── hooks/
│   ├── useMapExport.ts              # Map export functionality
│   └── useShareManagement.ts        # Share CRUD operations
├── lib/
│   ├── share-utils.ts               # Share utilities
│   ├── image-utils.ts               # Image compression
│   └── rate-limit.ts                # Rate limiting
└── sql/
    ├── 01_create_shared_maps_table.sql
    ├── 02_create_storage_bucket.sql
    ├── 03_helper_functions.sql
    └── 04_update_single_share_constraint.sql
```

## Setup Instructions

### 1. Database Setup

Run the SQL files in order in your Supabase SQL Editor:

```bash
sql/01_create_shared_maps_table.sql
sql/02_create_storage_bucket.sql
sql/03_helper_functions.sql
sql/04_update_single_share_constraint.sql
```

### 2. Environment Variables

No additional environment variables required - uses existing Supabase configuration.

### 3. Dependencies

All dependencies are already included in the project's package.json.

## Monitoring & Analytics

### Key Metrics

- Share creation rate
- Share view count
- Error rates
- Storage usage
- Rate limit hits

### Logging

- All API requests logged
- Error tracking with context
- Performance metrics
- User behavior analytics

## Future Enhancements

### Potential Features

- **Custom Domains**: Branded share URLs
- **Expiration Dates**: Auto-expiring shares
- **Password Protection**: Private shares with passwords
- **Analytics Dashboard**: Detailed sharing statistics
- **Bulk Operations**: Multiple share management
- **Social Integration**: Direct sharing to platforms

### Technical Improvements

- **Redis Caching**: Distributed rate limiting
- **CDN Integration**: Faster image delivery
- **Background Jobs**: Async image processing
- **Webhooks**: Share event notifications

## Troubleshooting

### Common Issues

1. **Share creation fails**: Check rate limits and image size
2. **Images not loading**: Verify storage bucket permissions
3. **404 on shared links**: Confirm share code format and active status
4. **Slow loading**: Check image compression and CDN

### Debug Tools

- Rate limit headers in API responses
- Error details in development mode
- Browser network tab for request debugging
- Supabase dashboard for database inspection

## Support

For issues or questions about the sharing feature:

1. Check the error messages and logs
2. Verify database setup and permissions
3. Test with different browsers/devices
4. Review rate limiting configuration