# AGENTS.md - MonoTask Development Guide

## Project Overview

MonoTask is a project management application with:
- **Frontend**: React 19, TypeScript 5, Vite 6, @google/genai 1.35
- **Backend**: Ruby on Rails 8.1, PostgreSQL, Solid Queue/Cache/Cable
- **Deployment**: Docker with Kamal

## Build Commands

### Frontend (in `frontend/`)

```bash
npm run dev              # Start dev server on port 3001
npm run build            # Production build
npm run preview          # Preview production build
```

### Backend (in `backend/`)

```bash
# Setup
bin/rails db:create db:migrate db:seed

# Development
bin/rails server         # Start server (default port 3000)
bin/rails console        # Rails console

# Testing
bin/rails test                    # Run all tests
bin/rails test test/controllers/todos_controller_test.rb  # Single test file
bin/rails test test/controllers/todos_controller_test.rb:8 # Single test line
```

## Linting & Type Checking

### Frontend
```bash
# No ESLint/Prettier configured yet - recommend adding:
npx eslint . --ext .ts,.tsx
npx prettier --check .
```

### Backend
```bash
bundle exec rubocop              # Run RuboCop
bundle exec rubocop -a           # Auto-correct offenses
bundle exec brakeman             # Security scan
bundle exec bundle-audit check   # Gem vulnerability audit
```

## Code Style Guidelines

### TypeScript (Frontend)

**Imports:**
```typescript
// React core first, then external libs, then local imports
import React, { useState, useEffect } from 'react';
import { api } from './services/api';
import { Task, User } from './types';
import { Auth } from './components/Auth';
```

**Component Patterns:**
```typescript
// Named exports with React.FC typing
export const ComponentName: React.FC<Props> = ({ prop1, prop2 }) => {
  // hooks at top
  const [state, setState] = useState(false);

  // handlers
  const handleClick = () => { /* ... */ };

  return <JSX />;
};
```

**Naming Conventions:**
- Components: PascalCase (`TaskBoard`, `Auth`)
- Files: camelCase for utilities, PascalCase for components
- Variables/functions: camelCase
- Enums/Interfaces: PascalCase
- Constants: UPPER_SNAKE_CASE or camelCase for small scopes

**Error Handling:**
```typescript
try {
  await api.getTasks();
} catch (error) {
  console.error("Failed to fetch tasks:", error);
  // Show user feedback
}
```

**Type Definitions:**
```typescript
export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  REVIEW = 'REVIEW',
  DONE = 'DONE',
}

export interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  createdAt: number;
}
```

**Paths:**
- Use `@/` alias for imports from frontend root (configured in vite.config.ts and tsconfig.json)

### Ruby on Rails (Backend)

**Style Guide:**
- Follows [rails-omakase](https://github.com/rubocop/rubocop-rails-omakase) style
- Inherits from `rubocop-rails-omakase` gem

**Naming:**
- Models: Singular, PascalCase (`class Todo < ApplicationRecord`)
- Controllers: Plural, PascalCase with Controller suffix (`TodosController`)
- Routes: RESTful, plural resources (`resources :todos`)
- Database columns: `snake_case`, foreign keys use `_id` suffix

**Controller Patterns:**
```ruby
class TodosController < ApplicationController
  before_action :set_todo, only: %i[show update destroy]

  def index
    @todos = Todo.all
    render json: @todos
  end

  def create
    @todo = Todo.new(todo_params)
    if @todo.save
      render json: @todo, status: :created, location: @todo
    else
      render json: @todo.errors, status: :unprocessable_content
    end
  end

  private
    def set_todo
      @todo = Todo.find(params.expect(:id))
    end

    def todo_params
      params.expect(todo: [:name, :status, :desc])
    end
end
```

**Test Patterns:**
```ruby
class TodosControllerTest < ActionDispatch::IntegrationTest
  setup do
    @todo = todos(:one)
  end

  test "should get index" do
    get todos_url, as: :json
    assert_response :success
  end
end
```

## Project Structure

```
/jira-task/
├── frontend/              # React + TypeScript + Vite
│   ├── components/        # React components
│   ├── services/          # API clients
│   ├── types.ts           # TypeScript interfaces
│   ├── constants.ts       # App constants
│   ├── mockData.ts        # Demo data
│   └── vite.config.ts     # Vite configuration
├── backend/               # Ruby on Rails 8
│   ├── app/
│   │   ├── controllers/
│   │   ├── models/
│   │   └── views/
│   ├── test/              # Rails tests
│   ├── config/
│   └── db/
├── dev-tools/
└── .github/
```

## Key Patterns

### Frontend State Management
- Local component state with `useState`
- `useEffect` for side effects
- API calls in dedicated service layer (`services/api.ts`)
- Optimistic updates for drag-and-drop operations

### Backend Architecture
- Standard Rails MVC
- Strong parameters with `params.expect`
- JSON API responses
- Solid Queue for background jobs (configured)

### API Integration
- Frontend uses simulated API with localStorage (see `services/api.ts`)
- Backend provides RESTful JSON API
- Network delay simulation (600ms) for realistic UX testing

## Environment Variables

### Frontend
Create `.env.local` in `frontend/`:
```
GEMINI_API_KEY=your-key-here
```

### Backend
Uses standard Rails credentials and environment variables. See `config/database.yml` for PostgreSQL config.

## Common Tasks

### Adding a New Feature

1. **Frontend**: Create component in `frontend/components/`, add types to `types.ts`, add API methods to `services/api.ts`
2. **Backend**: Generate scaffold: `bin/rails generate scaffold ModelName field:type`, then migrate

### Running Full Stack

```bash
# Terminal 1 - Backend
cd backend && bin/rails server

# Terminal 2 - Frontend
cd frontend && npm run dev
```

### Database Operations

```bash
cd backend
bin/rails db:create           # Create database
bin/rails db:migrate          # Run migrations
bin/rails db:rollback         # Rollback last migration
bin/rails db:seed             # Run seed data
bin/rails db:reset            # Drop and recreate
```
