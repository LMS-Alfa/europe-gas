# Supabase Setup for Europe Gas Analytics

This document provides instructions for setting up the Supabase backend for the Europe Gas Analytics application.

## Prerequisites

1. A Supabase account (sign up at [https://supabase.com/](https://supabase.com/))
2. Supabase CLI installed (optional, but recommended)

## Setup Steps

### 1. Create a New Supabase Project

1. Go to [https://app.supabase.com/](https://app.supabase.com/) and log in.
2. Click "New Project" and provide a name (e.g., "europe-gas-analytics").
3. Choose a database password (save it securely).
4. Select a region closest to your users.
5. Wait for the project to initialize (can take a few minutes).

### 2. Configure Authentication

1. In the Supabase dashboard, go to "Authentication" → "Providers".
2. Enable "Phone Auth" by toggling it on.
3. If you want to use a specific SMS provider, configure it in the SMS Provider section.
4. For testing, you can enable "Create users with auto-confirm" in Development settings.

### 3. Set Up Database Schema

1. Go to "SQL Editor" in the Supabase dashboard.
2. Create a new query and paste the contents of the `schema.sql` file.
3. Run the query to create all tables, triggers, and security policies.

### 4. Set Up Storage (Optional)

If your application needs to store files (e.g., CSV uploads):

1. Go to "Storage" in the Supabase dashboard.
2. Create a new bucket called "spare-parts-uploads".
3. Set the access level to "Private" for security.

### 5. Configure Application Environment

1. In the Supabase dashboard, go to "Project Settings" → "API".
2. Copy the "URL" and "anon" key.
3. Create a `.env` file in your project root with:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Row Level Security (RLS)

The database schema has Row Level Security enabled on all tables to enforce the following access controls:

- Regular users can only see and update their own data
- Admin users can access all data
- Profile creation happens automatically when a user signs up

## Bonus Calculation Logic

The database includes a trigger function to automatically validate part entries and calculate bonuses:

1. When a user enters a part ID, the system checks if it exists in the spare_parts table
2. If valid and not a duplicate for that user, a $1 bonus is assigned
3. Invalid or duplicate entries receive no bonus

## Schema Structure

- `profiles`: User profile information 
- `spare_parts`: Inventory of spare parts
- `user_parts`: Entries of parts by users
- `bonus_payments`: Quarterly bonus payment records

## Testing Authentication

For testing the phone-based authentication:

1. Use the test numbers provided in the Supabase dashboard
2. OTP codes for these numbers will appear in the authentication logs
3. For production, ensure you have configured a proper SMS provider

## Getting Help

If you encounter issues, refer to the [Supabase documentation](https://supabase.com/docs) or reach out to the project team. 