// infrastructure/aws/pipeline-stack.ts
import * as cdk from 'aws-cdk-lib';
import * as codebuild from 'aws-cdk-lib/aws-codebuild';
import * as codepipeline from 'aws-cdk-lib/aws-codepipeline';
import * as codepipeline_actions from 'aws-cdk-lib/aws-codepipeline-actions';
import * as iam from 'aws-cdk-lib/aws-iam';
import type {Construct} from 'constructs';

export class PipelineStack extends cdk.Stack {
	constructor(scope: Construct, id: string, props?: cdk.StackProps) {
		super(scope, id, props);

		const sourceArtifact = new codepipeline.Artifact();
		const buildArtifact = new codepipeline.Artifact();

		const bitbucketSourceAction =
			new codepipeline_actions.CodeStarConnectionsSourceAction({
				actionName: 'BitbucketSource',
				owner: 'elaut',
				repo: 'eclaut-backend',
				branch: 'master',
				connectionArn:
					'arn:aws:codeconnections:eu-west-1:084828585414:connection/b611d909-e309-43f2-8d24-a4e220310671',
				output: sourceArtifact,
			});

		const project = new codebuild.PipelineProject(this, 'CDKBuildProject', {
			environment: {
				buildImage: codebuild.LinuxBuildImage.STANDARD_7_0,
				privileged: true,
			},
			buildSpec: codebuild.BuildSpec.fromObject({
				version: '0.2',
				phases: {
					install: {
						'runtime-versions': {
							nodejs: '18',
						},
						commands: ['npm install -g aws-cdk', 'yarn install'],
					},
					build: {
						commands: [
							'cdk synth',
							'cdk deploy --all --require-approval never',
						],
					},
				},
				artifacts: {
					files: ['**/*'],
				},
			}),
		});

		project.addToRolePolicy(
			new iam.PolicyStatement({
				actions: [
					'cloudformation:CreateStack',
					'cloudformation:UpdateStack',
					'cloudformation:DescribeStacks',
					'cloudformation:DeleteStack',
					'iam:PassRole',
					's3:*', // Adjust if you only need specific S3 permissions
					'codebuild:StartBuild',
					'codebuild:BatchGetBuilds',
					'codepipeline:PutJobSuccessResult',
					'codepipeline:PutJobFailureResult',
				],
				resources: ['*'], // Further restrict if possible
			})
		);

		new codepipeline.Pipeline(this, 'CDKPipeline', {
			pipelineName: 'eclaut-cdk-pipeline',
			stages: [
				{
					stageName: 'Source',
					actions: [bitbucketSourceAction],
				},
				{
					stageName: 'BuildAndDeploy',
					actions: [
						new codepipeline_actions.CodeBuildAction({
							actionName: 'CDK_Build_Deploy',
							project,
							input: sourceArtifact,
							outputs: [buildArtifact],
						}),
					],
				},
			],
		});
	}
}
