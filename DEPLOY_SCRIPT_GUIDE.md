# Universal Coolify Deployment Script

## Quick Start

### 1. Setup (One-time per project)

```bash
# Copy the deployment script to your project
cp scripts/deploy-coolify.sh ./deploy-coolify.sh
chmod +x deploy-coolify.sh

# Create .env.coolify with your credentials
cp .env.coolify.example .env.coolify
```

### 2. Configure .env.coolify

```env
COOLIFY_SERVER=http://45.137.194.145:342891
COOLIFY_TOKEN=1|6mQQcB4mB6Op9GChZYo53sdxJUaLUV8f3PeGExYO3ede776a
CLOUDFLARE_API_TOKEN=your_token_here
CLOUDFLARE_ZONE_ID=your_zone_id_here
BASE_DOMAIN=yourdomain.com
```

### 3. Deploy!

```bash
./deploy-coolify.sh
```

That's it! Just like Vercel! 🚀

---

## What It Does

The script automatically:

1. ✅ **Generates random subdomain** (e.g., `abc12xyz.yourdomain.com`)
2. ✅ **Finds available port** (checks existing Coolify apps, assigns random 5-digit port)
3. ✅ **Creates Cloudflare DNS record** (A record pointing to your server)
4. ✅ **Creates Coolify application** (with auto-deploy enabled)
5. ✅ **Deploys your app** (builds Docker image, runs migrations, goes live)
6. ✅ **Saves deployment info** (creates `.coolify-deployment.json`)

---

## Getting Cloudflare Credentials

### API Token

1. Go to: https://dash.cloudflare.com/profile/api-tokens
2. Click **"Create Token"**
3. Use template: **"Edit zone DNS"**
4. Select your domain zone
5. Copy the token

### Zone ID

1. Go to: https://dash.cloudflare.com
2. Select your domain
3. Scroll down to **"API"** section on the right
4. Copy **"Zone ID"**

---

## Example Output

```bash
╔═══════════════════════════════════════════╗
║   Universal Coolify Deployment Script    ║
╚═══════════════════════════════════════════╝

Project: autopartquote
Subdomain: x7k9m2p4.yourdomain.com

Finding available port...
✓ Port assigned: 34521

Creating DNS record...
✓ DNS record created successfully

Creating Coolify application...
✓ Application created: app-uuid-here

Deploying application...
✓ Deployment started

╔═══════════════════════════════════════════╗
║          Deployment Successful!           ║
╚═══════════════════════════════════════════╝

Application URL: https://x7k9m2p4.yourdomain.com
Coolify Dashboard: http://45.137.194.145:342891/applications/app-uuid-here
Port: 34521

Note: DNS propagation may take a few minutes
Deployment info saved to: .coolify-deployment.json
```

---

## Deployment Info File

After deployment, `.coolify-deployment.json` is created:

```json
{
  "app_id": "app-uuid-here",
  "subdomain": "x7k9m2p4",
  "full_domain": "x7k9m2p4.yourdomain.com",
  "port": 34521,
  "deployed_at": "2026-01-16T16:30:00Z"
}
```

---

## Auto-Deploy on Git Push

The script enables auto-deploy by default. After initial deployment:

```bash
git add .
git commit -m "update"
git push
```

Coolify automatically:
1. Detects the push
2. Pulls latest code
3. Rebuilds Docker image
4. Deploys new version
5. Zero-downtime switch

---

## Reusable Across Projects

### Copy to New Project

```bash
# In your new project
cp /path/to/autopartquote/scripts/deploy-coolify.sh .
cp /path/to/autopartquote/.env.coolify.example .env.coolify

# Update .env.coolify with your credentials
# Deploy!
./deploy-coolify.sh
```

### Global Installation (Optional)

```bash
# Make it available system-wide
sudo cp deploy-coolify.sh /usr/local/bin/coolify-deploy
sudo chmod +x /usr/local/bin/coolify-deploy

# Use from any project
cd my-new-project
coolify-deploy
```

---

## Advanced Usage

### Custom Subdomain

```bash
# Edit the script or set environment variable
SUBDOMAIN=myapp ./deploy-coolify.sh
```

### Specific Port

```bash
# Set port manually
PORT=8080 ./deploy-coolify.sh
```

### Different Branch

```bash
# Deploy from different branch
GIT_BRANCH=develop ./deploy-coolify.sh
```

---

## Troubleshooting

### DNS Not Resolving

**Wait**: DNS propagation takes 1-5 minutes
**Check**: `dig x7k9m2p4.yourdomain.com`
**Verify**: Cloudflare dashboard shows A record

### Port Already in Use

**Script handles this**: Automatically finds available port
**Manual check**: See Coolify dashboard → Applications → Ports

### Deployment Fails

**Check logs**: Coolify dashboard → Application → Deployments → View logs
**Common issues**:
- Missing Dockerfile
- Build errors
- Environment variables not set

### Cloudflare API Error

**Verify token**: Has "Edit zone DNS" permission
**Check zone ID**: Matches your domain
**Test API**: `curl -X GET "https://api.cloudflare.com/client/v4/zones/YOUR_ZONE_ID" -H "Authorization: Bearer YOUR_TOKEN"`

---

## Security Notes

1. **Never commit `.env.coolify`** - Already in `.gitignore`
2. **Use API tokens, not API keys** - More secure, scoped permissions
3. **Rotate tokens regularly** - Good security practice
4. **Limit token permissions** - Only "Edit zone DNS" needed

---

## Comparison with Vercel

| Feature | Vercel | This Script |
|---------|--------|-------------|
| One command deploy | ✅ `vercel` | ✅ `./deploy-coolify.sh` |
| Auto subdomain | ✅ Yes | ✅ Yes (random) |
| Auto SSL | ✅ Yes | ✅ Yes (Cloudflare) |
| Auto deploy on push | ✅ Yes | ✅ Yes |
| Custom domain | ✅ Yes | ✅ Yes |
| Zero config | ✅ Yes | ⚠️ One-time setup |
| Self-hosted | ❌ No | ✅ Yes |
| Free tier | ✅ Yes | ✅ Yes (your server) |

---

## Next Steps

1. **Get Cloudflare credentials** (API token + Zone ID)
2. **Update `.env.coolify`** with your values
3. **Run the script**: `./deploy-coolify.sh`
4. **Share with team**: Everyone can deploy with one command!

---

## Support

- **Coolify Docs**: https://coolify.io/docs
- **Cloudflare API**: https://developers.cloudflare.com/api/
- **Script Issues**: Check logs, verify credentials

---

**Ready to deploy? Just run `./deploy-coolify.sh`!** 🚀
