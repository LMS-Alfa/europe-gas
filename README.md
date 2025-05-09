# Europe Gas Analytics

A modern web application for tracking spare parts inventory and managing bonus payments to users. The platform allows admins to upload spare parts inventory via CSV files and track user bonuses, while users can enter spare part IDs to earn bonuses.

## Features

- **Admin Features**:
  - Upload spare parts via CSV
  - View and manage users
  - Track bonus payments
  - Generate reports

- **User Features**:
  - Enter spare part IDs
  - Earn $1 per valid entry
  - View personal stats
  - Track bonus history

- **Technical Features**:
  - Phone-based authentication
  - Responsive design for mobile and desktop
  - Dark mode support
  - Secure role-based access control
  - Modern UI with animations and glass morphism

## Technology Stack

- **Frontend**:
  - React with Vite
  - styled-components for styling
  - Framer Motion for animations
  - React Router for navigation
  - Context API for state management

- **Backend**:
  - Supabase (Backend-as-a-Service)
  - PostgreSQL database
  - Supabase Auth for phone-based authentication
  - Supabase Storage for file uploads

## Getting Started

### Prerequisites

- Node.js (v16+)
- npm or yarn
- Supabase account

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/europe-gas.git
   cd europe-gas
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up environment variables:
   - Create a `.env` file in the project root
   - Add the following variables:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Start the development server:
   ```
   npm run dev
   ```

### Supabase Setup

See the detailed instructions in [supabase/README.md](supabase/README.md) for setting up:
- Project and database
- Authentication with phone numbers
- Database schema and tables
- Row Level Security (RLS) policies
- Storage buckets

## Project Structure

- `/src` - Source code
  - `/components` - Reusable UI components
  - `/contexts` - React contexts for state management
  - `/pages` - Page components
  - `/utils` - Utility functions and API calls
  - `/styles` - Global styles and theme
  - `/assets` - Static assets

- `/supabase` - Supabase configuration files
  - `schema.sql` - Database schema definition
  - `README.md` - Setup instructions

## Development

### Authentication Flow

The app uses Supabase's phone authentication:
1. User enters phone number
2. OTP (One-Time Password) is sent via SMS
3. User verifies with the OTP
4. JWT token is issued and stored

### User Roles

- **Admin**: Can manage users, upload parts, view reports
- **User**: Can enter part IDs and view personal stats

### Bonus Calculation

- Users earn $1 for each valid spare part entered
- Parts are validated against the database
- Duplicate entries are rejected
- Bonuses are paid out quarterly

## Deployment

1. Build the application:
   ```
   npm run build
   ```

2. Deploy the `dist` folder to your hosting provider of choice (Vercel, Netlify, etc.)

## License

This project is licensed under the MIT License - see the LICENSE file for details.
