# HealthMate - Sehat ka Smart Dost 🏥

A beautiful, professional health records management application with AI-powered insights. Built with React, TypeScript, and Tailwind CSS.

## Features ✨

- 🎨 **Beautiful UI/UX** - Modern, responsive design with smooth animations
- 🌓 **Dark/Light Mode** - Dynamic theme switching for comfortable viewing
- 🔐 **Secure Authentication** - Sign in/Sign up with proper validation
- 📊 **Dashboard** - View health statistics and recent reports
- 📱 **Fully Responsive** - Works seamlessly on all devices
- 🎯 **SEO Optimized** - Proper meta tags and semantic HTML

## Tech Stack 🛠️

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **Routing**: React Router v6
- **State Management**: React Query (TanStack Query)
- **Build Tool**: Vite
- **UI Components**: Radix UI primitives

## Getting Started 🚀

### Prerequisites

- Node.js 16+ and npm installed
- Your backend API running (see Backend Integration section)

### Installation

1. Clone the repository:
```bash
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file from the example:
```bash
cp .env.example .env
```

4. Update the `.env` file with your backend API URL:
```env
VITE_API_URL=http://localhost:5000
```

5. Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:8080`

## Backend Integration 🔌

This frontend is designed to work with your HealthMate backend API. Make sure to configure the following:

### Required API Endpoints

**Authentication:**
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

**Reports:**
- `POST /api/reports/upload` - Upload medical reports (multipart/form-data)
- `GET /api/reports` - Get list of reports (supports query params: hospital, doctor, startDate, endDate)
- `GET /api/reports/:id` - Get single report
- `POST /api/reports` - Create report
- `PUT /api/reports/:id` - Update report
- `DELETE /api/reports/:id` - Delete report

**User & Tickets:**
- `/api/user/*` - User management routes
- `/api/ticket/*` - Support ticket routes

### API Configuration

Update `VITE_API_URL` in your `.env` file to point to your backend:

```env
# Development
VITE_API_URL=http://localhost:5000

# Production
VITE_API_URL=https://api.yourdomain.com
```

## Project Structure 📁

```
src/
├── assets/          # Images and static files
├── components/      # Reusable components
│   ├── ui/         # shadcn/ui components
│   ├── Navbar.tsx
│   ├── ThemeProvider.tsx
│   └── ThemeToggle.tsx
├── hooks/          # Custom React hooks
├── lib/            # Utility functions
├── pages/          # Page components
│   ├── Landing.tsx
│   ├── SignIn.tsx
│   ├── SignUp.tsx
│   ├── Dashboard.tsx
│   └── NotFound.tsx
├── App.tsx         # Main app component
├── index.css       # Global styles & design system
└── main.tsx        # App entry point
```

## Design System 🎨

The app uses a carefully crafted design system with:
- **Primary Color**: Medical blue (HSL: 195, 85%, 45%)
- **Secondary Color**: Teal accent (HSL: 185, 70%, 50%)
- **Semantic tokens** for consistent theming
- **Custom animations** for smooth user experience
- **Responsive breakpoints** for all screen sizes

All colors and styles are defined in `src/index.css` and `tailwind.config.ts`.

## Available Scripts 📜

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Deployment 🚀

### Using Lovable

Simply click on **Share → Publish** in the Lovable interface.

### Manual Deployment

1. Build the project:
```bash
npm run build
```

2. Deploy the `dist` folder to your hosting platform (Vercel, Netlify, etc.)

## Environment Variables 🔐

Create a `.env` file with:

```env
VITE_API_URL=your_backend_api_url
```

## Contributing 🤝

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

