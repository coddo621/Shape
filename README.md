# Shape

A modern full-stack application combining a React frontend with a Python Flask backend. The project features a login interface and a comprehensive dashboard with a set of reusable UI components.

## Tech Stack

### Frontend
- **React 19** - UI framework
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool and dev server
- **React Router 7** - Client-side routing
- **Tailwind CSS 4** - Utility-first CSS framework
- **Radix UI** - Unstyled, accessible component primitives
- **Lucide React** - Icon library

### Backend
- **Flask** - Lightweight Python web framework

### Development Tools
- **ESLint** - Code linting
- **TypeScript** - Static type checking

## Project Structure

```
Shape/
├── src/
│   ├── components/
│   │   └── ui/                    # Reusable UI components
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── input.tsx
│   │       └── label.tsx
│   ├── assets/
│   │   └── images/               # Static image assets
│   ├── lib/
│   │   └── utils.ts              # Utility functions
│   ├── dashboard.tsx             # Dashboard page
│   ├── login.tsx                 # Login page
│   ├── main.tsx                  # Application entry point
│   └── main.css                  # Global styles
├── public/                        # Static files
├── server.py                      # Flask backend server
├── package.json                   # Node dependencies
├── vite.config.ts                # Vite configuration
├── tsconfig.json                 # TypeScript configuration
└── README.md                      # This file
```

## Getting Started

### Prerequisites
- Node.js 16+ and npm/yarn
- Python 3.7+

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Shape
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Install Python dependencies** (if needed)
   ```bash
   pip install flask
   ```

### Development

1. **Start the development server**
   ```bash
   npm run dev
   ```
   This starts the Vite dev server, typically at `http://localhost:5173`

2. **Start the Flask backend** (in another terminal)
   ```bash
   python server.py
   ```
   The backend runs at `http://localhost:5000`

3. **Run linting**
   ```bash
   npm run lint
   ```

### Production Build

```bash
npm run build
```

This compiles TypeScript and bundles the application with Vite.

### Preview Production Build

```bash
npm run preview
```

## Features

- **Authentication** - Login page for user authentication
- **Dashboard** - Main application interface after login
- **Reusable Components** - Pre-built UI components for consistent design
- **Responsive Design** - Tailwind CSS-based responsive layouts
- **Type Safety** - Full TypeScript support for reliability

## Routing

The application uses React Router with the following routes:

- `/` - Login page
- `/dashboard` - Dashboard page

## Contributing

This is an active development project. Feel free to submit issues and enhancement requests.