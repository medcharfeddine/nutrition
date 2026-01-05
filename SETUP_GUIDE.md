# NutriEd - Production-Ready SaaS Platform for Personalized Nutrition Education

## Overview

NutriEd is a modern, full-stack SaaS platform designed for personalized nutrition education. It provides users with tailored nutrition plans, expert content, progress tracking, and an admin dashboard for content management.

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React 19, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB with Mongoose
- **Authentication**: NextAuth.js with Credentials provider
- **Validation**: Zod schema validation
- **Security**: bcryptjs for password hashing, JWT for sessions

## Project Structure

```
/app
  /auth
    /login/page.tsx           # User login page
    /register/page.tsx        # User registration page
    /[...nextauth]/route.ts   # NextAuth configuration
  /api
    /auth
      /register/route.ts      # Registration API
      /[...nextauth]/route.ts # NextAuth route handler
    /profile/route.ts         # User profile management
    /admin
      /users/route.ts         # Admin user management
      /content/route.ts       # Admin content management
  /dashboard/page.tsx         # User dashboard
  /profile/page.tsx           # User profile editor
  /admin/page.tsx             # Admin dashboard
  /resources/page.tsx         # Learning resources
  layout.tsx                  # Root layout with auth provider
  page.tsx                    # Landing page
  globals.css                 # Global styles

/lib
  /db.ts                      # MongoDB connection
  /auth.ts                    # NextAuth configuration
  /auth-provider.tsx          # Session provider wrapper

/models
  /User.ts                    # User schema and model
  /Content.ts                 # Content schema and model
```

## Features

### User Features
- ✅ User registration and login with email/password
- ✅ Secure authentication with JWT sessions
- ✅ Personalized nutrition profile (age, gender, lifestyle, dietary preferences)
- ✅ Health condition tracking
- ✅ Nutrition goal setting (calories, macros)
- ✅ Dashboard with profile overview
- ✅ Access to learning resources
- ✅ Responsive mobile-friendly UI

### Admin Features
- ✅ Admin dashboard for user management
- ✅ View all registered users
- ✅ User deletion capability
- ✅ Content management (create, read, update, delete)
- ✅ Content types: videos, posts, infographics
- ✅ Content categorization and tagging
- ✅ Role-based access control

## Database Models

### User Model
```typescript
{
  name: string
  email: string (unique)
  password: string (bcrypt hashed)
  role: 'user' | 'admin'
  profile: {
    age?: number
    gender?: string
    lifestyle?: string
    habits?: string[]
    diseases?: string[]
    dietaryPreferences?: string[]
    calorieGoal?: number
    proteinGoal?: number
    carbGoal?: number
    fatGoal?: number
  }
  createdAt: Date
  updatedAt: Date
}
```

### Content Model
```typescript
{
  title: string
  type: 'video' | 'post' | 'infographic'
  description: string
  mediaUrl: string
  content?: string
  category?: string (nutrition-basics, meal-planning, weight-management, etc.)
  tags?: string[]
  createdAt: Date
  updatedAt: Date
}
```

## API Routes

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/[...nextauth]` - NextAuth credential login

### User Profile
- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update user profile

### Admin Routes (Requires admin role)
- `GET /api/admin/users` - List all users
- `DELETE /api/admin/users?id=<userId>` - Delete user
- `GET /api/admin/content` - Get all content (public)
- `POST /api/admin/content` - Create content (admin only)
- `PUT /api/admin/content?id=<contentId>` - Update content (admin only)
- `DELETE /api/admin/content?id=<contentId>` - Delete content (admin only)

## Environment Variables

Create a `.env.local` file in the project root:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/nutrition-saas
NEXTAUTH_SECRET=your-secret-key-change-this-in-production
NEXTAUTH_URL=http://localhost:3000
NODE_ENV=development
```

### Generating NEXTAUTH_SECRET

```bash
openssl rand -base64 32
```

## Installation & Setup

### Prerequisites
- Node.js 18+ and npm/yarn
- MongoDB Atlas account or local MongoDB instance

### Steps

1. **Clone the repository**
```bash
cd c:\Users\medch\Desktop\hrm
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
Create `.env.local` file with MongoDB URI and NextAuth secret

4. **Create admin user (optional)**
Register a user and manually update the role in MongoDB:
```javascript
db.users.updateOne(
  { email: "admin@nutrition.com" },
  { $set: { role: "admin" } }
)
```

5. **Run development server**
```bash
npm run dev
```

Visit `http://localhost:3000` in your browser.

## Default Admin Credentials (for testing)

After setting up the database:
- Email: `admin@nutrition.com`
- Password: `password123`

## Pages & Routes

### Public Routes
- `/` - Landing page
- `/auth/login` - Login page
- `/auth/register` - Registration page

### Authenticated Routes (User)
- `/dashboard` - User dashboard
- `/profile` - User profile editor
- `/resources` - Learning resources

### Authenticated Routes (Admin)
- `/admin` - Admin dashboard
  - User management tab
  - Content management tab

## Security Features

1. **Password Hashing**: bcryptjs with 10 salt rounds
2. **Session Management**: JWT-based sessions via NextAuth
3. **Role-Based Access Control**: User and admin roles
4. **Input Validation**: Zod schema validation on all API routes
5. **Protected Routes**: Client-side route guards with session checks
6. **CORS & CSRF**: NextAuth built-in protections

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Connect repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy with automatic CI/CD

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Manual Deployment

1. Build the application:
```bash
npm run build
```

2. Start production server:
```bash
npm start
```

## Development

### Running Tests
```bash
npm run test
```

### Linting
```bash
npm run lint
```

### Building
```bash
npm run build
```

## Customization

### Adding New Content Categories
Edit `models/Content.ts` enum values:
```typescript
category: z.enum([
  'nutrition-basics',
  'meal-planning',
  'weight-management',
  'healthy-eating',
  'fitness',
  'mindfulness',
  'YOUR_NEW_CATEGORY', // Add here
])
```

### Styling
- Tailwind CSS configuration in `tailwind.config.ts`
- Global styles in `app/globals.css`
- Component-level styling with Tailwind classes

## Performance Optimizations

- MongoDB indexing on `email` field for user lookups
- NextAuth session caching
- Image optimization with Next.js Image component
- Code splitting with dynamic imports
- API response caching where appropriate

## Monitoring & Analytics

Consider integrating:
- Sentry for error tracking
- Vercel Analytics for performance monitoring
- LogRocket for session replay
- MongoDB Atlas monitoring

## Future Enhancements

1. **Meal Plan Generation**: AI-powered personalized meal plans
2. **Progress Tracking**: Visual charts and analytics
3. **Notifications**: Email and push notifications
4. **Social Features**: Community forums and challenges
5. **Payment Integration**: Stripe for premium features
6. **Video Streaming**: On-demand nutritionist consultations
7. **Mobile App**: React Native mobile application
8. **API Versioning**: RESTful API with versioning

## Support & Documentation

For NextAuth documentation: https://next-auth.js.org/
For MongoDB documentation: https://docs.mongodb.com/
For Next.js documentation: https://nextjs.org/docs

## License

Proprietary - All rights reserved

## Contact

For issues, feature requests, or support, contact the development team.

---

**Version**: 1.0.0  
**Last Updated**: January 4, 2026
