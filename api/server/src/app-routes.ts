import {app} from './app';
import {createAccountApi} from './routes/account.routes';
import {createAppUserApi} from './routes/app-user.routes';
import {createAuthApi} from './routes/auth.routes';
import {createCabinetApi} from './routes/cabinet.routes';
import {createGametypeApi} from './routes/gametype.routes';
import {healthCheckRoute, pingCheckRoute} from './routes/health.openapi';
import {createMachineApi} from './routes/machine.routes';
import {createMqttApi} from './routes/mqtt.routes';
import {addOpenAPI} from './routes/openapi.routes';
import {createPlayerZoneApi} from './routes/playerzone.routes';
import {createPlayfieldCategoriesApi} from './routes/playfield-category.routes';
import {createPlayfieldApi} from './routes/playfield.routes';
import {createPrizeApi} from './routes/prize.routes';
import {createStatisticsApi} from './routes/statistics.routes';
import {createTenantLocationApi} from './routes/tenant-location.routes';
import {createTenantApi} from './routes/tenant.routes';

/**
 * Routes
 */

app.openapi(healthCheckRoute, (ctx) => {
	return ctx.text('OK', 200);
});

app.openapi(pingCheckRoute, (ctx) => {
	return ctx.text('PONG', 200);
});

app.route('/auth', createAuthApi());

app.route('/users', createAppUserApi());

app.route('/account', createAccountApi());

app.route('/gametype', createGametypeApi());

app.route('/location', createTenantLocationApi());

app.route('/machine', createMachineApi());

app.route('/machine/playfield/category', createPlayfieldCategoriesApi());

app.route('/machine/playfield', createPlayfieldApi());

app.route('/machine/cabinet', createCabinetApi());

app.route('/tenant', createTenantApi());

app.route('/playerzone', createPlayerZoneApi());

app.route('/mqtt', createMqttApi());

app.route('/prize', createPrizeApi());

app.route('/statistics', createStatisticsApi());

/**
 * OpenAPI  swagger routes (needs to be last)
 */
addOpenAPI(app);
