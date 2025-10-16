# MyClean - Demo & Testing Checklist

Use this checklist before your presentation to ensure everything works!

## Pre-Demo Setup ✓

### Backend
- [ ] Backend is running (`npm run dev` in myclean-backend)
- [ ] Database is migrated (`npx prisma migrate dev`)
- [ ] No console errors in backend terminal
- [ ] Health check works: http://localhost:4000/api/health

### Frontend  
- [ ] Frontend is running (`npm start` in myclean-frontend)
- [ ] No compilation errors
- [ ] App loads at http://localhost:3000
- [ ] Tailwind styles are working

### Test Accounts Created
- [ ] Customer account (email: customer@test.com, password: test123)
- [ ] Provider account (email: provider@test.com, password: test123)
- [ ] Admin account (role changed in database)

## Feature Testing Checklist

### 🔐 Authentication (5 min)

#### Registration
- [ ] Can access /register page
- [ ] Customer registration works
- [ ] Provider registration works
- [ ] Role selection works
- [ ] Redirects to dashboard after signup

#### Login
- [ ] Can access /login page
- [ ] Customer login works
- [ ] Provider login works
- [ ] Admin login works
- [ ] Redirects based on role
- [ ] Token is saved (check localStorage)

#### Logout
- [ ] Logout button appears for logged-in users
- [ ] Logout clears token
- [ ] Redirects to login page

### 👥 Customer Features (15 min)

#### Search & Filter
- [ ] Access /search page
- [ ] Provider cards display
- [ ] Search by name works
- [ ] Location filter works
- [ ] Price range slider works
- [ ] Rating filter works
- [ ] Specialization filters work
- [ ] Show/Hide filters toggle works
- [ ] Results count updates

#### Provider Profile
- [ ] Click on provider card opens profile
- [ ] Profile shows all information:
  - [ ] Provider name and image
  - [ ] Rating and reviews
  - [ ] Hourly rate
  - [ ] Specializations
  - [ ] Experience stats
  - [ ] Availability info
  - [ ] Work gallery
- [ ] Tabs work (About, Reviews)
- [ ] Reviews display correctly

#### Booking
- [ ] "Book Now" button opens modal
- [ ] Date picker works (future dates only)
- [ ] Time selector shows options
- [ ] Duration selector works
- [ ] Address field accepts input
- [ ] Total price calculates correctly
- [ ] Can submit booking

#### My Bookings
- [ ] Access /my-bookings page
- [ ] Filter tabs work (All, Upcoming, Completed, Cancelled)
- [ ] Booking cards display all info:
  - [ ] Provider details
  - [ ] Date and time
  - [ ] Address
  - [ ] Price
  - [ ] Status badge
- [ ] "Message Provider" button works
- [ ] "Leave Review" button appears for completed bookings

#### Review System
- [ ] Review modal opens
- [ ] 5-star rating works
- [ ] Can write review text
- [ ] Can upload photos
- [ ] Submit button works
- [ ] Rating is required

#### Payment
- [ ] Access /payment page
- [ ] Booking summary shows correctly
- [ ] Payment method selection works (Card/Afterpay)
- [ ] Card payment form displays:
  - [ ] Card number formatting works
  - [ ] Expiry date formatting works
  - [ ] CVV field works
  - [ ] Cardholder name works
- [ ] Afterpay shows installment breakdown
- [ ] Total amount displays correctly
- [ ] Security messages show

### 🧹 Provider Features (20 min)

#### Dashboard
- [ ] Access /provider/dashboard
- [ ] Stats cards display:
  - [ ] Weekly earnings
  - [ ] Monthly earnings
  - [ ] Completed jobs
  - [ ] Average rating
- [ ] Booking requests section works:
  - [ ] Requests display
  - [ ] Accept button works
  - [ ] Decline button works
  - [ ] Request details show
- [ ] Upcoming schedule preview shows
- [ ] Quick actions buttons work

#### Availability Calendar
- [ ] Access /provider/calendar
- [ ] Weekly pattern displays
- [ ] Can toggle days on/off
- [ ] Day toggle switch works
- [ ] "Add Time Slot" button works
- [ ] Time slot modal opens
- [ ] Can select start/end times
- [ ] Can add time slot
- [ ] Time slots display correctly
- [ ] Can remove time slots
- [ ] "Block Date" button works
- [ ] Block date modal works
- [ ] Can block a date with reason
- [ ] Blocked dates display
- [ ] Can remove blocked dates
- [ ] "Save Changes" button works

#### Messages
- [ ] Access /provider/messages
- [ ] Conversation list displays
- [ ] Search conversations works
- [ ] Can select conversation
- [ ] Messages display in thread
- [ ] Can type message
- [ ] Send button works
- [ ] Message appears in thread
- [ ] Unread count displays
- [ ] Active status shows

#### Payment Tracking
- [ ] Access /provider/payments
- [ ] Earnings stats display:
  - [ ] Weekly earnings
  - [ ] Monthly earnings
  - [ ] Pending payments
  - [ ] Upcoming earnings
- [ ] Next payout card displays:
  - [ ] Payout date
  - [ ] Payout amount
  - [ ] Payment method
- [ ] Period filter works (Week/Month/Year)
- [ ] Transaction table displays
- [ ] Status badges show correctly
- [ ] "Export Report" button works
- [ ] How payouts work section displays

#### Verification
- [ ] Access /verification
- [ ] Progress bar shows correctly
- [ ] Email verification shows as complete
- [ ] Phone verification section displays:
  - [ ] Can enter phone number
  - [ ] "Send Code" button works
  - [ ] Code sent state shows
  - [ ] Can enter verification code
  - [ ] "Verify" button works
  - [ ] Verified state shows
