import {OpenAPIHono} from '@hono/zod-openapi';

import {UnauthorizedError} from '@lib/errors';
import type {AppUser} from '@lib/models/app-user';
import type {Client} from '@lib/models/client';
import {AppUserRepository} from '@lib/repositories/app-user';
import {ClientRepository} from '@lib/repositories/client';
import {TenantLocationRepository} from '@lib/repositories/tenant-location';
import {AppUserService} from '@lib/services/app-user';
import {ClientService} from '@lib/services/client';
import {defaultValidationHook} from '@lib/utils';

import {db} from '../database';
import {Authenticate} from '../middlewares/authentication';
import type {Environment} from '../types';
import {loggedInUserRoute} from './account.openapi';

const createAccountApi = () => {
	const app = new OpenAPIHono<Environment>({
		strict: true,
		defaultHook: defaultValidationHook,
	});

	app.openapi(loggedInUserRoute, async (ctx) => {
		const appContext = ctx.get('appContext');
		const appUserRepository = new AppUserRepository(db, {
			logger: appContext.logger,
		});
		const tenantLocationRepository = new TenantLocationRepository(db, {
			logger: appContext.logger,
		});
		const appUserService = new AppUserService(
			appUserRepository,
			tenantLocationRepository,
			appContext
		);

		const clientRepository = new ClientRepository(db, {
			logger: appContext.logger,
		});

		const clientService = new ClientService(clientRepository, appContext);

		const tokenuser = appContext.auth;

		if (!tokenuser) {
			throw new UnauthorizedError('Cannot find user');
		}

		const isUser = tokenuser.userId !== undefined;
		const isClient = tokenuser.clientId !== undefined;

		try {
			let entity: AppUser | Client | undefined;

			if (isUser) {
				entity = await appUserService.getUserById(tokenuser.userId);
			}

			if (isClient) {
				entity = await clientService.getClientById(tokenuser.clientId);
			}

			if (!entity) {
				throw new UnauthorizedError('Cannot find logged in entity');
			}

			return ctx.json(entity.toJSON(), 200);
		} catch {
			throw new UnauthorizedError('Cannot find logged in entity');
		}
	});

	return app;
};

export {createAccountApi};
