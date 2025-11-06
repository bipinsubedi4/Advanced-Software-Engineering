# 🚀 Quick Start: Deploy to Render (5 Minutes)

## ✅ Prerequisites Done
- Backend is ready for PostgreSQL
- All code pushed to GitHub
- Deployment files created

---

## 📝 Quick Steps

### 1. Create Render Account
👉 https://render.com → Sign up with GitHub

### 2. Create Database (2 min)
1. Dashboard → **New +** → **PostgreSQL**
2. Name: `myclean-db`, Region: Oregon, Plan: **Free**
3. **Copy the "Internal Database URL"** 📋

### 3. Create Web Service (2 min)
1. Dashboard → **New +** → **Web Service**
2. Connect repository: `Advanced-Software-Engineering`
3. Settings:
   - Name: `myclean-backend`
   - Root Directory: `myclean-backend`
   - Build: `npm install && npm run build && npx prisma generate`
   - Start: `npm start`
   - Plan: **Free**

### 4. Add Environment Variables
```
DATABASE_URL = [paste Internal Database URL from step 2 - should start with postgresql://]
JWT_SECRET = your-super-secret-jwt-key-123456
NODE_ENV = production
PORT = 4000
```

**Important:** The `DATABASE_URL` must start with `postgresql://` (not `file:`). Copy the **Internal Database URL** from your PostgreSQL database.

### 5. Deploy & Wait (3 min)
Click **Create Web Service** → Wait for build

### 6. Initialize Database (1 min)
In Render Shell:
```bash
# If you see a failed migration error (P3009), run this first:
npm run prisma:resolve

# Otherwise, just push the schema:
npx prisma db push --accept-data-loss
npm run seed
```

**If you see migration error P3009:**
- Run `npm run prisma:resolve` to automatically fix it
- Or manually: `npx prisma migrate resolve --rolled-back 20251106045209_init && npx prisma db push --accept-data-loss`

### 7. Test ✅
Visit: `https://your-app.onrender.com/api/health`

Should return: `{"ok":true}`

---

## 🎯 Your URLs

**Backend:** `https://myclean-backend-xxxx.onrender.com`

**Health Check:** Add `/api/health` to test

---

## 📚 Full Guide

See **RENDER_DEPLOYMENT_GUIDE.md** for detailed instructions!

---

**Ready to deploy? Let's go! 🚀**

