# NutriEd - Production-Ready SaaS for Personalized Nutrition Education

<div align="center">

![NutriEd](https://img.shields.io/badge/NutriEd-v1.0.0-blue)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green)
![NextAuth](https://img.shields.io/badge/NextAuth-v5-purple)

**A modern, full-stack SaaS platform for personalized nutrition education, meal planning, and health tracking.**

[Documentation](#documentation) • [API Reference](./API_DOCUMENTATION.md) • [Deployment Guide](./DEPLOYMENT.md)

</div>

---

## 🚀 Features

### For Users
- ✅ **Secure Authentication** - Email/password registration and login with NextAuth
- ✅ **Personalized Profiles** - Complete nutrition assessment questionnaire
- ✅ **Dashboard** - Overview of nutrition goals and profile status
- ✅ **Learning Resources** - Access to expert nutrition content
- ✅ **Profile Management** - Update goals, dietary preferences, health conditions
- ✅ **Responsive Design** - Works perfectly on desktop, tablet, and mobile

### For Admins
- ✅ **User Management** - View all users, delete accounts
- ✅ **Content Management** - Create, edit, delete nutrition resources
- ✅ **Content Types** - Videos, blog posts, infographics
- ✅ **Content Categorization** - Organize by topics and tags

---

## 📋 Tech Stack

- **Frontend**: Next.js 14, React 19, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB with Mongoose
- **Authentication**: NextAuth.js with JWT
- **Validation**: Zod
- **Security**: bcryptjs for password hashing

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB Atlas account
- npm or yarn

### Installation

1. **Install Dependencies**
```bash
cd c:\Users\medch\Desktop\hrm
npm install
```

2. **Configure Environment**
```bash
cp .env.example .env.local
# Edit .env.local with your MongoDB URI and NextAuth secret
```

3. **Generate NextAuth Secret**
```bash
openssl rand -base64 32
# Paste the output into NEXTAUTH_SECRET in .env.local
```

4. **Run Development Server**
```bash
npm run dev
```

5. **Access Application**
Visit `http://localhost:3000`

### First Login
Use test credentials:
- Email: `user@example.com`
- Password: `password123`

Or register a new account at `/auth/register`

---

## 📚 Documentation

- **[Setup Guide](./SETUP_GUIDE.md)** - Complete installation and configuration
- **[API Documentation](./API_DOCUMENTATION.md)** - All API endpoints with examples
- **[Deployment Guide](./DEPLOYMENT.md)** - Production deployment options (Vercel, Docker, AWS, GCP)
- **[Troubleshooting](./TROUBLESHOOTING.md)** - Common issues and solutions

---

## 🎯 Key Pages & Routes

### Public Routes
- `/` - Landing page with features overview
- `/auth/login` - User login page
- `/auth/register` - User registration page

### Authenticated Routes (Users)
- `/dashboard` - Personal dashboard with profile summary
- `/profile` - Nutrition profile editor
- `/resources` - Learning resources and content library

### Admin Routes (Admin Only)
- `/admin` - Admin dashboard with user and content management

---

## 🔐 Security Features

- **Password Security**: bcryptjs hashing with 10 salt rounds
- **Session Management**: JWT-based sessions via NextAuth
- **Role-Based Access Control**: User and Admin roles with middleware protection
- **Input Validation**: Zod schema validation on all API endpoints
- **Protected Routes**: Middleware-based route protection
- **CSRF Protection**: Built-in NextAuth protection
- **Secure Cookies**: HTTP-only session cookies

---

## 📊 Database Models

### User Model
```typescript
{
  _id: ObjectId
  name: string
  email: string (unique index)
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
  _id: ObjectId
  title: string
  type: 'video' | 'post' | 'infographic'
  description: string
  mediaUrl: string (URL to content)
  content?: string (full content text)
  category?: string (nutrition-basics, meal-planning, etc.)
  tags?: string[]
  createdAt: Date
  updatedAt: Date
}
```

---

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/[...nextauth]` - Login/logout (handled by NextAuth)

### User Profile
- `GET /api/profile` - Get user profile (authenticated)
- `PUT /api/profile` - Update user profile (authenticated)

### Admin (Requires admin role)
- `GET /api/admin/users` - List all users
- `DELETE /api/admin/users?id=<userId>` - Delete user
- `GET /api/admin/content` - Get all content (public access)
- `POST /api/admin/content` - Create new content
- `PUT /api/admin/content?id=<id>` - Update content
- `DELETE /api/admin/content?id=<id>` - Delete content

See [API Documentation](./API_DOCUMENTATION.md) for full details with examples.

---

## 🚀 Deployment

### Vercel (Recommended - Easiest)
```bash
# 1. Push to GitHub
git push origin main

# 2. Go to https://vercel.com/new
# 3. Import your repository
# 4. Add environment variables
# 5. Deploy!
```

### Docker
```bash
docker-compose up -d
```

### Self-Hosted (Ubuntu/Debian)
```bash
npm run build
npm start
# Configure nginx and SSL certificate
```

### AWS, GCP, etc.
See [Deployment Guide](./DEPLOYMENT.md) for detailed instructions.

---

## 🛠️ Development Commands

```bash
npm run dev       # Start development server (port 3000)
npm run build     # Build for production
npm start         # Start production server
npm run lint      # Run ESLint
npm run test      # Run tests
npm run seed      # Seed database with sample data
```

---

## 🔧 Environment Variables

Create `.env.local` in project root:

```env
# MongoDB Connection (Atlas)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/nutrition-saas

# NextAuth Configuration
NEXTAUTH_SECRET=<generate-with-openssl-rand-base64-32>
NEXTAUTH_URL=http://localhost:3000

# Node Environment
NODE_ENV=development
```

**Generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

---

## 📈 Project Structure

```
nutrition-saas/
├── app/
│   ├── auth/
│   │   ├── login/page.tsx          # Login page
│   │   └── register/page.tsx       # Registration page
│   ├── api/
│   │   ├── auth/
│   │   │   ├── [...]nextauth]/     # NextAuth routes
│   │   │   └── register/           # Registration endpoint
│   │   ├── profile/                # User profile API
│   │   └── admin/
│   │       ├── users/              # User management API
│   │       └── content/            # Content management API
│   ├── dashboard/page.tsx          # User dashboard
│   ├── profile/page.tsx            # Profile editor
│   ├── admin/page.tsx              # Admin dashboard
│   ├── resources/page.tsx          # Resources library
│   ├── layout.tsx                  # Root layout
│   └── page.tsx                    # Landing page
├── lib/
│   ├── db.ts                       # MongoDB connection
│   ├── auth.ts                     # NextAuth config
│   └── auth-provider.tsx           # Session provider
├── models/
│   ├── User.ts                     # User schema
│   └── Content.ts                  # Content schema
├── types/
│   └── next-auth.d.ts              # NextAuth types
├── middleware.ts                   # Route protection
├── .env.local                      # Environment variables
└── package.json
```

---

## 🎯 Getting Started Checklist

- [ ] Clone the repository
- [ ] Run `npm install`
- [ ] Copy `.env.example` to `.env.local`
- [ ] Generate `NEXTAUTH_SECRET` with `openssl rand -base64 32`
- [ ] Set up MongoDB Atlas and get connection string
- [ ] Update `.env.local` with MongoDB URI
- [ ] Run `npm run dev`
- [ ] Visit `http://localhost:3000`
- [ ] Register a new account or login with test credentials

---

## 🔄 Development Workflow

1. **Feature Branch**
```bash
git checkout -b feature/your-feature
```

2. **Make Changes**
- Edit files in `app/` for pages and routes
- Update models in `models/` if needed
- Add API endpoints in `app/api/`

3. **Test Locally**
```bash
npm run dev
# Test in browser
```

4. **Commit & Push**
```bash
git add .
git commit -m "Add your feature"
git push origin feature/your-feature
```

5. **Create Pull Request**
- Create PR on GitHub
- Get review
- Merge to main

---

## 🐛 Troubleshooting

Common issues and solutions:

### "Cannot connect to MongoDB"
- Check `MONGODB_URI` in `.env.local`
- Ensure MongoDB Atlas IP whitelist includes your IP
- Verify database exists

### "NEXTAUTH_SECRET is not set"
```bash
openssl rand -base64 32  # Generate new secret
# Add to .env.local
```

### "Port 3000 already in use"
```bash
npm run dev -- -p 3001  # Use different port
```

See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for more help.

---

## 📞 Support & Resources

- **Documentation**: [SETUP_GUIDE.md](./SETUP_GUIDE.md)
- **API Reference**: [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
- **Deployment**: [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Troubleshooting**: [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

---

## 🤝 Contributing

This is a proprietary project. For contributions or collaboration inquiries, please contact the team.

---

## 📄 License

Proprietary License - All rights reserved © 2026

---

## ✨ Built With

- [Next.js](https://nextjs.org/) - React framework
- [NextAuth.js](https://next-auth.js.org/) - Authentication
- [MongoDB](https://www.mongodb.com/) - Database
- [Mongoose](https://mongoosejs.com/) - ODM
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Zod](https://zod.dev/) - Type validation

---

<div align="center">

### Ready to Get Started?

[Quick Start](#quick-start) • [Documentation](./SETUP_GUIDE.md) • [Deploy](./DEPLOYMENT.md)

Made with ❤️ for personalized nutrition education

**Version 1.0.0** | Last Updated: January 4, 2026

</div>
