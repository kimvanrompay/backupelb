import {AppUser} from '@lib/models/app-user';
import {Client} from '@lib/models/client';

import {createPrivateAppRoute} from '../utils/create-private-app-route';

const loggedInUserRoute = createPrivateAppRoute([], {
	canThrowBadRequest: true,
})({
	summary: 'Get logged in user',
	method: 'get',
	tags: ['Account'],
	path: '/me',
	responses: {
		200: {
			description: 'Successful response',
			content: {
				'application/json': {
					schema: AppUser.schema.AppUserDTOSchema.or(Client.schemas.DTOSchema),
				},
			},
		},
	},
});

export {loggedInUserRoute};
