import dotenv from 'dotenv';
import {join} from 'path';

import {PinoLogger} from '@lib/utils';

const LOGGER = new PinoLogger(
	{
		name: 'LoadEnvVariables',
	},
	{}
);

if (process.env.NODE_ENV === 'development') {
	const __dirname = import.meta.dirname;
	const path = join(__dirname, '../../..', '.env');

	LOGGER.info('Loading DEVELOPMENT env variables from .env file');

	dotenv.config({
		path,
	});
}

if (process.env.NODE_ENV === 'test') {
	const __dirname = import.meta.dirname;
	const path = join(__dirname, '../../..', '.env.test');

	LOGGER.info('Loading TEST env variables from .env.test file');

	dotenv.config({
		path,
	});
}
