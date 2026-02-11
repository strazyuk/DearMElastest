# Supabase Edge Functions

This directory contains Supabase Edge Functions for DearME.

## Functions

### `send-scheduled-messages`

Processes scheduled messages and sends email notifications via Resend.

**Trigger:** Called every minute by CRON job

**What it does:**
1. Queries messages where `scheduled_date <= NOW()` and `status = 'scheduled'`
2. Sends email notification to recipient via Resend API
3. Updates message status to `'sent'` or `'failed'`

## Deployment

### Prerequisites

1. Install Supabase CLI:
   ```bash
   npm install -g supabase
   ```

2. Login to Supabase:
   ```bash
   supabase login
   ```

3. Link to your project:
   ```bash
   supabase link --project-ref enzjwlhlzljdmnzaadeu
   ```

### Set Secrets

Before deploying, set the Resend API key:

```bash
supabase secrets set RESEND_API_KEY=your_resend_api_key_here
```

### Deploy

```bash
supabase functions deploy send-scheduled-messages
```

### Test Locally

```bash
supabase functions serve send-scheduled-messages --env-file .env.local
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `RESEND_API_KEY` | Your Resend API key |
| `SUPABASE_URL` | Auto-injected by Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Auto-injected by Supabase |

## CRON Setup

After deploying the function, run the SQL in `setup_cron.sql` to schedule automatic execution.
