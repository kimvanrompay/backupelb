import type {Message} from '@aws-sdk/client-sqs';
import dotenv from 'dotenv';
import {join} from 'path';

import {SqsMessagePoller} from '@lib/utils/sqs';

import {LOGGER} from './logger';
import {createServices} from './services';
import {getMachineMessagesFromSQSMessage} from './sqs-message';

/**
 * This is to locally mock the lambda handler. It will poll the SQS queue and call the same service functions.
 */

const __dirname = import.meta.dirname;
console.log('Starting local machine-sqs-lambda handler', __dirname);
dotenv.config({
	path: join(__dirname, '..', '.env'),
});

const {machineMessagesService} = await createServices(LOGGER);

const handleSQSMessage = async (message: Message) => {
	const machineMessages = getMachineMessagesFromSQSMessage(message);

	if (!machineMessages || machineMessages.length === 0) {
		return false;
	}

	let response = true;

	for await (const machineMessage of machineMessages) {
		try {
			const result = await machineMessagesService.handleMessage(machineMessage);

			if (!result) {
				LOGGER.error(
					`Failed to process message: ${JSON.stringify(machineMessage)}`
				);
			}

			response = response && result;
		} catch (error) {
			// Don't throw error or return false immediately as we want to process all messages in the batch
			LOGGER.error(
				`Error processing message: ${JSON.stringify(machineMessage)}`
			);
			response = false;
		}
	}

	return response;
};

const handleSQSMessageError = async (message: Message) => {
	LOGGER.error(`Error processing message: ${message.MessageId}`);

	const machineMessages = getMachineMessagesFromSQSMessage(message);

	if (!machineMessages || machineMessages.length === 0) {
		return;
	}

	for await (const machineMessage of machineMessages) {
		await machineMessagesService.handleFailedMessage(machineMessage);
	}
};

const poller = new SqsMessagePoller(handleSQSMessage, handleSQSMessageError);

poller.start();

while (poller.isActive) {
	// this is to keep the process running
	// eslint-disable-next-line no-await-in-loop
	await new Promise((resolve) => setTimeout(resolve, 1000));
}
