pipeline {
  agent any

  environment {
    AWS_REGION     = "us-east-1"
    AWS_ACCOUNT_ID = credentials('aws-account-id')
  }

  stages {

    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Set Image Tag') {
      steps {
        script {
          def shortSha        = env.GIT_COMMIT[0..6]
          env.IMAGE_TAG       = "${env.BUILD_NUMBER}-${shortSha}"
          env.ECR_BASE        = "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
          env.ECR_BACKEND     = "${env.ECR_BASE}/interview-coach-backend"
          echo "Image tag: ${env.IMAGE_TAG}"
        }
      }
    }

    stage('Build Backend Image') {
      steps {
        sh """
          docker build --platform linux/amd64 \
            -t ${env.ECR_BACKEND}:${env.IMAGE_TAG} \
            -t ${env.ECR_BACKEND}:latest \
            ./backend
        """
      }
    }

    stage('Push to ECR') {
      steps {
        sh """
          aws ecr get-login-password --region ${AWS_REGION} \
            | docker login --username AWS --password-stdin ${env.ECR_BASE}

          docker push ${env.ECR_BACKEND}:${env.IMAGE_TAG}
          docker push ${env.ECR_BACKEND}:latest
        """
      }
    }

    stage('Deploy to ECS') {
      steps {
        sh """
          aws ecs update-service \
            --cluster interview-cluster \
            --service backend-service \
            --force-new-deployment \
            --region ${AWS_REGION}

          aws ecs wait services-stable \
            --cluster interview-cluster \
            --service backend-service \
            --region ${AWS_REGION}
        """
      }
    }

  }

  post {
    success {
      echo "✅ Backend deployed — tag: ${env.IMAGE_TAG}"
    }
    failure {
      echo "❌ Pipeline failed. Check the logs above."
    }
    always {
      sh "docker image prune -f"
    }
  }
}