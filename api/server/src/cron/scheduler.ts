import {scheduleRemoveExpiredLoginCodes} from './remove-expired-login-codes';
import {scheduleRemoveExpiredPasswordResetTokens} from './remove-expired-password-reset-tokens';

const startScheduler = () => {
	scheduleRemoveExpiredLoginCodes();
	scheduleRemoveExpiredPasswordResetTokens();
};

export {startScheduler};
