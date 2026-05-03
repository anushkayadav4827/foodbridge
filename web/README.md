# FoodBridge Web Application

Beautiful, modern web application for FoodBridge built with React, TypeScript, and Material-UI.

## Features

- 🎨 Beautiful UI/UX with Material-UI
- 🔐 OTP-based authentication
- 📱 Fully responsive design
- ⚡ Fast and optimized with Vite
- 🎭 Smooth animations with Framer Motion
- 🔔 Toast notifications
- 📊 Redux state management
- 🎯 TypeScript for type safety

## Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Material-UI (MUI)** - Component library
- **Redux Toolkit** - State management
- **React Router** - Routing
- **Axios** - HTTP client
- **Framer Motion** - Animations
- **React Hot Toast** - Notifications

## Getting Started

### Prerequisites

- Node.js 20+
- Backend API running on http://localhost:3000

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create environment file:
```bash
cp .env.example .env
```

3. Edit `.env` with your configuration:
```env
VITE_API_URL=http://localhost:3000/api/v1
VITE_GOOGLE_MAPS_API_KEY=your_key_here
```

### Development

Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:3001`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
web/
├── src/
│   ├── components/        # Reusable components
│   │   ├── auth/         # Authentication components
│   │   └── layout/       # Layout components
│   ├── pages/            # Page components
│   ├── store/            # Redux store
│   │   └── slices/       # Redux slices
│   ├── services/         # API services
│   ├── theme/            # MUI theme configuration
│   ├── App.tsx           # Main app component
│   ├── main.tsx          # Entry point
│   └── index.css         # Global styles
├── public/               # Static assets
├── index.html            # HTML template
├── vite.config.ts        # Vite configuration
└── package.json          # Dependencies
```

## Pages

### Public Pages
- **Landing Page** (`/`) - Beautiful hero section with features and stats
- **About** (`/about`) - About FoodBridge
- **How It Works** (`/how-it-works`) - Step-by-step guide
- **Login** (`/login`) - OTP-based authentication

### Protected Pages (Require Login)
- **Dashboard** (`/dashboard`) - User dashboard with stats
- **Discover** (`/discover`) - Find food near you
- **Create Listing** (`/create-listing`) - Post surplus food
- **Profile** (`/profile`) - User profile and settings
- **Impact** (`/impact`) - Track your impact

## Design System

### Colors
- **Primary Green**: `#2E7D32` - Growth, food, hope
- **Secondary Amber**: `#FF6F00` - Warmth, urgency
- **Background**: `#FAF8F5` - Warm cream white
- **Text**: `#3E2723` - Soil brown

### Typography
- **Display**: Playfair Display (serif) - For headlines
- **Body**: Inter (sans-serif) - For content

### Components
All components use Material-UI with custom theme overrides for:
- Rounded corners (12px border radius)
- Soft shadows
- Smooth hover effects
- Consistent spacing

## Features Implemented

✅ **Landing Page**
- Hero section with gradient background
- Animated stats counter
- Feature cards
- How it works section
- Call-to-action sections
- Footer

✅ **Authentication**
- OTP-based phone login
- Two-step verification
- Token management
- Auto-refresh tokens
- Protected routes

✅ **Dashboard**
- User stats cards
- Quick actions
- Recent activity
- Badges display

✅ **Layout**
- Responsive sidebar navigation
- Top app bar with notifications
- User menu
- Mobile-friendly drawer

## State Management

Redux Toolkit slices:
- **authSlice** - User authentication state
- **listingsSlice** - Food listings state
- **notificationsSlice** - Notifications state

## API Integration

All API calls go through `src/services/api.ts` which:
- Adds authentication headers
- Handles token refresh
- Manages errors
- Provides axios instance

## Animations

Framer Motion animations for:
- Page transitions
- Card hover effects
- Scroll-triggered animations
- Loading states

## Responsive Design

Breakpoints:
- **xs**: 0px (mobile)
- **sm**: 600px (tablet)
- **md**: 900px (small laptop)
- **lg**: 1200px (desktop)
- **xl**: 1536px (large desktop)

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance

- Code splitting with React.lazy
- Image optimization
- Lazy loading
- Memoization where needed
- Vite's fast HMR

## Deployment

### Vercel (Recommended)
```bash
npm run build
vercel --prod
```

### Netlify
```bash
npm run build
netlify deploy --prod --dir=dist
```

### AWS S3 + CloudFront
```bash
npm run build
aws s3 sync dist/ s3://your-bucket-name
```

## Environment Variables

- `VITE_API_URL` - Backend API URL
- `VITE_GOOGLE_MAPS_API_KEY` - Google Maps API key

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

Proprietary - All Rights Reserved

---

Built with ❤️ for a hunger-free world
