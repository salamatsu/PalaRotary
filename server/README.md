# PALAROTARY 2025 - Server

Backend server for PALAROTARY 2025 Event Management System.

## Features

- Club registration with payment processing
- Member registration with digital badges
- Admin dashboard for managing registrations
- Email notifications via SendGrid
- QR code generation for member badges
- SQLite database for easy deployment

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: SQLite3
- **Email**: SendGrid
- **Authentication**: JWT (jsonwebtoken)
- **File Upload**: Multer
- **QR Code**: qrcode
- **Password Hashing**: bcryptjs

## Installation

1. **Install dependencies**:
   ```bash
   cd server
   npm install
   ```

2. **Configure environment variables**:
   - Copy `.env.example` to `.env`
   - Update the values, especially:
     - `SENDGRID_API_KEY` - Your SendGrid API key
     - `JWT_SECRET` - A strong secret key
     - `FRONTEND_URL` - Your frontend URL

3. **Initialize database**:
   ```bash
   npm run init-db
   ```
   This will create the SQLite database and default admin user:
   - **Username**: `admin`
   - **Password**: `admin123`

4. **Start the server**:
   ```bash
   # Development mode (with nodemon)
   npm run dev

   # Production mode
   npm start
   ```

The server will start on `http://localhost:3000`

## API Endpoints

### Public Endpoints

#### Authentication
- `POST /api/auth/login` - Admin login

#### Club Registration
- `POST /api/clubs/register` - Register a new club
- `POST /api/clubs/:id/upload-payment` - Upload proof of payment
- `GET /api/clubs/payment-info` - Get payment information
- `GET /api/clubs/approved` - Get list of approved clubs
- `GET /api/clubs/:id/status` - Check club registration status

#### Member Registration
- `POST /api/members/register` - Register a new member
- `GET /api/members/:id/badge` - Get member badge
- `GET /api/members/:id` - Get member details

### Protected Endpoints (Admin Only)

#### Dashboard & Analytics
- `GET /api/admin/dashboard` - Get dashboard metrics
- `GET /api/admin/analytics` - Get detailed analytics

#### Club Management
- `GET /api/admin/clubs` - Get all clubs (with filters)
- `GET /api/admin/clubs/:id` - Get club details with members
- `PUT /api/admin/clubs/:id/approve` - Approve club registration
- `PUT /api/admin/clubs/:id/reject` - Reject club registration

#### Member Management
- `GET /api/admin/members` - Get all members (with filters)
- `DELETE /api/admin/members/:id` - Delete member

#### Zone Management
- `GET /api/admin/zones` - Get zones with payment status

## Database Schema

The SQLite database includes the following tables:

- **clubs** - Registered clubs
- **members** - Individual member registrations
- **admins** - Admin users
- **payment_info** - Payment information
- **email_logs** - Email notification logs

## Email Notifications

The system sends the following emails:

1. **Club Registration Confirmation** - Sent immediately after registration
2. **Payment Reminder** - Sent 4 hours after registration if no payment proof
3. **Approval Notification** - Sent when club is approved
4. **Rejection Notification** - Sent when club is rejected
5. **Member Badge Delivery** - Sent with digital badge after member registration

## File Uploads

- **Payment Proofs**: Stored in `uploads/payments/`
- **QR Code Badges**: Stored in `uploads/badges/`
- **Allowed formats**: JPEG, PNG, WebP, PDF
- **Max file size**: 5MB (configurable)

## Event Information

- **Event**: PALAROTARY 2025
- **Date**: January 25, 2026
- **Location**: Marikina Sports Center
- **Time**: 8am-6pm
- **Club Registration Fee**: ₱4,000

## Payment Information

### BDO Bank Transfer
- **Account Name**: Rotary Club of Marikina Hilltop
- **Account Number**: 0021 5802 5770

### GCash
- **Account Name**: Karl Marcus Montaner
- **Mobile Number**: 0917 522 5275

## Default Admin Credentials

After running `npm run init-db`, you can login with:

- **Username**: admin
- **Password**: admin123

**⚠️ Important**: Change the default password after first login!

## Development

```bash
# Install dependencies
npm install

# Initialize database
npm run init-db

# Run in development mode with auto-reload
npm run dev
```

## Production Deployment

1. Set `NODE_ENV=production` in your `.env`
2. Update `JWT_SECRET` with a strong secret key
3. Configure SendGrid API key
4. Set proper `FRONTEND_URL`
5. Run `npm run init-db`
6. Run `npm start`

## Troubleshooting

### Database Issues
If you encounter database errors, try deleting `palarotary.db` and running `npm run init-db` again.

### Email Not Sending
- Verify your SendGrid API key is correct
- Check that your SendGrid account is active
- Ensure `SENDGRID_FROM_EMAIL` is verified in SendGrid

### File Upload Errors
- Check that the `uploads/` directory is writable
- Verify file size is within the limit
- Ensure file type is supported (JPEG, PNG, WebP, PDF)

## License

MIT
