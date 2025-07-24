import {z} from '@hono/zod-openapi';

import {GameSession} from '@lib/models/game-session';
import {MachineLog} from '@lib/models/machine-log';
import {Playfield} from '@lib/models/playfield';
import {PlayfieldStatsReportModel} from '@lib/models/playfield-stats-report';
import {AppSecurityScopes} from '@lib/services/authorization';

import {createPrivateAppRoute} from '../utils/create-private-app-route';

const getPlayfieldRoute = createPrivateAppRoute(
	[AppSecurityScopes.READ_MACHINES],
	{
		canThrowBadRequest: true,
	}
)({
	method: 'get',
	summary: 'Get a specific playfield by its id',
	tags: ['Machines'],
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
					schema: Playfield.schemas.DTOSchema,
				},
			},
		},
	},
});

const findPlayfieldsRoute = createPrivateAppRoute(
	[AppSecurityScopes.READ_MACHINES],
	{
		canThrowBadRequest: true,
	}
)({
	method: 'get',
	summary: 'Get all playfields',
	tags: ['Machines'],
	path: '/',
	request: {
		query: z.object({
			'external_id[like]': z.string().optional(),
			'name[like]': z.string().optional(),
			'serial_number[like]': z.string().optional(),
			limit: z.coerce.number().min(1).optional(),
			offset: z.coerce.number().min(0).optional(),
			order_by: z.string().optional(),
		}),
	},
	responses: {
		200: {
			description: 'Successful response',
			content: {
				'application/json': {
					schema: z.array(
						z.object({
							id: z.string(),
							name: z.string(),
							status: z.string(),
						})
					),
				},
			},
		},
	},
});

const findPlayfieldGameSessionsRoute = createPrivateAppRoute(
	[AppSecurityScopes.READ_MACHINES, AppSecurityScopes.READ_GAMESESSIONS],
	{
		canThrowBadRequest: true,
	}
)({
	method: 'get',
	summary: 'Get recent games for a playfield',
	path: '/{id}/sessions',
	tags: ['Machines'],
	request: {
		params: z.object({
			id: z.string(),
		}),
		query: z.object({
			limit: z.coerce.number().min(1).max(100),
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
						entries: z.array(GameSession.schemas.DTOSchema),
						totalEntries: z.number(),
					}),
				},
			},
		},
	},
});

const findPlayfieldLogsRoute = createPrivateAppRoute(
	[AppSecurityScopes.READ_MACHINES],
	{
		canThrowBadRequest: true,
	}
)({
	method: 'get',
	summary: 'Get playfield logs',
	tags: ['Machines'],
	path: '/{id}/logs',
	request: {
		params: z.object({
			id: z.string(),
		}),
		query: z.object({
			'level[eq]': z.string().optional(),
			'type[eq]': z.string().optional(),
			limit: z.coerce.number().min(1).max(100),
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
						entries: z.array(MachineLog.schemas.DTOSchema),
						totalEntries: z.number(),
					}),
				},
			},
		},
	},
});

const updatePlayfieldPrizeRoute = createPrivateAppRoute(
	[AppSecurityScopes.UPDATE_MACHINES],
	{
		canThrowBadRequest: true,
	}
)({
	method: 'put',
	summary: 'Update playfield prize',
	tags: ['Machines', 'Prizes'],
	path: '/{id}/prize',
	request: {
		params: z.object({
			id: z.string(),
		}),
		body: {
			content: {
				'application/json': {
					schema: z.object({
						prizeId: z.string().nullable(),
					}),
				},
			},
		},
	},
	responses: {
		200: {
			description: 'Successful response',
			content: {
				'application/json': {
					schema: Playfield.schemas.DTOSchema,
				},
			},
		},
	},
});

const updatePlayfieldCategoryRoute = createPrivateAppRoute(
	[AppSecurityScopes.UPDATE_MACHINES],
	{
		canThrowBadRequest: true,
	}
)({
	method: 'put',
	summary: 'Update playfield category',
	tags: ['Machines', 'Playfield Categories'],
	path: '/{id}/category',
	request: {
		params: z.object({
			id: z.string(),
		}),
		body: {
			content: {
				'application/json': {
					schema: z.object({
						categoryId: z.string().optional().nullable(),
					}),
				},
			},
		},
	},
	responses: {
		200: {
			description: 'Successful response',
			content: {
				'application/json': {
					schema: Playfield.schemas.DTOSchema,
				},
			},
		},
	},
});

const updatePlayfieldRoute = createPrivateAppRoute(
	[AppSecurityScopes.UPDATE_MACHINES],
	{
		canThrowBadRequest: true,
	}
)({
	method: 'put',
	summary: 'Update a playfield',
	tags: ['Machines'],
	path: '/{id}',
	request: {
		params: z.object({
			id: z.string(),
		}),
		body: {
			content: {
				'application/json': {
					schema: Playfield.schemas.UpdateDTOSchema,
				},
			},
		},
	},
	responses: {
		200: {
			description: 'Successful response',
			content: {
				'application/json': {
					schema: Playfield.schemas.DTOSchema,
				},
			},
		},
	},
});

export {
	getPlayfieldRoute,
	findPlayfieldsRoute,
	findPlayfieldGameSessionsRoute,
	findPlayfieldLogsRoute,
	updatePlayfieldPrizeRoute,
	updatePlayfieldRoute,
	updatePlayfieldCategoryRoute,
};
