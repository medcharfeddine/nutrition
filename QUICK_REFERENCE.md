# NutriEd - Quick Reference Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Install Dependencies
```bash
cd c:\Users\medch\Desktop\hrm
npm install
```

### Step 2: Setup Environment
```bash
cp .env.example .env.local

# Generate NEXTAUTH_SECRET
openssl rand -base64 32

# Edit .env.local with:
# - NEXTAUTH_SECRET (from above)
# - MONGODB_URI (your MongoDB connection string)
```

### Step 3: Start Development Server
```bash
npm run dev
```

### Step 4: Open Application
```
http://localhost:3000
```

### Step 5: Test Features
- Register at `/auth/register`
- Login at `/auth/login`
- Access dashboard at `/dashboard`

---

## 📋 Common Commands

### Development
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Run ESLint
npm run seed         # Seed database with sample data
```

### Database
```bash
# Seeding (TypeScript)
npx ts-node scripts/seed.ts

# MongoDB backup
mongodump --uri "mongodb+srv://user:pass@cluster/db"

# MongoDB restore
mongorestore --uri "mongodb+srv://user:pass@cluster/db" dump/
```

### Environment Setup
```bash
# Generate NEXTAUTH_SECRET
openssl rand -base64 32

# Copy environment template
cp .env.example .env.local

# View current env
cat .env.local
```

---

## 🔑 API Quick Reference

### Authentication
```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'

# Login (via NextAuth - automatic)
# Visit /auth/login in browser
```

### User Profile
```bash
# Get profile (requires session)
curl -X GET http://localhost:3000/api/profile \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN"

# Update profile
curl -X PUT http://localhost:3000/api/profile \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN" \
  -d '{
    "age": 30,
    "gender": "male",
    "calorieGoal": 2000
  }'
```

### Admin Content
```bash
# Get all content
curl -X GET http://localhost:3000/api/admin/content

# Create content (admin only)
curl -X POST http://localhost:3000/api/admin/content \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=ADMIN_TOKEN" \
  -d '{
    "title": "Nutrition Tips",
    "type": "post",
    "description": "Learn nutrition",
    "mediaUrl": "https://example.com/media",
    "category": "nutrition-basics",
    "tags": ["nutrition", "tips"]
  }'
```

---

## 🔑 Test Credentials

### Demo User (if seeded)
```
Email: user@example.com
Password: password123
```

### Demo Admin (if seeded)
```
Email: admin@nutrition.com
Password: password123
```

### Create Your Own
1. Go to `/auth/register`
2. Create new account
3. Login at `/auth/login`

---

## 📂 Project Structure Quick Guide

```
/app              → Pages and API routes
  /auth           → Login/Register pages
  /api            → Backend endpoints
  /dashboard      → User dashboard
  /admin          → Admin panel
  /profile        → Profile editor
  /resources      → Learning resources

/lib              → Core utilities
  auth.ts         → NextAuth configuration
  db.ts           → MongoDB connection
  auth-provider   → Session provider

/models           → Database schemas
  User.ts         → User model
  Content.ts      → Content model

/types            → TypeScript definitions
  next-auth.d.ts  → Auth types

middleware.ts     → Route protection
package.json      → Dependencies
```

---

## 🌐 Routes Map

### Public Routes
```
/                      Landing page
/auth/login            User login
/auth/register         User registration
/api/admin/content     GET content (public)
```

### Protected Routes (Users)
```
/dashboard             User dashboard
/profile               Profile editor
/resources             Resources library
/api/profile           Profile API
```

### Admin Routes (Admin Only)
```
/admin                 Admin dashboard
/api/admin/users       User management
/api/admin/content     Content management
```

---

## 🔐 Authentication Flow

```
1. User visits /auth/register
   ↓
2. Submits: { name, email, password }
   ↓
3. POST /api/auth/register
   ↓
4. bcryptjs hashes password
   ↓
5. User saved to MongoDB
   ↓
6. Redirect to /auth/login
   ↓
7. User submits { email, password }
   ↓
8. NextAuth validates credentials
   ↓
9. JWT session created
   ↓
