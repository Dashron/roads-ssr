/**
 * server.ts
 * Copyright(c) 2025 Aaron Hedges <aaron@dashron.com>
 * MIT Licensed
 *
 * This file starts up the HTTP roads server
 */

// This is getting the commonjs issue. What changed in the newest roads? 7.4.1 didn't have this
import { Road, CookieMiddleware, RouterMiddleware, attachCommonMiddleware } from 'roads';
import { UnexpectedError } from './projects/example/components/UnexpectedError.js';

import addLayout, { ReactResponse } from './middleware/addLayout.js';
import emptyTo404 from './middleware/emptyTo404.js';
import { LayoutComponent } from './projects/example/components/layout.js';
import * as ReactDOMServer from 'react-dom/server';
import { addRoutes } from './projects/example/routes.js';
import { buildCSRFMiddleware, CSRFContext } from './middleware/csrfMiddleware.js';
import express from 'express';
import { roadsExpressMiddleware } from './middleware/roadsExpressMiddleware.js';

const app = express();

const road = new Road();

road.use(function (method, url, body, headers, next) {
	console.log(`${method} ${url}`);
	return next();
});

attachCommonMiddleware(road);
road.use(CookieMiddleware.serverMiddleware);
road.use(
	addLayout(function layout(body: ReactResponse, data, context: CSRFContext) {
		try {
			return `<!DOCTYPE html>\n${ReactDOMServer.renderToStaticMarkup(
				LayoutComponent({
					...data,
					host: data.host,
					content: body.jsxBody,
					csrfElement: context.getCSRFFormElement()
				})
			)}`;
		} catch (e) {
			console.error(e, { path: 'TODO', method: 'TODO' });

			try {
				// If rendering the real page fails, try rendering an unexpected error
				return `<!DOCTYPE html>\n${ReactDOMServer.renderToStaticMarkup(
					LayoutComponent({
						...data,
						host: data.host,
						content: UnexpectedError({
							message: 'Sorry, something is broken. The issue has been logged and will be investigated soon!'
						}),
						csrfElement: context.getCSRFFormElement()
					})
				)}`;
			} catch (e2) {
				console.error(e2, { path: 'TODO', method: 'TODO' });
				return 'Sorry, something is broken. The issue has been logged and will be investigated soon!';
			}
		}
	})
);

road.use(buildCSRFMiddleware('SecreTConfigMeTODO', 'csrf_token'));

const router = new RouterMiddleware.Router(road);
addRoutes(router);
road.use(emptyTo404);

app.set('etag', false);
app.use(express.raw({ type: '*/*' }));
app.use(roadsExpressMiddleware(road));

app.use((error: Error, req: any, res: any, next: any) => {
	console.error(error, { path: req.path, method: req.method });

	res.statusCode = 500;
	res.end('Sorry, something is broken. The issue has been logged and will be investigated soon!');
});

// Start the server
app.listen(8081 /*config.port*/, () => {
	console.log('server started', { path: 'N/A', method: 'N/A' });
});
