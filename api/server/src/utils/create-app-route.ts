import {createRoute, type RouteConfig} from '@hono/zod-openapi';

import {ApiError, ApiErrorSchema} from '@lib/errors';

const defaultBadRequestResponse: RouteConfig['responses'][string] = {
	summary: 'Bad Request',
	description: 'Incorrect parameters provided',
	content: {
		'application/json': {
			schema: ApiErrorSchema,
			example: new ApiError(
				400,
				'Bad Request',
				'Incorrect parameters provided'
			),
		},
	},
};

const defaultForbiddenResponse: RouteConfig['responses'][string] = {
	summary: 'Forbidden',
	description: 'Forbidden',
	content: {
		'application/json': {
			schema: ApiErrorSchema,
			example: new ApiError(403, 'Forbidden', 'Forbidden'),
		},
	},
};

const defaultUnauthorizedResponse: RouteConfig['responses'][string] = {
	summary: 'Unauthorized',
	description: 'Unauthorized',
	content: {
		'application/json': {
			schema: ApiErrorSchema,
			example: new ApiError(401, 'Unauthorized', 'Unauthorized'),
		},
	},
};

const createAppRoute =
	(options?: {
		canThrowUnauthorized?: boolean;
		canThrowForbidden?: boolean;
		canThrowBadRequest?: boolean;
	}) =>
	<
		P extends string,
		R extends Omit<RouteConfig, 'path'> & {
			path: P;
		},
	>(
		routeConfig: R
	) => {
		const responses = routeConfig.responses || {};

		if (options?.canThrowUnauthorized) {
			responses[401] ??= defaultUnauthorizedResponse;
		}

		if (options?.canThrowForbidden) {
			responses[403] ??= defaultForbiddenResponse;
		}

		if (options?.canThrowBadRequest) {
			responses[400] ??= defaultBadRequestResponse;
		}

		return createRoute<P, R>({
			...routeConfig,
			responses,
		});
	};

export {createAppRoute};
