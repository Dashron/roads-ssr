import * as fs from 'fs';

import { glob } from 'glob';
import * as pathModule from 'path';
import { staticPathRoot, staticUrlRoot, returnFile, dirname, getReactUrl, getReactBuildPath, projectRoute } from './staticUtil.js';
import { RouterMiddleware } from 'roads';
import { StoreValsContext } from 'roads/types/middleware/storeVals.js';
import { ModifiedSinceContext } from 'roads/types/middleware/modifiedSince.js';

export const sourcemap = true;

/**
 * BUILD LIST OF STATIC, UNCOMMON FILES
 */
const STATIC_FILES: Record<string, { filePath: string; contentType: string }> = {
	'/robots.txt': {
		filePath: `${staticPathRoot}robots.txt`,
		contentType: 'text/plain'
	},
	'/static/images/favicon.svg': {
		filePath: `${staticPathRoot}images/favicon.svg`,
		contentType: 'image/svg+xml'
	},
};

/**
 * BUILD A LIST OF STATIC CSS FILES
 */
const CSS: Array<string> = ['main'];

/**
 * BUILD LIST OF STATIC FONT FILES
 */
const FONTS: Array<string> = [];

/**
 * BUILD LIST OF STATIC REACT FILES
 */
export const REACT_COMPONENTS = glob.sync(`${projectRoute}/**/*.client.tsx`).map((path) => {
	return path.replace(projectRoute, '').replace(/\.tsx$/, '');
});

/**
 * BUILD LIST OF STATIC ESBUILD CHUNK FILES
 */
const ESBUILD_CHUNK_FILES = fs.readdirSync(`${staticPathRoot}dist-js`);

/**
 * ATTACH ALL STATIC FILES TO THE ROUTER
 */

CSS.forEach((cssName) => {
	STATIC_FILES[`/static/css/${cssName}.css`] = {
		filePath: `${staticPathRoot}css/${cssName}.css`,
		contentType: 'text/css; charset=UTF-8'
	};
});

FONTS.forEach((fontName) => {
	STATIC_FILES[`/static/fonts/${fontName}.ttf`] = {
		filePath: `${staticPathRoot}fonts/${fontName}.ttf`,
		contentType: 'font/ttf'
	};
});

REACT_COMPONENTS.forEach((path: string) => {
	STATIC_FILES[getReactUrl(path, false, false)] = {
		filePath: getReactBuildPath(path, false),
		contentType: 'application/javascript; charset=UTF-8'
	};

	if (sourcemap) {
		STATIC_FILES[getReactUrl(path, true, false)] = {
			filePath: getReactBuildPath(path, true),
			contentType: 'application/javascript; charset=UTF-8'
		};
	}
});

ESBUILD_CHUNK_FILES.forEach((filename) => {
	if (filename.match(/chunk-\w+.js(.map)?/)) {
		STATIC_FILES[`${staticUrlRoot}js/${filename}`] = {
			filePath: `${staticPathRoot}dist-js/${filename}`,
			contentType: 'application/javascript; charset=UTF-8'
		};
	}
});

export const register = function register(router: RouterMiddleware.Router<StoreValsContext & ModifiedSinceContext>) {
	Object.keys(STATIC_FILES).forEach((key: keyof typeof STATIC_FILES) => {
		const details = STATIC_FILES[key];
console.log('adding route', key);
		router.addRoute('GET', key, async function getStaticFile() {
			console.log('route hit', key);
			return returnFile(this, details.filePath, details.contentType);
		});
	});
};
