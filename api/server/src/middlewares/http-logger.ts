import {createMiddleware} from 'hono/factory';

import {PinoLogger} from '@lib/utils';

const httpLogger = createMiddleware(async (ctx, next) => {
	const requestLogger = new PinoLogger(
		{
			requestId: ctx.var.requestId,
			method: ctx.req.method,
			url: ctx.req.path,
		},
		{
			level: process.env.HTTP_LOG_LEVEL ?? 'debug',
		}
	);

	ctx.set('logger', requestLogger);

	ctx.set('appContext', {
		logger: requestLogger,
		requestId: ctx.var.requestId,
	});

	const start = performance.now();

	await next();

	const end = performance.now();

	const responseTime = Math.round(end - start);
	ctx.header('X-Response-Time', `${responseTime}ms`);
	requestLogger.debug(
		{
			responseTime,
			status: ctx.res.status,
		},
		'Request completed'
	);
});

export {httpLogger};
