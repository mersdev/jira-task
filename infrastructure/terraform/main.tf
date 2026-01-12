terraform {
  required_version = ">= 1.0"

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 6.0"
    }
    google-beta = {
      source  = "hashicorp/google-beta"
      version = "~> 6.0"
    }
  }

  backend "local" {
    path = "terraform.tfstate"
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

provider "google-beta" {
  project = var.project_id
  region  = var.region
}

data "google_secret_manager_secret" "database_url" {
  project   = var.project_id
  secret_id = "${var.app_name}-database-url"
}

data "google_secret_manager_secret" "rails_master_key" {
  project   = var.project_id
  secret_id = "${var.app_name}-rails-master-key"
}

data "google_secret_manager_secret" "secret_key_base" {
  project   = var.project_id
  secret_id = "${var.app_name}-secret-key-base"
}

data "google_cloud_run_v2_service" "backend" {
  name     = "${var.app_name}-backend"
  location = var.region
}

data "google_cloud_run_v2_service" "frontend" {
  name     = "${var.app_name}-frontend"
  location = var.region
}

data "google_iam_policy" "noauth" {
  binding {
    role = "roles/run.invoker"
    members = ["allUsers"]
  }
}

resource "google_cloud_run_v2_service_iam_policy" "backend_noauth" {
  location    = data.google_cloud_run_v2_service.backend.location
  project     = data.google_cloud_run_v2_service.backend.project
  name        = data.google_cloud_run_v2_service.backend.name
  policy_data = data.google_iam_policy.noauth.policy_data
}

resource "google_cloud_run_v2_service_iam_policy" "frontend_noauth" {
  location    = data.google_cloud_run_v2_service.frontend.location
  project     = data.google_cloud_run_v2_service.frontend.project
  name        = data.google_cloud_run_v2_service.frontend.name
  policy_data = data.google_iam_policy.noauth.policy_data
}

output "frontend_url" {
  value = data.google_cloud_run_v2_service.frontend.uri
}

data "google_iam_workload_identity_pool" "github" {
  workload_identity_pool_id = "github"
}

data "google_iam_workload_identity_pool_provider" "github" {
  workload_identity_pool_id          = data.google_iam_workload_identity_pool.github.workload_identity_pool_id
  workload_identity_pool_provider_id = "github-provider"
}

data "google_service_account" "github_actions" {
  account_id = "github-actions"
}

resource "google_service_account_iam_member" "github_actions_workload_identity" {
  service_account_id = data.google_service_account.github_actions.name
  role               = "roles/iam.workloadIdentityUser"
  member             = "principalSet://iam.googleapis.com/${data.google_iam_workload_identity_pool.github.name}/*"
}

output "workload_identity_provider" {
  value       = data.google_iam_workload_identity_pool_provider.github.name
  description = "Workload Identity Provider ID for GitHub Actions"
}

output "service_account_email" {
  value       = data.google_service_account.github_actions.email
  description = "Service Account email for GitHub Actions"
}
