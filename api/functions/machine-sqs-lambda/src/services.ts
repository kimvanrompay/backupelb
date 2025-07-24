import {getKnexInstance} from '@lib/db';
import {CabinetRepository} from '@lib/repositories/cabinet';
import {GameSessionRepository} from '@lib/repositories/game-session';
import {MachineLogRepository} from '@lib/repositories/machine-log';
import {MachineMessageRepository} from '@lib/repositories/machine-message';
import {PlayfieldRepository} from '@lib/repositories/playfield';
import {PlayfieldStatsRepository} from '@lib/repositories/playfield-stats';
import {MachineMessageService} from '@lib/services/machine-message';
import {PinoLogger} from '@lib/utils';

const createServices = async (logger: PinoLogger) => {
	const db = await getKnexInstance();

	const contextForRepositories = {
		logger,
	};

	const gameSessionRepository = new GameSessionRepository(
		db,
		contextForRepositories
	);

	const machineLogRepository = new MachineLogRepository(
		db,
		contextForRepositories
	);

	const machineMessagesRepository = new MachineMessageRepository(
		db,
		contextForRepositories
	);

	const cabinetRepository = new CabinetRepository(db, contextForRepositories);
	const playfieldRepository = new PlayfieldRepository(
		db,
		contextForRepositories
	);

	const playfieldStatsRepository = new PlayfieldStatsRepository(
		db,
		contextForRepositories
	);

	const machineMessagesService = new MachineMessageService(
		machineMessagesRepository,
		gameSessionRepository,
		machineLogRepository,
		cabinetRepository,
		playfieldRepository,
		playfieldStatsRepository,
		contextForRepositories
	);

	return {machineMessagesService};
};

export {createServices};
