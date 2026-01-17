# Coolify Deployment Configuration

## Server Details
- **Server IP**: 45.137.194.145
- **Port**: 342891 (random 6-digit port)
- **API Token**: 1|6mQQcB4mB6Op9GChZYo53sdxJUaLUV8f3PeGExYO3ede776a

## Setup Instructions

### 1. Access Coolify Dashboard
Navigate to: `http://45.137.194.145:342891`

### 2. Create New Application
1. Click "New Resource" → "Application"
2. Select "Docker Compose" as deployment type
3. Connect your GitHub repository
4. Set build pack to "nixpacks" or "dockerfile"

### 3. Configure Environment Variables
Add these in Coolify dashboard:

```env
# Database
DATABASE_URL=postgresql://autopartquote:YOUR_PASSWORD@db:5432/autopartquote
POSTGRES_USER=autopartquote
POSTGRES_PASSWORD=YOUR_SECURE_PASSWORD
POSTGRES_DB=autopartquote

# App
NEXT_PUBLIC_APP_URL=http://45.137.194.145:YOUR_APP_PORT
NODE_ENV=production

# OpenRouter AI
OPENROUTER_API_KEY=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
```

### 4. Set Up GitHub Auto-Deploy

#### Option A: Using Coolify's Built-in GitHub Integration
1. In Coolify dashboard, go to your application
2. Click "Source" tab
3. Enable "Automatic Deployment"
4. Select branch: `main` or `master`
5. Coolify will auto-deploy on every push!

#### Option B: Using GitHub Actions
1. Add these secrets to your GitHub repository:
   - `COOLIFY_TOKEN`: 1|6mQQcB4mB6Op9GChZYo53sdxJUaLUV8f3PeGExYO3ede776a
   - `COOLIFY_SERVER`: http://45.137.194.145:342891
   - `COOLIFY_APP_ID`: (Get this from Coolify dashboard)

2. The GitHub Action will trigger on every push to main/master

### 5. Database Migration
After first deployment, run:
```bash
# SSH into Coolify server
ssh root@45.137.194.145

# Find your container
docker ps | grep autopartquote

# Run migrations
docker exec -it <container_id> npx prisma migrate deploy
```

### 6. Access Your Application
Once deployed, your app will be available at:
- **Internal**: `http://45.137.194.145:YOUR_APP_PORT`
- **Custom Domain**: Configure in Coolify dashboard

## Deployment Flow

```
Push to GitHub → GitHub webhook → Coolify detects change
                                        ↓
                                  Pull latest code
                                        ↓
                                  Build Docker image
                                        ↓
                                  Run migrations
                                        ↓
                                  Deploy new container
                                        ↓
                                  Health check
                                        ↓
                                  Switch traffic
```

## Monitoring

### View Logs
```bash
# In Coolify dashboard
Application → Logs → Real-time logs

# Or via CLI
docker logs -f <container_name>
```

### Health Checks
Coolify automatically monitors:
- Container status
- HTTP response (/)
- Resource usage

## Rollback
If deployment fails:
1. Go to Coolify dashboard
2. Click "Deployments" tab
3. Select previous successful deployment
4. Click "Redeploy"

## Custom Domain Setup
1. Point your domain A record to: `45.137.194.145`
2. In Coolify dashboard:
   - Go to "Domains"
   - Add your domain
   - Enable SSL (Let's Encrypt)
3. Coolify handles SSL certificates automatically!

## Troubleshooting

### Build Fails
- Check Coolify build logs
- Verify Dockerfile syntax
- Ensure all dependencies in package.json

### Database Connection Issues
- Verify DATABASE_URL format
- Check if PostgreSQL container is running
- Ensure network connectivity between containers

### Port Already in Use
- Change PORT environment variable
- Update docker-compose.yml
- Redeploy

## Next Steps
1. ✅ Push code to GitHub
2. ✅ Create application in Coolify
3. ✅ Configure environment variables
4. ✅ Enable auto-deploy
5. ✅ Run database migrations
6. ✅ Test deployment
7. ✅ Set up custom domain (optional)
