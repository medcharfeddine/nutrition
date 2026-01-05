# NutriEd - Troubleshooting Guide

## Common Issues and Solutions

### 1. MongoDB Connection Issues

#### Error: "MongoNetworkError: connect ECONNREFUSED"
**Problem:** Cannot connect to MongoDB

**Solutions:**
- Ensure MongoDB is running locally or MongoDB Atlas is accessible
- Check your `MONGODB_URI` in `.env.local`
- Verify network connectivity
- Check IP whitelist in MongoDB Atlas (if using cloud)

#### Error: "MongoParseError: Invalid connection string"
**Problem:** Malformed MongoDB URI

**Solution:**
```env
# Correct format:
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/nutrition-saas

# Check for:
- Missing protocol (mongodb+srv://)
- Special characters in password need URL encoding
- Correct database name at the end
```

---

### 2. Authentication Issues

#### Error: "NEXTAUTH_SECRET is not set"
**Problem:** NextAuth secret not configured

**Solution:**
```bash
# Generate a secret
openssl rand -base64 32

# Add to .env.local
NEXTAUTH_SECRET=<generated-secret>
```

#### Issue: "Credentials provider is not configured"
**Problem:** NextAuth not properly initialized

**Solution:**
- Ensure `lib/auth.ts` is properly configured
- Verify `app/api/auth/[...nextauth]/route.ts` exists
- Restart development server

#### Error: "Session is undefined"
**Problem:** User not authenticated

**Solution:**
- Ensure `AuthProvider` is wrapping your app in `layout.tsx`
- Check browser cookies for `next-auth.session-token`
- Clear browser cache and cookies
- Re-login

---

### 3. Build and Runtime Errors

#### Error: "Module not found: Can't resolve 'mongoose'"
**Problem:** Dependencies not installed

**Solution:**
```bash
npm install
# or
npm install mongoose bcryptjs jsonwebtoken zod next-auth
```

#### Error: "TypeScript error: Type 'Session' is not assignable"
**Problem:** Type definitions missing

**Solution:**
- Ensure `types/next-auth.d.ts` exists
- Run `npm install --save-dev @types/next-auth`
- Restart TypeScript server in VS Code

#### Error: "ReferenceError: global is not defined"
**Problem:** Server-side code being run on client

**Solution:**
- Add `'use client'` directive to client components
- Move server logic to API routes
- Check component location (app/api vs app/)

---

### 4. API Issues

#### Error: "401 Unauthorized" on protected endpoint
**Problem:** Not authenticated

**Solution:**
- Login first at `/auth/login`
- Check that session cookie is being sent
- Verify session in NextAuth callback

#### Error: "403 Forbidden" on admin endpoint
**Problem:** User doesn't have admin role

**Solution:**
- Admin users must have `role: 'admin'` in database
- Manual update in MongoDB:
  ```javascript
  db.users.updateOne(
    { email: "user@example.com" },
    { $set: { role: "admin" } }
  )
  ```

#### Error: "Validation failed" on POST request
**Problem:** Invalid request data

**Solution:**
- Check request body matches schema
- Verify all required fields are included
- Check data types match (numbers vs strings)

---

### 5. Database Issues

#### Error: "Collection does not exist"
**Problem:** Database not initialized

**Solution:**
- Mongoose will auto-create collections
- Restart the application
- Check MongoDB connection

#### Issue: Data not persisting
**Problem:** Database not connected

**Solution:**
- Verify `MONGODB_URI`
- Check MongoDB is running
- Check database name is correct

#### Issue: Duplicate key error
**Problem:** Trying to insert duplicate email

**Solution:**
- Email field has unique index
- Remove duplicate entries:
  ```javascript
  db.users.deleteMany({ email: "duplicate@example.com" })
  ```

---

### 6. Frontend Issues

#### Issue: "Page not loading or showing 404"
**Problem:** Route doesn't exist or middleware issue

**Solution:**
- Check file path matches route (app/dashboard/page.tsx → /dashboard)
- Verify middleware.ts isn't blocking access
- Clear Next.js cache:
  ```bash
  rm -rf .next
  npm run dev
  ```

