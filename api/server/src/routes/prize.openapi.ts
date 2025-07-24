import {z} from '@hono/zod-openapi';

import {Prize} from '@lib/models/prize';
import {AppSecurityScopes} from '@lib/services/authorization';

import {createPrivateAppRoute} from '../utils/create-private-app-route';

const findPrizesRoute = createPrivateAppRoute(
	[AppSecurityScopes.READ_MACHINES],
	{
		canThrowBadRequest: true,
	}
)({
	method: 'get',
	summary: 'Get all prizes',
	path: '/',
	tags: ['Prizes'],
	request: {
		query: z.object({
			'tenant_id[eq]': z.string().optional(),
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
						entries: z.array(Prize.schemas.DTOSchema), // TODO: Possibly Replace with smaller overview schema
						totalEntries: z.number(),
					}),
				},
			},
		},
	},
});

const getPrizeRoute = createPrivateAppRoute([AppSecurityScopes.READ_MACHINES], {
	canThrowBadRequest: true,
})({
	method: 'get',
	summary: 'Get a specific prize by its id',
	path: '/{id}',
	tags: ['Prizes'],
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
					schema: Prize.schemas.DTOSchema,
				},
			},
		},
	},
});

const createPrizeRoute = createPrivateAppRoute(
	[AppSecurityScopes.CREATE_MACHINES],
	{
		canThrowBadRequest: true,
	}
)({
	method: 'post',
	summary: 'Create a new prize',
	tags: ['Prizes'],
	path: '/',
	request: {
		body: {
			content: {
				'application/json': {
					schema: Prize.schemas.CreateDTOSchema,
				},
			},
		},
	},
	responses: {
		201: {
			description: 'Prize created',
			content: {
				'application/json': {
					schema: Prize.schemas.DTOSchema,
				},
			},
		},
	},
});

const updatePrizeRoute = createPrivateAppRoute(
	[AppSecurityScopes.UPDATE_MACHINES],
	{
		canThrowBadRequest: true,
	}
)({
	method: 'put',
	summary: 'Update a prize',
	tags: ['Prizes'],
	path: '/{id}',
	request: {
		params: z.object({
			id: z.string(),
		}),
		body: {
			content: {
				'application/json': {
					schema: Prize.schemas.UpdateDTOSchema,
				},
			},
		},
	},
	responses: {
		200: {
			description: 'Prize updated',
			content: {
				'application/json': {
					schema: Prize.schemas.DTOSchema,
				},
			},
		},
	},
});

export {findPrizesRoute, getPrizeRoute, createPrizeRoute, updatePrizeRoute};
