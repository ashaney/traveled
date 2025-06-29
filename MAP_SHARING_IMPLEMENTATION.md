# Map Sharing Feature Implementation Plan

## Overview
Implement a comprehensive map sharing system that allows users to generate shareable links to their travel map images. Users can create, manage, and revoke shared links through an intuitive interface.

## 🎯 Core User Flow
1. User clicks "Share" button in header
2. System generates map PNG and uploads to Supabase Storage
3. Share modal displays with shortened link and copy functionality
4. Recipients can view shared map via public link
5. Users can manage/revoke shared links via settings modal

## 🗄️ Database Schema

### New Table: `shared_maps`
```sql
-- Create shared_maps table
CREATE TABLE shared_maps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  share_code VARCHAR(8) UNIQUE NOT NULL,
  image_url TEXT NOT NULL, -- Supabase Storage URL
  title TEXT DEFAULT 'My Travel Map',
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for fast lookups
CREATE INDEX idx_shared_maps_share_code ON shared_maps(share_code);
CREATE INDEX idx_shared_maps_user_id ON shared_maps(user_id);

-- Enable RLS
ALTER TABLE shared_maps ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own shared maps" ON shared_maps
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create shared maps" ON shared_maps
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own shared maps" ON shared_maps
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own shared maps" ON shared_maps
  FOR DELETE USING (auth.uid() = user_id);

-- Public access for viewing shared maps (no auth required)
CREATE POLICY "Anyone can view active shared maps" ON shared_maps
  FOR SELECT USING (is_active = true);
```

### Storage Bucket Configuration
```sql
-- Create storage bucket for shared map images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('shared-maps', 'shared-maps', true);

-- Storage policies
CREATE POLICY "Authenticated users can upload shared maps" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'shared-maps' AND 
    auth.role() = 'authenticated'
  );

CREATE POLICY "Anyone can view shared map images" ON storage.objects
  FOR SELECT USING (bucket_id = 'shared-maps');

CREATE POLICY "Users can delete their own shared maps" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'shared-maps' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );
```

## 🛠️ API Routes

### `/app/api/shares/route.ts`
```typescript
// POST /api/shares - Create new shared map
// GET /api/shares - List user's shared maps
export async function POST(request: Request) {
  // 1. Authenticate user
  // 2. Generate unique 8-character share code
  // 3. Generate map PNG using existing useMapExport hook
  // 4. Upload image to Supabase Storage: shared-maps/{user_id}/{share_code}.png
  // 5. Create database record
  // 6. Return share URL and metadata
}

export async function GET(request: Request) {
  // Return user's shared maps with metadata
}
```

### `/app/api/shares/[shareCode]/route.ts`
```typescript
// GET /api/shares/[shareCode] - Get shared map data
// DELETE /api/shares/[shareCode] - Revoke shared map
export async function GET(request: Request, { params }: { params: { shareCode: string } }) {
  // 1. Validate share code format
  // 2. Fetch shared map data (increment view_count)
  // 3. Return image URL and metadata
}

export async function DELETE(request: Request, { params }: { params: { shareCode: string } }) {
  // 1. Authenticate user
  // 2. Verify ownership
  // 3. Delete from storage and database
  // 4. Return success status
}
```

## 🎨 Frontend Components

### 1. Share Button (Header Integration)
**Location**: `components/page-nav.tsx`
```typescript
// Add share button next to user menu
<Button 
  variant="outline" 
  size="sm" 
  onClick={() => setShowShareModal(true)}
  className="gap-2"
>
  <Share2 className="h-4 w-4" />
  Share
</Button>
```

### 2. Share Modal Component
**New File**: `components/share-modal.tsx`
```typescript
interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Features:
// - Generate share link on open
// - Loading state during image generation/upload
// - Copy to clipboard functionality
// - Share link preview
// - Success/error states
// - Optional title/description fields
```

### 3. Settings Modal Enhancement
**Update**: `components/settings-modal.tsx` (new file)
```typescript
// Triggered by clicking user email in header
// Tabs: Profile, Shared Maps, Privacy
// Shared Maps tab shows:
// - List of active shared links
// - View count for each
// - Created date
// - Revoke button
// - Quick copy functionality
```

### 4. Public Share View Page
**New File**: `app/share/[shareCode]/page.tsx`
```typescript
// Public page for viewing shared maps
// Features:
// - Display shared map image
// - Show title/description if provided
// - Attribution to original user (optional)
// - "Create your own map" CTA
// - Social meta tags for link previews
// - Mobile-responsive design
```

## 🔧 Utility Functions & Hooks

### 1. Share Code Generation
**New File**: `lib/share-utils.ts`
```typescript
export function generateShareCode(): string {
  // Generate 8-character alphanumeric code
  // Exclude confusing characters (0, O, I, l)
  // Ensure uniqueness check against database
}

export function validateShareCode(code: string): boolean {
  // Validate format and length
}
```

