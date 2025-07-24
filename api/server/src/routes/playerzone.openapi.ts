import {z} from 'zod';

import {AppSecurityScopes} from '@lib/services/authorization';

import {createPrivateAppRoute} from '../utils/create-private-app-route';

const initializeGameOnPlayfieldRoute = createPrivateAppRoute(
	[AppSecurityScopes.INITIALIZE_GAMESESSIONS],
	{
		canThrowBadRequest: true,
	}
)({
	method: 'post',
	summary: 'Initialize game on playfield',
	path: '/game-session/init',
	tags: ['Player Zone'],
	request: {
		body: {
			content: {
				'application/json': {
					schema: z.object({
						// tenantId: z.string(),
						playfieldId: z.string(),
						gameSessionId: z.string(),
						playerId: z.string(),
						data: z
							.object({
								seasonIndex: z.number().optional(),
								charsCollectedInSeason: z.number().optional(),
							})
							.passthrough(),
					}),
				},
			},
		},
	},
	responses: {
		204: {
			description: 'No content',
		},
	},
});

const getPlayerProfileRoute = createPrivateAppRoute(
	[AppSecurityScopes.READ_PLAYERZONE_PROFILES],
	{
		canThrowBadRequest: true,
	}
)({
	method: 'get',
	summary: 'Get player profile',
	path: '/player/profile/{playerId}',
	tags: ['Player Zone'],
	request: {
		params: z.object({
			playerId: z.string(),
		}),
	},
	responses: {
		200: {
			description: 'Successful response',
			content: {
				'application/json': {
					schema: z.object({
						id: z.string(),
						username: z.string(),
						avatar: z.string().optional(),
						birthDate: z.string().optional(),
					}),
				},
			},
		},
		404: {
			description: 'Player not found',
		},
	},
});

const getMachineLeaderboardRoute = createPrivateAppRoute(
	[AppSecurityScopes.READ_PLAYERZONE_LEADERBOARDS],
	{
		canThrowBadRequest: true,
	}
)({
	method: 'get',
	summary: 'Get machine leaderboard',
	path: '/machine/leaderboard/{serialNumber}',
	tags: ['Player Zone'],
	request: {
		params: z.object({
			serialNumber: z.string(),
		}),
	},
	responses: {
		200: {
			description: 'Successful response',
			content: {
				'application/json': {
					schema: z.object({
						leaderboard: z.array(
							z.object({
								playerId: z.string(),
								username: z.string(),
								score: z.number(),
							})
						),
					}),
				},
			},
		},
		404: {
			description: 'Machine not found',
		},
	},
});

export {
	initializeGameOnPlayfieldRoute,
	getPlayerProfileRoute,
	getMachineLeaderboardRoute,
};
