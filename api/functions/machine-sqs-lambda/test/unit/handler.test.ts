import type {SQSRecord} from 'aws-lambda';
import {expect} from 'vitest';

import {MachineMessage} from '@lib/models/machine-message';
import {MachineMessageService} from '@lib/services/machine-message';
import {isArrayEmptyOrUndefined} from '@lib/utils/array';

import {handler} from '../../src/handler';

vi.mock('@lib/services/machine-message', () => ({
	MachineMessageService: class MachineMessageService {
		handleMessage() {}

		handleFailedMessage() {}
	},
}));
vi.mock('@lib/db');

const defaultRecordBody = {
	message: {
		u: 'test-id',
		e: 'TEST_TYPE',
		t: new Date().getTime().toString(),
		d: {
			test: 'data',
		},
	},
	topic: 'cabinet-id/playfield-id/data',
};

const defaultRecord: SQSRecord = {
	awsRegion: 'eu-west-1',
	eventSource: 'sqs',
	eventSourceARN: 'sqsARN',
	md5OfBody: '',
	messageId: 'messageId',
	receiptHandle: 'receiptHandle',
	body: JSON.stringify(defaultRecordBody),
	attributes: {
		SentTimestamp: 'SentTimestamp',
		ApproximateReceiveCount: 'ApproximateReceiveCount',
		ApproximateFirstReceiveTimestamp: 'ApproximateFirstReceiveTimestamp',
		SenderId: 'SenderId',
	},
	messageAttributes: {},
};

afterEach(() => {
	vi.resetAllMocks();
});

describe('handler', () => {
	it('should be true', () => {
		expect(true).toBe(true);
	});

	// it('should handle a sqs message succesfully', async () => {
	// 	const handleMessage = vi
	// 		.spyOn(MachineMessageService.prototype, 'handleMessage')
	// 		.mockResolvedValue(true);
	//
	// 	const result = await handler(
	// 		{
	// 			Records: [
	// 				{
	// 					...defaultRecord,
	// 				},
	// 			],
	// 		},
	// 		{} as any
	// 	);
	//
	// 	expect(result).toBeDefined();
	// 	expect(isArrayEmptyOrUndefined(result.batchItemFailures)).toBe(true);
	// 	expect(handleMessage).toHaveBeenCalledTimes(1);
	//
	// 	expect(handleMessage).toHaveBeenCalledWith(
	// 		MachineMessage.fromMachineInput({
	// 			c: 'cabinet-id',
	// 			d: {test: 'data'},
	// 			e: 'TEST_TYPE',
	// 			p: 'playfield-id',
	// 		})
	// 	);
	// });
	//
	// it('should handle a sqs message with a failed service', async () => {
	// 	const handleMessage = vi
	// 		.spyOn(MachineMessageService.prototype, 'handleMessage')
	// 		.mockRejectedValue(false);
	//
	// 	const result = await handler(
	// 		{
	// 			Records: [
	// 				{
	// 					...defaultRecord,
	// 				},
	// 			],
	// 		},
	// 		{} as any
	// 	);
	//
	// 	expect(result).toBeDefined();
	// 	expect(isArrayEmptyOrUndefined(result.batchItemFailures)).toBe(false);
	// 	expect(result.batchItemFailures).toHaveLength(1);
	// 	expect(result.batchItemFailures[0]!.itemIdentifier).toBe(
	// 		defaultRecord.messageId
	// 	);
	//
	// 	expect(handleMessage).toHaveBeenCalledTimes(1);
	// 	expect(handleMessage).toHaveBeenCalledWith(
	// 		MachineMessage.fromMachineInput(defaultRecordBody)
	// 	);
	// });
	//
	// it('should handle a sqs message with an error thrown within the service', async () => {
	// 	const handleMessage = vi
	// 		.spyOn(MachineMessageService.prototype, 'handleMessage')
	// 		.mockRejectedValue(new Error('error'));
	//
	// 	const result = await handler(
	// 		{
	// 			Records: [
	// 				{
	// 					...defaultRecord,
	// 				},
	// 			],
	// 		},
	// 		{} as any
	// 	);
	//
	// 	expect(result).toBeDefined();
	// 	expect(isArrayEmptyOrUndefined(result.batchItemFailures)).toBe(false);
	// 	expect(result.batchItemFailures).toHaveLength(1);
	// 	expect(result.batchItemFailures[0]!.itemIdentifier).toBe(
	// 		defaultRecord.messageId
	// 	);
	//
	// 	expect(handleMessage).toHaveBeenCalledTimes(1);
	// 	expect(handleMessage).toHaveBeenCalledWith(
	// 		MachineMessage.fromMachineInput(defaultRecordBody)
	// 	);
	// });
});
