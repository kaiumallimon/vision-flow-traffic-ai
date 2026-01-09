# 🐳 Docker Setup Guide - Vision Flow Traffic AI

This guide provides step-by-step instructions for running the Vision Flow Traffic AI project using Docker on both **Linux** and **Windows** systems.

---

## 📋 Prerequisites

### For Both Windows and Linux:
- **Docker** (version 20.10+)
- **Docker Compose** (version 1.29+)
- A `.env` file with necessary environment variables (see [Environment Variables](#-environment-variables) section)

### System Requirements:
- **RAM**: Minimum 2GB, recommended 4GB+
- **Disk Space**: Minimum 2GB for images and containers
- **Internet**: Required for downloading Docker images and npm/Python packages

---

## 🐧 Linux Setup

### Step 1: Install Docker and Docker Compose

#### For Ubuntu/Debian:
```bash
# Update package lists
sudo apt update

# Install Docker
sudo apt install -y docker.io

# Install Docker Compose
sudo apt install -y docker-compose

# Start Docker service
sudo systemctl start docker

# Enable Docker to start on boot
sudo systemctl enable docker

# Add your user to docker group (optional, avoid using sudo)
sudo usermod -aG docker $USER

# Log out and log back in for group changes to take effect
```

#### For Fedora/RHEL/CentOS:
```bash
# Install Docker
sudo dnf install -y docker

# Install Docker Compose
sudo dnf install -y docker-compose

# Start Docker service
sudo systemctl start docker

# Enable Docker to start on boot
sudo systemctl enable docker

# Add your user to docker group (optional)
sudo usermod -aG docker $USER
```

### Step 2: Prepare the Project

```bash
# Navigate to project directory
cd /path/to/Vision-Flow-Traffic-AI

# Create .env file with required variables (see Environment Variables section)
nano .env
```

### Step 3: Build and Run Containers

```bash
# Build the Docker images
docker-compose build

# Run the containers in detached mode
docker-compose up -d

# View running containers
docker-compose ps

# View logs from all containers
docker-compose logs -f

# View logs from specific service (backend or frontend)
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Step 4: Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

### Step 5: Manage Containers

```bash
# Stop all containers
docker-compose down

# Remove containers and images
docker-compose down --volumes --rmi all

# Restart containers
docker-compose restart

# Restart specific service
docker-compose restart backend
docker-compose restart frontend

# View container logs
docker-compose logs backend
```

---

## 🪟 Windows Setup

### Step 1: Install Docker Desktop

1. **Download Docker Desktop**:
   - Go to [Docker Desktop for Windows](https://www.docker.com/products/docker-desktop)
   - Download the installer for your Windows version (Home or Pro)

2. **Install Docker Desktop**:
   - Run the downloaded installer
   - Follow the installation wizard
   - Choose whether to use WSL 2 (recommended) or Hyper-V backend
   - Restart your computer when prompted

3. **Verify Installation**:
   - Open PowerShell or Command Prompt
   - Run the following commands:
   ```powershell
   docker --version
   docker-compose --version
   ```

### Step 2: Enable Required Features (if using WSL 2)

1. Open PowerShell as Administrator and run:
   ```powershell
   wsl --install
   wsl --set-default-version 2
   ```

2. Download and install WSL 2 Linux kernel from:
   [WSL2 Kernel Update](https://aka.ms/wsl2kernel)

3. Restart your computer

### Step 3: Prepare the Project

1. **Open PowerShell or Command Prompt**

2. **Navigate to Project Directory**:
   ```powershell
   cd C:\path\to\Vision-Flow-Traffic-AI
   ```

3. **Create `.env` file**:
   - Option A: Using PowerShell
     ```powershell
     New-Item -ItemType File -Name ".env" -Force
     notepad .env
     ```
   - Option B: Using any text editor
     - Open Notepad and create a file named `.env` in the project root
     - Add required environment variables (see [Environment Variables](#-environment-variables) section)

### Step 4: Build and Run Containers

1. **Open PowerShell/Command Prompt** in the project directory

2. **Build the Docker images**:
   ```powershell
   docker-compose build
   ```

3. **Run the containers**:
   ```powershell
   docker-compose up -d
   ```

4. **Verify containers are running**:
   ```powershell
   docker-compose ps
   ```

5. **View logs**:
   ```powershell
   docker-compose logs -f

   # Or for specific service
   docker-compose logs -f backend
   docker-compose logs -f frontend
   ```

### Step 5: Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

### Step 6: Manage Containers

```powershell
# Stop all containers
docker-compose down

# Remove containers and volumes
docker-compose down --volumes

# Restart containers
docker-compose restart

# Restart specific service
docker-compose restart backend
docker-compose restart frontend

# View logs
docker-compose logs backend
```

---

## 🔧 Environment Variables

Create a `.env` file in the project root directory with the following variables:

```env
# Database
DATABASE_URL="file:./db.sqlite3"

# JWT Configuration
SECRET_KEY="your-secret-key-here-change-in-production"
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Email Configuration (Optional)
SMTP_SERVER="smtp.gmail.com"
SMTP_PORT=587
SENDER_EMAIL="your-email@gmail.com"
SENDER_PASSWORD="your-app-password"

# API Configuration
FRONTEND_URL="http://localhost:3000"
API_URL="http://localhost:8000"

# YOLO Model Path
YOLO_MODEL_PATH="/app/yolo11n_openvino_model/yolo11n.xml"
```

**Note**: For Gmail SMTP, use an [App Password](https://support.google.com/accounts/answer/185833) instead of your regular password.

---

## 📊 Service Details

### Backend Service
- **Framework**: FastAPI
- **Port**: 8000
- **Database**: SQLite with Prisma ORM
- **Key Features**:
  - JWT Authentication
  - YOLO11n Object Detection
  - GradCAM Visualization
  - Email Notifications
  - Analytics API

### Frontend Service
- **Framework**: Next.js 14
- **Port**: 3000
- **UI Library**: shadcn/ui + Tailwind CSS
- **Key Features**:
  - Interactive Dashboard
  - Image Upload with Preview
  - Detection History
  - Real-time Statistics

---

## 🐛 Troubleshooting

### Common Issues and Solutions

#### Issue: Docker daemon is not running
- **Linux**: Run `sudo systemctl start docker`
- **Windows**: Start Docker Desktop from Applications menu

#### Issue: Port 3000 or 8000 already in use
```bash
# Find process using the port (Linux)
sudo lsof -i :3000
sudo lsof -i :8000

# Kill the process
sudo kill -9 <PID>

# Or change ports in docker-compose.yml
```

```powershell
# Find process using the port (Windows)
netstat -ano | findstr :3000
netstat -ano | findstr :8000

# Kill the process
taskkill /PID <PID> /F

# Or change ports in docker-compose.yml
```

#### Issue: Container exits immediately
```bash
# Check logs for error messages
docker-compose logs backend
docker-compose logs frontend

# Rebuild with no cache
docker-compose build --no-cache
```

#### Issue: Permission denied on Linux
```bash
# Add user to docker group
sudo usermod -aG docker $USER

# Apply new group membership
newgrp docker

# Or use sudo (not recommended)
sudo docker-compose up
```

#### Issue: Out of disk space
```bash
# Clean up unused Docker resources
docker system prune -a --volumes

# Check disk space
# Linux: df -h
# Windows: Check C: drive properties
```

#### Issue: Cannot connect to backend from frontend
- Verify `NEXT_PUBLIC_API_URL` in `docker-compose.yml` is set to `http://backend:8000/api`
- Check if backend container is running: `docker-compose ps`
- View backend logs: `docker-compose logs backend`

---

## 📱 Development Workflow

### Hot Reload During Development

The containers support hot reloading for code changes:

```bash
# Frontend changes auto-reload (Next.js dev server)
# Backend changes may require container restart
docker-compose restart backend
```

### Running Commands in Containers

```bash
# Execute command in backend container
docker-compose exec backend bash

# Execute command in frontend container
docker-compose exec frontend bash

# Run specific command
docker-compose exec backend python -m pip list
docker-compose exec frontend npm list
```

### Database Migrations

```bash
# Generate Prisma client
docker-compose exec backend prisma generate

# Push schema to database
docker-compose exec backend prisma db push

# View database
docker-compose exec backend prisma studio
```

---

## 🔐 Production Considerations

### Before Deploying to Production:

1. **Change Secret Key**:
   ```env
   SECRET_KEY="generate-a-strong-random-key"
   ```
   Generate with: `python -c "import secrets; print(secrets.token_urlsafe(32))"`

2. **Update Frontend URL**:
   ```env
   FRONTEND_URL="https://your-production-domain.com"
   ```

3. **Configure Email Properly**:
   - Use proper SMTP credentials
   - Enable SMTP in firewall rules

4. **Use Production Database**:
   - Consider using PostgreSQL instead of SQLite
   - Update `DATABASE_URL` accordingly

5. **Set Proper Resource Limits**:
   ```yaml
   # In docker-compose.yml
   backend:
     deploy:
       resources:
         limits:
           cpus: '1'
           memory: 1G
   ```

6. **Use HTTPS**:
   - Configure reverse proxy (Nginx)
   - Use SSL certificates (Let's Encrypt)

---

## 📚 Useful Docker Commands

```bash
# View all running containers
docker-compose ps

# View detailed logs
docker-compose logs -f --tail=100

# Pause/resume containers
docker-compose pause
docker-compose unpause

# Execute command in running container
docker-compose exec backend bash

# Copy files to/from container
docker cp container_name:/path/to/file ./local/path
docker cp ./local/file container_name:/path/to/file

# Remove all unused containers and images
docker system prune -a

# View disk usage
docker system df
```

---

## 📖 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Next.js Documentation](https://nextjs.org/docs)

---

## ✅ Verification Checklist

After running the containers, verify:

- [ ] Backend container is running: `docker-compose ps`
- [ ] Frontend is accessible at http://localhost:3000
- [ ] Backend API is accessible at http://localhost:8000
- [ ] API docs visible at http://localhost:8000/docs
- [ ] No error messages in logs: `docker-compose logs`
- [ ] Database file created: `db.sqlite3` exists
- [ ] Media upload directory accessible: `media/uploads/`

---

**Last Updated**: January 2026
**Docker Version**: 20.10+
**Docker Compose Version**: 1.29+
