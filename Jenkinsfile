pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm ci'
            }
        }

        stage('Build') {
            steps {
                sh 'npm run build'
            }
        }

        stage('Deploy') {
            steps {
                sh '''
                    rsync -av --delete --no-owner --no-group \
                        dist/ \
                        /mnt/data/www/web-money-manage/dist/
                '''
            }
        }
    }
}