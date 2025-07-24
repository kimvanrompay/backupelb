import {OpenAPIHono} from '@hono/zod-openapi';

import {NotFoundError} from '@lib/errors';
import {AppUserRepository} from '@lib/repositories/app-user';
import {TenantLocationRepository} from '@lib/repositories/tenant-location';
import {AppUserService} from '@lib/services/app-user';
import {TenantLocationService} from '@lib/services/tenant-location';
import type {AuthenticatedAppContext} from '@lib/services/types';
import {defaultValidationHook} from '@lib/utils';
import {renameProperties} from '@lib/utils/object';
import {parseQueryParamsToDatabaseFilters} from '@lib/utils/query-params';

import {db} from '../database';
import type {AuthenticatedEnvironment} from '../types';
import {
	addUserToLocationRoute,
	createUserRoute,
	findUsersRoute,
	getUserByEmailAddressRoute,
	getUserRoute,
	inactivateUserRoute,
	removeUserFromLocationRoute,
	updateUserRoute,
} from './app-user.openapi';

const createAppUserApi = () => {
	const userApp = new OpenAPIHono<AuthenticatedEnvironment>({
		strict: true,
		defaultHook: defaultValidationHook,
	});

	const createServices = (appContext: AuthenticatedAppContext) => {
		const tenantLocationRepository = new TenantLocationRepository(
			db,
			appContext
		);
		const tenantLocationService = new TenantLocationService(
			tenantLocationRepository,
			appContext
		);

		const appUserRepository = new AppUserRepository(db, appContext);

		const appUserService = new AppUserService(
			appUserRepository,
			tenantLocationRepository,
			appContext
		);

		return {tenantLocationService, appUserService};
	};

	userApp.openapi(findUsersRoute, async (ctx) => {
		const queryParams = ctx.req.valid('query');

		const appContext = ctx.get('appContext');
		const {appUserService} = createServices(appContext);

		const renamedQueryParams = renameProperties(queryParams, {
			'is_active[eq]': 'app_user.is_active[eq]',
		}) as typeof queryParams;

		const filters = parseQueryParamsToDatabaseFilters(renamedQueryParams);

		const users = await appUserService.findPaginatedUsers(filters);

		const userDTOs = users.entries.map((user) => user.toJSON());

		return ctx.json(
			{
				entries: userDTOs,
				totalEntries: users.totalEntries,
			},
			200
		);
	});

	userApp.openapi(getUserRoute, async (ctx) => {
		const {appUserService} = createServices(ctx.get('appContext'));
		const {id: userId} = ctx.req.valid('param');

		const user = await appUserService.getUserById(userId);

		if (!user) {
			throw new NotFoundError('User not found');
		}

		const userDTO = user.toJSON();

		return ctx.json(userDTO, 200);
	});

	userApp.openapi(getUserByEmailAddressRoute, async (ctx) => {
		const appContext = ctx.get('appContext');

		const {appUserService} = createServices(appContext);

		const {email} = ctx.req.valid('param');

		const user = await appUserService.getUserByEmail(email);

		if (!user) {
			throw new NotFoundError('User not found');
		}

		const userDTO = user.toJSON();

		return ctx.json(userDTO, 200);
	});

	userApp.openapi(createUserRoute, async (ctx) => {
		const appContext = ctx.get('appContext');
		const {appUserService} = createServices(appContext);

		const userToCreate = ctx.req.valid('json');

		const user = await appUserService.createUser({
			...userToCreate,
		});

		return ctx.json(user.toJSON(), 201);
	});

	userApp.openapi(updateUserRoute, async (ctx) => {
		const appContext = ctx.get('appContext');
		const {appUserService} = createServices(appContext);

		const {id: userId} = ctx.req.valid('param');
		const userToUpdate = ctx.req.valid('json');

		const user = await appUserService.updateUser(userId, userToUpdate);

		return ctx.json(user.toJSON(), 200);
	});

	userApp.openapi(addUserToLocationRoute, async (ctx) => {
		const appContext = ctx.get('appContext');
		const {appUserService} = createServices(appContext);

		const {id, locationId} = ctx.req.valid('param');

		const user = await appUserService.addUserToLocation(id, locationId);

		return ctx.json(user.toJSON(), 200);
	});

	userApp.openapi(removeUserFromLocationRoute, async (ctx) => {
		const appContext = ctx.get('appContext');
		const {appUserService} = createServices(appContext);

		const {id, locationId} = ctx.req.valid('param');

		await appUserService.removeUserFromLocation(id, locationId);

		return new Response(null, {
			status: 204,
		});
	});

	userApp.openapi(inactivateUserRoute, async (ctx) => {
		const appContext = ctx.get('appContext');
		const {appUserService} = createServices(appContext);

		const {id} = ctx.req.valid('param');

		await appUserService.inactivateUser(id);

		return new Response(null, {
			status: 204,
		});
	});

	return userApp;
};

export {createAppUserApi};
