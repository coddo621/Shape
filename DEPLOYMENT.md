# Deployment Guide

This guide explains how to safely deploy Shape to production with proper secret management.

## Security: Never Commit Secrets to Version Control

- `config/.env.local` is gitignored — keep it locally only
- `config/.env.example` is a template — commit this with placeholder values
- In production, use your platform's secret management

## Quick Start with Docker

```bash
# 1. Generate a secret key
SECRET=$(python3 -c "import secrets; print(secrets.token_hex(32))")

# 2. Create local .env file
cp config/.env.example config/.env.local
echo "FLASK_SECRET_KEY=$SECRET" >> config/.env.local

# 3. Start the application
docker compose up
```

The app will be available at `http://localhost`

## Development Setup (without Docker)

```bash
# Generate a secret key
python3 -c "import secrets; print(secrets.token_hex(32))"

# Create .env.local in config/
FLASK_SECRET_KEY=your_generated_key_here
DATABASE_URL=sqlite:///instance/users.db
FLASK_ENV=development
```

## Production Deployment

### Option 1: Docker Compose on VPS

```bash
# Build and deploy
docker compose -f docker-compose.yml up -d

# Set environment variables
docker compose -e FLASK_SECRET_KEY=your_key up -d
```

### Option 2: Heroku

```bash
# Set secrets via Heroku CLI
heroku config:set FLASK_SECRET_KEY=$(python3 -c "import secrets; print(secrets.token_hex(32))")
heroku config:set FLASK_ENV=production
heroku config:set CORS_ORIGINS=https://yourdomain.com

# Deploy
git push heroku main
```

Or use Heroku Dashboard → App → Settings → Config Vars

### Option 3: AWS (Elastic Beanstalk or Lambda)

```bash
# Using AWS Secrets Manager
aws secretsmanager create-secret \
  --name shape/flask_secret_key \
  --secret-string $(python3 -c "import secrets; print(secrets.token_hex(32))")

# In your app, fetch from Secrets Manager
import boto3
client = boto3.client('secretsmanager')
secret = client.get_secret_value(SecretId='shape/flask_secret_key')
```

Or set via EB environment properties:
```bash
eb setenv FLASK_SECRET_KEY=your_key FLASK_ENV=production
```

### Option 4: Google Cloud (Cloud Run or App Engine)

```bash
# Using Secret Manager
gcloud secrets create flask-secret-key \
  --replication-policy="automatic" \
  --data-file=- <<< $(python3 -c "import secrets; print(secrets.token_hex(32))")

# Deploy with secrets
gcloud run deploy shape \
  --set-env-vars="FLASK_SECRET_KEY=$(gcloud secrets versions access latest --secret='flask-secret-key')"
```

### Option 5: GitHub Actions (for automated deployment)

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy
        env:
          FLASK_SECRET_KEY: ${{ secrets.FLASK_SECRET_KEY }}
          FLASK_ENV: production
          CORS_ORIGINS: ${{ secrets.CORS_ORIGINS }}
        run: |
          # Your deployment command here
          echo "Deploying with secrets from GitHub"
```

In GitHub repo settings → Secrets and variables → Actions → New repository secret

### Option 6: Render

```yaml
# render.yaml
services:
  - type: web
    name: shape
    env: python
    plan: free
    envVars:
      - key: FLASK_ENV
        value: production
      - key: FLASK_SECRET_KEY
        fromSecret: FLASK_SECRET_KEY
      - key: CORS_ORIGINS
        fromSecret: CORS_ORIGINS
```

Set secrets in Render dashboard → Environment

## Environment Variables Reference

| Variable | Development | Production |
|----------|-------------|-----------|
| `FLASK_SECRET_KEY` | In `config/.env.local` | **Platform secrets** |
| `FLASK_ENV` | `development` | `production` |
| `DATABASE_URL` | `sqlite:///` | Use managed DB (PostgreSQL, MySQL) |
| `CORS_ORIGINS` | `http://localhost:5173` | Your domain URL |
| `FLASK_DEBUG` | `True` | `False` |
| `SESSION_COOKIE_SECURE` | `False` | `True` (HTTPS only) |

## Security Checklist

- [ ] Never commit .env or .env.local files
- [ ] `config/.env.example` has only placeholder values
- [ ] `FLASK_SECRET_KEY` generated with `secrets.token_hex(32)`
- [ ] All secrets set via platform, not in code
- [ ] Production: `FLASK_ENV=production`
- [ ] Production: `SESSION_COOKIE_SECURE=True` (requires HTTPS)
- [ ] Database URL points to managed service (not SQLite)
- [ ] CORS_ORIGINS set to your domain only
- [ ] Regular secret rotation (if applicable)

## For Advanced Users

### Using HashiCorp Vault
```python
import hvac

client = hvac.Client(url='https://vault.example.com', token='your-token')
secret = client.secrets.kv.read_secret_version(path='shape/config')
flask_secret = secret['data']['data']['FLASK_SECRET_KEY']
```

### Using 1Password Connect
```python
from onepassword import client as op

secret = op.get_secret("op://Production/Flask Secret Key/password")
```

### Using AWS Systems Manager Parameter Store
```python
import boto3

ssm = boto3.client('ssm')
param = ssm.get_parameter(Name='/shape/flask_secret_key', WithDecryption=True)
flask_secret = param['Parameter']['Value']
```

## Troubleshooting

**Error: "FLASK_SECRET_KEY not set in production"**
- Ensure your platform has set the environment variable
- Check your deployment logs for the variable
- For cloud platforms, verify it's set before deploying

**Secrets not loading in Docker**
- Verify `-e` flags are passed to `docker run` or docker-compose
- Check `docker inspect` to see environment variables
- Use `docker secrets` for Swarm or Kubernetes for better security

**Session expires between requests in production**
- Ensure `SESSION_COOKIE_SECURE=True` only on HTTPS
- Check database connectivity for session store
- Verify session timeout settings match your needs

**Port already in use**
```bash
# Change port in docker-compose.yml or run:
docker compose -p my_app up
```

**Database permission issues**
```bash
# Ensure instance/ directory has correct permissions
mkdir -p backend/instance
chmod 755 backend/instance
```
