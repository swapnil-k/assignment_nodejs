node('prod-devops'){
    wrap([$class: 'TimestamperBuildWrapper']) {
    try{
        stage('Checkout'){
            sh '''
                set -x
                cd /opt/build/assignment_nodejs
                git clean -fd
                git checkout -f ${BRANCH}
                git pull                    
                git status
                git log  --pretty=oneline | head -n 10
            '''
            }
            
        stage('Build'){
            sh '''
                set -x
                current_time=$(date "+%Y-%m-%d-%H-%M")
                cd /opt/build/assignment_nodejs
                $(aws ecr get-login --no-include-email --region ap-south-1)
                docker run --rm -v "$(pwd)":/usr/src/nodejs  -w /usr/src/nodejs  node:14 npm install
                docker build --rm -t 353716661275.dkr.ecr.ap-south-1.amazonaws.com/nodejs-backend:$current_time .
                docker push 353716661275.dkr.ecr.ap-south-1.amazonaws.com/nodejs-backend:$current_time
            '''
        }
        
    stage('Deploy'){
        sh '''
            cd /home/ubuntu/kubernetes/helm/nodejs
            latest_tag=$(aws ecr describe-images --repository-name nodejs-backend  --query 'sort_by(imageDetails,& imagePushedAt)[-1].imageTags[0]')
            sed -i "s/tag: .*/tag: $latest_tag/" values.yaml
            helm upgrade --set REDIS="redis.catoftheday.internal" --set MONGODB="mongodb://root:<password>@mongodb.catoftheday.internal:27017/?authSource=admin" nodejs -n prod .
        '''
    }
    
    } catch (error) {
        currentBuild.result = "FAILED"
        notifyFailed()
        throw error
    }
    }
}

def notifyFailed() {
    wrap([$class: 'BuildUser']) {
    def user = env.BUILD_USER_FIRST_NAME
  }
  emailext (
      subject: "Jenkins job '${env.JOB_NAME}' #${env.BUILD_NUMBER} FAILED",
      body: """<p>Hi ${env.user},</p>
      <p>You jenkins job "${env.JOB_NAME}" (build number ${env.BUILD_NUMBER}) got failed.'
      <br>You can check console output at <a href='${env.BUILD_URL}'>${env.JOB_NAME} [${env.BUILD_NUMBER}]</a>
      <br>
      <br></p>
      <p><em>-DevOps team</em></p>""",
      recipientProviders: [[$class: 'RequesterRecipientProvider']]
    )
}
