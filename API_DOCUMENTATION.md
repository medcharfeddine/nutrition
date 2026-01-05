# NutriEd API Documentation

## Base URL
```
http://localhost:3000/api
```

## Authentication
All protected endpoints require a valid NextAuth session. Authentication is handled via HTTP-only cookies automatically.

## Rate Limiting
Not implemented in this version. Consider adding in production.

---

## Public Endpoints

### Authentication

#### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "user": {
    "email": "john@example.com",
    "name": "John Doe"
  }
}
```

**Status:** 201 Created

---

#### Login User
```http
POST /auth/[...nextauth]
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response:** NextAuth handles this automatically with session cookie

---

### Content Management

#### Get All Content
```http
GET /admin/content
```

**Query Parameters:**
- `category` (optional): Filter by category
  - nutrition-basics
  - meal-planning
  - weight-management
  - healthy-eating
  - fitness
  - mindfulness

**Response:**
```json
{
  "contents": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "title": "Introduction to Nutrition",
      "type": "video",
      "description": "Learn nutrition basics",
      "mediaUrl": "https://example.com/video.mp4",
      "category": "nutrition-basics",
      "tags": ["nutrition", "basics"],
      "createdAt": "2026-01-04T10:00:00Z",
      "updatedAt": "2026-01-04T10:00:00Z"
    }
  ]
}
```

---

## Protected Endpoints (Requires Authentication)

### User Profile

#### Get User Profile
```http
GET /profile
Authorization: Bearer <session-token>
```

**Response:**
```json
{
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "profile": {
      "age": 30,
      "gender": "male",
      "lifestyle": "moderate",
      "habits": ["exercising", "cooking"],
      "diseases": [],
      "dietaryPreferences": ["vegetarian"],
      "calorieGoal": 2000,
      "proteinGoal": 100,
      "carbGoal": 250,
      "fatGoal": 65
    },
    "createdAt": "2026-01-04T09:00:00Z",
    "updatedAt": "2026-01-04T10:00:00Z"
  }
}
```

**Status:** 200 OK

---

#### Update User Profile
```http
PUT /profile
Authorization: Bearer <session-token>
Content-Type: application/json

{
  "age": 30,
  "gender": "male",
  "lifestyle": "active",
  "habits": ["exercising", "cooking", "meal-prep"],
  "diseases": [],
  "dietaryPreferences": ["vegetarian", "gluten-free"],
  "calorieGoal": 2200,
  "proteinGoal": 110,
  "carbGoal": 275,
  "fatGoal": 70
}
```

**Response:**
```json
{
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "profile": {
      "age": 30,
      "gender": "male",
      "lifestyle": "active",
      "habits": ["exercising", "cooking", "meal-prep"],
      "diseases": [],
      "dietaryPreferences": ["vegetarian", "gluten-free"],
      "calorieGoal": 2200,
      "proteinGoal": 110,
      "carbGoal": 275,
      "fatGoal": 70
    },
    "createdAt": "2026-01-04T09:00:00Z",
    "updatedAt": "2026-01-04T10:30:00Z"
  }
}
```

**Status:** 200 OK

---

## Admin Endpoints (Requires Admin Role)

### User Management

#### Get All Users
```http
GET /admin/users
Authorization: Bearer <admin-session-token>
```

**Response:**
```json
{
  "users": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user",
      "profile": { ... },
      "createdAt": "2026-01-04T09:00:00Z",
      "updatedAt": "2026-01-04T10:00:00Z"
    }
  ]
}
```

**Status:** 200 OK

---

#### Delete User
```http
DELETE /admin/users?id=507f1f77bcf86cd799439011
Authorization: Bearer <admin-session-token>
```

**Response:**
```json
{
  "message": "User deleted successfully"
}
```

**Status:** 200 OK

---

### Content Management

