variable "project_id" {
  description = "GCP project ID"
  type        = string
}

variable "region" {
  description = "GCP region for deployment"
  type        = string
  default     = "us-central1"
}

variable "app_name" {
  description = "Application name for resource naming"
  type        = string
  default     = "jira-task"
}

variable "backend_image" {
  description = "Docker image URL for backend service"
  type        = string
}

variable "frontend_image" {
  description = "Docker image URL for frontend service"
  type        = string
}

variable "database_url" {
  description = "PostgreSQL database connection URL"
  type        = string
  sensitive   = true
}

variable "rails_master_key" {
  description = "Rails master key for credential decryption"
  type        = string
  sensitive   = true
}

variable "secret_key_base" {
  description = "Rails secret key base"
  type        = string
  sensitive   = true
}

variable "free_tier_cpu" {
  description = "CPU allocation for free tier compliance"
  type        = string
  default     = "1"
}

variable "free_tier_memory" {
  description = "Memory allocation for free tier compliance"
  type        = string
  default     = "512Mi"
}
