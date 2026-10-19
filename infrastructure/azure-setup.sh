#!/bin/bash

# Azure Infrastructure Setup Script
# This script creates the necessary Azure resources for the Task Manager application

set -e

# Configuration - Update these values
RESOURCE_GROUP="taskmanager-rg"
LOCATION="eastus"
ACR_NAME="taskmanageracr"  # Must be globally unique
POSTGRES_SERVER="taskmanager-db"
POSTGRES_ADMIN="taskmanageradmin"
CONTAINER_ENV="taskmanager-env"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Azure Task Manager Infrastructure Setup ===${NC}"

# Check if logged in to Azure
if ! az account show &> /dev/null; then
    echo -e "${YELLOW}Please login to Azure...${NC}"
    az login
fi

# Create Resource Group
echo -e "\n${GREEN}Creating Resource Group...${NC}"
az group create \
    --name $RESOURCE_GROUP \
    --location $LOCATION

# Create Azure Container Registry
echo -e "\n${GREEN}Creating Azure Container Registry...${NC}"
az acr create \
    --resource-group $RESOURCE_GROUP \
    --name $ACR_NAME \
    --sku Basic \
    --admin-enabled true

# Get ACR credentials
ACR_USERNAME=$(az acr credential show --name $ACR_NAME --query "username" -o tsv)
ACR_PASSWORD=$(az acr credential show --name $ACR_NAME --query "passwords[0].value" -o tsv)
ACR_LOGIN_SERVER=$(az acr show --name $ACR_NAME --query "loginServer" -o tsv)

echo -e "${YELLOW}ACR Login Server: $ACR_LOGIN_SERVER${NC}"

# Create Azure Database for PostgreSQL
echo -e "\n${GREEN}Creating Azure Database for PostgreSQL...${NC}"
echo -e "${YELLOW}Enter a secure password for PostgreSQL admin:${NC}"
read -s POSTGRES_PASSWORD

az postgres flexible-server create \
    --resource-group $RESOURCE_GROUP \
    --name $POSTGRES_SERVER \
    --location $LOCATION \
    --admin-user $POSTGRES_ADMIN \
    --admin-password "$POSTGRES_PASSWORD" \
    --sku-name Standard_B1ms \
    --tier Burstable \
    --storage-size 32 \
    --version 16 \
    --yes

# Create database
echo -e "\n${GREEN}Creating database...${NC}"
az postgres flexible-server db create \
    --resource-group $RESOURCE_GROUP \
    --server-name $POSTGRES_SERVER \
    --database-name taskmanager

# Allow Azure services to access PostgreSQL
echo -e "\n${GREEN}Configuring PostgreSQL firewall...${NC}"
az postgres flexible-server firewall-rule create \
    --resource-group $RESOURCE_GROUP \
    --name $POSTGRES_SERVER \
    --rule-name AllowAzureServices \
    --start-ip-address 0.0.0.0 \
    --end-ip-address 0.0.0.0

# Create Container Apps Environment
echo -e "\n${GREEN}Creating Container Apps Environment...${NC}"
az containerapp env create \
    --name $CONTAINER_ENV \
    --resource-group $RESOURCE_GROUP \
    --location $LOCATION

# Get PostgreSQL connection string
POSTGRES_HOST="${POSTGRES_SERVER}.postgres.database.azure.com"
DATABASE_URL="postgresql+psycopg://${POSTGRES_ADMIN}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:5432/taskmanager?sslmode=require"

# Create Backend Container App
echo -e "\n${GREEN}Creating Backend Container App...${NC}"
az containerapp create \
    --name taskmanager-backend \
    --resource-group $RESOURCE_GROUP \
    --environment $CONTAINER_ENV \
    --image mcr.microsoft.com/azuredocs/containerapps-helloworld:latest \
    --target-port 8000 \
    --ingress external \
    --registry-server $ACR_LOGIN_SERVER \
    --registry-username $ACR_USERNAME \
    --registry-password $ACR_PASSWORD \
    --env-vars \
        "DATABASE_URL=$DATABASE_URL" \
        "DEBUG=false" \
        "AI_ENABLED=true" \
    --min-replicas 1 \
    --max-replicas 3

# Get Backend URL
BACKEND_URL=$(az containerapp show \
    --name taskmanager-backend \
    --resource-group $RESOURCE_GROUP \
    --query "properties.configuration.ingress.fqdn" -o tsv)

# Create Frontend Container App
echo -e "\n${GREEN}Creating Frontend Container App...${NC}"
az containerapp create \
    --name taskmanager-frontend \
    --resource-group $RESOURCE_GROUP \
    --environment $CONTAINER_ENV \
    --image mcr.microsoft.com/azuredocs/containerapps-helloworld:latest \
    --target-port 80 \
    --ingress external \
    --registry-server $ACR_LOGIN_SERVER \
    --registry-username $ACR_USERNAME \
    --registry-password $ACR_PASSWORD \
    --min-replicas 1 \
    --max-replicas 3

# Get Frontend URL
FRONTEND_URL=$(az containerapp show \
    --name taskmanager-frontend \
    --resource-group $RESOURCE_GROUP \
    --query "properties.configuration.ingress.fqdn" -o tsv)

# Print summary
echo -e "\n${GREEN}=== Setup Complete ===${NC}"
echo -e "\n${YELLOW}Important Information:${NC}"
echo "Resource Group: $RESOURCE_GROUP"
echo "ACR Login Server: $ACR_LOGIN_SERVER"
echo "ACR Username: $ACR_USERNAME"
echo "PostgreSQL Host: $POSTGRES_HOST"
echo "Backend URL: https://$BACKEND_URL"
echo "Frontend URL: https://$FRONTEND_URL"

echo -e "\n${YELLOW}GitHub Secrets to configure:${NC}"
echo "AZURE_CONTAINER_REGISTRY: $ACR_LOGIN_SERVER"
echo "AZURE_REGISTRY_USERNAME: $ACR_USERNAME"
echo "AZURE_REGISTRY_PASSWORD: (see Azure Portal)"
echo "AZURE_RESOURCE_GROUP: $RESOURCE_GROUP"
echo "AZURE_CREDENTIALS: (run 'az ad sp create-for-rbac --name taskmanager-gh-actions --role contributor --scopes /subscriptions/{subscription-id}/resourceGroups/$RESOURCE_GROUP --sdk-auth')"

echo -e "\n${GREEN}Next steps:${NC}"
echo "1. Add the GitHub secrets listed above"
echo "2. Add ANTHROPIC_API_KEY secret if using AI features"
echo "3. Push to main branch to trigger deployment"
echo "4. Update CORS_ORIGINS with your frontend URL"
