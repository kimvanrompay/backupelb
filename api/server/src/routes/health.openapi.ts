import {createRoute, z} from '@hono/zod-openapi';

const pingCheckRoute = createRoute({
	summary: 'Ping Check',
	method: 'get',
	path: '/ping',
	tags: ['General'],
	responses: {
		200: {
			description: 'Successful Ping Response',
			content: {
				'text/plain': {
					schema: z.string(),
				},
			},
		},
	},
});

const healthCheckRoute = createRoute({
	summary: 'Health check',
	method: 'get',
	path: '/health',
	tags: ['General'],
	responses: {
		200: {
			description: 'Successful Health Response',
			content: {
				'text/plain': {
					schema: z.string(),
				},
			},
		},
	},
});

export {pingCheckRoute, healthCheckRoute};
