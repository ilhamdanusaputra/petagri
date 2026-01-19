# Authentication System

Complete authentication system for Petagri app using Supabase Auth.

## Features

✅ **Login** (`/login`) - Email & password sign-in
✅ **Register** (`/register`) - Create new account with email verification
✅ **Forgot Password** (`/forgot-password`) - Password reset via email
✅ **Protected Routes** - Middleware to guard authenticated pages
✅ **Profile Screen** - User profile with sign-out functionality
✅ **Real User IDs** - Authenticated users' IDs used in bids and other features

## Routes

### Public Routes (Unauthenticated Access)

- `/login` - Sign in page
- `/register` - Sign up page
- `/forgot-password` - Password reset page

### Protected Routes (Requires Authentication)

- `/(tabs)` - Main app tabs (Home, Profile)
- `/menus/*` - All menu pages (CORE, Tender, etc.)
- All other app features

## Authentication Flow

1. **Initial Load**: App checks for existing session
2. **Not Authenticated**: Redirects to `/login`
3. **Login Success**: Redirects to `/(tabs)` home screen
4. **Session Persists**: User stays logged in across app restarts
5. **Sign Out**: Clears session and redirects to `/login`

## Middleware Implementation

### Root Layout (`app/_layout.tsx`)

- Shows loading screen while auth initializes
- Registers all routes (auth and protected)

### Tab Layout (`app/(tabs)/_layout.tsx`)

- Checks `isAuthenticated` and `isInitialized` from `useAuth()`
- Redirects to `/login` if not authenticated
- Shows loading spinner during initialization

### Auth Layout (`app/(auth)/_layout.tsx`)

- Redirects authenticated users to `/(tabs)`
- Prevents accessing login/register when already logged in

## Hook Usage

```typescript
import { useAuth } from "@/hooks/use-auth";

function MyComponent() {
  const {
    user,              // Current user object (Supabase User)
    session,           // Current session
    isLoading,         // Loading state for auth operations
    isInitialized,     // Has initial auth check completed?
    isAuthenticated,   // Is user logged in?
    signUp,            // (email, password, fullName?) => Promise
    signIn,            // (email, password) => Promise
    signOut,           // () => Promise
    resetPassword,     // (email) => Promise
    updateProfile,     // (updates) => Promise
  } = useAuth();

  return <div>Welcome {user?.email}</div>;
}
```

## User Object

```typescript
user.id; // UUID
user.email; // Email address
user.email_confirmed_at; // Email verification timestamp
user.created_at; // Account creation date
user.user_metadata.full_name; // Full name from registration
user.user_metadata.avatar_url; // Avatar URL (if set)
```

## Integration Examples

### Tender System

```typescript
// app/menus/tender.tsx
const { user } = useAuth();
const currentUserId = user?.id || "fallback-id";

// Used in bids
<CreateBidModal userId={currentUserId} ... />
```

### Profile Display

```typescript
// app/(tabs)/profile.tsx
const { user, signOut } = useAuth();

<Text>{user?.user_metadata?.full_name}</Text>
<Button onPress={signOut}>Sign Out</Button>
```

## Supabase Setup

Ensure these environment variables are set in `.env`:

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_KEY=your_supabase_anon_key
```

## Session Persistence

- **Mobile (iOS/Android)**: Uses `@react-native-async-storage/async-storage`
- **Web**: Uses `localStorage`
- Sessions auto-refresh and persist across app restarts

## Security Features

- Passwords hashed by Supabase
- Email verification for new accounts
- JWT tokens for authenticated requests
- Automatic token refresh
- Secure password reset flow

## Error Handling

All auth operations show user-friendly alerts:

- Sign-in errors (invalid credentials, etc.)
- Sign-up errors (email already exists, weak password, etc.)
- Network errors
- Password reset confirmation

## Next Steps

- [ ] Add email verification reminder in profile
- [ ] Add social auth providers (Google, Apple)
- [ ] Add 2FA support
- [ ] Create user roles/permissions system
- [ ] Add profile editing functionality
