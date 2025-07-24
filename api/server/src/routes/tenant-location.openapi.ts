import {z} from '@hono/zod-openapi';

import {TenantLocation} from '@lib/models/tenant-location';
import {AppSecurityScopes} from '@lib/services/authorization';

import {createPrivateAppRoute} from '../utils/create-private-app-route';

const findTenantLocationsRoute = createPrivateAppRoute(
	[AppSecurityScopes.READ_TENANT_LOCATIONS],
	{
		canThrowBadRequest: true,
	}
)({
	method: 'get',
	summary: 'Get all tenant locations',
	path: '/',
	tags: ['Tenant Locations'],
	request: {
		query: z.object({
			'tenant_id[eq]': z.string().optional(),
			'name[like]': z.string().optional(),
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
						entries: z.array(TenantLocation.schemas.TenantLocationDTOSchema),
						totalEntries: z.number(),
					}),
				},
			},
		},
	},
});

const getTenantLocationRoute = createPrivateAppRoute(
	[AppSecurityScopes.READ_TENANT_LOCATIONS],
	{
		canThrowBadRequest: true,
	}
)({
	method: 'get',
	summary: 'Get a specific tenant location by its id',
	tags: ['Tenant Locations'],
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
					schema: TenantLocation.schemas.TenantLocationDTOSchema,
				},
			},
		},
	},
});

const createTenantLocationRoute = createPrivateAppRoute(
	[AppSecurityScopes.CREATE_TENANT_LOCATIONS],
	{
		canThrowBadRequest: true,
	}
)({
	method: 'post',
	summary: 'Create a new tenant location',
	tags: ['Tenant Locations'],
	path: '/',
	request: {
		body: {
			content: {
				'application/json': {
					schema: TenantLocation.schemas.TenantLocationCreateDTOSchema,
				},
			},
		},
	},
	responses: {
		201: {
			description: 'Successful response',
			content: {
				'application/json': {
					schema: TenantLocation.schemas.TenantLocationDTOSchema,
				},
			},
		},
	},
});

const updateTenantLocationRoute = createPrivateAppRoute(
	[AppSecurityScopes.UPDATE_TENANT_LOCATIONS],
	{
		canThrowBadRequest: true,
	}
)({
	method: 'put',
	summary: 'Update a tenant location',
	tags: ['Tenant Locations'],
	path: '/{id}',
	request: {
		params: z.object({
			id: z.string(),
		}),
		body: {
			content: {
				'application/json': {
					schema: TenantLocation.schemas.TenantLocationUpdateDTOSchema,
				},
			},
		},
	},
	responses: {
		200: {
			description: 'Successful response',
			content: {
				'application/json': {
					schema: TenantLocation.schemas.TenantLocationDTOSchema,
				},
			},
		},
	},
});

const inactivateTenantLocationRoute = createPrivateAppRoute(
	[AppSecurityScopes.DELETE_TENANT_LOCATIONS],
	{
		canThrowBadRequest: true,
	}
)({
	method: 'put',
	summary: 'Inactivate a tenant location',
	tags: ['Tenant Locations'],
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
	findTenantLocationsRoute,
	getTenantLocationRoute,
	createTenantLocationRoute,
	updateTenantLocationRoute,
	inactivateTenantLocationRoute,
};
