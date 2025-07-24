import {createMiddleware} from 'hono/factory';

import {ForbiddenError, UnauthorizedError} from '@lib/errors';
import {
	type AppSecurityScopes,
	AuthorizationService,
} from '@lib/services/authorization';

import type {Environment} from '../types';

const Authorize = (...scopes: AppSecurityScopes[]) => {
	return createMiddleware<Environment>((ctx, next) => {
		const appContext = ctx.get('appContext');

		if (!appContext || !appContext.auth) {
			throw new UnauthorizedError('Token is missing');
		}

		const isAuthorized = AuthorizationService.hasAccessToScopes(
			appContext.auth.securityGroup,
			scopes
		);

		if (!isAuthorized) {
			throw new ForbiddenError(
				'User does not have permission to access this resource'
			);
		}

		return next();
	});
};

export {Authorize};
