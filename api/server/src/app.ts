import {OpenAPIHono} from '@hono/zod-openapi';
import {cors} from 'hono/cors';
import {csrf} from 'hono/csrf';
import {requestId} from 'hono/request-id';

// import {getKnexInstance} from '@lib/db';
// import {MachineRepository} from '@lib/repositories/machine';
// import {MachineService} from '@lib/services/machine';
import {defaultValidationHook} from '@lib/utils';

import {apiErrorHandler} from './api-error-handler';
import {httpLogger} from './middlewares/http-logger';
// import {createMachineApi} from './routes/machine.routes';
import type {Environment} from './types';

const app = new OpenAPIHono<Environment>({
	strict: true,
	defaultHook: defaultValidationHook,
});

const cookieAuthRegistry = app.openAPIRegistry.registerComponent(
	'securitySchemes',
	'cookieAuth',
	{
		type: 'apiKey',
		in: 'cookie',
		name: 'eclaut-access-token',
		description: 'Cookie-based authentication',
	}
);

const oauth2Registry = app.openAPIRegistry.registerComponent(
	'securitySchemes',
	'oauth2',
	{
		type: 'oauth2',
		description: 'OAuth2 authentication',
		flows: {
			clientCredentials: {
				// authorizationUrl: '/auth/oauth/authorize',
				tokenUrl: '/auth/oauth/token',
				scopes: {
					'read:machines': 'Read machines',
					'write:machines': 'Write machines',
				},
			},
		},
	}
);

const bearerAuthRegistry = app.openAPIRegistry.registerComponent(
	'securitySchemes',
	'bearerAuth',
	{
		type: 'http',
		scheme: 'bearer',
		bearerFormat: 'JWT',
		name: 'Authorization',
		in: 'header',
		description: 'Bearer token authentication',
		flows: {
			clientCredentials: {
				// authorizationUrl: '/auth/oauth/authorize',
				tokenUrl: '/auth/oauth/token',
				scopes: {
					'read:machines': 'Read machines',
					'write:machines': 'Write machines',
					'read:gametype': 'Read game types',
				},
			},
		},
	}
);

app.use(
	cors({
		origin: [
			'http://localhost:3000',
			'http://localhost:3001',
			'https://eclaut.com',
		],
		credentials: true,
		// maxAge: 600,
	})
);
app.use(csrf());
app.onError(apiErrorHandler);
app.use(requestId());
app.use(httpLogger);

/**
 * Services
 */

// const machineRepository = new MachineRepository(db);
// const machineService = new MachineService(machineRepository);

export {app, cookieAuthRegistry, oauth2Registry, bearerAuthRegistry};
