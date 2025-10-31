# 🚀 MyClean Backend Deployment Guide - Render

Complete step-by-step guide to deploy your Iteration 2 backend to Render.

---

## 📋 Prerequisites

- ✅ GitHub repository with latest code
- ✅ Render account (sign up at https://render.com)
- ✅ Backend prepared for PostgreSQL (already done!)

---

## 🎯 Step-by-Step Deployment

### Step 1: Commit & Push Changes to GitHub

```bash
cd E:\Advanced-Software-Engineering-main
git add .
git commit -m "Prepare backend for Render deployment with PostgreSQL"
git push origin main
```

### Step 2: Create Render Account

1. Go to https://render.com
2. Click "Get Started for Free"
3. Sign up with GitHub (recommended)
4. Authorize Render to access your repositories

### Step 3: Create PostgreSQL Database

1. From Render Dashboard, click **"New +"**
2. Select **"PostgreSQL"**
3. Fill in the details:
   - **Name:** `myclean-db`
   - **Database:** `myclean`
   - **User:** `myclean` (auto-generated)
   - **Region:** Oregon (US West) - or closest to you
   - **Plan:** Free
4. Click **"Create Database"**
5. Wait 2-3 minutes for database to be created
6. **Copy the "Internal Database URL"** - you'll need this!

### Step 4: Create Web Service

1. From Render Dashboard, click **"New +"**
2. Select **"Web Service"**
3. Connect your GitHub repository:
   - Click **"Connect account"** if not already connected
   - Find **"Advanced-Software-Engineering"** repository
   - Click **"Connect"**

### Step 5: Configure Web Service

Fill in these settings:

#### Basic Settings
- **Name:** `myclean-backend`
- **Region:** Oregon (US West) - same as database
- **Branch:** `main`
- **Root Directory:** `myclean-backend`
- **Runtime:** `Node`
- **Build Command:** 
  ```
  npm install && npm run build && npx prisma generate
  ```
- **Start Command:** 
  ```
  npm start
  ```

#### Advanced Settings (click "Advanced")
- **Plan:** Free

### Step 6: Add Environment Variables

Click **"Environment"** or scroll to Environment Variables section.

Add these variables:

| Key | Value |
|-----|-------|
| `DATABASE_URL` | Paste the Internal Database URL from Step 3 |
| `JWT_SECRET` | `your-super-secret-jwt-key-change-this-123456789` |
| `NODE_ENV` | `production` |
| `PORT` | `4000` |

**Important:** For `DATABASE_URL`, use the **Internal Database URL** (starts with `postgresql://`)

### Step 7: Deploy!

1. Click **"Create Web Service"** at the bottom
2. Render will start building your app (takes 3-5 minutes)
3. You'll see the build logs in real-time

### Step 8: Run Database Migration

Once the build is complete:

1. Click on your service name (`myclean-backend`)
2. Go to **"Shell"** tab (left sidebar)
3. Click **"Launch Shell"**
4. Run these commands:

```bash
# Generate Prisma Client
npx prisma generate

# Push database schema
npx prisma db push

# Seed database with sample data
npm run seed
```

### Step 9: Verify Deployment

1. Get your backend URL from the dashboard (looks like: `https://myclean-backend.onrender.com`)
2. Test the health endpoint:
   ```
   https://myclean-backend.onrender.com/api/health
   ```
   Should return: `{"ok":true}`

3. Test with curl or browser:
   ```bash
   curl https://myclean-backend.onrender.com/api/health
   ```

---

## ✅ Deployment Checklist

- [ ] PostgreSQL database created on Render
- [ ] Database URL copied
- [ ] Web service created and connected to GitHub
- [ ] Environment variables added
- [ ] Build completed successfully
- [ ] Database schema pushed (`npx prisma db push`)
- [ ] Database seeded (`npm run seed`)
- [ ] Health endpoint returns `{"ok":true}`
- [ ] Test registration endpoint works

---

## 🔧 Update Frontend to Use Deployed Backend

### Update Frontend API URL

1. In your frontend `.env` or directly in code, update:
   ```
   REACT_APP_API_URL=https://myclean-backend.onrender.com
   ```

2. Update `axios` configuration to use this URL

3. Or add proxy in `package.json`:
   ```json
   "proxy": "https://myclean-backend.onrender.com"
   ```

---

## 🧪 Test Your Deployed Backend

### Test Endpoints

1. **Health Check:**
   ```
   GET https://myclean-backend.onrender.com/api/health
   ```

2. **Register User:**
   ```bash
   curl -X POST https://myclean-backend.onrender.com/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","name":"Test User","password":"password123","role":"CUSTOMER"}'
   ```

3. **Search Providers:**
   ```
   GET https://myclean-backend.onrender.com/api/providers/search?city=Sydney
   ```

---

## 🔄 Auto-Deploy on Push

Render automatically deploys when you push to GitHub!

```bash
git add .
git commit -m "Update backend"
git push origin main
# Render will automatically deploy! 🚀
```

---

## 📊 Monitor Your App

### View Logs
1. Go to Render Dashboard
2. Click on `myclean-backend`
3. Click **"Logs"** tab
4. See real-time logs

### View Metrics
- Click **"Metrics"** tab to see:
  - Response times
  - Memory usage
  - CPU usage
  - Request counts

---

## ⚠️ Common Issues & Solutions

### Issue 1: Build Failed

**Error:** `Module not found` or `Cannot find package`

**Solution:**
```bash
# In Render Shell
npm install
npm run build
```

### Issue 2: Database Connection Error

**Error:** `Can't reach database server`

**Solution:**
- Make sure you're using the **Internal Database URL**
- Check DATABASE_URL environment variable is set correctly
- Ensure database and web service are in the same region

### Issue 3: Prisma Client Not Generated

**Error:** `@prisma/client did not initialize yet`

**Solution:**
```bash
# In Render Shell
npx prisma generate
```

### Issue 4: Port Already in Use

**Solution:**
- Render automatically assigns the PORT
- Make sure your code uses `process.env.PORT`
- Already configured: `const port = Number(process.env.PORT || 4000);`

### Issue 5: CORS Errors

**Solution:**
- Add your frontend URL to allowed origins in `src/index.ts`
- Already configured for:
  - `http://localhost:3000`
  - `https://myclean-project.vercel.app`
  - `https://advanced-software-engineering-orpin.vercel.app`

---

## 🎯 Next Steps

1. ✅ Backend deployed on Render
2. ⬜ Update frontend to use deployed backend URL
3. ⬜ Deploy frontend to Vercel
4. ⬜ Test complete flow end-to-end
5. ⬜ Add custom domain (optional)

---

## 💡 Pro Tips

### Free Tier Limitations
- Database: 1 GB storage
- Web Service: 750 hours/month
- **Sleeps after 15 minutes of inactivity**
- First request after sleep takes 30-60 seconds

### Prevent Sleep (Optional)
Use a service like UptimeRobot to ping your health endpoint every 14 minutes:
```
https://myclean-backend.onrender.com/api/health
```

### Custom Domain
- Go to Settings → Custom Domain
- Add your domain
- Update DNS records as instructed

---

## 📞 Support

- **Render Docs:** https://render.com/docs
- **Render Community:** https://community.render.com
- **Prisma Docs:** https://www.prisma.io/docs

---

## 🎉 Success!

Your MyClean backend is now live on the internet! 🌍

**Your Backend URL:**
```
https://myclean-backend.onrender.com
```

**Test it:**
```
https://myclean-backend.onrender.com/api/health
```

Should return:
```json
{"ok": true}
```

---

**Next:** Deploy your frontend to Vercel and connect it to this backend! 🚀

