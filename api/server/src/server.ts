import './load-env-variables';

import {serve} from '@hono/node-server';

import {app} from './app';
import './app-routes';
import {startScheduler} from './cron/scheduler';

startScheduler();

serve(
	{
		fetch: app.fetch.bind(app),
		port: 3000,
	},
	(info) => {
		console.log(`Server running at ${info.port}`);
	}
);
