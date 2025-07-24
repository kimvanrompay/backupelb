import schedule from 'node-schedule';

import {PasswordResetTokenRepository} from '@lib/repositories/password-reset-token';
import {PasswordResetTokenService} from '@lib/services/password-reset-token';
import type {IAppUserService, IEmailService} from '@lib/services/types';

import {db} from '../database';
import {appContextForScheduler} from './cron-app-context';

const removeExpiredPasswordResetTokens = async () => {
	const passwordResetTokenRepo = new PasswordResetTokenRepository(
		db,
		appContextForScheduler
	);

	// The method we want to call does not require all services, so we can pass empty objects for those
	const passwordResetTokenService = new PasswordResetTokenService(
		{} as IAppUserService,
		passwordResetTokenRepo,
		{} as IEmailService,
		appContextForScheduler
	);

	try {
		await passwordResetTokenService.deleteExpiredPasswordResetTokens();
	} catch (error) {
		appContextForScheduler.logger.error(
			`Error removing expired login codes: ${error}`
		);
	}
};

const scheduleRemoveExpiredPasswordResetTokens = () => {
	// Schedule the job to run every hour at minute 10
	schedule.scheduleJob(`10 * * * *`, async () => {
		appContextForScheduler.logger.info(
			'Running scheduled job to remove expired password reset tokens'
		);
		await removeExpiredPasswordResetTokens();
		appContextForScheduler.logger.info(
			'Completed scheduled job to remove expired password reset tokens'
		);
	});
};

export {scheduleRemoveExpiredPasswordResetTokens};
