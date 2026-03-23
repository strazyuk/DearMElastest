# Project Context: DearME 💌

> **DearME** is an encrypted, time-locked messaging application. Users write letters to their future selves (or others), select a future delivery date, and trust that the content remains locked and unreadable until that exact moment arrives.

---

## 🎯 Project Goal

To provide a secure and reliable platform for "digital time capsules." The core user promise:

- Write a private message today.
- Pick a future date.
- The message is cryptographically locked and invisible (even to you) until that date.
- On the scheduled date, it is automatically decrypted and delivered by email.

---

## 🏗️ Architecture Overview

```
┌────────────────────────────────────────────────────────────────────────┐
│                          USER BROWSER                                  │
│  React 19 + Vite (AWS Amplify Hosting)                                 │
│  Routes: / | /auth | /dashboard | /vault                               │
└──────────────────────┬─────────────────────────────────────────────────┘
                       │
          Supabase Auth (JWT)    Axios (Bearer token)
                       │
          ┌────────────▼────────────────┐
          │     AWS API Gateway         │
          │  (HTTP API - ap-south-1)    │
          │  https://wo7z2tu39l.execute │
          │  -api.ap-south-1.amazonaws  │
          └────────────┬────────────────┘
                       │ AWS_PROXY
          ┌────────────▼──────────────────────────────────┐
          │        AWS Lambda (dearme-api)                 │
          │  Python 3.11 / FastAPI + Mangum adapter        │
          │  512MB RAM | 30s Timeout                       │
          │  handler: main.handler                         │
          └────────────┬──────────────────────────────────┘
                       │ supabase-py (service role key)
          ┌────────────▼──────────────────────────────────┐
          │         Supabase (PostgreSQL)                  │
          │  Project: enzjwlhlzljdmnzaadeu                 │
          │  Region: ap-south-1 (via db.supabase.co)       │
          │  - Table: messages (RLS enabled)               │
          │  - Auth: Supabase Auth                         │
          └─────────────────────────────────────────────╥─┘
                                                        ║  pg_cron (every minute)
          ┌─────────────────────────────────────────────╨─┐
          │    Supabase Edge Function (Deno)               │
          │    send-scheduled-messages/index.ts             │
          │    - Queries: status='scheduled', date <= NOW  │
          │    - Decrypts ciphertext (Fernet via Web Crypto)│
          │    - Sends email via Gmail SMTP (port 465, TLS)│
          │    - Updates status → 'sent' or 'failed'       │
          └────────────────────────────────────────────────┘
```

---

## 🔐 Security & Encryption Model

### Encryption
- **Algorithm**: AES-256 wrapped in the **Fernet** scheme (Python `cryptography` library).
- **Key management**: The `ENCRYPTION_KEY` is a URL-safe base64-encoded 32-byte key stored as an AWS Lambda environment variable and in AWS SSM Parameter Store (`/dearme/prod/encryption-key`).
- **Flow**:
  1. User submits a message via the frontend.
  2. FastAPI (Lambda) receives the plaintext content.
  3. `encrypt_message()` in `core/security.py` calls `Fernet.encrypt()`.
  4. Ciphertext is stored in `messages.encrypted_content`.
  5. **Plaintext is never stored.**

### Authentication
- **Provider**: **Supabase Auth** (email/password based).
- **Token type**: Supabase JWT (verified server-side by calling `supabase.auth.get_user(token)`).
- **API protection**: All `/api/messages` endpoints use the `get_current_user` FastAPI dependency, which validates the Bearer token from the `Authorization` header.
- **Frontend**: Supabase client is exposed via `src/services/supabaseClient.js`. The API service (`api.js`) attaches the JWT via an Axios request interceptor on every API call.

### Status-Based Content Lock
| Status | Content Returned by API? | Description |
|---|---|---|
| `scheduled` | `null` (locked) | Message is in-transit; content is never exposed even to the owner |
| `sent` | Decrypted plaintext | Delivered; owner can now read in the Vault |
| `failed` | `null` | Edge function failed to send the email |

