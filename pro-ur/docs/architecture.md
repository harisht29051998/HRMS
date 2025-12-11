# Architecture Documentation

## Overview

Pro-UR is a full-stack task management application built with a microservices-like architecture using a monorepo structure. The system is divided into two main components: a backend API server and a frontend React application.

## High-Level Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │◄──►│   Backend API    │◄──►│   PostgreSQL    │
│   (React)       │    │   (Node.js)      │    │   (Database)    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                              │
                    ┌──────────────────┐
                    │   Redis (Queue)  │
                    └──────────────────┘
                              │
                    ┌──────────────────┐
                    │   MinIO (S3)     │
                    │  (Attachments)   │
                    └──────────────────┘
```

## Backend Architecture

### Tech Stack
- **Runtime**: Node.js 18+
- **Framework**: Express.js (with potential for Fastify migration)
- **Language**: TypeScript
- **ORM**: Prisma
- **Database**: PostgreSQL (primary), with fallback to SQLite for local dev
- **Caching/Queues**: Redis with BullMQ
- **File Storage**: MinIO/S3 compatible storage

### Directory Structure
```
backend/
├── src/
│   ├── api/              # Route definitions
│   ├── controllers/      # Request handlers
│   ├── services/         # Business logic
│   ├── workers/          # Background job processors
│   ├── schedulers/       # Cron job schedulers
│   ├── auth/             # Authentication logic
│   ├── middleware/       # Express middleware
│   ├── utils/            # Utility functions
│   ├── prisma/           # Database schema & migrations
│   └── tests/            # Backend tests
```

### Data Flow
1. **Request Entry**: Express server receives HTTP requests
2. **Authentication**: JWT middleware validates access tokens
3. **Validation**: Zod validates request bodies/params
4. **Business Logic**: Controllers call service methods
5. **Data Access**: Prisma ORM interacts with PostgreSQL
6. **Response**: JSON response returned to client

### Security Layers
1. **Transport**: HTTPS in production
2. **Authentication**: JWT with rotating refresh tokens
3. **Authorization**: Role-based access control (RBAC)
4. **Input Validation**: Zod schema validation
5. **Rate Limiting**: Express-rate-limit middleware
6. **Security Headers**: Helmet.js
7. **CORS**: Configured for frontend domain only

## Frontend Architecture

### Tech Stack
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: TailwindCSS
- **Routing**: React Router v6
- **State Management**: Zustand
- **API Client**: React Query (TanStack Query)
- **Forms**: React Hook Form + Zod
- **Animations**: Framer Motion, GSAP
- **Icons**: Lucide React

### Directory Structure
```
frontend/
├── src/
│   ├── components/       # Reusable UI components
│   ├── layouts/          # Page layouts
│   ├── pages/            # Route components
│   ├── store/            # Global state (Zustand)
│   ├── hooks/            # Custom React hooks
│   ├── utils/            # Utility functions
│   ├── magicbento/       # MagicBento UI system
│   └── tests/            # Frontend tests
```

### State Management
- **Global State**: Zustand for application-wide state (user, orgs, etc.)
- **Server State**: React Query for API data caching and synchronization
- **Local State**: React useState/useReducer for component-specific state
- **Form State**: React Hook Form for complex forms

## Database Schema

### Core Entities
- **User**: Authentication and profile data
- **Organization**: Multi-tenant grouping
- **Project**: Task containers with sections
- **Section**: Kanban columns within projects
- **Task**: Individual work items
- **Comment**: Task discussions
- **Attachment**: File uploads
- **AutomationRule**: Business rules engine
- **RecurringTask**: Scheduled tasks
- **AuditLog**: Activity tracking

### Relationships
- Users belong to Organizations (many-to-many via membership)
- Organizations contain Projects
- Projects contain Sections
- Sections contain Tasks
- Tasks can have Comments and Attachments
- Users can be assigned to Tasks

## Authentication System

### JWT Implementation
- **Access Token**: Short-lived (15 minutes), for API requests
- **Refresh Token**: Long-lived (7 days), stored in DB, for token rotation
- **Token Rotation**: Refresh tokens are single-use and rotated on each refresh

### Flow
1. User registers/logs in
2. Server creates user session and returns tokens
3. Frontend stores tokens (securely)
4. API requests include access token in header
5. Middleware validates access token
6. On token expiry, refresh endpoint rotates tokens

## File Storage

### Attachments System
- **Storage**: MinIO (S3-compatible) for file storage
- **Security**: Presigned URLs for uploads/downloads
- **Types**: All common file types allowed
- **Size Limits**: Configurable upload limits

## Background Processing

### Queue System
- **Technology**: Redis + BullMQ
- **Use Cases**: 
  - Sending notifications
  - Processing file uploads
  - Running automation rules
  - Cleanup tasks

### Schedulers
- **Cron Jobs**: Node-cron or similar for recurring tasks
- **Use Cases**:
  - Recurring task creation
  - Data cleanup
  - Report generation

## MagicBento UI System

### Features
- **Animated Bento Cards**: Grid-based animated components
- **Interactive Effects**: 
  - Spotlight following cursor
  - Tilt on hover
  - Border glow animations
  - Particle effects
  - Ripple effects
- **Accessibility**: Reduced-motion support
- **Performance**: GSAP for smooth animations

## Testing Strategy

### Backend Tests
- **Unit Tests**: Jest for service/utils testing
- **Integration Tests**: Supertest for API endpoint testing
- **Database Tests**: In-memory SQLite for fast testing

### Frontend Tests
- **Unit Tests**: Vitest for utility functions
- **Component Tests**: Testing Library for React components
- **E2E Tests**: Cypress for user journey testing

## Deployment Architecture

### Containerization
- **Backend**: Node.js container with multi-stage build
- **Frontend**: Nginx container serving static files
- **Database**: PostgreSQL in separate container
- **Cache**: Redis in separate container
- **Storage**: MinIO in separate container

### CI/CD Pipeline
- **Build**: Automated builds on push to main
- **Test**: Automated testing on all PRs
- **Deploy**: Docker Compose deployment to production