import {z} from '@hono/zod-openapi';

import {GameTypeStatsReport} from '@lib/models/gametype-stats-report';
import {PlayfieldCategory} from '@lib/models/playfield-category';
import {PlayfieldCategoryStatsReport} from '@lib/models/playfield-category-stats-report';
import {PlayfieldStatsReportModel} from '@lib/models/playfield-stats-report';
import {PrizeStatsReport} from '@lib/models/prize-stats-report';
import {TenantLocationStatsReport} from '@lib/models/tenant-location-stats-report';
import {TenantStatsReport} from '@lib/models/tenant-stats-report';

import {createPrivateAppRoute} from '../utils/create-private-app-route';

const getGlobalStatisticsRoute = createPrivateAppRoute([], {
	canThrowBadRequest: true,
})({
	summary: 'Get statistics for the current tenant',
	tags: ['Statistics'],
	method: 'get',
	path: `/global`,
	request: {
		params: z.object({
			entity: z.enum(['playfield', 'gametype', 'tenant', 'tenant_location']),
			id: z.string(),
		}),
		query: z.object({
			start_date: z.coerce.date(),
			end_date: z.coerce.date().optional(),
			// preset: z.enum(['today', 'last_24_hours', 'last_7_days', 'last_30_days']),
			range: z.enum(['WEEK', 'MONTH', 'YEAR', 'DAY']).optional(),
			unit: z.enum(['HOUR', 'DAY', 'WEEK', 'MONTH']),
		}),
	},
	responses: {
		200: {
			description: 'Successful response',
			content: {
				'application/json': {
					schema: z.unknown(), // TODO
				},
			},
		},
	},
});

const getPlayfieldStatisticsRoute = createPrivateAppRoute([], {
	canThrowBadRequest: true,
})({
	summary: 'Get statistics for a specific playfield',
	tags: ['Statistics'],
	method: 'get',
	path: '/playfield/{id}',
	request: {
		params: z.object({
			id: z.string(),
		}),
		query: z.object({
			start_date: z.coerce.date(),
			end_date: z.coerce.date().optional(),
			range: z.enum(['WEEK', 'MONTH', 'YEAR', 'DAY']).optional(),
			unit: z.enum(['HOUR', 'DAY', 'WEEK', 'MONTH']),
		}),
	},
	responses: {
		200: {
			description: 'Successful response',
			content: {
				'application/json': {
					schema: PlayfieldStatsReportModel.schemas.DTOSchema,
				},
			},
		},
	},
});

const getTenantStatisticsRoute = createPrivateAppRoute([], {
	canThrowBadRequest: true,
})({
	summary: 'Get statistics for a specific tenant',
	tags: ['Statistics'],
	method: 'get',
	path: '/tenant/{id}',
	request: {
		params: z.object({
			id: z.string(),
		}),
		query: z.object({
			start_date: z.coerce.date(),
			end_date: z.coerce.date().optional(),
			range: z.enum(['WEEK', 'MONTH', 'YEAR', 'DAY']).optional(),
			unit: z.enum(['HOUR', 'DAY', 'WEEK', 'MONTH']),
		}),
	},
	responses: {
		200: {
			description: 'Successful response',
			content: {
				'application/json': {
					schema: TenantStatsReport.schemas.DTOSchema,
				},
			},
		},
	},
});

const getTenantLocationStatisticsRoute = createPrivateAppRoute([], {
	canThrowBadRequest: true,
})({
	summary: 'Get statistics for a specific tenant location',
	tags: ['Statistics'],
	method: 'get',
	path: '/tenant_location/{id}',
	request: {
		params: z.object({
			id: z.string(),
		}),
		query: z.object({
			start_date: z.coerce.date(),
			end_date: z.coerce.date().optional(),
			range: z.enum(['WEEK', 'MONTH', 'YEAR', 'DAY']).optional(),
			unit: z.enum(['HOUR', 'DAY', 'WEEK', 'MONTH']),
		}),
	},
	responses: {
		200: {
			description: 'Successful response',
			content: {
				'application/json': {
					schema: TenantLocationStatsReport.schemas.DTOSchema, // TODO
				},
			},
		},
	},
});

const getGameTypeStatisticsRoute = createPrivateAppRoute([], {
	canThrowBadRequest: true,
})({
	summary: 'Get statistics for a specific game type',
	tags: ['Statistics'],
	method: 'get',
	path: '/gametype/{id}',
	request: {
		params: z.object({
			id: z.string(),
		}),
		query: z.object({
			start_date: z.coerce.date(),
			end_date: z.coerce.date().optional(),
			range: z.enum(['WEEK', 'MONTH', 'YEAR', 'DAY']).optional(),
			unit: z.enum(['HOUR', 'DAY', 'WEEK', 'MONTH']),
		}),
	},
	responses: {
		200: {
			description: 'Successful response',
			content: {
				'application/json': {
					schema: GameTypeStatsReport.schemas.DTOSchema, // TODO
				},
			},
		},
	},
});

const getPrizeStatisticsRoute = createPrivateAppRoute([], {
	canThrowBadRequest: true,
})({
	summary: 'Get statistics for a specific prize',
	tags: ['Statistics'],
	method: 'get',
	path: '/prize/{id}',
	request: {
		params: z.object({
			id: z.string(),
		}),
		query: z.object({
			start_date: z.coerce.date(),
			end_date: z.coerce.date().optional(),
			range: z.enum(['WEEK', 'MONTH', 'YEAR', 'DAY']).optional(),
			unit: z.enum(['HOUR', 'DAY', 'WEEK', 'MONTH']),
		}),
	},
	responses: {
		200: {
			description: 'Successful response',
			content: {
				'application/json': {
					schema: PrizeStatsReport.schema.DTOSchema,
				},
			},
		},
	},
});

const getPlayfieldCategoryStatisticsRoute = createPrivateAppRoute([], {
	canThrowBadRequest: true,
})({
	summary: 'Get statistics for a specific playfield category',
	tags: ['Statistics'],
	method: 'get',
	path: '/playfield_category/{id}',
	request: {
		params: z.object({
			id: z.string(),
		}),
		query: z.object({
			start_date: z.coerce.date(),
			end_date: z.coerce.date().optional(),
			range: z.enum(['WEEK', 'MONTH', 'YEAR', 'DAY']).optional(),
			unit: z.enum(['HOUR', 'DAY', 'WEEK', 'MONTH']),
		}),
	},
	responses: {
		200: {
			description: 'Successful response',
			content: {
				'application/json': {
					schema: PlayfieldCategoryStatsReport.schemas.DTOSchema,
				},
			},
		},
	},
});

export {
	getGlobalStatisticsRoute,
	getPlayfieldStatisticsRoute,
	getTenantStatisticsRoute,
	getTenantLocationStatisticsRoute,
	getGameTypeStatisticsRoute,
	getPrizeStatisticsRoute,
	getPlayfieldCategoryStatisticsRoute,
};
