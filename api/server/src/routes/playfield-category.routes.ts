import {OpenAPIHono} from '@hono/zod-openapi';

import {PlayfieldCategoryRepository} from '@lib/repositories/playfield-category';
import {PlayfieldCategoryService} from '@lib/services/playfield-category';
import type {AuthenticatedAppContext} from '@lib/services/types';
import {defaultValidationHook} from '@lib/utils';
import type {PaginatedDatabaseQueryFilters} from '@lib/utils/db/filters';
import {renameProperties} from '@lib/utils/object';
import {parseQueryParamsToDatabaseFilters} from '@lib/utils/query-params';

import {db} from '../database';
import {
	createPlayfieldCategoryRoute,
	deletePlayfieldCategoryRoute,
	findPlayfieldCategoriesRoute,
	getPlayfieldCategoryRoute,
	updatePlayfieldCategoryRoute,
} from './playfield-category.openapi';

const createPlayfieldCategoriesApi = () => {
	const app = new OpenAPIHono({
		strict: true,
		defaultHook: defaultValidationHook,
	});

	const createServices = (context: AuthenticatedAppContext) => {
		const playfieldCategoriesRepository = new PlayfieldCategoryRepository(db, {
			logger: context.logger,
		});

		const playfieldCategoryService = new PlayfieldCategoryService(
			playfieldCategoriesRepository,
			context
		);

		return {
			playfieldCategoryService,
		};
	};

	app.openapi(findPlayfieldCategoriesRoute, async (ctx) => {
		const queryParams = ctx.req.valid('query');
		const appContext = ctx.get('appContext');
		const {playfieldCategoryService} = createServices(appContext);

		const renamedQueryParams = renameProperties(queryParams, {
			'name[like]': 'playfield_category.name[like]',
		}) as typeof queryParams;

		const filters = parseQueryParamsToDatabaseFilters(
			renamedQueryParams
		) as PaginatedDatabaseQueryFilters;

		const playfieldCategories =
			await playfieldCategoryService.findPlayfieldCategories(filters);

		return ctx.json(
			{
				entries: playfieldCategories.entries.map((playfieldCategory) =>
					playfieldCategory.toJSON()
				),
				totalEntries: playfieldCategories.totalEntries,
			},
			200
		);
	});

	app.openapi(getPlayfieldCategoryRoute, async (ctx) => {
		const appContext = ctx.get('appContext');
		const {playfieldCategoryService} = createServices(appContext);

		const {id} = ctx.req.valid('param');

		const playfieldCategory =
			await playfieldCategoryService.getPlayfieldCategoryById(id);

		return ctx.json(playfieldCategory.toJSON(), 200);
	});

	app.openapi(createPlayfieldCategoryRoute, async (ctx) => {
		const appContext = ctx.get('appContext');
		const {playfieldCategoryService} = createServices(appContext);

		const playfieldCategoryCreateDTO = ctx.req.valid('json');

		const playfieldCategory =
			await playfieldCategoryService.createPlayfieldCategory(
				playfieldCategoryCreateDTO
			);

		return ctx.json(playfieldCategory.toJSON(), 201);
	});

	app.openapi(updatePlayfieldCategoryRoute, async (ctx) => {
		const appContext = ctx.get('appContext');
		const {playfieldCategoryService} = createServices(appContext);

		const {id} = ctx.req.valid('param');
		const playfieldCategoryUpdateDTO = ctx.req.valid('json');

		const updatedPlayfieldCategory =
			await playfieldCategoryService.updatePlayfieldCategory(
				id,
				playfieldCategoryUpdateDTO
			);

		if (!updatedPlayfieldCategory) {
			throw new Error(`Playfield category with id ${id} not found`);
		}

		return ctx.json(updatedPlayfieldCategory.toJSON(), 200);
	});

	app.openapi(deletePlayfieldCategoryRoute, async (ctx) => {
		const appContext = ctx.get('appContext');
		const {playfieldCategoryService} = createServices(appContext);

		const {id} = ctx.req.valid('param');

		await playfieldCategoryService.deletePlayfieldCategory(id);

		return ctx.newResponse(null, 204);
	});

	return app;
};

export {createPlayfieldCategoriesApi};
