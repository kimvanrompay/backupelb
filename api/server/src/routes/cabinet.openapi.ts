import {z} from '@hono/zod-openapi';

import {Cabinet} from '@lib/models/cabinet';
import {AppSecurityScopes} from '@lib/services/authorization';

import {createPrivateAppRoute} from '../utils/create-private-app-route';

const findCabinetsRoute = createPrivateAppRoute(
	[AppSecurityScopes.READ_MACHINES],
	{
		canThrowBadRequest: true,
	}
)({
	method: 'get',
	summary: 'Get all cabinets',
	tags: ['Machines'],
	path: '/',
	request: {
		query: z.object({
			'name[like]': z.string().optional(),
			'serial_number[like]': z.string().optional(),
			limit: z.string().optional(),
			offset: z.string().optional(),
			order_by: z.string().optional(),
		}),
	},
	responses: {
		200: {
			description: 'Successful response',
			content: {
				'application/json': {
					schema: z.array(Cabinet.schemas.DTOSchema),
				},
			},
		},
	},
});

const getCabinetRoute = createPrivateAppRoute(
	[AppSecurityScopes.READ_MACHINES],
	{
		canThrowBadRequest: true,
	}
)({
	method: 'get',
	summary: 'Get a specific cabinet by its serial number',
	tags: ['Machines'],
	path: '/{serialNumber}',
	request: {
		params: z.object({
			serialNumber: z.string(),
		}),
	},
	responses: {
		200: {
			description: 'Successful response',
			content: {
				'application/json': {
					schema: Cabinet.schemas.DTOSchema,
				},
			},
		},
	},
});

export {findCabinetsRoute, getCabinetRoute};
