import {swaggerUI} from '@hono/swagger-ui';
import {OpenAPIHono} from '@hono/zod-openapi';
import {basicAuth} from 'hono/basic-auth';

import {type Environment} from '../types';

const addOpenAPI = (app: OpenAPIHono<Environment>) => {
	app.doc('/openapi', {
		openapi: '3.0.0',
		info: {
			title: 'Elaut API',
			version: '1.0.0',
		},
	});

	app.use('/swagger', basicAuth({username: 'eclaut', password: 'Monsterdrop'}));
	app.get(
		'/swagger',
		swaggerUI({
			url: '/openapi',
			withCredentials: true,
			syntaxHighlight: true,
			tagsSorter: `(a, b) => {

					// const order = ['General', 'Authentication', 'Users'];

					// const aIndex = order.indexOf(a);
					// const bIndex = order.indexOf(b);
					//
					// console.log(aIndex, a, bIndex, b);
					//
					// if (aIndex > -1 && bIndex === -1) {
					// 	return -1;
					// }
					//
					// if (aIndex === -1 && bIndex > -1) {
					// 	return 1;
					// }
					//
					// if (aIndex > bIndex) {
					// 	return 1;
					// }
					//
					// if (aIndex < bIndex) {
					// 	return -1;
					// }

					return a.localeCompare(b);
			}`,
		})
	);
};

export {addOpenAPI};
