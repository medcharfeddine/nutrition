# NutriEd - Deployment Guide

## Overview

This guide covers deploying NutriEd to production on various platforms.

---

## Pre-Deployment Checklist

- [ ] All environment variables configured
- [ ] `.env.local` not committed to repository
- [ ] Database backups created
- [ ] Tests passing locally
- [ ] Build successful: `npm run build`
- [ ] Security review completed
- [ ] HTTPS enabled
- [ ] CORS configured appropriately
- [ ] Rate limiting configured (if needed)
- [ ] Monitoring/logging set up

---

## Deployment to Vercel (Recommended)

Vercel is the official Next.js hosting platform with seamless integration.

### Steps

1. **Push code to GitHub**
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

2. **Connect to Vercel**
   - Go to https://vercel.com/new
   - Import your GitHub repository
   - Select project root directory

3. **Configure Environment Variables**
   - In Vercel Dashboard → Settings → Environment Variables
   - Add the following:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/nutrition-saas
NEXTAUTH_SECRET=<generated-secret>
NEXTAUTH_URL=https://yourdomain.com
NODE_ENV=production
```

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Visit your production URL

5. **Post-Deployment**
   - Test all features
   - Monitor error logs
   - Check performance metrics

---

## Deployment to Self-Hosted Server

### Prerequisites
- Node.js 18+ installed
- nginx or Apache for reverse proxy
- MongoDB instance
- SSL certificate

### Steps

1. **Prepare Server**
```bash
# SSH into server
ssh user@your-server.com

# Create app directory
mkdir -p /var/www/nutrition-saas
cd /var/www/nutrition-saas

# Clone repository
git clone https://github.com/yourusername/nutrition-saas.git .
```

2. **Install Dependencies**
```bash
npm install --production
```

3. **Build Application**
```bash
npm run build
```

4. **Configure Environment**
```bash
cp .env.example .env.local
# Edit .env.local with production values
nano .env.local
```

5. **Setup Process Manager (PM2)**
```bash
npm install -g pm2

# Start application
pm2 start npm --name "nutrition-saas" -- start

# Configure to restart on reboot
pm2 startup
pm2 save
```

6. **Configure Nginx**
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/ssl/certs/your-cert.crt;
    ssl_certificate_key /etc/ssl/private/your-key.key;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;

    # Proxy to Node.js
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

7. **Restart Nginx**
```bash
sudo systemctl restart nginx
```

---

## Docker Deployment

### Create Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Build application
COPY . .
RUN npm run build

# Expose port
EXPOSE 3000

# Start application
CMD ["npm", "start"]
```

### Create docker-compose.yml

```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:6
    container_name: nutrition-saas-db
    restart: always
    volumes:
      - mongodb_data:/data/db
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: password
    ports:
      - "27017:27017"

  app:
    build: .
    container_name: nutrition-saas-app
    restart: always
    ports:
      - "3000:3000"
    environment:
      MONGODB_URI: mongodb://admin:password@mongodb:27017/nutrition-saas?authSource=admin
      NEXTAUTH_SECRET: your-secret-key
      NEXTAUTH_URL: https://yourdomain.com
      NODE_ENV: production
    depends_on:
      - mongodb
    volumes:
      - ./:/app

volumes:
  mongodb_data:
```

### Deploy with Docker

```bash
# Build images
docker-compose build

# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

---

## AWS Deployment

### Using Elastic Beanstalk

1. **Create `.ebextensions/nodecommand.config`**
```yaml
option_settings:
  aws:elasticbeanstalk:container:nodejs:
    NodeCommand: "npm run start"
    EnvironmentVariables:
      NODE_ENV: production
```

2. **Create RDS MongoDB Instance**
   - Use DocumentDB (AWS's MongoDB-compatible service)
   - Configure security groups

3. **Deploy**
```bash
# Install EB CLI
pip install awsebcli

# Initialize
eb init -p node.js-18 nutrition-saas

# Create environment
eb create production

# Deploy code
eb deploy

