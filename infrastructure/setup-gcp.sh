#!/bin/bash

# GCP Setup Script for jira-task application
# Run this script to enable required APIs and configure workload identity

set -e

PROJECT_ID="gen-lang-client-0725350933"
REGION="us-central1"
SERVICE_ACCOUNT_NAME="github-actions"
POOL_NAME="github-pool"
PROVIDER_NAME="github-provider"
REPO_OWNER="baoren"
REPO_NAME="jira-task"

echo "=== GCP Setup for jira-task ==="
echo "Project ID: $PROJECT_ID"
echo "Region: $REGION"

# Set the project
  gcloud config set project $PROJECT_ID 2>/dev/null || true

# Enable required APIs
echo ""
echo "=== Enabling required APIs ==="
if gcloud services enable \
  run.googleapis.com \
  containerregistry.googleapis.com \
  artifactregistry.googleapis.com \
  iam.googleapis.com \
  iamcredentials.googleapis.com \
  cloudbuild.googleapis.com 2>&1; then
  echo "APIs enabled successfully."
else
  echo "WARNING: Could not enable APIs. This usually means billing is not configured."
  echo ""
  echo "=== MANUAL STEP REQUIRED ==="
  echo "Please enable billing for project $PROJECT_ID:"
  echo "1. Go to: https://console.cloud.google.com/billing/linkedproject/$PROJECT_ID"
  echo "2. Select a billing account and link it to this project"
  echo ""
  echo "After enabling billing, re-run this script or enable APIs manually with:"
  echo "  gcloud services enable run.googleapis.com containerregistry.googleapis.com artifactregistry.googleapis.com iam.googleapis.com iamcredentials.googleapis.com cloudbuild.googleapis.com"
  echo ""
  echo "Continuing with remaining setup..."
fi

# Create Artifact Registry repository
echo ""
echo "=== Creating Artifact Registry repository ==="
gcloud artifacts repositories create jira-task \
  --repository-format=docker \
  --location=$REGION \
  --description="Docker repository for jira-task application" \
  --async 2>&1 || echo "Repository may already exist, continuing..."

# Get project number
PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format="value(projectNumber)" 2>/dev/null || echo "UNKNOWN")
echo "Project Number: $PROJECT_NUMBER"

# Create service account
echo ""
echo "=== Creating service account for GitHub Actions ==="
gcloud iam service-accounts create $SERVICE_ACCOUNT_NAME \
  --display-name="GitHub Actions" \
  --description="Service account for GitHub Actions CI/CD" 2>&1 || echo "Service account may already exist, continuing..."

SERVICE_ACCOUNT_EMAIL="$SERVICE_ACCOUNT_NAME@$PROJECT_ID.iam.gserviceaccount.com"
echo "Service Account: $SERVICE_ACCOUNT_EMAIL"

# Create Workload Identity Pool
echo ""
echo "=== Creating Workload Identity Pool ==="
gcloud iam workload-identity-pools create $POOL_NAME \
  --location="global" \
  --display-name="GitHub Actions Pool" 2>&1 || echo "Pool may already exist, continuing..."

# Get full pool name
POOL_ID=$(gcloud iam workload-identity-pools describe $POOL_NAME --location="global" --format="value(name)" 2>/dev/null || echo "projects/$PROJECT_NUMBER/locations/global/workloadIdentityPools/$POOL_NAME")
echo "Pool ID: $POOL_ID"

# Create Workload Identity Provider
echo ""
echo "=== Creating GitHub Workload Identity Provider ==="
gcloud iam workload-identity-pools providers create-oidc $PROVIDER_NAME \
  --location="global" \
  --workload-identity-pool=$POOL_NAME \
  --issuer-uri="https://token.actions.githubusercontent.com" \
  --attribute-mapping="google.subject=assertion.sub" \
  --attribute-condition="assertion.repository=='${REPO_OWNER}/${REPO_NAME}'" \
  --description="GitHub provider for $REPO_OWNER/$REPO_NAME" 2>&1 || echo "Provider may already exist, continuing..."

# Get full provider name
if [ "$PROJECT_NUMBER" != "UNKNOWN" ]; then
  PROVIDER_FULL_NAME="projects/$PROJECT_NUMBER/locations/global/workloadIdentityPools/$POOL_NAME/providers/$PROVIDER_NAME"
else
  PROVIDER_FULL_NAME="projects/<PROJECT_NUMBER>/locations/global/workloadIdentityPools/$POOL_NAME/providers/$PROVIDER_NAME"
fi
echo "Provider Full Name: $PROVIDER_FULL_NAME"

# Add IAM policy binding for service account
echo ""
echo "=== Configuring IAM permissions ==="
if gcloud iam service-accounts add-iam-policy-binding \
  --role="roles/iam.workloadIdentityUser" \
  --member="principal://iam.googleapis.com/projects/$PROJECT_NUMBER/locations/global/workloadIdentityPools/$POOL_NAME/subject/repo:$REPO_OWNER/$REPO_NAME" \
  $SERVICE_ACCOUNT_EMAIL 2>&1; then
  echo "IAM policy binding added."
else
  echo "IAM policy binding may already exist or requires billing to be enabled first."
fi

# Add Cloud Run permissions to service account
echo ""
echo "=== Adding Cloud Run permissions ==="
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:$SERVICE_ACCOUNT_EMAIL" \
  --role="roles/run.admin" 2>&1 || echo "Role may already be assigned..."

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:$SERVICE_ACCOUNT_EMAIL" \
  --role="roles/artifactregistry.writer" 2>&1 || echo "Role may already be assigned..."

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:$SERVICE_ACCOUNT_EMAIL" \
  --role="roles/storage.admin" 2>&1 || echo "Role may already be assigned..."

echo ""
echo "=== Setup Complete ==="
echo ""
echo "GitHub Secrets to configure:"
echo "----------------------------"
echo "GCP_PROJECT_ID: $PROJECT_ID"
echo "GCP_REGION: $REGION"
echo "GCP_WORKLOAD_IDENTITY_PROVIDER: $PROVIDER_FULL_NAME"
echo "GCP_SERVICE_ACCOUNT: $SERVICE_ACCOUNT_EMAIL"
echo "DOCKER_TOKEN: [Your Docker Hub Access Token]"
echo ""
echo "If you see 'UNKNOWN' for Provider Full Name, run this after billing is enabled:"
echo "  gcloud projects describe $PROJECT_ID --format='value(projectNumber)'"
echo ""
echo "Run the following to verify:"
echo "  gcloud auth login"
echo "  gcloud config get-value project"
