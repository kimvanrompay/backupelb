import {OpenAPIHono} from '@hono/zod-openapi';

import {NotFoundError} from '@lib/errors';
import {CabinetRepository} from '@lib/repositories/cabinet';
import {CabinetService} from '@lib/services/cabinet';
import type {AuthenticatedAppContext} from '@lib/services/types';
import {defaultValidationHook} from '@lib/utils';
import {renameProperties} from '@lib/utils/object';
import {parseQueryParamsToDatabaseFilters} from '@lib/utils/query-params';

import {db} from '../database';
import type {AuthenticatedEnvironment} from '../types';
import {findCabinetsRoute, getCabinetRoute} from './cabinet.openapi';

const createCabinetApi = () => {
	const app = new OpenAPIHono<AuthenticatedEnvironment>({
		strict: true,
		defaultHook: defaultValidationHook,
	});

	const createServices = (context: AuthenticatedAppContext) => {
		const cabinetRepository = new CabinetRepository(db, context);
		const cabinetService = new CabinetService(cabinetRepository, context);

		return {
			cabinetService,
		};
	};

	app.openapi(findCabinetsRoute, async (ctx) => {
		const queryParams = ctx.req.valid('query');
		const appContext = ctx.get('appContext');

		const {cabinetService} = createServices(appContext);

		const renamedQueryParams = renameProperties(queryParams, {
			'serial_number[like]': 'cabinet.serial_number[like]',
			'name[like]': 'cabinet.name[like]',
		}) as typeof queryParams;

		const filters = parseQueryParamsToDatabaseFilters(renamedQueryParams);

		const cabinets = await cabinetService.findCabinets(filters);

		const cabinetDTOs = cabinets.map((cabinet) => cabinet.toJSON());

		return ctx.json(cabinetDTOs, 200);
	});

	app.openapi(getCabinetRoute, async (ctx) => {
		const appContext = ctx.get('appContext');
		const {serialNumber} = ctx.req.valid('param');

		const {cabinetService} = createServices(appContext);
		const cabinet = await cabinetService.getCabinetBySerial(serialNumber);

		if (!cabinet) {
			throw new NotFoundError('Cannot find cabinet');
		}

		return ctx.json(cabinet.toJSON(), 200);
	});

	return app;
};

export {createCabinetApi};
