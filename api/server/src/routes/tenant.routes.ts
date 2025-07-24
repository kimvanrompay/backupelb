import {OpenAPIHono} from '@hono/zod-openapi';

import {NotFoundError} from '@lib/errors';
import {TenantRepository} from '@lib/repositories/tenant';
import {TenantService} from '@lib/services/tenant';
import type {AuthenticatedAppContext} from '@lib/services/types';
import {defaultValidationHook} from '@lib/utils';
import type {PaginatedDatabaseQueryFilters} from '@lib/utils/db/filters';
import {parseQueryParamsToDatabaseFilters} from '@lib/utils/query-params';

import {db} from '../database';
import type {AuthenticatedEnvironment} from '../types';
import {
	findTenantsRoute,
	getTenantByIdRoute,
	updateTenantRoute,
} from './tenant.openapi';

const createTenantApi = () => {
	const createServices = (context: AuthenticatedAppContext) => {
		const tenantRepository = new TenantRepository(db, context);
		const tenantService = new TenantService(tenantRepository, context);

		return {
			tenantService,
		};
	};

	const app = new OpenAPIHono<AuthenticatedEnvironment>({
		strict: true,
		defaultHook: defaultValidationHook,
	});

	app.openapi(getTenantByIdRoute, async (ctx) => {
		const appContext = ctx.get('appContext');
		const {tenantService} = createServices(appContext);

		const tenantId = ctx.req.valid('param').id;
		const tenant = await tenantService.getTenantById(tenantId);

		if (!tenant) {
			throw new NotFoundError('Tenant not found');
		}

		return ctx.json(tenant.toJSON(), 200);
	});

	app.openapi(findTenantsRoute, async (ctx) => {
		const appContext = ctx.get('appContext');
		const {tenantService} = createServices(appContext);

		const queryParams = ctx.req.valid('query');

		const filters = parseQueryParamsToDatabaseFilters(
			queryParams
		) as PaginatedDatabaseQueryFilters;

		const tenants = await tenantService.findPaginatedTenants(filters);

		const tenantDTOs = tenants.entries.map((tenant) => tenant.toJSON());

		return ctx.json(
			{
				entries: tenantDTOs,
				totalEntries: tenants.totalEntries,
			},
			200
		);
	});

	app.openapi(updateTenantRoute, async (ctx) => {
		const appContext = ctx.get('appContext');
		const {tenantService} = createServices(appContext);

		const tenantId = ctx.req.valid('param').id;
		const tenantData = ctx.req.valid('json');

		const tenant = await tenantService.updateTenant(tenantId, tenantData);

		return ctx.json(tenant.toJSON(), 200);
	});

	return app;
};

export {createTenantApi};
