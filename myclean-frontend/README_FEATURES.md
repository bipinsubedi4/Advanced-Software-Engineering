# MyClean Frontend - Feature Implementation Guide

This React application provides a comprehensive booking management system for the MyClean cleaning service platform.

## Tech Stack
- **React 18.2.0** - UI Framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **React Router DOM** - Routing
- **Axios** - HTTP client
- **date-fns** - Date manipulation
- **React Icons** - Icon library

## Features Implemented

### ✅ Authentication System
- **Login/Register** - Full authentication flow
- **JWT Token Management** - Secure token storage
- **Role-based Access** - CUSTOMER, PROVIDER, ADMIN roles
- **Protected Routes** - Route guards based on authentication and roles

### ✅ For Customers

#### 1. Search & Filter System (`/search`)
- Search providers by name and location
- Filter by:
  - Price range (slider)
  - Minimum rating
  - Service specializations
  - Availability
- Real-time filtering
- Provider cards with ratings, pricing, and specializations

#### 2. Provider Profiles (`/provider/:id`)
- Detailed provider information
- Experience, ratings, and completed jobs
- Work gallery
- Customer reviews with photos
- **Instant Booking** - Book directly from profile
- Date/time selection
- Service duration picker
- Price calculator

#### 3. My Bookings (`/my-bookings`)
- View all bookings (upcoming, completed, cancelled)
- Filter by status
- Booking details with provider info
- **Review System**:
  - 5-star rating
  - Written reviews
  - Photo uploads
- Message provider
- Reschedule/cancel options

#### 4. Secure Payment (`/payment`)
- **Afterpay Integration** - Pay in 4 installments
- Credit/Debit card payment
- Card detail validation
- Booking summary
- Payment protection guarantee
- Save card for future bookings

### ✅ For Service Providers

#### 1. Provider Dashboard (`/provider/dashboard`)
- **Real-time Stats**:
  - Weekly/monthly earnings
  - Completed jobs count
  - Average rating
  - Response rate
- **Booking Requests**:
  - View pending requests
  - Accept/decline bookings
  - Request details
- Upcoming schedule preview
- Quick actions panel

#### 2. Availability Calendar (`/provider/calendar`)
- **Weekly Recurring Pattern**:
  - Toggle day availability
  - Multiple time slots per day
  - Custom start/end times
- **Block Dates**:
  - Block specific dates (vacation, appointments)
  - Add reasons for blocking
  - View all blocked dates
- Save and sync availability

#### 3. In-App Messaging (`/provider/messages`)
- **Safe Communication**:
  - Chat with customers
  - No need to share personal contact
  - Message history
  - Real-time messaging
- Search conversations
- Unread message indicators
- Active status

#### 4. Payment Tracking (`/provider/payments`)
- **Earnings Dashboard**:
  - Weekly/monthly earnings
  - Pending payments
  - Upcoming bookings value
- **Guaranteed Payouts**:
  - Weekly payout schedule (every Friday)
  - Next payout preview
  - Payment protection info
- Transaction history table
- Export to CSV
- Payment status tracking

### ✅ Platform Features

#### 1. Verification System (`/verification`)
- **Email Verification** - Auto-verified on signup
- **Phone Verification**:
  - SMS code sending
  - Code verification
- **ID Verification**:
  - Upload government ID
  - Document review status
  - Verification badges
- Progress tracking
- Benefits explanation

#### 2. Admin Dashboard (`/admin`)
- **User Management**:
  - View all users (customers & providers)
  - User verification
  - Suspend/activate accounts
  - Search and filter users
- **Booking Monitoring**:
  - View all bookings
  - Booking statistics
  - Status tracking
- **Dispute Management**:
  - Review disputes
  - Dispute details
  - Resolution actions
- Platform statistics
- Recent activity feed

### 🎨 Shared Components
- **Navbar** - Role-based navigation
- **ProtectedRoute** - Authentication guard
- **Modal** - Reusable modal component
- **Card** - Consistent card styling
- **AuthContext** - Global authentication state

## Project Structure

```
myclean-frontend/
├── src/
│   ├── components/
│   │   ├── Navbar.tsx
│   │   ├── ProtectedRoute.tsx
│   │   ├── Modal.tsx
│   │   ├── Card.tsx
│   │   ├── BookingForm.tsx (legacy)
│   │   ├── Header.tsx (legacy)
│   │   └── ServiceList.tsx (legacy)
│   ├── context/
│   │   └── AuthContext.tsx
│   ├── pages/
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   ├── Home.tsx
│   │   ├── Verification.tsx
│   │   ├── customer/
│   │   │   ├── SearchProviders.tsx
│   │   │   ├── ProviderProfile.tsx
│   │   │   ├── MyBookings.tsx
│   │   │   └── Payment.tsx
│   │   ├── provider/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── AvailabilityCalendar.tsx
│   │   │   ├── Messages.tsx
│   │   │   └── PaymentTracking.tsx
│   │   └── admin/
│   │       └── AdminDashboard.tsx
│   ├── App.tsx
│   ├── index.tsx
│   └── index.css
├── public/
├── package.json
└── tailwind.config.js
```

