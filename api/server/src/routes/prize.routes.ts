import {OpenAPIHono} from '@hono/zod-openapi';

import {NotFoundError} from '@lib/errors';
import {PrizeRepository} from '@lib/repositories/prize';
import {PrizeService} from '@lib/services/prize';
import type {AuthenticatedAppContext} from '@lib/services/types';
import {defaultValidationHook} from '@lib/utils';
import type {PaginatedDatabaseQueryFilters} from '@lib/utils/db/filters';
import {renameProperties} from '@lib/utils/object';
import {parseQueryParamsToDatabaseFilters} from '@lib/utils/query-params';

import {db} from '../database';
import type {AuthenticatedEnvironment} from '../types';
import {
	createPrizeRoute,
	findPrizesRoute,
	getPrizeRoute,
	updatePrizeRoute,
} from './prize.openapi';

const createPrizeApi = () => {
	const app = new OpenAPIHono<AuthenticatedEnvironment>({
		strict: true,
		defaultHook: defaultValidationHook,
	});

	const createServices = (context: AuthenticatedAppContext) => {
		const prizeRepository = new PrizeRepository(db, context);
		const prizeService = new PrizeService(prizeRepository, context);

		return {
			prizeService,
		};
	};

	app.openapi(findPrizesRoute, async (ctx) => {
		const queryParams = ctx.req.valid('query');
		const appContext = ctx.get('appContext');
		const {prizeService} = createServices(appContext);

		const renamedQueryParams = renameProperties(queryParams, {
			'name[like]': 'prize.name[like]',
		}) as typeof queryParams;

		const filters = parseQueryParamsToDatabaseFilters(
			renamedQueryParams
		) as PaginatedDatabaseQueryFilters;

		const prizes = await prizeService.findPaginatedPrizes(filters);

		return ctx.json(prizes, 200);
	});

	app.openapi(getPrizeRoute, async (ctx) => {
		const appContext = ctx.get('appContext');
		const {prizeService} = createServices(appContext);

		const {id} = ctx.req.valid('param');

		const prize = await prizeService.getPrizeById(id);

		if (!prize) {
			throw new NotFoundError(`Prize with id ${id} not found`);
		}

		return ctx.json(prize.toJSON(), 200);
	});

	app.openapi(updatePrizeRoute, async (ctx) => {
		const appContext = ctx.get('appContext');
		const {prizeService} = createServices(appContext);

		const {id} = ctx.req.valid('param');
		const prizeData = ctx.req.valid('json');

		const updatedPrize = await prizeService.updatePrize(id, prizeData);

		if (!updatedPrize) {
			throw new NotFoundError(`Prize with id ${id} not found`);
		}

		return ctx.json(updatedPrize.toJSON(), 200);
	});

	app.openapi(createPrizeRoute, async (ctx) => {
		const appContext = ctx.get('appContext');
		const {prizeService} = createServices(appContext);

		const prizeData = ctx.req.valid('json');

		const createdPrize = await prizeService.createPrize(prizeData);

		return ctx.json(createdPrize.toJSON(), 201);
	});

	return app;
};

export {createPrizeApi};
