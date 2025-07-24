import type {AppContext, AuthenticatedAppContext} from '@lib/services/types';
import {PinoLogger} from '@lib/utils';

type Variables = {
	requestId: string;
	logger: PinoLogger;
	appContext: AppContext;
};

type AuthenticatedVariables = {
	requestId: string;
	logger: PinoLogger;
	appContext: AuthenticatedAppContext;
};

type Environment = {
	Variables: Variables;
};

type AuthenticatedEnvironment = {
	Variables: AuthenticatedVariables;
};

export type {
	Environment,
	Variables,
	AuthenticatedEnvironment,
	AuthenticatedVariables,
};