#### Create Content
```http
POST /admin/content
Authorization: Bearer <admin-session-token>
Content-Type: application/json

{
  "title": "Advanced Nutrition Guide",
  "type": "post",
  "description": "Comprehensive guide to advanced nutrition",
  "mediaUrl": "https://example.com/guide.pdf",
  "content": "Full content text here...",
  "category": "nutrition-basics",
  "tags": ["nutrition", "advanced", "guide"]
}
```

**Response:**
```json
{
  "message": "Content created successfully",
  "content": {
    "_id": "507f1f77bcf86cd799439012",
    "title": "Advanced Nutrition Guide",
    "type": "post",
    "description": "Comprehensive guide to advanced nutrition",
    "mediaUrl": "https://example.com/guide.pdf",
    "content": "Full content text here...",
    "category": "nutrition-basics",
    "tags": ["nutrition", "advanced", "guide"],
    "createdAt": "2026-01-04T11:00:00Z",
    "updatedAt": "2026-01-04T11:00:00Z"
  }
}
```

**Status:** 201 Created

---

#### Update Content
```http
PUT /admin/content?id=507f1f77bcf86cd799439012
Authorization: Bearer <admin-session-token>
Content-Type: application/json

{
  "title": "Updated Nutrition Guide",
  "description": "Updated comprehensive guide to advanced nutrition"
}
```

**Response:**
```json
{
  "message": "Content updated successfully",
  "content": {
    "_id": "507f1f77bcf86cd799439012",
    "title": "Updated Nutrition Guide",
    "type": "post",
    "description": "Updated comprehensive guide to advanced nutrition",
    "mediaUrl": "https://example.com/guide.pdf",
    "content": "Full content text here...",
    "category": "nutrition-basics",
    "tags": ["nutrition", "advanced", "guide"],
    "createdAt": "2026-01-04T11:00:00Z",
    "updatedAt": "2026-01-04T11:15:00Z"
  }
}
```

**Status:** 200 OK

---

#### Delete Content
```http
DELETE /admin/content?id=507f1f77bcf86cd799439012
Authorization: Bearer <admin-session-token>
```

**Response:**
```json
{
  "message": "Content deleted successfully"
}
```

**Status:** 200 OK

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Invalid input data"
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized"
}
```

### 403 Forbidden
```json
{
  "error": "Unauthorized. Admin access required."
}
```

### 404 Not Found
```json
{
  "error": "User not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

---

## Content Types

### Type Options
- `video` - Video content (YouTube, Vimeo, etc.)
- `post` - Blog post or article
- `infographic` - Visual infographic

### Category Options
- `nutrition-basics` - Fundamental nutrition concepts
- `meal-planning` - Meal planning strategies
- `weight-management` - Weight loss and management
- `healthy-eating` - General healthy eating
- `fitness` - Exercise and fitness
- `mindfulness` - Mental wellness and mindfulness

---

## Rate Limiting (Future Enhancement)
- Per IP: 100 requests/minute
- Per User: 1000 requests/hour
- Per Admin: 5000 requests/hour

---

## Webhooks (Future Enhancement)
- User registration
- Profile updates
- Content creation
- User deletion

---

## Pagination (Future Enhancement)
```
GET /admin/users?page=1&limit=10
GET /admin/content?page=1&limit=20
```

---

## Testing with cURL

### Register User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "securePassword123"
  }'
```

### Get Profile
```bash
curl -X GET http://localhost:3000/api/profile \
  -H "Cookie: next-auth.session-token=<your-session-token>"
```

### Create Content (Admin)
```bash
curl -X POST http://localhost:3000/api/admin/content \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=<admin-session-token>" \
  -d '{
    "title": "New Content",
    "type": "post",
    "description": "Content description",
    "mediaUrl": "https://example.com/media",
    "category": "nutrition-basics",
    "tags": ["nutrition"]
  }'
```

---

## Changelog

### v1.0.0 (Initial Release)
- Basic user authentication and registration
- User profile management
- Content management
- Admin dashboard
- Role-based access control
