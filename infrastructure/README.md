# Infrastructure Setup

This directory contains Terraform configuration for deploying the application to Google Cloud Run.

## Prerequisites

1. Google Cloud CLI (`gcloud`) installed and authenticated
2. Terraform >= 1.0 installed
3. A Google Cloud project with Cloud Run and Container Registry enabled

## Secrets Management

### GitHub Actions Secrets

Copy `.env.example` from the project root and add values to GitHub:

```bash
# Project root
cp .env.example .env
# Fill in your values, then add to GitHub:
# Settings > Secrets and variables > Actions
```

Required GitHub secrets:
| Secret | Description |
|--------|-------------|
| `GCP_PROJECT_ID` | `gen-lang-client-0725350933` |
| `GCP_REGION` | `us-central1` |
| `GCP_WORKLOAD_IDENTITY_PROVIDER` | `projects/1081842732564/locations/global/workloadIdentityPools/github-pool/providers/github-provider` |
| `GCP_SERVICE_ACCOUNT` | `github-actions@gen-lang-client-0725350933.iam.gserviceaccount.com` |
| `DOCKER_TOKEN` | Docker Hub access token |
| `DATABASE_URL` | PostgreSQL connection URL |
| `RAILS_MASTER_KEY` | Rails master key |
| `SECRET_KEY_BASE` | Rails secret key base |

### Terraform Variables (Local)

Copy `.env.example` from this directory for local Terraform:

```bash
cd infrastructure
cp .env.example .env
# Fill in your values
source .env
cd terraform
terraform init
terraform plan
```

## Quick Setup

Run the automated setup script to enable APIs and configure workload identity:

```bash
cd infrastructure
./setup-gcp.sh
```

## Manual Setup Instructions

### 1. Configure GCP Project

```bash
gcloud config set project gen-lang-client-0725350933
gcloud services enable run.googleapis.com containerregistry.googleapis.com artifactregistry.googleapis.com iam.googleapis.com iamcredentials.googleapis.com cloudbuild.googleapis.com
```

### 2. Create Artifact Registry Repository

```bash
gcloud artifacts repositories create jira-task \
  --repository-format=docker \
  --location=us-central1 \
  --description="Docker repository for jira-task application"
```

### 3. Configure Workload Identity Federation

For GitHub Actions authentication:

```bash
# Create service account
gcloud iam service-accounts create github-actions \
  --display-name="GitHub Actions"

# Create workload identity pool
gcloud iam workload-identity-pools create github-pool \
  --location="global" \
  --display-name="GitHub Pool"

# Get project number
PROJECT_NUMBER=$(gcloud projects describe gen-lang-client-0725350933 --format="value(projectNumber)")

# Get pool name
POOL_NAME=$(gcloud iam workload-identity-pools describe github-pool --location="global" --format="value(name)")

# Create workload identity provider
gcloud iam workload-identity-pools providers create-oidc github-provider \
  --location="global" \
  --workload-identity-pool="github-pool" \
  --issuer-uri="https://token.actions.githubusercontent.com" \
  --attribute-mapping="google.subject=assertion.sub" \
  --attribute-condition="assertion.repository=='baoren/jira-task'"

# Add IAM policy binding
gcloud iam service-accounts add-iam-policy-binding \
  --role="roles/iam.workloadIdentityUser" \
  --member="principal://iam.googleapis.com/projects/$PROJECT_NUMBER/locations/global/workloadIdentityPools/github-pool/subject/repo:baoren/jira-task" \
  github-actions@gen-lang-client-0725350933.iam.gserviceaccount.com

# Add additional permissions
gcloud projects add-iam-policy-binding gen-lang-client-0725350933 \
  --member="serviceAccount:github-actions@gen-lang-client-0725350933.iam.gserviceaccount.com" \
  --role="roles/run.admin"

gcloud projects add-iam-policy-binding gen-lang-client-0725350933 \
  --member="serviceAccount:github-actions@gen-lang-client-0725350933.iam.gserviceaccount.com" \
  --role="roles/artifactregistry.writer"
```

### 4. Initialize Terraform

```bash
cd infrastructure/terraform
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with your values
terraform init
terraform plan
terraform apply
```

## Deployment

### Automatic Deployment

Push to the `main` branch will automatically:
1. Build and push Docker images
2. Deploy to CloudRun
3. Run Terraform to update infrastructure

### Manual Deployment

Trigger the GitHub Actions workflows manually from the Actions tab.

## Free Tier Considerations

This configuration is optimized for CloudRun's free tier:

- CPU: 1 vCPU
- Memory: 512 MiB
- Instances: 0-1 (scales to zero when not in use)
- Requests: First 2 million requests per month are free

## Directory Structure

```
infrastructure/
├── terraform/
│   ├── main.tf              # CloudRun service definitions
│   ├── variables.tf         # Input variables
│   └── terraform.tfvars.example  # Example configuration
├── .env.example             # Terraform variables template
├── setup-gcp.sh             # Automated GCP setup script
└── README.md               # This file
```

## Outputs

After Terraform apply, you will get:

- `backend_url`: URL of the backend API service
- `frontend_url`: URL of the frontend web application
