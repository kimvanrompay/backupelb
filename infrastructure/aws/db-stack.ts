import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as rds from 'aws-cdk-lib/aws-rds';
import {Construct} from 'constructs';

export class DbStack extends cdk.Stack {
	constructor(scope: Construct, id: string, props?: cdk.StackProps) {
		super(scope, id, props);

		// ✅ Create a VPC
		const vpc = new ec2.Vpc(this, 'DatabaseVPC', {maxAzs: 2});

		// ✅ Create RDS PostgreSQL Database
		new rds.DatabaseInstance(this, 'PostgresDB', {
			engine: rds.DatabaseInstanceEngine.postgres({
				version: rds.PostgresEngineVersion.VER_14,
			}),
			instanceType: ec2.InstanceType.of(
				ec2.InstanceClass.BURSTABLE2,
				ec2.InstanceSize.MICRO
			),
			vpc,
			allocatedStorage: 20,
			maxAllocatedStorage: 100,
			multiAz: false, // Single-AZ for cost savings
			publiclyAccessible: false, // Private database
			removalPolicy: cdk.RemovalPolicy.RETAIN, // Keep DB even if stack is deleted
		});
	}
}
