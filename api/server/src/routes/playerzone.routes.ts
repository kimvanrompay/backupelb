import {OpenAPIHono} from '@hono/zod-openapi';

import {GameSessionRepository} from '@lib/repositories/game-session';
import {MachineLogRepository} from '@lib/repositories/machine-log';
import {PlayfieldRepository} from '@lib/repositories/playfield';
import {PlayfieldCategoryRepository} from '@lib/repositories/playfield-category';
import {PrizeRepository} from '@lib/repositories/prize';
import {MqttService} from '@lib/services/mqtt';
import {PlayerZoneService} from '@lib/services/player-zone';
import {PlayfieldService} from '@lib/services/playfield';
import type {AuthenticatedAppContext} from '@lib/services/types';
import {defaultValidationHook} from '@lib/utils';

import {db} from '../database';
import type {AuthenticatedEnvironment} from '../types';
import {
	getMachineLeaderboardRoute,
	getPlayerProfileRoute,
	initializeGameOnPlayfieldRoute,
} from './playerzone.openapi';

const createPlayerZoneApi = () => {
	const app = new OpenAPIHono<AuthenticatedEnvironment>({
		strict: true,
		defaultHook: defaultValidationHook,
	});

	const getServices = (appContext: AuthenticatedAppContext) => {
		const gameSessionRepository = new GameSessionRepository(db, appContext);
		const playfieldRepository = new PlayfieldRepository(db, appContext);
		const prizeRepository = new PrizeRepository(db, appContext);
		const machineLogRepository = new MachineLogRepository(db, appContext);
		const playfieldCategoryRepository = new PlayfieldCategoryRepository(
			db,
			appContext
		);
		const playfieldService = new PlayfieldService(
			playfieldRepository,
			prizeRepository,
			playfieldCategoryRepository,
			machineLogRepository,
			appContext
		);

		const mqttService = new MqttService();

		const playerZoneService = new PlayerZoneService(
			playfieldService,
			gameSessionRepository,
			mqttService,
			appContext
		);

		return {
			playerZoneService,
		};
	};

	app.openapi(initializeGameOnPlayfieldRoute, async (ctx) => {
		const {playerZoneService} = getServices(ctx.get('appContext'));

		const {playfieldId, gameSessionId, playerId, data} = ctx.req.valid('json');

		await playerZoneService.initialiseSessionOnPlayfield(
			playfieldId,
			playerId,
			gameSessionId,
			data
		);

		return ctx.newResponse(null, 204);
	});

	app.openapi(getPlayerProfileRoute, async (ctx) => {
		const {playerZoneService} = getServices(ctx.get('appContext'));

		const {playerId} = ctx.req.valid('param');

		const profile = await playerZoneService.getPlayerProfile(playerId);

		return ctx.json(profile.toJSON(), 200);
	});

	app.openapi(getMachineLeaderboardRoute, async (ctx) => {
		const {playerZoneService} = getServices(ctx.get('appContext'));

		const {serialNumber} = ctx.req.valid('param');

		const leaderboard =
			await playerZoneService.getMachineLeaderboard(serialNumber);

		return ctx.json(leaderboard.toJSON(), 200);
	});

	return app;
};

export {createPlayerZoneApi};
