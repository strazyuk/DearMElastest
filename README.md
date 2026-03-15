# DearME 💌

**DearME** is an encrypted, time-locked messaging application that allows users to send messages to their future selves.

## ✨ Features
- **End-to-End Privacy**: Messages are encrypted using AES-256 before storage.
- **Time-Locking**: Messages remain inaccessible until their scheduled delivery date.
- **Modern UI**: A premium, responsive interface built with React and Framer Motion.
- **Automated Delivery**: Reliable background workers handle message "unlocking" and delivery.

## 📂 Project Structure

- **`backend/`**: FastAPI (Python) server handling encryption, users, and message logic.
- **`frontend/`**: React (Vite) application for a seamless user experience.
- **`supabase/`**: Database migrations and Edge Functions for automated tasks.
- **`docs/`**: Additional documentation and setup guides.

## 🚀 Quick Start

### 1. Prerequisites
- Node.js (v18+)
- Python (3.9+)
- Supabase Account

### 2. Backend Setup
```powershell
cd backend
# Follow instructions in backend/SETUP.md
```

### 3. Frontend Setup
```powershell
cd frontend
# Follow instructions in frontend/README.md
```

## 🛠️ Tech Stack
- **Frontend**: React, Tailwind CSS, Framer Motion, Axios
- **Backend**: FastAPI, Cryptography, Pydantic
- **Database**: Supabase (PostgreSQL)
- **Infrastructure**: Supabase Edge Functions (Deno)

## 🔐 Security
Messages are encrypted with **AES-256 (Fernet)**. The decryption key is never stored in the database, ensuring that messages stay locked until the backend worker triggers the delivery process.

## 📜 Documentation
- [Project Context](context.md) - Detailed technical overview and architecture.
- [Database Schema](backend/schema.sql) - Supabase table definitions.
- [Google OAuth Setup](docs/setup_google_oauth.md) - Configuration for email delivery.
