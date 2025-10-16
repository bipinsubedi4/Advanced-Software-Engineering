# Quick Start Guide - MyClean

Get the app running in 5 minutes!

## Prerequisites
- Node.js installed
- Terminal/Command Prompt

## Step 1: Backend Setup (2 minutes)

```bash
# Terminal 1
cd myclean-backend
npm install
npx prisma migrate dev
npm run dev
```

✅ Backend running on http://localhost:4000

## Step 2: Frontend Setup (2 minutes)

```bash
# Terminal 2 (new window)
cd myclean-frontend
npm install
npm start
```

✅ Frontend running on http://localhost:3000

## Step 3: Create Accounts (1 minute)

### Customer Account:
1. Go to http://localhost:3000/register
2. Fill form → Select "Book cleaning services"
3. Click Sign Up

### Provider Account:
1. Go to http://localhost:3000/register
2. Fill form → Select "Offer cleaning services"
3. Click Sign Up

### Admin Account:
1. Register a normal account
2. In Terminal 1:
   ```bash
   npx prisma studio
   ```
3. Find your user → Change `role` to "ADMIN"

## Test Features

### As Customer:
- Search cleaners: `/search`
- View profiles: Click any provider
- Book service: Fill booking form
- Manage bookings: `/my-bookings`

### As Provider:
- Dashboard: `/provider/dashboard`
- Set availability: `/provider/calendar`
- Messages: `/provider/messages`
- Payments: `/provider/payments`
- Verify account: `/verification`

### As Admin:
- Admin panel: `/admin`
- Manage users, bookings, disputes

## Common Issues

### Port already in use?
Kill the process:
- Windows: `netstat -ano | findstr :4000` then `taskkill /PID <PID> /F`
- Mac/Linux: `lsof -ti:4000 | xargs kill`

### Database errors?
```bash
cd myclean-backend
npx prisma migrate reset
npx prisma migrate dev
```

### Dependencies not installed?
```bash
# Delete node_modules and reinstall
rm -rf node_modules
npm install
```

## You're Ready!

The app is now running with all features working:
- ✅ Authentication
- ✅ Customer features (search, book, review)
- ✅ Provider features (calendar, dashboard, payments)
- ✅ Admin features (user management, disputes)
- ✅ Verification system
- ✅ Payment integration (UI)

**Happy Testing! 🎉**

For detailed documentation, see:
- SETUP_GUIDE.md
- README_FEATURES.md
- PROJECT_SUMMARY.md

