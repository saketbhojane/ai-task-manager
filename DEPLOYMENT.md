# Deployment Guide

This guide covers deploying the AI Task Manager to Azure using Docker containers.

## Prerequisites

- [Azure CLI](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli) installed
- [Docker](https://docs.docker.com/get-docker/) installed
- Azure subscription
- GitHub repository with this code

## Local Docker Development

### Quick Start

```bash
# Start all services (PostgreSQL, Backend, Frontend)
docker-compose up -d

# Run database migrations
docker-compose exec backend alembic upgrade head

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

### Environment Variables

Copy `.env.production.example` to `.env` and configure:

```bash
cp .env.production.example .env
# Edit .env with your values
```

## Azure Deployment

### Option 1: Automated Setup

Run the infrastructure setup script:

```bash
chmod +x infrastructure/azure-setup.sh
./infrastructure/azure-setup.sh
```

### Option 2: Manual Setup

#### 1. Create Resource Group

```bash
az group create --name taskmanager-rg --location eastus
```

#### 2. Create Azure Container Registry

```bash
az acr create \
    --resource-group taskmanager-rg \
    --name taskmanageracr \
    --sku Basic \
    --admin-enabled true
```

#### 3. Create Azure Database for PostgreSQL

```bash
az postgres flexible-server create \
    --resource-group taskmanager-rg \
    --name taskmanager-db \
    --location eastus \
    --admin-user taskadmin \
    --admin-password <secure-password> \
    --sku-name Standard_B1ms \
    --tier Burstable \
    --version 16

az postgres flexible-server db create \
    --resource-group taskmanager-rg \
    --server-name taskmanager-db \
    --database-name taskmanager
```

#### 4. Create Container Apps Environment

```bash
az containerapp env create \
    --name taskmanager-env \
    --resource-group taskmanager-rg \
    --location eastus
```

#### 5. Build and Push Images

```bash
# Login to ACR
az acr login --name taskmanageracr

# Build and push backend
docker build -t taskmanageracr.azurecr.io/taskmanager-backend:latest ./backend
docker push taskmanageracr.azurecr.io/taskmanager-backend:latest

# Build and push frontend
docker build -t taskmanageracr.azurecr.io/taskmanager-frontend:latest ./frontend
docker push taskmanageracr.azurecr.io/taskmanager-frontend:latest
```

#### 6. Deploy Container Apps

```bash
# Deploy backend
az containerapp create \
    --name taskmanager-backend \
    --resource-group taskmanager-rg \
    --environment taskmanager-env \
    --image taskmanageracr.azurecr.io/taskmanager-backend:latest \
    --target-port 8000 \
    --ingress external \
    --env-vars "DATABASE_URL=<connection-string>" "AI_ENABLED=true"

# Deploy frontend
az containerapp create \
    --name taskmanager-frontend \
    --resource-group taskmanager-rg \
    --environment taskmanager-env \
    --image taskmanageracr.azurecr.io/taskmanager-frontend:latest \
    --target-port 80 \
    --ingress external
```

## GitHub Actions CI/CD

### Required Secrets

Configure these secrets in your GitHub repository (Settings > Secrets and variables > Actions):

| Secret | Description |
|--------|-------------|
| `AZURE_CONTAINER_REGISTRY` | ACR login server (e.g., `taskmanageracr.azurecr.io`) |
| `AZURE_REGISTRY_USERNAME` | ACR admin username |
| `AZURE_REGISTRY_PASSWORD` | ACR admin password |
| `AZURE_RESOURCE_GROUP` | Resource group name |
| `AZURE_CREDENTIALS` | Service principal JSON (see below) |
| `ANTHROPIC_API_KEY` | (Optional) For AI features |

### Create Service Principal for GitHub Actions

```bash
az ad sp create-for-rbac \
    --name "taskmanager-github-actions" \
    --role contributor \
    --scopes /subscriptions/<subscription-id>/resourceGroups/taskmanager-rg \
    --sdk-auth
```

Copy the JSON output to the `AZURE_CREDENTIALS` secret.

### Triggering Deployments

- **Automatic**: Push to `main` branch triggers CI tests and deployment
- **Manual**: Use "Run workflow" button in GitHub Actions

## Production Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `DEBUG` | Set to `false` in production | Yes |
| `CORS_ORIGINS` | Allowed origins JSON array | Yes |
| `ANTHROPIC_API_KEY` | Anthropic API key | For AI |
| `AI_ENABLED` | Enable/disable AI features | No |
| `AI_MODEL` | Claude model to use | No |

### Security Checklist

- [ ] Use strong PostgreSQL password
- [ ] Enable SSL for database connections
- [ ] Configure CORS with specific domains
- [ ] Use Azure Key Vault for secrets
- [ ] Enable container app authentication if needed
- [ ] Set up Azure Monitor for logging

## Monitoring

### View Logs

```bash
# Backend logs
az containerapp logs show \
    --name taskmanager-backend \
    --resource-group taskmanager-rg \
    --follow

# Frontend logs
az containerapp logs show \
    --name taskmanager-frontend \
    --resource-group taskmanager-rg \
    --follow
```

### Health Checks

- Backend: `https://<backend-url>/health`
- Frontend: `https://<frontend-url>/`

## Scaling

```bash
# Scale backend
az containerapp update \
    --name taskmanager-backend \
    --resource-group taskmanager-rg \
    --min-replicas 2 \
    --max-replicas 10

# Scale frontend
az containerapp update \
    --name taskmanager-frontend \
    --resource-group taskmanager-rg \
    --min-replicas 2 \
    --max-replicas 10
```

## Troubleshooting

### Database Connection Issues

1. Check PostgreSQL firewall rules
2. Verify connection string format
3. Ensure SSL mode is set (`?sslmode=require`)

### Container Startup Failures

1. Check container logs
2. Verify environment variables
3. Test image locally first

### CI/CD Pipeline Failures

1. Check GitHub Actions logs
2. Verify all secrets are configured
3. Ensure service principal has correct permissions