- [ ] ID verification section displays:
  - [ ] Can upload file
  - [ ] File name shows after upload
  - [ ] "Submit" button works
  - [ ] Under review state shows
- [ ] Benefits section displays

### 👑 Admin Features (10 min)

#### Admin Dashboard
- [ ] Access /admin (as admin user)
- [ ] Stats grid displays:
  - [ ] Total users
  - [ ] Total bookings
  - [ ] Total revenue
  - [ ] Pending disputes
- [ ] Tabs work (Overview, Users, Bookings, Disputes)

#### User Management
- [ ] Users tab displays
- [ ] Search users works
- [ ] User table shows all users
- [ ] Role badges display
- [ ] Status badges display
- [ ] Verified badges show
- [ ] "Manage" button opens modal
- [ ] User details show in modal
- [ ] "Verify User" button works
- [ ] "Suspend User" button works

#### Bookings Tab
- [ ] Bookings tab displays
- [ ] Booking table shows all bookings
- [ ] Status badges display correctly
- [ ] All booking info displays

#### Disputes Tab
- [ ] Disputes tab displays
- [ ] Dispute cards show
- [ ] Dispute details display:
  - [ ] Reported by
  - [ ] Against
  - [ ] Reason
  - [ ] Status
- [ ] "Review" button opens modal
- [ ] Can resolve dispute

### 🎨 UI/UX (5 min)

#### Navigation
- [ ] Navbar displays correctly
- [ ] Logo/brand name shows
- [ ] Navigation links work
- [ ] User menu works (when logged in)
- [ ] Mobile menu works (hamburger icon)
- [ ] Active page highlighting works

#### Responsive Design
- [ ] Desktop view looks good (1920px)
- [ ] Laptop view looks good (1366px)
- [ ] Tablet view looks good (768px)
- [ ] Mobile view looks good (375px)
- [ ] All features accessible on mobile
- [ ] No horizontal scroll
- [ ] Touch targets are adequate

#### Loading & Error States
- [ ] Loading spinner shows when needed
- [ ] Error messages display clearly
- [ ] Success messages show
- [ ] Form validation works

#### Visual Design
- [ ] Colors are consistent
- [ ] Fonts are readable
- [ ] Icons display correctly
- [ ] Images load (placeholders)
- [ ] Shadows and borders look good
- [ ] Animations are smooth

## Demo Flow Recommendations

### Flow 1: Customer Journey (7 minutes)
1. Show landing page (1 min)
2. Register as customer (30 sec)
3. Search for providers with filters (1 min)
4. View provider profile (1 min)
5. Book a service (1.5 min)
6. Show payment options (1 min)
7. View booking in My Bookings (1 min)

### Flow 2: Provider Journey (7 minutes)
1. Register as provider (30 sec)
2. Show provider dashboard (1 min)
3. Set availability calendar (2 min)
4. Accept a booking request (1 min)
5. Send a message (1 min)
6. Show earnings dashboard (1.5 min)

### Flow 3: Admin Features (3 minutes)
1. Login as admin (15 sec)
2. Show platform statistics (45 sec)
3. Manage users (1 min)
4. Show dispute resolution (1 min)

### Flow 4: Verification System (2 minutes)
1. Show verification page (30 sec)
2. Verify phone number (45 sec)
3. Submit ID for verification (45 sec)

## Pre-Presentation Checklist

### Technical
- [ ] Both servers running without errors
- [ ] Database has test data
- [ ] All accounts created and tested
- [ ] Browser cache cleared
- [ ] Browser zoom at 100%
- [ ] Developer tools closed

### Presentation
- [ ] Demo accounts written down
- [ ] Flow rehearsed (2-3 times)
- [ ] Talking points prepared
- [ ] Screenshots/backup ready (in case of issues)
- [ ] Architecture diagram prepared
- [ ] Code examples highlighted

### Environment
- [ ] Good internet connection
- [ ] Laptop charged
- [ ] Backup laptop ready (if possible)
- [ ] HDMI/presentation cable tested
- [ ] Audio working (if needed)

## Troubleshooting During Demo

### If backend crashes:
1. Quickly restart: `npm run dev` in backend terminal
2. Show frontend features while waiting
3. Have screenshots of backend features

### If frontend crashes:
1. Refresh browser (Cmd/Ctrl + R)
2. If still broken, show code instead
3. Explain what it should do

### If database issues:
1. Have a backup database file ready
2. Or have screenshots of working features
3. Explain the architecture instead

### If nothing works:
1. Show the code architecture
2. Walk through component structure
3. Explain design decisions
4. Show screenshots of working app

## Post-Demo Questions You Might Get

### Technical Questions:
- [ ] "Why did you choose React?"
- [ ] "How does authentication work?"
- [ ] "How would you scale this?"
- [ ] "How do you handle security?"
- [ ] "What about testing?"

### Feature Questions:
- [ ] "How does payment processing work?"
- [ ] "Is messaging real-time?"
- [ ] "How do you verify providers?"
- [ ] "What happens to payments?"

### Team Questions:
- [ ] "How did you divide the work?"
- [ ] "What challenges did you face?"
- [ ] "How did you collaborate?"
- [ ] "What would you do differently?"

## Success Criteria ✓

By the end of demo, you should have shown:
- [ ] All requested features working
- [ ] Clean, modern UI
- [ ] Role-based access
- [ ] Responsive design
- [ ] Professional code quality

## Good Luck! 🍀

Remember:
- Stay calm and confident
- If something breaks, keep moving
- Focus on what works
- Explain your decisions
- Show enthusiasm

**You've got this!** 🚀

