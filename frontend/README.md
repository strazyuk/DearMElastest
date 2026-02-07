# DearME Frontend

React frontend for the DearME encrypted time-locked messaging application.

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Supabase account (for authentication)

### Installation

1. **Install dependencies:**
   ```powershell
   npm install
   ```

2. **Configure environment variables:**
   
   Update the `.env` file with your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your-supabase-project-url
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   VITE_API_URL=http://localhost:8000
   ```

   To get these credentials:
   - Go to your [Supabase Dashboard](https://app.supabase.com)
   - Select your project
   - Navigate to Settings → API
   - Copy **Project URL** and **anon/public key**

3. **Start the development server:**
   ```powershell
   npm run dev
   ```

4. **Open your browser:**
   Navigate to `http://localhost:5173`

## 📁 Project Structure

```
src/
├── services/          # External service integrations
│   ├── supabaseClient.js   # Supabase auth configuration
│   └── api.js             # Backend API client
│
├── contexts/          # React Context providers
│   └── AuthContext.jsx    # Authentication state
│
├── components/        # Reusable UI components
│   ├── ProtectedRoute.jsx
│   ├── LoadingSpinner.jsx
│   ├── Toast.jsx
│   └── Navbar.jsx
│
├── pages/            # Route components
│   ├── Auth.jsx           # Sign in/Sign up
│   ├── Dashboard.jsx      # Message creation
│   └── Vault.jsx          # Message archive
│
├── main.jsx          # App entry point
├── App.jsx           # Route configuration
└── index.css         # Global styles
```

## 🔐 Features

- **Authentication**: Email/password sign in and sign up via Supabase
- **Protected Routes**: Automatic redirect for unauthenticated users
- **Message Creation**: Schedule encrypted messages with date/time picker
- **Message Vault**: View all scheduled and sent messages
- **Responsive Design**: Mobile-friendly UI with modern aesthetics
- **Toast Notifications**: User feedback for actions
- **Loading States**: Visual feedback during async operations

## 🎨 Technologies

- **React** - UI framework
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Supabase** - Authentication and session management
- **Axios** - HTTP client for API calls
- **lucide-react** - Icon library
- **date-fns** - Date formatting and manipulation

## 🚦 Available Scripts

```powershell
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run ESLint
npm run lint
```

## 🔗 Backend Integration

This frontend expects a FastAPI backend with the following endpoints:

### POST `/api/messages`
Create a new time-locked message
- Headers: `Authorization: Bearer <jwt-token>`
- Body: `{ recipient_email, content, scheduled_date }`

### GET `/api/messages`
Retrieve all messages for the authenticated user
- Headers: `Authorization: Bearer <jwt-token>`
- Returns: `{ messages: [...] }`

The backend should verify the Supabase JWT token and handle message encryption.

## ⚠️ Important Notes

1. **Environment Variables**: The `.env` file must be configured with valid Supabase credentials before the app will work.

2. **Backend Required**: While the UI will load without a backend, message creation and the vault will not function until the FastAPI backend is running.

3. **Supabase Setup**: Ensure Email/Password authentication is enabled in your Supabase project settings.

## 🐛 Troubleshooting

**"Missing Supabase environment variables"**
- Check that your `.env` file exists and contains valid values
- Restart the dev server after updating `.env`

**"Network Error" when creating messages**
- Ensure the backend is running at `http://localhost:8000`
- Check the `VITE_API_URL` in your `.env` file

**Auth not working**
- Verify Supabase credentials are correct
- Check Supabase dashboard for authentication settings
- Ensure Email/Password provider is enabled

## 📝 License

Private project - All rights reserved
