import {z} from '@hono/zod-openapi';
import {getCookie} from 'hono/cookie';
import {createMiddleware} from 'hono/factory';

import {UnauthorizedError} from '@lib/errors';
import {AppSecurityGroup} from '@lib/models/app-user';
import {
	type ClientTokenPayload,
	type UserTokenPayload,
} from '@lib/services/auth';
import {getAwsSecret} from '@lib/utils/aws-secret-manager';

import type {Environment} from '../types';
import {createAuthService} from '../utils/create-auth-service';

type AuthenticationMiddlewareOptions = {
	passThrough?: boolean;
};

const Authenticate = (options?: AuthenticationMiddlewareOptions) => {
	let secret: {seed: string} | undefined;

	const getSecret = async () => {
		if (secret) {
			return secret;
		}

		secret = await getAwsSecret<{seed: string}>('prd/jwt-seed'); // TODO: use a different secret for dev and prod

		return secret;
	};

	return createMiddleware<Environment>(async (ctx, next) => {
		const appContext = ctx.get('appContext');
		const jwtSecret = await getSecret();

		/**
		 * When creating a private route on an already authenticated api, we don't want to re-authenticate
		 */
		const isAlreadyAuthenticated = appContext.isAuthenticated !== undefined;
		if (isAlreadyAuthenticated) {
			return next();
		}

		const accessTokenJwt = getCookie(ctx, 'eclaut-access-token');
		const refreshTokenJwt = getCookie(ctx, 'eclaut-refresh-token');

		const authorizationHeader = ctx.req.header('Authorization');
		const headerAccessTokenJwt = authorizationHeader
			? authorizationHeader.replace('Bearer ', '')
			: undefined;

		const logger = ctx.get('logger').getChildLogger(
			{
				name: 'authenticationMiddleware',
			},
			{}
		);

		logger.debug('Access token:', accessTokenJwt);
		logger.debug('Refresh token:', refreshTokenJwt);

		const authService = createAuthService(
			{
				...appContext,
				logger,
			},
			jwtSecret
		);

		// User authentication
		if (accessTokenJwt) {
			try {
				const decodedAccessToken =
					(await authService.authenticateJwtAccessToken(
						accessTokenJwt
					)) as UserTokenPayload;

				const validatedTokenUser = z
					.object({
						userId: z.string(),
						email: z.string(),
						securityGroup: z.nativeEnum(AppSecurityGroup),
						tenantId: z.string(),
						locationIds: z.array(z.string()),
					})
					.parse({
						userId: decodedAccessToken.userId,
						email: decodedAccessToken.email,
						securityGroup: decodedAccessToken.securityGroup,
						tenantId: decodedAccessToken.tenantId,
						locationIds: decodedAccessToken.locationIds,
					});

				ctx.set('appContext', {
					...appContext,
					isAuthenticated: true,
					auth: {
						userId: validatedTokenUser.userId,
						clientId: undefined,
						email: validatedTokenUser.email,
						securityGroup: validatedTokenUser.securityGroup,
						tenantId: validatedTokenUser.tenantId,
						locationIds: validatedTokenUser.locationIds,
						isElaut: validatedTokenUser.securityGroup
							.toLocaleLowerCase()
							.startsWith('elaut'),
						type: 'USER',
					},
				});

				return next();
			} catch (error) {
				logger.error(`Access token error: ${error}`);

				if (options?.passThrough) {
					ctx.set('appContext', {
						...appContext,
						auth: undefined,
						isAuthenticated: false,
					});

					return next();
				}

				throw new UnauthorizedError('Invalid access token');
			}
		}

		// Client authentication
		if (headerAccessTokenJwt) {
			try {
				const decodedAccessToken =
					(await authService.authenticateJwtAccessToken(
						headerAccessTokenJwt
					)) as ClientTokenPayload;

				const validatedTokenClient = z
					.object({
						clientId: z.string(),
						tenantId: z.string().optional().nullable(),
						locationIds: z.array(z.string()).optional().nullable(),
						securityGroup: z.nativeEnum(AppSecurityGroup),
					})
					.parse({
						clientId: decodedAccessToken.clientId,
						tenantId: decodedAccessToken.tenantId,
						locationIds: decodedAccessToken.locationIds,
						securityGroup: decodedAccessToken.securityGroup,
					});

				ctx.set('appContext', {
					...appContext,
					isAuthenticated: true,
					auth: {
						userId: undefined,
						clientId: validatedTokenClient.clientId,
						securityGroup: validatedTokenClient.securityGroup,
						tenantId: validatedTokenClient.tenantId ?? 'NO_TENANT_CLIENT',
						locationIds: validatedTokenClient.locationIds ?? [],
						isElaut: false,
						type: 'CLIENT',
					},
				});

				return next();
			} catch (error) {
				logger.error(`Header access token error: ${error}`);

				if (options?.passThrough) {
					ctx.set('appContext', {
						...appContext,
						auth: undefined,
						isAuthenticated: false,
					});

					return next();
				}

				throw new UnauthorizedError('Invalid header access token');
			}
		}

		await next();
	});
};

export {Authenticate};

export type {AuthenticationMiddlewareOptions};
