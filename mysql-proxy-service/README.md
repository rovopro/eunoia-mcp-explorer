# MySQL Proxy Service

A Node.js REST API proxy for Azure MySQL with SSL support.

## Features

- ✅ SSL/TLS connection to Azure MySQL
- ✅ REST API endpoints for queries
- ✅ Security: Only allows SELECT, SHOW, DESCRIBE queries
- ✅ Connection pooling
- ✅ Health check endpoint
- ✅ Schema inspection endpoints

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```bash
cp .env.example .env
# Edit .env with your MySQL credentials
```

3. Start the service:
```bash
# Development
npm run dev

# Production
npm start
```

## API Endpoints

### Health Check
```
GET /health
```

### Execute Query
```
POST /query
Content-Type: application/json

{
  "sql": "SELECT * FROM products LIMIT 10"
}
```

### Get Database Schema
```
GET /schema
```
Returns all tables with their columns and metadata.

### List Tables
```
GET /tables
```
Returns all tables with row counts and timestamps.

## Deployment Options

### Option 1: Azure App Service
```bash
# Install Azure CLI
az login
az webapp create --resource-group <group> --plan <plan> --name <app-name> --runtime "NODE|18-lts"
az webapp config appsettings set --resource-group <group> --name <app-name> --settings @env-vars.json
az webapp deployment source config-zip --resource-group <group> --name <app-name> --src deploy.zip
```

### Option 2: Docker
```bash
docker build -t mysql-proxy .
docker run -p 3001:3001 --env-file .env mysql-proxy
```

### Option 3: Heroku
```bash
heroku create mysql-proxy-service
heroku config:set MYSQL_HOST=... MYSQL_PORT=3306 MYSQL_DATABASE=epos MYSQL_USER=... MYSQL_PASSWORD=...
git push heroku main
```

### Option 4: Railway/Render/Fly.io
Upload this folder to any Node.js hosting platform and set environment variables.

## Security Notes

- Only SELECT, SHOW, and DESCRIBE queries are allowed
- Implement authentication/API keys for production
- Consider rate limiting
- Use HTTPS in production
- Restrict CORS origins in production

## Environment Variables

- `PORT` - Server port (default: 3001)
- `MYSQL_HOST` - MySQL server hostname
- `MYSQL_PORT` - MySQL port (default: 3306)
- `MYSQL_DATABASE` - Database name
- `MYSQL_USER` - Database user
- `MYSQL_PASSWORD` - Database password
- `NODE_ENV` - Environment (development/production)
