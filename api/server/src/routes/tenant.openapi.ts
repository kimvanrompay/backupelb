import {z} from '@hono/zod-openapi';

import {Tenant} from '@lib/models/tenant';
import {AppSecurityScopes} from '@lib/services/authorization';

import {createPrivateAppRoute} from '../utils/create-private-app-route';

const getTenantByIdRoute = createPrivateAppRoute([], {
	canThrowBadRequest: true,
})({
	summary: 'Get a specific tenant by its id',
	tags: ['Tenants'],
	method: 'get',
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
					schema: Tenant.schemas.tenantDTOSchema,
				},
			},
		},
	},
});

const findTenantsRoute = createPrivateAppRoute(
	[AppSecurityScopes.READ_TENANTS],
	{
		canThrowBadRequest: true,
	}
)({
	summary: 'Get a paginated list of tenants',
	tags: ['Tenants'],
	method: 'get',
	path: '/',
	request: {
		query: z.object({
			limit: z.coerce.number().min(1).max(1000),
			offset: z.coerce.number().min(0),
			order_by: z.string().optional(),
			'name[like]': z.string().optional(),
		}),
	},
	responses: {
		200: {
			description: 'Successful response',
			content: {
				'application/json': {
					schema: z.object({
						entries: z.array(Tenant.schemas.tenantDTOSchema),
						totalEntries: z.number(),
					}),
				},
			},
		},
	},
});

const createTenantRoute = createPrivateAppRoute(
	[AppSecurityScopes.CREATE_TENANTS],
	{
		canThrowBadRequest: true,
	}
)({
	summary: 'Create a new tenant',
	tags: ['Tenants'],
	method: 'post',
	path: '/',
	request: {
		body: {
			content: {
				'application/json': {
					schema: Tenant.schemas.tenantCreateDTOSchema,
				},
			},
		},
	},
	responses: {
		201: {
			description: 'Successful response',
			content: {
				'application/json': {
					schema: Tenant.schemas.tenantDTOSchema,
				},
			},
		},
	},
});

const updateTenantRoute = createPrivateAppRoute(
	[AppSecurityScopes.UPDATE_TENANTS],
	{
		canThrowBadRequest: true,
	}
)({
	summary: 'Update a tenant',
	tags: ['Tenants'],
	method: 'put',
	path: '/{id}',
	request: {
		params: z.object({
			id: z.string(),
		}),
		body: {
			content: {
				'application/json': {
					schema: Tenant.schemas.tenantUpdateDTOSchema,
				},
			},
		},
	},
	responses: {
		200: {
			description: 'Successful response',
			content: {
				'application/json': {
					schema: Tenant.schemas.tenantDTOSchema,
				},
			},
		},
	},
});

export {
	getTenantByIdRoute,
	findTenantsRoute,
	createTenantRoute,
	updateTenantRoute,
};
