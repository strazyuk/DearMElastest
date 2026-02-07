# DearME Backend - Setup Guide

## Prerequisites
- Python 3.9+ installed
- Supabase account (https://supabase.com)
- Virtual environment activated (recommended)

## 1. Install Dependencies

```powershell
# Navigate to backend directory
cd backend

# Install all required packages
pip install -r requirements.txt
```

## 2. Configure Environment Variables

Update the `.env` file with your Supabase credentials:

```env
# Encryption (DO NOT CHANGE - already set)
ENCRYPTION_KEY=nZsP_Tz7JpRv7mtLIpOaIJ7e41uUJYcPog0ooDM92S0=

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key-here
SUPABASE_JWT_SECRET=your-jwt-secret-here

# Database
DATABASE_URL=postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres

# API Configuration (optional - defaults are fine)
API_HOST=0.0.0.0
API_PORT=8000
```

### How to Get Supabase Credentials:

1. Go to https://app.supabase.com
2. Select your project
3. Navigate to **Settings → API**
4. Copy the following:
   - **Project URL** → `SUPABASE_URL`
   - **service_role key** (NOT anon key) → `SUPABASE_SERVICE_KEY`
5. Navigate to **Settings → API → JWT Settings**
   - Copy **JWT Secret** → `SUPABASE_JWT_SECRET`
6. Navigate to **Settings → Database**
   - Copy the **Connection string** → `DATABASE_URL`

## 3. Set Up Database Tables

1. Go to your Supabase dashboard
2. Click on **SQL Editor**
3. Copy the contents of `schema.sql`
4. Paste and run in the SQL Editor
5. Verify the `messages` table appears in **Table Editor**

## 4. Start the Backend Server

```powershell
# Run with auto-reload for development
uvicorn main:app --reload

# Or use the built-in runner
python main.py
```

The API will be available at: http://localhost:8000

## 5. Verify Installation

### Check Health Endpoint
```powershell
curl http://localhost:8000/health
```

Expected response:
```json
{
  "status": "healthy",
  "service": "DearME API",
  "version": "1.0.0"
}
```

### View API Documentation
Open in browser: http://localhost:8000/docs

## 6. Test with Frontend

1. Ensure backend is running on port 8000
2. Start the frontend:
   ```powershell
   cd ../frontend
   npm run dev
   ```
3. Sign in through the frontend
4. Create a test message
5. Verify it appears in the Vault

## Troubleshooting

### "Missing environment variable" error
- Ensure all variables in `.env` are set
- Check for typos in variable names
- Restart the server after updating `.env`

### "Invalid JWT token" error
- Verify `SUPABASE_JWT_SECRET` matches your Supabase project
- Ensure frontend is using the correct Supabase URL and anon key
- Check that the token is being passed in the `Authorization` header

### Database connection error
- Verify `DATABASE_URL` is correct
- Check that Supabase project is running
- Ensure RLS policies are set up correctly

### CORS errors from frontend
- Verify frontend is running on `http://localhost:5173`
- Check CORS configuration in `main.py`
- Ensure credentials are being sent with requests

## API Endpoints

### POST /api/messages
Create a new encrypted message
- **Auth**: Required (Bearer token)
- **Body**: `{ recipient_email, content, scheduled_date }`

### GET /api/messages
Get all user's messages
- **Auth**: Required (Bearer token)
- **Query**: `?status=scheduled` (optional)

### GET /api/messages/{id}
Get specific message
- **Auth**: Required (Bearer token)

### GET /health
Health check (no auth required)

## Security Notes

⚠️ **Never commit `.env` to version control**
⚠️ **Never change `ENCRYPTION_KEY` after encrypting messages**
⚠️ **Keep `SUPABASE_SERVICE_KEY` secret** - it has admin access
