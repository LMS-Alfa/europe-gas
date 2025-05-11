# System Patterns: Europe Gas Analytics

## Architecture Overview
The system follows a modern web application architecture with a React frontend and Supabase backend. The application uses a client-server model where the client (React) communicates with Supabase services through their JavaScript SDK. Phone-based authentication, database operations, and file storage are handled by Supabase, creating a serverless architecture that simplifies deployment and maintenance.

## Key Components
- **Frontend Application**: React-based SPA that handles UI rendering and client-side logic
- **Authentication Service**: Supabase Auth for phone-based user management and role-based access control
- **Database**: PostgreSQL database hosted on Supabase for data persistence
- **Storage Service**: Supabase Storage for CSV file uploads and processing
- **API Layer**: Centralized API functions that communicate with Supabase services
- **Dashboard Components**: Stat cards and data visualization components for the admin dashboard
- **Theme System**: Context-based theme management for light/dark mode support
- **Responsive Layout System**: Handling different display patterns for desktop and mobile

## Component Relationships
- The React frontend connects to Supabase services via the Supabase JavaScript client
- Centralized API functions in `api.js` handle data retrieval from Supabase
- Dashboard components fetch data through API functions and display statistics
- User authentication state determines available features and UI elements (admin vs. user views)
- Database tables are interconnected through relationships (users, parts, user_parts, bonus_logs)
- CSV upload triggers processing workflow that populates the parts table
- User part entry validation checks against the parts database
- Theme context provides theme information to all styled components
- GridLayout components transform based on device size

## Design Patterns
- **Centralized API Functions**: API calls encapsulated in dedicated functions for reusability
- **Modern Dashboard UI**: Stat cards with circular icon backgrounds and distinctive colors
- **Realtime Data Refresh**: Dashboard components with refresh functionality and loading states
- **Data Formatting Utilities**: Helper functions for consistent number and currency formatting
- **Phone-based Authentication**: Using phone numbers for user authentication
- **Role-based Access Control**: Different UI and features based on user role (admin/user)
- **Repository Pattern**: Supabase client acts as a repository layer for data access
- **Form Validation**: Client-side validation for user inputs
- **State Management**: React state and context for UI state management
- **Responsive Design**: Adaptive UI layout for different screen sizes with card-style layouts on mobile
- **Glass Morphism**: Modern UI styling pattern with translucent, blurred backgrounds
- **Theme Provider**: Context-based theme management for light/dark mode
- **Collapsible Navigation**: Sidebar that can collapse to icons-only for better space utilization
- **Gradient Effects**: Used for visual elements like the logo
- **Card Transformation**: Tables that transform into card layouts on mobile devices

## Data Flow
1. **User Authentication**: Phone number → Supabase Auth → JWT token → Frontend
2. **Dashboard Data Retrieval**: API functions → Supabase queries → Dashboard components
3. **Parts Upload (Admin)**: CSV file → Frontend parsing → Supabase database
4. **Part Entry (User)**: Part ID → Validation against database → Bonus calculation → Updated user stats
5. **Reporting**: Database queries → Aggregated data → UI rendering

## Critical Implementation Paths
- **Dashboard Data Retrieval**: Ensuring proper connection to Supabase for statistics
- **Phone Authentication**: Ensuring secure and reliable phone-based authentication
- **CSV Processing**: Ensuring proper parsing and validation of CSV files for parts upload
- **Bonus Calculation**: Accurately tracking and calculating user bonuses
- **Role-Based Security**: Ensuring proper access controls between admin and user roles
- **Data Validation**: Preventing duplicate entries and ensuring data integrity
- **Mobile Responsiveness**: Ensuring proper display and functionality across device sizes

## Technical Decisions
- Use Supabase for backend services to simplify development and deployment
- Implement centralized API functions in `api.js` for Supabase data retrieval
- Design modern stat cards with circular icon backgrounds and distinctive colors
- Implement dashboard refresh functionality with loading state indicators
- Add data formatting utilities for consistent number and currency display
- Implement phone-based authentication for better user experience
- Implement client-side CSV parsing with papaparse for immediate feedback
- Apply Framer Motion for animations to enhance user experience
- Develop responsive UI with card-style layouts on mobile
- Use glass morphism for modern UI elements
- Implement quarterly bonus calculation logic for periodic payouts
- Use react-icons/fi (Feather icons) for consistent, professional iconography
- Implement theme context for managing application appearance (light/dark mode)
- Transform tables into card layouts on mobile devices for better readability
- Optimize layouts by eliminating unnecessary padding on mobile devices

## System Constraints
- Supabase service limitations (API rate limits, storage quotas)
- Browser compatibility requirements
- Mobile responsiveness requirements
- Security constraints for role-based access
- Performance requirements for CSV processing
- SMS rate limits for phone-based authentication
- Dashboard data refresh rate limitations

## Notes
This document captures the system architecture and key technical decisions. It should be updated when architectural changes are made or new patterns are established. 