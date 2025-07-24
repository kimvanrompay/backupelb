import type {ErrorHandler} from 'hono';
import type {HTTPException} from 'hono/dist/types/http-exception';
import type {ContentfulStatusCode} from 'hono/dist/types/utils/http-status';

import {ApiError} from '@lib/errors';

import type {Environment} from './types';

const isHttpException = (error: unknown): error is HTTPException => {
	return typeof (error as HTTPException).res !== 'undefined';
};

const apiErrorHandler: ErrorHandler<Environment> = async (error, ctx) => {
	ctx.var.logger.error(error);

	// Hono can throw HTTPExceptions
	if (isHttpException(error)) {
		return (error as HTTPException).res as Response;
	}

	const apiError = ApiError.fromError(error);

	return ctx.json(apiError, apiError.statusCode as ContentfulStatusCode);
};

export {apiErrorHandler};
