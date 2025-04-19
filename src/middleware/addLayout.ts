/**
 * addLayout.ts
 * Copyright(c) 2025 Aaron Hedges <aaron@dashron.com>
 * MIT Licensed
 *
 * This file exposes a middleware function that wraps any return HTML in a standard layout
 */

import type { Context, Middleware } from 'roads/types/core/road.js';
import * as roads from 'roads';
const { Response } = roads;

import type { StoreValsContext } from 'roads/types/middleware/storeVals.js';
import * as ReactDOMServer from 'react-dom/server';
import type { OutgoingHeaders } from 'roads/types/core/response.js';
import { nonReactModifiedTimes } from '../projects/core/staticUtil.js';
import { JSX } from 'react';

const TITLE_KEY = 'page-title';
const twLastUpdateTime = nonReactModifiedTimes.tw;

type JSONValues = string | { [key: string]: JSONValues } | number | null | boolean;
type JSONObject = Record<string, JSONValues>;

export class ReactResponse extends Response {
	public jsxBody: JSX.Element;

	constructor(body: JSX.Element, status?: number, headers?: OutgoingHeaders) {
		super('', status, headers);
		this.jsxBody = body;
	}
}

export class JSONObjectResponse extends Response {
	public jsonBody: JSONObject;

	constructor(body: JSONObject, status?: number, headers?: OutgoingHeaders) {
		if (!headers) {
			headers = {};
		}

		headers['content-type'] = 'Application/JSON';
		super(JSON.stringify(body), status, headers);
		this.jsonBody = body;
	}
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type LayoutWrapper = (response: roads.Response, data: Record<string, any>, context: Context) => string;
export interface LayoutContext extends Context {
	setTitle: {
		(title: string): void;
	};

	render: {
		(element: JSX.Element): string;
	};
}

export default function createAddLayoutMiddleware(layoutWrapper: LayoutWrapper) {
	/**
	 * This middleware wraps the response in a standard HTML layout. It looks for three fields in the request context.
	 * - _page_title - The title of the page
	 * - ignore_layout - If true, this middleware will not apply the layout (useful for JSON responses)
	 *
	 * @param {string} method - HTTP request method
	 * @param {string} url - HTTP request url
	 * @param {string} body - HTTP request body
	 * @param {object} headers - HTTP request headers
	 * @param {function} next - When called, this function will execute the next step in the roads method chain
	 */
	const middleware: Middleware<StoreValsContext> = function addLayoutMiddleware(this: StoreValsContext, method, url, body, headers, next) {
		this.setTitle = (title: string) => {
			this.storeVal(TITLE_KEY, title);
		};

		this.render = function reactRender(element: JSX.Element) {
			return ReactDOMServer.renderToStaticMarkup(element);
		};

		return next().then((response) => {
			let res = response;

			if (!(res instanceof Response)) {
				res = new roads.Response(res);
			}

			if (this.getVal('ignoreLayout') || this.getVal('json')) {
				return res;
			}

			let layoutData: Record<string, unknown> = { twLastUpdateTime };

			if (this.getAllVals) {
				layoutData = { twLastUpdateTime, host: headers?.host, loggedIn: this.getVal('loggedIn'), ...this.getAllVals() };
			}

			res.body = layoutWrapper(res, layoutData, this);
			return response;
		});
	};

	return middleware;
}