### 2. Enhanced Map Export Hook
**Update**: `hooks/useMapExport.ts`
```typescript
// Add uploadToStorage option
export function useMapExport() {
  const exportAndUpload = async (shareCode: string) => {
    // 1. Generate PNG using existing logic
    // 2. Upload to Supabase Storage
    // 3. Return storage URL
  };
  
  return { exportAndUpload, ...existing };
}
```

### 3. Share Management Hook
**New File**: `hooks/useShareManagement.ts`
```typescript
export function useShareManagement() {
  const createShare = async (title?: string, description?: string) => {
    // Call API to create new share
  };
  
  const getUserShares = async () => {
    // Fetch user's shared maps
  };
  
  const revokeShare = async (shareCode: string) => {
    // Delete shared map
  };
  
  return { createShare, getUserShares, revokeShare };
}
```

## 📱 UI/UX Implementation Details

### Share Button Placement
- **Location**: Header, next to user menu
- **Icon**: Share2 from Lucide React
- **Style**: Outline variant, consistent with existing buttons
- **Responsive**: Hide text on mobile, show icon only

### Share Modal Design
- **Trigger**: Share button click
- **Layout**: Centered modal with backdrop
- **Content**: 
  - Loading state during generation
  - Generated link with copy button
  - Optional title/description fields
  - Success confirmation
- **Actions**: Copy link, Close, Advanced settings

### Settings Modal Integration
- **Trigger**: Click user email in header
- **Tabs**: Profile, Shared Maps, Privacy
- **Shared Maps Tab**:
  - Table/list of shared links
  - Columns: Title, Created, Views, Actions
  - Actions: Copy link, Revoke, Edit

### Public Share Page
- **URL**: `/share/[shareCode]`
- **Layout**: Clean, minimal design
- **Content**: Large map image, title, attribution
- **CTA**: "Create your own travel map" button
- **Meta**: Open Graph tags for social sharing

## 🔒 Security & Privacy Considerations

### Rate Limiting
- **Share Creation**: Max 10 shares per user per day
- **API Calls**: Standard rate limiting on all endpoints
- **Storage**: 50MB limit per user for shared images

### Privacy Controls
- **Default**: Maps shared without personal information
- **Options**: Include/exclude visit notes, ratings
- **Revocation**: Immediate link deactivation
- **Expiration**: Optional auto-expiry (30/90 days)

### Data Protection
- **Storage**: Images stored in public bucket but with unguessable URLs
- **Cleanup**: Automated cleanup of revoked shares
- **Analytics**: Basic view counting only

## 📋 Implementation Phases

### Phase 1: Core Infrastructure (Days 1-2)
- [ ] Database schema and migrations
- [ ] Storage bucket setup
- [ ] Basic API routes
- [ ] Share code generation utility

### Phase 2: Frontend Components (Days 3-4)
- [ ] Share button in header
- [ ] Share modal component
- [ ] Copy to clipboard functionality
- [ ] Loading and error states

### Phase 3: Management Interface (Days 5-6)
- [ ] Settings modal with shared maps tab
- [ ] List/revoke functionality
- [ ] Enhanced map export hook
- [ ] Share management hook

### Phase 4: Public View & Polish (Days 7-8)
- [ ] Public share page
- [ ] Social meta tags
- [ ] Mobile responsiveness
- [ ] Error handling and edge cases

### Phase 5: Testing & Optimization (Days 9-10)
- [ ] End-to-end testing
- [ ] Performance optimization
- [ ] Security review
- [ ] Documentation updates

## 🧪 Testing Strategy

### Unit Tests
- Share code generation and validation
- API route handlers
- Hook functionality
- Utility functions

### Integration Tests
- Complete share creation flow
- Public page rendering
- Storage upload/delete operations
- Database operations

### E2E Tests
- User creates and shares map
- Recipient views shared map
- User manages shared links
- Link revocation works correctly

## 📊 Success Metrics

### Technical Metrics
- Share creation success rate > 95%
- Page load time for shared maps < 2s
- Storage usage within limits
- Zero security incidents

### User Engagement
- Number of shares created per week
- Click-through rate on shared links
- User retention after sharing
- Settings modal usage

## 🔗 Integration Points

### Existing Codebase
- **Map Export**: Leverage existing `useMapExport` hook
- **Authentication**: Use current Supabase auth context
- **UI Components**: Extend existing design system
- **Navigation**: Integrate with current header layout

### External Services
- **Supabase Storage**: For image hosting
- **Supabase Database**: For share metadata
- **Clipboard API**: For copy functionality
- **Social Platforms**: Open Graph meta tags

## 📝 Additional Considerations

### Performance
- **Image Optimization**: Compress PNGs before upload
- **Caching**: Cache shared map data for faster loading
- **CDN**: Leverage Supabase CDN for image delivery

### Accessibility
- **Keyboard Navigation**: Full keyboard support
- **Screen Readers**: Proper ARIA labels
- **Color Contrast**: Ensure sufficient contrast
- **Focus Management**: Proper modal focus handling

### Future Enhancements
- **Social Media Integration**: Direct sharing to platforms
- **Custom Domains**: Branded share URLs
- **Analytics Dashboard**: Detailed sharing analytics
- **Collaboration**: Multiple users per map