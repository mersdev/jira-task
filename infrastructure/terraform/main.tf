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

resource "google_secret_manager_secret" "database_url" {
  project    = var.project_id
  secret_id  = "${var.app_name}-database-url"
  replication {
    auto {}
  }
}

resource "google_secret_manager_secret_version" "database_url_version" {
  secret      = google_secret_manager_secret.database_url.id
  secret_data = var.database_url
}

resource "google_secret_manager_secret" "rails_master_key" {
  project    = var.project_id
  secret_id  = "${var.app_name}-rails-master-key"
  replication {
    auto {}
  }
}

resource "google_secret_manager_secret_version" "rails_master_key_version" {
  secret      = google_secret_manager_secret.rails_master_key.id
  secret_data = var.rails_master_key
}

resource "google_secret_manager_secret" "secret_key_base" {
  project    = var.project_id
  secret_id  = "${var.app_name}-secret-key-base"
  replication {
    auto {}
  }
}

resource "google_secret_manager_secret_version" "secret_key_base_version" {
  secret      = google_secret_manager_secret.secret_key_base.id
  secret_data = var.secret_key_base
}

resource "google_cloud_run_v2_service" "backend" {
  name     = "${var.app_name}-backend"
  location = var.region

  template {
    containers {
      image = var.backend_image
      ports {
        container_port = 3000
      }
      resources {
        cpu_idle = false
        limits = {
          cpu    = var.free_tier_cpu
          memory = var.free_tier_memory
        }
      }
      env {
        name  = "RAILS_ENV"
        value = "production"
      }
      env {
        name = "DATABASE_URL"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.database_url.name
            version = "latest"
          }
        }
      }
      env {
        name = "RAILS_MASTER_KEY"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.rails_master_key.name
            version = "latest"
          }
        }
      }
      env {
        name = "SECRET_KEY_BASE"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.secret_key_base.name
            version = "latest"
          }
        }
      }
    }
    scaling {
      max_instance_count = 1
      min_instance_count = 0
    }
  }

  traffic {
    percent = 100
  }

  ingress = "INGRESS_TRAFFIC_ALL"
}

resource "google_cloud_run_v2_service" "frontend" {
  name     = "${var.app_name}-frontend"
  location = var.region

  template {
    containers {
      image = var.frontend_image
      ports {
        container_port = 8080
      }
      resources {
        cpu_idle = false
        limits = {
          cpu    = var.free_tier_cpu
          memory = var.free_tier_memory
        }
      }
    }
    scaling {
      max_instance_count = 1
      min_instance_count = 0
    }
  }

  traffic {
    percent = 100
  }

  ingress = "INGRESS_TRAFFIC_ALL"
}

data "google_iam_policy" "noauth" {
  binding {
    role = "roles/run.invoker"
    members = ["allUsers"]
  }
}

resource "google_cloud_run_v2_service_iam_policy" "backend_noauth" {
  location    = google_cloud_run_v2_service.backend.location
  project     = google_cloud_run_v2_service.backend.project
  name        = google_cloud_run_v2_service.backend.name
  policy_data = data.google_iam_policy.noauth.policy_data
}

resource "google_cloud_run_v2_service_iam_policy" "frontend_noauth" {
  location    = google_cloud_run_v2_service.frontend.location
  project     = google_cloud_run_v2_service.frontend.project
  name        = google_cloud_run_v2_service.frontend.name
  policy_data = data.google_iam_policy.noauth.policy_data
}

output "frontend_url" {
  value = google_cloud_run_v2_service.frontend.uri
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
