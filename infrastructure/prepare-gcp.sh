#!/usr/bin/env bash

# prepare-gcp.sh
# Idempotent setup to prepare GCP for GitHub Actions Terraform deploys
# - Sets project and region
# - Ensures APIs are enabled (including Secret Manager)
# - Creates/reuses Workload Identity Pool & Provider for GitHub OIDC
# - Grants required roles to the GitHub OIDC principalSet
# - Ensures GitHub Actions service account exists and has needed roles
# - Optionally updates the GitHub secret for the provider if gh is available

set -euo pipefail

PROJECT_ID="gen-lang-client-0725350933"
REGION="us-central1"
SERVICE_ACCOUNT_NAME="github-actions"
POOL_NAME="github"
PROVIDER_NAME="github-provider"
REPO="mersdev/jira-task"

log() { echo "[prepare-gcp] $*"; }

log "Project: ${PROJECT_ID} | Region: ${REGION}"

gcloud config set project "${PROJECT_ID}" >/dev/null

# Enable required APIs (idempotent)
log "Enabling APIs (run, iam, iamcredentials, secretmanager, artifactregistry, containerregistry, cloudbuild)..."
gcloud services enable \
  run.googleapis.com \
  iam.googleapis.com \
  iamcredentials.googleapis.com \
  secretmanager.googleapis.com \
  artifactregistry.googleapis.com \
  containerregistry.googleapis.com \
  cloudbuild.googleapis.com >/dev/null

PROJECT_NUMBER=$(gcloud projects describe "${PROJECT_ID}" --format="value(projectNumber)")
log "Project number: ${PROJECT_NUMBER}"

SERVICE_ACCOUNT_EMAIL="${SERVICE_ACCOUNT_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"

# Ensure service account exists
log "Ensuring service account ${SERVICE_ACCOUNT_EMAIL} exists..."
gcloud iam service-accounts describe "${SERVICE_ACCOUNT_EMAIL}" >/dev/null 2>&1 || \
  gcloud iam service-accounts create "${SERVICE_ACCOUNT_NAME}" \
    --display-name="GitHub Actions"

# Ensure workload identity pool
log "Ensuring workload identity pool ${POOL_NAME} exists..."
gcloud iam workload-identity-pools describe "${POOL_NAME}" --location=global >/dev/null 2>&1 || \
  gcloud iam workload-identity-pools create "${POOL_NAME}" \
    --location=global \
    --display-name="GitHub"

# Ensure provider
log "Ensuring provider ${PROVIDER_NAME} exists..."
gcloud iam workload-identity-pools providers describe "${PROVIDER_NAME}" \
  --location=global \
  --workload-identity-pool="${POOL_NAME}" >/dev/null 2>&1 || \
  gcloud iam workload-identity-pools providers create-oidc "${PROVIDER_NAME}" \
    --location=global \
    --workload-identity-pool="${POOL_NAME}" \
    --issuer-uri="https://token.actions.githubusercontent.com" \
    --attribute-mapping="google.subject=assertion.sub,attribute.repository=assertion.repository" \
    --attribute-condition="attribute.repository == '${REPO}'"

WORKLOAD_IDENTITY_PROVIDER=$(gcloud iam workload-identity-pools providers describe "${PROVIDER_NAME}" \
  --location=global \
  --workload-identity-pool="${POOL_NAME}" \
  --format="value(name)")
log "Provider: ${WORKLOAD_IDENTITY_PROVIDER}"

# Grant roles to the GitHub OIDC principalSet
PRINCIPAL="principalSet://iam.googleapis.com/projects/${PROJECT_NUMBER}/locations/global/workloadIdentityPools/${POOL_NAME}/*"
log "Granting roles to ${PRINCIPAL}..."
gcloud projects add-iam-policy-binding "${PROJECT_ID}" \
  --member="${PRINCIPAL}" \
  --role="roles/iam.workloadIdentityPoolAdmin" >/dev/null || true
gcloud projects add-iam-policy-binding "${PROJECT_ID}" \
  --member="${PRINCIPAL}" \
  --role="roles/iam.serviceAccountAdmin" >/dev/null || true
gcloud projects add-iam-policy-binding "${PROJECT_ID}" \
  --member="${PRINCIPAL}" \
  --role="roles/iam.serviceAccountUser" >/dev/null || true
gcloud projects add-iam-policy-binding "${PROJECT_ID}" \
  --member="${PRINCIPAL}" \
  --role="roles/run.admin" >/dev/null || true
gcloud projects add-iam-policy-binding "${PROJECT_ID}" \
  --member="${PRINCIPAL}" \
  --role="roles/secretmanager.admin" >/dev/null || true

# Bind the GitHub repo subject to the service account for WIF use
log "Adding workloadIdentityUser binding to ${SERVICE_ACCOUNT_EMAIL} for repo ${REPO}..."
gcloud iam service-accounts add-iam-policy-binding "${SERVICE_ACCOUNT_EMAIL}" \
  --role="roles/iam.workloadIdentityUser" \
  --member="principal://iam.googleapis.com/projects/${PROJECT_NUMBER}/locations/global/workloadIdentityPools/${POOL_NAME}/subject/repo:${REPO}" >/dev/null || true

# Service account roles used by actions
log "Granting service account roles (run.admin, artifactregistry.writer, storage.admin)..."
gcloud projects add-iam-policy-binding "${PROJECT_ID}" \
  --member="serviceAccount:${SERVICE_ACCOUNT_EMAIL}" \
  --role="roles/run.admin" >/dev/null || true
gcloud projects add-iam-policy-binding "${PROJECT_ID}" \
  --member="serviceAccount:${SERVICE_ACCOUNT_EMAIL}" \
  --role="roles/artifactregistry.writer" >/dev/null || true
gcloud projects add-iam-policy-binding "${PROJECT_ID}" \
  --member="serviceAccount:${SERVICE_ACCOUNT_EMAIL}" \
  --role="roles/storage.admin" >/dev/null || true

# Optionally set GitHub secret if gh is available
if command -v gh >/dev/null 2>&1; then
  log "Updating GitHub secret GCP_WORKLOAD_IDENTITY_PROVIDER..."
  gh secret set GCP_WORKLOAD_IDENTITY_PROVIDER --body="${WORKLOAD_IDENTITY_PROVIDER}" || log "Warning: unable to set GitHub secret"
else
  log "gh CLI not found; set the GitHub secret manually: ${WORKLOAD_IDENTITY_PROVIDER}"
fi

log "All steps complete. Terraform workflow can be triggered via:"
log "  gh workflow run terraform.yml -f action=apply"
