import {z} from '@hono/zod-openapi';

import {Gametype} from '@lib/models/gametype';
import {AppSecurityScopes} from '@lib/services/authorization';

import {createPrivateAppRoute} from '../utils/create-private-app-route';

const findGametypesRoute = createPrivateAppRoute(
	[AppSecurityScopes.READ_GAME_TYPES],
	{
		canThrowBadRequest: true,
	}
)({
	method: 'get',
	summary: 'Get all game types',
	path: '/',
	tags: ['Game Types'],
	request: {
		query: z.object({
			'name[like]': z.string().optional(),
			limit: z.coerce.number().min(1).max(1000),
			offset: z.coerce.number().min(0),
			order_by: z.string().optional(),
		}),
	},
	responses: {
		200: {
			description: 'Successful response',
			content: {
				'application/json': {
					schema: z.object({
						entries: z.array(Gametype.schemas.GametypeDTOSchema),
						totalEntries: z.number(),
					}),
				},
			},
		},
	},
});

const getGametypeRoute = createPrivateAppRoute(
	[AppSecurityScopes.READ_GAME_TYPES],
	{
		canThrowBadRequest: true,
	}
)({
	method: 'get',
	summary: 'Get a specific game type by its id',
	tags: ['Game Types'],
	path: '/{id}',
	request: {
		params: z.object({
			id: z.string(),
		}),
	},
	responses: {
		200: {
			description: 'Successful response',
			content: {
				'application/json': {
					schema: z.object({
						id: z.string(),
						name: z.string(),
						description: z.string().optional(),
					}),
				},
			},
		},
	},
});

const createGametypeRoute = createPrivateAppRoute(
	[AppSecurityScopes.CREATE_GAME_TYPES],
	{
		canThrowBadRequest: true,
	}
)({
	method: 'post',
	summary: 'Create a new game type',
	tags: ['Game Types'],
	path: '/',
	request: {
		body: {
			content: {
				'application/json': {
					schema: Gametype.schemas.GametypeCreateDTOSchema,
				},
			},
		},
	},
	responses: {
		201: {
			description: 'Successful response',
			content: {
				'application/json': {
					schema: Gametype.schemas.GametypeDTOSchema,
				},
			},
		},
	},
});

const updateGametypeRoute = createPrivateAppRoute(
	[AppSecurityScopes.UPDATE_GAME_TYPES],
	{
		canThrowBadRequest: true,
	}
)({
	method: 'put',
	summary: 'Update a game type',
	tags: ['Game Types'],
	path: '/{id}',
	request: {
		params: z.object({
			id: z.string(),
		}),
		body: {
			content: {
				'application/json': {
					schema: Gametype.schemas.GametypeUpdateDTOSchema,
				},
			},
		},
	},
	responses: {
		200: {
			description: 'Successful response',
			content: {
				'application/json': {
					schema: Gametype.schemas.GametypeDTOSchema,
				},
			},
		},
	},
});

export {
	findGametypesRoute,
	getGametypeRoute,
	createGametypeRoute,
	updateGametypeRoute,
};
