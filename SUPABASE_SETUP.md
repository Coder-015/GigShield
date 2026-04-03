# Supabase Setup for GigShield

## 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up/login
3. Create a new project
4. Wait for the project to be ready

## 2. Get Project Credentials

1. Go to Project Settings > API
2. Copy your **Project URL** and **anon key**
3. Update `lib/supabase.ts` with these values:

```typescript
const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY';
```

## 3. Set up Database

1. Go to the SQL Editor in your Supabase project
2. Copy and paste the contents of `supabase/setup.sql`
3. Run the SQL script

This will create:
- `users` table - stores user profile data
- `claims` table - stores insurance claims
- `subscription_plans` table - stores user subscription info
- Row Level Security policies
- Indexes for performance

## 4. Enable Authentication

1. Go to Authentication > Settings
2. Enable **Email/Password** authentication
3. Enable **Phone** authentication (optional)
4. Configure your site URL for redirects

## 5. Test the Integration

Run the app:

```bash
npx expo start -c
```

The app will now:
- Store user data in Supabase
- Authenticate users with email/phone
- Save claims to the database
- Load real user data

## 6. Features Available

### User Authentication
- Email/Password login
- Phone number login (OTP)
- User registration

### Data Storage
- User profiles (name, phone, city, earnings)
- Claims history (amount, date, status, zone)
- Subscription plans (weekly premium, features)

### Real-time Updates
- Claims update in real-time
- User data syncs across devices

## 7. Database Schema

### Users Table
```sql
- id (UUID, Primary Key)
- name (TEXT)
- phone (TEXT, Unique)
- email (TEXT, Optional)
- city (TEXT)
- zone (TEXT)
- platform (TEXT)
- weekly_earnings (TEXT)
- plan (TEXT)
- upi_id (TEXT)
- member_since (TEXT)
- initials (TEXT)
- streak (INTEGER)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### Claims Table
```sql
- id (UUID, Primary Key)
- user_id (UUID, Foreign Key)
- type (TEXT)
- date (TEXT)
- zone (TEXT)
- amount (INTEGER)
- status (TEXT: processing/pending/completed/rejected)
- description (TEXT)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### Subscription Plans Table
```sql
- id (UUID, Primary Key)
- user_id (UUID, Foreign Key)
- plan_name (TEXT)
- weekly_premium (INTEGER)
- features (TEXT[])
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

## 8. Security

- Row Level Security enabled
- Users can only access their own data
- Authentication required for all operations
- No public data exposure

## 9. Troubleshooting

### Common Issues

1. **"Invalid JWT" error**
   - Check your Supabase URL and keys
   - Ensure user is authenticated

2. **"Permission denied" error**
   - Check RLS policies
   - Ensure user is logged in

3. **"Connection failed" error**
   - Check network connectivity
   - Verify Supabase project is active

### Debug Mode

Enable debug logging in development:

```typescript
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    debug: true,
  },
});
```

## 10. Production Considerations

- Use environment variables for credentials
- Enable database backups
- Monitor usage and limits
- Set up proper error logging
- Consider edge functions for server-side logic