10. Redirect to /dashboard
```

---

## 📊 Environment Variables

| Variable | Required | Example |
|----------|----------|---------|
| MONGODB_URI | ✅ | mongodb+srv://user:pass@cluster/db |
| NEXTAUTH_SECRET | ✅ | abcd...xyz (32+ chars) |
| NEXTAUTH_URL | ✅ | http://localhost:3000 |
| NODE_ENV | ❌ | development/production |

---

## 🚀 Deployment Checklist

### Pre-Deployment
- [ ] All tests passing
- [ ] Environment variables configured
- [ ] Database migrations completed
- [ ] Secret keys generated and secure
- [ ] HTTPS certificate ready
- [ ] Build successful (`npm run build`)

### Vercel Deployment
```bash
# 1. Push to GitHub
git add .
git commit -m "Ready for production"
git push origin main

# 2. Connect to Vercel (https://vercel.com/new)
# 3. Add environment variables
# 4. Deploy!
```

### Docker Deployment
```bash
docker-compose build
docker-compose up -d
# Access on http://localhost:3000
```

### Self-Hosted
```bash
npm run build
npm start
# Setup nginx reverse proxy
# Configure SSL certificate
```

---

## 🆘 Common Issues Quick Fix

| Issue | Solution |
|-------|----------|
| Port 3000 in use | `npm run dev -- -p 3001` |
| MongoDB connection error | Check MONGODB_URI and IP whitelist |
| NEXTAUTH_SECRET missing | Run `openssl rand -base64 32` |
| Session not persisting | Clear cookies and login again |
| Admin access denied | Verify `role: 'admin'` in database |
| TypeScript errors | Run `npm install @types/*` |

---

## 📈 Performance Tips

### Development
- Use `npm run dev` for hot reload
- Check browser DevTools for errors
- Monitor API responses in Network tab

### Production
- Enable database indexing
- Use CDN for static assets
- Configure caching headers
- Enable GZIP compression
- Monitor error logs regularly

---

## 🔍 Debugging

### Enable Debug Logging
```env
DEBUG=nutrition-saas:*
```

### View Logs
```bash
# Development
npm run dev

# Production
tail -f logs/app.log
```

### Check Database
```javascript
// MongoDB Atlas
// Go to Collections tab to inspect data

// Or via Mongo Shell
mongo "mongodb+srv://cluster/db"
db.users.find()
db.contents.find()
```

---

## 📱 Testing Scenarios

### User Registration Test
1. Go to `/auth/register`
2. Fill form with unique email
3. Submit
4. Should redirect to login
5. Should see success message

### Login Test
1. Go to `/auth/login`
2. Enter email and password
3. Click "Sign In"
4. Should redirect to dashboard
5. Should see personalized greeting

### Profile Update Test
1. Go to `/profile`
2. Fill in nutrition information
3. Click "Save Profile"
4. Should see success message
5. Data persists on reload

### Admin Content Test
1. Login as admin
2. Go to `/admin`
3. Switch to "Content" tab
4. Click "Add Content"
5. Fill form and submit
6. Content should appear in list
7. Can be deleted

---

## 📞 Getting Help

### Documentation Files
- **README.md** - Project overview
- **SETUP_GUIDE.md** - Detailed setup
- **API_DOCUMENTATION.md** - API reference
- **DEPLOYMENT.md** - Deployment guide
- **TROUBLESHOOTING.md** - Common issues
- **BUILD_SUMMARY.md** - Build details
- **PROJECT_CHECKLIST.md** - Feature checklist

### External Resources
- Next.js: https://nextjs.org/docs
- NextAuth: https://next-auth.js.org/
- MongoDB: https://docs.mongodb.com/
- Tailwind: https://tailwindcss.com/docs

---

## ✅ Checklist Before Deployment

- [ ] Environment variables set
- [ ] MongoDB Atlas configured
- [ ] NEXTAUTH_SECRET generated
- [ ] Build successful
- [ ] All pages accessible
- [ ] Authentication working
- [ ] API endpoints responding
- [ ] Database working
- [ ] Admin features tested
- [ ] Responsive design verified

---

## 🎉 Ready to Go!

Your NutriEd SaaS platform is ready for:
1. ✅ Local development
2. ✅ Production deployment
3. ✅ Team collaboration
4. ✅ Feature enhancements
5. ✅ User growth

**Start developing with `npm run dev`**

---

**Quick Links**
- [Full Documentation](./README.md)
- [Setup Guide](./SETUP_GUIDE.md)
- [API Docs](./API_DOCUMENTATION.md)
- [Deployment](./DEPLOYMENT.md)
- [Troubleshooting](./TROUBLESHOOTING.md)

Last Updated: January 4, 2026
