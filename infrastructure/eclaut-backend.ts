import * as cdk from 'aws-cdk-lib';

import {ApiStack} from './aws/api-stack.js';
import {DbStack} from './aws/db-stack.js';
import {EcrStack} from './aws/ecr-stack.js';
import {PipelineStack} from './aws/pipeline-stack.js';
import {productionConfig} from './aws/production-config.js';
import {SqsLambdaStack} from './aws/sqs-lambda-stack.js';
import {stagingConfig} from './aws/staging-config.js';

const app = new cdk.App();

// ECR Stack (shared across environments)
new EcrStack(app, 'EcrStack', {
	env: {account: '084828585414', region: 'eu-west-1'},
});

// API Stack for Staging
new ApiStack(app, 'ApiStack-Staging', {
	env: {account: '084828585414', region: 'eu-west-1'},
	envConfig: stagingConfig,
});

// API Stack for Production
new ApiStack(app, 'ApiStack-Production', {
	env: {account: '084828585414', region: 'eu-west-1'},
	envConfig: productionConfig,
});

new PipelineStack(app, 'PipelineStack', {
	env: {account: '084828585414', region: 'eu-west-1'},
});

// Database Stack (RDS)
new DbStack(app, 'DbStack', {
	env: {account: '084828585414', region: 'eu-west-1'},
});

new SqsLambdaStack(app, 'SqsLambdaStack', {
	env: {account: '084828585414', region: 'eu-west-1'},
});
