# 🚨 Quick Email Fix - Not Receiving Emails

## ❌ ISSUE FOUND IN YOUR CONFIGURATION

Your SMTP password has **spaces** in it:

```bash
SMTP_PASS="tcpj rpqw japo zeui"  # ❌ WRONG - Has spaces
```

Gmail App Passwords are displayed with spaces for readability, but you need to **remove the spaces** when setting the environment variable!

---

## ✅ IMMEDIATE FIX

### Step 1: Update Railway Environment Variable

Go to your Railway dashboard and update `SMTP_PASS`:

```bash
# Change from:
SMTP_PASS="tcpj rpqw japo zeui"

# To (no spaces):
SMTP_PASS="tcpjrpqwjapozeui"
```

### Step 2: Redeploy

Railway will automatically redeploy after you update the environment variable.

### Step 3: Test

After redeployment:

1. **Sign up with a Gmail account**:
   ```bash
   POST https://advanced-software-engineering-production.up.railway.app/api/auth/register
   
   {
     "name": "Test User",
     "email": "test@gmail.com",  # Must be @gmail.com
     "password": "test123456",
     "role": "CUSTOMER"
   }
   ```

2. **Check your email** - Welcome email should arrive within 1-2 minutes

3. **Create a booking** - Confirmation email should be sent immediately

---

## 🔍 Other Potential Issues

### Issue 2: Check if EMAIL_ENABLED has quotes

In Railway, make sure it's set as:

```bash
EMAIL_ENABLED=true  # ✅ Correct (no quotes)
# NOT
EMAIL_ENABLED="true"  # ❌ Might cause issues in some setups
```

### Issue 3: Verify Railway Logs

Check Railway logs for:

```
✅ Should see: "📧 Email queue worker started (interval 15000ms)"
❌ Should NOT see: "⏸ Email queue worker disabled via env toggle"
```

If you see "disabled", add this to Railway:

```bash
DISABLE_EMAIL_QUEUE=false
```

---

## 🧪 Testing Locally

If you want to test on your local machine:

### 1. Update your local `.env` file:

```bash
# myclean-backend/.env

EMAIL_ENABLED=true
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=designlabsai@gmail.com
SMTP_PASS=tcpjrpqwjapozeui           # ✅ NO SPACES!
EMAIL_FROM=MyClean <noreply@myclean.app>
APP_BASE_URL=http://localhost:3000    # For local testing
BRAND_NAME=MyClean
SUPPORT_EMAIL=support@myclean.app
```

### 2. Run the debug script:

```bash
cd myclean-backend
npm install nodemailer  # If not already installed
node debug-email.js
```

This will:
- ✅ Verify your SMTP configuration
- ✅ Test the connection
- ✅ Send a test email to yourself
- ✅ Check the email queue in your database

### 3. Start your backend:

```bash
npm run dev
```

Look for this message:
```
📧 Email queue worker started (interval 15000ms)
```

---

## 🎯 Quick Verification Steps

### Step 1: Check SMTP Password Format

```bash
# Your current password (WRONG):
tcpj rpqw japo zeui

# Should be (CORRECT):
tcpjrpqwjapozeui

# Rule: Remove ALL spaces!
```

### Step 2: Check Railway Environment Variables

In Railway dashboard, verify these are set:

| Variable | Value |
|----------|-------|
| EMAIL_ENABLED | `true` (no quotes) |
| SMTP_HOST | `smtp.gmail.com` |
| SMTP_PORT | `587` |
| SMTP_USER | `designlabsai@gmail.com` |
| SMTP_PASS | `tcpjrpqwjapozeui` (NO SPACES) |
| EMAIL_FROM | `MyClean <noreply@myclean.app>` |
| APP_BASE_URL | `https://myclean-project.vercel.app` |

### Step 3: Check Railway Deployment Logs

```bash
# Should see these messages:
✅ "Email queue worker started"
✅ "SMTP connection successful" (if any emails are queued)

# Should NOT see:
❌ "Email queue worker disabled"
❌ "Failed to deliver email"
❌ "Invalid login"
```

### Step 4: Test Welcome Email

Sign up with `@gmail.com` email:

```bash
curl -X POST https://advanced-software-engineering-production.up.railway.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john.test@gmail.com",
    "password": "test123",
    "role": "CUSTOMER"
  }'
```

**Expected result**: Welcome email arrives in 1-2 minutes

### Step 5: Test Booking Confirmation

After creating a booking through the UI:

**Expected result**: Both customer and provider receive emails immediately

---

## 📊 Checking Email Queue in Database

If you have access to Railway PostgreSQL:

```sql
-- Check email queue status
SELECT status, COUNT(*) 
FROM "EmailJob" 
GROUP BY status;

-- Check recent emails
SELECT id, to, template, status, "lastError", "createdAt"
FROM "EmailJob"
ORDER BY "createdAt" DESC
LIMIT 10;

-- Check failed emails
SELECT id, to, template, "lastError", "attemptCount"
FROM "EmailJob"
WHERE status = 'FAILED'
ORDER BY "createdAt" DESC;
```

---

## 🆘 Still Not Working?

### Option 1: Generate New App Password

1. Go to https://myaccount.google.com/apppasswords
2. Delete old app password
3. Generate new one
4. Copy it (e.g., `abcd efgh ijkl mnop`)
5. Remove spaces: `abcdefghijklmnop`
6. Update `SMTP_PASS` in Railway

### Option 2: Check Gmail Security Settings

1. Go to https://myaccount.google.com/security
2. Verify 2-Factor Authentication is enabled
3. Check if "Less secure app access" is disabled (good - you should use App Password)
4. Make sure your account isn't locked

### Option 3: Try Different SMTP Provider

If Gmail continues to have issues, try SendGrid (free tier):

```bash
# Railway environment variables
EMAIL_ENABLED=true
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=<your-sendgrid-api-key>
EMAIL_FROM=MyClean <noreply@yourdomain.com>
```

---

## 🎉 Success Indicators

You'll know emails are working when you see:

1. ✅ Railway logs show: "📧 Email queue worker started"
2. ✅ Test signup sends welcome email within 2 minutes
3. ✅ Database shows emails with status = 'SENT'
4. ✅ Booking creation sends confirmation emails immediately

---

## 📝 Summary of Your Issue

**Problem**: SMTP password has spaces  
**Solution**: Remove spaces from `SMTP_PASS`  
**Expected Time to Fix**: 2 minutes  
**Impact**: All emails (welcome, booking confirmation, reminders) will start working  

---

Need more help? Run the debug script:
```bash
cd myclean-backend
node debug-email.js
```

