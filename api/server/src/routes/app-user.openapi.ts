import {z} from '@hono/zod-openapi';

import {ApiErrorSchema} from '@lib/errors';
import {AppUser} from '@lib/models/app-user';
import {AppSecurityScopes} from '@lib/services/authorization';

import {createPrivateAppRoute} from '../utils/create-private-app-route';

const findUsersRoute = createPrivateAppRoute([AppSecurityScopes.READ_USERS])({
	method: 'get',
	path: '/',
	summary: 'Get all users',
	tags: ['Users'],
	request: {
		query: z.object({
			'username[like]': z.string().optional(),
			'email[like]': z.string().optional(),
			'tenant_id[eq]': z.string().optional(),
			'role[eq]': z.string().optional(), // TODO: check if this needs to changed to security group
			'is_blocked[eq]': z
				.string()
				.optional()
				.transform((value) => {
					if (value === undefined) {
						return undefined;
					}
					return !!value && value !== 'false' && value !== '0';
				}),
			'is_active[eq]': z
				.string()
				.optional()
				.transform((value) => {
					if (value === undefined) {
						return undefined;
					}

					return !!value && value !== 'false' && value !== '0';
				}),
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
						entries: z.array(AppUser.schema.AppUserDTOSchema),
						totalEntries: z.number(),
					}),
				},
			},
		},
		400: {
			description: 'Request validation Error',
			content: {
				'application/json': {
					schema: ApiErrorSchema,
				},
			},
		},
	},
});

const getUserRoute = createPrivateAppRoute([AppSecurityScopes.READ_USERS])({
	method: 'get',
	summary: 'Get a specific user by their id',
	tags: ['Users'],
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
					schema: AppUser.schema.AppUserDTOSchema,
				},
			},
		},
		400: {
			description: 'Request validation Error',
			content: {
				'application/json': {
					schema: ApiErrorSchema,
				},
			},
		},
	},
});

const getUserByEmailAddressRoute = createPrivateAppRoute([
	AppSecurityScopes.READ_USERS,
])({
	method: 'get',
	summary: 'Get a specific user by their email address',
	tags: ['Users'],
	path: '/email/{email}',
	request: {
		params: z.object({
			email: z.string(),
		}),
	},
	responses: {
		200: {
			description: 'Successful response',
			content: {
				'application/json': {
					schema: AppUser.schema.AppUserDTOSchema,
				},
			},
		},
		400: {
			description: 'Request validation Error',
			content: {
				'application/json': {
					schema: ApiErrorSchema,
				},
			},
		},
	},
});

const updateUserRoute = createPrivateAppRoute(
	[AppSecurityScopes.UPDATE_USERS],
	{
		canThrowBadRequest: true,
	}
)({
	method: 'put',
	summary: 'Update a user',
	tags: ['Users'],
	path: '/{id}',
	request: {
		params: z.object({
			id: z.string(),
		}),
		body: {
			content: {
				'application/json': {
					schema: AppUser.schema.AppUserUpdateDTOSchema,
				},
			},
		},
	},
	responses: {
		200: {
			description: 'Successful response',
			content: {
				'application/json': {
					schema: AppUser.schema.AppUserDTOSchema,
				},
			},
		},
	},
});

const createUserRoute = createPrivateAppRoute(
	[AppSecurityScopes.CREATE_USERS],
	{
		canThrowBadRequest: true,
	}
)({
	method: 'post',
	summary: 'Create a user',
	tags: ['Users'],
	path: '/',
	request: {
		body: {
			content: {
				'application/json': {
					schema: AppUser.schema.AppUserCreateDTOSchema,
				},
			},
		},
	},
	responses: {
		201: {
			description: 'Successful response',
			content: {
				'application/json': {
					schema: AppUser.schema.AppUserDTOSchema,
				},
			},
		},
	},
});

const addUserToLocationRoute = createPrivateAppRoute(
	[AppSecurityScopes.UPDATE_USERS],
	{
		canThrowBadRequest: true,
	}
)({
	method: 'post',
	summary: 'Add a user to a location',
	tags: ['Users'],
	path: '/{id}/location/{locationId}',
	request: {
		params: z.object({
			id: z.string(),
			locationId: z.string(),
		}),
	},
	responses: {
		204: {
			description: 'Successful response',
		},
	},
});

const removeUserFromLocationRoute = createPrivateAppRoute(
	[AppSecurityScopes.UPDATE_USERS],
	{
		canThrowBadRequest: true,
	}
)({
	method: 'delete',
	summary: 'Inactivate a user from a location',
	tags: ['Users'],
	path: '/{id}/location/{locationId}',
	request: {
		params: z.object({
			id: z.string(),
			locationId: z.string(),
		}),
	},
	responses: {
		204: {
			description: 'Successful response',
		},
	},
});

const inactivateUserRoute = createPrivateAppRoute(
	[AppSecurityScopes.UPDATE_USERS],
	{
		canThrowBadRequest: true,
	}
)({
	method: 'put',
	summary: 'Inactivate a user from a tenant',
	tags: ['Users'],
	path: '/{id}/inactivate',
	request: {
		params: z.object({
			id: z.string(),
		}),
	},
	responses: {
		204: {
			description: 'Successful response',
		},
	},
});

export {
	findUsersRoute,
	getUserRoute,
	getUserByEmailAddressRoute,
	updateUserRoute,
	createUserRoute,
	addUserToLocationRoute,
	removeUserFromLocationRoute,
	inactivateUserRoute,
};
