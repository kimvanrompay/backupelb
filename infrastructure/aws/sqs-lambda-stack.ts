import {IotToSqs} from '@aws-solutions-constructs/aws-iot-sqs';
import {SqsToLambda} from '@aws-solutions-constructs/aws-sqs-lambda';
import * as cdk from 'aws-cdk-lib';
import * as iot from 'aws-cdk-lib/aws-iot';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import {NodejsFunction} from 'aws-cdk-lib/aws-lambda-nodejs';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import {Construct} from 'constructs';
import {join, resolve} from 'path';

export class SqsLambdaStack extends cdk.Stack {
	constructor(scope: Construct, id: string, props?: cdk.StackProps) {
		super(scope, id, props);

		const dlqQueue = new sqs.Queue(this, 'machine-message-dlq', {
			queueName: 'machine-message-dlq',
			visibilityTimeout: cdk.Duration.seconds(30),
			receiveMessageWaitTime: cdk.Duration.seconds(20),
		});

		const queue = new sqs.Queue(this, 'machine-message-queue', {
			queueName: 'machine-message-queue',
			visibilityTimeout: cdk.Duration.seconds(30),
			receiveMessageWaitTime: cdk.Duration.seconds(20),
			deadLetterQueue: {
				maxReceiveCount: 5,
				queue: dlqQueue,
			},
		});

		const lambdaFunction = new NodejsFunction(this, 'machine-message-lambda', {
			runtime: lambda.Runtime.NODEJS_22_X,
			entry: resolve(
				join(__dirname, '../../api/functions/machine-sqs-lambda/src/handler.ts')
			),
			handler: 'handler',
			bundling: {
				nodeModules: ['@aws-sdk/client-sqs'],
				externalModules: [
					'pg-query-stream',
					'mysql2',
					'mysql',
					'oracledb',
					'sqlite3',
					'better-sqlite3',
					'tedious',
				],
			},
		});

		new SqsToLambda(this, 'machine-sqs-lambda', {
			existingQueueObj: queue,
			existingLambdaObj: lambdaFunction,
			sqsEventSourceProps: {
				batchSize: 1000, // Maximum amount of messages to batch during the batch window (max 10 if maxBatchingWindow is not set === 1 poll)
				maxConcurrency: 10, // Maximum number of concurrent Lambda function executions
				maxBatchingWindow: cdk.Duration.seconds(5), // Maximum amount of time to wait before invoking the Lambda function
			},
		});

		new IotToSqs(this, 'machine-iot-to-sqs', {
			existingQueueObj: queue,
			iotTopicRuleProps: {
				topicRulePayload: {
					ruleDisabled: false,
					description: 'direct messages from iot to sqs',
					sql: "SELECT * as message, topic() from '+/+/data'",
					actions: [],
				},
			},
		});
	}
}