## Getting Started

### Installation

```bash
cd myclean-frontend
npm install
```

### Running the App

```bash
npm start
```

The app will run on `http://localhost:3000`

### Backend Setup

Make sure the backend is running on `http://localhost:4000`. The frontend expects these API endpoints:

#### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

#### Users
- `GET /api/users` - Get all users
- `POST /api/users` - Create user

#### Services
- `GET /api/services` - Get all services
- `POST /api/services` - Create service

#### Bookings
- `GET /api/bookings` - Get all bookings
- `POST /api/bookings` - Create booking

## Backend Requirements

To fully support all features, you'll need to extend the backend with:

### Additional Database Models
```prisma
model Provider {
  id                Int      @id @default(autoincrement())
  userId            Int      @unique
  bio               String?
  hourlyRate        Int
  location          String
  specializations   String[] // JSON array
  verified          Boolean  @default(false)
  rating            Float    @default(0)
  reviewCount       Int      @default(0)
  availability      String   // JSON
  blockedDates      String   // JSON
  user              User     @relation(fields: [userId], references: [id])
}

model Review {
  id          Int      @id @default(autoincrement())
  bookingId   Int
  customerId  Int
  providerId  Int
  rating      Int
  comment     String
  photos      String[] // JSON array
  createdAt   DateTime @default(now())
}

model Message {
  id              Int      @id @default(autoincrement())
  conversationId  Int
  senderId        Int
  content         String
  createdAt       DateTime @default(now())
  isRead          Boolean  @default(false)
}

model Dispute {
  id          Int      @id @default(autoincrement())
  bookingId   Int
  reporterId  Int
  againstId   Int
  reason      String
  status      String   @default("pending")
  createdAt   DateTime @default(now())
}
```

### Additional API Endpoints

#### Provider Management
- `GET /api/providers` - Get all providers
- `GET /api/providers/:id` - Get provider details
- `PUT /api/providers/:id` - Update provider profile
- `PUT /api/providers/:id/availability` - Update availability

#### Reviews
- `GET /api/bookings/:id/reviews` - Get booking reviews
- `POST /api/bookings/:id/reviews` - Create review

#### Messages
- `GET /api/messages/conversations` - Get user conversations
- `GET /api/messages/:conversationId` - Get conversation messages
- `POST /api/messages` - Send message

#### Verification
- `POST /api/verification/phone` - Send phone verification code
- `POST /api/verification/phone/verify` - Verify phone code
- `POST /api/verification/id` - Upload ID document

#### Admin
- `GET /api/admin/users` - Get all users (admin only)
- `PUT /api/admin/users/:id/suspend` - Suspend user
- `GET /api/admin/disputes` - Get all disputes
- `PUT /api/admin/disputes/:id/resolve` - Resolve dispute

## Key Features to Note

### 1. Role-Based Access Control
The app has three user types:
- **CUSTOMER** - Can search and book cleaners
- **PROVIDER** - Can manage bookings and availability
- **ADMIN** - Can manage all users and resolve disputes

### 2. Mock Data
Currently, most features use mock data. You'll need to:
- Connect to actual API endpoints
- Replace mock data with API calls
- Handle loading states
- Add error handling

### 3. Payment Integration
The Afterpay integration is UI-only. You'll need to:
- Integrate with actual Afterpay API
- Set up Stripe or similar for card payments
- Handle payment webhooks

### 4. File Uploads
ID verification and review photos need:
- File upload API endpoint
- Cloud storage (S3, Cloudinary, etc.)
- Image processing

### 5. Real-time Features
For the messaging system:
- Consider WebSocket implementation
- Or use polling for updates
- Add notification system

## Styling & Design

### Color Scheme
- Primary: Blue (#0ea5e9)
- Success: Green
- Warning: Yellow
- Danger: Red
- Gray scale for text and backgrounds

### Responsive Design
All pages are fully responsive:
- Mobile-first approach
- Tailwind breakpoints (sm, md, lg, xl)
- Hamburger menu for mobile

## Testing

To test different user roles:
1. Register as CUSTOMER (default role)
2. Register as PROVIDER (select "Offer cleaning services")
3. For ADMIN access, manually update user role in database

## Next Steps

1. **Backend Integration**:
   - Implement missing API endpoints
   - Add authentication middleware
   - Set up database migrations

2. **Real Payments**:
   - Integrate Afterpay SDK
   - Set up Stripe
   - Handle webhooks

3. **File Storage**:
   - Set up AWS S3 or Cloudinary
   - Implement upload endpoints
   - Add image optimization

4. **Real-time Features**:
   - WebSocket for messaging
   - Push notifications
   - Real-time booking updates

5. **Testing**:
   - Unit tests
   - Integration tests
   - E2E tests with Cypress

6. **Deployment**:
   - Build for production
   - Deploy to Vercel/Netlify
   - Set up CI/CD

## Support

For any questions or issues, please refer to:
- React documentation: https://react.dev
- Tailwind CSS: https://tailwindcss.com
- React Router: https://reactrouter.com

Good luck with your university project! 🚀

