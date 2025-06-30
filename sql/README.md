# Database Setup for Map Sharing Feature

This directory contains SQL scripts that need to be run in the Supabase SQL Editor to enable the map sharing functionality.

## Setup Instructions

1. Open your Supabase project dashboard
2. Navigate to the SQL Editor
3. Run the following scripts **in order**:

### 1. Create Shared Maps Table
```sql
-- File: 01_create_shared_maps_table.sql
```
Creates the main `shared_maps` table with proper RLS policies for secure access.

### 2. Create Storage Bucket
**IMPORTANT**: The bucket must be created through the Supabase Dashboard first:

1. Go to **Supabase Dashboard → Storage**
2. Click **"New bucket"**
3. Configure:
   - **Name**: `shared-maps`
   - **Public bucket**: ✅ ON (checked)
   - **File size limit**: `50 MB`
   - **Allowed MIME types**: `image/png, image/jpeg, image/webp`
4. Click **"Save"**

Then run the SQL policies:
```sql
-- File: 02_create_storage_bucket.sql
```
Sets up storage access policies for the bucket.

### 3. Helper Functions
```sql
-- File: 03_helper_functions.sql
```
Creates utility functions for share code generation and view counting.

## Verification

After running all scripts, verify the setup:

```sql
-- Check table exists
SELECT * FROM shared_maps LIMIT 1;

-- Check storage bucket
SELECT * FROM storage.buckets WHERE id = 'shared-maps';

-- Test share code generation
SELECT generate_share_code();
```

## Security Notes

- All tables use Row Level Security (RLS)
- Users can only access their own shared maps
- Public access is limited to active shares only
- Storage bucket restricts uploads to user's own folder
- File size limit: 50MB per image
- Allowed formats: PNG, JPEG, WebP

## Cleanup

To remove the map sharing feature completely:

```sql
-- Drop table and functions
DROP TABLE IF EXISTS shared_maps CASCADE;
DROP FUNCTION IF EXISTS generate_share_code();
DROP FUNCTION IF EXISTS increment_share_view_count(TEXT);
DROP FUNCTION IF EXISTS cleanup_inactive_shares();

-- Remove storage bucket (this will delete all stored images)
DELETE FROM storage.buckets WHERE id = 'shared-maps';
```

⚠️ **Warning**: The cleanup commands will permanently delete all shared maps and images.