---

## 🗄️ Database Schema (Supabase / PostgreSQL)

**Table: `messages`**
| Column | Type | Notes |
|---|---|---|
| `id` | `UUID` | PK, auto-generated (`uuid_generate_v4()`) |
| `user_id` | `UUID` | FK → `auth.users(id)`, ON DELETE CASCADE |
| `title` | `VARCHAR(255)` | Optional |
| `recipient_email` | `VARCHAR(255)` | Target delivery address |
| `encrypted_content` | `TEXT` | AES-256 (Fernet) ciphertext |
| `scheduled_date` | `TIMESTAMPTZ` | When to deliver |
| `created_at` | `TIMESTAMPTZ` | Auto, defaults to `NOW()` |
| `updated_at` | `TIMESTAMPTZ` | Auto-updated via trigger |
| `sent_at` | `TIMESTAMPTZ` | Null until delivered |
| `status` | `VARCHAR(20)` | Enum: `scheduled`, `sent`, `failed` |

**Indexes**: `user_id`, `scheduled_date`, `status`, and a composite index on `(status, scheduled_date)` for efficient cron queries.

**Row Level Security (RLS)**: Enabled. Policies ensure users can only `SELECT` and `INSERT` their own rows. Service role key (used by Lambda and Edge Function) bypasses RLS.

---

## 🛠️ Tech Stack

### Frontend
| Item | Detail |
|---|---|
| Framework | React 19 (Vite) |
| Deployment | **AWS Amplify Hosting** — `https://main.d22yzw6p7jopey.amplifyapp.com` |
| Routing | `react-router-dom` v6 (SPA with `<Routes>`) |
| HTTP Client | `axios` with interceptors for auth and error handling |
| Styling | Vanilla CSS — "Quiet Depth" aesthetic (dark, editorial, serif/italic typography) |
| Auth | `@supabase/supabase-js` (client only, anon key) |
| API Detection | Fail-safe: reads `VITE_API_URL` env var; falls back to `localhost:8000` locally or the AWS API Gateway URL in production |

### Backend
| Item | Detail |
|---|---|
| Framework | FastAPI (Python 3.11) |
| Runtime | **AWS Lambda** via Mangum ASGI adapter |
| Key libraries | `cryptography` (Fernet), `supabase-py`, `pydantic-settings`, `PyJWT`, `google-genai`, `python-dotenv` |
| Config | `core/config.py` — `pydantic-settings` `BaseSettings`, loaded from `.env` locally or Lambda env vars in production |
| Entry point | `main.py` — `handler = Mangum(app)` |

### Infrastructure (IaC — Terraform)
| Item | Detail |
|---|---|
| Region | `ap-south-1` (Mumbai) |
| Lambda | `dearme-api`, Python 3.11, 512MB RAM, 30s timeout |
| API Gateway | AWS API Gateway V2 (HTTP API), `$default` stage, auto-deploy |
| Secrets | AWS SSM Parameter Store (`/dearme/prod/encryption-key`) |
| IAM | Dedicated role `dearme_lambda_exec_role` with `AWSLambdaBasicExecutionRole` + SSM read policy |
| Budget Alert | $5/month threshold at 80% usage → email `asirabrar789@gmail.com` |
| Packaging | `package_lambda.ps1` — Windows PowerShell script that `pip install`s dependencies with `--platform manylinux2014_x86_64`, copies all backend subdirs, zips, and outputs JSON for Terraform's `data.external` data source |

### Supabase / Email Delivery
| Item | Detail |
|---|---|
| Edge Function | `send-scheduled-messages` (Deno/TypeScript) |
| Trigger | `pg_cron` job — runs **every minute** via `pg_net.http_post` |
| Decryption | Implemented using Web Crypto API (native to Deno) — mirrors Python Fernet logic |
| SMTP | Gmail SMTP, port 465, TLS. Credentials: `GMAIL_USER` + `GMAIL_APP_PASSWORD` |
| Message limit | 50 messages per cron invocation |

