import {type RouteConfig} from '@hono/zod-openapi';

import type {AppSecurityScopes} from '@lib/services/authorization';

import {cookieAuthRegistry} from '../app';
import {Authorize} from '../middlewares/authorization';
import {createAppRoute} from './create-app-route';

const createAuthorizedAppRoute =
	(claims: AppSecurityScopes[] = []) =>
	<
		P extends string,
		R extends Omit<RouteConfig, 'path'> & {
			path: P;
		},
	>(
		routeConfig: R
	) => {
		return createAppRoute({
			canThrowUnauthorized: true,
			canThrowForbidden: true,
		})<P, R>({
			...routeConfig,
			security: {
				[cookieAuthRegistry.name]: [claims],
			},
			middleware: [Authorize(...claims)],
		});
	};

export {createAuthorizedAppRoute};
