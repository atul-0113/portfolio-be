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

## Resume Builder

### GET `/api/resumes`

Returns resumes owned by the authenticated user. Admin users can see all resumes.

Response `200`:

```json
[
  {
    "id": "uuid",
    "userId": "uuid",
    "title": "Senior Frontend Resume",
    "slug": "senior-frontend-resume",
    "domain": "frontend",
    "templateId": "uuid",
    "status": "draft",
    "visibility": "private",
    "currentVersionId": "uuid",
    "currentVersion": {
      "id": "uuid",
      "versionNumber": 1,
      "resumeJson": {}
    },
    "metadata": {
      "title": "Senior Frontend Resume",
      "slug": "senior-frontend-resume",
      "domain": "frontend",
      "status": "draft",
      "visibility": "private",
      "templateId": "uuid",
      "currentVersionId": "uuid",
      "currentVersionNumber": 1,
      "versionCount": 1,
      "createdAt": "2026-05-08T10:00:00.000Z",
      "updatedAt": "2026-05-08T10:00:00.000Z"
    },
    "themeSettings": {
      "font": "Inter",
      "accentColor": "#2563eb"
    },
    "createdAt": "2026-05-08T10:00:00.000Z",
    "updatedAt": "2026-05-08T10:00:00.000Z"
  }
]
```

### POST `/api/resumes`

Creates a resume. Users may select a template with `templateId`, or omit it and provide custom `themeSettings` and `resumeJson`.

Request:

```json
{
  "title": "Senior Frontend Resume",
  "slug": "senior-frontend-resume",
  "domain": "frontend",
  "templateId": "uuid",
  "status": "draft",
  "visibility": "private",
  "themeSettings": {
    "font": "Inter",
    "accentColor": "#2563eb",
    "layout": "compact"
  },
  "resumeJson": {
    "basics": {
      "name": "User Name",
      "headline": "Senior Frontend Engineer"
    },
    "sections": []
  },
  "changeSummary": "Initial resume draft"
}
```

Response `201`:

```json
{
  "message": "Resume created successfully",
  "resume": {
    "id": "uuid",
    "title": "Senior Frontend Resume",
    "currentVersionId": "uuid"
  }
}
```

### GET `/api/resumes/:id`

Returns a resume with its selected template and current version.

Response `200`:

```json
{
  "id": "uuid",
  "title": "Senior Frontend Resume",
  "template": {
    "id": "uuid",
    "name": "Modern Resume"
  },
  "currentVersion": {
    "id": "uuid",
    "versionNumber": 1,
    "resumeJson": {}
  }
}
```

### PATCH `/api/resumes/:id`

Updates resume metadata, selected template, status, visibility, or theme settings.

Request:

```json
{
  "title": "Updated Resume",
  "templateId": "uuid",
  "status": "published",
  "visibility": "public",
  "themeSettings": {
    "font": "Lato",
    "accentColor": "#111827"
  }
}
```

Response `200`:

```json
{
  "message": "Resume updated successfully",
  "resume": {
    "id": "uuid",
    "title": "Updated Resume",
    "visibility": "public"
  }
}
```

### DELETE `/api/resumes/:id`

Deletes a resume and its versions.

Response `200`:

```json
{
  "message": "Resume deleted successfully"
}
```

### GET `/api/resumes/:id/versions`

Returns version history for a resume.

Response `200`:

```json
[
  {
    "id": "uuid",
    "resumeId": "uuid",
    "versionNumber": 2,
    "resumeJson": {},
    "changeSummary": "Updated work experience",
    "createdBy": "uuid",
    "createdAt": "2026-05-08T10:15:00.000Z"
  }
]
```

### POST `/api/resumes/:id/versions`

Creates a new version and makes it the current version.

Request:

```json
{
  "resumeJson": {
    "basics": {
      "name": "User Name"
    },
    "sections": []
  },
  "changeSummary": "Updated skills section"
}
```

Response `201`:

```json
{
  "message": "Resume version created successfully",
  "version": {
    "id": "uuid",
    "versionNumber": 2,
    "resumeJson": {}
  }
}
```

## Resume Templates

### GET `/api/resumes/templates`

Returns active system templates plus templates created by the authenticated user.

Response `200`:

```json
[
  {
    "id": "uuid",
    "name": "Modern Resume",
    "slug": "modern-resume",
    "thumbnailUrl": "https://example.com/thumb.png",
    "category": "software",
    "isPremium": false,
    "isSystem": true,
    "isActive": true,
    "config": {
      "sections": ["summary", "experience", "skills"]
    },
    "createdById": null,
    "createdAt": "2026-05-08T10:00:00.000Z"
  }
]
```

### POST `/api/resumes/templates`

Creates a custom resume template for the authenticated user. Admin users can also create system or premium templates.

Request:

```json
{
  "name": "My Custom Template",
  "slug": "my-custom-template",
  "thumbnailUrl": "https://example.com/thumb.png",
  "category": "software",
  "isPremium": false,
  "isSystem": false,
  "config": {
    "layout": "two-column",
    "sections": ["summary", "experience", "projects", "skills"],
    "theme": {
      "font": "Inter",
      "accentColor": "#2563eb"
    }
  }
}
```

Response `201`:

```json
{
  "message": "Resume template created successfully",
  "template": {
    "id": "uuid",
    "name": "My Custom Template",
    "isSystem": false,
    "config": {}
  }
}
```

### GET `/api/resumes/templates/:id`

Returns a system template or a custom template owned by the authenticated user.

## Portfolio Templates

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
