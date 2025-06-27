# 🚀 Deployment Guide - Community Pothole Reporter

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Repository**: Push your code to GitHub
3. **Vercel CLI** (optional): `npm i -g vercel`

## 🎯 Quick Deployment Steps

### 1. **Push to GitHub**
```bash
git init
git add .
git commit -m "Initial commit: Community Pothole Reporter MVP"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/pothole-reporter.git
git push -u origin main
```

### 2. **Connect to Vercel**
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Configure project settings:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./` (default)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)

### 3. **Set Up Vercel Postgres** 
1. In your Vercel project dashboard, go to "Storage"
2. Click "Create Database" → "Postgres"
3. Name your database (e.g., `pothole-db`)
4. Choose a region close to your users
5. Copy the connection strings provided

### 4. **Set Up Vercel Blob Storage**
1. In your Vercel project dashboard, go to "Storage"  
2. Click "Create Database" → "Blob"
3. Name your blob store (e.g., `pothole-images`)
4. Copy the access token provided

### 5. **Configure Environment Variables**
In your Vercel project settings → Environment Variables, add:

```bash
# Database (from Vercel Postgres)
POSTGRES_URL=postgresql://...
POSTGRES_PRISMA_URL=postgresql://...
POSTGRES_URL_NO_SSL=postgresql://...
POSTGRES_URL_NON_POOLING=postgresql://...
POSTGRES_USER=...
POSTGRES_HOST=...
POSTGRES_PASSWORD=...
POSTGRES_DATABASE=...

# Blob Storage (from Vercel Blob)
BLOB_READ_WRITE_TOKEN=...

# App Config
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

### 6. **Initialize Database**
After first deployment, visit: `https://your-app.vercel.app/api/init-db`
This will create the necessary database tables.

### 7. **Deploy & Test**
1. Vercel will automatically deploy on every GitHub push
2. Visit your live URL to test all features
3. Test report submission and map functionality

## 🛠️ Database Schema Setup

Your app will automatically create these tables on first run:

```sql
-- Pothole reports table
CREATE TABLE pothole_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  photo_url TEXT NOT NULL,
  notes TEXT,
  status VARCHAR(20) DEFAULT 'reported' CHECK (status IN ('reported', 'in_progress', 'fixed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_pothole_reports_location ON pothole_reports (latitude, longitude);
CREATE INDEX idx_pothole_reports_created_at ON pothole_reports (created_at DESC);
CREATE INDEX idx_pothole_reports_status ON pothole_reports (status);
```

## 🔧 Advanced Configuration

### Custom Domain
1. In Vercel dashboard → Domains
2. Add your custom domain
3. Configure DNS settings as shown
4. Update `NEXT_PUBLIC_APP_URL` environment variable

### Performance Optimization
- Enable Vercel Analytics in project settings
- Configure ISR (Incremental Static Regeneration) for stats
- Set up proper caching headers

### Monitoring
- Enable Vercel Speed Insights
- Set up error tracking with Sentry (optional)
- Monitor database performance

## 🎯 Production Features

✅ **Automatic Scaling**: Handles traffic spikes  
✅ **Global CDN**: Fast loading worldwide  
✅ **Real Database**: Persistent data storage  
✅ **File Storage**: Secure photo uploads  
✅ **SSL Certificate**: HTTPS by default  
✅ **Mobile Optimized**: Works on all devices  
✅ **SEO Ready**: Open Graph tags included  

## 🚨 Troubleshooting

### Common Issues:

**Build Fails:**
- Check Node.js version (16.x or 18.x)
- Verify all dependencies in package.json
- Check for TypeScript errors

**Database Connection Issues:**
- Verify environment variables are set
- Check connection string format
- Ensure database is in same region

**Photo Upload Issues:**
- Verify BLOB_READ_WRITE_TOKEN is set
- Check file size limits (5MB)
- Test with different image formats

### Environment Debugging:
```bash
# Local development
npm run dev

# Production build test
npm run build
npm start
```

## 🎉 You're Live!

Your Community Pothole Reporter is now:
- 🌐 **Live on the internet**
- 📱 **Mobile responsive** 
- 🔒 **Secure with HTTPS**
- ⚡ **Fast with global CDN**
- 📈 **Scalable for growth**
- 🗄️ **Production database ready**

Share your app URL and start making roads safer! 🛣️✨