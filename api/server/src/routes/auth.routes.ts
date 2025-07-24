import {OpenAPIHono} from '@hono/zod-openapi';
import dayjs from 'dayjs';
import {getCookie, setCookie} from 'hono/cookie';

import {BadRequestError, NotFoundError, UnauthorizedError} from '@lib/errors';
import type {AppContext} from '@lib/services/types';
import {defaultValidationHook} from '@lib/utils';
import {isDevelopmentBuild} from '@lib/utils/env';

import type {Environment} from '../types';
import {createAuthService} from '../utils/create-auth-service';
import {getJwtSecret} from '../utils/get-jwt-seed';
import {
	authenticateWithPasswordRoute,
	authorizeCodeRoute,
	logoutAllDevicesRoute,
	logoutRoute,
	refreshTokenRoute,
	requestResetPasswordRoute,
	startAuthenticationWithCodeRoute,
	startClientAuthenticationWithSecretRoute,
	updatePasswordRoute,
	validateResetPasswordTokenRoute,
} from './auth.openapi';

const createServices = async (appContext: AppContext) => {
	const secret = await getJwtSecret();

	const authService = createAuthService(appContext, secret);
	return {
		authService,
	};
};

const createAuthApi = () => {
	const authApp = new OpenAPIHono<Environment>({
		strict: true,
		defaultHook: defaultValidationHook,
	});

	/**
	 * Client authentication with client_id and client_secret
	 */
	authApp.openapi(startClientAuthenticationWithSecretRoute, async (ctx) => {
		const {client_id: clientId, client_secret: clientSecret} =
			ctx.req.valid('json');

		const {authService} = await createServices(ctx.get('appContext'));

		const {
			accessToken,
			accessTokenExpiration,
			refreshToken,
			refreshTokenExpiration,
		} = await authService.clientAuthService.authenticateClient(
			clientId,
			clientSecret
		);

		const timeBetweenNowAndAccessTokenExpiration = dayjs(
			accessTokenExpiration
		).diff(dayjs(), 'milliseconds');
		const timeBetweenNowAndRefreshTokenExpiration = dayjs(
			refreshTokenExpiration
		).diff(dayjs(), 'milliseconds');

		return ctx.json(
			{
				access_token: accessToken,
				expires_in: timeBetweenNowAndAccessTokenExpiration,
				refresh_token: refreshToken,
				refresh_expires_in: timeBetweenNowAndRefreshTokenExpiration,
			},
			200
		);
	});

	authApp.openapi(startAuthenticationWithCodeRoute, async (ctx) => {
		const {email} = ctx.req.valid('json');

		if (!email) {
			throw new BadRequestError('Email is required');
		}

		const {authService} = await createServices(ctx.get('appContext'));

		const code =
			await authService.userAuthService.startAuthenticationWithCode(email);

		return ctx.json(code.toJSON(), 200);
	});

	/**
	 * User authentication with code
	 */
	authApp.openapi(authorizeCodeRoute, async (ctx) => {
		const {code, email} = ctx.req.valid('json');

		const {authService} = await createServices(ctx.get('appContext'));

		try {
			const {
				accessToken,
				accessTokenExpiration,
				refreshToken,
				refreshTokenExpiration,
			} = await authService.userAuthService.authenticateCode(email, code);

			setCookie(ctx, 'eclaut-access-token', accessToken, {
				secure: !isDevelopmentBuild(),
				httpOnly: true,
				expires: accessTokenExpiration,
			});

			setCookie(ctx, 'eclaut-refresh-token', refreshToken, {
				secure: !isDevelopmentBuild(),
				httpOnly: true,
				expires: refreshTokenExpiration,
			});

			return ctx.newResponse(null, 204);
		} catch (e) {
			ctx.get('logger').error(e);
			throw new UnauthorizedError('Invalid code');
		}
	});

	/**
	 * User authentication with email and password
	 */
	authApp.openapi(authenticateWithPasswordRoute, async (ctx) => {
		const {email, password} = ctx.req.valid('json');

		if (!email || !password) {
			throw new BadRequestError('Email and password are required');
		}

		const {authService} = await createServices(ctx.get('appContext'));

		try {
			const {
				accessToken,
				accessTokenExpiration,
				refreshToken,
				refreshTokenExpiration,
			} = await authService.userAuthService.authenticateUserPassword(
				email,
				password
			);

			setCookie(ctx, 'eclaut-access-token', accessToken, {
				secure: !isDevelopmentBuild(),
				httpOnly: true,
				expires: accessTokenExpiration,
			});

			setCookie(ctx, 'eclaut-refresh-token', refreshToken, {
				secure: !isDevelopmentBuild(),
				httpOnly: true,
				expires: refreshTokenExpiration,
			});

			return ctx.newResponse(null, 204);
		} catch (e) {
			ctx.get('logger').error(e);
			throw new UnauthorizedError('Invalid email or password');
		}
	});

	authApp.openapi(requestResetPasswordRoute, async (ctx) => {
		const {email} = ctx.req.valid('json');

		if (!email) {
			throw new BadRequestError('Email is required');
		}

		const {authService} = await createServices(ctx.get('appContext'));

		try {
			await authService.userAuthService.sendPasswordResetEmail(email);
		} catch (e) {
			if (!(e instanceof UnauthorizedError) && !(e instanceof NotFoundError)) {
				throw e;
			}
		}

		return ctx.newResponse(null, 204);
	});

	authApp.openapi(validateResetPasswordTokenRoute, async (ctx) => {
		const {token, email} = ctx.req.valid('json');
		const logger = ctx.get('logger');

		const {authService} = await createServices(ctx.get('appContext'));

		try {
			const user = await authService.userAuthService.validatePasswordReset(
				email,
				token
			);

			return ctx.json(
				{
					username: user.username,
				},
				200
			);
		} catch (e) {
			logger.error(e);
			throw new BadRequestError(
				'We could not validate the token and email combination'
			);
		}
	});

	authApp.openapi(updatePasswordRoute, async (ctx) => {
		const {token, email, newPassword} = ctx.req.valid('json');
		const logger = ctx.get('logger');

		if (!token || !email || !newPassword) {
			throw new BadRequestError('Token, email and new password are required');
		}

		const {authService} = await createServices(ctx.get('appContext'));

		try {
			await authService.userAuthService.updateUserPassword(
				email,
				token,
				newPassword
			);
			return ctx.newResponse(null, 204);
		} catch (e) {
			logger.error(e);
			throw new BadRequestError(
				'We could not update the password with the provided token and email'
			);
		}
	});

	authApp.openapi(refreshTokenRoute, async (ctx) => {
		const refreshToken = getCookie(ctx, 'eclaut-refresh-token');

		if (!refreshToken) {
			throw new UnauthorizedError('No refresh token');
		}

		const {authService} = await createServices(ctx.get('appContext'));

		try {
			const {
				accessToken,
				accessTokenExpiration,
				refreshToken: newRefreshToken,
				refreshTokenExpiration: newRefreshTokenExpiration,
			} = await authService.refreshJwtTokens(refreshToken);

			setCookie(ctx, 'eclaut-access-token', accessToken, {
				secure: !isDevelopmentBuild(),
				httpOnly: true,
				expires: accessTokenExpiration,
			});

			setCookie(ctx, 'eclaut-refresh-token', newRefreshToken, {
				secure: !isDevelopmentBuild(),
				httpOnly: true,
				expires: newRefreshTokenExpiration,
			});

			return ctx.newResponse(null, 204);
		} catch {
			throw new UnauthorizedError('Invalid refresh token');
		}
	});

	authApp.openapi(logoutRoute, async (ctx) => {
		const appContext = ctx.get('appContext');
		const {authService} = await createServices(appContext);

		const tokenUser = appContext.auth;
		const refreshToken = getCookie(ctx, 'eclaut-refresh-token');

		if (!tokenUser || !refreshToken) {
			throw new UnauthorizedError('No user');
		}

		setCookie(ctx, 'eclaut-access-token', '', {
			secure: !isDevelopmentBuild(),
			httpOnly: true,
			expires: new Date(0),
		});

		setCookie(ctx, 'eclaut-refresh-token', '', {
			secure: !isDevelopmentBuild(),
			httpOnly: true,
			expires: new Date(0),
		});

		await authService.logoutOnDevice(refreshToken);

		return ctx.newResponse(null, 204);
	});

	authApp.openapi(logoutAllDevicesRoute, async (ctx) => {
		const appContext = ctx.get('appContext');
		const {authService} = await createServices(appContext);

		const tokenUser = appContext.auth;

		if (!tokenUser || !tokenUser.userId) {
			throw new UnauthorizedError('No user');
		}

		setCookie(ctx, 'eclaut-access-token', '', {
			secure: !isDevelopmentBuild(),
			httpOnly: true,
			expires: new Date(0),
		});

		setCookie(ctx, 'eclaut-refresh-token', '', {
			secure: !isDevelopmentBuild(),
			httpOnly: true,
			expires: new Date(0),
		});

		await authService.logoutOnAllDevices(tokenUser.userId);

		return ctx.newResponse(null, 204);
	});

	return authApp;
};

export {createAuthApi};
