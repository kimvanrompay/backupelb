import {PinoLogger} from '@lib/utils';

export const LOGGER = new PinoLogger(
	{
		name: 'machine-sqs-lambda',
	},
	{}
);
