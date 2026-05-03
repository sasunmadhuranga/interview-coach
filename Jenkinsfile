pipeline {
  agent any

  environment {
    AWS_REGION     = "us-east-1"
    AWS_ACCOUNT_ID = credentials('aws-account-id')
    S3_BUCKET      = credentials('frontend-s3-bucket')
  }

  stages {

    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Set Image Tag') {
      // Run AFTER checkout so GIT_COMMIT is available
      steps {
        script {
          def shortSha   = env.GIT_COMMIT[0..6]
          env.IMAGE_TAG  = "${env.BUILD_NUMBER}-${shortSha}"
          env.ECR_BASE   = "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
          env.ECR_BACKEND = "${env.ECR_BASE}/interview-coach-backend"
          echo "Image tag: ${env.IMAGE_TAG}"
        }
      }
    }

    stage('Build Backend Image') {
      steps {
        sh """
          docker build \
            -t ${env.ECR_BACKEND}:${env.IMAGE_TAG} \
            -t ${env.ECR_BACKEND}:latest \
            ./backend
        """
      }
    }

    stage('Build Frontend Static') {
      steps {
        dir('frontend') {
          withCredentials([
            string(credentialsId: 'next-public-api-url',          variable: 'API_URL'),
            string(credentialsId: 'next-public-google-client-id',  variable: 'GOOGLE_ID')
          ]) {
            sh """
              npm ci
              NEXT_PUBLIC_API_BASE_URL=\$API_URL \
              NEXT_PUBLIC_GOOGLE_CLIENT_ID=\$GOOGLE_ID \
              npx next build
            """
          }
        }
      }
    }

    // ── All AWS operations share one credentials block ──────────────────────
    stage('Push & Deploy') {
      steps {
        withCredentials([[
          $class:            'AmazonWebServicesCredentialsBinding',
          credentialsId:     'aws-credentials',
          accessKeyVariable: 'AWS_ACCESS_KEY_ID',
          secretKeyVariable: 'AWS_SECRET_ACCESS_KEY'
        ]]) {

          // 1. Login to ECR once — reused by both push commands
          sh """
            aws ecr get-login-password --region ${AWS_REGION} \
              | docker login --username AWS --password-stdin ${env.ECR_BASE}
          """

          // 2. Push backend image
          sh """
            docker push ${env.ECR_BACKEND}:${env.IMAGE_TAG}
            docker push ${env.ECR_BACKEND}:latest
          """

          // 3. Deploy frontend to S3
          sh """
            aws s3 sync frontend/out s3://${S3_BUCKET} \
              --delete \
              --region ${AWS_REGION}
          """

          // 4. Force new ECS deployment and wait for stability
          sh """
            aws ecs update-service \
              --cluster interview-cluster \
              --service backend-service \
              --force-new-deployment \
              --region ${AWS_REGION}

            aws ecs wait services-stable \
              --cluster interview-cluster \
              --services backend-service \
              --region ${AWS_REGION}
          """
        }
      }
    }
  }

  post {
    success {
      echo "✅ Deploy complete — http://${S3_BUCKET}.s3-website-${AWS_REGION}.amazonaws.com"
    }
    failure {
      echo "❌ Pipeline failed. Check the logs above for the failed stage."
    }
    always {
      sh "docker image prune -f"
    }
  }
}