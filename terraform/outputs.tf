output "alb_dns" {
  description = "Paste as next-public-api-url in Jenkins credentials"
  value       = "http://${aws_lb.app.dns_name}"
}

output "frontend_url" {
  description = "S3 static website — share this URL"
  value       = "http://${aws_s3_bucket_website_configuration.frontend.website_endpoint}"
}

output "s3_bucket_name" {
  description = "Paste as frontend-s3-bucket in Jenkins credentials"
  value       = aws_s3_bucket.frontend.bucket
}

output "ecr_backend_url" {
  description = "ECR repo URL for backend image"
  value       = aws_ecr_repository.backend.repository_url
}

output "jenkins_url" {
  description = "Open after ~3 minutes for Jenkins first-time setup"
  value       = "http://${aws_instance.jenkins.public_ip}:8080"
}

output "jenkins_ssh" {
  description = "SSH in to get the initial admin password"
  value       = "ssh -i ~/.ssh/${var.key_pair_name}.pem ec2-user@${aws_instance.jenkins.public_ip}"
}