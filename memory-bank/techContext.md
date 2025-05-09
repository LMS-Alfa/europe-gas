# Technical Context: Europe Gas Analytics

## Technology Stack
- **Frontend**:
  - React (main framework)
  - styled-components (styling)
  - Framer Motion (animations)
  - PapaParse (CSV parsing)
  - React Router (navigation)
  - Context API (state management)
  - react-icons (icon library)

- **Backend**:
  - Supabase (Backend-as-a-Service)
  - PostgreSQL (database)
  - Supabase Auth (phone-based authentication)
  - Supabase Storage (file storage)
  - Supabase Functions (serverless functions)

- **Infrastructure**:
  - Vercel or Netlify (hosting/deployment)
  - GitHub (version control)

## Development Environment
- Node.js and npm/yarn for package management
- Git for version control
- Modern web browser with developer tools
- Code editor (e.g., VS Code, Cursor)
- Supabase CLI for local development and migrations
- Environment variables for configuration
- Mobile device emulation for responsive testing

## Dependencies
- @supabase/supabase-js: Supabase JavaScript client
- framer-motion: Animation library
- papaparse: CSV parsing library
- react: UI library
- react-dom: DOM rendering for React
- react-router-dom: Routing
- styled-components: CSS-in-JS styling library
- react-icons: Icon library with Feather icons and others
- Other supporting libraries as needed

## External Integrations
- Supabase platform services
- SMS service for phone authentication (via Supabase)
- Optional: Export functionality to external systems

## Tooling
- **Development Tools**:
  - ESLint and Prettier for code quality
  - CursorAI for development assistance
  - npm/yarn for package management
  - Git for version control
  - Browser dev tools for responsive design testing

- **Testing Tools**:
  - Jest for unit testing
  - React Testing Library for component testing
  - Cypress for E2E testing (optional)
  - Mobile device simulators for responsive testing

- **Deployment Tools**:
  - Vercel or Netlify for frontend deployment
  - Supabase CLI for database migrations

- **Monitoring Tools**:
  - Supabase dashboard for backend monitoring
  - Vercel/Netlify analytics for frontend performance

## Technical Constraints
- Supabase free tier limitations
- Browser compatibility (modern browsers)
- Mobile device support requirements
- Performance considerations for CSV processing
- Security requirements for handling user data and authentication
- SMS rate limits for phone-based authentication

## UI Implementation Patterns
- Responsive GridLayout component for layout management
- Card-style layouts for tables on mobile devices
- Glass morphism effects for modern UI elements
- Touch-friendly interaction patterns for mobile users
- Optimized layouts with eliminated padding for mobile devices
- Responsive tables that transform to cards on smaller screens

## Performance Considerations
- Optimize CSV parsing for large files
- Implement pagination for large datasets
- Use proper indexing in database tables
- Optimize animations for lower-end devices
- Consider lazy loading for admin dashboard components
- Minimize layout shifts on mobile devices
- Optimize touch interactions for mobile performance

## Security Requirements
- Phone-based authentication via Supabase Auth
- Role-based access control (admin vs. user)
- Input validation for all user inputs
- Proper error handling to prevent information leakage
- Data validation before storage
- Secure handling of phone numbers

## Notes
This document describes the technologies used and technical considerations. It should be updated when new technologies are introduced or technical requirements change. 