#### Issue: "Styles not applying (Tailwind)"
**Problem:** Tailwind CSS not configured

**Solution:**
- Ensure `globals.css` has Tailwind directives
- Check `tailwind.config.ts` includes correct paths
- Rebuild:
  ```bash
  npm run build
  ```

#### Issue: "Form not submitting"
**Problem:** JavaScript error or missing handlers

**Solution:**
- Check browser console for errors
- Verify form has `onSubmit` handler
- Check input names match state/API
- Ensure button is not disabled

---

### 7. Development Server Issues

#### Error: "Port 3000 already in use"
**Problem:** Another process using port 3000

**Solution:**
```bash
# Kill process on port 3000 (macOS/Linux)
lsof -ti:3000 | xargs kill -9

# Or use different port
npm run dev -- -p 3001
```

#### Error: "EACCES: permission denied"
**Problem:** File permission issues

**Solution:**
```bash
# Fix permissions
chmod -R 755 node_modules
# Or reinstall
rm -rf node_modules
npm install
```

---

### 8. Deployment Issues

#### Issue: "Environment variables not loading on Vercel"
**Problem:** Variables not configured

**Solution:**
- Go to Vercel project settings
- Add environment variables
- Redeploy project

#### Issue: "MongoDB Atlas connection failed in production"
**Problem:** IP not whitelisted

**Solution:**
- MongoDB Atlas → Network Access
- Add Vercel IP ranges or allow all (0.0.0.0/0)
- Recommended: Use Database Access Users instead

#### Error: "Build fails during deployment"
**Problem:** Build-time error

**Solution:**
- Check build logs in Vercel
- Test locally: `npm run build`
- Common issues:
  - Type errors (TypeScript)
  - Missing environment variables
  - Deprecated Next.js APIs

---

### 9. Performance Issues

#### Issue: "Slow page load"
**Problem:** Performance degradation

**Solutions:**
- Check MongoDB indexes (email should be indexed)
- Enable caching
- Reduce number of database queries
- Check network tab for slow API calls

#### Issue: "High memory usage"
**Problem:** Memory leak

**Solution:**
- Check for infinite loops
- Monitor database connections
- Check for unclosed resources

---

### 10. Security Issues

#### Issue: "Session hijacking vulnerability"
**Solution:**
- Ensure `NEXTAUTH_URL` matches deployment URL
- Use HTTPS in production
- Enable secure cookies
- Rotate `NEXTAUTH_SECRET` periodically

#### Issue: "Password stored in plain text"
**Problem:** Password hashing failed

**Solution:**
- Ensure `bcryptjs` is installed
- Verify pre-save hook in User model
- Check password is hashed before saving

---

## Debug Mode

### Enable Debug Logging

```env
# .env.local
DEBUG=nutrition-saas:*
NEXT_PUBLIC_DEBUG=true
```

### Common Debug Commands

```bash
# Test MongoDB connection
npm run test:db

# Check environment variables
node -e "console.log(process.env.MONGODB_URI)"

# Validate TypeScript
npx tsc --noEmit

# Check Next.js build
npm run build -- --debug
```

---

## Getting Help

1. Check this troubleshooting guide
2. Review error messages carefully (often very descriptive)
3. Check browser console (F12)
4. Check server logs
5. Check MongoDB Atlas dashboard
6. Search GitHub issues
7. Post on community forums

---

## Support Resources

- Next.js Docs: https://nextjs.org/docs
- NextAuth.js Docs: https://next-auth.js.org/
- MongoDB Docs: https://docs.mongodb.com/
- Tailwind CSS Docs: https://tailwindcss.com/docs
- Mongoose Docs: https://mongoosejs.com/docs/

---

## Still Not Working?

Create a diagnostic report:

```bash
# System info
node --version
npm --version
npm list next react

# Check configuration
cat .env.local (remove sensitive data first)
cat package.json

# Check logs
npm run dev 2>&1 | head -100
```

Share this with the support team for faster resolution.
