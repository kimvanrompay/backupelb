import {createRoute} from '@hono/zod-openapi';
import {z} from '@hono/zod-openapi';

import {ApiErrorSchema} from '@lib/errors';
import {LoginVerificationCode} from '@lib/models/login-verification-code';

import {cookieAuthRegistry} from '../app';
import {createPrivateAppRoute} from '../utils/create-private-app-route';

const startAuthenticationWithCodeRoute = createRoute({
	summary: 'Method to start a login session through a code',
	method: 'post',
	path: '/code',
	tags: ['Authentication'],
	request: {
		body: {
			content: {
				'application/json': {
					schema: z.object({
						email: z.string().email(),
					}),
				},
			},
		},
	},
	responses: {
		200: {
			description: 'Successful login',
			content: {
				'application/json': {
					schema: LoginVerificationCode.schemas.LoginVerificationCodeDTOSchema,
				},
			},
		},
	},
});

const authorizeCodeRoute = createRoute({
	summary: 'Method to authorize a login session through a code',
	method: 'post',
	path: '/code/authorize',
	tags: ['Authentication'],
	request: {
		body: {
			content: {
				'application/json': {
					schema: z.object({
						email: z.string(),
						code: z.string(),
					}),
				},
			},
		},
	},
	responses: {
		200: {
			description: 'Successful login',
			headers: {
				'Set-Cookie': {
					description: 'Set the cookie',
					schema: {
						type: 'string',
					},
				},
			},
		},
	},
});

const startClientAuthenticationWithSecretRoute = createRoute({
	summary: 'Method to start a login session through a secret',
	method: 'post',
	path: '/oauth/token',
	tags: ['Authentication'],
	request: {
		body: {
			content: {
				'application/json': {
					schema: z.object({
						client_id: z.string(),
						client_secret: z.string(),
						grant_type: z.literal('client_credentials'),
					}),
				},
			},
		},
	},
	responses: {
		200: {
			description: 'Successful login',
			body: {
				content: {
					'application/json': {
						schema: z.object({
							access_token: z.string(),
							refresh_token: z.string(),
							expires_in: z.number(),
							refresh_expires_in: z.number(),
						}),
					},
				},
			},
		},
	},
});

const authenticateWithPasswordRoute = createRoute({
	summary: 'Method to authenticate with username and password',
	method: 'post',
	path: '/credentials',
	tags: ['Authentication'],
	request: {
		body: {
			content: {
				'application/json': {
					schema: z.object({
						email: z.string().email(),
						password: z.string(),
					}),
				},
			},
		},
	},
	responses: {
		200: {
			description: 'Successful login',
			headers: {
				'Set-Cookie': {
					description: 'Set the cookie',
					schema: {
						type: 'string',
					},
				},
			},
		},
	},
});

const requestResetPasswordRoute = createRoute({
	summary: 'Method to request a password reset',
	method: 'post',
	path: '/credentials/reset-password',
	tags: ['Authentication'],
	request: {
		body: {
			content: {
				'application/json': {
					schema: z.object({
						email: z.string().email(),
					}),
				},
			},
		},
	},
	responses: {
		204: {
			description: 'Password reset request successful',
		},
	},
});

const validateResetPasswordTokenRoute = createRoute({
	summary: 'Method to validate a password reset token',
	method: 'post',
	path: '/credentials/validate-reset-token',
	tags: ['Authentication'],
	request: {
		body: {
			content: {
				'application/json': {
					schema: z.object({
						email: z.string().email(),
						token: z.string(),
					}),
				},
			},
		},
	},
	responses: {
		200: {
			description: 'Token is valid',
			content: {
				'application/json': {
					schema: z.object({
						username: z.string(),
					}),
				},
			},
		},
		400: {
			description: 'Token is invalid, expired, or does not exists',
			content: {
				'application/json': {
					schema: ApiErrorSchema,
				},
			},
		},
	},
});

const updatePasswordRoute = createRoute({
	summary: 'Method to update a password after a reset request',
	method: 'put',
	path: '/credentials/update-password',
	tags: ['Authentication'],
	request: {
		body: {
			content: {
				'application/json': {
					schema: z.object({
						email: z.string().email(),
						token: z.string(),
						newPassword: z.string(),
					}),
				},
			},
		},
	},
	responses: {
		204: {
			description: 'Password reset successful',
		},
		400: {
			description: 'Token is invalid, expired, or does not exists',
			content: {
				'application/json': {
					schema: ApiErrorSchema,
				},
			},
		},
	},
});

const refreshTokenRoute = createRoute({
	summary: 'Method to refresh a token',
	method: 'post',
	path: '/refresh',
	tags: ['Authentication'],
	security: [
		{
			[cookieAuthRegistry.name]: [],
		},
	],
	responses: {
		204: {
			description: 'Successful login',
			headers: {
				'Set-Cookie': {
					description: 'Set the cookie',
					schema: {
						type: 'string',
					},
				},
			},
		},
	},
});

const logoutRoute = createPrivateAppRoute()({
	summary: 'Method to logout',
	method: 'post',
	path: '/logout',
	tags: ['Authentication'],
	responses: {
		204: {
			description: 'Successful logout',
			headers: {
				'Set-Cookie': {
					description: 'Set the cookie',
					schema: {
						type: 'string',
					},
				},
			},
		},
	},
});

const logoutAllDevicesRoute = createPrivateAppRoute()({
	summary: 'Method to logout from all devices',
	method: 'post',
	path: '/logout/all',
	tags: ['Authentication'],
	responses: {
		204: {
			description: 'Successful logout',
			headers: {
				'Set-Cookie': {
					description: 'Set the cookie',
					schema: {
						type: 'string',
					},
				},
			},
		},
	},
});

export {
	startAuthenticationWithCodeRoute,
	authorizeCodeRoute,
	refreshTokenRoute,
	logoutRoute,
	logoutAllDevicesRoute,
	startClientAuthenticationWithSecretRoute,
	authenticateWithPasswordRoute,
	requestResetPasswordRoute,
	validateResetPasswordTokenRoute,
	updatePasswordRoute,
};
