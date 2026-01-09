# 🚀 Deployment Guide - Vision Flow AI

Complete guide for deploying Vision Flow AI to production.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Backend Deployment](#backend-deployment)
3. [Frontend Deployment](#frontend-deployment)
4. [Database Setup](#database-setup)
5. [Environment Configuration](#environment-configuration)
6. [Security Checklist](#security-checklist)
7. [Monitoring](#monitoring)

---

## Prerequisites

- Production server (Ubuntu 20.04+ recommended)
- Domain name with DNS configured
- SSL certificate (Let's Encrypt recommended)
- PostgreSQL database
- Node.js 18+ and Python 3.8+

---

## Backend Deployment

### Option 1: Deploy on Ubuntu Server

#### 1. Install Dependencies

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Python and dependencies
sudo apt install python3.10 python3-pip python3-venv postgresql postgresql-contrib nginx -y

# Install Node.js (for Prisma)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install nodejs -y
```

#### 2. Setup Application

```bash
# Create application directory
sudo mkdir -p /var/www/visionflow
sudo chown $USER:$USER /var/www/visionflow
cd /var/www/visionflow

# Clone repository
git clone <your-repo-url> .

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
pip install gunicorn
```

#### 3. Configure Environment

```bash
# Create production environment file
nano .env
```

Add:
```env
SECRET_KEY=<generate-secure-key>
DEBUG=False
ALLOWED_HOSTS=your-domain.com,www.your-domain.com
DATABASE_URL=postgresql://user:password@localhost:5432/visionflow_prod
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
DEFAULT_FROM_EMAIL=noreply@your-domain.com
CORS_ALLOWED_ORIGINS=https://your-domain.com,https://www.your-domain.com
```

#### 4. Setup Database

```bash
# Install Prisma CLI
npm install -g prisma

# Generate Prisma client
prisma generate

# Push schema to database
prisma db push

# Run Django migrations
python manage.py migrate

# Collect static files
python manage.py collectstatic --noinput
```

#### 5. Create Systemd Service

```bash
sudo nano /etc/systemd/system/visionflow.service
```

Add:
```ini
[Unit]
Description=Vision Flow AI Backend
After=network.target

[Service]
User=www-data
Group=www-data
WorkingDirectory=/var/www/visionflow
Environment="PATH=/var/www/visionflow/venv/bin"
ExecStart=/var/www/visionflow/venv/bin/gunicorn \
    --workers 4 \
    --bind unix:/var/www/visionflow/visionflow.sock \
    visionflow.wsgi:application

[Install]
WantedBy=multi-user.target
```

```bash
# Start service
sudo systemctl start visionflow
sudo systemctl enable visionflow
sudo systemctl status visionflow
```

#### 6. Configure Nginx

```bash
sudo nano /etc/nginx/sites-available/visionflow
```

Add:
```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    location = /favicon.ico { access_log off; log_not_found off; }

    location /static/ {
        alias /var/www/visionflow/staticfiles/;
    }

    location /media/ {
        alias /var/www/visionflow/media/;
    }

    location / {
        include proxy_params;
        proxy_pass http://unix:/var/www/visionflow/visionflow.sock;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/visionflow /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 7. Setup SSL with Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

---

### Option 2: Deploy on Heroku

#### 1. Prepare for Heroku

```bash
# Create Procfile
echo "web: gunicorn visionflow.wsgi" > Procfile

# Create runtime.txt
echo "python-3.10.12" > runtime.txt

# Update requirements.txt
pip freeze > requirements.txt
```

#### 2. Deploy

```bash
# Login to Heroku
heroku login

# Create app
heroku create visionflow-api

# Add PostgreSQL addon
heroku addons:create heroku-postgresql:mini

# Set environment variables
heroku config:set SECRET_KEY=<your-secret-key>
heroku config:set DEBUG=False
heroku config:set ALLOWED_HOSTS=visionflow-api.herokuapp.com

# Deploy
git push heroku main

# Run migrations
heroku run python manage.py migrate
heroku run prisma generate
heroku run prisma db push
```

---

## Frontend Deployment

### Option 1: Deploy on Vercel (Recommended)

#### 1. Prepare Project

```bash
cd frontend

# Create vercel.json
cat > vercel.json << EOF
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://your-api-domain.com/api/:path*"
    }
  ]
}
EOF
```

#### 2. Deploy

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Set environment variables in Vercel dashboard:
# NEXT_PUBLIC_API_URL=https://your-api-domain.com/api
```

---

### Option 2: Deploy on Ubuntu Server (with Nginx)

#### 1. Build Frontend

```bash
cd frontend
npm install
npm run build
```

#### 2. Copy to Server

```bash
# On local machine
scp -r .next package.json package-lock.json user@server:/var/www/visionflow-frontend/
```

#### 3. Setup PM2

```bash
# On server
cd /var/www/visionflow-frontend
npm install
npm install -g pm2

# Start app
pm2 start npm --name "visionflow-frontend" -- start
pm2 save
pm2 startup
```

#### 4. Configure Nginx

```bash
sudo nano /etc/nginx/sites-available/visionflow-frontend
```

Add:
```nginx
server {
    listen 80;
    server_name your-frontend-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/visionflow-frontend /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Setup SSL
sudo certbot --nginx -d your-frontend-domain.com
```

---

## Database Setup

### PostgreSQL Production Configuration

```bash
# Connect to PostgreSQL
sudo -u postgres psql

# Create database and user
CREATE DATABASE visionflow_prod;
CREATE USER visionflow WITH PASSWORD 'your-secure-password';
ALTER ROLE visionflow SET client_encoding TO 'utf8';
ALTER ROLE visionflow SET default_transaction_isolation TO 'read committed';
ALTER ROLE visionflow SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE visionflow_prod TO visionflow;
\q
```

---

## Environment Configuration

### Backend (.env)

```env
# Django Settings
SECRET_KEY=<generate-with-python-get-random-secret-key>
DEBUG=False
ALLOWED_HOSTS=your-api-domain.com,www.your-api-domain.com

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/visionflow_prod

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
DEFAULT_FROM_EMAIL=noreply@your-domain.com

# CORS
CORS_ALLOWED_ORIGINS=https://your-frontend-domain.com

# Security
SECURE_SSL_REDIRECT=True
SESSION_COOKIE_SECURE=True
CSRF_COOKIE_SECURE=True
```

### Frontend (.env.production)

```env
NEXT_PUBLIC_API_URL=https://your-api-domain.com/api
```

---

## Security Checklist

- [ ] Change SECRET_KEY to a strong random value
- [ ] Set DEBUG=False in production
- [ ] Configure ALLOWED_HOSTS properly
- [ ] Enable HTTPS/SSL
- [ ] Set secure cookie flags
- [ ] Enable CSRF protection
- [ ] Configure CORS properly
- [ ] Use environment variables for secrets
- [ ] Setup database backups
- [ ] Enable firewall (UFW)
- [ ] Keep dependencies updated
- [ ] Use strong database passwords
- [ ] Implement rate limiting
- [ ] Setup monitoring and logging
- [ ] Regular security audits

### Generate Secure Secret Key

```python
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

---

## Monitoring

### Setup Logging

```python
# In settings.py
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'file': {
            'level': 'ERROR',
            'class': 'logging.FileHandler',
            'filename': '/var/log/visionflow/django.log',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['file'],
            'level': 'ERROR',
            'propagate': True,
        },
    },
}
```

### Monitor with PM2 (Frontend)

```bash
pm2 logs visionflow-frontend
pm2 monit
```

### Monitor with Systemd (Backend)

```bash
sudo journalctl -u visionflow -f
```

### Setup Health Checks

Create health check endpoint in Django:

```python
# api/views.py
@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    return Response({"status": "healthy"})
```

---

## Backup Strategy

### Database Backups

```bash
# Create backup script
cat > /var/www/visionflow/backup.sh << EOF
#!/bin/bash
BACKUP_DIR="/var/backups/visionflow"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

# Backup database
pg_dump visionflow_prod > $BACKUP_DIR/db_$DATE.sql

# Backup media files
tar -czf $BACKUP_DIR/media_$DATE.tar.gz /var/www/visionflow/media

# Keep only last 7 days
find $BACKUP_DIR -type f -mtime +7 -delete
EOF

chmod +x /var/www/visionflow/backup.sh

# Add to crontab (daily at 2 AM)
crontab -e
# Add: 0 2 * * * /var/www/visionflow/backup.sh
```

---

## Update/Deployment Process

### Backend Updates

```bash
cd /var/www/visionflow
source venv/bin/activate

# Pull latest code
git pull origin main

# Install new dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate
prisma generate
prisma db push

# Collect static files
python manage.py collectstatic --noinput

# Restart service
sudo systemctl restart visionflow
```

### Frontend Updates

```bash
cd /var/www/visionflow-frontend

# Pull latest code
git pull origin main

# Install dependencies
npm install

# Build
npm run build

# Restart PM2
pm2 restart visionflow-frontend
```

---

## Troubleshooting

### Backend Issues

```bash
# Check service status
sudo systemctl status visionflow

# View logs
sudo journalctl -u visionflow -n 100

# Test Gunicorn directly
cd /var/www/visionflow
source venv/bin/activate
gunicorn visionflow.wsgi:application --bind 0.0.0.0:8000
```

### Frontend Issues

```bash
# Check PM2 logs
pm2 logs visionflow-frontend

# Restart service
pm2 restart visionflow-frontend

# Check build
npm run build
```

### Database Issues

```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Connect to database
psql -h localhost -U visionflow -d visionflow_prod

# Check connections
SELECT * FROM pg_stat_activity;
```

---

## Performance Optimization

### Django Optimization

```python
# In settings.py

# Enable caching
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.redis.RedisCache',
        'LOCATION': 'redis://127.0.0.1:6379/1',
    }
}

# Database connection pooling
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'OPTIONS': {
            'connect_timeout': 10,
            'options': '-c statement_timeout=30000',
        },
    }
}
```

### Next.js Optimization

```javascript
// next.config.js
module.exports = {
  images: {
    domains: ['your-api-domain.com'],
  },
  compress: true,
  poweredByHeader: false,
}
```

---

## Support & Maintenance

- Regularly check logs
- Monitor server resources
- Keep dependencies updated
- Review security advisories
- Perform regular backups
- Test disaster recovery
- Document changes

---

For questions or issues, refer to the main [README.md](README.md) or open an issue on GitHub.
