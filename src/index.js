import Config from 'config';
import express from 'express';

import webhookHandlers from './webhook-handlers/index.js';

const app = express();

app.use(express.text({ type: '*/*' }));

for (const handler of webhookHandlers) {
	app.post(handler.path, async (req, res) => {
		await handler.handle(req, res);
	});
}

const port = Config.get('port');

app.listen(port, () => {
	console.log(`Webhook listening on port ${port}`);
});
