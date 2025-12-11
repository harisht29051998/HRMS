# API Documentation

## Base URL
All API endpoints are prefixed with `/api/v1`

## Authentication
Most endpoints require authentication via JWT tokens. Include the access token in the Authorization header:

```
Authorization: Bearer <access_token>
```

## Response Format
All responses follow this structure:
```json
{
  "data": { ... }, // Response data (may be omitted on errors)
  "message": "Success message", // Optional success message
  "error": "Error message" // Present only on errors
}
```

## Endpoints

### Authentication

#### POST /auth/register
Register a new user

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe"
  },
  "tokens": {
    "accessToken": "jwt_access_token",
    "refreshToken": "jwt_refresh_token",
    "expiresIn": "15m"
  }
}
```

#### POST /auth/login
Login existing user

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe"
  },
  "tokens": {
    "accessToken": "jwt_access_token",
    "refreshToken": "jwt_refresh_token",
    "expiresIn": "15m"
  }
}
```

#### POST /auth/refresh
Refresh access token using refresh token

**Request Body:**
```json
{
  "refreshToken": "jwt_refresh_token"
}
```

**Response:**
```json
{
  "message": "Tokens refreshed successfully",
  "tokens": {
    "accessToken": "new_jwt_access_token",
    "refreshToken": "new_jwt_refresh_token",
    "expiresIn": "15m"
  }
}
```

#### POST /auth/logout
Logout user (revokes refresh token)

**Response:**
```json
{
  "message": "Logged out successfully"
}
```

### Organizations

#### GET /orgs/:id
Get organization details

**Path Parameters:**
- `id`: Organization ID

**Response:**
```json
{
  "id": "org_id",
  "name": "Organization Name",
  "slug": "org-slug",
  "logo": "logo_url",
  "createdAt": "2023-01-01T00:00:00.000Z",
  "updatedAt": "2023-01-01T00:00:00.000Z",
  "members": [
    {
      "id": "membership_id",
      "role": "ADMIN",
      "joinedAt": "2023-01-01T00:00:00.000Z",
      "user": {
        "id": "user_id",
        "email": "user@example.com",
        "firstName": "John",
        "lastName": "Doe"
      }
    }
  ]
}
```

#### POST /orgs
Create a new organization

**Request Body:**
```json
{
  "name": "New Organization",
  "slug": "new-org"
}
```

**Response:**
```json
{
  "id": "org_id",
  "name": "New Organization",
  "slug": "new-org",
  "logo": null,
  "createdAt": "2023-01-01T00:00:00.000Z",
  "updatedAt": "2023-01-01T00:00:00.000Z",
  "members": [
    {
      "id": "membership_id",
      "role": "ADMIN",
      "joinedAt": "2023-01-01T00:00:00.000Z",
      "user": {
        "id": "user_id",
        "email": "user@example.com",
        "firstName": "John",
        "lastName": "Doe"
      }
    }
  ]
}
```

### Projects

#### GET /orgs/:id/projects
Get all projects for an organization

**Path Parameters:**
- `id`: Organization ID

**Response:**
```json
[
  {
    "id": "project_id",
    "title": "Project Title",
    "description": "Project description",
    "color": "#3B82F6",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z",
    "organizationId": "org_id",
    "sections": [
      {
        "id": "section_id",
        "title": "To Do",
        "position": 0,
        "projectId": "project_id",
        "createdAt": "2023-01-01T00:00:00.000Z",
        "updatedAt": "2023-01-01T00:00:00.000Z"
      }
    ]
  }
]
```

#### POST /orgs/:id/projects
Create a new project

**Path Parameters:**
- `id`: Organization ID

**Request Body:**
```json
{
  "title": "New Project",
  "description": "Project description",
  "color": "#3B82F6"
}
```

**Response:**
```json
{
  "id": "project_id",
  "title": "New Project",
  "description": "Project description",
  "color": "#3B82F6",
  "createdAt": "2023-01-01T00:00:00.000Z",
  "updatedAt": "2023-01-01T00:00:00.000Z",
  "organizationId": "org_id",
  "sections": []
}
```

### Sections

#### POST /projects/:id/sections
Create a new section in a project

**Path Parameters:**
- `id`: Project ID

