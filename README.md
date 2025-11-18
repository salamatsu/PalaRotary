# PALAROTARY 2025 - Event Management System

A complete event management system for **PALAROTARY 2025** - Radio Enthusiasts Convention.

## Event Details

- **Event Name**: PALAROTARY 2025
- **Date**: January 25, 2026
- **Location**: Marikina Sports Center
- **Time**: 8am-6pm

## Features

### Public Features
- **Club Registration** (₱4,000 per club)
  - Online registration form
  - Payment proof upload
  - Email notifications
  - Payment methods: BDO Bank Transfer, GCash
  - Special: Free Lechon for zones with complete payments!

- **Member Registration** (FREE)
  - Select registered club
  - Fill registration form
  - Instant digital badge with QR code
  - Badge sent via email

### Admin Features
- **Dashboard & Analytics**
  - Real-time metrics
  - Club and member statistics
  - Revenue tracking
  - Zone completion status

- **Club Management**
  - View all club registrations
  - Approve/reject registrations
  - View payment proofs
  - Track payment status

- **Member Management**
  - View all registered members
  - View digital badges
  - Delete members if needed

## Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: SQLite3
- **Email**: SendGrid
- **Authentication**: JWT (jsonwebtoken)
- **File Upload**: Multer
- **QR Code**: qrcode
- **Password Hashing**: bcryptjs

### Frontend
- **Framework**: React 19
- **Build Tool**: Vite 7
- **UI Library**: Ant Design 5
- **Styling**: TailwindCSS 4
- **State Management**: Zustand
- **Data Fetching**: TanStack Query (React Query)
- **Routing**: React Router 7
- **Form Validation**: Zod
- **HTTP Client**: Axios

## Project Structure

```
PalaRotary/
├── server/                 # Backend Node.js server
│   ├── src/
│   │   ├── config/        # Database & initialization
│   │   ├── controllers/   # Route controllers
│   │   ├── middleware/    # Auth, upload, error handlers
│   │   ├── models/        # Database models
│   │   ├── routes/        # API routes
│   │   ├── services/      # Email, badge generation
│   │   └── server.js      # Main server file
│   ├── uploads/           # File uploads (payments, badges)
│   ├── .env               # Environment variables
│   └── package.json
│
├── src/                   # Frontend React app
│   ├── pages/
│   │   └── Palarotary/   # PALAROTARY pages
│   │       ├── LandingPage.jsx
│   │       ├── ClubRegistration.jsx
│   │       ├── MemberRegistration.jsx
│   │       ├── AdminLogin.jsx
│   │       ├── AdminDashboard.jsx
│   │       ├── AdminClubs.jsx
│   │       └── AdminMembers.jsx
│   ├── services/         # API services & React Query hooks
│   ├── store/            # Zustand stores
│   ├── routes/           # React Router configuration
│   └── components/       # Reusable components
│
└── README.md
```

## Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- SendGrid account (for email notifications)

### 1. Backend Setup

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Create .env file (copy from .env.example)
cp .env.example .env

# Edit .env and configure:
# - SENDGRID_API_KEY (your SendGrid API key)
# - JWT_SECRET (a strong secret key)
# - Other environment variables as needed

# Initialize database
npm run init-db

# Start the server
npm run dev
```

The backend server will start on `http://localhost:3000`

**Default Admin Credentials:**
- Username: `admin`
- Password: `admin123`

⚠️ **Important:** Change the default password after first login!

### 2. Frontend Setup

```bash
# Navigate to root directory (or frontend directory if separate)
cd ..

# Install dependencies
npm install

# Create .env file for frontend
# Add VITE_BASEURL=http://localhost:3000

# Start the development server
npm run dev
```

The frontend will start on `http://localhost:5173`

## Usage

### Public Access

1. **Register a Club**
   - Visit `http://localhost:5173/register-club`
   - Fill in club information
   - Select payment method (BDO or GCash)
   - Upload proof of payment
   - Wait for admin approval
   - Receive confirmation email

2. **Register as Member**
   - Visit `http://localhost:5173/register-member`
   - Select your approved club
   - Fill in your information
   - Receive digital badge instantly
   - Check your email for badge

### Admin Access

1. **Login**
   - Visit `http://localhost:5173/admin-login`
   - Enter credentials
   - Access admin dashboard

2. **Manage Clubs**
   - View all club registrations
   - Review payment proofs
   - Approve or reject registrations
   - Send automatic email notifications

3. **Manage Members**
   - View all registered members
   - View digital badges
   - Filter by club
   - Delete members if needed

## Payment Information

### BDO Bank Transfer
- **Account Name**: Rotary Club of Marikina Hilltop
- **Account Number**: 0021 5802 5770

### GCash
- **Account Name**: Karl Marcus Montaner
- **Mobile Number**: 0917 522 5275

## Email Notifications

The system automatically sends the following emails:

1. **Club Registration Confirmation** - Sent immediately after registration
2. **Payment Reminder** - Sent 4 hours after registration if no payment proof
3. **Approval Notification** - Sent when club is approved
4. **Rejection Notification** - Sent when club is rejected
5. **Member Badge Delivery** - Sent with digital badge after member registration

## API Endpoints

### Public Endpoints
- `POST /api/clubs/register` - Register a club
- `POST /api/clubs/:id/upload-payment` - Upload payment proof
- `GET /api/clubs/payment-info` - Get payment information
- `GET /api/clubs/approved` - Get approved clubs
- `POST /api/members/register` - Register a member
- `GET /api/members/:id/badge` - Get member badge

### Admin Endpoints (Protected)
- `POST /api/auth/login` - Admin login
- `GET /api/admin/dashboard` - Dashboard metrics
- `GET /api/admin/clubs` - List all clubs
- `PUT /api/admin/clubs/:id/approve` - Approve club
- `PUT /api/admin/clubs/:id/reject` - Reject club
- `GET /api/admin/members` - List all members
- `DELETE /api/admin/members/:id` - Delete member

## Development

### Backend Development
```bash
cd server
npm run dev  # Runs with nodemon for auto-reload
```

### Frontend Development
```bash
npm run dev  # Runs Vite dev server
```

## Production Deployment

### Backend
1. Set `NODE_ENV=production` in `.env`
2. Configure production database path
3. Set strong `JWT_SECRET`
4. Configure SendGrid API key
5. Run `npm run init-db`
6. Run `npm start`

### Frontend
1. Build the frontend: `npm run build`
2. Serve the `dist` folder using a web server (nginx, Apache, etc.)
3. Configure environment variables for production

## Troubleshooting

### Database Issues
- Delete `palarotary.db` and run `npm run init-db` again

### Email Not Sending
- Verify SendGrid API key is correct
- Check SendGrid account is active
- Verify sender email is verified in SendGrid

### File Upload Errors
- Check `uploads/` directory permissions
- Verify file size is within limit (5MB)
- Ensure file type is supported

### CORS Issues
- Update `FRONTEND_URL` in backend `.env`
- Ensure frontend is running on the correct port

## Contributing

This is a private event management system for PALAROTARY 2025.

## License

MIT

## Support

For questions and support, please contact the PALAROTARY organizing committee.

---

**PALAROTARY 2025** - Bringing radio enthusiasts together!