---

## 📂 Project Structure

```
DearMElastest/
├── backend/                  # FastAPI application
│   ├── main.py               # App factory, CORS config, Mangum handler
│   ├── core/
│   │   ├── config.py         # Pydantic settings (env vars)
│   │   └── security.py       # Fernet encrypt/decrypt, JWT verification, get_current_user
│   ├── db/
│   │   └── supabase_client.py  # CRUD helpers: insert, get, delete messages
│   ├── models/
│   │   └── message.py        # Pydantic models: MessageCreate, MessageResponse, MessageListResponse
│   ├── routers/
│   │   ├── messages.py       # /api/messages CRUD endpoints (create, list, get, delete)
│   │   └── quote.py          # /api/quote/ — Gemini AI generated daily quote
│   ├── schema.sql            # Supabase table DDL + RLS policies
│   └── requirements.txt      # Python dependencies
│
├── frontend/                 # React 19 / Vite application
│   ├── src/
│   │   ├── App.jsx           # Route definitions (/, /auth, /dashboard, /vault)
│   │   ├── pages/
│   │   │   ├── LandingPage   # Public home page
│   │   │   ├── Auth          # Sign in / Sign up (Supabase Auth)
│   │   │   ├── Dashboard     # Main compose screen (authenticated)
│   │   │   └── Vault         # Message history (scheduled + sent)
│   │   ├── components/
│   │   │   ├── DashboardLayout.jsx  # Shared layout wrapper for authenticated pages
│   │   │   ├── Navbar.jsx           # Top navigation bar
│   │   │   ├── NavSlider.jsx        # Sliding nav menu
│   │   │   ├── ProtectedRoute.jsx   # Auth guard for dashboard/vault
│   │   │   ├── QuoteOfTheDay.jsx    # AI quote widget (calls /api/quote/)
│   │   │   ├── DearMELogo.jsx       # Animated SVG logo component
│   │   │   ├── LoadingSpinner.jsx   # Reusable loading indicator
│   │   │   └── Toast.jsx            # Notification toast
│   │   └── services/
│   │       ├── api.js          # Axios client + all API methods (createMessage, getMessages, deleteMessage)
│   │       └── supabaseClient.js  # Supabase browser client (anon key)
│   └── .env                  # VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_API_URL
│
├── supabase/
│   ├── functions/
│   │   └── send-scheduled-messages/
│   │       └── index.ts      # Deno Edge Function for email delivery
│   └── setup_cron.sql        # pg_cron setup (runs Edge Function every minute)
│
├── terraform/
│   ├── terraform.tf          # All AWS infrastructure (Lambda, API GW, IAM, SSM, Budget)
│   ├── terraform.tfvars      # Variable values (secrets — NOT committed for real projects)
│   └── package_lambda.ps1    # Windows-compatible Lambda packaging script
│
├── context.md                # ← This file
├── vercel.json               # Legacy Vercel config (not the active deployment — Amplify is)
└── requirements.txt          # Top-level Python requirements
```

---

## 🚀 Deployment Status & Live URLs

| Component | Status | URL / Resource |
|---|---|---|
| **Frontend** | ✅ Live | `https://main.d22yzw6p7jopey.amplifyapp.com` |
| **Backend API** | ✅ Live | `https://wo7z2tu39l.execute-api.ap-south-1.amazonaws.com` |
| **Lambda Function** | ✅ Deployed | `dearme-api` (ap-south-1) |
| **Supabase DB** | ✅ Live | Project ref: `enzjwlhlzljdmnzaadeu` |
| **Edge Function** | ✅ Deployed | `send-scheduled-messages` |
| **Email Cron** | ✅ Active | Every minute via `pg_cron` |
| **Budget Alert** | ✅ Active | $5/mo threshold at 80% → email alert |

---

## 🔄 Key Data Flows

### 1. Creating a Message
```
User (Dashboard) → POST /api/messages (with JWT)
  → Lambda: get_current_user() verifies JWT with Supabase
  → encrypt_message(content) → Fernet ciphertext
  → insert_message() → supabase.table("messages").insert(...)
  → Returns MessageResponse (no decrypted content)
```

