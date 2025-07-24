import schedule from 'node-schedule';

import {LoginVerificationCodeRepository} from '@lib/repositories/login-verification-code';
import {LoginVerificationCodeService} from '@lib/services/login-verification-code';
import type {IAppUserService, IEmailService} from '@lib/services/types';

import {db} from '../database';
import {appContextForScheduler} from './cron-app-context';

const removeExpiredLoginCodes = async () => {
	const loginVerificationRepo = new LoginVerificationCodeRepository(db);

	// The method we want to call does not require all services, so we can pass empty objects for those
	const loginVerificationCodeService = new LoginVerificationCodeService(
		{} as IAppUserService,
		loginVerificationRepo,
		{} as IEmailService,
		appContextForScheduler
	);

	try {
		await loginVerificationCodeService.deleteExpiredLoginVerificationCodes();
	} catch (error) {
		appContextForScheduler.logger.error(
			`Error removing expired login codes: ${error}`
		);
	}
};

const scheduleRemoveExpiredLoginCodes = () => {
	// Schedule the job to run every hour at minute 5
	schedule.scheduleJob(`5 * * * *`, async () => {
		appContextForScheduler.logger.info(
			'Running scheduled job to remove expired login codes'
		);
		await removeExpiredLoginCodes();
		appContextForScheduler.logger.info(
			'Completed scheduled job to remove expired login codes'
		);
	});
};

export {scheduleRemoveExpiredLoginCodes};
