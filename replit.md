# Overview

ROSAE is a comprehensive theatre management system built for theatre rental businesses. The application provides detailed booking entry, financial tracking, analytics, and employee management features. It serves as a complete solution for managing theatre operations including booking management, expense tracking, leave applications, user management, and comprehensive analytics dashboards.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern component patterns
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management with caching and synchronization
- **UI Components**: Shadcn/ui component library built on Radix UI primitives for accessible, customizable components
- **Styling**: Tailwind CSS with custom ROSAE brand color scheme (red and dark gray theme)
- **Form Management**: React Hook Form with Zod validation for type-safe form handling
- **Charts**: Recharts for data visualization and analytics dashboards

## Backend Architecture
- **Runtime**: Node.js with Express.js REST API
- **Language**: TypeScript for full-stack type safety
- **Build System**: Vite for fast development and optimized production builds
- **Session Management**: Express sessions for user authentication state

## Data Storage
- **Database**: SQLite with Better-SQLite3 for local development and simple deployment
- **ORM**: Drizzle ORM for type-safe database operations
- **Schema Management**: Drizzle Kit for migrations and schema evolution
- **File Storage**: Local SQLite file (`rosae.db`) for data persistence

## Authentication & Authorization
- **Strategy**: JWT tokens with bcrypt password hashing
- **Session Storage**: Express sessions with in-memory storage
- **Role-based Access**: Admin and employee roles with different permission levels
- **Development Mode**: Simplified authentication bypass for development environment

## Key Features & Modules
- **Booking Management**: Theatre reservation system with time slots, guest capacity, and payment tracking
- **Financial Tracking**: Cash and UPI payment recording, expense management, and revenue analytics
- **Analytics Dashboard**: Revenue charts, payment method breakdowns, and booking statistics
- **User Management**: Employee and admin account management with role-based permissions
- **Leave Management**: Employee leave application and approval workflow
- **Verification System**: Booking verification and audit trail functionality

## API Design
- **Architecture**: RESTful API with conventional HTTP methods
- **Data Format**: JSON request/response bodies
- **Error Handling**: Centralized error handling with appropriate HTTP status codes
- **Query Parameters**: Support for filtering, pagination, and date ranges

# External Dependencies

## Core Runtime Dependencies
- **Express.js**: Web framework for API endpoints and middleware
- **Better-SQLite3**: Embedded database for data persistence
- **Drizzle ORM**: Type-safe database operations and query building
- **bcryptjs**: Password hashing for secure authentication
- **jsonwebtoken**: JWT token generation and verification

## Frontend Libraries
- **React**: Component-based UI framework with hooks
- **TanStack Query**: Server state management and caching
- **Wouter**: Lightweight routing solution
- **Radix UI**: Accessible component primitives
- **Tailwind CSS**: Utility-first CSS framework
- **React Hook Form**: Form state management and validation
- **Zod**: Runtime type validation
- **Recharts**: Chart and data visualization library

## Development Tools
- **Vite**: Build tool and development server
- **TypeScript**: Static type checking
- **ESBuild**: Fast JavaScript bundler for production
- **PostCSS**: CSS processing with Tailwind integration

## Optional Integrations
- **SendGrid**: Email service integration (configured but not actively used)
- **Calendar APIs**: External calendar integration capabilities for booking synchronization