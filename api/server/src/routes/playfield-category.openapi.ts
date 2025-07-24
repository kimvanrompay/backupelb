import {z} from 'zod';

import {PlayfieldCategory} from '@lib/models/playfield-category';
import {AppSecurityScopes} from '@lib/services/authorization';

import {createPrivateAppRoute} from '../utils/create-private-app-route';

const findPlayfieldCategoriesRoute = createPrivateAppRoute(
	[
		AppSecurityScopes.READ_PLAYFIELD_CATEGORIES,
		AppSecurityScopes.READ_MACHINES,
	],
	{
		canThrowBadRequest: true,
	}
)({
	method: 'get',
	summary: 'Get all playfield categories',
	tags: ['Playfield Categories'],
	path: '/',
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
						entries: z.array(PlayfieldCategory.schemas.DTOSchema),
						totalEntries: z.number(),
					}),
				},
			},
		},
	},
});

const getPlayfieldCategoryRoute = createPrivateAppRoute(
	[
		AppSecurityScopes.READ_PLAYFIELD_CATEGORIES,
		AppSecurityScopes.READ_MACHINES,
	],
	{
		canThrowBadRequest: true,
	}
)({
	method: 'get',
	summary: 'Get a specific playfield category by its id',
	tags: ['Playfield Categories'],
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
					schema: PlayfieldCategory.schemas.DTOSchema,
				},
			},
		},
	},
});

const createPlayfieldCategoryRoute = createPrivateAppRoute(
	[
		AppSecurityScopes.CREATE_PLAYFIELD_CATEGORIES,
		AppSecurityScopes.READ_MACHINES,
	],
	{
		canThrowBadRequest: true,
	}
)({
	method: 'post',
	summary: 'Create a new playfield category',
	tags: ['Playfield Categories'],
	path: '/',
	request: {
		body: {
			content: {
				'application/json': {
					schema: PlayfieldCategory.schemas.CreateDTOSchema,
				},
			},
		},
	},
	responses: {
		201: {
			description: 'Playfield category created',
			content: {
				'application/json': {
					schema: PlayfieldCategory.schemas.DTOSchema,
				},
			},
		},
	},
});

const updatePlayfieldCategoryRoute = createPrivateAppRoute(
	[
		AppSecurityScopes.UPDATE_PLAYFIELD_CATEGORIES,
		AppSecurityScopes.READ_MACHINES,
	],
	{
		canThrowBadRequest: true,
	}
)({
	method: 'put',
	summary: 'Update a playfield category',
	tags: ['Playfield Categories'],
	path: '/{id}',
	request: {
		params: z.object({
			id: z.string(),
		}),
		body: {
			content: {
				'application/json': {
					schema: PlayfieldCategory.schemas.UpdateDTOSchema,
				},
			},
		},
	},
	responses: {
		200: {
			description: 'Successful response',
			content: {
				'application/json': {
					schema: PlayfieldCategory.schemas.DTOSchema,
				},
			},
		},
	},
});

const deletePlayfieldCategoryRoute = createPrivateAppRoute(
	[
		AppSecurityScopes.DELETE_PLAYFIELD_CATEGORIES,
		AppSecurityScopes.READ_MACHINES,
	],
	{
		canThrowBadRequest: true,
	}
)({
	method: 'delete',
	summary: 'Delete a playfield category',
	tags: ['Playfield Categories'],
	path: '/{id}',
	request: {
		params: z.object({
			id: z.string(),
		}),
	},
	responses: {
		204: {
			description: 'Playfield category deleted',
		},
	},
});

export {
	findPlayfieldCategoriesRoute,
	getPlayfieldCategoryRoute,
	createPlayfieldCategoryRoute,
	updatePlayfieldCategoryRoute,
	deletePlayfieldCategoryRoute,
};
