import {z} from '@hono/zod-openapi';

import {Machine} from '@lib/models/machine';
import {AppSecurityScopes} from '@lib/services/authorization';

import {createPrivateAppRoute} from '../utils/create-private-app-route';

const findMachinesRoute = createPrivateAppRoute(
	[AppSecurityScopes.READ_MACHINES],
	{
		canThrowBadRequest: true,
	}
)({
	method: 'get',
	summary: 'Get all machines',
	description:
		'Returns a list of all machines. A machine can be either a playfield or a cabinet depending on the game type.',
	path: '/',
	tags: ['Machines'],
	request: {
		query: z.object({
			'location_id[eq]': z.string().optional(),
			'location_id[in]': z.string().optional(),
			'tenant_id[eq]': z.string().optional(),
			'machine_name[like]': z.string().optional(),
			'external_id[like]': z.string().optional(),
			'category_id[eq]': z.string().optional(),
			'status[eq]': z.string().optional(),
			'gametype_id[eq]': z.string().optional(),
			limit: z.string(),
			offset: z.string(),
			order_by: z.string().optional(),
		}),
	},
	responses: {
		200: {
			description: 'Successful response',
			content: {
				'application/json': {
					schema: z.object({
						entries: z.array(Machine.schemas.DTOSchema),
						totalEntries: z.number(),
					}),
				},
			},
		},
	},
});

const createMachineRoute = createPrivateAppRoute(
	[AppSecurityScopes.CREATE_MACHINES],
	{
		canThrowBadRequest: true,
	}
)({
	method: 'post',
	summary: 'Create a new machine',
	tags: ['Machines'],
	path: '/',
	request: {
		body: {
			content: {
				'application/json': {
					schema: Machine.schemas.CreateDTOSchema,
				},
			},
		},
	},
	responses: {
		201: {
			description: 'Machine created',
			content: {
				'application/json': {
					schema: Machine.schemas.DTOSchema,
				},
			},
		},
	},
});

export {findMachinesRoute, createMachineRoute};
