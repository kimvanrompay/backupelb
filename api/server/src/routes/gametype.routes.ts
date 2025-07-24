import {OpenAPIHono} from '@hono/zod-openapi';

import {NotFoundError} from '@lib/errors';
import {GametypeRepository} from '@lib/repositories/gametype';
import {GametypeService} from '@lib/services/gametype';
import {defaultValidationHook} from '@lib/utils';
import type {PaginatedDatabaseQueryFilters} from '@lib/utils/db/filters';
import {parseQueryParamsToDatabaseFilters} from '@lib/utils/query-params';

import {db} from '../database';
import type {AuthenticatedEnvironment} from '../types';
import {
	createGametypeRoute,
	findGametypesRoute,
	getGametypeRoute,
	updateGametypeRoute,
} from './gametype.openapi';

const createGametypeApi = () => {
	const app = new OpenAPIHono<AuthenticatedEnvironment>({
		strict: true,
		defaultHook: defaultValidationHook,
	});

	app.openapi(findGametypesRoute, async (ctx) => {
		const appContext = ctx.get('appContext');

		const gametypeRepository = new GametypeRepository(db, appContext);
		const gametypeService = new GametypeService(gametypeRepository, appContext);

		const queryParams = ctx.req.valid('query');

		const filters = parseQueryParamsToDatabaseFilters(
			queryParams
		) as PaginatedDatabaseQueryFilters;

		const gametypes = await gametypeService.findPaginatedGametypes(filters);

		const gametypeDTOs = gametypes.entries.map((gametype) => gametype.toJSON());

		return ctx.json(
			{
				entries: gametypeDTOs,
				totalEntries: gametypes.totalEntries,
			},
			200
		);
	});

	app.openapi(getGametypeRoute, async (ctx) => {
		const appContext = ctx.get('appContext');
		const {id} = ctx.req.valid('param');

		const gametypeRepository = new GametypeRepository(db, appContext);
		const gametypeService = new GametypeService(gametypeRepository, appContext);

		const gametype = await gametypeService.getGametypeById(id);

		if (!gametype) {
			throw new NotFoundError('Cannot find game type');
		}

		return ctx.json(gametype.toJSON(), 200);
	});

	app.openapi(createGametypeRoute, async (ctx) => {
		const appContext = ctx.get('appContext');
		const body = ctx.req.valid('json');

		const gametypeRepository = new GametypeRepository(db, appContext);
		const gametypeService = new GametypeService(gametypeRepository, appContext);

		const gametype = await gametypeService.createGametype(body);

		return ctx.json(gametype.toJSON(), 201);
	});

	app.openapi(updateGametypeRoute, async (ctx) => {
		const appContext = ctx.get('appContext');
		const {id} = ctx.req.valid('param');
		const body = ctx.req.valid('json');

		const gametypeRepository = new GametypeRepository(db, appContext);
		const gametypeService = new GametypeService(gametypeRepository, appContext);

		const gametype = await gametypeService.updateGametype(id, body);

		return ctx.json(gametype.toJSON(), 200);
	});

	return app;
};

export {createGametypeApi};