# Configure environment variables
eb setenv MONGODB_URI=... NEXTAUTH_SECRET=...
```

---

## Google Cloud Run Deployment

1. **Create `cloudbuild.yaml`**
```yaml
steps:
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t', 'gcr.io/$PROJECT_ID/nutrition-saas:$SHORT_SHA', '.']
  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', 'gcr.io/$PROJECT_ID/nutrition-saas:$SHORT_SHA']
  - name: 'gcr.io/cloud-builders/run'
    args: ['deploy', 'nutrition-saas', '--image', 'gcr.io/$PROJECT_ID/nutrition-saas:$SHORT_SHA']
```

2. **Deploy**
```bash
gcloud builds submit
```

---

## Production Configuration

### Security Settings

```env
# .env.production
NODE_ENV=production
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=your-very-secure-secret-min-32-chars
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/nutrition-saas

# Optional: Security headers
NEXT_PUBLIC_SENTRY_DSN=https://...
```

### Database Optimization

```javascript
// Create indexes for better performance
db.users.createIndex({ email: 1 }, { unique: true });
db.contents.createIndex({ category: 1 });
db.contents.createIndex({ createdAt: -1 });
```

### CDN Configuration

Configure Vercel CDN for static assets:
```javascript
// next.config.ts
export default {
  images: {
    domains: ['yourdomain.com', 'cdn.yourdomain.com'],
    unoptimized: false,
  },
}
```

---

## Monitoring & Logging

### Vercel Analytics
- Built-in performance monitoring
- Error tracking
- Real user monitoring

### Third-Party Services

#### Sentry (Error Tracking)
```bash
npm install @sentry/nextjs
```

#### LogRocket (Session Replay)
```bash
npm install logrocket
```

#### New Relic (APM)
```bash
npm install newrelic
```

---

## Database Backup

### MongoDB Atlas Backups
- Enable automated backups in Atlas
- Retention policy: 7 days
- Test restore procedures monthly

### Manual Backup
```bash
mongodump --uri "mongodb+srv://username:password@cluster.mongodb.net/nutrition-saas"

# Restore
mongorestore --uri "mongodb+srv://username:password@cluster.mongodb.net/nutrition-saas" dump/
```

---

## SSL/TLS Certificates

### Let's Encrypt (Free)
```bash
sudo certbot certonly --standalone -d yourdomain.com
sudo certbot renew --dry-run
```

### Automatic Renewal
```bash
# Add to crontab
0 12 * * * /usr/bin/certbot renew --quiet
```

---

## Performance Optimization

### Caching Strategy
```javascript
// next.config.ts
export default {
  onDemandEntries: {
    maxInactiveAge: 60 * 60 * 1000,
    pagesBufferLength: 5,
  },
}
```

### Database Connection Pooling
```javascript
// lib/db.ts
const mongooseOptions = {
  maxPoolSize: 10,
  minPoolSize: 2,
}
```

---

## Rollback Procedure

### Vercel
- Automatic rollback available
- Git-based deployment history

### Self-Hosted
```bash
git log --oneline
git revert <commit-hash>
npm run build
pm2 restart nutrition-saas
```

---

## Health Checks

Create a health check endpoint:

```typescript
// app/api/health/route.ts
export async function GET() {
  try {
    await connectDB();
    return Response.json({ status: 'healthy' });
  } catch {
    return Response.json({ status: 'unhealthy' }, { status: 500 });
  }
}
```

Configure monitoring:
```javascript
// Vercel Uptime Monitoring
// https://yourdomain.com/api/health
```

---

## Scaling Strategy

### Database Sharding
- Implement for 1M+ users
- Use MongoDB Atlas sharding

### Caching Layer
- Add Redis for session caching
- Cache API responses

### Load Balancing
- Use Vercel's global edge network
- Or configure multiple server instances

---

## Post-Deployment Checklist

- [ ] All pages loading correctly
- [ ] Authentication working
- [ ] Database operations successful
- [ ] Email notifications functional
- [ ] Admin features accessible
- [ ] Error logging active
- [ ] Performance monitoring enabled
- [ ] Backups configured
- [ ] SSL certificate valid
- [ ] DNS configured correctly

---

## Troubleshooting Deployment

See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for common issues.

---

## Support

- Vercel Support: https://vercel.com/help
- Next.js Discussions: https://github.com/vercel/next.js/discussions
- MongoDB Support: https://support.mongodb.com/
