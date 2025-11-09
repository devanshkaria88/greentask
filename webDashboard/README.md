# GreenTask Web Dashboard

A hyperlocal climate-action micro-jobs marketplace web dashboard for government officials to post jobs and track their state.

## Overview

GreenTask connects government officials (Gram Panchayat/local bodies) with community members in rural/climate-vulnerable regions to complete climate-resilience tasks for verified compensation.

This dashboard allows officials to:
- Post climate action jobs
- Track job status and applications
- Review and verify completed work
- Manage payments to workers
- Monitor climate impact metrics

## Tech Stack

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS v4** - Utility-first styling with custom green theme
- **Redux Toolkit** - State management
- **RTK Query** - API data fetching and caching
- **shadcn/ui** - High-quality UI components
- **Lucide React** - Icon library
- **Sonner** - Toast notifications
- **next-themes** - Dark mode support

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Demo Credentials

- **Email**: Any valid email address
- **Password**: `password`

## Features

### ✅ Implemented

- **Authentication**
  - Login/logout functionality
  - Protected routes
  - Session persistence

- **Dashboard Home**
  - Stats overview (jobs, verifications, payments)
  - Climate impact metrics
  - Quick action buttons

- **Layout**
  - Collapsible sidebar navigation
  - User menu with profile
  - Theme toggle (light/dark/system)
  - Responsive design

### 🚧 In Progress

- Jobs management (create, edit, view, delete)
- Verifications workflow
- Payments system

## Project Structure

```
webDashboard/
├── app/                    # Next.js app directory
│   ├── login/             # Login page
│   └── dashboard/         # Dashboard pages
├── components/            # React components
│   ├── auth/             # Authentication components
│   ├── layout/           # Layout components
│   └── ui/               # shadcn/ui components
├── store/                # Redux store
│   ├── api/              # RTK Query APIs
│   └── authSlice.ts      # Auth state
├── lib/                  # Utilities
│   ├── types.ts          # TypeScript types
│   ├── utils.ts          # Helper functions
│   └── mock-data.ts      # Mock API data
├── providers/            # Context providers
└── docs/                 # Documentation
```

## API Structure

All APIs are currently mocked with simulated delays for development. They follow RTK Query patterns and are ready for backend integration.

### Available APIs

- **Auth API** - Login/logout
- **Dashboard API** - Stats and metrics
- **Jobs API** - CRUD operations for jobs
- **Verifications API** - Review submissions (pending)
- **Payments API** - Payment management (pending)

## Theme

The application uses a custom green color scheme to reflect the climate-action focus:

- **Primary**: Green (#22c55e) - Climate action
- **Secondary**: Blue - Water/sustainability
- **Accent**: Orange - Pending actions
- **Destructive**: Red - Warnings/errors

Both light and dark modes are supported.

## Development Guidelines

- Use shadcn/ui components exclusively
- Follow existing API structure with RTK Query
- All clickable elements must have `cursor-pointer`
- Maintain type safety with TypeScript
- Follow the project structure from xplayer-admin reference

## Documentation

See `/docs` folder for detailed documentation:
- `IMPLEMENTATION_PROGRESS.md` - Current implementation status

## Contributing

This project follows a structured implementation plan. Please refer to the documentation before making changes.

## License

Proprietary - GreenTask Climate Action Platform
