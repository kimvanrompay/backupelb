import * as cdk from 'aws-cdk-lib';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import {Construct} from 'constructs';

export class EcrStack extends cdk.Stack {
	constructor(scope: Construct, id: string, props?: cdk.StackProps) {
		super(scope, id, props);
		// STAGING
		new ecr.Repository(this, 'EcrRepoStaging', {
			repositoryName: 'eclaut-backend-api-staging',
			imageScanOnPush: true,
			removalPolicy: cdk.RemovalPolicy.RETAIN,
		});

		// PRODUCTION
		new ecr.Repository(this, 'EcrRepoProduction', {
			repositoryName: 'eclaut-backend-api-production',
			imageScanOnPush: true,
			removalPolicy: cdk.RemovalPolicy.RETAIN,
		});
	}
}
