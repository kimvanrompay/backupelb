import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import {Construct} from 'constructs';

interface ApiStackProps extends cdk.StackProps {
	envConfig: {
		environment: string;
		cpu: number;
		memoryLimitMiB: number;
		desiredCount: number;
		domainName: string;
		ecrRepoName: string;
	};
}

export class ApiStack extends cdk.Stack {
	constructor(scope: Construct, id: string, props: ApiStackProps) {
		super(scope, id, props);

		const {environment, cpu, memoryLimitMiB, desiredCount, ecrRepoName} =
			props.envConfig;

		// ✅ Create VPC & ECS Cluster
		const vpc = new ec2.Vpc(this, `Vpc-${environment}`, {maxAzs: 2});
		const cluster = new ecs.Cluster(this, `EcsCluster-${environment}`, {vpc});

		// ✅ Define Fargate Task with ECR Image
		const taskDefinition = new ecs.FargateTaskDefinition(
			this,
			`TaskDef-${environment}`,
			{
				cpu,
				memoryLimitMiB,
			}
		);

		const container = taskDefinition.addContainer(
			`AppContainer-${environment}`,
			{
				image: ecs.ContainerImage.fromRegistry(
					`${this.account}.dkr.ecr.${this.region}.amazonaws.com/${ecrRepoName}:latest`
				),
				memoryLimitMiB,
				logging: new ecs.AwsLogDriver({streamPrefix: `ecs-${environment}`}),
			}
		);

		// ✅ Add required port mapping for Load Balancer to work
		container.addPortMappings({
			containerPort: 3000,
			protocol: ecs.Protocol.TCP, // optional, TCP is default
		});

		// ✅ Add Load Balancer & Service
		const lb = new elbv2.ApplicationLoadBalancer(this, `LB-${environment}`, {
			vpc,
			internetFacing: true,
		});
		const listener = lb.addListener(`Listener-${environment}`, {port: 80});

		const fargateService = new ecs.FargateService(
			this,
			`FargateService-${environment}`,
			{
				cluster,
				taskDefinition,
				desiredCount,
			}
		);

		listener.addTargets(`AppTarget-${environment}`, {
			port: 3000,
			protocol: elbv2.ApplicationProtocol.HTTP,
			targets: [fargateService],
		});

		new cdk.CfnOutput(this, `LoadBalancerDNS-${environment}`, {
			value: lb.loadBalancerDnsName,
		});
	}
}
