/**
 * csrf.ts
 * Copyright(c) 2025 Aaron Hedges <aaron@dashron.com>
 * MIT Licensed
 *
 * This file exposes middleware that helps manage cross site request forgery protection
 */
import type { Context, Middleware } from 'roads/types/core/road.js';
import type { ParseBodyContext } from 'roads/types/middleware/parseBody.js';
import jwt from 'jsonwebtoken';
import type { StoreValsContext } from 'roads/types/middleware/storeVals.js';
import * as roads from 'roads';
const { Response } = roads;
import type { CookieContext } from 'roads/types/middleware/cookieMiddleware.js';

const DEFAULT_EXPIRY_TIME = '1d'; // 1 day
export const CSRF_BODY_NAME = 'csrf_token';

export interface CSRFContext extends Context {
	getCSRFToken: (data?: Record<string, unknown>) => string;
	getCSRFFormElement: (data?: Record<string, unknown>) => string;
	isValidCSRFToken: () => boolean;
}

export type CSRFBody = {
	[CSRF_BODY_NAME]: string;
};

export function buildCSRFToken(data: string | object | Buffer, secret: string, expiresIn: string = DEFAULT_EXPIRY_TIME) {
	// @ts-ignore Something is wrong with the typing here. This is fine
	return jwt.sign(data || {}, secret, {
		expiresIn
	});
}

export function buildCSRFMiddleware(csrfSecret: string, csrfCookie: string, csrfExpiresIn = DEFAULT_EXPIRY_TIME, runEvenInTests = false) {
	const csrfMiddleware: Middleware<CSRFContext & StoreValsContext & ParseBodyContext<CSRFBody> & CookieContext> = function csrfMiddleware(
		method,
		url,
		body,
		headers,
		next
	) {
		// don't do any of this on tests
		if (!runEvenInTests && process.env.JEST_WORKER_ID !== undefined) {
			return next();
		}
		let cookieVal: string | undefined;

		this.getCSRFToken = (data?) => {
			if (this.getCookies()[csrfCookie]) {
				cookieVal = this.getCookies()[csrfCookie];
				if (cookieVal) {
					const cookieData = jwt.verify(cookieVal, csrfSecret, { ignoreExpiration: true });
					// If we get invalid cookie data or data for a diff user (such as a logged out user logging in and now needing new data)
					// Reset it and give the user a new one
					if (typeof cookieData !== 'object' || cookieData.loggedInUserID !== this.userID || (cookieData?.exp || 0) < Math.floor(Date.now() / 1000)) {
						cookieVal = undefined;
					}
				}
			}

			if (!cookieVal) {
				cookieVal = buildCSRFToken({ ...data, loggedInUserID: this.userID }, csrfSecret, csrfExpiresIn);
				this.setCookie(csrfCookie, cookieVal, { path: '/', sameSite: 'strict' });
			}

			return cookieVal;
		};

		this.getCSRFFormElement = (data?) => {
			const element = `<input type="hidden" name="${CSRF_BODY_NAME}" value="${this.getCSRFToken(data)}">`;
			this.storeVal('csrfElement', element);
			return element;
		};

		this.isValidCSRFToken = () => {
			if (!this.body?.[CSRF_BODY_NAME]) {
				console.error('No csrf token found', { path: url, method });
				return false;
			}

			if (Array.isArray(this.body?.[CSRF_BODY_NAME])) {
				console.error('You have accidentally inserted two CSRF input fields. Please remove one', { path: url, method });
				return false;
			}

			try {
				const cookieValidationValue = this.getCookies()[csrfCookie];

				if (!cookieValidationValue) {
					console.error('missing cookie', { path: url, method });
					return false;

				}
				// In this extra validation, you don't have to match with the exact token value
				//	we just make sure that the tokens are signed with our secret, haven't expired, and contain the same user IDs between
				//		the cookie token, the body token and the logged in user ID
				const cookieBodyData = jwt.verify(this.body[CSRF_BODY_NAME], csrfSecret);
				const cookieValidationData = jwt.verify(cookieValidationValue, csrfSecret);

				// we don't ensure there's a user ID here because we might use csrf on logged out pages
				if (!cookieBodyData || typeof cookieBodyData !== 'object' || !cookieValidationData || typeof cookieValidationData !== 'object') {
					console.error('bad cookie or request body jwt', { path: url, method });
					return false;
				}

				return cookieBodyData.loggedInUserID === cookieValidationData.loggedInUserID && cookieValidationData.loggedInUserID === this.userID;
			} catch (e) {
				// most common reason we hit this is jwt expiration
				console.error(`CSRF Error: ${e.message}`, { path: url, method });
				return false;
			}
		};

		if ((method === 'POST' || method === 'PUT' || method === 'DELETE' || method === 'PATCH') && !this.isValidCSRFToken()) {
			console.error('CSRF MISMATCH', { path: url, method });
			return new Response("You've encountered an unexpected error. Please let us know you encountered this issue by contacting support.", 403);
		}

		return next();
	};

	return csrfMiddleware;
}
