import type {Context, SQSEvent, SQSRecord} from 'aws-lambda';

import {LOGGER} from './logger';
import {createServices} from './services';
import {getMachineMessagesFromSQSMessage} from './sqs-message';

export const handler = async (
	event: SQSEvent,
	context: Context
): Promise<{
	batchItemFailures: Array<{itemIdentifier: string}>;
}> => {
	const logger = LOGGER.getChildLogger(
		{
			requestId: context.awsRequestId,
		},
		{}
	);

	const {machineMessagesService} = await createServices(logger);

	logger.debug(`Received event: ${JSON.stringify(event, null, 2)}`);

	const failedMessages: {
		itemIdentifier: string;
	}[] = [];

	const addFailedMessage = (message: SQSRecord) => {
		failedMessages.push({
			itemIdentifier: message.messageId,
		});
	};

	await Promise.all(
		event.Records.map(async (message) => {
			const machineMessages = getMachineMessagesFromSQSMessage(message);

			let result = true;

			for await (const machineMessage of machineMessages) {
				try {
					logger.debug(
						`Processing message: ${JSON.stringify(machineMessage, null, 2)}`
					);
					if (!(await machineMessagesService.handleMessage(machineMessage))) {
						result = false;
					}
				} catch (error) {
					logger.error(`Error processing message: ${error}`);
					result = false;
				}
			}

			if (!result) {
				addFailedMessage(message);
			}
		})
	);

	return {
		batchItemFailures: failedMessages,
	};
};
