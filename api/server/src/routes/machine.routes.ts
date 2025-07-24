import {OpenAPIHono} from '@hono/zod-openapi';

import {CabinetRepository} from '@lib/repositories/cabinet';
import {MachineRepository} from '@lib/repositories/machine';
import {PlayfieldRepository} from '@lib/repositories/playfield';
import {MachineService} from '@lib/services/machine';
import {type AuthenticatedAppContext} from '@lib/services/types';
import {defaultValidationHook} from '@lib/utils';
import type {PaginatedDatabaseQueryFilters} from '@lib/utils/db/filters';
import {renameProperties} from '@lib/utils/object';
import {parseQueryParamsToDatabaseFilters} from '@lib/utils/query-params';

import {db} from '../database';
import type {AuthenticatedEnvironment} from '../types';
import {createMachineRoute, findMachinesRoute} from './machine.openapi';

const createMachineApi = () => {
	const machinesApp = new OpenAPIHono<AuthenticatedEnvironment>({
		strict: true,
		defaultHook: defaultValidationHook,
	});

	const createServices = (context: AuthenticatedAppContext) => {
		const playfieldRepository = new PlayfieldRepository(db, context);
		const cabinetRepository = new CabinetRepository(db, context);
		const machineRepository = new MachineRepository(
			db,
			playfieldRepository,
			context
		);

		const machineService = new MachineService(
			machineRepository,
			playfieldRepository,
			cabinetRepository,
			context
		);

		return {machineService};
	};

	machinesApp.openapi(findMachinesRoute, async (ctx) => {
		const queryParams = ctx.req.valid('query');
		const appContext = ctx.get('appContext');

		const {machineService} = createServices(appContext);

		// TODO: possibly rename some filters

		const renamedQueryParams = renameProperties(queryParams, {
			'location_id[eq]': 'cabinet.tenant_location_id[eq]',
			'location_id[in]': 'cabinet.tenant_location_id[in]',
			'tenant_id[eq]': 'cabinet.tenant_id[eq]',
			'external_id[like]': 'playfield.external_id[like]',
			'category_id[eq]': 'playfield.category_id[eq]',
			'gametype_id[eq]': 'playfield.gametype_id[eq]',
			'machine_name[like]': 'playfield.name[like]', // TODO: this should also work for cabinets in the future
			'status[eq]': 'playfield.status[eq]', // TODO: this should also work for cabinets in the future
		}) as typeof queryParams;

		const filters = parseQueryParamsToDatabaseFilters(renamedQueryParams);

		const data = await machineService.findPaginatedMachines(
			filters as PaginatedDatabaseQueryFilters
		);

		const machineDTOs = data.entries.map((machine) => machine.toJSON());

		return ctx.json(
			{
				entries: machineDTOs,
				totalEntries: data.totalEntries,
			},
			200
		);
	});

	machinesApp.openapi(createMachineRoute, async (ctx) => {
		const appContext = ctx.get('appContext');
		const machineData = ctx.req.valid('json');

		const {machineService} = createServices(appContext);

		const machine = await machineService.createMachine(machineData);

		const machineDTO = machine.toJSON();

		return ctx.json(machineDTO, 201);
	});

	return machinesApp;
};

export {createMachineApi};
