# PortfolioPro Backend API

Base URL:

```text
http://localhost:5001
```

API routes are mounted under `/api`.

## Authentication

Protected endpoints accept a JWT in either header:

```http
Authorization: Bearer <token>
```

or:

```http
token: <token>
```

Admin-only endpoints require the authenticated user to have `role: "ADMIN"`.

## Error Response

```json
{
  "status": "error",
  "message": "Error message"
}
```

## Health

### GET `/health`

Response `200`:

```json
{
  "status": "OK"
}
```

## Auth

### POST `/api/auth/register`

Registers a new user with `role: "USER"`.

Request:

```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "User Name"
}
```

Response `201`:

```json
{
  "message": "User created successfully",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "User Name",
    "role": "USER",
    "token": "jwt_token"
  }
}
```

### POST `/api/auth/signup`

Alias for `/api/auth/register`.

### POST `/api/auth/login`

Request:

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

Response `200`:

```json
{
  "message": "Login successful",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "User Name",
    "role": "USER",
    "token": "jwt_token"
  }
}
```

### POST `/api/auth/logout`

Response `200`:

```json
{
  "message": "Logged out successfully"
}
```

## Users

### GET `/api/users`

Admin only. Returns all users.

Response `200`:

```json
[
  {
    "id": "uuid",
    "email": "admin@example.com",
    "name": "Admin User",
    "role": "ADMIN",
    "isActive": true,
    "isSubscribed": false,
    "mobileNumber": null,
    "createdAt": "2026-05-07T15:30:00.000Z"
  }
]
```

### GET `/api/users/profile`

Returns the authenticated user's profile.

Response `200`:

```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "User Name",
    "role": "USER"
  }
}
```

### PATCH `/api/users/profile`

Request:

```json
{
  "name": "Updated Name",
  "email": "updated@example.com"
}
```

Response `200`:

```json
{
  "message": "Profile updated successfully",
  "user": {
    "id": "uuid",
    "email": "updated@example.com",
    "name": "Updated Name",
    "role": "USER"
  }
}
```

## Categories

### GET `/api/categories`

Returns all categories. Requires authentication.

Response `200`:

```json
[
  {
    "id": "uuid",
    "categoryName": "Portfolio",
    "isActive": true,
    "categoryImagePath": "uploads/category.png",
    "createdOn": "2026-05-07T15:30:00.000Z",
    "createdById": "uuid"
  }
]
```

### POST `/api/categories`

Admin only. Creates a category.

Content type: `multipart/form-data`

Request fields:

```text
categoryName: Portfolio
isActive: true
categoryImage: <file>
```

Response `201`:

```json
{
  "message": "Category created successfully",
  "category": {
    "id": "uuid",
    "categoryName": "Portfolio",
    "isActive": true,
    "categoryImagePath": "uploads/category.png",
    "createdOn": "2026-05-07T15:30:00.000Z",
    "createdById": "uuid"
  }
}
```

### PATCH `/api/categories/:id`

Admin only. Updates category fields and can mark a category active or inactive.

Content type: `multipart/form-data`

Request fields:

```text
categoryName: Portfolio Updated
isActive: false
categoryImage: <file>
```

Response `200`:

```json
{
  "message": "Category updated successfully",
  "category": {
    "id": "uuid",
    "categoryName": "Portfolio Updated",
    "isActive": false,
    "categoryImagePath": "uploads/new-category.png",
    "createdOn": "2026-05-07T15:30:00.000Z",
    "createdById": "uuid"
  }
}
```

### PUT `/api/categories/:id`

Alias for `PATCH /api/categories/:id`.

## Templates

### GET `/api/templates`

Returns templates created by the authenticated user.

Response `200`:

```json
[
  {
    "id": "uuid",
    "templateName": "Template Name",
    "categoryType": "uuid",
    "createdOn": "2026-05-07T15:30:00.000Z",
    "createdById": "uuid",
    "isActive": true,
    "code": "<template code>"
  }
]
```

## Portfolio Placeholders

### GET `/api/portfolios`

Response `501`:

```json
{
  "message": "Portfolio APIs are scaffolded and will be wired in a future iteration."
}
```

### `/api/portfolios/categories`

Mounted category routes are also available under this path.

## Admin

### GET `/api/admin/dashboard`

Admin only. Returns dashboard summary counts.

Response `200`:

```json
{
  "users": {
    "total": 10,
    "active": 9,
    "admins": 1
  },
  "categories": {
    "total": 5,
    "active": 4,
    "inactive": 1
  },
  "templates": {
    "total": 12,
    "active": 10
  }
}
```

## TODO Placeholder APIs

The following modules are scaffolded and return `501` until wired later:

- `/api/resumes`
- `/api/ai`
- `/api/billing`

Response:

```json
{
  "message": "Feature name is marked TODO Later and will be wired in a future iteration."
}
```

## Swagger

Swagger UI is available at:

```text
GET /api-docs
```

OpenAPI JSON is available at:

```text
GET /api-docs.json
```
