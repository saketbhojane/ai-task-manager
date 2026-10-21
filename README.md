# AI Task Manager

A modern task management application with AI-powered features, similar to a simplified Jira or Trello.

## About This App

AI Task Manager is a full-stack application that helps teams organize and track their work. It features a Kanban-style board with drag-and-drop functionality, user assignments, and AI-powered task prioritization.

### Features

- **Kanban Board**: Visual task management with three columns (To Do, In Progress, Done)
- **Drag & Drop**: Move tasks between columns by dragging
- **Task Management**: Create, edit, and delete tasks with title, description, status, and priority
- **User Assignment**: Add team members and assign tasks to them
- **AI Priority Suggestions**: Get AI-powered priority recommendations based on task descriptions
- **AI Task Summaries**: Generate summaries of all tasks using AI
- **Responsive Design**: Works on desktop and mobile devices

### Tech Stack

- **Frontend**: React, TypeScript, Vite, TailwindCSS, React Query
- **Backend**: Python, FastAPI, SQLAlchemy, Pydantic
- **Database**: PostgreSQL
- **AI**: Anthropic Claude API
- **Infrastructure**: Docker, Docker Compose

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and Docker Compose
- [Node.js](https://nodejs.org/) v18+ (for local frontend development)
- [Python](https://www.python.org/) 3.11+ (for local backend development)
- [Anthropic API Key](https://console.anthropic.com/) (optional, for AI features)

## Quick Start with Docker

The easiest way to run the application is with Docker Compose:

```bash
# Clone the repository
git clone https://github.com/saketbhojane/ai-task-manager.git
cd ai-task-manager

# Start all services (PostgreSQL, Backend, Frontend)
docker-compose up -d

# Run database migrations
docker-compose exec backend alembic upgrade head

# Open the app
open http://localhost:5173
```

To stop the application:

```bash
docker-compose down
```

## Local Development Setup

### 1. Start the Database

```bash
# Start only PostgreSQL
docker-compose up -d db
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
.\venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run database migrations
alembic upgrade head

# Start the backend server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The backend API will be available at http://localhost:8000

- API Documentation: http://localhost:8000/docs
- Health Check: http://localhost:8000/health

### 3. Frontend Setup

```bash
# Navigate to frontend directory (in a new terminal)
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will be available at http://localhost:5173

## Environment Variables

### Backend

Create a `.env` file in the `backend/` directory:

```env
# Database
DATABASE_URL=postgresql+psycopg://postgres:postgres@localhost:5432/taskmanager

# CORS (comma-separated list of allowed origins)
CORS_ORIGINS=["http://localhost:5173","http://localhost:3000"]

# AI Features (optional)
AI_ENABLED=true
ANTHROPIC_API_KEY=your-api-key-here
AI_MODEL=claude-sonnet-4-20250514
```

### Frontend

The frontend uses the backend URL from `src/services/api.ts`. For local development, it defaults to `http://localhost:8000`.

## Usage Guide

### Creating Tasks

1. Click the **"New Task"** button in the header
2. Fill in the task title and optional description
3. Select status, priority, and assignee
4. Click **"Create Task"**

### Moving Tasks

- **Drag and drop** tasks between columns to change their status
- Or click **"Edit"** on a task and change the status dropdown

### Adding Team Members

1. Click the **"Add Assignee"** button in the header
2. Enter the team member's name and email
3. Click **"Add Assignee"**
4. The new member will appear in the assignee dropdown when creating/editing tasks

### AI Features

**Note**: AI features require an Anthropic API key configured in the backend.

- **AI Priority Suggestion**: When creating a task, enable "Suggest priority with AI" to get an AI-recommended priority based on the task description
- **AI Summary**: Click the **"AI Summary"** button to generate an overview of all tasks

## API Endpoints

### Health
- `GET /health` - Health check

### Users
- `GET /api/users` - List all users
- `POST /api/users` - Create a user
- `GET /api/users/{id}` - Get a user

### Tasks
- `GET /api/tasks` - List all tasks (supports filters: status, priority, assignee_id)
- `POST /api/tasks` - Create a task
- `GET /api/tasks/{id}` - Get a task
- `PUT /api/tasks/{id}` - Update a task
- `DELETE /api/tasks/{id}` - Delete a task

### AI
- `GET /api/ai/status` - Check AI availability
- `POST /api/ai/suggest-priority` - Get AI priority suggestion
- `POST /api/ai/summarize` - Generate task summary

## Project Structure

```
ai-task-manager/
├── backend/
│   ├── app/
│   │   ├── main.py           # FastAPI application
│   │   ├── config.py         # Configuration
│   │   ├── database.py       # Database connection
│   │   ├── models/           # SQLAlchemy models
│   │   ├── schemas/          # Pydantic schemas
│   │   ├── routers/          # API endpoints
│   │   └── services/         # Business logic
│   ├── alembic/              # Database migrations
│   ├── tests/                # Backend tests
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── pages/            # Page components
│   │   ├── hooks/            # Custom React hooks
│   │   ├── services/         # API client
│   │   └── types/            # TypeScript types
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml
└── README.md
```

## Running Tests

### Backend Tests

```bash
cd backend
source venv/bin/activate
pytest
```

### Frontend Build

```bash
cd frontend
npm run build
```

## Troubleshooting

### Database Connection Issues

1. Ensure PostgreSQL is running: `docker-compose ps`
2. Check the DATABASE_URL environment variable
3. Verify the database exists: `docker-compose exec db psql -U postgres -l`

### Migration Errors

If you encounter migration errors, try resetting the database:

```bash
docker-compose down -v
docker-compose up -d db
cd backend && alembic upgrade head
```

### Frontend Can't Connect to Backend

1. Ensure the backend is running on port 8000
2. Check CORS settings in backend configuration
3. Verify the API URL in frontend services

## License

MIT
