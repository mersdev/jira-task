# Backend API

Rails 8 API application providing task management endpoints.

## Architecture

```mermaid
flowchart TD
    subgraph Client Layer
        Frontend[React Frontend]
        Mobile[Mobile Clients]
        External[External Services]
    end

    subgraph API Layer
        Nginx[Nginx Reverse Proxy]
    end

    subgraph Rails Application
        Routes[Rails Routes]
        Controllers[Controllers]
        Models[Models]
        Jobs[Jobs]
        Mailers[Mailers]
    end

    subgraph Data Layer
        Postgres[(PostgreSQL)]
        Redis[Redis Cache]
        SecretManager[Secret Manager]
    end

    Frontend --> Nginx
    Mobile --> Nginx
    External --> Nginx
    Nginx --> Routes
    Routes --> Controllers
    Controllers --> Models
    Controllers --> Jobs
    Jobs --> Redis
    Models --> Postgres
    Controllers --> SecretManager
```

## Request Flow

```mermaid
sequenceDiagram
    participant C as Client
    participant R as Rails
    participant M as Models
    participant D as Database
    participant S as Secret Manager

    C->>R: POST /api/todos
    R->>S: Fetch secrets
    S->>R: Decrypted credentials
    R->>M: Create Todo
    M->>D: INSERT INTO todos
    D-->>M: Created record
    M-->>R: @todo
    R-->>C: 201 Created
```

## Models

```mermaid
erDiagram
    User ||--o{ Task : has
    User ||--o{ Todo : owns
    Task ||--o{ Subtask : contains
    Todo {
        string name
        string status
        text description
    }
    Task {
        string title
        enum status
        text body
    }
    User {
        string email
        string password_digest
    }
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/health | Health check |
| GET | /api/todos | List todos |
| POST | /api/todos | Create todo |
| PUT | /api/todos/:id | Update todo |
| DELETE | /api/todos/:id | Delete todo |

## Development

```bash
# Start development server
bin/dev

# Run tests
bin/rails test

# Run linter
bundle exec rubocop
```

## Production

```bash
# Build Docker image
docker build -t jira-task-backend:latest .

# Run migrations
docker run jira-task-backend bin/rails db:migrate
```

## Secrets Management

Secrets are managed via environment variables:

```bash
DATABASE_URL=postgresql://...
RAILS_MASTER_KEY=...
SECRET_KEY_BASE=...
```
