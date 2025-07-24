import {AppUserRepository} from '@lib/repositories/app-user';
import {ClientRepository} from '@lib/repositories/client';
import {LoginVerificationCodeRepository} from '@lib/repositories/login-verification-code';
import {PasswordResetTokenRepository} from '@lib/repositories/password-reset-token';
import {RefreshTokenRepository} from '@lib/repositories/refresh-token';
import {TenantLocationRepository} from '@lib/repositories/tenant-location';
import {AppUserService} from '@lib/services/app-user';
import {AuthService} from '@lib/services/auth';
import {ClientService} from '@lib/services/client';
import {EmailService} from '@lib/services/email';
import {LoginVerificationCodeService} from '@lib/services/login-verification-code';
import {PasswordResetTokenService} from '@lib/services/password-reset-token';
import {TenantLocationService} from '@lib/services/tenant-location';
import type {AppContext} from '@lib/services/types';

import {db} from '../database';

const createAuthService = (
	appContext: AppContext,
	jwtSecret: {seed: string}
) => {
	const emailService = new EmailService(appContext);

	// Repositories
	const ctxRepos = {
		logger: appContext.logger,
	};

	const tenantLocationRepository = new TenantLocationRepository(db, ctxRepos);
	const appUserCodeRepository = new AppUserRepository(db, ctxRepos);
	const loginVerificationCodeRepository = new LoginVerificationCodeRepository(
		db
	);
	const refreshTokenRepository = new RefreshTokenRepository(db, ctxRepos);
	const clientRepository = new ClientRepository(db, ctxRepos);
	const passwordResetTokenRepository = new PasswordResetTokenRepository(
		db,
		ctxRepos
	);

	// Services

	const appUserService = new AppUserService(
		appUserCodeRepository,
		tenantLocationRepository,
		appContext
	);

	const loginVerificationCodeService = new LoginVerificationCodeService(
		appUserService,
		loginVerificationCodeRepository,
		emailService,
		appContext
	);

	const tenantLocationService = new TenantLocationService(
		tenantLocationRepository,
		appContext
	);

	const clientService = new ClientService(clientRepository, appContext);

	const passwordResetTokenService = new PasswordResetTokenService(
		appUserService,
		passwordResetTokenRepository,
		emailService,
		appContext
	);

	const authService = new AuthService(
		jwtSecret.seed,
		refreshTokenRepository,
		appUserService,
		tenantLocationService,
		loginVerificationCodeService,
		passwordResetTokenService,
		clientService,
		appContext
	);

	return authService;
};

export {createAuthService};
