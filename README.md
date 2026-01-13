# MonoTask - Project Management Application

A full-stack project management application built with React 19 + TypeScript (frontend) and Ruby on Rails 8.1 (backend).

## Features

- **Task Management**: Create, edit, delete, and move tasks across status columns
- **Subtasks**: Add and manage subtasks with completion tracking
- **Auto Status Updates**: Task status automatically changes based on subtask progress
- **User Authentication**: JWT-based auth with login/register
- **Avatar Selection**: Choose from 35 unique avatars
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

### Frontend
- React 19
- TypeScript 5
- Vite 6
- @google/genai 1.35

### Backend
- Ruby on Rails 8.1
- PostgreSQL
- Solid Queue / Solid Cache / Solid Cable
- JWT for authentication

## Quick Start

### Prerequisites

- Node.js 18+
- Ruby 3.4+
- PostgreSQL 14+
- Bundle installed

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd jira-task
   ```

2. **Set up the backend**
   ```bash
   cd backend
   bundle install
   bin/rails db:create db:migrate db:seed
   bin/rails server
   ```

3. **Set up the frontend** (in a new terminal)
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **Access the application**
   - Frontend: http://localhost:3001
   - Backend API: http://localhost:3000

5. **Demo credentials**
   - Email: `demo@example.com`
   - Password: `demo123`

## Commands

### Frontend Commands (in `frontend/`)

```bash
npm run dev              # Start development server on port 3001
npm run build            # Production build
npm run preview          # Preview production build
```

### Backend Commands (in `backend/`)

```bash
# Database
bin/rails db:create           # Create database
bin/rails db:migrate          # Run migrations
bin/rails db:rollback         # Rollback last migration
bin/rails db:seed             # Run seed data
bin/rails db:reset            # Drop and recreate database

# Server
bin/rails server              # Start server (default port 3000)
bin/rails server -p 3001      # Start on port 3001

# Console
bin/rails console             # Rails console

# Testing
bin/rails test                           # Run all tests
bin/rails test test/controllers/         # Run controller tests
bin/rails test test/models/              # Run model tests

# Linting & Security
bundle exec rubocop              # Run RuboCop
bundle exec rubocop -a           # Auto-correct offenses
bundle exec brakeman             # Security scan
bundle exec bundle-audit check   # Gem vulnerability audit
```

### Root Level Commands

```bash
# Run both frontend and backend (requires two terminals)
# Terminal 1
cd backend && bin/rails server

# Terminal 2
cd frontend && npm run dev
```

## Project Structure

```
jira-task/
├── frontend/              # React + TypeScript + Vite
│   ├── components/        # React components
│   ├── services/          # API client
│   ├── types.ts           # TypeScript interfaces
│   ├── constants.ts       # App constants
│   ├── mockData.ts        # Demo data
│   └── vite.config.ts     # Vite configuration
├── backend/               # Ruby on Rails 8
│   ├── app/
│   │   ├── controllers/   # API controllers
│   │   ├── models/        # Database models
│   │   └── views/
│   ├── config/            # Configuration
│   ├── db/
│   │   ├── migrate/       # Database migrations
│   │   └── seeds.rb       # Seed data
│   └── test/              # Rails tests
├── dev-tools/             # Development tools
└── AGENTS.md              # Agent/coding guidelines
```

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/login` | Login with email/password |
| POST | `/auth/register` | Register new user |
| GET | `/auth/me` | Get current user |
| PATCH | `/auth/avatar` | Update user avatar |

### Tasks
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/tasks` | List all tasks |
| POST | `/tasks` | Create new task |
| PATCH | `/tasks/:id` | Update task |
| DELETE | `/tasks/:id` | Delete task |

### Subtasks
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/tasks/:task_id/create_subtask` | Create subtask |
| PATCH | `/tasks/:task_id/update_subtask/:id` | Update subtask |
| DELETE | `/tasks/:task_id/destroy_subtask/:id` | Delete subtask |

## Auto Status Logic

- **TODO → IN_PROGRESS**: When first subtask is created
- **Any → DONE**: When all subtasks are completed
- **DONE → IN_PROGRESS**: When a subtask is marked incomplete
- **IN_PROGRESS/TODO**: When all subtasks are deleted

## Environment Variables

### Frontend (in `frontend/.env.local`)
```
GEMINI_API_KEY=your-gemini-api-key
VITE_API_URL=http://localhost:3000
```
Defaults to `http://localhost:3000` if unset.

### Backend (uses environment variables)
- `config/database.yml` for PostgreSQL config (defaults: `DB_HOST=localhost`, `DB_PORT=5432`, `DB_USERNAME=postgres`, `DB_PASSWORD=postgres`, `DB_NAME=devdb`, `DB_NAME_TEST=backend_test`)
- `config/credentials.yml.enc` for Rails secrets
- Use `DB_HOST=host.containers.internal` when Rails runs in Podman and Postgres is on the host network.

## Podman Setup

To run the backend in Podman with the database on the host network:

1. Start PostgreSQL on the host (e.g., via Homebrew or direct install)

2. Run the backend in Podman with host networking:
   ```bash
   cd backend
   podman run -it --rm -p 3000:3000 \
     -e DB_HOST=host.containers.internal \
     -e DB_PORT=5432 \
     -e DB_USERNAME=postgres \
     -e DB_PASSWORD=postgres \
     -e DB_NAME=devdb \
     -v "$(pwd)":/app \
     -w /app \
     ruby:3.4 \
     bash -c "bundle install && bin/rails server"
   ```

3. Frontend runs locally:
   ```bash
   cd frontend
   npm run dev
   ```

## License

MIT
