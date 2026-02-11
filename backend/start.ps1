# DearME Backend Startup Script
# Run this in PowerShell from the project root

# Activate virtual environment
& "$PSScriptRoot/../.venv/Scripts/Activate.ps1"

# Set environment variables
$env:ENCRYPTION_KEY="nZsP_Tz7JpRv7mtLIpOaIJ7e41uUJYcPog0ooDM92S0="
$env:SUPABASE_URL="https://enzjwlhlzljdmnzaadeu.supabase.co"
$env:SUPABASE_SERVICE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVuemp3bGhsemxqZG1uemFhZGV1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDM1MjM2MywiZXhwIjoyMDg1OTI4MzYzfQ.HvRtkQPhXfGkFX2VNm1Khpb7rwMkOxJi2wia9egeHO4"
$env:SUPABASE_JWT_SECRET="dDpjMwNHkoPZGByL9U36JnAIhe2lGBU7kvizKoblIq36K8CdLw1v5LtSCdWKLCWbu8AJtXs7iMq++U3iNO7XKw=="
$env:DATABASE_URL="postgresql://postgres:NlwtsHmB7JJCRD8a@db.enzjwlhlzljdmnzaadeu.supabase.co:5432/postgres"

Write-Host "Environment variables set!" -ForegroundColor Green

# Start server
uvicorn main:app --reload
