# Azure Deployment Setup Guide — Vision Flow

## Architecture

| Component | Service | Cost |
|---|---|---|
| FastAPI + YOLO backend | Azure Container Apps | ~$0–5/mo (scale-to-zero) |
| Next.js frontend | Vercel (unchanged) | Free |
| PostgreSQL database | Neon (unchanged) | Free |
| Media storage | Cloudinary (unchanged) | Free |

---

## Step 1 — Activate your Azure Student credit

1. Go to https://azure.microsoft.com/en-us/free/students/
2. Sign in with your **university email** linked to GitHub Student Dev Pack
3. Activate the **$100 credit** (no credit card required)

---

## Step 2 — Install Azure CLI

```bash
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash
az login
```

---

## Step 3 — Create Azure resources

Run these commands once. Replace `<your-suffix>` with something unique (e.g. your name).

```bash
# Variables — change these
SUFFIX="visionflow"          # must be globally unique for ACR
LOCATION="eastus"            # pick closest region
RG="visionflow-rg"
ACR="visionflow${SUFFIX}acr" # only lowercase letters and numbers
CAE="visionflow-env"
CA="visionflow-backend"

# 1. Resource group
az group create --name $RG --location $LOCATION

# 2. Azure Container Registry (Basic tier — cheapest)
az acr create --resource-group $RG --name $ACR --sku Basic --admin-enabled true

# Get ACR credentials (you'll need these for GitHub Secrets)
az acr credential show --name $ACR

# 3. Container Apps environment
az containerapp env create \
  --name $CAE \
  --resource-group $RG \
  --location $LOCATION

# 4. Create the Container App (first deploy with a placeholder image)
az containerapp create \
  --name $CA \
  --resource-group $RG \
  --environment $CAE \
  --image mcr.microsoft.com/azuredocs/containerapps-helloworld:latest \
  --cpu 1.0 --memory 2.0Gi \
  --min-replicas 0 --max-replicas 2 \
  --ingress external --target-port 8000

# 5. Create a service principal for GitHub Actions
az ad sp create-for-rbac \
  --name "visionflow-github-actions" \
  --role contributor \
  --scopes /subscriptions/$(az account show --query id -o tsv)/resourceGroups/$RG \
  --sdk-auth
# ↑ Copy the entire JSON output — this is your AZURE_CREDENTIALS secret
```

---

## Step 4 — Add GitHub Secrets

Go to your repo → **Settings → Secrets and variables → Actions → New repository secret**

| Secret name | Where to find the value |
|---|---|
| `AZURE_CREDENTIALS` | JSON output from `az ad sp create-for-rbac` above |
| `REGISTRY_LOGIN_SERVER` | `az acr show --name $ACR --query loginServer -o tsv` |
| `REGISTRY_USERNAME` | `az acr credential show --name $ACR --query username -o tsv` |
| `REGISTRY_PASSWORD` | `az acr credential show --name $ACR --query passwords[0].value -o tsv` |
| `AZURE_RESOURCE_GROUP` | `visionflow-rg` |
| `AZURE_CONTAINERAPP_NAME` | `visionflow-backend` |
| `DATABASE_URL` | Your Neon connection string |
| `SECRET_KEY` | Any strong random string |
| `FRONTEND_URL` | Your Vercel app URL (`https://yourapp.vercel.app`) |
| `OPENROUTER_API_KEY` | From openrouter.ai |
| `CLOUDINARY_CLOUD_NAME` | From Cloudinary dashboard |
| `CLOUDINARY_API_KEY` | From Cloudinary dashboard |
| `CLOUDINARY_API_SECRET` | From Cloudinary dashboard |
| `EMAIL_HOST_USER` | Your Gmail address |
| `EMAIL_HOST_PASSWORD` | Gmail App Password |
| `DEFAULT_FROM_EMAIL` | e.g. `noreply@visionflow.ai` |

---

## Step 5 — Add Container App secrets (for sensitive env vars)

Azure Container Apps has its own secret store separate from env vars:

```bash
az containerapp secret set \
  --name $CA \
  --resource-group $RG \
  --secrets \
    database-url="YOUR_NEON_CONNECTION_STRING" \
    secret-key="YOUR_SECRET_KEY" \
    openrouter-api-key="YOUR_OPENROUTER_KEY" \
    cloudinary-cloud-name="YOUR_CLOUD_NAME" \
    cloudinary-api-key="YOUR_CLOUDINARY_KEY" \
    cloudinary-api-secret="YOUR_CLOUDINARY_SECRET" \
    email-host-user="YOUR_GMAIL" \
    email-host-password="YOUR_GMAIL_APP_PASSWORD" \
    default-from-email="noreply@visionflow.ai"
```

---

## Step 6 — Deploy

Push to `main` — GitHub Actions will:
1. Build the Docker image
2. Push it to your Azure Container Registry
3. Deploy the new image to Container Apps

```bash
git add .
git commit -m "chore: add Azure deployment config"
git push origin main
```

Monitor in: **GitHub → Actions tab**

---

## Step 7 — Get your backend URL

```bash
az containerapp show \
  --name $CA \
  --resource-group $RG \
  --query properties.configuration.ingress.fqdn \
  --output tsv
# Output: visionflow-backend.something.eastus.azurecontainerapps.io
```

Update your Vercel frontend env var:
```
NEXT_PUBLIC_API_URL=https://visionflow-backend.something.eastus.azurecontainerapps.io/api
```

---

## Cost estimate (Student credit)

| Resource | SKU | ~Monthly cost |
|---|---|---|
| Container Apps | Consumption (scale-to-zero) | $0–3 |
| Container Registry | Basic | $5 |
| **Total** | | **~$5–8/mo** |

Your $100 student credit covers **12–20 months** of hosting.

---

## Troubleshooting

**Container fails to start:**
```bash
az containerapp logs show --name $CA --resource-group $RG --follow
```

**OOM (Out of Memory):**
- Increase memory: `az containerapp update --name $CA --resource-group $RG --memory 4.0Gi`
- Ensure `WEB_CONCURRENCY=1` is set (single uvicorn worker)

**CORS errors from frontend:**
- Make sure `FRONTEND_URL` secret is set to your exact Vercel URL (no trailing slash)
