# RTE Foods - Premium Ready-to-Eat Foods E-Commerce

A complete production-ready MERN Stack E-Commerce application for premium ready-to-eat foods.

## Tech Stack

- **Frontend**: React.js + Vite + Tailwind CSS + Redux Toolkit
- **Backend**: Node.js + Express.js + MongoDB
- **Auth**: JWT + Refresh Token
- **Image Upload**: Cloudinary
- **Payments**: Razorpay + Stripe

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### Installation

```bash
# Install all dependencies
npm run install:all

# Or install separately
cd backend && npm install
cd ../frontend && npm install
```

### Environment Variables

**Backend** (`backend/.env`):
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/rte_foods
JWT_SECRET=your_secret
JWT_REFRESH_SECRET=your_refresh_secret
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d
CLOUDINARY_CLOUD_NAME=xxx
CLOUDINARY_API_KEY=xxx
CLOUDINARY_API_SECRET=xxx
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

**Frontend** (`frontend/.env`):
```
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=RTE Foods
```

### Seed Database

```bash
cd backend
node utils/seeder.js
```

Default accounts:
- Admin: `admin@rtefoods.com` / `admin123`
- User: `john@example.com` / `user123`

### Run Development

```bash
# Backend
cd backend && npm run dev

# Frontend (new terminal)
cd frontend && npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:5000

### Production Build

```bash
npm run build
npm start
```

## Features

### User Website
- Hero carousel with auto-slide
- Category browsing
- Advanced product search & filters
- Product detail with gallery, zoom, reviews
- Shopping cart with coupons
- Checkout with address & payment
- Order tracking
- Wishlist
- User profile & addresses
- Responsive design (mobile-first)

### Admin Dashboard
- Dashboard with charts & analytics
- Category & Subcategory management
- Complete Product CRUD (with variants, nutrition, gallery)
- Order management with timeline
- Customer management
- Coupon management
- Banner & Offer management
- Blog & FAQ management
- Newsletter & Contact management
- Pincode & Inventory management
- Settings panel (General, SEO, Payment, Shipping, Tax)
- Media library with Cloudinary

## Deployment

### Frontend (Vercel)
1. Push to GitHub
2. Import on Vercel
3. Set root directory to `frontend`
4. Add env variable: `VITE_API_URL`

### Backend (Render)
1. Push to GitHub
2. Create new Web Service on Render
3. Set root directory to `backend`
4. Add all env variables
5. Build command: `npm install`
6. Start command: `npm start`

## Project Structure

```
├── backend/
│   ├── config/          # Database config
│   ├── controllers/     # Route handlers
│   ├── middleware/       # Auth, error handling
│   ├── models/          # Mongoose schemas
│   ├── routes/          # API routes
│   ├── services/        # Email service
│   └── utils/           # Helpers, seeder
├── frontend/
│   └── src/
│       ├── assets/      # Images, icons
│       ├── components/  # Reusable UI
│       ├── hooks/       # Custom hooks
│       ├── layouts/     # Page layouts
│       ├── pages/       # Page components
│       │   └── admin/   # Admin pages
│       ├── redux/       # State management
│       ├── services/    # API calls
│       └── utils/       # Helpers
```

## License

MIT
