# Pro-UR Task Management System

A full-stack SaaS-style task management application with multi-tenant organizations, advanced features, and modern UI.

## 🚀 Features

- **Multi-tenant organizations** - Users can belong to multiple organizations
- **Role-based permissions** - ADMIN and MEMBER roles with different capabilities
- **JWT Authentication** - Secure access with rotating refresh tokens
- **Projects & Kanban boards** - Organize tasks in customizable sections
- **Comments & Attachments** - Rich task collaboration features
- **Automations** - Rule engine for task automation
- **Recurring tasks** - Scheduled tasks with cron expressions
- **MagicBento UI System** - Interactive animated UI components
- **Full testing suite** - Backend, frontend, and e2e tests
- **Docker deployment** - Production-ready containerized setup

## 🛠️ Tech Stack

### Backend
- Node.js 18+
- TypeScript
- Express
- Prisma ORM
- PostgreSQL
- Redis (BullMQ queue)
- MinIO/S3 for attachments
- JWT authentication
- Zod validation
- Winston logging

### Frontend
- React 18 + TypeScript
- Vite
- TailwindCSS
- React Router v6
- React Query
- Zustand
- React Hook Form
- Storybook
- Vitest + Testing Library
- Cypress for e2e tests
- MagicBento animated UI system

## 📁 Project Structure

```
pro-ur/
├── backend/                 # Backend API server
│   ├── src/
│   │   ├── api/            # API route definitions
│   │   ├── controllers/    # Request handlers
│   │   ├── services/       # Business logic
│   │   ├── workers/        # Background job processors
│   │   ├── schedulers/     # Cron job schedulers
│   │   ├── auth/           # Authentication logic
│   │   ├── middleware/     # Express middleware
│   │   ├── utils/          # Utility functions
│   │   └── prisma/         # Database schema
│   └── ...
├── frontend/                # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── layouts/        # Page layouts
│   │   ├── pages/          # Route components
│   │   ├── store/          # Global state (Zustand)
│   │   ├── hooks/          # Custom React hooks
│   │   ├── utils/          # Utility functions
│   │   └── magicbento/     # MagicBento UI system
│   └── ...
├── docker-compose.yml      # Docker orchestration
├── .env.example           # Environment variables template
└── docs/                  # Documentation
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Docker & Docker Compose
- PostgreSQL (or Docker for auto-setup)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd pro-ur
```

2. Install dependencies:
```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend && npm install && cd ..

# Install frontend dependencies  
cd frontend && npm install && cd ..
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Set up the database:
```bash
cd backend
npx prisma migrate dev
npx prisma db seed # if you have seed data
```

5. Run the application:
```bash
# Development mode (separate terminals)
npm run dev:backend
npm run dev:frontend

# Or run both with:
npm run dev
```

### Docker Setup

1. Build and run with Docker Compose:
```bash
docker-compose up --build
```

2. The application will be available at:
   - Backend API: http://localhost:3000
   - Frontend: http://localhost:80
   - MinIO Console: http://localhost:9001

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm run test
```

### Frontend Tests
```bash
cd frontend
npm run test
```

### End-to-End Tests
```bash
cd frontend
npm run test:e2e
```

## 📚 API Documentation

The API follows REST conventions and is versioned at `/api/v1`.

### Authentication
All endpoints except `/auth/*` require a valid JWT token in the Authorization header:
```
Authorization: Bearer <access_token>
```

### Available Endpoints

#### Authentication
- `POST /api/v1/auth/register` - Register a new user
- `POST /api/v1/auth/login` - Login user
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/logout` - Logout user

#### Organizations
- `GET /api/v1/orgs/:id` - Get organization details
- `POST /api/v1/orgs` - Create a new organization

#### Projects
- `GET /api/v1/orgs/:id/projects` - Get projects for an organization
- `POST /api/v1/orgs/:id/projects` - Create a new project

#### Sections
- `POST /api/v1/projects/:id/sections` - Create a new section
- `PATCH /api/v1/sections/:id` - Update a section

#### Tasks
- `GET /api/v1/projects/:id/tasks` - Get tasks for a project
- `POST /api/v1/projects/:id/tasks` - Create a new task
- `PATCH /api/v1/tasks/:id` - Update a task
- `DELETE /api/v1/tasks/:id` - Delete a task

## 🎨 MagicBento UI System

MagicBento is our custom animated UI system featuring:

- Particle effects
- Spotlight following cursor
- Border glow animations
- Tilt on hover
- Magnetism effect
- Ripple effects
- GSAP-powered animations
- CSS variables for customization
- Reduced-motion and mobile fallbacks

## 🚀 Deployment

The application is designed for containerized deployment:

1. Build the production images:
```bash
docker-compose build
```

2. Deploy with Docker Compose:
```bash
docker-compose up -d
```

For production, ensure you have:
- SSL certificates for HTTPS
- Proper environment variables set
- Database backups configured
- Monitoring and logging set up

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.