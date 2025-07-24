import {AppSecurityGroup} from '@lib/models/app-user';
import type {AuthenticatedAppContext} from '@lib/services/types';
import {PinoLogger} from '@lib/utils';

const LOGGER = new PinoLogger({name: 'scheduler'}, {});

const appContextForScheduler: AuthenticatedAppContext = {
	logger: LOGGER,
	isAuthenticated: true,
	auth: {
		type: 'CLIENT',
		clientId: 'INTERNAL_SCHEDULER',
		isElaut: true,
		tenantId: 'INTERNAL_TENANT',
		locationIds: [],
		securityGroup: AppSecurityGroup.ELAUT_ADMIN,
		userId: undefined,
	},
};

export {appContextForScheduler};
