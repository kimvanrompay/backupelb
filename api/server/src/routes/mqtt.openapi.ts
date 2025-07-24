import {z} from '@hono/zod-openapi';

import {MqttCredentialsModel} from '@lib/models/mqtt-credentials';

import {createPrivateAppRoute} from '../utils/create-private-app-route';

const getMqttCredentialsRoute = createPrivateAppRoute([])({
	method: 'get',
	summary: 'Get MQTT credentials',
	tags: ['MQTT'],
	path: '/credentials',
	request: {
		query: z.object({
			playfield_id: z.string().optional(),
			serial_number: z.string().optional(),
		}),
	},
	responses: {
		200: {
			description: 'Successful response',
			content: {
				'application/json': {
					schema: MqttCredentialsModel.schemas.DTOSchema,
				},
			},
		},
	},
});

export {getMqttCredentialsRoute};
