# Shape - Google Forms-Style Form Builder

A full-stack form builder application inspired by Google Forms, built with React, TypeScript, Flask, and SQLite.

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose (recommended)
- OR Node.js 20+, Python 3.11+

### Start with Docker

```bash
# 1. Copy environment template
cp config/.env.example config/.env.local

# 2. Generate a Flask secret key (paste into .env.local)
python3 -c "import secrets; print(secrets.token_hex(32))"

# 3. Start the application
docker compose up
```

Access the app at: `http://localhost`

### Start Without Docker

**Backend Setup:**
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Generate secret key and add to ../config/.env.local
python3 -c "import secrets; print(secrets.token_hex(32))"

python server.py
```

**Frontend Setup:**
```bash
cd frontend
npm install
npm run dev
```

Access at: `http://localhost:5173`

## 📁 Project Structure

```
Shape/
├── frontend/                   # React + Vite frontend
│   ├── src/
│   │   ├── components/        # Reusable components & form builder
│   │   ├── features/          # Feature-specific pages
│   │   ├── context/           # Auth context
│   │   ├── types/             # TypeScript definitions
│   │   ├── constants/         # API endpoints, defaults
│   │   ├── hooks/             # Custom React hooks
│   │   ├── lib/               # Utilities
│   │   └── main.tsx           # Entry point
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── Dockerfile             # Multi-stage build
│   └── nginx.conf             # Production nginx config
├── backend/                    # Flask API server
│   ├── server.py              # Flask app & routes
│   ├── requirements.txt
│   ├── instance/              # SQLite database
│   ├── Dockerfile
│   └── .dockerignore
├── config/                     # Configuration
│   ├── .env.example           # Template (committed)
│   └── .env.local             # Secrets (gitignored)
├── docs/                       # Documentation
│   └── DEPLOYMENT.md          # Deployment guide
├── docker-compose.yml         # Local dev & production config
├── .gitignore
└── README.md
```

## 🎨 Features

### Core Form Building
- ✅ Drag-and-drop field editor
- ✅ Multiple field types (text, email, select, checkbox, date, etc.)
- ✅ Form preview while editing
- ✅ Rich form settings (presentation, restrictions, quiz options)

### Form Settings
- **Presentation**: Progress bar, shuffle questions, confirmation message
- **Restrictions**: Accept responses, email collection, allow editing
- **Quiz Mode**: Show correct answers, points, missed questions
- **Defaults**: Account-level default settings for new forms

### Dashboard & Responses
- ✅ Dashboard with form cards
- ✅ Group responses by form with counts
- ✅ View individual responses
- ✅ Export data (planned)

### Security
- ✅ User authentication with password hashing
- ✅ Single-session login enforcement (token-based)
- ✅ CORS protection
- ✅ Session-based form access control
- ✅ Form owner preview mode (doesn't save responses)

### UI/UX
- ✅ Dark mode toggle
- ✅ Responsive design
- ✅ Form cards redesigned (image removed, title/description swapped)
- ✅ Account settings page with defaults

## 🔑 Environment Variables

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for complete configuration.

**Critical for Development:**
```bash
FLASK_SECRET_KEY=your_generated_key_here
FLASK_ENV=development
CORS_ORIGINS=http://localhost:5173
```

## 🗄️ Database Schema

**Users**
- id, email, username, password, dark_mode, default_form_settings, session_token

**Forms**
- id, name, description, fields (JSON), settings (JSON), user_id, created_at

**FormResponses**
- id, form_id, user_id, answers (JSON), created_at

## 📡 API Endpoints

### Authentication
- `POST /signup` - Create new account
- `POST /login` - Authenticate user (generates session token)
- `POST /logout` - Logout (clears session token)
- `GET /me` - Get current user profile

### User Settings
- `GET /user/preferences` - Get dark_mode and defaultFormSettings
- `PUT /user/preferences` - Update preferences

### Forms (Protected)
- `GET /forms` - List user's forms
- `POST /forms` - Create new form
- `GET /forms/<id>` - Get form details
- `PUT /forms/<id>` - Update form
- `DELETE /forms/<id>` - Delete form

### Public Form (Unprotected)
- `GET /share/<form_id>` - Get form for public submission

### Responses
- `GET /responses` - Get all responses for user's forms (grouped)
- `GET /forms/<id>/responses` - Get responses for specific form
- `POST /forms/<id>/responses` - Submit form response (with validation)

## 🔐 Security Features

### Single-Session Login
Each user has a unique `session_token` stored in the database. Logging in on a new device invalidates the previous session automatically.

### Secret Management
- Development: Secrets in `config/.env.local` (gitignored)
- Production: Use platform secrets (Heroku, AWS, Docker, etc.)

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for deployment options.

### Form Owner Preview Mode
When a form owner submits through the public share link, responses are not persisted, allowing owners to test without polluting data.

## 🚢 Deployment

### Docker Compose
```bash
# Development
docker compose up

# Production
docker compose -f docker-compose.prod.yml up -d
```

### Cloud Platforms

**Heroku:**
```bash
heroku config:set FLASK_SECRET_KEY=your_key
git push heroku main
```

**AWS/Google Cloud/Azure:** See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)

## 📝 Development

### Frontend
```bash
cd frontend
npm install
npm run dev        # Start dev server
npm run build      # Production build
npm run lint       # ESLint
```

### Backend
```bash
cd backend
source venv/bin/activate
python server.py   # Start server
```

### TypeScript Validation
```bash
cd frontend
npx tsc --noEmit
```

## 🐛 Troubleshooting

**Port already in use:**
```bash
docker compose -p my_app up
# OR kill process on port 80/5000
```

**Database locked:**
```bash
# Restart backend container
docker compose restart backend
```

**CORS errors:**
- Check `CORS_ORIGINS` in `config/.env.local`
- Ensure frontend URL matches

**Secret key error in production:**
- Set `FLASK_SECRET_KEY` via your platform's secret manager
- See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)

## 📚 Learn More

- [Deployment Guide](docs/DEPLOYMENT.md)
- [Flask Documentation](https://flask.palletsprojects.com/)
- [React Documentation](https://react.dev/)
- [SQLAlchemy ORM](https://www.sqlalchemy.org/)

## 📄 License

MIT - See LICENSE file

## 🤝 Contributing

Contributions welcome! Please follow the existing code style and create a pull request.

---

**Built with** ❤️ using React, Flask, and TypeScript
