# Setting up Google OAuth for DearME

This guide will walk you through configuring Google Login for your Supabase project.

## Prerequisites
- A Google Cloud account
- Your Supabase Project open

## Step 1: Get your Redirect URL from Supabase
You'll need this URL for the Google Cloud Console configuration.

1. Go to your **[Supabase Dashboard](https://supabase.com/dashboard)** > Project Settings.
2. Go to **Authentication** > **Providers** > **Google**.
3. Locate the **Callback URL** (Redirect URL). 
   - It should look like this: `https://enzjwlhlzljdmnzaadeu.supabase.co/auth/v1/callback`
   - Copy this URL.

## Step 2: Configure Google Cloud Console

1. Go to the **[Google Cloud Console](https://console.cloud.google.com/)**.
2. Create a new project (e.g., "DearME Auth") or select an existing one.
3. **OAuth Consent Screen**:
   - Go to **APIs & Services** > **OAuth consent screen**.
   - Select **External** and click **Create**.
   - Fill in:
     - **App Name**: DearME
     - **User Support Email**: Your email
     - **Developer Contact Information**: Your email
   - Click **Save and Continue** (you can skip Scopes and Test Users for now).

4. **Create Credentials**:
   - Go to **APIs & Services** > **Credentials**.
   - Click **+ CREATE CREDENTIALS** > **OAuth client ID**.
   - **Application type**: Web application.
   - **Name**: "Supabase Auth Client".
   - **Authorized JavaScript origins**:
     - `http://localhost:5173` (Local Development)
     - `http://localhost:3000` (Alternative Local Port)
     - `https://enzjwlhlzljdmnzaadeu.supabase.co` (Supabase URL)
     - *Add your Vercel URL later once deployed* (e.g., `https://dear-me.vercel.app`)
   - **Authorized redirect URIs** (Paste the URL from Step 1):
     - `https://enzjwlhlzljdmnzaadeu.supabase.co/auth/v1/callback`
   - Click **Create**.

5. **Copy Keys**:
   - You will see a "Client ID" and "Client Secret". Keep this window open or copy them.

## Step 3: Enable Google in Supabase

1. Go back to your **Supabase Dashboard** > **Authentication** > **Providers** > **Google**.
2. **Enable** the "Google enabled" toggle.
3. Paste the **Client ID** from Google into the "Client ID" field.
4. Paste the **Client Secret** from Google into the "Client Secret" field.
5. Click **Save**.

## Step 4: Verification

Once saved, Google Auth is enabled on the backend! We will now update the frontend to use it.
