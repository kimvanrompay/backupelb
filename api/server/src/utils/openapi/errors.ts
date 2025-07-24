import type {RouteConfig} from '@hono/zod-openapi';

const badRequest: RouteConfig['responses'][string] = {
	summary: 'Bad Request',
	description: 'Bad Request',
};
