# Koyeb Deployment

## Prerequisites

1. **Koyeb Account**: Sign up at https://www.koyeb.com
2. **GitHub Repository**: Push your code to GitHub
3. **GitHub Container Registry (GHCR)**: Enabled by default

## Required Secrets

Add the following secrets to your GitHub repository (Settings > Secrets and variables > Actions):

| Secret Name | Description | How to Get |
|-------------|-------------|------------|
| `KOYEB_API_TOKEN` | Koyeb API authentication token | https://app.koyeb.com/account/api |
| `DATABASE_URL` | PostgreSQL connection string | `postgres://koyeb-adm:npg_Awu7pcBK3DJE@ep-wandering-thunder-a1k6mjm7.ap-southeast-1.pg.koyeb.app/koyebdb` |
| `RAILS_MASTER_KEY` | Rails credentials master key | Run `rails credentials:edit` in backend directory |

### Getting KOYEB_API_TOKEN

1. Go to https://app.koyeb.com/account/api
2. Click "Generate New Token"
3. Copy the token and add it as `KOYEB_API_TOKEN` secret

### Getting RAILS_MASTER_KEY

1. Navigate to `backend/config/master.key`
2. If it doesn't exist, run:
   ```bash
   cd backend
   rails credentials:edit
   ```
3. Copy the generated key and add it as `RAILS_MASTER_KEY` secret

## Deployment

The GitHub Action automatically deploys on push to `main`:

1. Builds frontend (React) and backend (Rails) Docker images
2. Pushes images to GitHub Container Registry
3. Creates/updates Koyeb services:
   - **frontend**: Serves the React app on port 80
   - **backend**: Runs Rails API on port 3000 with `/api/*` routes

## Accessing Your App

After deployment, your app will be available at:
- Frontend: `https://frontend-<random-id>.koyeb.app`
- Backend API: `https://backend-<random-id>.koyeb.app/api`

## Local Development

1. Backend:
   ```bash
   cd backend
   bin/rails db:create db:migrate
   bin/rails server
   ```

2. Frontend:
   ```bash
   cd frontend
   npm run dev
   ```

## Environment Variables

- Frontend `.env.local`: `VITE_API_URL` points to backend URL
- Backend `.env`: `DATABASE_URL` for PostgreSQL connection
