import * as fs from 'fs';
import * as roads from 'roads';
const { Response } = roads;

// Not really used... but important to ensure it exists for surfacing the css
import * as url from 'url';
import * as pathModule from 'path';
import { StoreValsContext } from 'roads/types/middleware/storeVals.js';
import { ModifiedSinceContext } from 'roads/types/middleware/modifiedSince.js';

export const dirname = url.fileURLToPath(new URL('.', import.meta.url));
export const staticUrlRoot = '/static/';
export const staticPathRoot = `${pathModule.resolve(`${dirname}../../../../public`)}/`;
export const projectRoute = `${pathModule.resolve(`${dirname}../`)}/`;

export function returnFile(context: StoreValsContext & ModifiedSinceContext, filePath: string, contentType: string) {
	context.storeVal('ignoreLayout', true);
	const stat = fs.statSync(filePath);

	if (context.shouldReturnNotModifiedResponse(stat.mtime)) {
		return context.buildNotModifiedResponse();
	}

	// In the real world the body of the response should be created from a template engine.
	return new Response(fs.readFileSync(filePath) /* .toString('utf-8') */, 200, {
		'content-type': contentType
	});
}

export function getLastModifiedTime(path: string) {
	return fs.statSync(path).mtime.getTime().toString();
}

export interface staticBundleRecord {
	url: string;
	srcPath: string;
	buildPath: string;
	sourcemap: boolean;
}

export function getReactUrl(path: string, sourcemap: boolean, includeLastModified: boolean) {
	return `${staticUrlRoot}js/${path}.js${sourcemap ? '.map' : ''}${includeLastModified ? `?q=${getLastModifiedTime(`${projectRoute}${path}`)}` : ''}`;
}

export function getReactSrcPath(path: string) {
	return `${projectRoute}${path}.tsx`;
}

export function getReactBuildPath(path: string, sourcemap: boolean) {
	return `${staticPathRoot}dist-js/${path}.js${sourcemap ? '.map' : ''}`;
}

export const nonReactModifiedTimes = {
	tw: getLastModifiedTime(`${staticPathRoot}css/main.css`)
};
