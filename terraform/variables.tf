variable "groq_api_key" {
  type      = string
  sensitive = true
}

variable "jwt_secret" {
  type      = string
  sensitive = true
}

variable "my_ip" {
  description = "Your public IP address (without /32)"
  type        = string
}

variable "project" {
  description = "Project tag applied to all resources"
  type        = string
  default     = "interview-coach"
}

variable "resend_api_key" {
  description = "API key for Resend"
  type        = string
  sensitive   = true
}

variable "key_pair_name" {
  description = "Name of the AWS EC2 key pair"
  type        = string
}