**Request Body:**
```json
{
  "title": "New Section",
  "position": 0
}
```

**Response:**
```json
{
  "id": "section_id",
  "title": "New Section",
  "position": 0,
  "projectId": "project_id",
  "createdAt": "2023-01-01T00:00:00.000Z",
  "updatedAt": "2023-01-01T00:00:00.000Z"
}
```

#### PATCH /sections/:id
Update a section

**Path Parameters:**
- `id`: Section ID

**Request Body:**
```json
{
  "title": "Updated Section Title",
  "position": 1
}
```

**Response:**
```json
{
  "id": "section_id",
  "title": "Updated Section Title",
  "position": 1,
  "projectId": "project_id",
  "createdAt": "2023-01-01T00:00:00.000Z",
  "updatedAt": "2023-01-01T00:00:00.000Z"
}
```

### Tasks

#### GET /projects/:id/tasks
Get all tasks for a project

**Path Parameters:**
- `id`: Project ID

**Response:**
```json
[
  {
    "id": "task_id",
    "title": "Task Title",
    "description": "Task description",
    "priority": "HIGH",
    "status": "TODO",
    "dueDate": "2023-12-31T23:59:59.000Z",
    "completedAt": null,
    "assigneeId": "user_id",
    "position": 0,
    "sectionId": "section_id",
    "projectId": "project_id",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z",
    "assignee": {
      "id": "user_id",
      "firstName": "John",
      "lastName": "Doe",
      "email": "user@example.com"
    },
    "section": {
      "id": "section_id",
      "title": "To Do"
    }
  }
]
```

#### POST /projects/:id/tasks
Create a new task

**Path Parameters:**
- `id`: Project ID

**Request Body:**
```json
{
  "title": "New Task",
  "description": "Task description",
  "priority": "NORMAL",
  "status": "TODO",
  "dueDate": "2023-12-31T23:59:59.000Z",
  "assigneeId": "user_id",
  "sectionId": "section_id",
  "position": 0
}
```

**Response:**
```json
{
  "id": "task_id",
  "title": "New Task",
  "description": "Task description",
  "priority": "NORMAL",
  "status": "TODO",
  "dueDate": "2023-12-31T23:59:59.000Z",
  "completedAt": null,
  "assigneeId": "user_id",
  "position": 0,
  "sectionId": "section_id",
  "projectId": "project_id",
  "createdAt": "2023-01-01T00:00:00.000Z",
  "updatedAt": "2023-01-01T00:00:00.000Z",
  "assignee": {
    "id": "user_id",
    "firstName": "John",
    "lastName": "Doe",
    "email": "user@example.com"
  },
  "section": {
    "id": "section_id",
    "title": "To Do"
  }
}
```

#### PATCH /tasks/:id
Update a task

**Path Parameters:**
- `id`: Task ID

**Request Body:**
```json
{
  "title": "Updated Task Title",
  "status": "IN_PROGRESS",
  "assigneeId": "another_user_id"
}
```

**Response:**
```json
{
  "id": "task_id",
  "title": "Updated Task Title",
  "description": "Task description",
  "priority": "NORMAL",
  "status": "IN_PROGRESS",
  "dueDate": "2023-12-31T23:59:59.000Z",
  "completedAt": null,
  "assigneeId": "another_user_id",
  "position": 0,
  "sectionId": "section_id",
  "projectId": "project_id",
  "createdAt": "2023-01-01T00:00:00.000Z",
  "updatedAt": "2023-01-01T00:00:00.000Z",
  "assignee": {
    "id": "another_user_id",
    "firstName": "Jane",
    "lastName": "Doe",
    "email": "jane@example.com"
  },
  "section": {
    "id": "section_id",
    "title": "To Do"
  }
}
```

#### DELETE /tasks/:id
Delete a task

**Path Parameters:**
- `id`: Task ID

**Response:**
Status: 204 No Content

## Error Responses

### 400 Bad Request
```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "email",
      "message": "Invalid email"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "error": "Access token required"
}
```

### 403 Forbidden
```json
{
  "error": "User does not have access to this project"
}
```

### 404 Not Found
```json
{
  "error": "Organization not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

## Rate Limiting
The API implements rate limiting to prevent abuse:
- 100 requests per 15 minutes per IP address
- Exceeded requests return 429 status code