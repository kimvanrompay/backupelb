import {OpenAPIHono} from '@hono/zod-openapi';

import {BadRequestError} from '@lib/errors';
import type {GameTypeStatsReport} from '@lib/models/gametype-stats-report';
import type {PlayfieldCategoryStatsReport} from '@lib/models/playfield-category-stats-report';
import type {PlayfieldStatsReportModel} from '@lib/models/playfield-stats-report';
import type {PrizeStatsReport} from '@lib/models/prize-stats-report';
import type {TenantLocationStatsReport} from '@lib/models/tenant-location-stats-report';
import type {TenantStatsReport} from '@lib/models/tenant-stats-report';
import {PlayfieldStatsRepository} from '@lib/repositories/playfield-stats';
import {PrizeRepository} from '@lib/repositories/prize';
import {StatisticsReportService} from '@lib/services/statistics-report';
import type {AuthenticatedAppContext} from '@lib/services/types';
import {defaultValidationHook} from '@lib/utils';

import {db} from '../database';
import type {AuthenticatedEnvironment} from '../types';
import {
	getGameTypeStatisticsRoute,
	getGlobalStatisticsRoute,
	getPlayfieldCategoryStatisticsRoute,
	getPlayfieldStatisticsRoute,
	getPrizeStatisticsRoute,
	getTenantLocationStatisticsRoute,
	getTenantStatisticsRoute,
} from './statistics.openapi';

const createStatisticsApi = () => {
	const app = new OpenAPIHono<AuthenticatedEnvironment>({
		strict: true,
		defaultHook: defaultValidationHook,
	});

	const createServices = (context: AuthenticatedAppContext) => {
		const playfieldStatsRepository = new PlayfieldStatsRepository(db, context);
		const prizeRepository = new PrizeRepository(db, context);

		const statisticsService = new StatisticsReportService(
			playfieldStatsRepository,
			prizeRepository,
			context
		);

		return {
			statisticsService,
		};
	};

	const validateDatesAndRange = (
		start_date: Date,
		end_date?: Date,
		range?: string
	) => {
		if (!end_date && !range) {
			throw new BadRequestError('End date or range is required');
		}

		if (end_date && range) {
			throw new BadRequestError('Both end date and range are not allowed');
		}

		if (start_date > (end_date || new Date())) {
			throw new BadRequestError('Start date cannot be after end date');
		}
	};

	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-expect-error
	app.openapi(getGlobalStatisticsRoute, async (ctx) => {
		const appContext = ctx.get('appContext');
		const {statisticsService} = createServices(appContext);

		const {start_date, end_date, range, unit} = ctx.req.valid('query');

		validateDatesAndRange(start_date, end_date, range);

		return ctx.notFound();
	});

	app.openapi(getPlayfieldStatisticsRoute, async (ctx) => {
		const appContext = ctx.get('appContext');
		const {statisticsService} = createServices(appContext);

		const {id} = ctx.req.valid('param');
		const {start_date, end_date, range, unit} = ctx.req.valid('query');

		validateDatesAndRange(start_date, end_date, range);

		const statistics = (await statisticsService.getStatisticsReport(
			id,
			'playfield',
			start_date,
			end_date,
			range,
			unit
		)) as PlayfieldStatsReportModel;

		return ctx.json(statistics.toJSON(), 200);
	});

	app.openapi(getTenantStatisticsRoute, async (ctx) => {
		const appContext = ctx.get('appContext');
		const {statisticsService} = createServices(appContext);

		const {id} = ctx.req.valid('param');
		const {start_date, end_date, range, unit} = ctx.req.valid('query');

		validateDatesAndRange(start_date, end_date, range);

		const statistics = (await statisticsService.getStatisticsReport(
			id,
			'tenant',
			start_date,
			end_date,
			range,
			unit
		)) as TenantStatsReport;

		return ctx.json(statistics.toJSON(), 200);
	});

	app.openapi(getTenantLocationStatisticsRoute, async (ctx) => {
		const appContext = ctx.get('appContext');
		const {statisticsService} = createServices(appContext);

		const {id} = ctx.req.valid('param');
		const {start_date, end_date, range, unit} = ctx.req.valid('query');

		validateDatesAndRange(start_date, end_date, range);

		const statistics = (await statisticsService.getStatisticsReport(
			id,
			'tenant_location',
			start_date,
			end_date,
			range,
			unit
		)) as TenantLocationStatsReport;

		return ctx.json(statistics.toJSON(), 200);
	});

	app.openapi(getGameTypeStatisticsRoute, async (ctx) => {
		const appContext = ctx.get('appContext');
		const {statisticsService} = createServices(appContext);

		const {id} = ctx.req.valid('param');
		const {start_date, end_date, range, unit} = ctx.req.valid('query');

		validateDatesAndRange(start_date, end_date, range);

		const statistics = (await statisticsService.getStatisticsReport(
			id,
			'gametype',
			start_date,
			end_date,
			range,
			unit
		)) as GameTypeStatsReport;

		return ctx.json(statistics.toJSON(), 200);
	});

	app.openapi(getPrizeStatisticsRoute, async (ctx) => {
		const appContext = ctx.get('appContext');
		const {statisticsService} = createServices(appContext);

		const {id} = ctx.req.valid('param');
		const {start_date, end_date, range, unit} = ctx.req.valid('query');

		validateDatesAndRange(start_date, end_date, range);

		const statistics = (await statisticsService.getStatisticsReport(
			id,
			'prize',
			start_date,
			end_date,
			range,
			unit
		)) as PrizeStatsReport;

		return ctx.json(statistics.toJSON(), 200);
	});

	app.openapi(getPlayfieldCategoryStatisticsRoute, async (ctx) => {
		const appContext = ctx.get('appContext');
		const {statisticsService} = createServices(appContext);

		const {id} = ctx.req.valid('param');
		const {start_date, end_date, range, unit} = ctx.req.valid('query');

		validateDatesAndRange(start_date, end_date, range);

		const statistics = (await statisticsService.getStatisticsReport(
			id,
			'playfield_category',
			start_date,
			end_date,
			range,
			unit
		)) as PlayfieldCategoryStatsReport;

		return ctx.json(statistics.toJSON(), 200);
	});

	return app;
};

export {createStatisticsApi};
