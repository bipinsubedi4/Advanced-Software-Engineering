# Backend Deployment Guide (Render.com - FREE)

## 🚀 Quick Deploy to Render.com

### Step 1: Prepare Your Repository

✅ **Already done!** Your backend is ready to deploy.

---

### Step 2: Deploy on Render.com

1. **Go to [Render.com](https://render.com/)** and sign up/login with GitHub

2. **Click "New +" → "Web Service"**

3. **Connect your repository:**
   - Select: `hmngp/myclean`
   - Click "Connect"

4. **Configure the Web Service:**
   ```
   Name: myclean-backend
   Region: Oregon (US West) or any region
   Branch: main
   Root Directory: myclean-backend
   Runtime: Node
   Build Command: npm install && npx prisma generate && npx prisma migrate deploy
   Start Command: npm start
   Instance Type: Free
   ```

5. **Add Environment Variables:**
   
   Click "Advanced" → "Add Environment Variable" and add these:
   
   ```
   DATABASE_URL = file:./prisma/dev.db
   JWT_SECRET = your_super_secret_jwt_key_change_this_in_production
   NODE_ENV = production
   PORT = 10000
   ```

6. **Click "Create Web Service"**

7. **Wait ~5 minutes** for deployment to complete

8. **Copy your backend URL** (will be something like):
   ```
   https://myclean-backend-xxxx.onrender.com
   ```

---

### Step 3: Update Frontend API URL

Once your backend is deployed, update the frontend:

1. **Edit `myclean-frontend/.env.production`:**
   ```env
   REACT_APP_API_URL=https://myclean-backend-xxxx.onrender.com
   ```
   *(Replace with your actual Render URL)*

2. **Commit and push:**
   ```bash
   git add myclean-frontend/.env.production
   git commit -m "feat: Update API URL to deployed backend"
   git push origin main
   ```

3. **Vercel will auto-redeploy** with the new API URL

---

### Step 4: Test Your App

1. **Visit your Vercel frontend URL**
2. **Click "Sign Up"**
3. **Create a test account:**
   - Name: Test User
   - Email: test@example.com
   - Password: test123
   - Role: Customer or Provider

4. **It should work!** ✅

---

## 🎯 Alternative: Railway.app (Also FREE)

If you prefer Railway:

1. Go to [Railway.app](https://railway.app/)
2. Click "Start a New Project"
3. Select "Deploy from GitHub repo"
4. Choose `hmngp/myclean`
5. Set root directory: `myclean-backend`
6. Add environment variables (same as above)
7. Deploy!

---

## ⚠️ Important Notes

### **Free Tier Limitations:**

**Render.com Free Tier:**
- ✅ Free forever
- ⚠️ Sleeps after 15 minutes of inactivity
- ⚠️ First request after sleep takes ~30 seconds to wake up
- ✅ Perfect for demos and testing

**Railway.app Free Tier:**
- ✅ $5 free credit per month
- ✅ Doesn't sleep
- ✅ Better for active development

### **Database Note:**

Currently using **SQLite** (file-based database):
- ✅ Perfect for development and demos
- ✅ No setup required
- ⚠️ Data may be lost on container restart on some platforms
- 💡 For production, consider upgrading to PostgreSQL

---

## 🐛 Troubleshooting

### Backend won't start?

**Check Build Logs:**
1. Go to Render Dashboard
2. Click on your service
3. Check "Logs" tab
4. Look for errors

**Common issues:**
- Missing environment variables
- Wrong Node version (use 18.x or higher)
- Prisma migration failed

### Frontend still can't connect?

**Check CORS:**
Make sure `myclean-backend/src/index.ts` has proper CORS setup:
```typescript
app.use(cors());
```
✅ Already configured!

**Check API URL:**
Make sure the URL in `.env.production` matches your Render URL exactly.

---

## ✅ Verification Checklist

After deployment:

- [ ] Backend is accessible at `https://your-backend.onrender.com/api/health`
- [ ] Returns: `{"ok": true}`
- [ ] Frontend `.env.production` updated with backend URL
- [ ] Frontend redeployed on Vercel
- [ ] Can create an account (Sign Up works)
- [ ] Can login
- [ ] Can navigate through the app

---

## 🎉 Success!

Once both are deployed:
- **Frontend:** `https://your-project.vercel.app`
- **Backend:** `https://your-backend.onrender.com`

**Your full-stack app is now live!** 🚀

Share the frontend URL with your team for the demo!

---

## 💡 Next Steps

1. **Test all features** with your team
2. **Create sample data** (providers, services, bookings)
3. **Prepare for demo** (see `DEMO_CHECKLIST.md`)
4. **Consider upgrading to PostgreSQL** for production

---

**Need help?** Check the Render documentation or the logs in your Render dashboard.

