import {STSClient} from '@aws-sdk/client-sts';
import {OpenAPIHono} from '@hono/zod-openapi';

import {ForbiddenError} from '@lib/errors';
import {MachineLogRepository} from '@lib/repositories/machine-log';
import {PlayfieldRepository} from '@lib/repositories/playfield';
import {PlayfieldCategoryRepository} from '@lib/repositories/playfield-category';
import {PrizeRepository} from '@lib/repositories/prize';
import {MqttCredentialsService} from '@lib/services/mqtt-credentials';
import {PlayfieldService} from '@lib/services/playfield';
import type {AuthenticatedAppContext} from '@lib/services/types';
import {defaultValidationHook} from '@lib/utils';
import {getAwsSecret} from '@lib/utils/aws-secret-manager';

import {db} from '../database';
import type {AuthenticatedEnvironment} from '../types';
import {getMqttCredentialsRoute} from './mqtt.openapi';

const MQTT_CREDENTIALS_KEY = process.env.MQTT_CREDENTIALS_KEY;

const createMqttApi = () => {
	const stsClient: STSClient | null = null;

	const app = new OpenAPIHono<AuthenticatedEnvironment>({
		strict: true,
		defaultHook: defaultValidationHook,
	});

	const getStsClient = async () => {
		if (stsClient) {
			return stsClient;
		}

		if (!MQTT_CREDENTIALS_KEY) {
			throw new Error('MQTT_CREDENTIALS_KEY is not set');
		}

		const secret = await getAwsSecret<{
			AWS_ACCESS_KEY_ID: string;
			AWS_SECRET_ACCESS_KEY: string;
		}>(MQTT_CREDENTIALS_KEY);

		return new STSClient({
			region: process.env.AWS_REGION,
			credentials: {
				accessKeyId: secret.AWS_ACCESS_KEY_ID,
				secretAccessKey: secret.AWS_SECRET_ACCESS_KEY,
			},
		});
	};

	const getServices = async (appContext: AuthenticatedAppContext) => {
		const playfieldRepository = new PlayfieldRepository(db, appContext);
		const prizeRepository = new PrizeRepository(db, appContext);
		const machineLogRepository = new MachineLogRepository(db, appContext);
		const playfieldCategoryRepository = new PlayfieldCategoryRepository(
			db,
			appContext
		);

		const playfieldService = new PlayfieldService(
			playfieldRepository,
			prizeRepository,
			playfieldCategoryRepository,
			machineLogRepository,
			appContext
		);

		const mqttCredentialsService = new MqttCredentialsService(
			await getStsClient(),
			playfieldService,
			appContext
		);

		return {
			playfieldService,
			mqttCredentialsService,
		};
	};

	app.openapi(getMqttCredentialsRoute, async (ctx) => {
		const {playfield_id, serial_number} = ctx.req.valid('query');

		// return ctx.json({}, 400);

		const {mqttCredentialsService} = await getServices(ctx.get('appContext'));

		const credentials = await mqttCredentialsService.getMqttCredentials({
			playfieldId: playfield_id,
			serialNumber: serial_number,
		});

		if (!credentials) {
			throw new ForbiddenError('No credentials found');
		}

		return ctx.json(credentials.toJSON(), 200);
	});

	return app;
};

export {createMqttApi};
