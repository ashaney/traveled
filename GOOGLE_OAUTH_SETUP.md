# Google OAuth Setup Guide

This guide will walk you through setting up Google OAuth for your Traveled app.

## Prerequisites

1. Vercel project deployed
2. Supabase project created
3. Domain/URL for your app (from Vercel)

## Step 1: Google Cloud Console Setup

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/

2. **Create a New Project** (if you don't have one)
   - Click "Select a project" → "New Project"
   - Name: `traveled-app` (or your preferred name)
   - Click "Create"

3. **Enable Google+ API**
   - Go to "APIs & Services" → "Library"
   - Search for "Google+ API"
   - Click "Enable"

4. **Configure OAuth Consent Screen**
   - Go to "APIs & Services" → "OAuth consent screen"
   - Choose "External" user type
   - Fill in required fields:
     - App name: `Traveled`
     - User support email: Your email
     - Developer contact email: Your email
   - Add scopes (optional): `email`, `profile`, `openid`
   - Save and continue through all steps

5. **Create OAuth 2.0 Credentials**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth 2.0 Client IDs"
   - Application type: "Web application"
   - Name: `Traveled Web Client`
   - Authorized JavaScript origins:
     - `http://localhost:3001` (for development)
     - `https://well-traveled.app` (your production URL)
   - Authorized redirect URIs:
     - `http://localhost:3001/auth/callback` (for development)
     - `https://well-traveled.app/auth/callback` (your production URL)
   - Click "Create"

6. **Save Your Credentials**
   - Copy the "Client ID" and "Client Secret"
   - You'll need these for Supabase configuration

## Step 2: Supabase Configuration

1. **Go to Your Supabase Dashboard**
   - Visit: https://supabase.com/dashboard

2. **Navigate to Authentication Settings**
   - Go to "Authentication" → "Providers"
   - Find "Google" in the list

3. **Configure Google Provider**
   - Toggle "Enable" for Google
   - Paste your Google OAuth Client ID
   - Paste your Google OAuth Client Secret
   - Click "Save"

4. **Update Site URL**
   - Go to "Authentication" → "URL Configuration"
   - Set Site URL to your production domain: `https://well-traveled.app`
   - Add redirect URLs:
     - `https://well-traveled.app/auth/callback`
     - `http://localhost:3001/auth/callback` (for development)

## Step 3: Environment Variables

Create a `.env.local` file in your project root with:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

You can find these values in your Supabase dashboard under "Settings" → "API".

## Step 4: Vercel Environment Variables

In your Vercel dashboard:

1. Go to your project
2. Click "Settings" → "Environment Variables"
3. Add the same environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Step 5: Database Setup

Run the provided SQL migrations in your Supabase SQL editor:

1. Copy content from `supabase/migrations/001_initial_schema.sql`
2. Run in Supabase SQL editor
3. Copy content from `supabase/migrations/002_auth_policies.sql`
4. Run in Supabase SQL editor

## Step 6: Testing

1. **Local Development**
   - Run `bun dev --port 3001`
   - Visit `http://localhost:3001`
   - You should be redirected to login
   - Click "Sign in with Google"
   - Complete OAuth flow

2. **Production Testing**
   - Deploy to Vercel
   - Visit `https://well-traveled.app`
   - Test Google login flow

## Troubleshooting

### Common Issues:

1. **"Redirect URI mismatch"**
   - Check that your redirect URIs in Google Console match exactly
   - Ensure you've added both development and production URLs

2. **"Invalid client"**
   - Verify Client ID and Secret in Supabase are correct
   - Check that Google+ API is enabled

3. **"Access blocked"**
   - Make sure OAuth consent screen is configured
   - For development, you may need to add test users

4. **Database errors**
   - Ensure migrations ran successfully
   - Check that RLS policies are in place
   - Verify user profiles are being created

### Additional Notes:

- Google OAuth requires HTTPS in production
- Make sure your domain is verified in Google Console if you encounter domain restrictions
- Test thoroughly in both development and production environments
- Local development runs on port 3001: `http://localhost:3001`
- Production domain: `https://well-traveled.app`

## Security Considerations

1. Never commit `.env.local` to version control
2. Use environment variables for all sensitive configuration
3. Regularly rotate your OAuth credentials
4. Monitor your Supabase auth logs for any suspicious activity

## Support

If you encounter issues:
1. Check Supabase auth logs
2. Check browser developer console for errors
3. Verify all environment variables are set correctly
4. Ensure database migrations completed successfully