# SautiCheck - Civic News Platform

## Overview

SautiCheck is a comprehensive civic news platform designed to combat misinformation and enhance civic engagement. The application provides verified news articles, AI-powered fact-checking capabilities, civic alerts, job opportunities, and community engagement features. Built with a modern full-stack architecture, it serves as a trusted source for civic information in Kenya.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript for type safety and better developer experience
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack React Query for server state management and caching
- **UI Components**: Radix UI primitives with shadcn/ui component library for consistent design
- **Styling**: Tailwind CSS with CSS variables for theming and responsive design
- **Form Handling**: React Hook Form with Zod validation for robust form management
- **Build Tool**: Vite for fast development and optimized production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework for RESTful API development
- **Language**: TypeScript for type safety across the entire stack
- **Authentication**: JWT-based authentication with bcrypt for password hashing
- **Session Management**: Express sessions with PostgreSQL session store
- **API Design**: RESTful endpoints with consistent error handling and logging middleware

### Data Storage
- **Database**: PostgreSQL with Neon serverless database for scalability
- **ORM**: Drizzle ORM for type-safe database operations and migrations
- **Schema Management**: Shared TypeScript schemas between client and server using Zod
- **Local Storage**: Browser localStorage for bookmarks and user preferences

### Authentication & Authorization
- **Strategy**: JWT token-based authentication
- **Password Security**: bcryptjs for password hashing with salt rounds
- **Role-based Access**: User roles (user, admin) with different permission levels
- **Token Management**: Client-side token storage with automatic request headers

### Key Features & Components
- **News Feed**: Categorized articles with filtering and search capabilities
- **Fact Checker**: AI-powered text analysis for misinformation detection
- **Civic Alerts**: Real-time notifications for civic engagement opportunities
- **Jobs Hub**: Employment opportunities from trusted organizations
- **Bookmarks**: Personal article saving and management system
- **Admin Dashboard**: Content management for articles, alerts, and jobs

### Responsive Design
- **Mobile-First**: Progressive enhancement from mobile to desktop
- **Adaptive Navigation**: Mobile bottom navigation and desktop sidebar
- **Breakpoint Strategy**: Tailwind's responsive utilities for consistent layouts
- **Touch-Friendly**: Optimized touch targets and gestures for mobile devices

## External Dependencies

### Core Framework Dependencies
- **React Ecosystem**: React 18+ with TypeScript, React Router (Wouter), React Hook Form
- **UI Framework**: Radix UI primitives, shadcn/ui components, Tailwind CSS
- **State Management**: TanStack React Query for server state, local storage for client state

### Backend Dependencies
- **Server Framework**: Express.js with TypeScript, CORS, body parsing middleware
- **Database**: PostgreSQL with Neon serverless, Drizzle ORM, connection pooling
- **Authentication**: JWT tokens, bcryptjs hashing, express-session management
- **Development**: Vite for frontend bundling, esbuild for backend compilation

### Development Tools
- **Build System**: Vite with React plugin, PostCSS for CSS processing
- **Type Safety**: TypeScript with strict configuration, Zod for runtime validation
- **Code Quality**: ESLint configuration, consistent import paths and aliases

### Third-Party Integrations
- **Font Loading**: Google Fonts integration for typography
- **Icon System**: Font Awesome for consistent iconography
- **Date Handling**: date-fns for date formatting and manipulation
- **Development**: Replit-specific plugins for development environment integration

### Database Schema
- **Users**: Authentication, profile data, activity tracking
- **Articles**: News content with categorization and verification status
- **Civic Alerts**: Time-sensitive civic engagement notifications
- **Jobs**: Employment opportunities with categorization and filtering
- **Fact Checks**: User-generated fact-checking history and results