### 2. Scheduled Delivery (Automated)
```
pg_cron (every minute) → pg_net.http_post → Edge Function
  → Query: status='scheduled' AND scheduled_date <= NOW() LIMIT 50
  → For each message: fernetDecrypt(ENCRYPTION_KEY, encrypted_content)
  → SMTPClient.send() → Gmail → Recipient's inbox
  → supabase.update({ status: 'sent', sent_at: NOW() })
```

### 3. Viewing the Vault
```
User (Vault) → GET /api/messages (with JWT)
  → Lambda: get_user_messages(user_id, email)
    → Fetches messages where user_id = me OR recipient_email = me
  → For each message:
      if status == 'sent': decrypt_message(encrypted_content) → decrypted_content
      else: decrypted_content = None  ← still locked
  → Returns MessageListResponse
```

### 4. Gemini Quote of the Day
```
QuoteOfTheDay component mounts → GET /api/quote/
  → Lambda: calls Gemini API (gemini-2.0-flash)
  → Returns { quote, author, date } or fallback quote on error
```

---

## 🧑‍💻 Local Development

### Backend
```powershell
cd backend
python -m venv .venv
.venv\Scripts\Activate
pip install -r requirements.txt
uvicorn main:app --reload
# Runs at http://localhost:8000
```

### Frontend
```powershell
cd frontend
npm install
npm run dev
# Runs at http://localhost:5173
```

### Lambda Re-deployment (after backend changes)
```powershell
cd terraform
terraform apply
# package_lambda.ps1 runs automatically, zips the backend, and uploads to AWS
```

---

## ⚙️ Environment Variables Reference

### Backend (Lambda / `.env`)
| Variable | Purpose |
|---|---|
| `ENCRYPTION_KEY` | Fernet key (URL-safe base64) |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_KEY` | Service role key (bypasses RLS) |
| `SUPABASE_JWT_SECRET` | JWT secret (for reference; auth uses `get_user()`) |
| `DATABASE_URL` | Direct PostgreSQL connection string |
| `GEMINI_API_KEY` | Google Gemini API key for quote generation |
| `ALLOWED_ORIGINS` | Comma-separated CORS origins |

### Frontend (`.env`)
| Variable | Purpose |
|---|---|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon (public) key |
| `VITE_API_URL` | Backend API base URL (optional; auto-detected in prod) |

### Supabase Edge Function (Supabase Dashboard Secrets)
| Variable | Purpose |
|---|---|
| `ENCRYPTION_KEY` | Must match the backend key exactly |
| `GMAIL_USER` | Gmail address for sending emails |
| `GMAIL_APP_PASSWORD` | Gmail App Password (not the Gmail login password) |

---

## 📌 Known Design Decisions

1. **Mangum over Serverless Framework**: The backend uses `Mangum` to wrap FastAPI for Lambda. Terraform handles all infrastructure — no Serverless Framework dependency.
2. **Service Key for Lambda**: The Lambda function uses the Supabase `service_role` key to bypass RLS, as it needs to perform operations on behalf of authenticated users after verifying their JWT server-side.
3. **Edge Function re-implements Fernet**: The Supabase Edge Function (Deno) cannot run Python, so it re-implements the Fernet decryption spec using the native Web Crypto API, which is compatible with Python Fernet tokens.
4. **Windows-compatible Lambda packaging**: `package_lambda.ps1` uses `pip install --platform manylinux2014_x86_64 --only-binary=:all:` to ensure native dependencies (like `cryptography`) compile for the Linux Lambda runtime, not Windows.
5. **Content locking at API layer**: The API never returns decrypted content unless `status == 'sent'`. This prevents premature message reading even for authenticated owners.
6. **`vercel.json` is legacy**: The project was initially set up on Vercel. The active deployment is on **AWS Amplify** (frontend) + **AWS Lambda** (backend). `vercel.json` can be ignored.
